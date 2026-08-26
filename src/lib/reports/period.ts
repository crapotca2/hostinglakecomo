/**
 * Ciclo di fatturazione Host Como: il rendiconto/pagamento mensile del
 * proprietario NON segue il mese solare ma va **dal 25 del mese precedente al
 * 25 del mese corrente**. Il periodo è etichettato con il mese in cui termina
 * (il 25). Es.: il rendiconto "Luglio 2026" copre 25/06/2026 → 25/07/2026.
 *
 * Una prenotazione è assegnata al ciclo in base alla **data di check-in**:
 * check-in dal giorno 25 in poi → conta nel ciclo del mese successivo.
 */

/** Giorno di taglio del ciclo (il 25). */
export const CYCLE_CUTOFF_DAY = 25;

/** Ciclo (anno + indice mese 0-based del mese di chiusura) di una data. */
export function billingCycle(d: Date): { year: number; monthIdx: number } {
  let year = d.getFullYear();
  let monthIdx = d.getMonth();
  if (d.getDate() >= CYCLE_CUTOFF_DAY) {
    monthIdx += 1;
    if (monthIdx > 11) {
      monthIdx = 0;
      year += 1;
    }
  }
  return { year, monthIdx };
}

/** Estremi [from, to) del ciclo che chiude il 25 di (year, monthIdx). */
export function cycleBounds(year: number, monthIdx: number): { from: Date; to: Date } {
  // new Date gestisce monthIdx-1 = -1 → dicembre dell'anno precedente.
  const from = new Date(year, monthIdx - 1, CYCLE_CUTOFF_DAY, 0, 0, 0, 0);
  const to = new Date(year, monthIdx, CYCLE_CUTOFF_DAY, 0, 0, 0, 0);
  return { from, to };
}

/** "YYYY-MM" del ciclo di una data. */
export function cyclePeriodKey(d: Date): string {
  const { year, monthIdx } = billingCycle(d);
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
}
