import { NextRequest, NextResponse } from "next/server";
import { verifyBeds24Signature } from "@/lib/beds24/webhook-verify";
import { syncBookingById, syncCalendar } from "@/lib/beds24/sync";
import { collections } from "@/lib/mongodb/collections";
import type { Beds24WebhookEvent } from "@/lib/beds24/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.BEDS24_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook secret not configured" },
      { status: 503 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-beds24-signature");

  if (!verifyBeds24Signature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: Beds24WebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "bookingCreated":
      case "bookingModified":
      case "bookingCancelled": {
        if (!event.bookingId) {
          return NextResponse.json({ error: "missing bookingId" }, { status: 400 });
        }
        const res = await syncBookingById(event.bookingId, "webhook");
        return NextResponse.json({ ok: res.status === "ok", ...res });
      }
      case "calendarChanged": {
        if (!event.propertyId) {
          return NextResponse.json({ error: "missing propertyId" }, { status: 400 });
        }
        const propsCol = await collections.properties();
        const prop = await propsCol.findOne({
          beds24PropertyId: event.propertyId,
        });
        if (!prop) {
          return NextResponse.json({ ok: false, error: "property not found" });
        }
        const from = new Date();
        const to = new Date();
        to.setDate(to.getDate() + 90);
        const result = await syncCalendar({
          propertyId: prop._id!,
          from,
          to,
          event: "webhook",
        });
        return NextResponse.json({ ok: result.errors === 0, ...result });
      }
      case "messageReceived":
        // TODO: messaggistica ospite (out of scope per il primo cut)
        return NextResponse.json({ ok: true, skipped: "messageReceived" });
      default:
        return NextResponse.json(
          { ok: false, error: `unknown event type: ${event.type}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
