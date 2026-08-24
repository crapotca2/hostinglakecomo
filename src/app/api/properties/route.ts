import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { resolveOwnerScope } from "@/lib/security/require-session";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter: Record<string, any> = { ownerId: new ObjectId(scope.ownerId) };
  if (status) filter.status = status;

  const propsCol = await collections.properties();
  const properties = await propsCol.find(filter).toArray();

  return NextResponse.json({ properties });
}
