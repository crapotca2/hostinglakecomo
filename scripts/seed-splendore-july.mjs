// Seed DEMO — carica lo storico di luglio 2026 di Alessandro Splendore
// (rendiconto Aqua Vista) nel DB del portale, così la dashboard owner mostra
// dati reali. Dati esatti dal rendiconto Excel (periodo fino al 25/07):
// Zack, Alexandre, Grzegorz. Idempotente (rimpiazza i booking di questo owner).
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

// Dati per-prenotazione dal rendiconto (alloggio, commissione OTA, tassa sogg.).
const D = [
  { name: "Zack Meyers", source: "airbnb", ci: "2026-07-08", co: "2026-07-15", nights: 7, guests: 3, gross: 1949.4, ota: 74.27, tax: 63 },
  { name: "Alexandre Schein", source: "airbnb", ci: "2026-07-15", co: "2026-07-18", nights: 3, guests: 4, gross: 960.0, ota: 38.06, tax: 36 },
  { name: "Grzegorz Klimaszyk", source: "booking", ci: "2026-07-18", co: "2026-07-22", nights: 4, guests: 4, gross: 1184.0, ota: 208.56, tax: 48 },
];

const r2 = (n) => Math.round(n * 100) / 100;

function bookingDoc(d) {
  const mgmt = r2(d.gross * 0.1); // portale: gestione 10%
  const exp = r2(d.gross * 0.05); // portale: spese 5%
  const ownerPayout = r2(d.gross - d.ota - mgmt - exp - d.tax);
  return {
    _id: new ObjectId(),
    propertyId,
    ownerId,
    checkIn: new Date(d.ci + "T00:00:00Z"),
    checkOut: new Date(d.co + "T00:00:00Z"),
    nights: d.nights,
    guests: d.guests,
    status: "checked_out",
    source: d.source,
    guestInfo: { name: d.name, email: "" },
    pricing: {
      nightlyRate: r2(d.gross / d.nights),
      cleaningFee: 80,
      totalAmount: d.gross,
      commissionRate: Math.round((d.ota / d.gross) * 10000) / 10000,
      commissionAmount: d.ota,
      ownerPayout,
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
        $set: { name: "Alessandro Splendore", email: "alessandro.splendore@hostcomo.com", role: "owner", updatedAt: now },
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
          address: { street: "", city: "Argegno", province: "CO", zip: "22010" },
          details: { bedrooms: 2, bathrooms: 1, maxGuests: 4, sqMeters: 140, hasParking: true, hasLakeView: true },
          amenities: [],
          images: [],
          pricing: { basePrice: 290, cleaningFee: 80, weekendMultiplier: 1 },
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
    console.log(`✅ seed in ${dbName}: owner Alessandro Splendore + property aqua-vista-splendore + ${docs.length} booking`);
    for (const b of docs) {
      console.log(`   · ${b.guestInfo.name.padEnd(20)} ${b.checkIn.toISOString().slice(0, 10)} gross=${b.pricing.totalAmount} ownerPayout=${b.pricing.ownerPayout}`);
    }
  } finally {
    await c.close();
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
