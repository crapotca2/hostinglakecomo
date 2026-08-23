import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPayouts } from "@/lib/reports/payout";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const payouts = await getMonthlyPayouts(year, scope.ownerId);
  return NextResponse.json({ year, ownerId: scope.ownerId, payouts });
}
