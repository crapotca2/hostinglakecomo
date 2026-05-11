import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  key: string;
};

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function rateLimitByIp(
  ip: string,
  opts: RateLimitOptions,
): { ok: true } | { ok: false; retryAfter: number; resetAt: number } {
  const bucketKey = `${opts.key}:${ip}`;
  const now = Date.now();
  let bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + opts.windowMs };
    buckets.set(bucketKey, bucket);
  }

  bucket.count += 1;

  if (bucket.count > opts.max) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      resetAt: bucket.resetAt,
    };
  }

  return { ok: true };
}

export function rateLimit(
  req: NextRequest,
  opts: RateLimitOptions,
): NextResponse | null {
  const ip = getClientIp(req);
  const r = rateLimitByIp(ip, opts);
  if (r.ok) return null;
  return NextResponse.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: {
        "Retry-After": String(r.retryAfter),
        "X-RateLimit-Limit": String(opts.max),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(r.resetAt / 1000)),
      },
    },
  );
}

setInterval(() => {
  const now = Date.now();
  buckets.forEach((v, k) => {
    if (v.resetAt < now) buckets.delete(k);
  });
}, 60_000).unref?.();
