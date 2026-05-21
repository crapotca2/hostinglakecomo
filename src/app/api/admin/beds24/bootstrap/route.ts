import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { bootstrapBeds24 } from "@/lib/beds24/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Bootstrap one-shot: pull completo da Beds24 → MongoDB.
 * Pull: properties + bookings ultimi 12 mesi + calendar prossimi 90 giorni.
 * Idempotente — può essere chiamato più volte senza duplicare né resettare
 * compliance/notes/tags.
 *
 * Auth: admin session NextAuth + (in alternativa) `Authorization: Bearer
 * $ADMIN_BOOTSTRAP_TOKEN` per chiamate via curl.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const tokenHeader = req.headers.get("authorization");
  const adminToken = process.env.ADMIN_BOOTSTRAP_TOKEN;

  const isSessionAdmin = session?.user?.email === (process.env.ADMIN_EMAIL ?? "actopark@gmail.com");
  const isTokenValid = !!adminToken && tokenHeader === `Bearer ${adminToken}`;

  if (!isSessionAdmin && !isTokenValid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await bootstrapBeds24();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
