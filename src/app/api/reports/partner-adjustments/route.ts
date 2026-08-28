import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireSession } from "@/lib/security/require-session";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { collections } from "@/lib/mongodb/collections";
import type { PartnerAdjustmentEntry } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rettifiche manuali del payout soci (favori + acconti incassati in loco).
 * Documento INTERNO → ADMIN-ONLY. GET legge le voci di un owner; PUT le
 * sostituisce (upsert dell'intero array `entries`).
 */
async function guard() {
  const auth = await requireSession();
  if (!auth.ok) return { error: auth.response as NextResponse };
  if (auth.role !== "admin") {
    return { error: NextResponse.json({ error: "solo admin" }, { status: 403 }) };
  }
  await ensureSeeded();
  return { error: null as null };
}

function sanitize(raw: unknown): PartnerAdjustmentEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: PartnerAdjustmentEntry[] = [];
  for (const e of raw) {
    if (!e || typeof e !== "object") continue;
    const { period, kind, partner, amount, note } = e as Record<string, unknown>;
    if (typeof period !== "string" || !/^(all|\d{4}-\d{2})$/.test(period)) continue;
    if (kind !== "favore" && kind !== "acconto") continue;
    if (partner !== "angelo" && partner !== "andrei") continue;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) continue;
    out.push({
      period,
      kind,
      partner,
      amount: Math.round(amt * 100) / 100,
      ...(typeof note === "string" && note.trim() ? { note: note.trim().slice(0, 120) } : {}),
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const g = await guard();
  if (g.error) return g.error;
  const ownerId = new URL(req.url).searchParams.get("ownerId") || "";
  if (!ObjectId.isValid(ownerId)) return NextResponse.json({ error: "ownerId non valido" }, { status: 400 });
  const col = await collections.partnerAdjustments();
  const doc = await col.findOne({ ownerId: new ObjectId(ownerId) });
  return NextResponse.json({ entries: doc?.entries ?? [] });
}

export async function PUT(req: NextRequest) {
  const g = await guard();
  if (g.error) return g.error;
  const body = (await req.json().catch(() => null)) as { ownerId?: string; entries?: unknown } | null;
  const ownerId = body?.ownerId || "";
  if (!ObjectId.isValid(ownerId)) return NextResponse.json({ error: "ownerId non valido" }, { status: 400 });
  const entries = sanitize(body?.entries);
  const col = await collections.partnerAdjustments();
  const now = new Date();
  await col.updateOne(
    { ownerId: new ObjectId(ownerId) },
    { $set: { ownerId: new ObjectId(ownerId), entries, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true, entries });
}
