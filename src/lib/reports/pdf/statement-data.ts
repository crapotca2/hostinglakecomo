import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { getOwnerStatementBookings, type BookingRemittanceRow } from "@/lib/reports/property-management";
import { cycleBounds } from "@/lib/reports/period";
import type { UserDoc } from "@/types/database";

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export interface StatementTotals {
  bookings: number;
  nights: number;
  grossRevenue: number;
  otaCommission: number;
  cedolare: number;
  airbibbyCommission: number;
  cleaning: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
}

export interface StatementData {
  owner: { name: string; email: string };
  period: string; // "YYYY-MM"
  periodLabel: string; // "Luglio 2026"
  from: string; // ISO date
  to: string; // ISO date
  rows: BookingRemittanceRow[];
  totals: StatementTotals;
  generatedAt: string; // ISO
}

function parsePeriod(period: string): { year: number; monthIdx: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  if (isNaN(year) || monthIdx < 0 || monthIdx > 11) return null;
  return { year, monthIdx };
}

/**
 * Raccoglie tutti i dati del rendiconto mensile per un owner, SEMPRE scopato per
 * ownerId (guardrail #3). I totali sono la somma esatta delle righe mostrate, così
 * il PDF è internamente coerente (le righe sommano all'intestazione). Ritorna null
 * se il periodo non è valido o l'owner non esiste.
 */
export async function getStatementData(
  ownerId: string,
  period: string,
  generatedAtIso: string,
): Promise<StatementData | null> {
  const parsed = parsePeriod(period);
  if (!parsed) return null;
  const { year, monthIdx } = parsed;

  const usersCol = await collections.users();
  const owner = (await usersCol.findOne({
    _id: new ObjectId(ownerId),
  })) as UserDoc | null;
  if (!owner) return null;

  // Periodo = ciclo di fatturazione 25→25 che chiude il 25 del mese indicato.
  const { from, to } = cycleBounds(year, monthIdx);

  const rows = await getOwnerStatementBookings(from, to, ownerId);

  const totals: StatementTotals = rows.reduce<StatementTotals>(
    (acc, r) => ({
      bookings: acc.bookings + 1,
      nights: acc.nights + r.nights,
      grossRevenue: acc.grossRevenue + r.grossRevenue,
      otaCommission: acc.otaCommission + r.otaCommission,
      cedolare: acc.cedolare + r.cedolare,
      airbibbyCommission: acc.airbibbyCommission + r.airbibbyCommission,
      cleaning: acc.cleaning + r.cleaning,
      expenses: acc.expenses + r.expenses,
      touristTax: Math.round((acc.touristTax + r.touristTax) * 100) / 100,
      netPayout: acc.netPayout + r.netPayout,
    }),
    {
      bookings: 0,
      nights: 0,
      grossRevenue: 0,
      otaCommission: 0,
      cedolare: 0,
      airbibbyCommission: 0,
      cleaning: 0,
      expenses: 0,
      touristTax: 0,
      netPayout: 0,
    },
  );

  return {
    owner: { name: owner.name, email: owner.email },
    period,
    periodLabel: `${MONTH_NAMES[monthIdx]} ${year}`,
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    rows,
    totals,
    generatedAt: generatedAtIso,
  };
}
