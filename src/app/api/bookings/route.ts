import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, any> = {};
  if (propertyId) filter.propertyId = new ObjectId(propertyId);
  if (status) filter.status = status;
  if (from || to) {
    filter.checkIn = {};
    if (from) filter.checkIn.$gte = new Date(from);
    if (to) filter.checkIn.$lte = new Date(to);
  }

  const bookingsCol = await collections.bookings();
  const bookings = await bookingsCol.find(filter).sort({ checkIn: -1 }).toArray();

  return NextResponse.json({ bookings });
}
