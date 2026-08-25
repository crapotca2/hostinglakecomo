import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PropertyDoc } from "@/types/database";
import { aggregateBreakdown, feeRateForProperty } from "./fee-model";

export interface MonthlyPayout {
  period: string;
  label: string;
  propertiesCount: number;
  /** Ricavi alloggio + notte extra (base del netto). */
  grossRevenue: number;
  roomRevenue: number;
  otaCommissions: number;
  /** Cedolare secca 21% trattenuta dall'OTA. */
  cedolare: number;
  /** Commissione Host Como (aliquota × ricavi alloggio). */
  airbibbyCommission: number;
  /** Deprecato: spese operative (ora 0, pulizie sono partita di giro). */
  expenses: number;
  /** Pulizie (partita di giro, fuori dal netto). */
  cleaning: number;
  touristTax: number;
  /** Quota parcheggio del proprietario (50%). */
  parkingOwner: number;
  netPayout: number;
  bookingCount: number;
  status: "paid" | "pending";
}

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

async function loadRateMap(ownerId: string): Promise<Map<string, number>> {
  const propsCol = await collections.properties();
  const props = (await propsCol
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray()) as PropertyDoc[];
  return new Map(props.map((p) => [p._id!.toString(), feeRateForProperty(p)]));
}

export async function getMonthlyPayouts(
  year: number,
  ownerId: string,
): Promise<MonthlyPayout[]> {
  const bookingsCol = await collections.bookings();
  const rateMap = await loadRateMap(ownerId);
  const rateOf = (b: BookingDoc) => rateMap.get(b.propertyId.toString()) ?? 0.1;

  const bookings = (
    (await bookingsCol
      .find({ ownerId: new ObjectId(ownerId) })
      .toArray()) as BookingDoc[]
  ).filter(
    (b: BookingDoc) => b.checkIn.getFullYear() === year && b.status !== "cancelled"
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const result: MonthlyPayout[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthBookings = bookings.filter((b: BookingDoc) => b.checkIn.getMonth() === i);
    if (monthBookings.length === 0 && (year !== currentYear || i > currentMonth)) continue;

    const agg = aggregateBreakdown(monthBookings, rateOf);
    const propsSet = new Set(monthBookings.map((b: BookingDoc) => b.propertyId.toString()));
    const isPast = year < currentYear || (year === currentYear && i < currentMonth);

    result.push({
      period: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[i]} ${year}`,
      propertiesCount: propsSet.size,
      grossRevenue: agg.totalRevenue,
      roomRevenue: agg.roomRevenue,
      otaCommissions: agg.otaCommission,
      cedolare: agg.cedolare,
      airbibbyCommission: agg.managementFee,
      expenses: 0,
      cleaning: agg.cleaning,
      touristTax: agg.touristTax,
      parkingOwner: agg.parkingOwner,
      netPayout: agg.netPayout,
      bookingCount: monthBookings.length,
      status: isPast ? "paid" : "pending",
    });
  }

  return result;
}

export async function getPayoutForPeriod(
  period: string,
  ownerId: string,
): Promise<{
  payout: MonthlyPayout | null;
  bookings: BookingDoc[];
}> {
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(monthIdx)) return { payout: null, bookings: [] };

  const all = await getMonthlyPayouts(year, ownerId);
  const payout = all.find((p) => p.period === period) || null;

  const bookingsCol = await collections.bookings();
  const bookings = (
    (await bookingsCol
      .find({ ownerId: new ObjectId(ownerId) })
      .toArray()) as BookingDoc[]
  ).filter(
    (b: BookingDoc) =>
      b.checkIn.getFullYear() === year &&
      b.checkIn.getMonth() === monthIdx &&
      b.status !== "cancelled"
  );

  return { payout, bookings };
}
