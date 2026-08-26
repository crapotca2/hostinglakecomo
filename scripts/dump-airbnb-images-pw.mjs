#!/usr/bin/env node
// Variante Playwright: rende la galleria completa e scarica TUTTE le immagini.
// Uso: node scripts/dump-airbnb-images-pw.mjs <listingId>
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import sharp from "sharp";

const listingId = process.argv[2];
if (!listingId) {
  console.error("Uso: node scripts/dump-airbnb-images-pw.mjs <listingId>");
  process.exit(1);
}

// Airbnb interno marca le foto di una listing con base64("StaySupplyListing:<id>")
// nell'URL CDN. Filtrare su questo elimina icone, avatar e foto di altri annunci.
const LISTING_KEY = Buffer.from(`StaySupplyListing:${listingId}`).toString("base64");

function decodeHtmlEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ");
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// Airbnb CDN: im_w=1920 è confermato funzionante. Valori più bassi (1080,
// 1280) ritornano 404 a runtime. Quindi scarico a 1920 (cap larghezza) e
// poi ricappo entrambe le dimensioni con sharp per stare sotto 2000px.
const FETCH_WIDTH = 1920;
const MAX_DIM = 1800;

function withResize(url, width = FETCH_WIDTH) {
  if (!/a0\.muscache\.com\/im\//i.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}im_w=${width}`;
}

async function downloadBinary(url, destPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  await mkdir(path.dirname(destPath), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  if (Math.max(meta.width || 0, meta.height || 0) > MAX_DIM) {
    const out = await sharp(buf).resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true }).toBuffer();
    fs.writeFileSync(destPath, out);
    return { resized: true, from: `${meta.width}x${meta.height}` };
  }
  fs.writeFileSync(destPath, buf);
  return { resized: false, from: `${meta.width}x${meta.height}` };
}

async function main() {
  const pwPath = "file:///C:/Program%20Files/nodejs/node_modules/playwright/index.mjs";
  const { chromium } = await import(pwPath);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    locale: "it-IT",
    viewport: { width: 1400, height: 2200 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  });
  const page = await ctx.newPage();

  // Raccogli SOLO le immagini della listing target. Il base64 di
  // "StaySupplyListing:<id>" compare nel path CDN solo per le foto della
  // listing — non per icone, avatar, badge, o foto di altri annunci.
  const seen = new Set();
  page.on("response", (resp) => {
    const u = resp.url();
    if (!/a0\.muscache\.com\/im\/.*\.(jpe?g|png|webp)/i.test(u)) return;
    if (!u.includes(LISTING_KEY)) return;
    const clean = u.split("?")[0];
    if (/policy=/i.test(clean)) return;
    seen.add(clean);
  });

  // Aprire direttamente la modale Photo Tour scrollable salta il click sul
  // bottone "Mostra tutte le foto" e i carousel "altri annunci dell'host"
  // della pagina principale.
  const url = `https://www.airbnb.it/rooms/${listingId}?modal=PHOTO_TOUR_SCROLLABLE`;
  console.log(`Goto ${url}...`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Dismiss cookie banner se appare
  for (const sel of [
    'button:has-text("Accetta")',
    'button:has-text("Accept")',
  ]) {
    const el = await page.$(sel);
    if (el) { try { await el.click({ timeout: 1500 }); } catch {} }
  }

  // Scroll dentro la modale finché il numero di URL catturati smette di
  // crescere (early-exit invece di un loop fisso da 40).
  let prev = -1;
  for (let pass = 0; pass < 20 && prev !== seen.size; pass++) {
    prev = seen.size;
    await page.evaluate(async () => {
      const scrollables = [document.scrollingElement, document.body, ...document.querySelectorAll('[role="dialog"], [data-testid*="photo"], [data-testid*="modal"]')];
      for (const el of scrollables) {
        if (!el) continue;
        for (let i = 0; i < 20; i++) {
          el.scrollTop = (el.scrollTop || 0) + 800;
          await new Promise((r) => setTimeout(r, 80));
        }
      }
    });
    await page.waitForTimeout(1200);
  }

  // Title from page metadata (decoded)
  const rawTitle = (await page.title()) || `listing-${listingId}`;
  const beforeAirbnb = rawTitle.split(/\s*-\s*Airbnb/i)[0].trim();
  const cleanTitle = decodeHtmlEntities(beforeAirbnb)
    .replace(/\s*[-–]\s*(?:Appartament|Condomin|Loft|Villa|Stanze?|Suite|Camere?|Casa|Case|Vacation|Holiday|Rental|Apartment|Condo)\w*\b.*$/i, "")
    .trim();
  const slug = slugify(cleanTitle);
  console.log(`Title: "${cleanTitle}"`);

  await browser.close();

  const picUrls = [...seen];
  console.log(`Captured ${picUrls.length} unique image URLs.`);

  if (picUrls.length === 0) {
    console.error("No images captured. Aborting.");
    process.exit(1);
  }

  const desktop = path.join(os.homedir(), "Desktop");
  const outDir = path.join(desktop, cleanTitle || `Listing ${listingId}`);
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
      const info = await downloadBinary(withResize(picUrl), dest);
      const tag = info.resized ? ` (resized from ${info.from} → ≤${MAX_DIM})` : ` (${info.from})`;
      console.log(`  [${i + 1}/${picUrls.length}] ${idx}.${ext}${tag}`);
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
