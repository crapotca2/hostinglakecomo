import { collections } from "@/lib/mongodb/collections";
import { ObjectId } from "mongodb";
import type { BookingDoc, PropertyDoc } from "@/types/database";

export interface TaxRow {
  propertyId: string;
  propertyName: string;
  bookingCount: number;
  totalNights: number;
  totalGuests: number;
  /** Dovuta al comune = 3€ × ospiti × notti (per tutte le prenotazioni valide). */
  taxDue: number;
  /** Effettivamente incassata dall'ospite (Airbnb: nel payout; Booking: in loco). */
  taxCollected: number;
  /** Da incassare (ospite in arrivo / non ancora saldata). */
  taxPending: number;
  /** Non incassata (ospite partito senza pagare) → a carico del team. */
  taxUncollected: number;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Tassa di soggiorno DA VERSARE al comune. A differenza del rendiconto (ciclo
 * 25→25), l'adempimento verso il comune è per **mese solare** (1 → ultimo giorno
 * del mese), come l'export ISTAT. Le presenze sono le notti-ospite ricadenti nel
 * mese (uno stay a cavallo conta solo le sue notti del mese).
 */
export async function generateTouristTaxReport(
  month: number,
  year: number,
  ownerId: string
): Promise<{
  rows: TaxRow[];
  totalDue: number;
  totalCollected: number;
  totalPending: number;
  totalUncollected: number;
}> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59); // ultimo giorno del mese solare

  const properties = (await propsCol
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray()) as PropertyDoc[];
  const rows: TaxRow[] = [];
  let totalDue = 0, totalCollected = 0, totalPending = 0, totalUncollected = 0;

  for (const p of properties) {
    const allBookings = (await bookingsCol.find({ propertyId: p._id as ObjectId }).toArray()) as BookingDoc[];
    const bookings = allBookings.filter(
      (b) => b.status !== "cancelled" && b.checkIn <= end && b.checkOut >= start
    );
    if (bookings.length === 0) continue;

    const rate = p.touristTaxRate || 0;
    const dayMs = 24 * 60 * 60 * 1000;

    let due = 0, collected = 0, pending = 0, uncollected = 0, nights = 0, guests = 0;
    for (const b of bookings) {
      // Presenze = notti-ospite che ricadono nel mese solare [start,end] (come
      // ISTAT): uno stay a cavallo del mese conta solo le sue notti nel mese.
      let nightsInRange = 0;
      for (let d = new Date(b.checkIn); d < b.checkOut; d = new Date(d.getTime() + dayMs)) {
        if (d >= start && d <= end) nightsInRange++;
      }
      const presences = nightsInRange * b.guests;
      const dueB = presences * rate; // 3€ × presenze
      due += dueB;
      nights += nightsInRange;
      guests += b.guests;
      const st = b.touristTaxStatus ?? "collected";
      if (st === "uncollected") uncollected += dueB;
      else if (st === "pending") pending += dueB;
      else collected += dueB;
    }

    rows.push({
      propertyId: p._id!.toString(),
      propertyName: p.name,
      bookingCount: bookings.length,
      totalNights: nights,
      totalGuests: guests,
      taxDue: r2(due),
      taxCollected: r2(collected),
      taxPending: r2(pending),
      taxUncollected: r2(uncollected),
    });
    totalDue += due; totalCollected += collected;
    totalPending += pending; totalUncollected += uncollected;
  }

  return {
    rows,
    totalDue: r2(totalDue),
    totalCollected: r2(totalCollected),
    totalPending: r2(totalPending),
    totalUncollected: r2(totalUncollected),
  };
}
