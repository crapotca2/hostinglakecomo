#!/usr/bin/env node
// Ri-estrae indirizzi precisi (Via X N, CAP Citta) dalle sezioni sections.directions
// + descriptionLong + facts.parkingNote di ogni property e aggiorna address.street.
// Resetta geo/nearby/distances/airbnb per property modificate cosi il re-geocoding
// partira da zero.
//
// Uso: node scripts/refine-addresses.mjs [--reset-all-airbnb]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "src", "data", "properties.json");

const RESET_ALL_AIRBNB = process.argv.includes("--reset-all-airbnb");

function extractDetailedAddress(text) {
  if (!text) return null;
  // Pattern: Via/Piazza/Salita NOME [civico], [CAP] CITTA
  // Es: "Via Bonanomi 14 22100 Como", "Via Vitani, 7 22100 - Como"
  const patterns = [
    /\b(via|piazza|salita|piazzetta|viale|corso)\s+([A-Z][\w'àèéìòù\-. ]{2,40}?)[,\s]\s*(\d{1,4}\b)[^.\n]{0,30}?(\d{5})?\s*[-–]?\s*(Como|Cernobbio|Moltrasio|Torno|Nesso|Bellagio|Menaggio|Tremezzo|Lenno|Argegno|Blevio|Brunate|Laglio|Carate\s+Urio|Pognana|Varenna|Griante|Lezzeno)\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const street = `${capitalize(m[1])} ${m[2].trim()}, ${m[3]}`;
      const city = m[5].trim();
      const zip = m[4] || null;
      return { street, city, zip };
    }
  }
  return null;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function main() {
  const portfolio = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  let refined = 0;
  const changed = [];

  for (const p of portfolio) {
    const bodies = [
      p.sections?.directions,
      p.sections?.neighborhood,
      p.sections?.gettingAround,
      p.sections?.space,
      p.descriptionLong,
    ].filter(Boolean).join("\n");

    const detailed = extractDetailedAddress(bodies);
    if (!detailed) continue;

    const currentStreet = (p.address.street || "").toLowerCase();
    const newStreet = detailed.street.toLowerCase();

    // Only update if the new street contains more info (has number) than current
    const hasNumber = /\d/.test(detailed.street);
    const currentHasNumber = /\d/.test(currentStreet);

    if (hasNumber && (currentStreet !== newStreet || !currentHasNumber)) {
      p.address.street = detailed.street;
      if (detailed.city) p.address.city = detailed.city;
      if (detailed.zip) p.address.zip = detailed.zip;
      // Reset enrichment to force re-run
      delete p.geo;
      delete p.nearby;
      delete p.distances;
      delete p.enrichedAt;
      if (RESET_ALL_AIRBNB) delete p.airbnb;
      refined++;
      changed.push({
        slug: p.slug,
        street: p.address.street,
        city: p.address.city,
      });
    }
  }

  if (RESET_ALL_AIRBNB) {
    for (const p of portfolio) delete p.airbnb;
    console.log("Reset airbnb field on ALL properties.");
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(portfolio, null, 2));

  console.log(`Refined ${refined} properties.`);
  for (const c of changed.slice(0, 15)) {
    console.log(`  ${c.slug.padEnd(25)} -> ${c.street}, ${c.city}`);
  }
  if (changed.length > 15) console.log(`  ... +${changed.length - 15} more`);
}

main();
