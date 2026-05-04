import { NextRequest, NextResponse } from "next/server";
import { holidaysClient } from "@/lib/holidays/client";
import { SUPPORTED_COUNTRIES } from "@/lib/holidays/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "IT";
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (!SUPPORTED_COUNTRIES.includes(country as any)) {
    return NextResponse.json(
      { error: `Country ${country} not supported. Supported: ${SUPPORTED_COUNTRIES.join(", ")}` },
      { status: 400 }
    );
  }

  if (isNaN(year) || year < 2020 || year > 2030) {
    return NextResponse.json(
      { error: "Year must be between 2020 and 2030" },
      { status: 400 }
    );
  }

  const holidays = holidaysClient.getHolidays(country, year);
  return NextResponse.json({ holidays });
}
