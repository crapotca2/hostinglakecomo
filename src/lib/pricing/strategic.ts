// Layer 3 — Strategic rules (counter-cyclical, last-minute strategic, etc).
//
// Sopra il base price (post modulatori M1-M6 + guest multiplier), applichiamo
// queste regole in cascata. Ognuna è una funzione di (runningTotal, context)
// che ritorna eventualmente uno StrategicRuleApplication.

import type {
  StrategicRuleApplication,
  PricingContext,
} from "./types";
import { leadTimeDays } from "./modulators/lead-time";

/**
 * Counter-cyclical: quando la zona è alta ma noi siamo bassi → discount.
 * Quando zona è bassa ma noi siamo alti → premium.
 * Soglie:
 *  - "zona alta" = occupancy zona >= 0.70
 *  - "noi bassi" = ourOccupancyForward30d <= 0.40
 *  - "zona bassa" = occupancy zona <= 0.40
 *  - "noi alti" = ourOccupancyForward30d >= 0.70
 */
export function counterCyclical(
  runningTotal: number,
  ctx: PricingContext,
): StrategicRuleApplication | null {
  const zoneOcc = ctx.signals.competitorZone?.occupancyMedian;
  const ourOcc = ctx.signals.ourOccupancyForward30d;
  if (zoneOcc == null || ourOcc == null) return null;
  const cap = ctx.property.maxCounterCyclicalDiscount;
  if (cap <= 0) return null;

  if (zoneOcc >= 0.7 && ourOcc <= 0.4) {
    // Sconto: applica il cap (es. -15%)
    const delta = -Math.round(runningTotal * cap);
    return {
      name: "counter-cyclical-discount",
      delta,
      reason: `Zona alta (${(zoneOcc * 100).toFixed(0)}%) ma nostra occupancy bassa (${(ourOcc * 100).toFixed(0)}%): −${(cap * 100).toFixed(0)}%`,
    };
  }
  if (zoneOcc <= 0.4 && ourOcc >= 0.7) {
    // Premium: applica metà del cap (più conservativo verso l'alto)
    const delta = Math.round(runningTotal * (cap * 0.5));
    return {
      name: "counter-cyclical-premium",
      delta,
      reason: `Zona bassa (${(zoneOcc * 100).toFixed(0)}%) ma nostra occupancy alta (${(ourOcc * 100).toFixed(0)}%): +${(cap * 50).toFixed(0)}%`,
    };
  }
  return null;
}

/**
 * Last-minute strategic: dentro 7 giorni dal check-in, modifica condizionale
 * sulla nostra occupancy forward 30gg.
 *  - Se occupancy <50% → -10% (burn capacity per riempire)
 *  - Se occupancy >85% → +8% (premium su finestra quasi piena)
 */
export function lastMinuteStrategic(
  runningTotal: number,
  ctx: PricingContext,
): StrategicRuleApplication | null {
  const lt = leadTimeDays(ctx.asOf, ctx.targetDate);
  if (lt > 7) return null;
  const ourOcc = ctx.signals.ourOccupancyForward30d;
  if (ourOcc == null) return null;

  if (ourOcc < 0.5) {
    const delta = -Math.round(runningTotal * 0.10);
    return {
      name: "last-minute-burn",
      delta,
      reason: `Last-minute (${lt}gg) con nostra occupancy bassa: −10%`,
    };
  }
  if (ourOcc > 0.85) {
    const delta = Math.round(runningTotal * 0.08);
    return {
      name: "last-minute-premium",
      delta,
      reason: `Last-minute (${lt}gg) con nostra occupancy alta: +8%`,
    };
  }
  return null;
}

/**
 * Hard min stay: la decisione di prodotto è 3 notti sempre.
 * Questa funzione NON modifica il prezzo, ritorna solo il valore
 * di min stay da enforcare a livello channel manager.
 */
export function enforcedMinStay(ctx: PricingContext): number {
  return Math.max(1, ctx.property.hardMinStay);
}

export function applyAllStrategicRules(
  startingTotal: number,
  ctx: PricingContext,
): { applied: StrategicRuleApplication[]; finalTotal: number } {
  const applied: StrategicRuleApplication[] = [];
  let total = startingTotal;

  const rules = [counterCyclical, lastMinuteStrategic];
  for (const rule of rules) {
    const out = rule(total, ctx);
    if (out) {
      applied.push(out);
      total += out.delta;
    }
  }
  return { applied, finalTotal: total };
}
