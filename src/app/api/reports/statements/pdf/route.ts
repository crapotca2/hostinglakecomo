import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerScope } from "@/lib/security/require-session";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { getStatementData } from "@/lib/reports/pdf/statement-data";
import { renderStatementPdf } from "@/lib/reports/pdf/statement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * PDF del rendiconto mensile owner. SEMPRE scopato per ownerId (guardrail #3):
 * un owner ottiene solo il proprio; un admin deve passare ?ownerId=<id>.
 * Parametro ?period=YYYY-MM (default: mese corrente).
 */
export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();

  const period = new URL(req.url).searchParams.get("period") || currentPeriod();
  const data = await getStatementData(scope.ownerId, period, new Date().toISOString());
  if (!data) {
    return NextResponse.json(
      { error: "periodo non valido o proprietario inesistente" },
      { status: 404 },
    );
  }

  const pdf = await renderStatementPdf(data);
  const filename = `rendiconto-${period}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
