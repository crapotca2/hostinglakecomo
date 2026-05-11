import { NextRequest, NextResponse } from "next/server";
import { generateAlloggiatiExport } from "@/lib/compliance/alloggiati";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { requireSession } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const format = searchParams.get("format") || "json";

  const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const to = toParam ? new Date(toParam) : new Date();

  const { content, records } = await generateAlloggiatiExport(from, to);

  if (format === "txt") {
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="alloggiati_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.txt"`,
      },
    });
  }

  return NextResponse.json({ records, recordCount: records.length });
}
