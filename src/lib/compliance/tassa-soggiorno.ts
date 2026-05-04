import { collections } from "@/lib/mongodb/collections";
import { ObjectId } from "mongodb";
import type { BookingDoc, PropertyDoc } from "@/types/database";

export interface TaxRow {
  propertyId: string;
  propertyName: string;
  bookingCount: number;
  totalNights: number;
  totalGuests: number;
  taxCollected: number;
  taxOwed: number;
}

export async function generateTouristTaxReport(
  from: Date,
  to: Date
): Promise<{ rows: TaxRow[]; totalOwed: number }> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();

  const properties = (await propsCol.find({}).toArray()) as PropertyDoc[];
  const rows: TaxRow[] = [];
  let totalOwed = 0;

  for (const p of properties) {
    const allBookings = (await bookingsCol.find({ propertyId: p._id as ObjectId }).toArray()) as BookingDoc[];
    const bookings = allBookings.filter(
      (b) =>
        b.status !== "cancelled" &&
        b.checkOut > from &&
        b.checkIn < to
    );

    const bookingCount = bookings.length;
    const maxNights = p.maxTouristTaxNights || 5;
    const totalNights = bookings.reduce((s, b) => s + Math.min(b.nights, maxNights), 0);
    const totalGuests = bookings.reduce((s, b) => s + b.guests, 0);
    const taxCollected = bookings.reduce((s, b) => s + (b.pricing?.touristTax || 0), 0);

    const rate = p.touristTaxRate || 0;
    const taxOwed = bookings.reduce((s, b) => {
      const nights = Math.min(b.nights, maxNights);
      return s + nights * b.guests * rate;
    }, 0);

    if (bookingCount > 0) {
      rows.push({
        propertyId: p._id!.toString(),
        propertyName: p.name,
        bookingCount,
        totalNights,
        totalGuests,
        taxCollected,
        taxOwed,
      });
      totalOwed += taxOwed;
    }
  }

  return { rows, totalOwed };
}
