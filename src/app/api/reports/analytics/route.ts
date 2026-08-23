import { NextRequest, NextResponse } from "next/server";
import { getMonthlyRevenue, getPropertyPerformance, getKpiSummary } from "@/lib/reports/revenue";
import { getSourceBreakdown } from "@/lib/reports/sources";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  const [kpis, monthly, properties, sources] = await Promise.all([
    getKpiSummary(year, scope.ownerId),
    getMonthlyRevenue(year, scope.ownerId),
    getPropertyPerformance(year, scope.ownerId),
    getSourceBreakdown(year, scope.ownerId),
  ]);

  return NextResponse.json({ year, kpis, monthly, properties, sources });
}
