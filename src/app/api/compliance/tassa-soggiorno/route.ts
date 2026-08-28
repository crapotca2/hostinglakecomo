import { NextRequest, NextResponse } from "next/server";
import { generateTouristTaxReport } from "@/lib/compliance/tassa-soggiorno";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const now = new Date();
  // Adempimento comune = mese solare (1 → fine mese), come ISTAT.
  const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);

  const report = await generateTouristTaxReport(month, year, scope.ownerId);
  return NextResponse.json({ month, year, ...report });
}
