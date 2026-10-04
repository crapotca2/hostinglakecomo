// Seed REALE — carica le prenotazioni di Alessandro Splendore (Aqua Vista di
// Splendore, Via Spluga 44 – Argegno, room Beds24 713401) nel DB del portale, così
// la dashboard owner mostra i dati veri. Numeri esatti dai rendiconti/report OTA
// ufficiali. Copre luglio → ottobre 2026 (luglio+agosto + settembre/ottobre nuove),
// di cui Brian cancellato/rimborsato. L'array D è l'UNICA fonte: il seed rimpiazza
// l'intero set di booking di questo owner, quindi appendere qui preserva i precedenti.
// Idempotente (rimpiazza i booking di questo owner).
//
// USO: MONGODB_URI="mongodb+srv://…" MONGODB_DB=air_bibby \
//        node scripts/seed-splendore-july.mjs

import { MongoClient, ObjectId } from "mongodb";
import { hash as bcryptHash } from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "air_bibby";
// Login proprietario: email (nome accesso) + password. Modificabile via env.
const OWNER_EMAIL = process.env.OWNER_EMAIL || "alessandro.splendore@hostcomo.com";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Splendore2026!";
if (!uri) {
  console.error("❌ MONGODB_URI mancante");
  process.exit(1);
}

const ownerId = new ObjectId("000000000000000000000010");
const propertyId = new ObjectId("000000000000000000000011");
const now = new Date();

const r2 = (n) => Math.round(n * 100) / 100;

// Aliquota commissione Host Como per questo immobile (varia per casa; Splendore 14%).
const FEE_RATE = 0.14;
const CLEANING = 80;

// Dati per-prenotazione dal rendiconto ufficiale.
//  gross    = lordo OTA (alloggio + pulizia, come esposto dal canale)
//  ota      = commissione OTA reale (Airbnb: host fee; Booking: 15% + 1,5% bancaria)
//  cedolare = ritenuta 21% trattenuta dall'OTA (valori esatti dal rendiconto)
//  tax      = tassa di soggiorno (3 € × ospiti × notti)
//  parking  = parcheggio incassato (10 €/notte; partita 50/50)
//  extra    = notte extra diretta (fuori OTA)
//  status   = checked_out | cancelled
//  taxStatus = stato incasso tassa: collected | pending | uncollected
//  nat = provenienza ospite (ISO alpha-2)
const D = [
  { name: "Zack Meyers",        nat: "US", source: "airbnb",  ref: "HM5ANJRCAN", ci: "2026-07-08", co: "2026-07-15", nights: 7, guests: 2, gross: 2029.40, ota: 74.27,  cedolare: 426.17, tax: 42, parking: 70, extra: 0,   status: "checked_out", taxStatus: "collected", origins: [{ code: "US", count: 1 }, { code: "ES", count: 1 }] },
  { name: "Alexandre Schein",   nat: "US", source: "airbnb",  ref: "HMBAF4D42J", ci: "2026-07-15", co: "2026-07-18", nights: 3, guests: 4, gross: 1040.00, ota: 38.06,  cedolare: 218.40, tax: 36, parking: 0,  extra: 0,   status: "checked_out", taxStatus: "collected" },
  { name: "Grzegorz Klimaszyk", nat: "PL", source: "booking", ref: "5589247653", ci: "2026-07-18", co: "2026-07-22", nights: 4, guests: 3, gross: 1264.00, ota: 208.56, cedolare: 265.44, tax: 36, parking: 40, extra: 0,   status: "checked_out", taxStatus: "collected" },
  { name: "Brian Søgaard",      nat: "DK", source: "airbnb",  ref: "HMNFQ4TARW", ci: "2026-07-23", co: "2026-07-29", nights: 6, guests: 4, gross: 2000.00, ota: 73.20,  cedolare: 420.00, tax: 72, parking: 0,  extra: 0,   status: "cancelled",   taxStatus: "collected" },
  { name: "Frédéric Poitiers",  nat: "FR", source: "booking", ref: "6827537609", ci: "2026-07-27", co: "2026-07-30", nights: 3, guests: 5, gross: 1190.00, ota: 196.35, cedolare: 249.90, tax: 45, parking: 0,  extra: 0,   status: "checked_out", taxStatus: "uncollected" },
  // Jean Claude: 3 notti via Booking + 1 notte DIRETTA (prenotata da noi, fuori
  // OTA). Split in due record → la notte diretta ha canale "direct" ed è contata
  // come notte. Anche sul diretto Host Como trattiene la sua fee 14% (250 → fee
  // 35,00, netto 215,00). Nessuna cedolare sul diretto (incasso in loco, fuori
  // ritenuta OTA). Tassa 48 = 36 (Booking 3nt) + 12 (diretta 1nt).
  { name: "Jean Claude Varin",  nat: "FR", source: "booking", ref: "5081550102",       ci: "2026-07-30", co: "2026-08-02", nights: 3, guests: 4, gross: 1160.00, ota: 191.40, cedolare: 243.60, tax: 36, parking: 40, extra: 0, status: "checked_out", taxStatus: "collected" },
  { name: "Jean Claude Varin",  nat: "FR", source: "direct",  ref: "5081550102-EXTRA", ci: "2026-08-02", co: "2026-08-03", nights: 1, guests: 4, gross: 250.00,  ota: 0,      cedolare: 0,      tax: 12, parking: 0,  extra: 0, status: "checked_out", taxStatus: "collected", direct: true },
  { name: "Jacek Rączewski",    nat: "PL", source: "booking", ref: "6356049116", ci: "2026-08-03", co: "2026-08-06", nights: 3, guests: 4, gross: 1064.00, ota: 175.56, cedolare: 223.44, tax: 36, parking: 0,  extra: 0,   status: "checked_out", taxStatus: "collected" },
  // --- Agosto: nuove prenotazioni dai report Airbnb/Booking (cartella new/) ---
  { name: "Joanna Stiller Lindskog",   nat: "SE", source: "airbnb",  ref: "AIRBNB-0808",  ci: "2026-08-08", co: "2026-08-11", nights: 3, guests: 4, gross: 1100.00, ota: 40.26,  cedolare: 231.00, tax: 36, parking: 40, extra: 0,   status: "checked_out", taxStatus: "collected" },
  { name: "Gareth Davies",      nat: "GB", source: "booking", ref: "6523247001", ci: "2026-08-13", co: "2026-08-17", nights: 4, guests: 4, gross: 1470.00, ota: 242.55, cedolare: 308.70, tax: 48, parking: 0,  extra: 0,   status: "checked_out", taxStatus: "collected" },
  { name: "Scott Johnson",      nat: "GB", source: "booking", ref: "6034318176", ci: "2026-08-17", co: "2026-08-20", nights: 3, guests: 2, gross: 1100.00, ota: 181.50, cedolare: 231.00, tax: 18, parking: 0,  extra: 0,   status: "checked_out", taxStatus: "collected" },
  // Ed Miranda: Airbnb, check-in 28/08 → cade nel ciclo Host Como 25→25 "2026-09".
  // Tassa 9 (3€×1 osp×3 notti) incassata da Airbnb → nessun contante/acconto socio.
  // Pulizia Airbnb 95. camera 1151, netto 492,58.
  { name: "Ed Miranda",         nat: "US", source: "airbnb",  ref: "AIRBNB-ED-2808", ci: "2026-08-28", co: "2026-08-31", nights: 3, guests: 1, gross: 1246.00, ota: 235.62, cedolare: 261.66, tax: 9, parking: 0, extra: 0, status: "checked_out", taxStatus: "collected", cleaning: 95 },
  // --- Settembre: nuove prenotazioni (ciclo Host Como 25→25 "2026-09" = 25 ago → 24 set) ---
  // Dennis: Airbnb 5 notti (4→9 set) + 1 notte extra per arrivo anticipato il 3/09,
  // addebitata 290 € via Centro Soluzioni Airbnb → UN SOLO record di 6 notti con
  // ricavo alloggio 1490 + 290 = 1780 (la fee Host Como 14% si applica a tutte le
  // notti, inclusa la extra). OTA host-fee 299,73 e cedolare 332,85 restano sul solo
  // payout OTA originario (la notte extra è arrivata senza ulteriori trattenute).
  // Pulizia Airbnb 95 (≠ 80). Tassa 36 = 3 €×2 ospiti×6 notti (30 via Airbnb + 1 notte).
  { name: "Dennis Scheer",      nat: "DE", source: "airbnb",  ref: "HMR3BQE3ZB", ci: "2026-09-03", co: "2026-09-09", nights: 6, guests: 2, gross: 1875.00, ota: 299.73, cedolare: 332.85, tax: 36, parking: 0,  extra: 0, status: "checked_out", taxStatus: "collected", cleaning: 95 },
  // Anthony: parcheggio 30 (3 notti×10) + tassa 27 (3×3×3) incassati in loco da
  // Angelo al check-in → acconto Angelo 57 nel ciclo 2026-09 (vedi partner-adjustments).
  { name: "Anthony Francis",    nat: "US", source: "booking", ref: "6592228727", ci: "2026-09-17", co: "2026-09-20", nights: 3, guests: 3, gross: 950.00,  ota: 156.75, cedolare: 199.50, tax: 27, parking: 30, extra: 0, status: "checked_out", taxStatus: "collected" },
  // --- Ciclo 25→25 "2026-10" (check-in dal 25 set): compaiono nel rendiconto/Nota
  //     spese di OTTOBRE, non di settembre. Tasse di soggiorno in loco da Angelo. ---
  { name: "Giuliano Gastaldi",  nat: "IT", source: "booking", ref: "6259443401", ci: "2026-09-25", co: "2026-09-27", nights: 2, guests: 4, gross: 660.00,  ota: 108.90, cedolare: 138.60, tax: 24, parking: 0,  extra: 0, status: "checked_out", taxStatus: "collected", origins: [{ code: "IT", count: 4 }] },
  { name: "Hala Hemeidy",       nat: "BE", source: "booking", ref: "6877139835", ci: "2026-10-02", co: "2026-10-05", nights: 3, guests: 3, gross: 1355.00, ota: 223.57, cedolare: 284.55, tax: 27, parking: 0,  extra: 0, status: "checked_out", taxStatus: "collected" },
];

function bookingDoc(d) {
  // Record "direct" = notte diretta (fuori OTA): niente pulizie/commissioni OTA/
  // cedolare, ma Host Como trattiene comunque la sua fee 14% sul ricavo. È una
  // continuazione fisica di un altro soggiorno → esclusa dagli arrivi ISTAT.
  const isDirect = d.direct === true;
  // Pulizia: default 80 €, ma alcune prenotazioni Airbnb la espongono diversa (d.cleaning).
  const cleaning = isDirect ? 0 : (d.cleaning ?? CLEANING);
  // Diretto: l'intero incasso è ricavo alloggio (soggetto a fee). OTA: alloggio = gross − pulizie.
  const room = isDirect ? r2(d.gross) : r2(d.gross - cleaning); // ricavi alloggio (ex pulizie)
  const totalAmount = d.gross;
  const fee = r2(room * FEE_RATE); // commissione Host Como sui ricavi alloggio (anche sul diretto)
  const net = r2(room + d.extra - d.ota - d.cedolare - fee); // netto proprietario
  return {
    _id: new ObjectId(),
    propertyId,
    ownerId,
    checkIn: new Date(d.ci + "T00:00:00Z"),
    checkOut: new Date(d.co + "T00:00:00Z"),
    nights: d.nights,
    guests: d.guests,
    status: d.status,
    source: d.source,
    touristTaxStatus: d.taxStatus,
    ...(d.origins ? { guestOrigins: d.origins } : {}),
    ...(isDirect ? { istatContinuation: true } : {}),
    guestInfo: { name: d.name, email: "", nationality: d.nat },
    pricing: {
      nightlyRate: r2(room / d.nights),
      cleaningFee: cleaning,
      totalAmount,
      roomRevenue: room,
      commissionRate: totalAmount > 0 ? Math.round((d.ota / totalAmount) * 10000) / 10000 : 0,
      commissionAmount: d.ota,
      cedolare: d.cedolare,
      extraNight: d.extra,
      parking: d.parking,
      managementFeeRate: FEE_RATE,
      ownerPayout: net,
      touristTax: d.tax,
    },
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  const c = new MongoClient(uri);
  await c.connect();
  try {
    const db = c.db(dbName);
    const passwordHash = await bcryptHash(OWNER_PASSWORD, 12);
    await db.collection("users").updateOne(
      { _id: ownerId },
      {
        $set: { name: "Alessandro Splendore", email: OWNER_EMAIL, role: "owner", ownerId, passwordHash, fiscalCode: "SPLSDR77D22Z133Q", updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    await db.collection("properties").updateOne(
      { _id: propertyId },
      {
        $set: {
          name: "Aqua Vista di Splendore",
          slug: "aqua-vista-splendore",
          ownerId,
          status: "active",
          type: "villa",
          zone: "primo-bacino",
          description: "",
          address: { street: "Via Spluga 44", city: "Argegno", province: "CO", zip: "22010" },
          details: { bedrooms: 2, bathrooms: 2, maxGuests: 5, sqMeters: 140, hasParking: true, hasLakeView: true },
          amenities: [],
          images: [],
          pricing: { basePrice: 370, cleaningFee: 80, weekendMultiplier: 1 },
          beds24PropertyId: "345437",
          beds24RoomId: "713401",
          touristTaxRate: 3,
          managementFeeRate: FEE_RATE,
          inpsRivalsa: false, // Alessandro: la Nota spese soci NON aggiunge la rivalsa INPS 4%
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    // Pulisci i pagamenti legati ai vecchi booking di questo owner (dati Stripe
    // inventati, rimossi) e i booking, poi reinserisci i booking.
    const oldIds = (await db.collection("bookings").find({ ownerId }).project({ _id: 1 }).toArray()).map((b) => b._id);
    if (oldIds.length) await db.collection("payments").deleteMany({ bookingId: { $in: oldIds } });
    await db.collection("bookings").deleteMany({ ownerId });

    const docs = D.map(bookingDoc);
    await db.collection("bookings").insertMany(docs);

    console.log(`✅ seed REALE in ${dbName}: owner Alessandro Splendore + property aqua-vista-splendore + ${docs.length} booking`);
    console.log(`   login proprietario → email: ${OWNER_EMAIL} · password: ${OWNER_PASSWORD}`);
    for (const b of docs) {
      console.log(`   · ${b.guestInfo.name.padEnd(20)} ${b.checkIn.toISOString().slice(0, 10)} ${String(b.status).padEnd(11)} gross=${b.pricing.totalAmount} net=${b.pricing.ownerPayout}`);
    }
  } finally {
    await c.close();
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
