import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth/config";
import type { UserRole } from "@/types/database";

export type AuthGateOk = {
  ok: true;
  userId: string;
  role: UserRole;
  ownerId: string | null;
};
export type AuthGateFail = { ok: false; response: NextResponse };
export type AuthGate = AuthGateOk | AuthGateFail;

export async function requireSession(): Promise<AuthGate> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  const u = session.user as {
    id?: string;
    role?: UserRole;
    ownerId?: string | null;
  };
  return {
    ok: true,
    userId: u.id ?? "1",
    role: u.role ?? "admin",
    ownerId: u.ownerId ?? null,
  };
}

export type OwnerScope =
  | { ok: true; ownerId: string }
  | { ok: false; response: NextResponse };

/**
 * Risolve l'ownerId su cui filtrare OGNI query owner-facing (guardrail #3).
 * - role="owner" → il proprio ownerId (non può vedere altri).
 * - role="admin" → deve indicare ?ownerId=<id> (vede un owner alla volta;
 *   niente find({}) globale).
 * Ritorna sempre un ownerId valido oppure una response d'errore.
 */
export async function resolveOwnerScope(req: NextRequest): Promise<OwnerScope> {
  const auth = await requireSession();
  if (!auth.ok) return { ok: false, response: auth.response };

  let ownerId: string | null;
  if (auth.role === "owner") {
    ownerId = auth.ownerId;
    if (!ownerId) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "owner senza ownerId associato" },
          { status: 403 },
        ),
      };
    }
  } else {
    // admin (o altri ruoli): l'owner selezionato arriva da ?ownerId oppure dal
    // cookie hc_owner_scope impostato dal selettore nell'header.
    ownerId =
      new URL(req.url).searchParams.get("ownerId") ||
      req.cookies.get("hc_owner_scope")?.value ||
      null;
    if (!ownerId) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "admin: seleziona un proprietario" },
          { status: 400 },
        ),
      };
    }
  }

  if (!ObjectId.isValid(ownerId)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "ownerId non valido" }, { status: 400 }),
    };
  }
  return { ok: true, ownerId };
}
