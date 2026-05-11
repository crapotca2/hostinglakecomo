import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import {
  getOverview,
  getDaysInAdvance,
  getOccupancyReport,
  getAvailabilityGaps,
  getRepeatGuests,
  getListingSitePerformance,
} from "@/lib/reports/analysis";
import { requireSession } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "overview";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), 0, 1);
  const to = toStr ? new Date(toStr) : new Date();

  switch (type) {
    case "overview":
      return NextResponse.json({ stats: await getOverview(from, to) });
    case "days-in-advance":
      return NextResponse.json({ rows: await getDaysInAdvance(from, to) });
    case "occupancy":
      return NextResponse.json({ rows: await getOccupancyReport(from, to) });
    case "gaps":
      return NextResponse.json({ rows: await getAvailabilityGaps(from, to) });
    case "repeat-guests":
      return NextResponse.json({ rows: await getRepeatGuests() });
    case "site-performance":
      return NextResponse.json({ rows: await getListingSitePerformance(from, to) });
    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}
