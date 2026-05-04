import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PropertyDoc } from "@/types/database";

export interface CommissionSummaryRow {
  source: string;
  bookings: number;
  grossRevenue: number;
  otaCommission: number;
  airbibbyCommission: number;
  totalCommission: number;
  ownerPayout: number;
}

const AIRBIBBY_RATE = 0.10;

export async function getCommissionSummary(from: Date, to: Date): Promise<CommissionSummaryRow[]> {
  const bookingsCol = await collections.bookings();
  const all = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const bookings = all.filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to);

  const bySource = new Map<string, BookingDoc[]>();
  for (const b of bookings) {
    const prev = bySource.get(b.source) || [];
    prev.push(b);
    bySource.set(b.source, prev);
  }

  const rows: CommissionSummaryRow[] = [];
  for (const [source, list] of Array.from(bySource.entries())) {
    const grossRevenue = list.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
    const otaCommission = list.reduce((s, b) => s + (b.pricing?.commissionAmount || 0), 0);
    const airbibbyCommission = grossRevenue * AIRBIBBY_RATE;
    const ownerPayout = list.reduce((s, b) => s + (b.pricing?.ownerPayout || 0), 0);
    rows.push({
      source,
      bookings: list.length,
      grossRevenue: Math.round(grossRevenue),
      otaCommission: Math.round(otaCommission),
      airbibbyCommission: Math.round(airbibbyCommission),
      totalCommission: Math.round(otaCommission + airbibbyCommission),
      ownerPayout: Math.round(ownerPayout),
    });
  }
  return rows.sort((a, b) => b.grossRevenue - a.grossRevenue);
}

export interface CommissionDetailRow {
  bookingId: string;
  checkIn: string;
  propertyName: string;
  guestName: string;
  source: string;
  nights: number;
  grossRevenue: number;
  otaCommissionRate: number;
  otaCommission: number;
  airbibbyCommission: number;
  ownerPayout: number;
}

export async function getCommissionDetail(from: Date, to: Date): Promise<CommissionDetailRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const allProps = (await propsCol.find({}).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));

  return allBookings
    .filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to)
    .map((b) => {
      const gross = b.pricing?.totalAmount || 0;
      return {
        bookingId: b._id!.toString(),
        checkIn: b.checkIn.toISOString().slice(0, 10),
        propertyName: propMap.get(b.propertyId.toString()) || "—",
        guestName: b.guestInfo.name,
        source: b.source,
        nights: b.nights,
        grossRevenue: Math.round(gross),
        otaCommissionRate: Math.round((b.pricing?.commissionRate || 0) * 1000) / 10,
        otaCommission: Math.round(b.pricing?.commissionAmount || 0),
        airbibbyCommission: Math.round(gross * AIRBIBBY_RATE),
        ownerPayout: Math.round(b.pricing?.ownerPayout || 0),
      };
    })
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}

export interface OwnerRemittanceRow {
  period: string;
  bookings: number;
  grossRevenue: number;
  otaCommissions: number;
  airbibbyCommission: number;
  operatingExpenses: number;
  touristTax: number;
  netPayout: number;
}

export async function getOwnerRemittanceSummary(year: number): Promise<OwnerRemittanceRow[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn.getFullYear() === year
  );

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    bookings: [] as BookingDoc[],
  }));
  for (const b of bookings) months[b.checkIn.getMonth()].bookings.push(b);

  return months
    .filter((m) => m.bookings.length > 0)
    .map((m) => {
      const gross = m.bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
      const ota = m.bookings.reduce((s, b) => s + (b.pricing?.commissionAmount || 0), 0);
      const ab = gross * AIRBIBBY_RATE;
      const expenses = gross * 0.05;
      const tax = m.bookings.reduce((s, b) => s + (b.pricing?.touristTax || 0), 0);
      const netPayout = gross - ota - ab - expenses - tax;
      return {
        period: `${year}-${String(m.month + 1).padStart(2, "0")}`,
        bookings: m.bookings.length,
        grossRevenue: Math.round(gross),
        otaCommissions: Math.round(ota),
        airbibbyCommission: Math.round(ab),
        operatingExpenses: Math.round(expenses),
        touristTax: Math.round(tax * 100) / 100,
        netPayout: Math.round(netPayout),
      };
    });
}

export interface OwnerRemittanceDetailRow {
  period: string;
  propertyName: string;
  bookings: number;
  nights: number;
  grossRevenue: number;
  otaCommissions: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
}

export async function getOwnerRemittanceDetail(from: Date, to: Date): Promise<OwnerRemittanceDetailRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({}).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];

  const rows: OwnerRemittanceDetailRow[] = [];
  const monthsInRange = new Set<string>();
  for (let d = new Date(from); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    monthsInRange.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  for (const period of Array.from(monthsInRange)) {
    const [yStr, mStr] = period.split("-");
    const year = parseInt(yStr, 10);
    const monthIdx = parseInt(mStr, 10) - 1;
    const mStart = new Date(year, monthIdx, 1);
    const mEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59);

    for (const p of properties) {
      const pid = p._id!.toString();
      const bookings = allBookings.filter(
        (b) => b.propertyId.toString() === pid &&
               b.status !== "cancelled" &&
               b.checkIn >= mStart && b.checkIn <= mEnd
      );
      if (bookings.length === 0) continue;

      const gross = bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
      const ota = bookings.reduce((s, b) => s + (b.pricing?.commissionAmount || 0), 0);
      const ab = gross * AIRBIBBY_RATE;
      const expenses = gross * 0.05;
      const tax = bookings.reduce((s, b) => s + (b.pricing?.touristTax || 0), 0);
      const nights = bookings.reduce((s, b) => s + b.nights, 0);

      rows.push({
        period,
        propertyName: p.name,
        bookings: bookings.length,
        nights,
        grossRevenue: Math.round(gross),
        otaCommissions: Math.round(ota),
        airbibbyCommission: Math.round(ab),
        expenses: Math.round(expenses),
        touristTax: Math.round(tax * 100) / 100,
        netPayout: Math.round(gross - ota - ab - expenses - tax),
      });
    }
  }
  return rows.sort((a, b) => b.period.localeCompare(a.period) || a.propertyName.localeCompare(b.propertyName));
}

export interface BookingRemittanceRow {
  period: string;
  bookingId: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  source: string;
  grossRevenue: number;
  otaCommission: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
}

export async function getOwnerStatementBookings(from: Date, to: Date): Promise<BookingRemittanceRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const allProps = (await propsCol.find({}).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];

  return allBookings
    .filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to)
    .map((b) => {
      const gross = b.pricing?.totalAmount || 0;
      const ota = b.pricing?.commissionAmount || 0;
      const ab = gross * AIRBIBBY_RATE;
      const expenses = gross * 0.05;
      const tax = b.pricing?.touristTax || 0;
      return {
        period: `${b.checkIn.getFullYear()}-${String(b.checkIn.getMonth() + 1).padStart(2, "0")}`,
        bookingId: b._id!.toString(),
        propertyName: propMap.get(b.propertyId.toString()) || "—",
        guestName: b.guestInfo.name,
        checkIn: b.checkIn.toISOString().slice(0, 10),
        checkOut: b.checkOut.toISOString().slice(0, 10),
        nights: b.nights,
        source: b.source,
        grossRevenue: Math.round(gross),
        otaCommission: Math.round(ota),
        airbibbyCommission: Math.round(ab),
        expenses: Math.round(expenses),
        touristTax: Math.round(tax * 100) / 100,
        netPayout: Math.round(gross - ota - ab - expenses - tax),
      };
    })
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}
