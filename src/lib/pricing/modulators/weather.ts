// M6 — Meteo short-term.
//
// L'utente ha esplicitamente notato: "nel lungo periodo non è una buona
// bussola". Quindi attiviamo questo modulatore SOLO se il check-in è
// entro 14gg (oltre, l'attendibilità del forecast scende molto).
// Il caller decide se passare o no weatherForecast in signals.
//
// Modifier piccoli per evitare swing percepiti come scoordinati:
//   sunny  +3%  (domanda last-minute Como sale con bel tempo)
//   cloudy  0%
//   rainy  -3%  (qualche cancellazione, sconto soft per riempire)
//   stormy -5%

import type { BreakdownStep, PricingSignals } from "../types";

const BUCKET_MULT: Record<string, number> = {
  sunny: 1.03,
  cloudy: 1.00,
  rainy: 0.97,
  stormy: 0.95,
};

const BUCKET_LABEL_IT: Record<string, string> = {
  sunny: "soleggiato",
  cloudy: "nuvoloso",
  rainy: "piovoso",
  stormy: "temporalesco",
};

export function applyWeather(
  runningTotal: number,
  signals: PricingSignals,
): BreakdownStep | null {
  const wf = signals.weatherForecast;
  if (!wf) return null;
  const multiplier = BUCKET_MULT[wf.bucket] ?? 1.0;
  if (multiplier === 1.0) return null;

  const newTotal = runningTotal * multiplier;
  return {
    name: "weather",
    type: "multiplier",
    value: multiplier,
    runningTotal: newTotal,
    reason: `Meteo ${BUCKET_LABEL_IT[wf.bucket]} (×${multiplier.toFixed(2)})`,
  };
}
