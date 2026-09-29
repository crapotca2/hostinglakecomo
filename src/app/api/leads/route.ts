import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireSession } from "@/lib/security/require-session";
import { collections } from "@/lib/mongodb/collections";
import type { LeadDoc, LeadStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS: readonly LeadStatus[] = ["new", "contacted", "archived"];

/**
 * Lead del form contatti — vista admin globale (non owner-scoped).
 * I lead sono trasversali all'agenzia, quindi l'accesso è riservato agli admin;
 * un owner loggato riceve 403.
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const col = await collections.leads();
  const leads = (await col
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as LeadDoc[];

  return NextResponse.json({
    leads: leads.map((l) => ({
      id: l._id!.toString(),
      nome: l.nome,
      cognome: l.cognome,
      email: l.email,
      telefono: l.telefono ?? "",
      interesse: l.interesse,
      indirizzo: l.indirizzo ?? "",
      onPlatform: l.onPlatform,
      linkAnnuncio: l.linkAnnuncio ?? "",
      messaggio: l.messaggio,
      status: l.status,
      emailSent: l.emailSent,
      createdAt:
        l.createdAt instanceof Date
          ? l.createdAt.toISOString()
          : String(l.createdAt),
    })),
  });
}

/** Aggiorna lo stato di un lead (new | contacted | archived). Admin-only. */
export async function PATCH(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    id?: string;
    status?: string;
  } | null;
  if (!body?.id || !ObjectId.isValid(body.id)) {
    return NextResponse.json({ error: "id non valido" }, { status: 400 });
  }
  if (!body.status || !VALID_STATUS.includes(body.status as LeadStatus)) {
    return NextResponse.json({ error: "status non valido" }, { status: 400 });
  }

  const col = await collections.leads();
  await col.updateOne(
    { _id: new ObjectId(body.id) },
    { $set: { status: body.status as LeadStatus, updatedAt: new Date() } },
  );
  return NextResponse.json({ ok: true });
}
