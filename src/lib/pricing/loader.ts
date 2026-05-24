// Loader — Mongo I/O per popolare PricingContext.
//
// Separato dall'engine (engine.ts) perché:
//  - tiene engine pure / deterministico / unit-testable senza Mongo
//  - permette di mockare i signals nei test
//  - consente cron pre-compute (loadSignals batch) separato da suggest.

import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type {
  PricingPropertyConfig,
  PricingSignals,
} from "./types";
import type {
  CompetitorZone,
  EventDoc,
  PricingRuleDoc,
  PropertyDoc,
  CompetitorZoneStatsDoc,
} from "@/types/database";
import { DEFAULT_PROPERTY_CONFIG } from "./defaults";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Carica config property: combina PropertyDoc + PricingRuleDoc (se esiste)
 * + DEFAULT_PROPERTY_CONFIG (fallback).
 */
export async function getPropertyConfig(
  propertyId: string,
): Promise<PricingPropertyConfig | null> {
  const propsCol = await collections.properties();
  const rulesCol = await collections.pricingRules();

  let propObjId: ObjectId;
  try {
    propObjId = new ObjectId(propertyId);
  } catch {
    return null;
  }

  const property = (await propsCol.findOne({ _id: propObjId })) as
    | PropertyDoc
    | null;
  if (!property) return null;

  const rule = (await rulesCol.findOne({
    propertyId: propObjId,
    active: true,
  })) as PricingRuleDoc | null;

  // Floor base: da PricingRule o da property.pricing.basePrice come fallback
  const basePriceFloor =
    rule?.basePriceFloor ??
    property.pricing.basePrice ??
    DEFAULT_PROPERTY_CONFIG.basePriceFloor;

  const config: PricingPropertyConfig = {
    propertyId,
    zone: (property.zone as unknown as CompetitorZone) ?? "altro",
    bedrooms: property.details.bedrooms,
    maxGuests: property.details.maxGuests,
    hasLakeView: property.details.hasLakeView ?? false,
    coordinates:
      property.address.lat != null && property.address.lng != null
        ? { lat: property.address.lat, lng: property.address.lng }
        : undefined,
    basePriceFloor,
    baseGuests: rule?.baseGuests ?? DEFAULT_PROPERTY_CONFIG.baseGuests,
    extraPerGuest:
      rule?.extraPerGuest ?? DEFAULT_PROPERTY_CONFIG.extraPerGuest,
    competitorAnchorPercentile:
      rule?.competitorAnchorPercentile ??
      DEFAULT_PROPERTY_CONFIG.competitorAnchorPercentile,
    hardMinStay: rule?.hardMinStay ?? DEFAULT_PROPERTY_CONFIG.hardMinStay,
    maxCounterCyclicalDiscount:
      rule?.maxCounterCyclicalDiscount ??
      DEFAULT_PROPERTY_CONFIG.maxCounterCyclicalDiscount,
    enabledModulators: {
      ...DEFAULT_PROPERTY_CONFIG.enabledModulators,
      ...(rule?.enabledModulators ?? {}),
    },
  };
  return config;
}

/**
 * Carica i signals per (property, targetDate). Tutto opzionale:
 * se manca una collection o un doc, ritorna null in quel campo (no throw).
 */
export async function loadSignals(
  property: PricingPropertyConfig,
  targetDate: Date,
): Promise<PricingSignals> {
  const mkey = monthKey(targetDate);

  // M1 + M3 signal: competitorZoneStats per (zone, monthKey)
  const zoneStatsCol = await collections.competitorZoneStats();
  const competitorZoneRaw = (await zoneStatsCol.findOne({
    zone: property.zone,
    monthKey: mkey,
  })) as CompetitorZoneStatsDoc | null;

  const competitorZone = competitorZoneRaw
    ? {
        monthKey: competitorZoneRaw.monthKey,
        occupancyMedian: competitorZoneRaw.occupancyMedian,
        occupancyP25: competitorZoneRaw.occupancyP25,
        occupancyP75: competitorZoneRaw.occupancyP75,
        adrMedian: competitorZoneRaw.adrMedian,
        sampleSize: competitorZoneRaw.nCompetitorsCalendar,
      }
    : null;

  // M3 trend 7d: confronto monthKey corrente vs precedente (proxy semplice)
  let competitorTrend7d: PricingSignals["competitorTrend7d"] = null;
  if (competitorZoneRaw) {
    const prevMonthDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() - 1,
      1,
    );
    const prev = (await zoneStatsCol.findOne({
      zone: property.zone,
      monthKey: monthKey(prevMonthDate),
    })) as CompetitorZoneStatsDoc | null;
    if (prev?.adrMedian && competitorZoneRaw.adrMedian) {
      competitorTrend7d = {
        adrDeltaPct:
          (competitorZoneRaw.adrMedian - prev.adrMedian) / prev.adrMedian,
        occDelta:
          competitorZoneRaw.occupancyMedian - prev.occupancyMedian,
      };
    }
  }

  // ourOccupancyForward30d: % giorni occupati prossimi 30 in calendar
  const calCol = await collections.calendar();
  const from = new Date(targetDate);
  const to = new Date(targetDate.getTime() + 30 * MS_PER_DAY);
  const calDocs = (await calCol
    .find({
      propertyId: new ObjectId(property.propertyId),
      date: { $gte: from, $lt: to },
    })
    .toArray()) as Array<{ available: number }>;
  let ourOccupancyForward30d: number | undefined;
  if (calDocs.length > 0) {
    const blocked = calDocs.filter((d) => (d.available ?? 1) <= 0).length;
    ourOccupancyForward30d = blocked / calDocs.length;
  }

  // M5: events attivi in targetDate
  const eventsCol = await collections.events();
  const dayStart = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );
  const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);
  const activeEvents = (await eventsCol
    .find({
      active: true,
      startDate: { $lt: dayEnd },
      endDate: { $gte: dayStart },
    })
    .toArray()) as EventDoc[];

  // M6: weather (solo se entro 14gg)
  const today = new Date();
  const daysAhead = Math.round(
    (dayStart.getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      MS_PER_DAY,
  );
  let weatherForecast: PricingSignals["weatherForecast"] = null;
  if (daysAhead >= 0 && daysAhead <= 14) {
    const wfCol = await collections.weatherForecast();
    const wf = await wfCol.findOne({
      zone: property.zone,
      date: { $gte: dayStart, $lt: dayEnd },
    });
    if (wf) {
      weatherForecast = {
        bucket: wf.bucket,
        tempMaxC: wf.tempMaxC,
        precipMm: wf.precipMm,
      };
    }
  }

  return {
    competitorZone,
    competitorTrend7d,
    ourOccupancyForward30d,
    activeEvents,
    weatherForecast,
  };
}
