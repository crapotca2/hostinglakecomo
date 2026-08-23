import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PaymentDoc, PropertyDoc } from "@/types/database";

export interface BookingDetailRow {
  bookingId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: string;
  source: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  nightlyRate: number;
  cleaningFee: number;
  touristTax: number;
  commission: number;
  totalAmount: number;
  ownerPayout: number;
  createdAt: string;
}

export async function getBookingsDetail(from: Date, to: Date, ownerId: string): Promise<BookingDetailRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const allProps = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));

  const bookings = allBookings.filter((b) => b.checkIn >= from && b.checkIn <= to);
  return bookings
    .map((b) => ({
      bookingId: b._id!.toString(),
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10),
      nights: b.nights,
      guests: b.guests,
      status: b.status,
      source: b.source,
      propertyName: propMap.get(b.propertyId.toString()) || "—",
      guestName: b.guestInfo.name,
      guestEmail: b.guestInfo.email,
      guestPhone: b.guestInfo.phone || "",
      guestCountry: b.guestInfo.nationality || "",
      nightlyRate: b.pricing?.nightlyRate || 0,
      cleaningFee: b.pricing?.cleaningFee || 0,
      touristTax: b.pricing?.touristTax || 0,
      commission: b.pricing?.commissionAmount || 0,
      totalAmount: b.pricing?.totalAmount || 0,
      ownerPayout: b.pricing?.ownerPayout || 0,
      createdAt: b.createdAt.toISOString(),
    }))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}

export interface NameCrosscheckRow {
  guestName: string;
  bookingCount: number;
  emails: string[];
  phones: string[];
  properties: string[];
  firstBooking: string;
  lastBooking: string;
  totalSpent: number;
}

export async function getNameCrosscheck(ownerId: string): Promise<NameCrosscheckRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const allProps = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));

  const byName = new Map<string, BookingDoc[]>();
  for (const b of allBookings) {
    if (b.status === "cancelled") continue;
    const key = b.guestInfo.name.trim().toLowerCase();
    const prev = byName.get(key) || [];
    prev.push(b);
    byName.set(key, prev);
  }

  const rows: NameCrosscheckRow[] = [];
  for (const [, bookings] of Array.from(byName.entries())) {
    if (bookings.length < 2) continue;
    const emails = Array.from(new Set(bookings.map((b) => b.guestInfo.email).filter(Boolean)));
    const phones = Array.from(new Set(bookings.map((b) => b.guestInfo.phone).filter(Boolean) as string[]));
    const properties = Array.from(new Set(bookings.map((b) => propMap.get(b.propertyId.toString()) || "—")));
    const sorted = bookings.sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
    rows.push({
      guestName: bookings[0].guestInfo.name,
      bookingCount: bookings.length,
      emails,
      phones,
      properties,
      firstBooking: sorted[0].checkIn.toISOString().slice(0, 10),
      lastBooking: sorted[sorted.length - 1].checkIn.toISOString().slice(0, 10),
      totalSpent: Math.round(bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0)),
    });
  }
  return rows.sort((a, b) => b.bookingCount - a.bookingCount);
}

export interface EmailListRow {
  email: string;
  guestName: string;
  lastBooking: string;
  totalBookings: number;
  totalSpent: number;
  country: string;
}

export async function getEmailList(ownerId: string): Promise<EmailListRow[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

  const byEmail = new Map<string, BookingDoc[]>();
  for (const b of allBookings) {
    if (!b.guestInfo.email) continue;
    if (b.status === "cancelled") continue;
    const key = b.guestInfo.email.toLowerCase();
    const prev = byEmail.get(key) || [];
    prev.push(b);
    byEmail.set(key, prev);
  }

  const rows: EmailListRow[] = [];
  for (const [email, bookings] of Array.from(byEmail.entries())) {
    const sorted = bookings.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
    rows.push({
      email,
      guestName: sorted[0].guestInfo.name,
      lastBooking: sorted[0].checkIn.toISOString().slice(0, 10),
      totalBookings: bookings.length,
      totalSpent: Math.round(bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0)),
      country: sorted[0].guestInfo.nationality || "",
    });
  }
  return rows.sort((a, b) => b.lastBooking.localeCompare(a.lastBooking));
}

export interface PaymentDetailRow {
  paymentId: string;
  createdAt: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  stripeSessionId: string;
  bookingId: string;
}

export async function getPaymentsDetail(from: Date, to: Date, ownerId: string): Promise<PaymentDetailRow[]> {
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
  const all = (await paymentsCol
    .find({ bookingId: { $in: bIds } })
    .toArray()) as PaymentDoc[];
  const filtered = all.filter((p) => p.createdAt >= from && p.createdAt <= to);
  return filtered
    .map((p) => ({
      paymentId: p._id!.toString(),
      createdAt: p.createdAt.toISOString(),
      type: p.type,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      stripePaymentIntentId: p.stripePaymentIntentId,
      stripeSessionId: p.stripeSessionId || "",
      bookingId: p.bookingId?.toString() || "",
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface TaxDetailRow {
  bookingId: string;
  propertyName: string;
  checkIn: string;
  guests: number;
  nights: number;
  touristTax: number;
  revenue: number;
  cedolareSecca: number;
}

export async function getTaxesDetail(from: Date, to: Date, ownerId: string): Promise<TaxDetailRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const allProps = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));

  return allBookings
    .filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to)
    .map((b) => ({
      bookingId: b._id!.toString(),
      propertyName: propMap.get(b.propertyId.toString()) || "—",
      checkIn: b.checkIn.toISOString().slice(0, 10),
      guests: b.guests,
      nights: b.nights,
      touristTax: Math.round((b.pricing?.touristTax || 0) * 100) / 100,
      revenue: Math.round(b.pricing?.totalAmount || 0),
      cedolareSecca: Math.round((b.pricing?.totalAmount || 0) * 0.21),
    }))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}

export interface ListingFeeRow {
  source: string;
  bookings: number;
  grossRevenue: number;
  commissionRate: number;
  totalFees: number;
  netRevenue: number;
}

export async function getListingSiteFees(from: Date, to: Date, ownerId: string): Promise<ListingFeeRow[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to
  );

  const bySource = new Map<string, { bookings: number; gross: number; fees: number; rates: number[] }>();
  for (const b of bookings) {
    const key = b.source;
    const prev = bySource.get(key) || { bookings: 0, gross: 0, fees: 0, rates: [] };
    prev.bookings += 1;
    prev.gross += b.pricing?.totalAmount || 0;
    prev.fees += b.pricing?.commissionAmount || 0;
    prev.rates.push(b.pricing?.commissionRate || 0);
    bySource.set(key, prev);
  }

  const rows: ListingFeeRow[] = [];
  for (const [source, v] of Array.from(bySource.entries())) {
    const avgRate = v.rates.length > 0 ? v.rates.reduce((s, r) => s + r, 0) / v.rates.length : 0;
    rows.push({
      source,
      bookings: v.bookings,
      grossRevenue: Math.round(v.gross),
      commissionRate: Math.round(avgRate * 1000) / 10,
      totalFees: Math.round(v.fees),
      netRevenue: Math.round(v.gross - v.fees),
    });
  }
  return rows.sort((a, b) => b.totalFees - a.totalFees);
}

export interface CCHistoryRow {
  paymentId: string;
  createdAt: string;
  amount: number;
  status: string;
  stripeIntent: string;
  type: string;
}

export async function getCreditCardHistory(from: Date, to: Date, ownerId: string): Promise<CCHistoryRow[]> {
  const bookingsCol = await collections.bookings();
  const bIds = (
    (await bookingsCol
      .find({ ownerId: new ObjectId(ownerId) })
      .toArray()) as BookingDoc[]
  )
    .map((b) => b._id)
    .filter((id): id is ObjectId => Boolean(id));
  const paymentsCol = await collections.payments();
  const all = (await paymentsCol
    .find({ bookingId: { $in: bIds } })
    .toArray()) as PaymentDoc[];
  return all
    .filter((p) => p.stripePaymentIntentId && p.createdAt >= from && p.createdAt <= to)
    .map((p) => ({
      paymentId: p._id!.toString(),
      createdAt: p.createdAt.toISOString(),
      amount: p.amount,
      status: p.status,
      stripeIntent: p.stripePaymentIntentId,
      type: p.type,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
