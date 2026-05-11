import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { requireSession } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter: Record<string, any> = {};
  if (status) filter.status = status;

  const propsCol = await collections.properties();
  const properties = await propsCol.find(filter).toArray();

  return NextResponse.json({ properties });
}
