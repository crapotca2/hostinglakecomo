#!/usr/bin/env node
// Scraper one-shot per comolakehost.com — legge la sitemap, estrae dati strutturati
// per ogni proprieta e scarica fino a 6 immagini. Output: src/data/properties.json
//
// Uso: node scripts/scrape-comolakehost.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const IMG_DIR = path.join(ROOT, "public", "images", "imported");

const BASE = "https://www.comolakehost.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const MAX_IMAGES_PER_PROPERTY = 6;
const CONCURRENCY = 3;
const SKIP_IMAGES = process.argv.includes("--no-images");

const SKIP_SLUGS = new Set([
  "", "appartamenti", "location", "contatti", "about", "servizi", "contact",
  "chi-siamo", "home", "blog", "news", "privacy", "cookie", "termini",
  "privacy-policy", "cookie-policy", "wp-login", "wp-admin", "feed",
]);

function inferZone(cityText) {
  const t = (cityText || "").toLowerCase();
  if (/(como)\b/.test(t) && !/(cernobbio|moltrasio|torno|nesso|bellagio|menaggio|tremezzo|lenno|colico|gravedona|dongo)/.test(t)) {
    return "centro-como";
  }
  if (/(cernobbio|moltrasio|torno|nesso|blevio|brunate|laglio|carate|urio|pognana)/.test(t)) return "primo-bacino";
  if (/(bellagio|menaggio|tremezzo|lenno|argegno|lezzeno|varenna|griante|cadenabbia)/.test(t)) return "secondo-bacino";
  if (/(colico|gravedona|dongo|domaso|musso|pianello|sorico)/.test(t)) return "alto-lago";
  if (/como/.test(t)) return "centro-como";
  return "primo-bacino";
}

function inferType(title, description) {
  const all = `${title} ${description}`.toLowerCase();
  if (/\bvilla\b/.test(all)) return "villa";
  if (/\bloft\b/.test(all)) return "studio";
  if (/\bstudio\b/.test(all)) return "studio";
  if (/\bmonolocale\b/.test(all)) return "studio";
  if (/\bcasa\b/.test(all) && !/\bcasa vacanz/.test(all)) return "house";
  return "apartment";
}

function extractNumber(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

function inferBedrooms(text) {
  const lower = text.toLowerCase();
  const n = extractNumber(lower, [
    /(\d+)\s*camere\s*(?:da\s*letto|matrimoniali)/,
    /(\d+)\s*camera\s*(?:da\s*letto|matrimoniale)/,
    /(\d+)\s*bedroom/,
    /(\d+)\s*letti\s*matrimoniali/,
  ]);
  if (n) return n;
  if (/monolocale|studio|loft/.test(lower) && !/camere/.test(lower)) return 0;
  if (/una camera|1 camera/.test(lower)) return 1;
  if (/due camere/.test(lower)) return 2;
  if (/tre camere/.test(lower)) return 3;
  return 1;
}

function inferBathrooms(text) {
  const lower = text.toLowerCase();
  const n = extractNumber(lower, [
    /(\d+)\s*bagni/,
    /(\d+)\s*bathroom/,
  ]);
  if (n) return n;
  if (/un bagno|1 bagno/.test(lower)) return 1;
  if (/due bagni/.test(lower)) return 2;
  return 1;
}

function inferMaxGuests(bedrooms, text) {
  const lower = text.toLowerCase();
  const n = extractNumber(lower, [
    /(\d+)\s*ospiti/,
    /(\d+)\s*persone/,
    /(\d+)\s*guests/,
  ]);
  if (n) return n;
  return Math.max(2, bedrooms * 2);
}

function inferAmenities(text) {
  const lower = text.toLowerCase();
  const amenities = [];
  if (/wi-?fi|internet/.test(lower)) amenities.push("WiFi");
  if (/aria condizionata|\bac\b|climatizz/.test(lower)) amenities.push("Aria condizionata");
  if (/netflix|smart tv|televisione/.test(lower)) amenities.push("Smart TV");
  if (/lavastoviglie/.test(lower)) amenities.push("Lavastoviglie");
  if (/lavatrice/.test(lower)) amenities.push("Lavatrice");
  if (/cucina attrezzata|cucina a vista|cucina completa/.test(lower)) amenities.push("Cucina attrezzata");
  if (/giardino/.test(lower)) amenities.push("Giardino");
  if (/terrazz[ao]|balcone/.test(lower)) amenities.push("Terrazza");
  if (/piscina|pool/.test(lower)) amenities.push("Piscina");
  if (/parcheggio/.test(lower)) amenities.push("Parcheggio");
  if (/vista lago|lake view/.test(lower)) amenities.push("Vista lago");
  if (/spremiagrumi|bollitore|tostapane|macchina\s*caff/.test(lower)) amenities.push("Elettrodomestici completi");
  if (/ascensore/.test(lower)) amenities.push("Ascensore");
  return Array.from(new Set(amenities));
}

function decodeHtmlEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&agrave;/g, "à")
    .replace(/&egrave;/g, "è")
    .replace(/&eacute;/g, "é")
    .replace(/&igrave;/g, "ì")
    .replace(/&ograve;/g, "ò")
    .replace(/&ugrave;/g, "ù")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function stripHtml(html) {
  if (!html) return "";
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "text/html,application/xml" },
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

async function listPropertySlugs() {
  const slugs = new Set();

  try {
    const xml = await fetchText(`${BASE}/sitemap.xml`);
    const subsitemaps = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const sm of subsitemaps) {
      if (/category-sitemap\.xml/.test(sm) || /page-sitemap\.xml/.test(sm)) {
        try {
          const sub = await fetchText(sm);
          const urls = [...sub.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
          for (const u of urls) {
            const m = u.match(/https?:\/\/www\.comolakehost\.com\/([^/?#]+)\/?$/);
            if (m) slugs.add(m[1]);
          }
        } catch (e) {
          console.warn(`Skipping ${sm}: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.warn(`sitemap.xml failed: ${e.message}`);
  }

  try {
    const html = await fetchText(`${BASE}/location/`);
    const matches = [...html.matchAll(/https?:\/\/www\.comolakehost\.com\/([a-zA-Z0-9\-]+)\/?(?:"|')/g)];
    for (const m of matches) slugs.add(m[1]);
  } catch (e) {
    console.warn(`/location/ failed: ${e.message}`);
  }

  const cleaned = [...slugs]
    .filter((s) => s && !SKIP_SLUGS.has(s))
    .filter((s) => !/^(category|indicazioni|informazioni|parcheggio|tag|author|wp)/.test(s))
    .filter((s) => !/^\d+$/.test(s));

  return cleaned.sort();
}

function extractMeta(html, property, name) {
  const re = new RegExp(`<meta\\s+${property}=["']${name}["']\\s+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? decodeHtmlEntities(m[1]) : null;
}

function extractImageUrls(html) {
  const urls = new Set();
  const reImg = /<img[^>]+src=["']([^"']+)["']/gi;
  for (const m of html.matchAll(reImg)) {
    const src = m[1];
    if (/\/wp-content\/uploads\//.test(src) && /\.(jpe?g|png|webp)(\?|$)/i.test(src)) {
      urls.add(src.split("?")[0].replace(/-\d+x\d+(?=\.\w+$)/, ""));
    }
  }
  return [...urls];
}

function extractPrices(html) {
  const prices = [];
  for (const m of html.matchAll(/\bprice=["'](\d+(?:\.\d+)?)["']/g)) {
    const p = parseFloat(m[1]);
    if (p > 20 && p < 2000) prices.push(p);
  }
  return prices;
}

function median(nums) {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const SECTION_KEY_MAP = {
  "lo spazio": "space",
  "il quartiere": "neighborhood",
  "come muoversi": "gettingAround",
  "indicazioni": "directions",
  "accesso ospiti": "guestAccess",
  "servizi": "services",
  "panoramica": "overview",
  "the space": "space",
  "the neighborhood": "neighborhood",
  "getting around": "gettingAround",
  "directions": "directions",
  "guest access": "guestAccess",
};

function extractSections(html) {
  const sections = {};
  const extras = [];
  // Split the whole document by widget-title h3s. Matches anywhere so we capture content between.
  const re = /<h3[^>]*class=["'][^"']*widget-title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/gi;
  const matches = [...html.matchAll(re)];
  if (matches.length === 0) return { sections, extras };

  for (let i = 0; i < matches.length; i++) {
    const title = stripHtml(matches[i][1]).trim();
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : Math.min(startIdx + 10000, html.length);
    const chunk = html.slice(startIdx, endIdx);

    // Stop at obvious non-content boundaries
    const stopIdx = Math.min(
      ...[
        chunk.search(/<footer/i),
        chunk.search(/<aside/i),
        chunk.search(/<!--\s*\/?sitelayout/i),
        chunk.length,
      ].filter((n) => n >= 0)
    );
    const cleanChunk = chunk.slice(0, stopIdx);

    const paragraphs = [...cleanChunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => stripHtml(m[1]))
      .filter((p) => p.length > 15);

    if (paragraphs.length === 0) continue;
    const content = paragraphs.join("\n\n").slice(0, 3000);

    const normTitle = title.toLowerCase();
    if (/prenota|book now|reserve/.test(normTitle)) continue;

    const key = SECTION_KEY_MAP[normTitle];
    if (key) {
      sections[key] = content;
    } else if (title.length > 2 && title.length < 60) {
      extras.push({ title, content });
    }
  }
  return { sections, extras };
}

function extractFacts(allText) {
  const facts = {};
  const lower = allText.toLowerCase();

  const floorMatch = allText.match(/(\d+)[°o]?\s*piano\b(?:\s+(?:senza|con)\s+ascensore)?/i);
  if (floorMatch) {
    const elevatorPart = /senza\s+ascensore/i.test(floorMatch[0])
      ? " senza ascensore"
      : /con\s+ascensore/i.test(floorMatch[0])
      ? " con ascensore"
      : "";
    facts.floor = `${floorMatch[1]}° piano${elevatorPart}`;
  }

  const checkinMatch = allText.match(/(?:check[-\s]?in|orario\s+di\s+(?:check[-\s]?in|arrivo))[^.\n]{0,80}?(\d{1,2}[:.]\d{2})\s*(?:alle|[-–])\s*(\d{1,2}[:.]\d{2})/i);
  if (checkinMatch) facts.checkInHours = `${checkinMatch[1]} - ${checkinMatch[2]}`;
  else {
    const ciAltMatch = allText.match(/dalle\s*ore?\s*(\d{1,2}[:.]\d{2})\s*(?:alle)?\s*(?:ore)?\s*(\d{1,2}[:.]\d{2})/i);
    if (ciAltMatch) facts.checkInHours = `${ciAltMatch[1]} - ${ciAltMatch[2]}`;
  }

  const checkoutMatch = allText.match(/check[-\s]?out[^.]{0,40}(\d{1,2}[:.]\d{2})/i);
  if (checkoutMatch) facts.checkOutHours = `entro ${checkoutMatch[1]}`;

  const taxMatch = allText.match(/tassa\s+di\s+soggiorno[^.]{0,120}/i);
  if (taxMatch) facts.touristTaxNote = taxMatch[0].trim().slice(0, 200);

  const parkingMatch = allText.match(/parcheggio[^.]{0,150}/i);
  if (parkingMatch) facts.parkingNote = parkingMatch[0].trim().slice(0, 200);

  const petMatch = allText.match(/animali\s+(?:non\s+)?(?:ammessi|benvenuti|accettati)[^.]{0,80}/i);
  if (petMatch) facts.petsNote = petMatch[0].trim().slice(0, 120);

  const smokeMatch = allText.match(/(?:vietato|non\s+si\s+pu[òo])\s+fumare[^.]{0,60}|fumo\s+non\s+consentito/i);
  if (smokeMatch) facts.smokingNote = smokeMatch[0].trim().slice(0, 100);

  if (/lavatrice/.test(lower)) facts.hasWashingMachine = true;
  if (/ascensore/.test(lower)) facts.hasElevator = !/senza\s+ascensore/.test(lower);

  return facts;
}

function extractMainDescription(html) {
  const ogDesc = extractMeta(html, "property", "og:description") ||
    extractMeta(html, "name", "description");
  const h1Match = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
  const title = h1Match ? stripHtml(h1Match[1]) : null;

  const { sections, extras } = extractSections(html);

  const concatText = [
    sections.space,
    sections.neighborhood,
    sections.gettingAround,
    sections.directions,
    sections.guestAccess,
    ...extras.map((e) => e.content),
  ].filter(Boolean).join(" ");

  const fallbackLong = (() => {
    if (concatText.length > 200) return concatText;
    const contentMatch = html.match(/<div[^>]+class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<!--\s*\.entry-content/i);
    if (contentMatch) return stripHtml(contentMatch[1]);
    const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripHtml(m[1]));
    return pMatches.filter((p) => p.length > 40).slice(0, 6).join(" ");
  })();

  const facts = extractFacts(concatText || fallbackLong);

  return {
    title,
    ogDesc,
    longDesc: fallbackLong.slice(0, 2500),
    sections,
    extras,
    facts,
  };
}

function extractLocation(html, longDesc) {
  const viaMatch = longDesc.match(/\b([Vv]ia|[Pp]iazza|[Ss]alita|[Pp]iazzetta)\s+([A-Z][A-Za-zàèéìòù'\-. ]{1,40})/);
  const street = viaMatch ? `${viaMatch[1]} ${viaMatch[2]}`.trim() : "";

  const cityPatterns = [
    /\b(Como|Cernobbio|Moltrasio|Torno|Nesso|Bellagio|Menaggio|Tremezzo|Lenno|Argegno|Laglio|Blevio|Varenna|Lezzeno|Colico|Gravedona|Dongo|Domaso|Brunate|Pognana|Urio|Carate\s+Urio|Griante|Cadenabbia)\b/i,
  ];
  let city = "";
  for (const p of cityPatterns) {
    const m = longDesc.match(p) || html.match(p);
    if (m) { city = m[1]; break; }
  }
  if (!city) city = "Como";

  return { street, city };
}

async function scrapeProperty(slug) {
  const url = `${BASE}/${slug}/`;
  const html = await fetchText(url);

  const { title, ogDesc, longDesc, sections, extras, facts } = extractMainDescription(html);
  if (!title) {
    return null;
  }

  const imageUrls = extractImageUrls(html).slice(0, MAX_IMAGES_PER_PROPERTY);
  const prices = extractPrices(html);
  const basePrice = median(prices) || 150;

  const { street, city } = extractLocation(html, longDesc);
  const bedrooms = inferBedrooms(longDesc);
  const bathrooms = inferBathrooms(longDesc);
  const maxGuests = inferMaxGuests(bedrooms, longDesc);
  const type = inferType(title, longDesc);
  const zone = inferZone(city);
  const amenities = inferAmenities(longDesc);

  const hasLakeView = /vista lago|lake view|sul lago|affaccio lago/i.test(longDesc);
  const hasWifi = amenities.includes("WiFi");
  const hasAC = amenities.includes("Aria condizionata");
  const hasParking = amenities.includes("Parcheggio");
  const hasGarden = amenities.includes("Giardino");
  const hasPool = amenities.includes("Piscina");

  const localImages = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const ext = (imageUrls[i].match(/\.(jpe?g|png|webp)$/i)?.[1] || "jpg").toLowerCase();
    const localPath = path.join(IMG_DIR, slug, `${i}.${ext}`);
    const publicUrl = `/images/imported/${slug}/${i}.${ext}`;
    if (SKIP_IMAGES) {
      const { existsSync } = await import("node:fs");
      if (existsSync(localPath)) {
        localImages.push({ url: publicUrl, alt: `${title} — foto ${i + 1}`, order: i });
      }
      continue;
    }
    try {
      await downloadBinary(imageUrls[i], localPath);
      localImages.push({ url: publicUrl, alt: `${title} — foto ${i + 1}`, order: i });
    } catch (e) {
      console.warn(`  image ${i} failed: ${e.message}`);
    }
  }

  return {
    slug,
    name: title,
    type,
    zone,
    description: ogDesc || longDesc.slice(0, 400),
    descriptionLong: longDesc,
    sections,
    extras,
    facts,
    address: {
      street,
      city,
      province: "CO",
      zip: "22100",
    },
    details: {
      bedrooms,
      bathrooms,
      maxGuests,
      hasLakeView,
      hasWifi,
      hasAC,
      hasParking,
      hasGarden,
      hasPool,
    },
    amenities,
    images: localImages,
    pricing: {
      basePrice,
      cleaningFee: Math.max(40, Math.round(basePrice * 0.2)),
      weekendMultiplier: type === "villa" ? 1.3 : 1.2,
    },
    touristTaxRate: type === "villa" ? 4.0 : type === "studio" ? 2.5 : 3.0,
    maxTouristTaxNights: 5,
    source: {
      origin: "comolakehost.com",
      url,
      scrapedAt: new Date().toISOString(),
    },
  };
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      try {
        const r = await worker(items[idx], idx);
        if (r) results.push(r);
      } catch (e) {
        console.warn(`  [${items[idx]}] failed: ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function main() {
  console.log("[1/3] Listing property slugs...");
  const slugs = await listPropertySlugs();
  console.log(`  Found ${slugs.length} candidate slugs`);

  console.log(`[2/3] Scraping ${slugs.length} properties (concurrency ${CONCURRENCY})...`);
  const results = await runWithConcurrency(slugs, CONCURRENCY, async (slug, idx) => {
    console.log(`  [${idx + 1}/${slugs.length}] ${slug}`);
    return scrapeProperty(slug);
  });

  console.log(`[3/3] Saving ${results.length} properties to src/data/properties.json`);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, "properties.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
