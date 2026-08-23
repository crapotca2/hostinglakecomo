import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import {
  getBookingsDetail,
  getNameCrosscheck,
  getEmailList,
  getPaymentsDetail,
  getTaxesDetail,
  getListingSiteFees,
  getCreditCardHistory,
} from "@/lib/reports/detail";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "bookings";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), 0, 1);
  const to = toStr ? new Date(toStr) : new Date();

  switch (type) {
    case "bookings":
      return NextResponse.json({ rows: await getBookingsDetail(from, to, scope.ownerId) });
    case "name-crosscheck":
      return NextResponse.json({ rows: await getNameCrosscheck(scope.ownerId) });
    case "emails":
      return NextResponse.json({ rows: await getEmailList(scope.ownerId) });
    case "payments":
      return NextResponse.json({ rows: await getPaymentsDetail(from, to, scope.ownerId) });
    case "taxes":
      return NextResponse.json({ rows: await getTaxesDetail(from, to, scope.ownerId) });
    case "listing-fees":
      return NextResponse.json({ rows: await getListingSiteFees(from, to, scope.ownerId) });
    case "cc-history":
      return NextResponse.json({ rows: await getCreditCardHistory(from, to, scope.ownerId) });
    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}
