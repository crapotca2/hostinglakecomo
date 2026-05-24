// Pricing engine — type contracts.
//
// Tutte le funzioni del motore sono pure: prendono un PricingContext (input)
// e ritornano una PricingDecision (output). Niente fetch al DB dentro le
// pure functions: i signals sono caricati esternamente e passati nel context.
// Questo rende l'engine deterministico, testabile, e indipendente da Mongo.

import type {
  CompetitorZone,
  EventDoc,
  WeatherBucket,
} from "../../types/database";

/**
 * Configurazione della singola property: ciò che NON cambia per data.
 * Caricata una volta da PricingRuleDoc + PropertyDoc.
 */
export interface PricingPropertyConfig {
  propertyId: string;
  zone: CompetitorZone;
  bedrooms: number;
  maxGuests: number;
  hasLakeView: boolean;
  coordinates?: { lat: number; lng: number };

  // Floor del prezzo nudo per la coppia (baseGuests ospiti). Tutto il
  // motore moltiplica/somma sopra questo. Es. 140 €/notte per Aqua Vista.
  basePriceFloor: number;
  baseGuests: number;        // di solito 2
  extraPerGuest: number;     // sovrapprezzo per ospite > baseGuests

  // Anchor competitor: percentile target sulla mediana zona.
  // 0.50 = mediana, 0.60 = p60 (premium leggero), 0.40 = aggressivo.
  competitorAnchorPercentile: number;

  // Hard min stay (notti). Decisione di prodotto: 3 notti tutto l'anno.
  hardMinStay: number;

  // Massimo sconto counter-cyclical (0.15 = -15%). 0 disattiva la regola.
  maxCounterCyclicalDiscount: number;

  // Modulatori on/off per la property (default tutti on tranne weather).
  enabledModulators: {
    season: boolean;
    dayOfWeek: boolean;
    competitorAnchor: boolean;
    leadTime: boolean;
    events: boolean;
    weather: boolean;
  };
}

/**
 * Signals caricati dal DB per UNA data specifica + property.
 * Tutto opzionale: se mancano, il modulatore relativo è no-op.
 */
export interface PricingSignals {
  // M1 + M3: aggregato competitor zona/mese (da competitorZoneStats)
  competitorZone?: {
    monthKey: string;             // "2026-07"
    occupancyMedian: number;      // 0..1
    occupancyP25: number;
    occupancyP75: number;
    adrMedian?: number;           // €/notte mediana zona
    sampleSize: number;           // n listing nel sample (per confidence)
  } | null;

  // M3 trend 7gg: cambio mediana ADR + occupancy ultimi 7gg vs precedenti 7gg.
  competitorTrend7d?: {
    adrDeltaPct: number;          // 0.10 = +10%
    occDelta: number;             // +0.05 = +5 punti occupancy
  } | null;

  // Layer 3 counter-cyclical: nostra occupancy forward (rolling 30gg).
  ourOccupancyForward30d?: number;  // 0..1

  // M5: eventi attivi in (targetDate ± 0gg) entro raggio della property.
  activeEvents: EventDoc[];

  // M6: meteo forecast per (zone, targetDate). Solo se targetDate <= today+14.
  weatherForecast?: {
    bucket: WeatherBucket;
    tempMaxC: number;
    precipMm: number;
  } | null;
}

/**
 * Input completo del pricing engine per UNA chiamata.
 */
export interface PricingContext {
  property: PricingPropertyConfig;
  targetDate: Date;        // notte oggetto del pricing
  guests: number;          // # ospiti richiesti
  asOf: Date;              // "now" — per calcolare lead-time e last-minute
  signals: PricingSignals;
}

/**
 * Singolo step del breakdown. Ogni modulatore contribuisce con uno step.
 */
export interface BreakdownStep {
  name: string;                          // "season" | "dow" | ...
  type: "multiplier" | "addend";
  value: number;                         // 1.6 (multiplier) o +40 (addend)
  runningTotal: number;                  // €/notte dopo questo step
  reason: string;                        // human-readable in italiano
}

/**
 * Regola del layer strategic applicata sopra il base price.
 */
export interface StrategicRuleApplication {
  name: string;                          // "counter-cyclical-discount" | ...
  delta: number;                         // -25 (€/notte) o +10
  reason: string;
}

/**
 * Output finale del motore: deterministico, riproducibile, auditabile.
 */
export interface PricingDecision {
  // Input echo (per audit)
  propertyId: string;
  targetDate: Date;
  guests: number;

  // Output principale
  suggestedPrice: number;                // €/notte arrotondato a 1€
  basePriceFloor: number;
  enforcedMinStay: number;

  // Breakdown deterministico per spiegabilità
  breakdown: BreakdownStep[];
  appliedStrategicRules: StrategicRuleApplication[];

  // Warning per il proprietario (es. "competitor sample basso", "no signals")
  warnings: string[];

  // Snapshot signals (per audit + future ML training)
  signalsSnapshot: {
    competitorMedianADR?: number;
    competitorZoneOccupancy?: number;
    ourOccupancyForward30d?: number;
    leadTimeDays: number;
    activeEventNames: string[];
    weatherBucket?: WeatherBucket;
  };

  computedAt: Date;
}
