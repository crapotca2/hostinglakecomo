// Deterministic test suite per il pricing engine.
//
// Eseguibile con: npx tsx scripts/test-pricing.ts
//
// I test sono PURE: non toccano Mongo. Costruiscono PricingContext finto e
// verificano che suggestPrice produca output coerenti con le decisioni di
// prodotto. Ogni test è una stanza isolata con assertions Node.

import assert from "node:assert/strict";
import { suggestPrice } from "../src/lib/pricing/engine";
import type {
  PricingContext,
  PricingPropertyConfig,
  PricingSignals,
} from "../src/lib/pricing/types";

let passed = 0;
let failed = 0;
const failures: { name: string; error: string }[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    failures.push({
      name,
      error: err instanceof Error ? err.message : String(err),
    });
    console.log(`  ✗ ${name}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

// Helpers
const AQUA_VISTA_CONFIG: PricingPropertyConfig = {
  propertyId: "aqua-vista",
  zone: "argegno",
  bedrooms: 2,
  maxGuests: 4,
  hasLakeView: true,
  coordinates: { lat: 45.9443, lng: 9.1288 },
  basePriceFloor: 140,
  baseGuests: 2,
  extraPerGuest: 25,
  competitorAnchorPercentile: 0.55,
  hardMinStay: 3,
  maxCounterCyclicalDiscount: 0.15,
  enabledModulators: {
    season: true,
    dayOfWeek: true,
    competitorAnchor: true,
    leadTime: true,
    events: true,
    weather: false,
  },
};

const EMPTY_SIGNALS: PricingSignals = {
  competitorZone: null,
  competitorTrend7d: null,
  ourOccupancyForward30d: undefined,
  activeEvents: [],
  weatherForecast: null,
};

function ctx(
  overrides: Partial<PricingContext> & { targetDate: Date; guests: number },
): PricingContext {
  return {
    property: AQUA_VISTA_CONFIG,
    asOf: new Date("2026-05-01T10:00:00Z"),
    signals: EMPTY_SIGNALS,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────
section("Floor & input validation");

test("guests < 1 → throw", () => {
  assert.throws(() =>
    suggestPrice(
      ctx({
        targetDate: new Date("2026-07-15"),
        guests: 0,
      }),
    ),
  );
});

test("guests > maxGuests → capped a maxGuests + warning", () => {
  const d = suggestPrice(
    ctx({
      targetDate: new Date("2026-07-15"),
      guests: 99,
    }),
  );
  assert.equal(d.guests, 4);
  assert.ok(d.warnings.some((w) => w.includes("capped")));
});

test("basePriceFloor <= 0 → throw", () => {
  assert.throws(() =>
    suggestPrice(
      ctx({
        property: { ...AQUA_VISTA_CONFIG, basePriceFloor: 0 },
        targetDate: new Date("2026-07-15"),
        guests: 2,
      }),
    ),
  );
});

// ─────────────────────────────────────────────────────────────────────────
section("M1 Season — curva mensile");

test("Gennaio (off-peak) → moltiplicatore 0.55", () => {
  const d = suggestPrice(
    ctx({ targetDate: new Date("2026-01-13"), guests: 2 }),
  );
  // 140 * 0.55 = 77, ma poi anche dow martedì = neutro → 77
  // (lead-time non si applica perché asOf=2026-05-01 quindi targetDate è nel passato)
  // Cambiamo asOf:
  const d2 = suggestPrice(
    ctx({
      asOf: new Date("2025-11-01"),
      targetDate: new Date("2026-01-13"), // martedì
      guests: 2,
    }),
  );
  // 140 * 0.55 = 77, dow martedì ×1.0 → 77, lead 73gg = "early" ×0.98 → 75.46 ≈ 75
  assert.ok(d2.suggestedPrice >= 73 && d2.suggestedPrice <= 80,
    `Expected 73-80, got ${d2.suggestedPrice}`);
});

test("Agosto (peak) → moltiplicatore 2.10", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"), // martedì
      guests: 2,
    }),
  );
  // 140 * 2.10 = 294, dow martedì = ×1.0 → 294, lead 95gg = "early" ×0.98 = 288
  assert.ok(d.suggestedPrice >= 280 && d.suggestedPrice <= 300,
    `Expected 280-300, got ${d.suggestedPrice}`);
});

// ─────────────────────────────────────────────────────────────────────────
section("M2 Day of week");

test("Sabato Agosto > Martedì stessa settimana", () => {
  const tue = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
    }),
  );
  const sat = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-08"),
      guests: 2,
    }),
  );
  assert.ok(sat.suggestedPrice > tue.suggestedPrice * 1.20,
    `Sat ${sat.suggestedPrice} should be >> Tue ${tue.suggestedPrice} * 1.20`);
});

// ─────────────────────────────────────────────────────────────────────────
section("Guest multiplier — base + extra*n con floor a 2");

test("1 ospite = 2 ospiti (floor a 2)", () => {
  const d1 = suggestPrice(
    ctx({ asOf: new Date("2026-05-01"), targetDate: new Date("2026-08-04"), guests: 1 }),
  );
  const d2 = suggestPrice(
    ctx({ asOf: new Date("2026-05-01"), targetDate: new Date("2026-08-04"), guests: 2 }),
  );
  assert.equal(d1.suggestedPrice, d2.suggestedPrice);
});

test("3 ospiti = 2 ospiti + extraPerGuest (25)", () => {
  const d2 = suggestPrice(
    ctx({ asOf: new Date("2026-05-01"), targetDate: new Date("2026-08-04"), guests: 2 }),
  );
  const d3 = suggestPrice(
    ctx({ asOf: new Date("2026-05-01"), targetDate: new Date("2026-08-04"), guests: 3 }),
  );
  assert.equal(d3.suggestedPrice, d2.suggestedPrice + 25);
});

test("4 ospiti = 2 ospiti + 2*extraPerGuest (50)", () => {
  const d2 = suggestPrice(
    ctx({ asOf: new Date("2026-05-01"), targetDate: new Date("2026-08-04"), guests: 2 }),
  );
  const d4 = suggestPrice(
    ctx({ asOf: new Date("2026-05-01"), targetDate: new Date("2026-08-04"), guests: 4 }),
  );
  assert.equal(d4.suggestedPrice, d2.suggestedPrice + 50);
});

// ─────────────────────────────────────────────────────────────────────────
section("M4 Lead time");

test("Same-day (lead=0) → discount urgentissimo", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-08-04"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
    }),
  );
  // multiplier 0.90 sul prezzo
  // 140 * 2.10 * 1.0 (martedì) * 0.90 = 264.6 ≈ 265
  assert.ok(d.suggestedPrice >= 255 && d.suggestedPrice <= 275,
    `Expected 255-275, got ${d.suggestedPrice}`);
});

test("Sweet spot 45gg → no modifier", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-06-20"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
    }),
  );
  // 140 * 2.10 * 1.0 = 294
  assert.ok(d.suggestedPrice >= 285 && d.suggestedPrice <= 300);
});

// ─────────────────────────────────────────────────────────────────────────
section("M3 Competitor anchor");

test("Mediana zona molto sopra il floor → multiplier > 1", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        competitorZone: {
          monthKey: "2026-08",
          occupancyMedian: 0.85,
          occupancyP25: 0.70,
          occupancyP75: 0.95,
          adrMedian: 400, // mediana molto alta
          sampleSize: 40,
        },
      },
    }),
  );
  const dWithoutAnchor = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: EMPTY_SIGNALS,
    }),
  );
  assert.ok(d.suggestedPrice > dWithoutAnchor.suggestedPrice,
    `With high competitor ADR (${d.suggestedPrice}) should exceed without anchor (${dWithoutAnchor.suggestedPrice})`);
});

test("Sample basso (<8) → anchor disattivato + warning", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        competitorZone: {
          monthKey: "2026-08",
          occupancyMedian: 0.85,
          occupancyP25: 0.70,
          occupancyP75: 0.95,
          adrMedian: 800,
          sampleSize: 3, // troppo basso
        },
      },
    }),
  );
  assert.ok(d.warnings.some((w) => w.toLowerCase().includes("sample")));
});

// ─────────────────────────────────────────────────────────────────────────
section("M5 Events");

test("Concorso Villa d'Este +35% per property entro 8km", () => {
  const event = {
    _id: undefined as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Concorso d'Eleganza Villa d'Este",
    category: "luxury" as const,
    startDate: new Date("2026-05-22"),
    endDate: new Date("2026-05-24"),
    geo: { lat: 45.8403, lng: 9.0936 }, // Cernobbio
    radiusKm: 15,
    priceMultiplier: 1.35,
    active: true,
  };
  // Aqua Vista a Argegno (45.94, 9.13) — distanza da Cernobbio ~12km → IN
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-04-01"),
      targetDate: new Date("2026-05-23"),
      guests: 2,
      signals: { ...EMPTY_SIGNALS, activeEvents: [event] },
    }),
  );
  const dNoEvent = suggestPrice(
    ctx({
      asOf: new Date("2026-04-01"),
      targetDate: new Date("2026-05-23"),
      guests: 2,
    }),
  );
  assert.ok(d.suggestedPrice > dNoEvent.suggestedPrice * 1.25,
    `Event ${d.suggestedPrice} should be >25% above no-event ${dNoEvent.suggestedPrice}`);
});

test("Evento con radius=3km NON applicato a property lontana 12km", () => {
  const event = {
    _id: undefined as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Festa locale Cernobbio",
    category: "cultural" as const,
    startDate: new Date("2026-05-22"),
    endDate: new Date("2026-05-24"),
    geo: { lat: 45.8403, lng: 9.0936 },
    radiusKm: 3,
    priceMultiplier: 1.20,
    active: true,
  };
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-04-01"),
      targetDate: new Date("2026-05-23"),
      guests: 2,
      signals: { ...EMPTY_SIGNALS, activeEvents: [event] },
    }),
  );
  const dNoEvent = suggestPrice(
    ctx({
      asOf: new Date("2026-04-01"),
      targetDate: new Date("2026-05-23"),
      guests: 2,
    }),
  );
  assert.equal(d.suggestedPrice, dNoEvent.suggestedPrice);
});

// ─────────────────────────────────────────────────────────────────────────
section("Layer 3 — Counter-cyclical");

test("Zona alta + noi bassi → discount cap (-15%)", () => {
  const baseline = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        ourOccupancyForward30d: 0.55, // medio-bassa ma no trigger
        competitorZone: {
          monthKey: "2026-08",
          occupancyMedian: 0.75,
          occupancyP25: 0.65,
          occupancyP75: 0.85,
          sampleSize: 30,
        },
      },
    }),
  );
  const cc = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        ourOccupancyForward30d: 0.30, // trigger basso
        competitorZone: {
          monthKey: "2026-08",
          occupancyMedian: 0.75,
          occupancyP25: 0.65,
          occupancyP75: 0.85,
          sampleSize: 30,
        },
      },
    }),
  );
  assert.ok(cc.appliedStrategicRules.some((r) => r.name === "counter-cyclical-discount"));
  assert.ok(cc.suggestedPrice < baseline.suggestedPrice);
});

test("Zona bassa + noi alti → premium leggero", () => {
  const cc = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        ourOccupancyForward30d: 0.80,
        competitorZone: {
          monthKey: "2026-08",
          occupancyMedian: 0.35,
          occupancyP25: 0.20,
          occupancyP75: 0.50,
          sampleSize: 30,
        },
      },
    }),
  );
  assert.ok(cc.appliedStrategicRules.some((r) => r.name === "counter-cyclical-premium"));
});

// ─────────────────────────────────────────────────────────────────────────
section("Layer 3 — Last-minute strategic");

test("Last-minute (<7gg) + nostra occupancy bassa → burn -10%", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-07-31"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        ourOccupancyForward30d: 0.30,
      },
    }),
  );
  assert.ok(d.appliedStrategicRules.some((r) => r.name === "last-minute-burn"));
});

test("Last-minute (<7gg) + nostra occupancy alta → premium +8%", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-07-31"),
      targetDate: new Date("2026-08-04"),
      guests: 2,
      signals: {
        ...EMPTY_SIGNALS,
        ourOccupancyForward30d: 0.90,
      },
    }),
  );
  assert.ok(d.appliedStrategicRules.some((r) => r.name === "last-minute-premium"));
});

// ─────────────────────────────────────────────────────────────────────────
section("Hard min stay (decisione prodotto: 3)");

test("enforcedMinStay sempre = property.hardMinStay (default 3)", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-01-13"), // gennaio, off-peak
      guests: 2,
    }),
  );
  assert.equal(d.enforcedMinStay, 3);
});

// ─────────────────────────────────────────────────────────────────────────
section("Determinismo");

test("Stessi input → stesso output (eccetto computedAt)", () => {
  const args = {
    asOf: new Date("2026-05-01"),
    targetDate: new Date("2026-08-04"),
    guests: 3,
  };
  const d1 = suggestPrice(ctx(args));
  const d2 = suggestPrice(ctx(args));
  assert.equal(d1.suggestedPrice, d2.suggestedPrice);
  assert.equal(d1.enforcedMinStay, d2.enforcedMinStay);
  assert.deepEqual(
    d1.breakdown.map((s) => [s.name, s.value]),
    d2.breakdown.map((s) => [s.name, s.value]),
  );
});

// ─────────────────────────────────────────────────────────────────────────
section("Smoke — esempio reale Aqua Vista 4 ospiti, weekend Ferragosto");

test("Aqua Vista, sabato 15 Ago 2026, 4 ospiti", () => {
  const d = suggestPrice(
    ctx({
      asOf: new Date("2026-05-01"),
      targetDate: new Date("2026-08-15"), // sabato Ferragosto
      guests: 4,
      signals: {
        ...EMPTY_SIGNALS,
        competitorZone: {
          monthKey: "2026-08",
          occupancyMedian: 0.85,
          occupancyP25: 0.70,
          occupancyP75: 0.95,
          adrMedian: 280,
          sampleSize: 35,
        },
      },
    }),
  );
  console.log(`    → Suggested: €${d.suggestedPrice}/notte`);
  console.log(`    → Breakdown: ${d.breakdown.map((s) => `${s.name}=${typeof s.value === "number" ? s.value.toFixed(2) : s.value}`).join(" · ")}`);
  console.log(`    → Min stay: ${d.enforcedMinStay} notti`);
  // Realistic range: 380-500 per Ferragosto weekend con 4 ospiti
  assert.ok(d.suggestedPrice >= 380 && d.suggestedPrice <= 520,
    `Expected 380-520, got ${d.suggestedPrice}`);
});

// ─────────────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  - ${f.name}: ${f.error}`);
  }
  process.exit(1);
}
process.exit(0);
