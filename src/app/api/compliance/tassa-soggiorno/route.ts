import { NextRequest, NextResponse } from "next/server";
import { generateTouristTaxReport } from "@/lib/compliance/tassa-soggiorno";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam
    ? new Date(fromParam)
    : new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const to = toParam ? new Date(toParam) : now;

  const { rows, totalOwed } = await generateTouristTaxReport(from, to);
  return NextResponse.json({ from, to, rows, totalOwed });
}
