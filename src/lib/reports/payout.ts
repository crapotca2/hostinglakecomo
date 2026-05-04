import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";

export interface MonthlyPayout {
  period: string;
  label: string;
  propertiesCount: number;
  grossRevenue: number;
  otaCommissions: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
  bookingCount: number;
  status: "paid" | "pending";
}

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export async function getMonthlyPayouts(year: number): Promise<MonthlyPayout[]> {
  const bookingsCol = await collections.bookings();
  const bookings = (await bookingsCol.find({}).toArray() as BookingDoc[]).filter(
    (b: BookingDoc) => b.checkIn.getFullYear() === year && b.status !== "cancelled"
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const result: MonthlyPayout[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthBookings = bookings.filter((b: BookingDoc) => b.checkIn.getMonth() === i);
    if (monthBookings.length === 0 && (year !== currentYear || i > currentMonth)) continue;

    const grossRevenue = monthBookings.reduce((s: number, b: BookingDoc) => s + (b.pricing?.totalAmount || 0), 0);
    const otaCommissions = monthBookings.reduce((s: number, b: BookingDoc) => s + (b.pricing?.commissionAmount || 0), 0);
    const airbibbyCommission = Math.round(grossRevenue * 0.1);
    const expenses = Math.round(grossRevenue * 0.05);
    const touristTax = monthBookings.reduce((s: number, b: BookingDoc) => s + (b.pricing?.touristTax || 0), 0);
    const netPayout = grossRevenue - otaCommissions - airbibbyCommission - expenses - touristTax;
    const propsSet = new Set(monthBookings.map((b: BookingDoc) => b.propertyId.toString()));

    const isPast = year < currentYear || (year === currentYear && i < currentMonth);

    result.push({
      period: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[i]} ${year}`,
      propertiesCount: propsSet.size,
      grossRevenue,
      otaCommissions,
      airbibbyCommission,
      expenses,
      touristTax,
      netPayout,
      bookingCount: monthBookings.length,
      status: isPast ? "paid" : "pending",
    });
  }

  return result;
}

export async function getPayoutForPeriod(period: string): Promise<{
  payout: MonthlyPayout | null;
  bookings: BookingDoc[];
}> {
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(monthIdx)) return { payout: null, bookings: [] };

  const all = await getMonthlyPayouts(year);
  const payout = all.find((p) => p.period === period) || null;

  const bookingsCol = await collections.bookings();
  const bookings = (await bookingsCol.find({}).toArray() as BookingDoc[]).filter(
    (b: BookingDoc) =>
      b.checkIn.getFullYear() === year &&
      b.checkIn.getMonth() === monthIdx &&
      b.status !== "cancelled"
  );

  return { payout, bookings };
}
