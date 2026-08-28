// Annotazioni calendario: meteo (pioggia) e chiusure per manutenzione.
//
// PIOGGIA — dati reali dell'archivio storico Open-Meteo (modello ERA5) per
// Argegno, Lago di Como (lat 45.94, lon 9.13, quota 197 m). Valore = somma di
// precipitazione giornaliera in millimetri. Periodo caricato: 1 lug → 27 ago
// 2026. Fonte: https://archive-api.open-meteo.com/v1/archive (daily
// precipitation_sum, timezone Europe/Rome). Sono elencati solo i giorni con
// precipitazione misurabile (> 0 mm); gli altri si intendono asciutti.
export const RAIN_MM: Record<string, number> = {
  "2026-07-01": 5.0,
  "2026-07-10": 4.5,
  "2026-07-11": 4.9,
  "2026-07-13": 1.1,
  "2026-07-14": 2.1,
  "2026-07-15": 3.9,
  "2026-07-17": 10.5,
  "2026-07-18": 2.7,
  "2026-07-19": 8.2,
  "2026-07-20": 1.9,
  "2026-07-21": 20.3,
  "2026-07-22": 0.5,
  "2026-07-23": 0.5,
  "2026-07-25": 0.1,
  "2026-07-26": 4.6,
  "2026-07-29": 0.3,
  "2026-07-30": 0.1,
  "2026-07-31": 5.0,
  "2026-08-01": 2.9,
  "2026-08-02": 3.6,
  "2026-08-03": 3.4,
  "2026-08-04": 0.2,
  "2026-08-05": 0.1,
  "2026-08-07": 11.4,
  "2026-08-09": 0.6,
  "2026-08-12": 0.5,
  "2026-08-14": 0.3,
  "2026-08-15": 0.1,
  "2026-08-16": 2.4,
  "2026-08-17": 0.9,
  "2026-08-18": 0.3,
  "2026-08-19": 6.2,
  "2026-08-20": 137.9,
  "2026-08-21": 44.3,
  "2026-08-23": 2.4,
  "2026-08-24": 8.8,
  "2026-08-25": 37.4,
  "2026-08-26": 0.9,
  "2026-08-27": 0.8,
};

/** Sotto questa soglia (mm) la pioggia è trascurabile e non viene segnalata. */
export const RAIN_THRESHOLD_MM = 1.0;

export type RainLevel = "light" | "moderate" | "heavy";

export interface RainInfo {
  mm: number;
  level: RainLevel;
}

/** Info pioggia per una data ISO (yyyy-MM-dd), o null se giorno asciutto. */
export function rainForDate(iso: string): RainInfo | null {
  const mm = RAIN_MM[iso];
  if (mm == null || mm < RAIN_THRESHOLD_MM) return null;
  const level: RainLevel = mm >= 20 ? "heavy" : mm >= 5 ? "moderate" : "light";
  return { mm, level };
}

/** Periodo di chiusura per manutenzione (estremi inclusivi). */
export interface MaintenancePeriod {
  start: string; // yyyy-MM-dd
  end: string; // yyyy-MM-dd (incluso)
  reason: string;
}

// Chiusure programmate della struttura. Aggiornare qui quando la casa è
// indisponibile per lavori. Ago 2026: casa chiusa 20→22 per riparazione al letto.
export const MAINTENANCE_PERIODS: MaintenancePeriod[] = [
  { start: "2026-08-20", end: "2026-08-22", reason: "Chiusura per riparazione letto" },
];

/** Periodo di manutenzione che copre la data ISO, o null. */
export function maintenanceForDate(iso: string): MaintenancePeriod | null {
  return MAINTENANCE_PERIODS.find((m) => iso >= m.start && iso <= m.end) ?? null;
}
