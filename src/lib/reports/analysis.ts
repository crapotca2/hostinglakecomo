import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PropertyDoc } from "@/types/database";

export interface OverviewStats {
  totalBookings: number;
  totalNights: number;
  totalGuests: number;
  avgNightsPerBooking: number;
  avgGuestsPerBooking: number;
  avgGuestNightsPerBooking: number;
  totalGuestNights: number;
  occupancyPct: number;
  totalRevenue: number;
  adr: number;
  revPar: number;
}

export async function getOverview(from: Date, to: Date): Promise<OverviewStats> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const activeProps = (await propsCol.find({ status: "active" }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to
  );

  const totalDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));
  const totalAvailableNights = activeProps.length * totalDays;
  const totalBookedNights = bookings.reduce((s, b) => s + b.nights, 0);
  const totalRevenue = bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
  const totalGuests = bookings.reduce((s, b) => s + b.guests, 0);
  const totalGuestNights = bookings.reduce((s, b) => s + b.guests * b.nights, 0);

  return {
    totalBookings: bookings.length,
    totalNights: totalBookedNights,
    totalGuests,
    avgNightsPerBooking: bookings.length > 0 ? Math.round((totalBookedNights / bookings.length) * 10) / 10 : 0,
    avgGuestsPerBooking: bookings.length > 0 ? Math.round((totalGuests / bookings.length) * 10) / 10 : 0,
    avgGuestNightsPerBooking: bookings.length > 0 ? Math.round((totalGuestNights / bookings.length) * 10) / 10 : 0,
    totalGuestNights,
    occupancyPct: totalAvailableNights > 0 ? Math.round((totalBookedNights / totalAvailableNights) * 100) : 0,
    totalRevenue: Math.round(totalRevenue),
    adr: totalBookedNights > 0 ? Math.round(totalRevenue / totalBookedNights) : 0,
    revPar: totalAvailableNights > 0 ? Math.round(totalRevenue / totalAvailableNights) : 0,
  };
}

export interface DaysInAdvanceBucket {
  bucket: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

export async function getDaysInAdvance(from: Date, to: Date): Promise<DaysInAdvanceBucket[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to
  );

  const buckets = [
    { id: "0-7", min: 0, max: 7, bookings: 0, revenue: 0 },
    { id: "8-14", min: 8, max: 14, bookings: 0, revenue: 0 },
    { id: "15-30", min: 15, max: 30, bookings: 0, revenue: 0 },
    { id: "31-60", min: 31, max: 60, bookings: 0, revenue: 0 },
    { id: "61-90", min: 61, max: 90, bookings: 0, revenue: 0 },
    { id: "91+", min: 91, max: Infinity, bookings: 0, revenue: 0 },
  ];

  for (const b of bookings) {
    const days = Math.max(0, Math.floor((b.checkIn.getTime() - b.createdAt.getTime()) / 86400000));
    const bucket = buckets.find((bk) => days >= bk.min && days <= bk.max);
    if (bucket) {
      bucket.bookings += 1;
      bucket.revenue += b.pricing?.totalAmount || 0;
    }
  }

  const total = bookings.length || 1;
  return buckets.map((bk) => ({
    bucket: bk.id === "91+" ? "91+ giorni" : `${bk.id} giorni`,
    bookings: bk.bookings,
    revenue: Math.round(bk.revenue),
    percentage: Math.round((bk.bookings / total) * 100),
  }));
}

export interface OccupancyRow {
  propertyId: string;
  propertyName: string;
  nightsAvailable: number;
  nightsBooked: number;
  occupancyPct: number;
  guestsHosted: number;
  guestNights: number;
}

export async function getOccupancyReport(from: Date, to: Date): Promise<OccupancyRow[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({ status: "active" }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const totalDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));

  return properties
    .map((p) => {
      const pid = p._id!.toString();
      const bookings = allBookings.filter(
        (b) => b.propertyId.toString() === pid && b.status !== "cancelled"
      );
      let nightsBooked = 0;
      let guestNights = 0;
      let guestsHosted = 0;
      for (const b of bookings) {
        const start = b.checkIn > from ? b.checkIn : from;
        const end = b.checkOut < to ? b.checkOut : to;
        if (start >= end) continue;
        const n = Math.ceil((end.getTime() - start.getTime()) / 86400000);
        nightsBooked += n;
        guestNights += n * b.guests;
        guestsHosted += b.guests;
      }
      return {
        propertyId: pid,
        propertyName: p.name,
        nightsAvailable: totalDays,
        nightsBooked,
        occupancyPct: Math.round((nightsBooked / totalDays) * 100),
        guestsHosted,
        guestNights,
      };
    })
    .sort((a, b) => b.occupancyPct - a.occupancyPct);
}

export interface AvailabilityGap {
  propertyId: string;
  propertyName: string;
  gapStart: string;
  gapEnd: string;
  gapDays: number;
  potentialRevenue: number;
}

export async function getAvailabilityGaps(from: Date, to: Date, minGapDays = 2): Promise<AvailabilityGap[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = (await propsCol.find({ status: "active" }).toArray()) as PropertyDoc[];
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];

  const gaps: AvailabilityGap[] = [];
  for (const p of properties) {
    const pid = p._id!.toString();
    const propertyBookings = allBookings
      .filter((b) => b.propertyId.toString() === pid && b.status !== "cancelled")
      .filter((b) => b.checkOut > from && b.checkIn < to)
      .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());

    let cursor = new Date(Math.max(from.getTime(), from.getTime()));
    for (const b of propertyBookings) {
      if (b.checkIn > cursor) {
        const gapDays = Math.floor((b.checkIn.getTime() - cursor.getTime()) / 86400000);
        if (gapDays >= minGapDays) {
          gaps.push({
            propertyId: pid,
            propertyName: p.name,
            gapStart: cursor.toISOString().slice(0, 10),
            gapEnd: b.checkIn.toISOString().slice(0, 10),
            gapDays,
            potentialRevenue: Math.round(gapDays * p.pricing.basePrice),
          });
        }
      }
      if (b.checkOut > cursor) cursor = b.checkOut;
    }
    if (cursor < to) {
      const gapDays = Math.floor((to.getTime() - cursor.getTime()) / 86400000);
      if (gapDays >= minGapDays) {
        gaps.push({
          propertyId: pid,
          propertyName: p.name,
          gapStart: cursor.toISOString().slice(0, 10),
          gapEnd: to.toISOString().slice(0, 10),
          gapDays,
          potentialRevenue: Math.round(gapDays * p.pricing.basePrice),
        });
      }
    }
  }
  return gaps.sort((a, b) => b.gapDays - a.gapDays);
}

export interface RepeatGuestRow {
  email: string;
  guestName: string;
  bookings: number;
  totalSpent: number;
  firstStay: string;
  lastStay: string;
  avgRate: number;
}

export async function getRepeatGuests(): Promise<RepeatGuestRow[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];

  const byEmail = new Map<string, BookingDoc[]>();
  for (const b of allBookings) {
    if (!b.guestInfo.email) continue;
    if (b.status === "cancelled") continue;
    const key = b.guestInfo.email.toLowerCase();
    const prev = byEmail.get(key) || [];
    prev.push(b);
    byEmail.set(key, prev);
  }

  const rows: RepeatGuestRow[] = [];
  for (const [email, bookings] of Array.from(byEmail.entries())) {
    if (bookings.length < 2) continue;
    const sorted = bookings.sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
    const totalSpent = bookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
    const totalNights = bookings.reduce((s, b) => s + b.nights, 0);
    rows.push({
      email,
      guestName: sorted[0].guestInfo.name,
      bookings: bookings.length,
      totalSpent: Math.round(totalSpent),
      firstStay: sorted[0].checkIn.toISOString().slice(0, 10),
      lastStay: sorted[sorted.length - 1].checkIn.toISOString().slice(0, 10),
      avgRate: totalNights > 0 ? Math.round(totalSpent / totalNights) : 0,
    });
  }
  return rows.sort((a, b) => b.bookings - a.bookings);
}

export interface SitePerformanceRow {
  source: string;
  bookings: number;
  nights: number;
  guests: number;
  revenue: number;
  avgRate: number;
  avgStay: number;
  conversionValue: number;
}

export async function getListingSitePerformance(from: Date, to: Date): Promise<SitePerformanceRow[]> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn >= from && b.checkIn <= to
  );

  const bySource = new Map<string, BookingDoc[]>();
  for (const b of bookings) {
    const prev = bySource.get(b.source) || [];
    prev.push(b);
    bySource.set(b.source, prev);
  }

  const rows: SitePerformanceRow[] = [];
  for (const [source, list] of Array.from(bySource.entries())) {
    const revenue = list.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
    const nights = list.reduce((s, b) => s + b.nights, 0);
    const guests = list.reduce((s, b) => s + b.guests, 0);
    rows.push({
      source,
      bookings: list.length,
      nights,
      guests,
      revenue: Math.round(revenue),
      avgRate: nights > 0 ? Math.round(revenue / nights) : 0,
      avgStay: list.length > 0 ? Math.round((nights / list.length) * 10) / 10 : 0,
      conversionValue: list.length > 0 ? Math.round(revenue / list.length) : 0,
    });
  }
  return rows.sort((a, b) => b.revenue - a.revenue);
}
