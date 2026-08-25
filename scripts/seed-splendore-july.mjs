// Seed REALE — carica il rendiconto di luglio 2026 di Alessandro Splendore
// (Aqua Vista di Splendore, Via Spluga 44 – Argegno, room Beds24 713401) nel DB
// del portale, così la dashboard owner mostra i dati veri. Numeri esatti dal
// rendiconto ufficiale (RENDICONTO-luglio-2026.md / OSPITI-aqua-vista-splendore.md):
// 7 prenotazioni (3 Airbnb + 4 Booking), di cui Brian cancellato/rimborsato.
// Idempotente (rimpiazza i booking di questo owner).
//
// USO: MONGODB_URI="mongodb+srv://…" MONGODB_DB=air_bibby \
//        node scripts/seed-splendore-july.mjs

import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "air_bibby";
if (!uri) {
  console.error("❌ MONGODB_URI mancante");
  process.exit(1);
}

const ownerId = new ObjectId("000000000000000000000010");
const propertyId = new ObjectId("000000000000000000000011");
const now = new Date();

const r2 = (n) => Math.round(n * 100) / 100;

// Dati per-prenotazione dal rendiconto ufficiale.
//  gross  = lordo OTA (alloggio + pulizia, come esposto dal canale)
//  ota    = commissione OTA reale (Airbnb: host fee; Booking: 15% + 1,5% bancaria)
//  tax    = tassa di soggiorno (3 € × ospiti × notti)
//  net    = "netto a banca" reale (già al netto di commissioni OTA + cedolare 21%)
//  status = checked_out | cancelled
const D = [
  { name: "Zack Meyers",        source: "airbnb",  ci: "2026-07-08", co: "2026-07-15", nights: 7, guests: 3, gross: 2029.40, ota: 74.27,  tax: 63, net: 1591.96, status: "checked_out" },
  { name: "Alexandre Schein",   source: "airbnb",  ci: "2026-07-15", co: "2026-07-18", nights: 3, guests: 4, gross: 1033.14, ota: 38.06,  tax: 36, net: 819.54,  status: "checked_out" },
  { name: "Grzegorz Klimaszyk", source: "booking", ci: "2026-07-18", co: "2026-07-22", nights: 4, guests: 4, gross: 1264.00, ota: 208.56, tax: 48, net: 790.00,  status: "checked_out" },
  { name: "Brian Søgaard",      source: "airbnb",  ci: "2026-07-23", co: "2026-07-29", nights: 6, guests: 2, gross: 1986.80, ota: 73.20,  tax: 72, net: 78.80,   status: "cancelled" },
  { name: "Frédéric Poitiers",  source: "booking", ci: "2026-07-27", co: "2026-07-30", nights: 3, guests: 5, gross: 1190.00, ota: 196.35, tax: 45, net: 743.75,  status: "checked_out" },
  { name: "Jean Claude Varin",  source: "booking", ci: "2026-07-30", co: "2026-08-03", nights: 4, guests: 4, gross: 1160.00, ota: 191.40, tax: 48, net: 725.00,  status: "checked_out" },
  { name: "Jacek Rączewski",    source: "booking", ci: "2026-08-03", co: "2026-08-06", nights: 3, guests: 4, gross: 1064.00, ota: 175.56, tax: 36, net: 665.00,  status: "checked_out" },
];

function bookingDoc(d) {
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
    guestInfo: { name: d.name, email: "" },
    pricing: {
      nightlyRate: r2((d.gross - 80) / d.nights), // alloggio ex-pulizia / notti
      cleaningFee: 80,
      totalAmount: d.gross,
      commissionRate: Math.round((d.ota / d.gross) * 10000) / 10000,
      commissionAmount: d.ota,
      ownerPayout: d.net, // netto a banca reale (rif. per PDF; la dashboard ricalcola)
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
    await db.collection("users").updateOne(
      { _id: ownerId },
      {
        $set: { name: "Alessandro Splendore", email: "alessandro.splendore@hostcomo.com", role: "owner", ownerId, updatedAt: now },
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
          zone: "secondo-bacino",
          description: "",
          address: { street: "Via Spluga 44", city: "Argegno", province: "CO", zip: "22010" },
          details: { bedrooms: 2, bathrooms: 1, maxGuests: 5, sqMeters: 140, hasParking: true, hasLakeView: true },
          amenities: [],
          images: [],
          pricing: { basePrice: 370, cleaningFee: 80, weekendMultiplier: 1 },
          beds24PropertyId: "345437",
          beds24RoomId: "713401",
          touristTaxRate: 3,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    await db.collection("bookings").deleteMany({ ownerId });
    const docs = D.map(bookingDoc);
    await db.collection("bookings").insertMany(docs);
    console.log(`✅ seed REALE in ${dbName}: owner Alessandro Splendore + property aqua-vista-splendore + ${docs.length} booking`);
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
