#!/usr/bin/env node
// Stampa solo gli URL delle foto di una listing Airbnb (senza scaricare).
// Distingue le foto della listing dalle decorative/altri annunci.
// Uso: node scripts/airbnb-listing-urls.mjs <listingId>

const listingId = process.argv[2];
if (!listingId) { console.error("Uso: node scripts/airbnb-listing-urls.mjs <listingId>"); process.exit(1); }
const listingB64 = Buffer.from(`StaySupplyListing:${listingId}`).toString("base64");

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

  const seen = new Set();
  page.on("response", (resp) => {
    const u = resp.url();
    if (/a0\.muscache\.com\/im\/.*\.(jpe?g|png|webp)/i.test(u)) {
      const clean = u.split("?")[0];
      if (/policy=/i.test(clean)) return;
      seen.add(clean);
    }
  });

  await page.goto(`https://www.airbnb.it/rooms/${listingId}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  for (const sel of ['button:has-text("Mostra tutte le foto")', 'button:has-text("Show all photos")']) {
    const el = await page.$(sel);
    if (el) { try { await el.click({ timeout: 2000 }); break; } catch {} }
  }
  await page.waitForTimeout(3000);

  // Scroll dentro la modale finché il numero di URL smette di crescere
  let prev = -1;
  for (let pass = 0; pass < 15 && prev !== seen.size; pass++) {
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
    await page.waitForTimeout(1500);
  }

  await browser.close();

  const all = [...seen];
  const listingOnly = all.filter((u) => u.includes(listingB64));
  const other = all.filter((u) => !u.includes(listingB64));
  console.log(`Total: ${all.length}`);
  console.log(`Of listing ${listingId} (b64 ${listingB64}): ${listingOnly.length}`);
  console.log(`Other (icons/host/other listings): ${other.length}`);
  console.log("\n--- LISTING URLs ---");
  listingOnly.forEach((u, i) => console.log(`${String(i + 1).padStart(2, "0")}  ${u}`));
}

main().catch((e) => { console.error(e); process.exit(1); });
