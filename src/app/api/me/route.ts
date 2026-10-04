import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireSession } from "@/lib/security/require-session";
import { collections } from "@/lib/mongodb/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Identità della sessione corrente (per il client: mostra il selettore
 *  proprietario solo agli admin, auto-scoping per gli owner, e il nome reale
 *  nel saluto/Impostazioni). Nome ed email vengono letti dal doc utente. */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  let name: string | null = null;
  let email: string | null = null;
  if (auth.userId && ObjectId.isValid(auth.userId)) {
    const usersCol = await collections.users();
    const u = await usersCol.findOne({ _id: new ObjectId(auth.userId) });
    if (u) {
      name = u.name ?? null;
      email = u.email ?? null;
    }
  }

  return NextResponse.json({
    userId: auth.userId,
    role: auth.role,
    ownerId: auth.ownerId,
    name,
    email,
  });
}
