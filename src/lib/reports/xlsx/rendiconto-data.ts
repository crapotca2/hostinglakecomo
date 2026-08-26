import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { cycleBounds } from "@/lib/reports/period";
import { feeRateForProperty } from "@/lib/reports/fee-model";
import type { BookingDoc, PropertyDoc } from "@/types/database";
import type { RendicontoXlsxInput, XlsxBooking, XlsxParking } from "./rendiconto-xlsx";

const MONTHS_IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

function parsePeriod(period: string): { year: number; monthIdx: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  if (isNaN(year) || monthIdx < 0 || monthIdx > 11) return null;
  return { year, monthIdx };
}

const dm = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const dmy = (d: Date) => `${dm(d)}/${d.getUTCFullYear()}`;

function channelLabel(source: string): string {
  const s = (source || "").toLowerCase();
  if (s.includes("airbnb")) return "Airbnb";
  if (s.includes("booking")) return "Booking";
  if (s.includes("direct") || s.includes("diretto")) return "Diretto";
  return source ? source.charAt(0).toUpperCase() + source.slice(1) : "—";
}

export interface RendicontoXlsxMeta {
  input: RendicontoXlsxInput;
  propertyName: string;
  periodLabel: string; // "Luglio 2026"
}

/**
 * Prepara i dati per l'Excel del rendiconto owner (ciclo 25→25 che chiude il 25
 * del mese indicato). SEMPRE scopato per ownerId (guardrail #3). Ritorna null se
 * periodo non valido, owner inesistente o nessuna property. La sezione A elenca
 * anche le prenotazioni cancellate (Conta?=0), coerente col template Excel.
 */
export async function getRendicontoXlsx(ownerId: string, period: string): Promise<RendicontoXlsxMeta | null> {
  const parsed = parsePeriod(period);
  if (!parsed) return null;
  const { year, monthIdx } = parsed;

  const usersCol = await collections.users();
  const owner = await usersCol.findOne({ _id: new ObjectId(ownerId) });
  if (!owner) return null;

  const propsCol = await collections.properties();
  const props = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  if (props.length === 0) return null;
  const property = props[0];
  const feeRate = feeRateForProperty(property);

  const { from, to } = cycleBounds(year, monthIdx);

  const bookingsCol = await collections.bookings();
  const all = (await bookingsCol
    .find({ ownerId: new ObjectId(ownerId), checkIn: { $gte: from, $lt: to } })
    .toArray()) as BookingDoc[];
  all.sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());

  const bookings: XlsxBooking[] = all.map((b) => {
    const p = b.pricing || {};
    const room = p.roomRevenue ?? Math.max(0, (p.totalAmount ?? 0) - (p.cleaningFee ?? 0));
    return {
      guest: b.guestInfo?.name || "—",
      channel: channelLabel(b.source),
      checkIn: dm(b.checkIn),
      checkOut: dm(b.checkOut),
      nights: b.nights,
      guests: b.guests,
      room,
      cleaning: p.cleaningFee ?? 0,
      ota: p.commissionAmount ?? 0,
      cedolare: p.cedolare ?? 0,
      parking: p.parking ?? 0,
      extra: p.extraNight ?? 0,
      counts: b.status !== "cancelled",
    };
  });

  const parking: XlsxParking[] = all
    .filter((b) => b.status !== "cancelled" && (b.pricing?.parking ?? 0) > 0)
    .map((b) => ({ guest: b.guestInfo?.name || "—", nights: b.nights, amount: b.pricing!.parking! }));

  // Finestra di disponibilità = dal primo check-in all'ultimo check-out (solo
  // prenotazioni valide). La griglia notti alimenta occupancy + grafico prezzo.
  const counted = all.filter((b) => b.status !== "cancelled");
  const nightGrid: { label: string; bookingIndex: number | null }[] = [];
  let availLabel = "";
  if (counted.length > 0) {
    const start = new Date(Math.min(...counted.map((b) => b.checkIn.getTime())));
    const end = new Date(Math.max(...counted.map((b) => b.checkOut.getTime())));
    const dayMs = 24 * 60 * 60 * 1000;
    for (let t = start.getTime(); t < end.getTime(); t += dayMs) {
      const d = new Date(t);
      const idx = all.findIndex((b) => b.status !== "cancelled" && b.checkIn.getTime() <= t && t < b.checkOut.getTime());
      nightGrid.push({ label: dm(d), bookingIndex: idx >= 0 ? idx : null });
    }
    const lastNight = new Date(end.getTime() - dayMs);
    availLabel = `${dm(start)}–${dm(lastNight)}`;
  }

  const periodLabel = `${MONTHS_IT[monthIdx]} ${year}`;
  const rangeTitle = counted.length > 0 ? `${nightGrid.length ? dm(new Date(Math.min(...counted.map((b) => b.checkIn.getTime())))) : dm(from)} – ${dmy(to)}` : `${dm(from)} – ${dmy(to)}`;

  const input: RendicontoXlsxInput = {
    titleIt: `Rendiconto — ${property.name} · ${rangeTitle}`,
    titleEn: `Owner Statement — ${property.name} · ${rangeTitle}`,
    feeRate,
    bookings,
    parking,
    nightGrid,
    availLabelIt: availLabel,
    availLabelEn: availLabel,
  };

  return { input, propertyName: property.name, periodLabel };
}
