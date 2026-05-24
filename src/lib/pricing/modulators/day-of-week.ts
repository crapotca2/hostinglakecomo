// M2 — Day of week.
//
// Pattern booking europeo short-stay: ven/sab sono premium (≈+30%),
// dom +10% (ancora weekend), lun-gio neutri.

import type { BreakdownStep } from "../types";

// 0 = domenica, 1 = lunedì, ..., 6 = sabato (JS Date convention)
const DOW_MULTIPLIER = [
  1.10, // Dom
  1.00, // Lun
  1.00, // Mar
  1.00, // Mer
  1.05, // Gio (uplift weekend-eve)
  1.30, // Ven
  1.30, // Sab
];

const DOW_LABEL_IT = [
  "dom", "lun", "mar", "mer", "gio", "ven", "sab",
];

export function applyDayOfWeek(
  runningTotal: number,
  targetDate: Date,
): BreakdownStep {
  const dow = targetDate.getDay();
  const multiplier = DOW_MULTIPLIER[dow];
  const newTotal = runningTotal * multiplier;
  return {
    name: "day-of-week",
    type: "multiplier",
    value: multiplier,
    runningTotal: newTotal,
    reason: `Giorno ${DOW_LABEL_IT[dow]} (×${multiplier.toFixed(2)})`,
  };
}
