import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { getDailyChecklist, getDateRange, getAvailableNights, getEmptyUnits } from "@/lib/reports/stay";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "daily";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 86400000);
  const to = toStr ? new Date(toStr) : new Date(Date.now() + 30 * 86400000);

  if (type === "daily") return NextResponse.json({ items: await getDailyChecklist(scope.ownerId, from) });
  if (type === "range") return NextResponse.json({ rows: await getDateRange(from, to, scope.ownerId) });
  if (type === "available") return NextResponse.json({ rows: await getAvailableNights(from, to, scope.ownerId) });
  if (type === "empty") return NextResponse.json({ rows: await getEmptyUnits(scope.ownerId, from) });
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
