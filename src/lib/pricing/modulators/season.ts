// M1 — Stagione (curva mensile).
//
// Sul Lago di Como la stagionalità è marcata: peak/off-peak ratio circa 4:1.
// La curva DEFAULT_SEASON_CURVE è una baseline statica derivata da
// observation di mercato (AirDNA Argegno/Cernobbio 2024-2025).
//
// Se sono presenti signals (competitorZone con adrMedian), il modulatore
// dovrebbe IDEALMENTE rinormalizzare la curva sulla mediana zona del mese
// vs mediana annuale — ma quel rinormalizzo è fatto da M3 (competitor-anchor)
// per non sovrapporre due segnali. M1 resta pulito sulla curva storica.

import type { BreakdownStep } from "../types";

// Index 0 = gennaio. Moltiplicatori sul basePriceFloor.
// Profilo: Bassissima Gen-Feb (×0.55), salita Mar-Apr, peak Lug-Ago (×2.10),
// shoulder Sett-Ott decrescente, mid-low Nov-Dic.
const DEFAULT_SEASON_CURVE = [
  0.55, // Gen
  0.55, // Feb
  0.75, // Mar
  1.10, // Apr
  1.45, // Mag
  1.65, // Giu
  2.05, // Lug
  2.10, // Ago
  1.55, // Set
  1.20, // Ott
  0.70, // Nov
  0.95, // Dic (uplift Natale/Capodanno)
];

const MONTH_NAMES_IT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

export function applySeason(
  runningTotal: number,
  targetDate: Date,
): BreakdownStep {
  const monthIdx = targetDate.getMonth();
  const multiplier = DEFAULT_SEASON_CURVE[monthIdx];
  const newTotal = runningTotal * multiplier;
  return {
    name: "season",
    type: "multiplier",
    value: multiplier,
    runningTotal: newTotal,
    reason: `Stagione ${MONTH_NAMES_IT[monthIdx]} (×${multiplier.toFixed(2)})`,
  };
}
