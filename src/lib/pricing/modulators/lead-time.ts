// M4 — Lead time.
//
// Curva ottimale per il Lago di Como mercato internazionale:
//   - 0-2gg (urgentissimo): -10% (chiusura inventory)
//   - 3-7gg (last-minute): -5%
//   - 8-29gg (sweet spot vicino): neutro
//   - 30-60gg (sweet spot booking ideale): +0% (riferimento)
//   - 61-120gg (early): -2% (piccolo discount per locking precoce)
//   - 121-180gg (very early): -5%
//   - 180+ (super early, US/AU travelers): -7%
//
// Il last-minute "vero" (sconto aggressivo o premium) è gestito al layer
// strategic (strategic.ts) sulla base della nostra occupancy. Qui è solo
// la baseline.

import type { BreakdownStep } from "../types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function leadTimeDays(asOf: Date, targetDate: Date): number {
  const a = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const t = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );
  return Math.round((t.getTime() - a.getTime()) / MS_PER_DAY);
}

export function applyLeadTime(
  runningTotal: number,
  asOf: Date,
  targetDate: Date,
): BreakdownStep | null {
  const days = leadTimeDays(asOf, targetDate);
  if (days < 0) {
    // Data nel passato: il caller dovrebbe averlo già intercettato.
    return null;
  }
  let multiplier = 1.0;
  let bucket = "";
  if (days <= 2) {
    multiplier = 0.90;
    bucket = "urgentissimo";
  } else if (days <= 7) {
    multiplier = 0.95;
    bucket = "last-minute";
  } else if (days <= 29) {
    multiplier = 1.00;
    bucket = "vicino";
  } else if (days <= 60) {
    multiplier = 1.00;
    bucket = "sweet spot";
  } else if (days <= 120) {
    multiplier = 0.98;
    bucket = "early";
  } else if (days <= 180) {
    multiplier = 0.95;
    bucket = "very early";
  } else {
    multiplier = 0.93;
    bucket = "super early";
  }

  if (multiplier === 1.0) return null;

  const newTotal = runningTotal * multiplier;
  return {
    name: "lead-time",
    type: "multiplier",
    value: multiplier,
    runningTotal: newTotal,
    reason: `Lead time ${days}gg (${bucket}, ×${multiplier.toFixed(2)})`,
  };
}
