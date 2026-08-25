import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PropertyDoc } from "@/types/database";
import { breakdownForBooking, feeRateForProperty } from "./fee-model";

async function loadProps(ownerId: string): Promise<{
  propMap: Map<string, string>;
  rateMap: Map<string, number>;
}> {
  const propsCol = await collections.properties();
  const props = (await propsCol
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray()) as PropertyDoc[];
  return {
    propMap: new Map(props.map((p) => [p._id!.toString(), p.name])),
    rateMap: new Map(props.map((p) => [p._id!.toString(), feeRateForProperty(p)])),
  };
}

const rateOfFactory =
  (rateMap: Map<string, number>) => (b: BookingDoc) =>
    rateMap.get(b.propertyId.toString()) ?? 0.1;

export interface CommissionSummaryRow {
  source: string;
  bookings: number;
  grossRevenue: number;
  otaCommission: number;
  airbibbyCommission: number;
  totalCommission: number;
  ownerPayout: number;
}

export async function getCommissionSummary(from: Date, to: Date, ownerId: string): Promise<CommissionSummaryRow[]> {
  const bookingsCol = await collections.bookings();
  const { rateMap } = await loadProps(ownerId);
  const rateOf = rateOfFactory(rateMap);
  const all = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const bookings = all.filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to);

  const bySource = new Map<string, BookingDoc[]>();
  for (const b of bookings) {
    const prev = bySource.get(b.source) || [];
    prev.push(b);
    bySource.set(b.source, prev);
  }

  const rows: CommissionSummaryRow[] = [];
  for (const [source, list] of Array.from(bySource.entries())) {
    let gross = 0, ota = 0, fee = 0, net = 0;
    for (const b of list) {
      const d = breakdownForBooking(b, rateOf(b));
      gross += d.totalRevenue; ota += d.otaCommission; fee += d.managementFee; net += d.netPayout;
    }
    rows.push({
      source,
      bookings: list.length,
      grossRevenue: Math.round(gross),
      otaCommission: Math.round(ota),
      airbibbyCommission: Math.round(fee),
      totalCommission: Math.round(ota + fee),
      ownerPayout: Math.round(net),
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

export async function getCommissionDetail(from: Date, to: Date, ownerId: string): Promise<CommissionDetailRow[]> {
  const bookingsCol = await collections.bookings();
  const { propMap, rateMap } = await loadProps(ownerId);
  const rateOf = rateOfFactory(rateMap);
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

  return allBookings
    .filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to)
    .map((b) => {
      const d = breakdownForBooking(b, rateOf(b));
      return {
        bookingId: b._id!.toString(),
        checkIn: b.checkIn.toISOString().slice(0, 10),
        propertyName: propMap.get(b.propertyId.toString()) || "—",
        guestName: b.guestInfo.name,
        source: b.source,
        nights: b.nights,
        grossRevenue: Math.round(d.totalRevenue),
        otaCommissionRate: Math.round((b.pricing?.commissionRate || 0) * 1000) / 10,
        otaCommission: Math.round(d.otaCommission),
        airbibbyCommission: Math.round(d.managementFee),
        ownerPayout: Math.round(d.netPayout),
      };
    })
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}

export interface OwnerRemittanceRow {
  period: string;
  bookings: number;
  grossRevenue: number;
  otaCommissions: number;
  cedolare: number;
  airbibbyCommission: number;
  operatingExpenses: number;
  touristTax: number;
  netPayout: number;
}

export async function getOwnerRemittanceSummary(year: number, ownerId: string): Promise<OwnerRemittanceRow[]> {
  const bookingsCol = await collections.bookings();
  const { rateMap } = await loadProps(ownerId);
  const rateOf = rateOfFactory(rateMap);
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn.getFullYear() === year
  );

  const months = Array.from({ length: 12 }, (_, i) => ({ month: i, bookings: [] as BookingDoc[] }));
  for (const b of bookings) months[b.checkIn.getMonth()].bookings.push(b);

  return months
    .filter((m) => m.bookings.length > 0)
    .map((m) => {
      let gross = 0, ota = 0, ced = 0, fee = 0, tax = 0, net = 0;
      for (const b of m.bookings) {
        const d = breakdownForBooking(b, rateOf(b));
        gross += d.totalRevenue; ota += d.otaCommission; ced += d.cedolare;
        fee += d.managementFee; tax += d.touristTax; net += d.netPayout;
      }
      return {
        period: `${year}-${String(m.month + 1).padStart(2, "0")}`,
        bookings: m.bookings.length,
        grossRevenue: Math.round(gross),
        otaCommissions: Math.round(ota),
        cedolare: Math.round(ced),
        airbibbyCommission: Math.round(fee),
        operatingExpenses: 0,
        touristTax: Math.round(tax * 100) / 100,
        netPayout: Math.round(net),
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
  cedolare: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
}

export async function getOwnerRemittanceDetail(from: Date, to: Date, ownerId: string): Promise<OwnerRemittanceDetailRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

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
      const rate = feeRateForProperty(p);
      const bookings = allBookings.filter(
        (b) => b.propertyId.toString() === pid &&
               b.status !== "cancelled" &&
               b.checkIn >= mStart && b.checkIn <= mEnd
      );
      if (bookings.length === 0) continue;

      let gross = 0, ota = 0, ced = 0, fee = 0, tax = 0, net = 0, nights = 0;
      for (const b of bookings) {
        const d = breakdownForBooking(b, rate);
        gross += d.totalRevenue; ota += d.otaCommission; ced += d.cedolare;
        fee += d.managementFee; tax += d.touristTax; net += d.netPayout; nights += b.nights;
      }

      rows.push({
        period,
        propertyName: p.name,
        bookings: bookings.length,
        nights,
        grossRevenue: Math.round(gross),
        otaCommissions: Math.round(ota),
        cedolare: Math.round(ced),
        airbibbyCommission: Math.round(fee),
        expenses: 0,
        touristTax: Math.round(tax * 100) / 100,
        netPayout: Math.round(net),
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
  cedolare: number;
  airbibbyCommission: number;
  cleaning: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
}

export async function getOwnerStatementBookings(from: Date, to: Date, ownerId: string): Promise<BookingRemittanceRow[]> {
  const bookingsCol = await collections.bookings();
  const { propMap, rateMap } = await loadProps(ownerId);
  const rateOf = rateOfFactory(rateMap);
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

  return allBookings
    .filter((b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to)
    .map((b) => {
      const d = breakdownForBooking(b, rateOf(b));
      return {
        period: `${b.checkIn.getFullYear()}-${String(b.checkIn.getMonth() + 1).padStart(2, "0")}`,
        bookingId: b._id!.toString(),
        propertyName: propMap.get(b.propertyId.toString()) || "—",
        guestName: b.guestInfo.name,
        checkIn: b.checkIn.toISOString().slice(0, 10),
        checkOut: b.checkOut.toISOString().slice(0, 10),
        nights: b.nights,
        source: b.source,
        grossRevenue: Math.round(d.totalRevenue),
        otaCommission: Math.round(d.otaCommission),
        cedolare: Math.round(d.cedolare),
        airbibbyCommission: Math.round(d.managementFee),
        cleaning: Math.round(d.cleaning),
        expenses: 0,
        touristTax: Math.round(d.touristTax * 100) / 100,
        netPayout: Math.round(d.netPayout),
      };
    })
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}
