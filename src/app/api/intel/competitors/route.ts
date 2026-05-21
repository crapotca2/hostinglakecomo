import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import type {
  CompetitorZone,
  CompetitorListingDoc,
  CompetitorZoneStatsDoc,
} from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/intel/competitors?zone=argegno
 * Returns:
 *   {
 *     zone,
 *     listings: [{ airbnbRoomId, name, url, bedrooms, maxGuests, isActive }],
 *     monthlyZoneStats: [{ monthKey, monthLabel, occupancyMedian, adrMedian, revpanMedian, ... }],
 *     dataAsOf: ISO timestamp of most recent scrape
 *   }
 *
 * Used by the /dashboard/analytics page to render competitor benchmarks.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const zoneParam = (url.searchParams.get("zone") || "argegno") as CompetitorZone;

  try {
    const listingsCol = await collections.competitorListings();
    const zoneStatsCol = await collections.competitorZoneStats();

    const listings = (await listingsCol
      .find({ zone: zoneParam, isActive: true })
      .toArray()) as CompetitorListingDoc[];

    const monthlyZoneStats = (await zoneStatsCol
      .find({ zone: zoneParam })
      .sort({ monthKey: 1 })
      .toArray()) as CompetitorZoneStatsDoc[];

    const dataAsOf = listings.length
      ? listings.reduce((max: number, l: CompetitorListingDoc) => {
          const t = l.lastSeenAt instanceof Date ? l.lastSeenAt.getTime() : 0;
          return t > max ? t : max;
        }, 0)
      : 0;

    return NextResponse.json({
      zone: zoneParam,
      listingsCount: listings.length,
      listings: listings.map((l: CompetitorListingDoc) => ({
        airbnbRoomId: l.airbnbRoomId,
        name: l.name,
        url: l.url,
        bedrooms: l.bedrooms,
        maxGuests: l.maxGuests,
        isActive: l.isActive,
        lastSeenAt: l.lastSeenAt,
      })),
      monthlyZoneStats: monthlyZoneStats.map((s: CompetitorZoneStatsDoc) => ({
        monthKey: s.monthKey,
        monthLabel: s.monthLabel,
        nCompetitorsCalendar: s.nCompetitorsCalendar,
        nListingsPriceSample: s.nListingsPriceSample,
        occupancyMedian: s.occupancyMedian,
        occupancyP25: s.occupancyP25,
        occupancyP75: s.occupancyP75,
        adrMedian: s.adrMedian,
        adrMeanClipped: s.adrMeanClipped,
        revpanMedian: s.revpanMedian,
      })),
      dataAsOf: dataAsOf ? new Date(dataAsOf).toISOString() : null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
