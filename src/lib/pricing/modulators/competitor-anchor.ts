// M3 — Competitor anchor.
//
// Confronta il prezzo che stiamo per suggerire con la mediana ADR della zona
// per quel mese (signal da CompetitorZoneStatsDoc). Se siamo lontani
// dall'anchor target percentile, applica un correttivo PARZIALE — non un
// ancoraggio completo, perché vogliamo che la stagione (M1) e i giorni
// della settimana (M2) restino dominanti.
//
// Strategy: 50% pull towards anchor. Es: se anchor=200, current=160,
// applichiamo ×1.125 (porta a 180, a mezza strada). Limite: [×0.85, ×1.20].
//
// Sopra il pull anchor, applica anche il trend 7gg: se mediana zona è
// cresciuta del +10% ultimi 7gg, aggiunge un boost ×1.05 (cioè cattura
// metà del trend per non amplificare rumore).

import type { BreakdownStep, PricingSignals, PricingPropertyConfig } from "../types";

const ANCHOR_PULL = 0.5;         // quanta strada percorrere verso l'anchor
const ANCHOR_MIN = 0.85;
const ANCHOR_MAX = 1.20;
const TREND_CAPTURE = 0.5;       // cattura il 50% del trend osservato
const TREND_MIN = 0.95;
const TREND_MAX = 1.10;

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function applyCompetitorAnchor(
  runningTotal: number,
  property: PricingPropertyConfig,
  signals: PricingSignals,
): BreakdownStep | null {
  if (!signals.competitorZone || signals.competitorZone.adrMedian == null) {
    return null;
  }
  if (signals.competitorZone.sampleSize < 8) {
    // Sample troppo piccolo, non affidabile.
    return null;
  }

  const medianADR = signals.competitorZone.adrMedian;
  // Target percentile: il proprietario può scegliere di essere al p60 = mediana × 1.05 stimato.
  // Per ora trattiamo percentile come piccolo lift sulla mediana:
  // 0.50 → ×1.0, 0.60 → ×1.05, 0.40 → ×0.95, 0.70 → ×1.10.
  const anchorTarget = medianADR * (1 + (property.competitorAnchorPercentile - 0.5));

  // Pull parziale verso anchor.
  const ratioToAnchor = anchorTarget / runningTotal;
  const partialPull = 1 + ANCHOR_PULL * (ratioToAnchor - 1);
  let multiplier = clamp(partialPull, ANCHOR_MIN, ANCHOR_MAX);

  // Trend 7d: cattura il 50% del cambiamento osservato.
  let trendNote = "";
  if (signals.competitorTrend7d) {
    const trendCapture =
      1 + TREND_CAPTURE * signals.competitorTrend7d.adrDeltaPct;
    const trendBoost = clamp(trendCapture, TREND_MIN, TREND_MAX);
    multiplier *= trendBoost;
    if (Math.abs(signals.competitorTrend7d.adrDeltaPct) > 0.02) {
      trendNote = ` + trend 7gg ${(
        signals.competitorTrend7d.adrDeltaPct * 100
      ).toFixed(0)}%`;
    }
  }

  multiplier = clamp(multiplier, ANCHOR_MIN, ANCHOR_MAX * TREND_MAX);

  const newTotal = runningTotal * multiplier;
  return {
    name: "competitor-anchor",
    type: "multiplier",
    value: Number(multiplier.toFixed(3)),
    runningTotal: newTotal,
    reason: `Mediana zona €${medianADR.toFixed(0)} (target p${Math.round(
      property.competitorAnchorPercentile * 100,
    )})${trendNote} (×${multiplier.toFixed(2)})`,
  };
}
