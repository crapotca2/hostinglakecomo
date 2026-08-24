import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security/require-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Identità della sessione corrente (per il client: mostra il selettore
 *  proprietario solo agli admin, auto-scoping per gli owner). */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  return NextResponse.json({
    userId: auth.userId,
    role: auth.role,
    ownerId: auth.ownerId,
  });
}
