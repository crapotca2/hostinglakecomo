import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerScope } from "@/lib/security/require-session";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { getRendicontoXlsx } from "@/lib/reports/xlsx/rendiconto-data";
import { buildRendicontoXlsx } from "@/lib/reports/xlsx/rendiconto-xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Excel del rendiconto mensile owner (formato template ufficiale, 2 fogli IT/EN
 * + grafici). SEMPRE scopato per ownerId (guardrail #3): un owner ottiene solo
 * il proprio; un admin deve passare ?ownerId=<id>. ?period=YYYY-MM (ciclo 25→25,
 * default mese corrente).
 */
export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();

  const period = new URL(req.url).searchParams.get("period") || currentPeriod();
  const meta = await getRendicontoXlsx(scope.ownerId, period);
  if (!meta) {
    return NextResponse.json({ error: "periodo non valido o proprietario inesistente" }, { status: 404 });
  }

  const buffer = await buildRendicontoXlsx(meta.input);
  const filename = `rendiconto-${period}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
