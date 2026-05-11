import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { getBookingsSummary, getPaymentsSummary, getTaxesSummary } from "@/lib/reports/summary";
import { requireSession } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "bookings";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), 0, 1);
  const to = toStr ? new Date(toStr) : new Date();

  if (type === "bookings") return NextResponse.json({ rows: await getBookingsSummary(from, to) });
  if (type === "payments") return NextResponse.json({ rows: await getPaymentsSummary(from, to) });
  if (type === "taxes") return NextResponse.json({ rows: await getTaxesSummary(from, to) });
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
