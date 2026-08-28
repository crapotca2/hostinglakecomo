import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";
import { countryName } from "@/lib/countries";

export interface IstatRow {
  origin: string; // nome paese in italiano (maiuscolo), es. "FRANCIA"
  countryCode: string;
  arrivals: number; // ospiti arrivati nel mese
  presences: number; // presenze = notti-ospite nel mese
}

// Nomi ISTAT/ROSS ufficiali per i casi che differiscono da countryName().
const ISTAT_NAMES: Record<string, string> = {
  US: "STATI UNITI D'AMERICA",
  GB: "REGNO UNITO",
  "??": "DA CONFERMARE",
};

// Sentinella per nazionalità mancante: NON assumere ITALIA (falserebbe un dato
// legale). La compliance mostra "DA CONFERMARE" finché la schedina non è nota.
const UNKNOWN = "??";

function originName(code: string): string {
  const cc = (code || UNKNOWN).toUpperCase();
  if (cc === UNKNOWN) return ISTAT_NAMES[UNKNOWN];
  return ISTAT_NAMES[cc] || countryName(cc).toUpperCase() || cc;
}

/**
 * Report flussi turistici in formato ROSS 1000 (Regione Lombardia): aggregato
 * per **Origine** con Arrivi e Presenze del mese + riga TOTALE.
 * - Arrivi = ospiti la cui data di check-in cade nel mese.
 * - Presenze = notti-ospite ricadenti nel mese (uno stay a cavallo conta solo
 *   le notti del mese).
 * NB: la nazionalità è a livello di prenotazione; per gruppi con provenienze
 * miste il dato ufficiale ROSS (per singolo ospite) è più granulare.
 */
export async function generateIstatExport(
  month: number,
  year: number,
  ownerId: string
): Promise<{
  rows: IstatRow[];
  total: { arrivals: number; presences: number };
  csv: string;
}> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const dayMs = 24 * 60 * 60 * 1000;

  const allBookings = (await bookingsCol
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn <= end && b.checkOut >= start
  );

  const byCountry = new Map<string, { arrivals: number; presences: number }>();
  const bump = (code: string, field: "arrivals" | "presences", n: number) => {
    const prev = byCountry.get(code) || { arrivals: 0, presences: 0 };
    prev[field] += n;
    byCountry.set(code, prev);
  };

  for (const b of bookings) {
    // Provenienza per-ospite se disponibile (gruppi misti), altrimenti una sola
    // nazionalità per l'intera prenotazione.
    const origins =
      b.guestOrigins && b.guestOrigins.length > 0
        ? b.guestOrigins.map((o) => ({ code: (o.code || UNKNOWN).toUpperCase(), count: o.count }))
        : [{ code: (b.guestInfo.nationality || UNKNOWN).toUpperCase(), count: b.guests }];

    // Le continuazioni (notte extra diretta agganciata a un altro soggiorno) NON
    // sono un nuovo arrivo: contano le presenze ma sono escluse dagli arrivi.
    const arrivesInMonth = b.checkIn >= start && b.checkIn <= end && !b.istatContinuation;
    let nightsInMonth = 0;
    for (let d = new Date(b.checkIn); d < b.checkOut; d = new Date(d.getTime() + dayMs)) {
      if (d >= start && d <= end) nightsInMonth++;
    }
    for (const o of origins) {
      if (arrivesInMonth) bump(o.code, "arrivals", o.count);
      bump(o.code, "presences", o.count * nightsInMonth);
    }
  }

  const rows: IstatRow[] = Array.from(byCountry.entries())
    .map(([code, v]) => ({
      origin: originName(code),
      countryCode: code,
      arrivals: v.arrivals,
      presences: v.presences,
    }))
    .sort((a, b) => b.presences - a.presences || b.arrivals - a.arrivals);

  const total = rows.reduce(
    (acc, r) => ({ arrivals: acc.arrivals + r.arrivals, presences: acc.presences + r.presences }),
    { arrivals: 0, presences: 0 }
  );

  const header = "Origine;Arrivi;Presenze";
  const body = rows.map((r) => `${r.origin};${r.arrivals};${r.presences}`);
  const csv = [header, `TOTALE;${total.arrivals};${total.presences}`, ...body].join("\n");

  return { rows, total, csv };
}
