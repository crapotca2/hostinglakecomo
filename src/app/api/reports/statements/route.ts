import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPayouts } from "@/lib/reports/payout";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const payouts = await getMonthlyPayouts(year);
  return NextResponse.json({ year, payouts });
}
