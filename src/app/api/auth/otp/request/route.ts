import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth/otp";
import { rateLimitByIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Richiesta codice OTP per il login owner. Risponde SEMPRE { ok: true }
 * (anti-enumeration: non rivela se l'email è registrata). Rate-limited per IP.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimitByIp(clientIp(req), {
    key: "auth:otp-request",
    windowMs: 5 * 60_000,
    max: 5,
  });
  if (!rl.ok) return NextResponse.json({ ok: true });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const email =
    body && typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email
      : "";
  if (email) await requestOtp(email);
  return NextResponse.json({ ok: true });
}
