import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";
import { ObjectId } from "mongodb";

export interface MonthlyRevenue {
  month: string;
  label: string;
  revenue: number;
  bookings: number;
  nights: number;
}

export interface PropertyPerformance {
  propertyId: string;
  name: string;
  revenue: number;
  bookings: number;
  nights: number;
  avgRate: number;
  occupancy: number;
}

export async function getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const bookings = (await bookingsCol.find({}).toArray() as BookingDoc[]).filter(
    (b: BookingDoc) => b.checkIn >= start && b.checkIn < end && b.status !== "cancelled"
  );

  const months = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
  ];
  const result: MonthlyRevenue[] = months.map((label, i) => ({
    month: `${year}-${String(i + 1).padStart(2, "0")}`,
    label,
    revenue: 0,
    bookings: 0,
    nights: 0,
  }));

  for (const b of bookings) {
    const monthIdx = b.checkIn.getMonth();
    result[monthIdx].revenue += b.pricing?.totalAmount || 0;
    result[monthIdx].bookings += 1;
    result[monthIdx].nights += b.nights;
  }

  return result;
}

export async function getPropertyPerformance(year: number): Promise<PropertyPerformance[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = await propsCol.find({ status: "active" }).toArray();

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const daysInYear = 365;

  const result: PropertyPerformance[] = [];

  for (const p of properties) {
    const propertyBookings = (await bookingsCol.find({ propertyId: p._id as ObjectId }).toArray() as BookingDoc[]).filter(
      (b: BookingDoc) => b.checkIn >= start && b.checkIn < end && b.status !== "cancelled"
    );

    const revenue = propertyBookings.reduce((s: number, b: BookingDoc) => s + (b.pricing?.totalAmount || 0), 0);
    const nights = propertyBookings.reduce((s: number, b: BookingDoc) => s + b.nights, 0);
    const bookings = propertyBookings.length;
    const avgRate = nights > 0 ? Math.round(revenue / nights) : 0;
    const occupancy = Math.round((nights / daysInYear) * 100);

    result.push({
      propertyId: p._id!.toString(),
      name: p.name,
      revenue,
      bookings,
      nights,
      avgRate,
      occupancy,
    });
  }

  return result.sort((a, b) => b.revenue - a.revenue);
}

export async function getKpiSummary(year: number) {
  const monthly = await getMonthlyRevenue(year);
  const properties = await getPropertyPerformance(year);

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthly.reduce((s, m) => s + m.bookings, 0);
  const totalNights = monthly.reduce((s, m) => s + m.nights, 0);
  const avgOccupancy = properties.length
    ? Math.round(properties.reduce((s, p) => s + p.occupancy, 0) / properties.length)
    : 0;
  const avgRate = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

  return {
    totalRevenue,
    totalBookings,
    avgOccupancy,
    avgRate,
  };
}
