// Refresh dei dati Airbnb (rating, recensioni, ratings per categoria)
// per ogni property in src/data/properties.json che ha un airbnbListing.id.
//
// Uso locale: node scripts/refresh-airbnb-listings.mjs
// CI: invocato da .github/workflows/refresh-airbnb-listings.yml

import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const DATA_PATH = "src/data/properties.json";
const TIMEOUT = 60_000;

function loadProperties() {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  if (Array.isArray(raw)) return { wrapper: null, list: raw };
  if (Array.isArray(raw.properties)) return { wrapper: raw, list: raw.properties };
  throw new Error("properties.json: shape non riconosciuta");
}

function saveProperties({ wrapper, list }) {
  const out = wrapper ? { ...wrapper, properties: list } : list;
  writeFileSync(DATA_PATH, JSON.stringify(out, null, 2) + "\n");
}

// Estrae rating + reviewCount dal blob JSON che Airbnb inietta nella pagina
// (data-deferred-state-0). Fallback: testo visibile.
async function extractListingData(page, listingId) {
  await page.goto(`https://www.airbnb.com/rooms/${listingId}`, {
    waitUntil: "domcontentloaded",
    timeout: TIMEOUT,
  });

  await page.waitForLoadState("networkidle", { timeout: TIMEOUT }).catch(() => {});

  const data = await page.evaluate(() => {
    const out = { rating: null, reviewCount: null };

    // 1) Prova dal JSON-LD
    const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    for (const s of ld) {
      try {
        const j = JSON.parse(s.textContent || "");
        const arr = Array.isArray(j) ? j : [j];
        for (const node of arr) {
          if (node?.aggregateRating) {
            const r = Number(node.aggregateRating.ratingValue);
            const c = Number(node.aggregateRating.reviewCount);
            if (Number.isFinite(r) && out.rating == null) out.rating = r;
            if (Number.isFinite(c) && out.reviewCount == null) out.reviewCount = c;
          }
        }
      } catch {}
    }

    // 2) Fallback: parse del blob deferred-state per loved-by-guests + categorie
    const blob = document.querySelector('script[id^="data-deferred-state"]');
    if (blob) {
      try {
        const txt = blob.textContent || "";
        const ratingMatch = txt.match(/"ratingValue"\s*:\s*([0-9.]+)/);
        if (ratingMatch && out.rating == null) {
          out.rating = Number(ratingMatch[1]);
        }
        const reviewMatch = txt.match(/"reviewCount"\s*:\s*([0-9]+)/);
        if (reviewMatch && out.reviewCount == null) {
          out.reviewCount = Number(reviewMatch[1]);
        }
      } catch {}
    }

    return out;
  });

  return data;
}

async function main() {
  const store = loadProperties();
  const targets = store.list.filter((p) => p?.airbnbListing?.id);

  if (targets.length === 0) {
    console.log("Nessuna property con airbnbListing.id, niente da fare.");
    return;
  }

  console.log(`Refresh di ${targets.length} listing...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "it-IT",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  let updates = 0;
  let failures = 0;

  for (const p of targets) {
    const id = p.airbnbListing.id;
    const page = await context.newPage();
    try {
      console.log(`  -> ${p.name} (${id})`);
      const fresh = await extractListingData(page, id);

      if (fresh.rating == null && fresh.reviewCount == null) {
        console.log(`     nessun dato estratto, skip.`);
        failures++;
      } else {
        if (fresh.rating != null) {
          if (p.airbnbListing.rating !== fresh.rating) {
            console.log(`     rating: ${p.airbnbListing.rating} -> ${fresh.rating}`);
            p.airbnbListing.rating = fresh.rating;
            updates++;
          }
        }
        if (fresh.reviewCount != null) {
          if (p.airbnbListing.reviewCount !== fresh.reviewCount) {
            console.log(`     reviewCount: ${p.airbnbListing.reviewCount} -> ${fresh.reviewCount}`);
            p.airbnbListing.reviewCount = fresh.reviewCount;
            updates++;
          }
        }
      }
    } catch (err) {
      console.error(`     errore: ${err.message}`);
      failures++;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  if (updates > 0) {
    saveProperties(store);
    console.log(`OK: ${updates} campi aggiornati.`);
  } else {
    console.log("Nessun cambiamento.");
  }

  if (failures > 0) {
    console.warn(`Attenzione: ${failures} listing falliti.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
