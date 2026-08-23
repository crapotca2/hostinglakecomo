import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import {
  getCommissionSummary, getCommissionDetail,
  getOwnerRemittanceSummary, getOwnerRemittanceDetail, getOwnerStatementBookings,
} from "@/lib/reports/property-management";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "commission-summary";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);
  const from = fromStr ? new Date(fromStr) : new Date(year, 0, 1);
  const to = toStr ? new Date(toStr) : new Date(year, 11, 31, 23, 59, 59);

  switch (type) {
    case "commission-summary": return NextResponse.json({ rows: await getCommissionSummary(from, to, scope.ownerId) });
    case "commission-detail": return NextResponse.json({ rows: await getCommissionDetail(from, to, scope.ownerId) });
    case "owner-summary": return NextResponse.json({ rows: await getOwnerRemittanceSummary(year, scope.ownerId) });
    case "owner-detail": return NextResponse.json({ rows: await getOwnerRemittanceDetail(from, to, scope.ownerId) });
    case "booking-remittance": return NextResponse.json({ rows: await getOwnerStatementBookings(from, to, scope.ownerId) });
    default: return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}
