#!/usr/bin/env node
// Scraper one-shot: prende UNA listing Airbnb e produce una entry PortfolioEntry
// completa in src/data/properties.json + scarica le immagini in public/images/listing/
//
// Uso: node scripts/scrape-airbnb-property.mjs <listingId> [--slug=name]

import fs from "node:fs";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "src", "data", "properties.json");
const IMG_DIR = path.join(ROOT, "public", "images", "listing");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const MAX_IMAGES = 12;

const listingId = process.argv[2];
const slugArg = process.argv.find((a) => a.startsWith("--slug="));
if (!listingId) {
  console.error("Uso: node scripts/scrape-airbnb-property.mjs <listingId> [--slug=name]");
  process.exit(1);
}

function decodeHtmlEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/\\n/g, "\n")
    .replace(/\\u(\w{4})/g, (_, c) => String.fromCharCode(parseInt(c, 16)));
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
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

function inferZone(lat, lng) {
  if (lat == null || lng == null) return "centro-como";
  if (lat > 45.95) return "secondo-bacino";
  if (lat > 45.85) return "primo-bacino";
  if (lat > 45.75 && lng < 9.12) return "centro-como";
  return "primo-bacino";
}

function inferType(title, descriptor) {
  const all = `${title} ${descriptor || ""}`.toLowerCase();
  if (/\bvilla\b/.test(all)) return "villa";
  if (/\bloft\b|\bstudio\b|\bmonolocale\b/.test(all)) return "studio";
  if (/\bcondo\b|appartamento|apartment|condominio/.test(all)) return "apartment";
  if (/\bcasa\b|\bhouse\b/.test(all)) return "house";
  return "apartment";
}

function inferAmenitiesFromHtml(html) {
  const amenities = [];
  const lower = html.toLowerCase();
  if (/\"wi[\\s-]?fi\"|\"internet\"|amenity_id\":\d+,\"title\":\"Wi-?Fi\"/i.test(html)) amenities.push("WiFi");
  if (/aria condizionata|air conditioning/i.test(lower)) amenities.push("Aria condizionata");
  if (/riscaldamento|heating/i.test(lower)) amenities.push("Riscaldamento");
  if (/lavatrice|washer/i.test(lower)) amenities.push("Lavatrice");
  if (/asciugatrice|dryer/i.test(lower)) amenities.push("Asciugatrice");
  if (/lavastoviglie|dishwasher/i.test(lower)) amenities.push("Lavastoviglie");
  if (/cucina|kitchen/i.test(lower)) amenities.push("Cucina attrezzata");
  if (/tv|televis/i.test(lower)) amenities.push("Smart TV");
  if (/parcheggio|parking/i.test(lower)) amenities.push("Parcheggio");
  if (/terrazz|balcone|balcony|patio/i.test(lower)) amenities.push("Terrazza");
  if (/giardino|garden/i.test(lower)) amenities.push("Giardino");
  if (/piscina|pool/i.test(lower)) amenities.push("Piscina");
  if (/vista lago|lake view|sul lago/i.test(lower)) amenities.push("Vista lago");
  if (/ascensore|elevator/i.test(lower) && !/senza ascensore|no elevator/i.test(lower)) amenities.push("Ascensore");
  return Array.from(new Set(amenities));
}

function extractListingData(html) {
  const titleRaw = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const title = titleRaw?.split(/\s*-\s*Airbnb/i)[0]?.trim() || null;

  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/)?.[1];
  const longDesc = html.match(/"description":"((?:[^"\\]|\\.)*?)"/)?.[1];

  // Coordinate
  const coords = html.match(/"lat":([-\d.]+),"lng":([-\d.]+)/) ||
    html.match(/"latitude":([-\d.]+),"longitude":([-\d.]+)/);
  const lat = coords ? parseFloat(coords[1]) : null;
  const lng = coords ? parseFloat(coords[2]) : null;

  // Capacity
  const personCapacity = parseInt(
    html.match(/"personCapacity":(\d+)/)?.[1] ||
      html.match(/"maxGuestCapacity":(\d+)/)?.[1] ||
      "0",
    10
  ) || null;

  // Bedrooms / beds / baths — italian and english variants
  // Examples: "1 camera", "2 letti", "1 bagno"; "2 bedrooms · 2 beds · 1 private bath"
  const bedroomsMatch = html.match(/(\d+)\s*camer[ae]\b/i) ||
    html.match(/"text":"[^"]*?(?:[·•]\s*)?(\d+)\s*bedrooms?\b/i);
  const bedsMatch = html.match(/(\d+)\s*lett[oi]\b/i) ||
    html.match(/"text":"[^"]*?(\d+)\s*beds?\b/i);
  const bathMatch = html.match(/(\d+(?:[.,]\d+)?)\s*bagn[oi]\b/i) ||
    html.match(/"text":"[^"]*?(\d+(?:\.\d+)?)\s*(?:private\s+)?baths?\b/i);
  const studioMatch = html.match(/\bstudio\b|\bmonolocale\b/i);

  let bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : null;
  if (bedrooms === null && studioMatch) bedrooms = 0;
  const beds = bedsMatch ? parseInt(bedsMatch[1], 10) : null;
  const bathrooms = bathMatch ? parseFloat(String(bathMatch[1]).replace(",", ".")) : null;
  const descriptorFull = bedrooms != null
    ? `${bedrooms} ${bedrooms === 1 ? "camera" : "camere"}${beds ? " · " + beds + " " + (beds === 1 ? "letto" : "letti") : ""}${bathrooms ? " · " + bathrooms + " " + (bathrooms === 1 ? "bagno" : "bagni") : ""}`
    : null;

  // Rating + reviews (Airbnb usa "reviewCount" senza 's')
  const rating =
    parseFloat(html.match(/"starRating":([\d.]+)/)?.[1]) ||
    parseFloat(html.match(/"guestSatisfactionOverall":([\d.]+)/)?.[1]) ||
    parseFloat(html.match(/"avgRating":([\d.]+)/)?.[1]) ||
    null;
  const reviewCount = parseInt(
    html.match(/"reviewCount":(\d+)/)?.[1] ||
      html.match(/"reviewsCount":(\d+)/)?.[1] ||
      html.match(/"visibleReviewCount":(\d+)/)?.[1] ||
      "",
    10
  ) || null;

  // Pictures
  const pics = new Set();
  for (const m of html.matchAll(/(https:\\?\/\\?\/a0\.muscache\.com\/im\/[^"\\]+\.(?:jpe?g|png|webp))/g)) {
    let url = m[1].replace(/\\\//g, "/").split("?")[0];
    if (/policy=/i.test(url)) continue;
    pics.add(url);
  }
  const pictureUrls = [...pics].slice(0, MAX_IMAGES);

  // City from address-related fields
  const city =
    html.match(/"city":"([^"]+)"/)?.[1] ||
    html.match(/"localizedCityName":"([^"]+)"/)?.[1] ||
    "Como";

  // Price (might not be visible without dates)
  const priceMatch = html.match(/"price":\{[^}]*"amount":(\d+)/) ||
    html.match(/"amount":(\d+),[^}]*"currency":"EUR"/);
  const nightlyPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  return {
    title,
    ogDesc: ogDesc ? decodeHtmlEntities(ogDesc) : null,
    longDesc: longDesc ? decodeHtmlEntities(longDesc).slice(0, 3000) : null,
    descriptorFull: descriptorFull ? decodeHtmlEntities(descriptorFull[1]) : null,
    lat,
    lng,
    personCapacity,
    bedrooms,
    beds,
    bathrooms,
    rating,
    reviewCount,
    nightlyPrice,
    pictureUrls,
    city,
  };
}

async function main() {
  const url = `https://www.airbnb.it/rooms/${listingId}`;
  console.log(`Fetching ${url}...`);
  const html = await fetchText(url);
  console.log(`Got ${html.length} bytes.`);

  const data = extractListingData(html);
  if (!data.title) {
    console.error("Failed to extract title — HTML structure changed?");
    process.exit(1);
  }

  console.log("Extracted:");
  console.log(" title:", data.title);
  console.log(" descriptor:", data.descriptorFull?.slice(0, 100));
  console.log(" coords:", data.lat, data.lng);
  console.log(" capacity:", data.personCapacity, "guests");
  console.log(" bedrooms:", data.bedrooms, "beds:", data.beds, "baths:", data.bathrooms);
  console.log(" rating:", data.rating, `(${data.reviewCount} reviews)`);
  console.log(" pictures:", data.pictureUrls.length);

  // Pulizia titolo: "Casa di Miriam - Appartamenti in affitto a Como, Lombardia, Italia" → "Casa di Miriam"
  // Pulizia: rimuove tutto a partire da "- Appartamenti...", "- Condomini...", "- Vacation...", ecc.
  const cleanTitle = data.title
    .replace(/\s*[-–]\s*(?:Appartament|Condomin|Loft|Villa|Stanze?|Suite|Camere?|Casa|Vacation|Holiday|Rental|Apartment|Condo)\w*\b.*$/i, "")
    .trim();
  const slug = slugArg ? slugArg.split("=")[1] : slugify(cleanTitle);
  console.log(" cleanTitle:", cleanTitle);
  console.log(" slug:", slug);

  // Download images
  const localImages = [];
  console.log(`\nDownloading ${data.pictureUrls.length} images...`);
  for (let i = 0; i < data.pictureUrls.length; i++) {
    const picUrl = data.pictureUrls[i];
    const ext = (picUrl.match(/\.(jpe?g|png|webp)$/i)?.[1] || "jpg").toLowerCase();
    const localPath = path.join(IMG_DIR, slug, `${i}.${ext}`);
    try {
      await downloadBinary(picUrl, localPath);
      localImages.push({
        url: `/images/listing/${slug}/${i}.${ext}`,
        alt: `${data.title} — foto ${i + 1}`,
        order: i,
      });
      process.stdout.write(`  [${i + 1}/${data.pictureUrls.length}]\r`);
    } catch (e) {
      console.warn(`\n  image ${i} failed: ${e.message}`);
    }
  }
  console.log(`\n${localImages.length} images saved.`);

  // Build PortfolioEntry
  const zone = inferZone(data.lat, data.lng);
  const type = inferType(data.title, data.descriptorFull);
  const amenities = inferAmenitiesFromHtml(html);
  const isStudio = (data.bedrooms ?? -1) === 0;

  const description =
    data.ogDesc ||
    (data.longDesc ? data.longDesc.slice(0, 400) : `Proprieta gestita da Host Como sul Lago di Como.`);

  const entry = {
    slug,
    name: cleanTitle,
    type,
    zone,
    description,
    descriptionLong: data.longDesc || description,
    sections: data.longDesc
      ? { space: data.longDesc.slice(0, 2500) }
      : {},
    extras: [],
    facts: {
      ...(data.beds && { beds: `${data.beds} letti` }),
    },
    address: {
      street: "",
      city: data.city,
      province: "CO",
      zip: "22100",
    },
    details: {
      bedrooms: data.bedrooms ?? (isStudio ? 0 : 1),
      bathrooms: data.bathrooms ?? 1,
      maxGuests: data.personCapacity ?? 2,
      hasLakeView: amenities.includes("Vista lago"),
      hasWifi: amenities.includes("WiFi"),
      hasAC: amenities.includes("Aria condizionata"),
      hasParking: amenities.includes("Parcheggio"),
      hasGarden: amenities.includes("Giardino"),
      hasPool: amenities.includes("Piscina"),
    },
    amenities,
    images: localImages,
    pricing: {
      basePrice: data.nightlyPrice ?? 180,
      cleaningFee: Math.max(50, Math.round((data.nightlyPrice ?? 180) * 0.2)),
      weekendMultiplier: 1.25,
    },
    touristTaxRate: 3,
    maxTouristTaxNights: 5,
    geo: data.lat != null && data.lng != null ? {
      lat: data.lat,
      lng: data.lng,
      displayName: `${data.city}, Italia`,
    } : undefined,
    source: {
      origin: "airbnb.it",
      url,
      listingId,
      scrapedAt: new Date().toISOString(),
    },
    airbnbListing: {
      id: listingId,
      url,
      rating: data.rating,
      reviewCount: data.reviewCount,
    },
  };

  // Save
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify([entry], null, 2));
  console.log(`\nSaved 1 entry to src/data/properties.json (slug: ${slug})`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
