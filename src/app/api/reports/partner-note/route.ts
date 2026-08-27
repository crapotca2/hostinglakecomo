import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/security/require-session";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { getPartnerNoteData } from "@/lib/reports/pdf/partner-note-data";
import { renderPartnerNotePdf } from "@/lib/reports/pdf/partner-note";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Nota spese (compenso) di un socio Host Como — documento INTERNO, quindi
 * ADMIN-ONLY (un proprietario non deve vedere lo split tra i soci).
 * ?partner=angelo|andrei · ?ownerId=<id> · ?period=all|YYYY-MM · ?format=json|pdf
 */
export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "solo admin" }, { status: 403 });
  }
  await ensureSeeded();

  const sp = new URL(req.url).searchParams;
  const partner = sp.get("partner") || "";
  const ownerId = sp.get("ownerId") || req.cookies.get("hc_owner_scope")?.value || "";
  const period = sp.get("period") || "all";
  const format = sp.get("format") || "pdf";
  if (!ownerId) return NextResponse.json({ error: "seleziona un proprietario" }, { status: 400 });

  const data = await getPartnerNoteData(ownerId, partner, period, new Date().toISOString());
  if (!data) return NextResponse.json({ error: "socio/proprietario/periodo non valido" }, { status: 404 });

  if (format === "json") {
    return NextResponse.json({
      partner: data.partner.key,
      partnerName: data.partner.name,
      propertyName: data.propertyName,
      periodLabel: data.periodLabel,
      consulenza: data.consulenza,
      inps: data.inps,
      lordo: data.lordo,
      parcheggio: data.parcheggio,
      anticipo: data.anticipo,
      totale: data.totale,
      bookings: data.months.reduce((s, m) => s + m.rows.length, 0),
    });
  }

  const pdf = await renderPartnerNotePdf(data);
  const filename = `nota-spese-${data.partner.key}-${period}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
