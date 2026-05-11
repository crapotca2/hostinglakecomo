import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPayouts } from "@/lib/reports/payout";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { requireSession } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const payouts = await getMonthlyPayouts(year);
  return NextResponse.json({ year, payouts });
}
