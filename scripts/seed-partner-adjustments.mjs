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

// Acconti = contante del proprietario (parcheggio + notte extra diretta + tassa
// di soggiorno riscossa in loco) tenuto dal socio, imputato PER CASSA al periodo
// di regolazione. Fonte: ricostruzione incassi diretti fornita da Andrei, con le
// tasse allineate ai dati dichiarati alle autorità (schedine Alloggiati).
//  - Angelo, luglio: Grzegorz parcheggio 40 + tassa 36 (3 ospiti dichiarati) = 76.
//  - Andrei, luglio: Jean Claude notte diretta 250 + parcheggio 40 + tassa 48
//    (4 ospiti) = 338 (imputato a luglio: contante consegnato al check-in del 30/07,
//    anche se il ciclo del soggiorno è agosto).
//  - Andrei, agosto: tasse di soggiorno riscosse in loco al check-out —
//    Jacek 36, Gareth 48, Scott 18.
//  - Angelo incassa in loco la tassa di TUTTI i clienti Booking che registra lui,
//    imputata PER CASSA al mese del check-in (come per Jean Claude):
//      · settembre: Anthony (parcheggio 30 + tassa 27 = 57) + Giuliano (tassa 24,
//        check-in 25/09). NB: la consulenza di Giuliano resta nel ciclo 2026-10,
//        ma il suo contante segue il mese d'incasso (settembre).
//      · ottobre: Hala (tassa 27, check-in 02/10).
// NB: Zack parcheggio 70 pagato per BONIFICO (non contante in mano al socio) →
// NON è un acconto (compare solo nel parcheggio 50/50 del proprietario). Dennis ed
// Ed (Airbnb) hanno pagato la tassa via canale e non hanno usato il parcheggio → nessun acconto.
const entries = [
  { period: "2026-07", kind: "favore", partner: "andrei", amount: 40, note: "check-in amici di Alessandro" },
  { period: "2026-07", kind: "acconto", partner: "angelo", amount: 76, note: "Grzegorz (parcheggio + tassa)" },
  { period: "2026-07", kind: "acconto", partner: "andrei", amount: 338, note: "Jean Claude (diretto + parcheggio + tassa)" },
  { period: "2026-08", kind: "acconto", partner: "andrei", amount: 36, note: "Jacek (tassa soggiorno)" },
  { period: "2026-08", kind: "acconto", partner: "andrei", amount: 48, note: "Gareth (tassa soggiorno)" },
  { period: "2026-08", kind: "acconto", partner: "andrei", amount: 18, note: "Scott (tassa soggiorno)" },
  { period: "2026-09", kind: "acconto", partner: "angelo", amount: 57, note: "Anthony 17/09 — tassa 27 + parcheggio 30" },
  { period: "2026-09", kind: "acconto", partner: "angelo", amount: 24, note: "Giuliano 25/09 — tassa soggiorno" },
  { period: "2026-10", kind: "acconto", partner: "angelo", amount: 27, note: "Hala 02/10 — tassa soggiorno (incassata da Angelo)" },
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
