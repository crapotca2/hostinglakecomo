#!/usr/bin/env node
// Arricchimento OSM: per ogni proprieta nel portfolio aggiunge lat/lng,
// POI vicini (ristoranti, fermate, negozi, attrazioni) e distanze da landmark chiave.
//
// Usa Nominatim per geocoding e Overpass API per i POI.
// Rate limit: 1 richiesta/secondo per Nominatim (policy di fair use).
//
// Uso: node scripts/enrich-osm.mjs [--limit N]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "src", "data", "properties.json");

const UA = "AirBibby/1.0 (portfolio enrichment; contact: actopark@gmail.com)";
const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split("=")[1], 10) : null;
const NOMINATIM_DELAY_MS = 1100;
const OVERPASS_DELAY_MS = 1500;
const POI_RADIUS_M = 800;

// Landmark per calcolare distanze
const LANDMARKS = {
  comoDuomo: { lat: 45.810829, lng: 9.083313 },
  piazzaCavour: { lat: 45.812361, lng: 9.083589 },
  bellagio: { lat: 45.986111, lng: 9.262778 },
  varenna: { lat: 46.010278, lng: 9.282222 },
  menaggio: { lat: 46.023611, lng: 9.241944 },
  cernobbio: { lat: 45.838333, lng: 9.077778 },
};

// Distanza Haversine in metri
function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function nominatimGeocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const hit = data[0];
  return {
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    displayName: hit.display_name,
    osmType: hit.osm_type,
    osmId: hit.osm_id,
  };
}

function overpassQuery(lat, lng, radius) {
  return `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lng})[amenity~"^(restaurant|bar|cafe|pub|fast_food|ice_cream|pharmacy|supermarket|bank|atm|hospital)$"];
  node(around:${radius},${lat},${lng})[shop~"^(supermarket|bakery|convenience|greengrocer|deli)$"];
  node(around:${radius},${lat},${lng})[public_transport=stop_position];
  node(around:${radius},${lat},${lng})[highway=bus_stop];
  node(around:${radius},${lat},${lng})[railway=station];
  node(around:${radius},${lat},${lng})[tourism~"^(attraction|museum|viewpoint|gallery)$"];
  node(around:${radius},${lat},${lng})[historic~"."];
  node(around:${radius},${lat},${lng})[leisure~"^(park|garden|marina)$"];
);
out body;
`.trim();
}

async function overpassFetch(lat, lng, radius) {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "data=" + encodeURIComponent(overpassQuery(lat, lng, radius)),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();
  return data.elements || [];
}

function classifyPoi(el) {
  const tags = el.tags || {};
  if (tags.public_transport === "stop_position" || tags.highway === "bus_stop") {
    return { category: "transport", subtype: tags.highway === "bus_stop" ? "Autobus" : "Fermata", name: tags.name || tags.ref || "Fermata" };
  }
  if (tags.railway === "station") {
    return { category: "transport", subtype: "Stazione", name: tags.name || "Stazione" };
  }
  if (tags.amenity === "restaurant" || tags.amenity === "pub") {
    return { category: "food", subtype: "Ristorante", name: tags.name };
  }
  if (tags.amenity === "cafe" || tags.amenity === "bar") {
    return { category: "food", subtype: tags.amenity === "cafe" ? "Caffe" : "Bar", name: tags.name };
  }
  if (tags.amenity === "ice_cream") {
    return { category: "food", subtype: "Gelateria", name: tags.name };
  }
  if (tags.amenity === "fast_food") {
    return { category: "food", subtype: "Fast food", name: tags.name };
  }
  if (tags.amenity === "supermarket" || tags.shop === "supermarket") {
    return { category: "shop", subtype: "Supermercato", name: tags.name };
  }
  if (tags.amenity === "pharmacy") {
    return { category: "shop", subtype: "Farmacia", name: tags.name };
  }
  if (tags.amenity === "bank" || tags.amenity === "atm") {
    return { category: "shop", subtype: "Banca/Bancomat", name: tags.name };
  }
  if (tags.amenity === "hospital") {
    return { category: "shop", subtype: "Ospedale", name: tags.name };
  }
  if (tags.shop === "bakery") return { category: "shop", subtype: "Panetteria", name: tags.name };
  if (tags.shop === "greengrocer") return { category: "shop", subtype: "Frutta e verdura", name: tags.name };
  if (tags.shop === "convenience") return { category: "shop", subtype: "Alimentari", name: tags.name };
  if (tags.shop === "deli") return { category: "shop", subtype: "Gastronomia", name: tags.name };
  if (tags.tourism === "attraction" || tags.tourism === "museum" || tags.tourism === "gallery") {
    return { category: "attraction", subtype: tags.tourism === "museum" ? "Museo" : "Attrazione", name: tags.name };
  }
  if (tags.tourism === "viewpoint") return { category: "attraction", subtype: "Punto panoramico", name: tags.name };
  if (tags.historic) return { category: "attraction", subtype: "Storico", name: tags.name };
  if (tags.leisure === "park") return { category: "attraction", subtype: "Parco", name: tags.name };
  if (tags.leisure === "garden") return { category: "attraction", subtype: "Giardino", name: tags.name };
  if (tags.leisure === "marina") return { category: "transport", subtype: "Porto", name: tags.name };
  return null;
}

async function enrichOne(property) {
  const query = [
    property.address.street,
    property.address.city,
    property.address.province,
    "Italia",
  ]
    .filter(Boolean)
    .join(", ");

  let geo = null;
  try {
    geo = await nominatimGeocode(query);
  } catch (e) {
    console.warn(`  geocode error: ${e.message}`);
  }

  if (!geo) {
    // Fallback: solo citta
    try {
      geo = await nominatimGeocode(`${property.address.city}, ${property.address.province}, Italia`);
    } catch (e) {
      console.warn(`  fallback geocode error: ${e.message}`);
    }
  }

  if (!geo) return null;

  await sleep(NOMINATIM_DELAY_MS);

  let poiElements = [];
  try {
    poiElements = await overpassFetch(geo.lat, geo.lng, POI_RADIUS_M);
  } catch (e) {
    console.warn(`  overpass error: ${e.message}`);
  }

  const grouped = { food: [], transport: [], shop: [], attraction: [] };
  for (const el of poiElements) {
    const c = classifyPoi(el);
    if (!c || !c.name) continue;
    const d = distanceM(geo.lat, geo.lng, el.lat, el.lon);
    grouped[c.category].push({
      name: c.name,
      subtype: c.subtype,
      distance: d,
    });
  }

  for (const k of Object.keys(grouped)) {
    grouped[k].sort((a, b) => a.distance - b.distance);
    grouped[k] = grouped[k].slice(0, 8);
  }

  const distances = {};
  for (const [key, lm] of Object.entries(LANDMARKS)) {
    distances[key] = distanceM(geo.lat, geo.lng, lm.lat, lm.lng);
  }

  const nearestFood = grouped.food[0]?.distance ?? null;
  const nearestTransport = grouped.transport[0]?.distance ?? null;
  const nearestShop = grouped.shop[0]?.distance ?? null;
  const nearestAttraction = grouped.attraction[0]?.distance ?? null;

  await sleep(OVERPASS_DELAY_MS);

  return {
    geo: {
      lat: geo.lat,
      lng: geo.lng,
      displayName: geo.displayName,
    },
    nearby: grouped,
    distances: {
      ...distances,
      nearestFood,
      nearestTransport,
      nearestShop,
      nearestAttraction,
    },
    enrichedAt: new Date().toISOString(),
  };
}

async function main() {
  const portfolio = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const todo = portfolio.filter((p) => !p.geo || !p.nearby);
  const targets = LIMIT ? todo.slice(0, LIMIT) : todo;

  console.log(`Portfolio: ${portfolio.length} total, ${todo.length} need enrichment, ${targets.length} target this run`);

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${p.slug} (${p.address.city})`);
    try {
      const enrichment = await enrichOne(p);
      if (enrichment) {
        const idx = portfolio.findIndex((x) => x.slug === p.slug);
        portfolio[idx] = { ...portfolio[idx], ...enrichment };
        fs.writeFileSync(DATA_PATH, JSON.stringify(portfolio, null, 2));
        const g = enrichment.geo;
        const stats = enrichment.nearby;
        console.log(
          `  ${g.lat.toFixed(5)}, ${g.lng.toFixed(5)} | food=${stats.food.length} transport=${stats.transport.length} shop=${stats.shop.length} attraction=${stats.attraction.length}`
        );
      } else {
        console.log(`  SKIP (no geocode)`);
      }
    } catch (e) {
      console.warn(`  ERROR: ${e.message}`);
    }
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
