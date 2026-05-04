#!/usr/bin/env node
// POC arricchimento Airbnb: per una lista di proprieta cerca listing vicine,
// scarica immagini, descrizione, prezzo, rating, e merge nel portfolio come
// chiave `airbnb: { ... }`.
//
// IMPORTANTE: Airbnb ToS vieta lo scraping. Questo script e' un POC di validazione
// tecnica. Uso a rischio dell'utente.
//
// Uso: node scripts/enrich-airbnb.mjs [--limit=N] [--no-images] [--slugs=a,b,c]

import fs from "node:fs";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "src", "data", "properties.json");
const IMG_DIR = path.join(ROOT, "public", "images", "airbnb");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const REQUEST_DELAY_MS = 3500;
const MAX_IMAGES_PER_LISTING = 5;

const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const SLUGS_ARG = process.argv.find((a) => a.startsWith("--slugs="));
const SKIP_IMAGES = process.argv.includes("--no-images");
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split("=")[1], 10) : 3;
const ONLY_SLUGS = SLUGS_ARG ? new Set(SLUGS_ARG.split("=")[1].split(",")) : null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function decodeHtmlEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ");
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

function parseNiobeJson(html) {
  // Airbnb embeds state in a <script id="data-deferred-state-0" type="application/json">...</script>
  const re = /<script[^>]*id=["']data-deferred-state[^"']*["'][^>]*>([\s\S]*?)<\/script>/i;
  const m = html.match(re);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function findListingIdsInSearch(html, maxIds = 8) {
  const ids = new Set();
  for (const m of html.matchAll(/"listingId":"(\d+)"/g)) {
    ids.add(m[1]);
    if (ids.size >= maxIds) break;
  }
  return [...ids];
}

// Extract {id, lat, lng} tuples from search HTML by parsing demandStayListing blocks
function findListingsWithCoordsInSearch(html, limit = 40) {
  const results = [];
  const seen = new Set();
  const re = /"demandStayListing":\{[^}]*"id":"([^"]+)"[^}]*"location":\{[^}]*"coordinate":\{[^}]*"latitude":([-\d.]+),"longitude":([-\d.]+)/g;
  for (const m of html.matchAll(re)) {
    const rawId = m[1];
    // Base64 decode: "DemandStayListing:1660923568611579799" -> pull the numeric
    let id = null;
    try {
      const decoded = Buffer.from(rawId, "base64").toString("utf8");
      const idMatch = decoded.match(/:(\d+)/);
      if (idMatch) id = idMatch[1];
    } catch {
      // fallthrough
    }
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({
      id,
      lat: parseFloat(m[2]),
      lng: parseFloat(m[3]),
    });
    if (results.length >= limit) break;
  }
  return results;
}

function slugifyCity(city) {
  // Airbnb URL format: "Como--Italy", "Cernobbio--Italy"
  return encodeURIComponent(city.replace(/\s+/g, "-")) + "--Italy";
}

function extractListingData(html) {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || null;

  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/)?.[1];

  const coords = html.match(/"lat":([-\d.]+),"lng":([-\d.]+)/);
  const lat = coords ? parseFloat(coords[1]) : null;
  const lng = coords ? parseFloat(coords[2]) : null;

  const personCapacity = parseInt(
    html.match(/"personCapacity":(\d+)/)?.[1] ||
      html.match(/"maxGuestCapacity":(\d+)/)?.[1] ||
      "0",
    10
  ) || null;

  // Airbnb espone bedrooms/beds/bath in stringhe descrittive tipo:
  // "text":"Condo in Como · ★4.96 · 2 bedrooms · 2 beds · 1 private bath"
  // oppure variante italiana "2 camere · 2 letti · 1 bagno"
  const descriptorMatch = html.match(/"text":"[^"]*?(?:[·•]\s*)(\d+)\s*(?:bedrooms?|camere)[^"]{0,80}"/i);
  const bedsMatch = html.match(/"text":"[^"]*?(\d+)\s*(?:beds?|letti)[^"]{0,80}"/i);
  const bathMatch = html.match(/"text":"[^"]*?(\d+(?:\.\d+)?)\s*(?:private\s+)?(?:baths?|bagni)[^"]{0,40}"/i);
  const studioMatch = html.match(/"text":"[^"]*?(?:studio|monolocale)[^"]{0,40}"/i);

  let bedrooms = null;
  if (descriptorMatch) {
    bedrooms = parseInt(descriptorMatch[1], 10);
  } else if (studioMatch) {
    bedrooms = 0; // studio = 0 camere separate
  }
  const beds = bedsMatch ? parseInt(bedsMatch[1], 10) : null;
  const bathrooms = bathMatch ? parseFloat(bathMatch[1]) : null;

  const ratingStr = html.match(/"starRating":([\d.]+)/)?.[1] ||
    html.match(/"guestSatisfactionOverall":([\d.]+)/)?.[1];
  const rating = ratingStr ? parseFloat(ratingStr) : null;

  const reviewCount = parseInt(
    html.match(/"reviewsCount":(\d+)/)?.[1] ||
      html.match(/"visibleReviewCount":(\d+)/)?.[1] ||
      "",
    10
  ) || null;

  // Picture URLs: many formats, pull og:image + variants
  const pictureUrls = new Set();
  for (const m of html.matchAll(/"(?:baseUrl|pictureUrl|picture)":"(https:\\?\/\\?\/a0\.muscache\.com[^"]+)"/g)) {
    pictureUrls.add(m[1].replace(/\\\//g, "/"));
  }
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/g)) {
    pictureUrls.add(m[1]);
  }
  // Clean query strings that vary by render
  const pics = [...pictureUrls].map((u) => u.split("?")[0]).filter((u, i, arr) => arr.indexOf(u) === i);

  // Price: look for priceString-like patterns
  const priceMatch = html.match(/"price":\{[^}]*"amount":(\d+)/) ||
    html.match(/"rate":\{[^}]*"amount":(\d+)/);
  const nightlyPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  return {
    title: title?.replace(/\s*-\s*Airbnb.*$/, "").trim() || null,
    description: ogDesc ? decodeHtmlEntities(ogDesc).slice(0, 800) : null,
    lat,
    lng,
    personCapacity,
    bedrooms,
    bathrooms,
    rating,
    reviewCount,
    nightlyPrice,
    beds,
    images: pics.slice(0, MAX_IMAGES_PER_LISTING),
  };
}

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function searchUrlForCity(city) {
  return `https://www.airbnb.com/s/${slugifyCity(city)}/homes`;
}

async function scrapeListing(listingId) {
  const url = `https://www.airbnb.com/rooms/${listingId}`;
  const html = await fetchText(url);
  const data = extractListingData(html);
  return { id: listingId, url, ...data };
}

const searchHtmlCache = new Map();

async function getSearchHtml(city) {
  if (searchHtmlCache.has(city)) return searchHtmlCache.get(city);
  const url = searchUrlForCity(city);
  console.log(`  search ${city}: ${url}`);
  const html = await fetchText(url);
  await sleep(REQUEST_DELAY_MS);
  searchHtmlCache.set(city, html);
  return html;
}

// Criteri di match: Airbnb offsetta le coords per privacy fino a ~300m,
// quindi raggio 400m e tolleranze moderate su capacity/bedrooms.
const MAX_DISTANCE_M = 400;
const MAX_CAPACITY_DIFF = 3;
const MAX_BEDROOM_DIFF = 2;

async function enrichProperty(property) {
  if (!property.geo) {
    console.log(`  SKIP (no geo)`);
    return null;
  }

  const city = property.address.city || "Como";
  let searchHtml;
  try {
    searchHtml = await getSearchHtml(city);
  } catch (e) {
    console.log(`  search failed: ${e.message}`);
    return null;
  }

  const listingsWithCoords = findListingsWithCoordsInSearch(searchHtml, 60);
  if (listingsWithCoords.length === 0) {
    console.log(`  no geolocated listings in city search`);
    return null;
  }

  // Rank by distance from our geo
  const ranked = listingsWithCoords
    .map((l) => ({
      ...l,
      distance: haversineM(property.geo.lat, property.geo.lng, l.lat, l.lng),
    }))
    .sort((a, b) => a.distance - b.distance);

  // Prendi tutti i candidati entro MAX_DISTANCE_M, fino a 5
  const nearCandidates = ranked.filter((l) => l.distance <= MAX_DISTANCE_M).slice(0, 5);
  if (nearCandidates.length === 0) {
    console.log(`  REJECT: no listing entro ${MAX_DISTANCE_M}m (min ${ranked[0].distance}m)`);
    return null;
  }
  console.log(
    `  ${nearCandidates.length} candidati entro ${MAX_DISTANCE_M}m: ${nearCandidates
      .map((l) => `${l.id}@${l.distance}m`)
      .join(", ")}`
  );

  const candidates = [];
  for (const c of nearCandidates) {
    try {
      const data = await scrapeListing(c.id);
      candidates.push({ ...data, searchLat: c.lat, searchLng: c.lng, searchDistance: c.distance });
    } catch (e) {
      console.log(`    listing ${c.id} failed: ${e.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  // Filtra per capacity + bedrooms; se bedrooms non disponibile, match su capacity alone
  const matching = candidates.filter((c) => {
    const capDiff = c.personCapacity ? Math.abs(c.personCapacity - property.details.maxGuests) : 99;
    const bedDiff = c.bedrooms !== null && c.bedrooms !== undefined
      ? Math.abs(c.bedrooms - property.details.bedrooms)
      : null;
    if (capDiff > MAX_CAPACITY_DIFF) return false;
    if (bedDiff !== null && bedDiff > MAX_BEDROOM_DIFF) return false;
    return true;
  });

  if (matching.length === 0) {
    console.log(
      `  REJECT: ${candidates.length} candidati ma nessuno matcha capacity/bedrooms (cerco ${property.details.maxGuests}p ${property.details.bedrooms}br)`
    );
    return null;
  }

  // Pick best match tra i matching: closest to our geo + similar capacity
  const scored = matching.map((c) => {
    const distance = c.lat && c.lng
      ? haversineM(property.geo.lat, property.geo.lng, c.lat, c.lng)
      : c.searchDistance;
    const capacityDiff = c.personCapacity
      ? Math.abs(c.personCapacity - property.details.maxGuests)
      : 3;
    const bedroomDiff = c.bedrooms !== null && c.bedrooms !== undefined
      ? Math.abs(c.bedrooms - property.details.bedrooms)
      : 2;
    const score = distance + capacityDiff * 30 + bedroomDiff * 40;
    return { ...c, distance, capacityDiff, bedroomDiff, score };
  });
  scored.sort((a, b) => a.score - b.score);
  const best = scored[0];

  // Confidence: Airbnb offsetta coords ~300m, quindi soglie adattate
  const confidence =
    best.distance < 150 && best.capacityDiff <= 1 && best.bedroomDiff <= 1
      ? "high"
      : best.distance < 300 && best.capacityDiff <= 2 && best.bedroomDiff <= 1
      ? "medium"
      : "low";

  const airbnbImages = [];
  // Scarica immagini SOLO per match medium/high (match low = probabile listing sbagliata)
  const shouldDownloadImages = !SKIP_IMAGES && confidence !== "low" && best.images?.length;
  if (shouldDownloadImages) {
    for (let i = 0; i < best.images.length; i++) {
      const url = best.images[i];
      const ext = (url.match(/\.(jpe?g|png|webp)/i)?.[1] || "jpg").toLowerCase();
      const destPath = path.join(IMG_DIR, property.slug, `${i}.${ext}`);
      try {
        await downloadBinary(url, destPath);
        airbnbImages.push({
          url: `/images/airbnb/${property.slug}/${i}.${ext}`,
          alt: `${best.title} — foto ${i + 1}`,
          order: i,
        });
      } catch (e) {
        console.log(`    image ${i} failed: ${e.message}`);
      }
    }
  }

  const marketPrice = scored
    .map((c) => c.nightlyPrice)
    .filter((p) => p && p > 20);
  const avgPrice = marketPrice.length
    ? Math.round(marketPrice.reduce((a, b) => a + b) / marketPrice.length)
    : null;

  return {
    airbnb: {
      bestMatch: {
        id: best.id,
        url: best.url,
        title: best.title,
        description: best.description,
        rating: best.rating,
        reviewCount: best.reviewCount,
        personCapacity: best.personCapacity,
        bedrooms: best.bedrooms,
        bathrooms: best.bathrooms,
        nightlyPrice: best.nightlyPrice,
        distanceFromOurGeo: best.distance,
        capacityDiff: best.capacityDiff,
        bedroomDiff: best.bedroomDiff,
        confidence,
      },
      marketContext: {
        sampleSize: candidates.length,
        avgNightlyPrice: avgPrice,
        minNightlyPrice: marketPrice.length ? Math.min(...marketPrice) : null,
        maxNightlyPrice: marketPrice.length ? Math.max(...marketPrice) : null,
        avgRating: (() => {
          const ratings = candidates.map((c) => c.rating).filter(Boolean);
          return ratings.length
            ? parseFloat((ratings.reduce((a, b) => a + b) / ratings.length).toFixed(2))
            : null;
        })(),
      },
      images: airbnbImages,
      enrichedAt: new Date().toISOString(),
    },
  };
}

async function main() {
  const portfolio = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  let targets = portfolio.filter((p) => p.geo && !p.airbnb);
  if (ONLY_SLUGS) targets = portfolio.filter((p) => ONLY_SLUGS.has(p.slug));
  if (LIMIT) targets = targets.slice(0, LIMIT);

  console.log(`Target: ${targets.length} properties`);
  console.log(`Rate limit: ${REQUEST_DELAY_MS}ms between requests`);
  console.log(`Images: ${SKIP_IMAGES ? "SKIP" : "download up to " + MAX_IMAGES_PER_LISTING + " per listing"}`);
  console.log("");

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${p.slug} (${p.address.city}, ${p.details.maxGuests} guests)`);
    try {
      const enrichment = await enrichProperty(p);
      if (enrichment) {
        const idx = portfolio.findIndex((x) => x.slug === p.slug);
        portfolio[idx] = { ...portfolio[idx], ...enrichment };
        fs.writeFileSync(DATA_PATH, JSON.stringify(portfolio, null, 2));
        const m = enrichment.airbnb.bestMatch;
        console.log(
          `  BEST: "${m.title}" | ${m.distanceFromOurGeo}m | ${m.personCapacity}p | rating ${m.rating ?? "-"} (${m.reviewCount ?? "-"} rev) | ${m.confidence} confidence`
        );
      }
    } catch (e) {
      console.warn(`  ERROR: ${e.message}`);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
