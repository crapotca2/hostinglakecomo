import type { BookingDoc, PropertyDoc } from "@/types/database";

/**
 * Modello rendiconto Host Como (fonte: rendiconto Excel Aqua Vista di Splendore).
 *
 *   NETTO PROPRIETARIO = (ricavi alloggio + notte extra)
 *                        − commissioni OTA
 *                        − cedolare secca 21%
 *                        − commissione Host Como (rate × ricavi alloggio)
 *
 * - La **commissione Host Como è sui soli ricavi alloggio** (esclusi pulizie,
 *   parcheggio, tassa) e la sua **aliquota varia per immobile** (per Splendore 15%).
 * - **Pulizie** e **tassa di soggiorno** sono partite di giro (incassate e girate a
 *   impresa/comune) → fuori dal netto.
 * - Il **parcheggio** è una partita separata **50/50** (metà proprietario, metà gestione).
 * - La **cedolare 21%** è anticipo d'imposta trattenuto dall'OTA per conto del
 *   proprietario: riduce il "netto a banca" ma è imposta del proprietario, non un costo.
 */

/** Aliquota di default quando l'immobile non ne dichiara una propria. */
export const DEFAULT_MANAGEMENT_FEE_RATE = 0.1;

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface BookingBreakdown {
  roomRevenue: number; // alloggio (ex pulizie)
  extraNight: number; // notte extra diretta
  totalRevenue: number; // roomRevenue + extraNight
  cleaning: number; // pass-through
  otaCommission: number;
  cedolare: number; // 21% (trattenuta OTA)
  managementFee: number; // Host Como = rate × roomRevenue
  managementFeeRate: number;
  touristTax: number; // pass-through
  parking: number; // partita 50/50
  parkingOwner: number; // 50% al proprietario
  netPayout: number; // netto al proprietario (esclude pass-through e parcheggio)
}

/** Aliquota gestione per un immobile (default se non impostata). */
export function feeRateForProperty(p?: Pick<PropertyDoc, "managementFeeRate"> | null): number {
  return p?.managementFeeRate ?? DEFAULT_MANAGEMENT_FEE_RATE;
}

/**
 * Scompone una prenotazione secondo il modello. `feeRate` è l'aliquota
 * dell'immobile; se la prenotazione porta già `pricing.managementFeeRate`
 * quella ha precedenza (denormalizzata al seed/sync).
 */
export function breakdownForBooking(b: BookingDoc, feeRate: number): BookingBreakdown {
  const p = b.pricing || ({} as BookingDoc["pricing"]);
  const cleaning = p.cleaningFee ?? 0;
  const gross = p.totalAmount ?? 0; // alloggio + pulizie (lordo OTA)
  const roomRevenue = p.roomRevenue ?? round2(gross - cleaning);
  const extraNight = p.extraNight ?? 0;
  const otaCommission = p.commissionAmount ?? 0;
  const cedolare = p.cedolare ?? round2(gross * 0.21);
  const rate = p.managementFeeRate ?? feeRate;
  const managementFee = round2(roomRevenue * rate);
  const touristTax = p.touristTax ?? 0;
  const parking = p.parking ?? 0;
  const totalRevenue = round2(roomRevenue + extraNight);
  const netPayout = round2(totalRevenue - otaCommission - cedolare - managementFee);
  return {
    roomRevenue,
    extraNight,
    totalRevenue,
    cleaning,
    otaCommission,
    cedolare,
    managementFee,
    managementFeeRate: rate,
    touristTax,
    parking,
    parkingOwner: round2(parking * 0.5),
    netPayout,
  };
}

export interface AggregateBreakdown {
  roomRevenue: number;
  extraNight: number;
  totalRevenue: number;
  cleaning: number;
  otaCommission: number;
  cedolare: number;
  managementFee: number;
  touristTax: number;
  parking: number;
  parkingOwner: number;
  netPayout: number;
  bookingCount: number;
}

const ZERO: AggregateBreakdown = {
  roomRevenue: 0, extraNight: 0, totalRevenue: 0, cleaning: 0, otaCommission: 0,
  cedolare: 0, managementFee: 0, touristTax: 0, parking: 0, parkingOwner: 0,
  netPayout: 0, bookingCount: 0,
};

/** Somma le scomposizioni di un insieme di prenotazioni (rate per-property via `rateOf`). */
export function aggregateBreakdown(
  bookings: BookingDoc[],
  rateOf: (b: BookingDoc) => number,
): AggregateBreakdown {
  const acc = { ...ZERO };
  for (const b of bookings) {
    const d = breakdownForBooking(b, rateOf(b));
    acc.roomRevenue += d.roomRevenue;
    acc.extraNight += d.extraNight;
    acc.totalRevenue += d.totalRevenue;
    acc.cleaning += d.cleaning;
    acc.otaCommission += d.otaCommission;
    acc.cedolare += d.cedolare;
    acc.managementFee += d.managementFee;
    acc.touristTax += d.touristTax;
    acc.parking += d.parking;
    acc.parkingOwner += d.parkingOwner;
    acc.netPayout += d.netPayout;
    acc.bookingCount += 1;
  }
  for (const k of Object.keys(acc) as (keyof AggregateBreakdown)[]) {
    if (k !== "bookingCount") acc[k] = round2(acc[k]);
  }
  return acc;
}
