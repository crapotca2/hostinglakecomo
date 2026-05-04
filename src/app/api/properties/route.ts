import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter: Record<string, any> = {};
  if (status) filter.status = status;

  const propsCol = await collections.properties();
  const properties = await propsCol.find(filter).toArray();

  return NextResponse.json({ properties });
}
