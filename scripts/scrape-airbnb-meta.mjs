#!/usr/bin/env node
// Estrae solo i metadati di una listing Airbnb (title, description, rating,
// review count, beds/baths/guests, amenities) e li stampa come JSON.
// Non tocca properties.json ne scarica immagini.
// Uso: node scripts/scrape-airbnb-meta.mjs <listingId>

const listingId = process.argv[2];
if (!listingId) {
  console.error("Uso: node scripts/scrape-airbnb-meta.mjs <listingId>");
  process.exit(1);
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
  const url = `https://www.airbnb.it/rooms/${listingId}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Scroll per innescare lazy load
  await page.evaluate(async () => {
    await new Promise((r) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, 800);
        y += 800;
        if (y < document.body.scrollHeight + 2000) setTimeout(step, 80);
        else r();
      };
      step();
    });
  });
  await page.waitForTimeout(2000);

  // Cerca "Mostra altro" sulla descrizione e cliccaci
  for (const sel of [
    'button:has-text("Mostra altro")',
    'button:has-text("Show more")',
  ]) {
    const el = await page.$(sel);
    if (el) { try { await el.click({ timeout: 1500 }); break; } catch {} }
  }
  await page.waitForTimeout(1000);

  const meta = await page.evaluate(() => {
    const text = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
    const all = (sel) => Array.from(document.querySelectorAll(sel)).map((el) => el.textContent.trim());

    // Title
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || null;
    const h1 = document.querySelector('h1')?.textContent?.trim() || null;

    // Description (OG + body)
    const ogDesc = document.querySelector('meta[property="og:description"]')?.content || null;

    // Rating + reviews
    const ratingMatch = document.body.innerText.match(/([\d,.]+)\s*[·•]\s*([\d.]+)\s*recension/i);
    let rating = null, reviewCount = null;
    const ratingEl = document.querySelector('[aria-label*="recensioni"], [aria-label*="reviews"]');
    if (ratingEl) {
      const m = ratingEl.getAttribute('aria-label').match(/([\d,.]+)\s+(?:stelle|out of)/i);
      if (m) rating = parseFloat(m[1].replace(',', '.'));
      const r = ratingEl.getAttribute('aria-label').match(/(\d+)\s+recension/i);
      if (r) reviewCount = parseInt(r[1], 10);
    }
    // Fallback rating: look for "X,X · YY recensioni"
    const body = document.body.innerText;
    const fb = body.match(/(\d[,.]\d)\s*[·•]?\s*(\d+)\s*recension/i);
    if (fb && !rating) rating = parseFloat(fb[1].replace(',', '.'));
    if (fb && !reviewCount) reviewCount = parseInt(fb[2], 10);

    // Beds/baths/guests block: look for "X ospiti · Y camere · Z letti · W bagni"
    const bg = body.match(/(\d+)\s+ospit[ei][^·•]*[·•]\s*(\d+)\s+camer[ae][^·•]*[·•]\s*(\d+)\s+lett[oi][^·•]*[·•]\s*(\d+(?:[.,]\d+)?)\s+bagn[oi]/i);
    let guests = null, bedrooms = null, beds = null, baths = null;
    if (bg) {
      guests = parseInt(bg[1], 10);
      bedrooms = parseInt(bg[2], 10);
      beds = parseInt(bg[3], 10);
      baths = parseFloat(bg[4].replace(',', '.'));
    }

    // Location label (Posizione block)
    let locationLabel = null;
    const locMatch = body.match(/(?:Dove\s+ti\s+troverai|Where\s+you'?ll\s+be)[\s\S]{0,200}?\n([A-Z][^\n]{3,80})/);
    if (locMatch) locationLabel = locMatch[1].trim();

    // Amenities: cerca pattern noti
    const amen = [];
    const lower = body.toLowerCase();
    const checks = [
      ["WiFi", /\bwi[-\s]?fi\b/],
      ["Aria condizionata", /aria condizionata/],
      ["Riscaldamento", /\briscaldamento\b/],
      ["Lavatrice", /\blavatrice\b/],
      ["Asciugatrice", /\basciugatrice\b/],
      ["Cucina attrezzata", /\bcucina\b/],
      ["Smart TV", /\bsmart\s*tv\b|\btv\b/],
      ["Lavastoviglie", /lavastoviglie/],
      ["Forno", /\bforno\b/],
      ["Microonde", /microond/],
      ["Bollitore", /bollitor/],
      ["Macchina da caffè", /macchina\s*(?:da|del)\s*caff/],
      ["Ferro da stiro", /ferro\s*da\s*stiro/],
      ["Phon", /\bphon\b|asciugacapelli/],
      ["Asciugamani", /\basciugamani\b/],
      ["Lenzuola", /\blenzuola\b/],
      ["Self check-in", /self check[-\s]?in|check-in\s+auton/],
      ["Riservato agli ospiti", /riservato\s+agli\s+ospiti/],
    ];
    for (const [name, re] of checks) if (re.test(lower)) amen.push(name);

    return { ogTitle, h1, ogDesc, rating, reviewCount, guests, bedrooms, beds, baths, locationLabel, amenities: amen };
  });

  await browser.close();
  console.log(JSON.stringify(meta, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
