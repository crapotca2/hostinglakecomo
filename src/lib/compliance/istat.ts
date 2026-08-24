import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";

export interface IstatRow {
  date: string;
  arrivals: number;
  presences: number;
  countryCode: string;
}

export async function generateIstatExport(
  month: number,
  year: number,
  ownerId: string
): Promise<{ rows: IstatRow[]; csv: string }> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const allBookings = (await bookingsCol
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn <= end && b.checkOut >= start
  );

  const byDateCountry = new Map<string, { arrivals: number; presences: number }>();

  for (const b of bookings) {
    const country = b.guestInfo.nationality || "IT";

    if (b.checkIn >= start && b.checkIn <= end) {
      const key = `${b.checkIn.toISOString().slice(0, 10)}|${country}`;
      const prev = byDateCountry.get(key) || { arrivals: 0, presences: 0 };
      prev.arrivals += b.guests;
      byDateCountry.set(key, prev);
    }

    const dayMs = 24 * 60 * 60 * 1000;
    for (let d = new Date(b.checkIn); d < b.checkOut; d = new Date(d.getTime() + dayMs)) {
      if (d >= start && d <= end) {
        const key = `${d.toISOString().slice(0, 10)}|${country}`;
        const prev = byDateCountry.get(key) || { arrivals: 0, presences: 0 };
        prev.presences += b.guests;
        byDateCountry.set(key, prev);
      }
    }
  }

  const rows: IstatRow[] = [];
  for (const [key, vals] of Array.from(byDateCountry.entries())) {
    const [date, country] = key.split("|");
    rows.push({
      date,
      arrivals: vals.arrivals,
      presences: vals.presences,
      countryCode: country,
    });
  }
  rows.sort((a, b) => (a.date + a.countryCode).localeCompare(b.date + b.countryCode));

  const header = "Data;Arrivi;Presenze;Paese";
  const csv = [header, ...rows.map((r) => `${r.date};${r.arrivals};${r.presences};${r.countryCode}`)].join("\n");

  return { rows, csv };
}
