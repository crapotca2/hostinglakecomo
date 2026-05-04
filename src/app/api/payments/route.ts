import { NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";

export async function GET() {
  await ensureSeeded();
  const paymentsCol = await collections.payments();
  const payments = await paymentsCol.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ payments });
}
