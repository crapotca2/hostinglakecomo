import { NextRequest, NextResponse } from "next/server";
import { generateTouristTaxReport } from "@/lib/compliance/tassa-soggiorno";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam
    ? new Date(fromParam)
    : new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const to = toParam ? new Date(toParam) : now;

  const report = await generateTouristTaxReport(from, to, scope.ownerId);
  return NextResponse.json({ from, to, ...report });
}
