// Seed REALE — Casa di Pucci (Roberto Petrarca), seconda proprietà del portale.
// Modello commissione DIVERSO da Splendore:
//   · fee Host Como = 10% sul LORDO (ricavi alloggio + pulizie + tassa di soggiorno)
//   · periodo di competenza = MESE SOLARE (1→fine mese), non il ciclo 25→25
//   · tassa di soggiorno 3 €/ospite/notte (incassata dal canale Airbnb)
//   · split soci 50/50 (Angelo/Andrei), SENZA rivalsa INPS, nessun parcheggio
// Isolato: elimina/reinserisce SOLO i booking di questo owner (non tocca Splendore).
//
// USO: MONGODB_URI="mongodb+srv://…" MONGODB_DB=air_bibby \
//        node scripts/seed-pucci.mjs

import { MongoClient, ObjectId } from "mongodb";
import { hash as bcryptHash } from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "air_bibby";
const OWNER_EMAIL = process.env.PUCCI_OWNER_EMAIL || "roberto.petrarca@hostcomo.com";
const OWNER_PASSWORD = process.env.PUCCI_OWNER_PASSWORD || "Petrarca2026!";
if (!uri) { console.error("❌ MONGODB_URI mancante"); process.exit(1); }

const ownerId = new ObjectId("000000000000000000000020");
const propertyId = new ObjectId("000000000000000000000021");
const now = new Date();
const r2 = (n) => Math.round(n * 100) / 100;

const FEE_RATE = 0.10;      // Host Como 10%
const FEE_BASE = "gross";   // sul lordo (alloggio + pulizia + tassa)
const CLEANING = 80;

// Dati per-prenotazione dagli screenshot Airbnb (settembre 2026). Tutte Airbnb,
// tassa incassata dal canale (nessun contante in loco → nessun acconto socio).
//  room     = ricavi alloggio (post-sconti, quello pagato dagli ospiti per le notti)
//  ota      = commissione Airbnb (15,5% + IVA)
//  cedolare = ritenuta 21% (su room+pulizia)
//  tax      = tassa di soggiorno (3 € × ospiti × notti)
//  discounts= sconti applicati dal canale (correzione prezzo medio / fedeltà), informativi
const D = [
  { name: "Faris",    nat: "SA", source: "airbnb", ref: "PUCCI-0903", ci: "2026-09-03", co: "2026-09-05", nights: 2, guests: 4, room: 240, ota: 60.51, cedolare: 67.20, tax: 24, discounts: [{ label: "Correzione del prezzo medio per notte", amount: 40 }] },
  { name: "Rsalda",   nat: "KZ", source: "airbnb", ref: "PUCCI-0905", ci: "2026-09-05", co: "2026-09-08", nights: 3, guests: 3, room: 240, ota: 60.51, cedolare: 67.20, tax: 27, discounts: [] },
  { name: "Nicoleta", nat: "IT", source: "airbnb", ref: "PUCCI-0923", ci: "2026-09-23", co: "2026-09-25", nights: 2, guests: 2, room: 129, ota: 39.53, cedolare: 43.89, tax: 12, discounts: [] },
  { name: "Marko",    nat: "SI", source: "airbnb", ref: "PUCCI-0925", ci: "2026-09-25", co: "2026-09-28", nights: 3, guests: 3, room: 324, ota: 76.40, cedolare: 84.84, tax: 27, discounts: [{ label: "Correzione del prezzo medio per notte", amount: 51 }, { label: "Sconto ospiti con valutazioni migliori", amount: 45 }] },
];

function bookingDoc(d) {
  const room = r2(d.room);
  const cleaning = CLEANING;
  const totalAmount = r2(room + cleaning); // lordo OTA esposto (alloggio + pulizia)
  const feeBaseAmount = r2(room + cleaning + d.tax); // lordo soggetto a fee 10%
  const fee = r2(feeBaseAmount * FEE_RATE);
  const net = r2(room - d.ota - d.cedolare - fee); // pulizia e tassa = partite di giro
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
    touristTaxStatus: "collected",
    guestOrigins: [{ code: d.nat, count: d.guests }],
    guestInfo: { name: d.name, email: "", nationality: d.nat },
    pricing: {
      nightlyRate: r2(room / d.nights),
      cleaningFee: cleaning,
      totalAmount,
      roomRevenue: room,
      commissionRate: totalAmount > 0 ? Math.round((d.ota / totalAmount) * 10000) / 10000 : 0,
      commissionAmount: d.ota,
      cedolare: d.cedolare,
      extraNight: 0,
      parking: 0,
      managementFeeRate: FEE_RATE,
      managementFeeBase: FEE_BASE,
      discounts: d.discounts,
      ownerPayout: net,
      touristTax: d.tax,
    },
    createdAt: now,
    updatedAt: now,
  };
}

const IMG = (url, alt, order) => ({ url, alt, order });
const PUCCI_IMAGES = [
  IMG("/images/welcome/casa-di-pucci/casa/exterior/01.webp", "Casa di Pucci — esterno", 0),
  IMG("/images/listing/casa-di-pucci/01-soggiorno-1.webp", "Soggiorno", 1),
  IMG("/images/listing/casa-di-pucci/03-soggiorno-3.webp", "Soggiorno", 2),
  IMG("/images/listing/casa-di-pucci/06-soggiorno-6.webp", "Soggiorno", 3),
  IMG("/images/welcome/casa-di-pucci/casa/bedroom1/01.webp", "Camera da letto", 4),
  IMG("/images/listing/casa-di-pucci/13-libreria-1.webp", "Libreria", 5),
];

async function main() {
  const c = new MongoClient(uri);
  await c.connect();
  try {
    const db = c.db(dbName);
    const passwordHash = await bcryptHash(OWNER_PASSWORD, 12);
    await db.collection("users").updateOne(
      { _id: ownerId },
      {
        $set: { name: "Roberto Petrarca", email: OWNER_EMAIL, role: "owner", ownerId, passwordHash, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    await db.collection("properties").updateOne(
      { _id: propertyId },
      {
        $set: {
          name: "Casa di Pucci",
          slug: "casa-di-pucci",
          ownerId,
          status: "active",
          type: "house",
          zone: "altro",
          description: "",
          address: { street: "Via Camponuovo 106/12", city: "Lipomo", province: "CO", zip: "22030" },
          details: { bedrooms: 2, bathrooms: 2, maxGuests: 4, hasParking: true },
          amenities: [],
          images: PUCCI_IMAGES,
          pricing: { basePrice: 80, cleaningFee: CLEANING, weekendMultiplier: 1 },
          touristTaxRate: 3,
          managementFeeRate: FEE_RATE,
          managementFeeBase: FEE_BASE, // 10% sul lordo
          billingPeriod: "month",      // competenza a mese solare
          inpsRivalsa: false,          // Note spese soci senza rivalsa INPS
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    const oldIds = (await db.collection("bookings").find({ ownerId }).project({ _id: 1 }).toArray()).map((b) => b._id);
    if (oldIds.length) await db.collection("payments").deleteMany({ bookingId: { $in: oldIds } });
    await db.collection("bookings").deleteMany({ ownerId });
    const docs = D.map(bookingDoc);
    await db.collection("bookings").insertMany(docs);

    console.log(`✅ seed Pucci in ${dbName}: owner Roberto Petrarca + Casa di Pucci + ${docs.length} booking`);
    console.log(`   login proprietario → email: ${OWNER_EMAIL} · password: ${OWNER_PASSWORD}`);
    let netTot = 0;
    for (const b of docs) {
      const p = b.pricing;
      const base = r2(p.roomRevenue + p.cleaningFee + p.touristTax);
      const fee = r2(base * FEE_RATE);
      netTot += p.ownerPayout;
      console.log(`   · ${b.guestInfo.name.padEnd(10)} ${b.checkIn.toISOString().slice(0, 10)} lordo=${base} fee10%=${fee} net=${p.ownerPayout}`);
    }
    console.log(`   netto proprietario totale = ${r2(netTot)}`);
  } finally {
    await c.close();
  }
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
