import { NextRequest, NextResponse } from "next/server";
import { generateIstatExport } from "@/lib/compliance/istat";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
  const format = searchParams.get("format") || "json";

  const { rows, csv } = await generateIstatExport(month, year);

  if (format === "csv") {
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="istat_${year}_${String(month).padStart(2, "0")}.csv"`,
      },
    });
  }

  return NextResponse.json({ rows, rowCount: rows.length });
}
