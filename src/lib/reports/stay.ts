import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PropertyDoc } from "@/types/database";

export interface DailyChecklistItem {
  type: "checkin" | "checkout" | "inhouse";
  propertyName: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  source: string;
  bookingId: string;
}

export async function getDailyChecklist(ownerId: string, date: Date = new Date()): Promise<DailyChecklistItem[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const allProps = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));

  const items: DailyChecklistItem[] = [];
  for (const b of allBookings) {
    if (b.status === "cancelled") continue;
    const pid = b.propertyId.toString();
    const name = propMap.get(pid) || "—";
    const ci = new Date(b.checkIn);
    const co = new Date(b.checkOut);
    const base = {
      propertyName: name,
      propertyId: pid,
      guestName: b.guestInfo.name,
      guestEmail: b.guestInfo.email,
      guests: b.guests,
      checkIn: ci.toISOString(),
      checkOut: co.toISOString(),
      nights: b.nights,
      source: b.source,
      bookingId: b._id!.toString(),
    };
    if (ci >= dayStart && ci <= dayEnd) items.push({ ...base, type: "checkin" });
    if (co >= dayStart && co <= dayEnd) items.push({ ...base, type: "checkout" });
    if (ci < dayStart && co > dayEnd) items.push({ ...base, type: "inhouse" });
  }
  items.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
  return items;
}

export interface DateRangeRow {
  date: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  status: string;
  source: string;
  nights: number;
  amount: number;
  bookingId: string;
}

export async function getDateRange(from: Date, to: Date, ownerId: string): Promise<DateRangeRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];
  const allProps = (await propsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const propMap = new Map(allProps.map((p) => [p._id!.toString(), p.name]));

  const rows: DateRangeRow[] = [];
  for (const b of allBookings) {
    if (b.status === "cancelled") continue;
    if (b.checkOut < from || b.checkIn > to) continue;
    rows.push({
      date: b.checkIn.toISOString().slice(0, 10),
      propertyId: b.propertyId.toString(),
      propertyName: propMap.get(b.propertyId.toString()) || "—",
      guestName: b.guestInfo.name,
      status: b.status,
      source: b.source,
      nights: b.nights,
      amount: b.pricing?.totalAmount || 0,
      bookingId: b._id!.toString(),
    });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

export interface AvailabilityRow {
  propertyId: string;
  propertyName: string;
  totalNights: number;
  bookedNights: number;
  availableNights: number;
  occupancyPct: number;
}

export async function getAvailableNights(from: Date, to: Date, ownerId: string): Promise<AvailabilityRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({ status: "active", ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

  const totalNights = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));
  const rows: AvailabilityRow[] = [];

  for (const p of properties) {
    const pid = p._id!.toString();
    let booked = 0;
    for (const b of allBookings) {
      if (b.propertyId.toString() !== pid) continue;
      if (b.status === "cancelled") continue;
      const start = b.checkIn > from ? b.checkIn : from;
      const end = b.checkOut < to ? b.checkOut : to;
      if (start >= end) continue;
      booked += Math.ceil((end.getTime() - start.getTime()) / 86400000);
    }
    booked = Math.min(booked, totalNights);
    rows.push({
      propertyId: pid,
      propertyName: p.name,
      totalNights,
      bookedNights: booked,
      availableNights: totalNights - booked,
      occupancyPct: Math.round((booked / totalNights) * 100),
    });
  }
  return rows.sort((a, b) => a.availableNights - b.availableNights);
}

export interface EmptyUnitRow {
  propertyId: string;
  propertyName: string;
  type: string;
  zone: string;
  basePrice: number;
  lastCheckout?: string;
  daysEmpty: number;
}

export async function getEmptyUnits(ownerId: string, asOf: Date = new Date()): Promise<EmptyUnitRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({ status: "active", ownerId: new ObjectId(ownerId) }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray()) as BookingDoc[];

  const rows: EmptyUnitRow[] = [];
  for (const p of properties) {
    const pid = p._id!.toString();
    const propertyBookings = allBookings
      .filter((b) => b.propertyId.toString() === pid && b.status !== "cancelled")
      .sort((a, b) => b.checkOut.getTime() - a.checkOut.getTime());

    const currentBooking = propertyBookings.find((b) => b.checkIn <= asOf && b.checkOut > asOf);
    if (currentBooking) continue;

    const lastBooking = propertyBookings.find((b) => b.checkOut <= asOf);
    const lastCheckout = lastBooking?.checkOut;
    const daysEmpty = lastCheckout
      ? Math.floor((asOf.getTime() - lastCheckout.getTime()) / 86400000)
      : 365;

    rows.push({
      propertyId: pid,
      propertyName: p.name,
      type: p.type,
      zone: p.zone,
      basePrice: p.pricing.basePrice,
      lastCheckout: lastCheckout?.toISOString(),
      daysEmpty,
    });
  }
  return rows.sort((a, b) => b.daysEmpty - a.daysEmpty);
}
