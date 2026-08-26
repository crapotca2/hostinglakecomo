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

export async function generateTouristTaxReport(
  from: Date,
  to: Date,
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

  const properties = (await propsCol
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray()) as PropertyDoc[];
  const rows: TaxRow[] = [];
  let totalDue = 0, totalCollected = 0, totalPending = 0, totalUncollected = 0;

  for (const p of properties) {
    const allBookings = (await bookingsCol.find({ propertyId: p._id as ObjectId }).toArray()) as BookingDoc[];
    const bookings = allBookings.filter(
      (b) => b.status !== "cancelled" && b.checkOut > from && b.checkIn < to
    );
    if (bookings.length === 0) continue;

    const rate = p.touristTaxRate || 0;
    // Tetto notti opzionale: se non impostato (o 0) → nessun tetto (Argegno).
    const maxNights =
      p.maxTouristTaxNights && p.maxTouristTaxNights > 0
        ? p.maxTouristTaxNights
        : Infinity;

    let due = 0, collected = 0, pending = 0, uncollected = 0, nights = 0, guests = 0;
    for (const b of bookings) {
      const taxableNights = Math.min(b.nights, maxNights);
      const dueB = taxableNights * b.guests * rate;
      // Importo effettivo per prenotazione: usa quello salvato se presente.
      const amount = b.pricing?.touristTax ?? dueB;
      due += dueB;
      nights += taxableNights;
      guests += b.guests;
      const st = b.touristTaxStatus ?? "collected";
      if (st === "uncollected") uncollected += amount;
      else if (st === "pending") pending += amount;
      else collected += amount;
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
