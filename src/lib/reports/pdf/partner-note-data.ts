import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { cycleBounds } from "@/lib/reports/period";
import { feeRateForProperty } from "@/lib/reports/fee-model";
import type { BookingDoc, PropertyDoc, UserDoc } from "@/types/database";
import { PARTNERS, INPS_RATE, type PartnerConfig } from "./partners";

const MONTHS_IT = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

const r2 = (n: number) => Math.round(n * 100) / 100;
const dm = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;

export interface PartnerNoteRow {
  guest: string;
  checkIn: string; // dd/mm/yyyy
  nights: number;
  pax: number;
  alloggio: number; // ricavi alloggio (base fee)
  channel: string;
  feePct: number; // % Host Como
  pagamento: number; // alloggio × fee%
}

export interface PartnerNoteMonth {
  label: string; // "Luglio"
  rows: PartnerNoteRow[];
  entrate: number; // somma pagamento del mese (commissione Host Como piena)
  half: number; // quota del socio = entrate / 2
}

export interface PartnerNoteData {
  partner: PartnerConfig;
  recipient: { name: string; addressLines: string[]; fiscalCode?: string };
  place: string;
  dateLabel: string; // DD/MM/YYYY
  periodLabel: string; // "luglio e agosto 2026"
  propertyName: string;
  months: PartnerNoteMonth[];
  consulenza: number; // = Σ half
  inps: number; // 4%
  totale: number; // consulenza + inps
}

function monthsPhrase(labels: string[]): string {
  const low = labels.map((l) => l.toLowerCase());
  if (low.length === 1) return low[0];
  return `${low.slice(0, -1).join(", ")} e ${low[low.length - 1]}`;
}

/**
 * Dati della Nota spese di un socio Host Como per la consulenza di ospitalità su
 * un immobile. La consulenza = metà della commissione Host Como (aliquota ×
 * ricavi alloggio) sulle prenotazioni valide del periodo; maggiorata del 4% INPS.
 * Documento INTERNO (intestato al proprietario, emesso dal socio) → solo admin.
 * period: "all" (tutte le prenotazioni) oppure "YYYY-MM" (ciclo 25→25).
 * Ritorna null se socio/owner/property non validi.
 */
export async function getPartnerNoteData(
  ownerId: string,
  partnerKey: string,
  period: string,
  generatedAtIso: string,
): Promise<PartnerNoteData | null> {
  const partner = PARTNERS[partnerKey];
  if (!partner) return null;

  const usersCol = await collections.users();
  const owner = (await usersCol.findOne({ _id: new ObjectId(ownerId) })) as UserDoc | null;
  if (!owner) return null;

  const propsCol = await collections.properties();
  const props = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  if (props.length === 0) return null;
  const property = props[0];
  const feeRate = feeRateForProperty(property);

  const bookingsCol = await collections.bookings();
  const query: Record<string, unknown> = { ownerId: new ObjectId(ownerId) };
  if (period !== "all") {
    const m = /^(\d{4})-(\d{2})$/.exec(period);
    if (!m) return null;
    const { from, to } = cycleBounds(parseInt(m[1], 10), parseInt(m[2], 10) - 1);
    query.checkIn = { $gte: from, $lt: to };
  }
  const all = (await bookingsCol.find(query).toArray()) as BookingDoc[];
  const counted = all
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());

  // Raggruppa per mese solare del check-in (come il template).
  const byMonth = new Map<number, PartnerNoteRow[]>();
  for (const b of counted) {
    const p = b.pricing || {};
    const alloggio = p.roomRevenue ?? Math.max(0, (p.totalAmount ?? 0) - (p.cleaningFee ?? 0));
    const row: PartnerNoteRow = {
      guest: b.guestInfo?.name || "—",
      checkIn: dm(b.checkIn),
      nights: b.nights,
      pax: b.guests,
      alloggio: r2(alloggio),
      channel: b.source ? b.source.charAt(0).toUpperCase() + b.source.slice(1) : "—",
      feePct: Math.round(feeRate * 100),
      pagamento: r2(alloggio * feeRate),
    };
    const mi = b.checkIn.getUTCMonth();
    const arr = byMonth.get(mi) || [];
    arr.push(row);
    byMonth.set(mi, arr);
  }

  const months: PartnerNoteMonth[] = Array.from(byMonth.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([mi, rows]) => {
      const entrate = r2(rows.reduce((s, r) => s + r.pagamento, 0));
      return { label: MONTHS_IT[mi][0].toUpperCase() + MONTHS_IT[mi].slice(1), rows, entrate, half: r2(entrate / 2) };
    });

  const consulenza = r2(months.reduce((s, m) => s + m.half, 0));
  const inps = r2(consulenza * INPS_RATE);
  const totale = r2(consulenza + inps);

  const year = counted.length > 0 ? counted[0].checkIn.getUTCFullYear() : new Date().getUTCFullYear();
  const periodLabel = `${monthsPhrase(months.map((m) => m.label))} ${year}`;
  const gen = new Date(generatedAtIso);

  return {
    partner,
    recipient: {
      name: owner.name,
      addressLines: [
        property.address ? `${property.address.street}` : "",
        property.address ? `${property.address.zip} – ${property.address.city} (${property.address.province})` : "",
      ].filter(Boolean),
      fiscalCode: owner.fiscalCode,
    },
    place: "Como",
    dateLabel: `${String(gen.getDate()).padStart(2, "0")}/${String(gen.getMonth() + 1).padStart(2, "0")}/${gen.getFullYear()}`,
    periodLabel,
    propertyName: property.name,
    months,
    consulenza,
    inps,
    totale,
  };
}
