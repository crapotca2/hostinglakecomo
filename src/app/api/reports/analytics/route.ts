import { NextRequest, NextResponse } from "next/server";
import { getMonthlyRevenue, getPropertyPerformance, getKpiSummary } from "@/lib/reports/revenue";
import { getSourceBreakdown } from "@/lib/reports/sources";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  const [kpis, monthly, properties, sources] = await Promise.all([
    getKpiSummary(year),
    getMonthlyRevenue(year),
    getPropertyPerformance(year),
    getSourceBreakdown(year),
  ]);

  return NextResponse.json({ year, kpis, monthly, properties, sources });
}
