import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";

export interface SourceBreakdown {
  source: string;
  label: string;
  color: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

const SOURCE_META: Record<string, { label: string; color: string }> = {
  airbnb: { label: "Airbnb", color: "#FF5A5F" },
  booking: { label: "Booking.com", color: "#003580" },
  vrbo: { label: "Vrbo", color: "#3B5998" },
  direct: { label: "Diretto", color: "#EAB308" },
  expedia: { label: "Expedia", color: "#FFC72C" },
  other: { label: "Altro", color: "#9CA3AF" },
};

export async function getSourceBreakdown(year: number, ownerId: string): Promise<SourceBreakdown[]> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const bookings = (await bookingsCol.find({ ownerId: new ObjectId(ownerId) }).toArray() as BookingDoc[]).filter(
    (b: BookingDoc) => b.checkIn >= start && b.checkIn < end && b.status !== "cancelled"
  );

  const bySource = new Map<string, { revenue: number; bookings: number }>();
  for (const b of bookings) {
    const key = b.source || "other";
    const prev = bySource.get(key) || { revenue: 0, bookings: 0 };
    // Base ricavi = alloggio + notte extra (ex-pulizie), come il rendiconto
    // "Ricavi (alloggio + notte extra)"; così la notte diretta di JC (250€)
    // compare come fetta "Diretto" e il mix combacia coi Reports.
    const room = b.pricing?.roomRevenue ?? Math.max(0, (b.pricing?.totalAmount || 0) - (b.pricing?.cleaningFee || 0));
    prev.revenue += room + (b.pricing?.extraNight || 0);
    prev.bookings += 1;
    bySource.set(key, prev);
  }

  const total = Array.from(bySource.values()).reduce((s, v) => s + v.revenue, 0);
  const result: SourceBreakdown[] = Array.from(bySource.entries()).map(([source, data]) => {
    const meta = SOURCE_META[source] || SOURCE_META.other;
    return {
      source,
      label: meta.label,
      color: meta.color,
      revenue: data.revenue,
      bookings: data.bookings,
      percentage: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
    };
  });

  return result.sort((a, b) => b.revenue - a.revenue);
}
