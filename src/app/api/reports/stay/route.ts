import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { getDailyChecklist, getDateRange, getAvailableNights, getEmptyUnits } from "@/lib/reports/stay";
import { requireSession } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "daily";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 86400000);
  const to = toStr ? new Date(toStr) : new Date(Date.now() + 30 * 86400000);

  if (type === "daily") return NextResponse.json({ items: await getDailyChecklist(from) });
  if (type === "range") return NextResponse.json({ rows: await getDateRange(from, to) });
  if (type === "available") return NextResponse.json({ rows: await getAvailableNights(from, to) });
  if (type === "empty") return NextResponse.json({ rows: await getEmptyUnits(from) });
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
