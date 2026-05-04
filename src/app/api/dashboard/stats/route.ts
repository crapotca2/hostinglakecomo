import { NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import type { BookingDoc } from "@/types/database";

export async function GET() {
  await ensureSeeded();
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const allBookings = await bookingsCol.find({}).toArray();
  const thisMonthBookings = allBookings.filter(
    (b: BookingDoc) =>
      b.checkIn >= monthStart &&
      b.checkIn <= monthEnd &&
      b.status !== "cancelled"
  );

  const activeBookings = allBookings.filter(
    (b: BookingDoc) =>
      (b.status === "confirmed" || b.status === "checked_in") &&
      b.checkOut >= now
  );

  const monthRevenue = thisMonthBookings.reduce(
    (sum: number, b: BookingDoc) => sum + (b.pricing?.totalAmount || 0),
    0
  );

  // Occupancy: nights booked / nights available (this month, across all properties)
  const properties = await propsCol.find({ status: "active" }).toArray();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const totalAvailableNights = properties.length * daysInMonth;
  const bookedNights = thisMonthBookings.reduce((sum: number, b: BookingDoc) => {
    const start = b.checkIn > monthStart ? b.checkIn : monthStart;
    const end = b.checkOut < monthEnd ? b.checkOut : monthEnd;
    const nights = Math.max(
      0,
      Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    );
    return sum + nights;
  }, 0);
  const occupancyRate =
    totalAvailableNights > 0
      ? Math.round((bookedNights / totalAvailableNights) * 100)
      : 0;

  return NextResponse.json({
    monthRevenue,
    activeBookings: activeBookings.length,
    occupancyRate,
    propertyCount: properties.length,
    recentBookings: allBookings
      .filter((b: BookingDoc) => b.status !== "cancelled")
      .sort((a: BookingDoc, b: BookingDoc) => b.checkIn.getTime() - a.checkIn.getTime())
      .slice(0, 5),
  });
}
