import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import {
  getCommissionSummary, getCommissionDetail,
  getOwnerRemittanceSummary, getOwnerRemittanceDetail, getOwnerStatementBookings,
} from "@/lib/reports/property-management";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "commission-summary";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);
  const from = fromStr ? new Date(fromStr) : new Date(year, 0, 1);
  const to = toStr ? new Date(toStr) : new Date(year, 11, 31, 23, 59, 59);

  switch (type) {
    case "commission-summary": return NextResponse.json({ rows: await getCommissionSummary(from, to) });
    case "commission-detail": return NextResponse.json({ rows: await getCommissionDetail(from, to) });
    case "owner-summary": return NextResponse.json({ rows: await getOwnerRemittanceSummary(year) });
    case "owner-detail": return NextResponse.json({ rows: await getOwnerRemittanceDetail(from, to) });
    case "booking-remittance": return NextResponse.json({ rows: await getOwnerStatementBookings(from, to) });
    default: return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}
