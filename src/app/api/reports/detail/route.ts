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

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "bookings";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), 0, 1);
  const to = toStr ? new Date(toStr) : new Date();

  switch (type) {
    case "bookings":
      return NextResponse.json({ rows: await getBookingsDetail(from, to) });
    case "name-crosscheck":
      return NextResponse.json({ rows: await getNameCrosscheck() });
    case "emails":
      return NextResponse.json({ rows: await getEmailList() });
    case "payments":
      return NextResponse.json({ rows: await getPaymentsDetail(from, to) });
    case "taxes":
      return NextResponse.json({ rows: await getTaxesDetail(from, to) });
    case "listing-fees":
      return NextResponse.json({ rows: await getListingSiteFees(from, to) });
    case "cc-history":
      return NextResponse.json({ rows: await getCreditCardHistory(from, to) });
    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}
