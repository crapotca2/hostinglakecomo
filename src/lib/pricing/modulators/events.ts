// M5 — Eventi locali.
//
// Si applicano gli eventi attivi (startDate <= targetDate <= endDate) che:
//  - hanno geo + radiusKm e la property è dentro il raggio, OPPURE
//  - hanno zones[] e la zona della property è in lista, OPPURE
//  - non hanno geo né zones (eventi nazionali).
//
// Se più eventi sono attivi, applichiamo il PRODOTTO dei moltiplicatori
// (caso raro ma corretto: Ferragosto + festa locale = +X% + Y%).

import type {
  BreakdownStep,
  PricingPropertyConfig,
  PricingSignals,
} from "../types";

const EARTH_RADIUS_KM = 6371;

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function applyEvents(
  runningTotal: number,
  property: PricingPropertyConfig,
  signals: PricingSignals,
): BreakdownStep | null {
  const events = signals.activeEvents.filter((e) => e.active);
  if (events.length === 0) return null;

  const matched: { name: string; mult: number }[] = [];
  for (const e of events) {
    // Filtro geo
    if (e.geo && e.radiusKm && property.coordinates) {
      const d = haversineKm(property.coordinates, e.geo);
      if (d > e.radiusKm) continue;
    }
    // Filtro zone
    if (e.zones && e.zones.length > 0 && !e.zones.includes(property.zone)) {
      continue;
    }
    matched.push({ name: e.name, mult: e.priceMultiplier });
  }

  if (matched.length === 0) return null;

  // Prodotto dei moltiplicatori
  const totalMult = matched.reduce((acc, m) => acc * m.mult, 1);
  const newTotal = runningTotal * totalMult;
  const names = matched.map((m) => m.name).join(", ");
  return {
    name: "events",
    type: "multiplier",
    value: Number(totalMult.toFixed(3)),
    runningTotal: newTotal,
    reason: `Evento: ${names} (×${totalMult.toFixed(2)})`,
  };
}
