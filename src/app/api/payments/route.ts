import { NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { requireSession } from "@/lib/security/require-session";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();
  const paymentsCol = await collections.payments();
  const payments = await paymentsCol.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ payments });
}
