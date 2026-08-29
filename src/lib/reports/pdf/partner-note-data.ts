import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { billingCycle, cycleBounds } from "@/lib/reports/period";
import { feeRateForProperty } from "@/lib/reports/fee-model";
import type { BookingDoc, PropertyDoc, UserDoc, PartnerAdjustmentEntry } from "@/types/database";
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
  feePct: number; // % Host Como (aliquota piena, es. 15)
  pagamento: number; // quota del socio = alloggio × fee% ÷ 2 (già dimezzata)
}

export interface PartnerNoteMonth {
  label: string; // "Luglio"
  rows: PartnerNoteRow[];
  total: number; // somma pagamento del mese = quota consulenza del socio nel mese
}

export interface PartnerNoteData {
  partner: PartnerConfig;
  recipient: { name: string; addressLines: string[]; fiscalCode?: string };
  place: string;
  dateLabel: string; // DD/MM/YYYY
  periodLabel: string; // "luglio e agosto 2026"
  propertyName: string;
  months: PartnerNoteMonth[];
  consulenza: number; // = Σ month.total (quota socio = fee immobile ÷ 2)
  inps: number; // 4% sulla sola consulenza
  lordo: number; // lordo da versare = consulenza + inps
  parcheggio: number; // quota parcheggio del socio = Σ parcheggio × 25% (si aggiunge)
  favore: number; // voce manuale una tantum a questo socio nel periodo (si aggiunge)
  favoreNote?: string; // etichetta del favore (es. "check-in amici di Alessandro")
  acconto: number; // contante incassato in loco DA QUESTO socio (si sottrae)
  accontoGuests: string[]; // ospiti i cui contanti sono in mano al socio (per l'etichetta)
  totale: number; // lordo + parcheggio + favore − acconto
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

  // Raggruppa per CICLO 25→25 (come il rendiconto Host Como): il mese di
  // competenza è quello in cui il ciclo chiude il 25. Es. un check-in del 30/07
  // rientra nel ciclo di agosto. Il pagamento per riga è GIÀ la quota del socio:
  // alloggio × fee% ÷ 2 (niente più "Entrate : 2").
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
      pagamento: r2((alloggio * feeRate) / 2),
    };
    const { monthIdx: mi } = billingCycle(b.checkIn);
    const arr = byMonth.get(mi) || [];
    arr.push(row);
    byMonth.set(mi, arr);
  }

  const months: PartnerNoteMonth[] = Array.from(byMonth.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([mi, rows]) => ({
      label: MONTHS_IT[mi][0].toUpperCase() + MONTHS_IT[mi].slice(1),
      rows,
      total: r2(rows.reduce((s, r) => s + r.pagamento, 0)),
    }));

  // Parcheggio: partita separata 50/50 (proprietario/Host Como); la quota Host
  // Como (50%) è poi divisa 50/50 tra i due soci → 25% a testa del parcheggio.
  const parcheggio = r2(counted.reduce((s, b) => s + (b.pricing?.parking ?? 0) * 0.25, 0));

  // Rettifiche manuali per cassa (favori + acconti incassati in loco). Imputate
  // al periodo di regolazione, non al ciclo del check-in (un acconto può riferirsi
  // a una prenotazione di un altro ciclo). period "all" = tutte quelle del socio.
  const adjCol = await collections.partnerAdjustments();
  const adj = await adjCol.findOne({ ownerId: new ObjectId(ownerId) });
  const entries = ((adj?.entries ?? []) as PartnerAdjustmentEntry[]).filter(
    (e) => e.partner === partnerKey && (period === "all" || e.period === period),
  );
  const favoreEntries = entries.filter((e) => e.kind === "favore");
  const accontoEntries = entries.filter((e) => e.kind === "acconto");
  const favore = r2(favoreEntries.reduce((s, e) => s + e.amount, 0));
  const favoreNote = favoreEntries.find((e) => e.note)?.note;
  const acconto = r2(accontoEntries.reduce((s, e) => s + e.amount, 0));
  const accontoGuests = accontoEntries.map((e) => e.note).filter((n): n is string => !!n);

  const consulenza = r2(months.reduce((s, m) => s + m.total, 0));
  // Rivalsa INPS 4% opzionale per immobile (property.inpsRivalsa === false → niente INPS).
  const inps = property.inpsRivalsa === false ? 0 : r2(consulenza * INPS_RATE);
  const lordo = r2(consulenza + inps); // lordo da versare (= consulenza se senza INPS)
  const totale = r2(lordo + parcheggio + favore - acconto);

  const year = counted.length > 0 ? billingCycle(counted[0].checkIn).year : new Date().getUTCFullYear();
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
    lordo,
    parcheggio,
    favore,
    favoreNote,
    acconto,
    accontoGuests,
    totale,
  };
}
