/**
 * Verifica di coerenza cross-pagina — ESEGUE LE VERE FUNZIONI delle pagine
 * (le stesse che alimentano dashboard, rendiconti, statements, compliance, Excel)
 * contro il DB reale e asserisce che i numeri COINCIDANO. Nessun calcolo a mano:
 * il breakdown canonico viene da `breakdownForBooking` (fee-model) e ogni pagina
 * è confrontata con esso.
 *
 * USO: MONGODB_URI="mongodb+srv://…" MONGODB_DB=air_bibby \
 *        node scripts/verify-consistency.cjs [ownerId]
 *
 * Exit 0 se tutto coincide, 1 se una qualsiasi asserzione fallisce.
 */
const path = require("path");
const fs = require("fs");
const Module = require("module");
const ts = require("typescript");
const { ObjectId } = require("mongodb");

// --- loader: risolve gli alias "@/..." e transpila i .ts al volo ---
const SRC = path.resolve(__dirname, "..", "src");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith("@/")) request = path.join(SRC, request.slice(2));
  return origResolve.call(this, request, parent, ...rest);
};
require.extensions[".ts"] = function (module, filename) {
  const src = fs.readFileSync(filename, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: { module: "CommonJS", target: "ES2019", esModuleInterop: true, resolveJsonModule: true },
    fileName: filename,
  }).outputText;
  module._compile(out, filename);
};

// --- funzioni reali delle pagine ---
const { collections } = require("@/lib/mongodb/collections");
const { breakdownForBooking, feeRateForProperty } = require("@/lib/reports/fee-model");
const { cyclePeriodKey } = require("@/lib/reports/period");
const { getCommissionSummary, getOwnerRemittanceSummary, getOwnerRemittanceDetail, getOwnerStatementBookings } = require("@/lib/reports/property-management");
const { getMonthlyPayouts } = require("@/lib/reports/payout");
const { generateTouristTaxReport } = require("@/lib/compliance/tassa-soggiorno");
const { generateIstatExport } = require("@/lib/compliance/istat");
const { getRendicontoXlsx } = require("@/lib/reports/xlsx/rendiconto-data");

const OWNER = process.argv[2] || "000000000000000000000010";
const YEAR = 2026;
const r2 = (n) => Math.round(n * 100) / 100;

let failures = 0;
const results = [];
function assertEq(label, a, b, tol = 0.5) {
  const ok = Math.abs(a - b) <= tol;
  if (!ok) failures++;
  results.push({ ok, label, a: r2(a), b: r2(b), diff: r2(a - b) });
}
function assertEqMulti(label, values, tol = 0.5) {
  // tutti uguali al primo
  const base = values[0].v;
  let ok = true;
  for (const x of values) if (Math.abs(x.v - base) > tol) ok = false;
  if (!ok) failures++;
  results.push({ ok, label, detail: values.map((x) => `${x.name}=${r2(x.v)}`).join("  ") });
}

async function main() {
  const from = new Date(YEAR, 0, 1);
  const to = new Date(YEAR, 11, 31, 23, 59, 59);

  const propsCol = await collections.properties();
  const bookingsCol = await collections.bookings();
  const props = await propsCol.find({ ownerId: new ObjectId(OWNER) }).toArray();
  const rateOf = (b) => feeRateForProperty(props.find((p) => p._id.toString() === b.propertyId.toString()) || props[0]);
  const all = await bookingsCol.find({ ownerId: new ObjectId(OWNER) }).toArray();
  const counted = all.filter((b) => b.status !== "cancelled");

  // ---- CANONICO (fonte unica di verità) ----
  const bd = counted.map((b) => ({ b, d: breakdownForBooking(b, rateOf(b)) }));
  const C = {
    gross: r2(bd.reduce((s, x) => s + x.d.totalRevenue, 0)),
    ota: r2(bd.reduce((s, x) => s + x.d.otaCommission, 0)),
    cedolare: r2(bd.reduce((s, x) => s + x.d.cedolare, 0)),
    fee: r2(bd.reduce((s, x) => s + x.d.managementFee, 0)),
    net: r2(bd.reduce((s, x) => s + x.d.netPayout, 0)),
    tax: r2(bd.reduce((s, x) => s + x.d.touristTax, 0)),
  };
  // canonico per ciclo
  const byPeriod = {};
  for (const x of bd) {
    const p = cyclePeriodKey(x.b.checkIn);
    (byPeriod[p] ||= { gross: 0, net: 0, cedolare: 0, count: 0 });
    byPeriod[p].gross += x.d.totalRevenue;
    byPeriod[p].net += x.d.netPayout;
    byPeriod[p].cedolare += x.d.cedolare;
    byPeriod[p].count += 1;
  }
  for (const p of Object.keys(byPeriod)) { byPeriod[p].gross = r2(byPeriod[p].gross); byPeriod[p].net = r2(byPeriod[p].net); byPeriod[p].cedolare = r2(byPeriod[p].cedolare); }

  console.log("=== CANONICO (breakdownForBooking) ===");
  console.log(`  gross=${C.gross}  ota=${C.ota}  cedolare=${C.cedolare}  fee=${C.fee}  net=${C.net}  tax=${C.tax}`);
  console.log(`  per ciclo:`, Object.entries(byPeriod).map(([p, v]) => `${p}:{n=${v.count},net=${v.net}}`).join("  "));

  // ---- ESEGUI LE PAGINE ----
  const commSummary = await getCommissionSummary(from, to, OWNER);
  const ownerSummary = await getOwnerRemittanceSummary(YEAR, OWNER);
  const ownerDetail = await getOwnerRemittanceDetail(from, to, OWNER);
  const stmtBookings = await getOwnerStatementBookings(from, to, OWNER);
  const payouts = await getMonthlyPayouts(YEAR, OWNER);

  const sum = (arr, f) => arr.reduce((s, x) => s + (f(x) || 0), 0);

  // A) Totali globali NET/GROSS/CEDOLARE — ogni pagina vs canonico
  assertEqMulti("NET totale (canonico ↔ pagine)", [
    { name: "canon", v: C.net },
    { name: "commSummary", v: sum(commSummary, (r) => r.ownerPayout) },
    { name: "ownerSummary", v: sum(ownerSummary, (r) => r.netPayout) },
    { name: "ownerDetail", v: sum(ownerDetail, (r) => r.netPayout) },
    { name: "statements", v: sum(stmtBookings, (r) => r.netPayout) },
    { name: "payouts", v: sum(payouts, (r) => r.netPayout) },
  ], 1.5);

  assertEqMulti("GROSS totale (canonico ↔ pagine)", [
    { name: "canon", v: C.gross },
    { name: "commSummary", v: sum(commSummary, (r) => r.grossRevenue) },
    { name: "ownerSummary", v: sum(ownerSummary, (r) => r.grossRevenue) },
    { name: "payouts", v: sum(payouts, (r) => r.grossRevenue) },
    { name: "statements", v: sum(stmtBookings, (r) => r.grossRevenue) },
  ], 1.5);

  assertEqMulti("CEDOLARE totale (canonico ↔ pagine)", [
    { name: "canon", v: C.cedolare },
    { name: "commSummary", v: sum(commSummary, (r) => r.cedolare) },
    { name: "ownerSummary", v: sum(ownerSummary, (r) => r.cedolare) },
    { name: "payouts", v: sum(payouts, (r) => r.cedolare) },
    { name: "statements", v: sum(stmtBookings, (r) => r.cedolare) },
  ], 1.5);

  // B) conteggio prenotazioni: ownerSummary vs ownerDetail vs canonico
  assertEqMulti("N. prenotazioni (canonico ↔ pagine)", [
    { name: "canon", v: counted.length },
    { name: "ownerSummary", v: sum(ownerSummary, (r) => r.bookings) },
    { name: "ownerDetail", v: sum(ownerDetail, (r) => r.bookings) },
    { name: "commSummary", v: sum(commSummary, (r) => r.bookings) },
    { name: "statements", v: stmtBookings.length },
  ], 0);

  // C) Per-ciclo NET: ownerSummary ↔ payouts ↔ statements ↔ Excel ↔ canonico
  for (const period of Object.keys(byPeriod).sort()) {
    const os = ownerSummary.find((r) => r.period === period);
    const pay = payouts.find((r) => r.period === period);
    const stmt = stmtBookings.filter((r) => r.period === period);
    const meta = await getRendicontoXlsx(OWNER, period);
    // net Excel = ricalcolo dallo stesso input (room+extra − ota − cedolare − fee)
    let xlsxNet = 0;
    if (meta) {
      const cnt = meta.input.bookings.filter((b) => b.counts);
      const g = cnt.reduce((s, b) => s + b.room, 0);
      const ex = cnt.reduce((s, b) => s + b.extra, 0);
      const o = cnt.reduce((s, b) => s + b.ota, 0);
      const ced = cnt.reduce((s, b) => s + b.cedolare, 0);
      xlsxNet = g + ex - o - ced - g * meta.input.feeRate;
    }
    assertEqMulti(`NET ciclo ${period}`, [
      { name: "canon", v: byPeriod[period].net },
      { name: "ownerSummary", v: os ? os.netPayout : NaN },
      { name: "payouts", v: pay ? pay.netPayout : NaN },
      { name: "statements", v: sum(stmt, (r) => r.netPayout) },
      { name: "excel", v: xlsxNet },
    ], 1.5);
  }

  // D) Tassa di soggiorno: compliance totalDue ↔ canonico (3€×presenze) ↔ payouts
  const tax = await generateTouristTaxReport(from, to, OWNER);
  assertEqMulti("TASSA soggiorno dovuta (compliance ↔ canonico ↔ payouts)", [
    { name: "canon", v: C.tax },
    { name: "compliance.totalDue", v: tax.totalDue },
    { name: "payouts.tax", v: sum(payouts, (r) => r.touristTax) },
  ], 1.5);

  // E) ISTAT: coerenza interna (somma righe == totale) + presenze totali
  for (const m of [7, 8]) {
    const istat = await generateIstatExport(m, YEAR, OWNER);
    const sumArr = istat.rows.reduce((s, r) => s + r.presences, 0);
    const sumArr2 = istat.rows.reduce((s, r) => s + r.arrivals, 0);
    assertEq(`ISTAT ${YEAR}-0${m}: somma presenze righe == totale`, sumArr, istat.total.presences, 0);
    assertEq(`ISTAT ${YEAR}-0${m}: somma arrivi righe == totale`, sumArr2, istat.total.arrivals, 0);
    console.log(`  ISTAT ${YEAR}-0${m}: ${istat.rows.map((r) => `${r.countryCode}:${r.arrivals}/${r.presences}`).join(" ")} · TOT ${istat.total.arrivals}/${istat.total.presences}`);
  }

  // ---- REPORT ----
  console.log("\n=== ASSERZIONI ===");
  for (const r of results) {
    const tag = r.ok ? "✅ PASS" : "❌ FAIL";
    console.log(`${tag}  ${r.label}${r.detail ? "  →  " + r.detail : `  (a=${r.a} b=${r.b} diff=${r.diff})`}`);
  }
  console.log(`\n${failures === 0 ? "✅ TUTTO COINCIDE" : `❌ ${failures} ASSERZIONI FALLITE`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error("ERRORE:", e); process.exit(2); });
