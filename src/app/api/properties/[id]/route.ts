import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { requireSession } from "@/lib/security/require-session";
import type { PropertyDoc } from "@/types/database";

/**
 * Carica la property per id verificando lo scope: un owner può accedere SOLO
 * ai propri immobili (guardrail #3); un admin a tutti. In caso di mismatch
 * ritorna 404 (non rivela l'esistenza di immobili altrui).
 */
async function loadScoped(id: string) {
  const auth = await requireSession();
  if (!auth.ok) return { ok: false as const, response: auth.response };
  if (!ObjectId.isValid(id)) {
    return { ok: false as const, response: NextResponse.json({ error: "invalid_id" }, { status: 400 }) };
  }
  const col = await collections.properties();
  const doc = (await col.findOne({ _id: new ObjectId(id) })) as PropertyDoc | null;
  if (!doc || (auth.role === "owner" && doc.ownerId?.toString() !== auth.ownerId)) {
    return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { ok: true as const, col, doc };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await loadScoped(params.id);
  if (!s.ok) return s.response;
  return NextResponse.json(s.doc);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await loadScoped(params.id);
  if (!s.ok) return s.response;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  // Non permettere di riassegnare _id o ownerId dal body.
  const { _id, ownerId, ...update } = body;
  void _id;
  void ownerId;
  await s.col.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await loadScoped(params.id);
  if (!s.ok) return s.response;
  await s.col.deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}
