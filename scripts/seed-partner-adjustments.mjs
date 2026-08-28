// Seed delle rettifiche manuali del payout soci (Host Como) per Alessandro
// Splendore, da sezione D del Rendiconto-Splendore-Luglio.xlsx. Idempotente
// (upsert per ownerId). Favore = si aggiunge; acconto = contante del proprietario
// incassato in loco dal socio, si sottrae (imputato per cassa al periodo).
//
// USO: MONGODB_URI="mongodb+srv://…" MONGODB_DB=air_bibby \
//        node scripts/seed-partner-adjustments.mjs

import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "air_bibby";
if (!uri) { console.error("❌ MONGODB_URI mancante"); process.exit(1); }

const ownerId = new ObjectId("000000000000000000000010");
const now = new Date();

const entries = [
  { period: "2026-07", kind: "favore", partner: "andrei", amount: 40, note: "check-in amici di Alessandro" },
  { period: "2026-07", kind: "acconto", partner: "angelo", amount: 76, note: "Grzegorz" },
  { period: "2026-07", kind: "acconto", partner: "andrei", amount: 338, note: "Jean Claude" },
];

async function main() {
  const c = new MongoClient(uri);
  await c.connect();
  try {
    const r = await c.db(dbName).collection("partner_adjustments").updateOne(
      { ownerId },
      { $set: { ownerId, entries, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    console.log(`✅ partner_adjustments upsert (matched=${r.matchedCount} upserted=${r.upsertedCount})`);
    for (const e of entries) console.log(`   ${e.period} ${e.kind.padEnd(8)} ${e.partner.padEnd(7)} ${e.amount} · ${e.note}`);
  } finally {
    await c.close();
  }
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
