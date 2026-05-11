import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export type AuthGateOk = { ok: true; userId: string };
export type AuthGateFail = { ok: false; response: NextResponse };
export type AuthGate = AuthGateOk | AuthGateFail;

export async function requireSession(): Promise<AuthGate> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "unauthorized" },
        { status: 401 },
      ),
    };
  }
  return { ok: true, userId: (session.user as { id?: string }).id ?? "1" };
}
