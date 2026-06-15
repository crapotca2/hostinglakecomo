// Migrazione one-shot: copia welcome_books + house_guides di Aqua Vista
// dal cluster MongoDB del welcome book (host_como_agentic) al cluster
// MongoDB del sito hostcomo.com.
//
// Riassegna lo slug da "aqua-vista-splendore" → "aqua-vista-di-splendore"
// (slug usato in hostcomo.com properties.json) e rinomina i path immagini
// da /images/{casa,guida,parcheggi,destinations}/... a
// /images/welcome/aqua-vista-di-splendore/{casa,guida,parcheggi,destinations}/...
//
// Env required:
//   MONGODB_URI_SOURCE  -> cluster welcome book (host-como-agentic-web)
//   MONGODB_DB_SOURCE   -> "host_como_agentic" (default)
//   MONGODB_URI_TARGET  -> cluster hostcomo.com prod
//   MONGODB_DB_TARGET   -> "air_bibby" (default hostcomo.com)
//
// Usage:
//   MONGODB_URI_SOURCE="..." MONGODB_URI_TARGET="..." node scripts/migrate-welcome-book-from-agentic.mjs

import { MongoClient } from "mongodb";

const SOURCE_URI = process.env.MONGODB_URI_SOURCE;
const SOURCE_DB = process.env.MONGODB_DB_SOURCE || "host_como_agentic";
const TARGET_URI = process.env.MONGODB_URI_TARGET;
const TARGET_DB = process.env.MONGODB_DB_TARGET || "air_bibby";

if (!SOURCE_URI || !TARGET_URI) {
  console.error("ERROR: MONGODB_URI_SOURCE and MONGODB_URI_TARGET must be set");
  process.exit(1);
}

const OLD_SLUG = "aqua-vista-splendore";
const NEW_SLUG = "aqua-vista-di-splendore";
const NEW_IMAGE_PREFIX = `/images/welcome/${NEW_SLUG}`;

// Rinomina /images/casa/... → /images/welcome/aqua-vista-di-splendore/casa/...
function remapImagePath(p) {
  if (typeof p !== "string" || !p.startsWith("/images/")) return p;
  // Già migrato? no-op
  if (p.startsWith(`${NEW_IMAGE_PREFIX}/`)) return p;
  const rest = p.slice("/images/".length);
  return `${NEW_IMAGE_PREFIX}/${rest}`;
}

// Walk ricorsivo: rimpiazza ogni stringa che è un path /images/ con quello nuovo
function deepRemapImages(value) {
  if (typeof value === "string") return remapImagePath(value);
  if (Array.isArray(value)) return value.map(deepRemapImages);
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = deepRemapImages(value[k]);
    }
    return out;
  }
  return value;
}

async function main() {
  const src = new MongoClient(SOURCE_URI);
  const tgt = new MongoClient(TARGET_URI);
  await Promise.all([src.connect(), tgt.connect()]);
  const srcDb = src.db(SOURCE_DB);
  const tgtDb = tgt.db(TARGET_DB);

  for (const colName of ["welcome_books", "house_guides"]) {
    const srcCol = srcDb.collection(colName);
    const tgtCol = tgtDb.collection(colName);
    const doc = await srcCol.findOne({ propertySlug: OLD_SLUG });
    if (!doc) {
      console.log(`[${colName}] no doc found in source for slug=${OLD_SLUG} — skip`);
      continue;
    }
    delete doc._id;
    const remapped = deepRemapImages(doc);
    remapped.propertySlug = NEW_SLUG;
    remapped.updatedAt = new Date().toISOString();

    const res = await tgtCol.updateOne(
      { propertySlug: NEW_SLUG },
      { $set: remapped },
      { upsert: true },
    );
    console.log(
      `[${colName}] matched=${res.matchedCount} modified=${res.modifiedCount} upsertedId=${res.upsertedId ?? "-"}`,
    );
  }

  // Indici unique sui target
  await tgtDb
    .collection("welcome_books")
    .createIndex({ propertySlug: 1 }, { unique: true })
    .catch(() => {});
  await tgtDb
    .collection("house_guides")
    .createIndex({ propertySlug: 1 }, { unique: true })
    .catch(() => {});

  await Promise.all([src.close(), tgt.close()]);
  console.log("DONE");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
