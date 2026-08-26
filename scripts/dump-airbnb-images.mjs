#!/usr/bin/env node
// Scarica tutte le immagini di una listing Airbnb in una cartella sul Desktop.
// Non tocca properties.json. Uso: node scripts/dump-airbnb-images.mjs <listingId>
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const listingId = process.argv[2];
if (!listingId) {
  console.error("Uso: node scripts/dump-airbnb-images.mjs <listingId>");
  process.exit(1);
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
      "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.text();
}

async function downloadBinary(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  await mkdir(path.dirname(destPath), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

async function main() {
  const url = `https://www.airbnb.it/rooms/${listingId}`;
  console.log(`Fetching ${url}...`);
  const html = await fetchText(url);
  console.log(`Got ${html.length} bytes.`);

  const titleRaw = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const title = titleRaw?.split(/\s*-\s*Airbnb/i)[0]?.trim() || `listing-${listingId}`;
  const cleanTitle = title
    .replace(/\s*[-–]\s*(?:Appartament|Condomin|Loft|Villa|Stanze?|Suite|Camere?|Casa|Vacation|Holiday|Rental|Apartment|Condo)\w*\b.*$/i, "")
    .trim();
  const slug = slugify(cleanTitle);
  console.log(`Title: ${cleanTitle}`);
  console.log(`Slug: ${slug}`);

  // Tutti gli URL immagini muscache.com (no filtro policy, no limite)
  const pics = new Map();
  for (const m of html.matchAll(/(https:\\?\/\\?\/a0\.muscache\.com\/im\/[^"\\\s]+\.(?:jpe?g|png|webp))/g)) {
    let raw = m[1].replace(/\\\//g, "/");
    const cleanUrl = raw.split("?")[0];
    if (/policy=/i.test(cleanUrl)) continue;
    const idMatch = cleanUrl.match(/\/pictures\/([^/]+)\//);
    const key = idMatch ? idMatch[1] : cleanUrl;
    if (!pics.has(key)) pics.set(key, cleanUrl);
  }
  const picUrls = [...pics.values()];
  console.log(`Found ${picUrls.length} unique pictures.`);

  const desktop = path.join(os.homedir(), "Desktop");
  const outDir = path.join(desktop, `Listing ${listingId} - ${cleanTitle}`);
  await mkdir(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "_manifest.json"),
    JSON.stringify({ listingId, url, title: cleanTitle, slug, downloadedAt: new Date().toISOString(), pictures: picUrls }, null, 2)
  );

  for (let i = 0; i < picUrls.length; i++) {
    const picUrl = picUrls[i];
    const ext = (picUrl.match(/\.(jpe?g|png|webp)$/i)?.[1] || "jpg").toLowerCase();
    const idx = String(i + 1).padStart(2, "0");
    const dest = path.join(outDir, `${idx}.${ext}`);
    try {
      await downloadBinary(picUrl, dest);
      process.stdout.write(`  [${i + 1}/${picUrls.length}] saved ${idx}.${ext}\n`);
    } catch (e) {
      console.warn(`  image ${i + 1} failed: ${e.message}`);
    }
  }

  console.log(`\nSaved to: ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
