import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PaymentDoc, PropertyDoc } from "@/types/database";

export interface BookingSummaryRow {
  period: string;
  bookings: number;
  nights: number;
  guests: number;
  revenue: number;
  avgRate: number;
  avgStay: number;
}

export async function getBookingsSummary(from: Date, to: Date, ownerId: string, groupBy: "day" | "week" | "month" = "month"): Promise<BookingSummaryRow[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to
  );

  const buckets = new Map<string, { bookings: number; nights: number; guests: number; revenue: number }>();
  for (const b of bookings) {
    let key: string;
    const d = b.checkIn;
    if (groupBy === "day") key = d.toISOString().slice(0, 10);
    else if (groupBy === "week") {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay());
      key = start.toISOString().slice(0, 10);
    } else key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const prev = buckets.get(key) || { bookings: 0, nights: 0, guests: 0, revenue: 0 };
    prev.bookings += 1;
    prev.nights += b.nights;
    prev.guests += b.guests;
    prev.revenue += b.pricing?.totalAmount || 0;
    buckets.set(key, prev);
  }

  const rows: BookingSummaryRow[] = Array.from(buckets.entries())
    .map(([period, v]) => ({
      period,
      bookings: v.bookings,
      nights: v.nights,
      guests: v.guests,
      revenue: Math.round(v.revenue),
      avgRate: v.nights > 0 ? Math.round(v.revenue / v.nights) : 0,
      avgStay: v.bookings > 0 ? Math.round((v.nights / v.bookings) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
  return rows;
}

export interface PaymentSummaryRow {
  period: string;
  count: number;
  succeeded: number;
  failed: number;
  refunded: number;
  totalAmount: number;
  netAmount: number;
}

export async function getPaymentsSummary(from: Date, to: Date, ownerId: string): Promise<PaymentSummaryRow[]> {
  // PaymentDoc non ha ownerId: si scopa via i booking dell'owner (bookingId).
  const bookingsCol = await collections.bookings();
  const bIds = (
    (await bookingsCol
      .find({ ownerId: new ObjectId(ownerId) })
      .toArray()) as BookingDoc[]
  )
    .map((b) => b._id)
    .filter((id): id is ObjectId => Boolean(id));
  const paymentsCol = await collections.payments();
  const allPayments = (await paymentsCol
    .find({ bookingId: { $in: bIds } })
    .toArray()) as PaymentDoc[];
  const payments = allPayments.filter((p) => p.createdAt >= from && p.createdAt <= to);

  const buckets = new Map<string, { count: number; succeeded: number; failed: number; refunded: number; total: number }>();
  for (const p of payments) {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const prev = buckets.get(key) || { count: 0, succeeded: 0, failed: 0, refunded: 0, total: 0 };
    prev.count += 1;
    if (p.status === "succeeded") { prev.succeeded += 1; prev.total += p.amount; }
    if (p.status === "failed") prev.failed += 1;
    if (p.status === "refunded") { prev.refunded += 1; prev.total -= p.amount; }
    buckets.set(key, prev);
  }

  return Array.from(buckets.entries())
    .map(([period, v]) => ({
      period,
      count: v.count,
      succeeded: v.succeeded,
      failed: v.failed,
      refunded: v.refunded,
      totalAmount: Math.round(v.total),
      netAmount: Math.round(v.total * 0.971), // 2.9% Stripe fee estimate
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export interface TaxSummaryRow {
  propertyId: string;
  propertyName: string;
  bookings: number;
  guestNights: number;
  touristTax: number;
  grossRevenue: number;
  cedolareSeccaEstimate: number;
}

export async function getTaxesSummary(from: Date, to: Date, ownerId: string): Promise<TaxSummaryRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

  const rows: TaxSummaryRow[] = [];
  for (const p of properties) {
    const pid = p._id!.toString();
    const bookings = allBookings.filter(
      (b) => b.propertyId.toString() === pid && b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to
    );
    if (bookings.length === 0) continue;

    const touristTax = bookings.reduce((s, b) => s + (b.pricing?.touristTax || 0), 0);
    const grossRevenue = bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
    const guestNights = bookings.reduce((s, b) => s + b.guests * b.nights, 0);
    const cedolareSeccaEstimate = grossRevenue * 0.21; // 21% cedolare secca

    rows.push({
      propertyId: pid,
      propertyName: p.name,
      bookings: bookings.length,
      guestNights,
      touristTax: Math.round(touristTax * 100) / 100,
      grossRevenue: Math.round(grossRevenue),
      cedolareSeccaEstimate: Math.round(cedolareSeccaEstimate),
    });
  }
  return rows.sort((a, b) => b.grossRevenue - a.grossRevenue);
}
