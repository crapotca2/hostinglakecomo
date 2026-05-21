import { NextRequest, NextResponse } from "next/server";
import { syncBookings, syncCalendar } from "@/lib/beds24/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron pull periodico. Backstop nel caso un webhook si perda.
 * Schedule in vercel.json: giornaliero alle 3am (limite Vercel Hobby tier).
 * Real-time coverage rimane via webhook /api/webhooks/beds24.
 * Auth: Vercel iniestta `Authorization: Bearer $CRON_SECRET` automaticamente
 * quando `CRON_SECRET` è settato in env.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const since = new Date();
  // Daily cron → look back 26h to overlap and catch anything missed
  since.setHours(since.getHours() - 26);

  try {
    const bookings = await syncBookings({ since, event: "polling" });

    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 90);
    const calendar = await syncCalendar({ from, to, event: "polling" });

    return NextResponse.json({ ok: true, bookings, calendar });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
