// Engine composer.
//
// Compone i modulatori M1-M6 + guest multiplier + layer strategic in
// un'unica chiamata deterministica.
//
// Ordine deterministico delle operazioni (CRITICAL: non cambiarlo senza
// aggiornare i test, le decisioni di pricing storiche sono auditabili):
//
//   1. Start = basePriceFloor
//   2. M1 season       (×)
//   3. M2 day-of-week  (×)
//   4. M3 competitor-anchor + trend7d (×)
//   5. M4 lead-time    (×)
//   6. M5 events       (×)
//   7. M6 weather      (×)   ← solo se signals.weatherForecast presente
//   8. guest-multiplier (+)  ← addend, applicato DOPO i moltiplicatori
//   9. Layer strategic: counter-cyclical, last-minute (+/-)
//  10. Round to integer €

import type {
  PricingContext,
  PricingDecision,
  BreakdownStep,
} from "./types";
import { applySeason } from "./modulators/season";
import { applyDayOfWeek } from "./modulators/day-of-week";
import { applyCompetitorAnchor } from "./modulators/competitor-anchor";
import { applyLeadTime, leadTimeDays } from "./modulators/lead-time";
import { applyEvents } from "./modulators/events";
import { applyWeather } from "./modulators/weather";
import { applyGuestMultiplier } from "./guest-multiplier";
import { applyAllStrategicRules, enforcedMinStay } from "./strategic";

function appendIfDefined(
  breakdown: BreakdownStep[],
  step: BreakdownStep | null,
): number {
  if (step) {
    breakdown.push(step);
    return step.runningTotal;
  }
  return breakdown.length > 0
    ? breakdown[breakdown.length - 1].runningTotal
    : NaN;
}

/**
 * Calcola il suggested price per (property, date, guests).
 * Pure function: stessi input → stesso output.
 */
export function suggestPrice(ctx: PricingContext): PricingDecision {
  const warnings: string[] = [];
  const breakdown: BreakdownStep[] = [];

  // Validation input
  if (ctx.guests < 1) {
    throw new Error(`guests must be >= 1, got ${ctx.guests}`);
  }
  if (ctx.guests > ctx.property.maxGuests) {
    warnings.push(
      `guests=${ctx.guests} oltre maxGuests=${ctx.property.maxGuests}, capped`,
    );
    ctx = { ...ctx, guests: ctx.property.maxGuests };
  }
  if (ctx.property.basePriceFloor <= 0) {
    throw new Error("basePriceFloor must be > 0");
  }

  const enabled = ctx.property.enabledModulators;

  // Step 1: start from floor
  let runningTotal = ctx.property.basePriceFloor;
  breakdown.push({
    name: "floor",
    type: "addend",
    value: runningTotal,
    runningTotal,
    reason: `Prezzo floor proprietà €${runningTotal.toFixed(0)}`,
  });

  // Step 2-7: modulatori M1-M6
  if (enabled.season) {
    runningTotal = appendIfDefined(
      breakdown,
      applySeason(runningTotal, ctx.targetDate),
    );
  }
  if (enabled.dayOfWeek) {
    runningTotal = appendIfDefined(
      breakdown,
      applyDayOfWeek(runningTotal, ctx.targetDate),
    );
  }
  if (enabled.competitorAnchor) {
    const step = applyCompetitorAnchor(runningTotal, ctx.property, ctx.signals);
    runningTotal = appendIfDefined(breakdown, step);
    if (!step && ctx.signals.competitorZone == null) {
      warnings.push("Signal competitorZone mancante: anchor disattivato");
    } else if (!step && ctx.signals.competitorZone) {
      if (ctx.signals.competitorZone.sampleSize < 8) {
        warnings.push(
          `Sample competitor zona basso (${ctx.signals.competitorZone.sampleSize}), anchor disattivato`,
        );
      }
    }
  }
  if (enabled.leadTime) {
    runningTotal = appendIfDefined(
      breakdown,
      applyLeadTime(runningTotal, ctx.asOf, ctx.targetDate),
    );
  }
  if (enabled.events) {
    runningTotal = appendIfDefined(
      breakdown,
      applyEvents(runningTotal, ctx.property, ctx.signals),
    );
  }
  if (enabled.weather) {
    runningTotal = appendIfDefined(
      breakdown,
      applyWeather(runningTotal, ctx.signals),
    );
  }

  // Step 8: guest multiplier (addend dopo i moltiplicatori)
  runningTotal = appendIfDefined(
    breakdown,
    applyGuestMultiplier(runningTotal, ctx.property, ctx.guests),
  );

  // Step 9: layer strategic
  const strategic = applyAllStrategicRules(runningTotal, ctx);
  runningTotal = strategic.finalTotal;

  // Step 10: round
  const suggestedPrice = Math.max(1, Math.round(runningTotal));

  // Min stay
  const minStay = enforcedMinStay(ctx);

  // Signals snapshot per audit
  const signalsSnapshot = {
    competitorMedianADR: ctx.signals.competitorZone?.adrMedian,
    competitorZoneOccupancy: ctx.signals.competitorZone?.occupancyMedian,
    ourOccupancyForward30d: ctx.signals.ourOccupancyForward30d,
    leadTimeDays: leadTimeDays(ctx.asOf, ctx.targetDate),
    activeEventNames: ctx.signals.activeEvents.map((e) => e.name),
    weatherBucket: ctx.signals.weatherForecast?.bucket,
  };

  return {
    propertyId: ctx.property.propertyId,
    targetDate: ctx.targetDate,
    guests: ctx.guests,
    suggestedPrice,
    basePriceFloor: ctx.property.basePriceFloor,
    enforcedMinStay: minStay,
    breakdown,
    appliedStrategicRules: strategic.applied,
    warnings,
    signalsSnapshot,
    computedAt: new Date(),
  };
}
