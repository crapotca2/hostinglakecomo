import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import { resolveOwnerScope } from "@/lib/security/require-session";
import type { BookingDoc, PaymentDoc } from "@/types/database";

export async function GET(req: NextRequest) {
  const scope = await resolveOwnerScope(req);
  if (!scope.ok) return scope.response;
  await ensureSeeded();

  // PaymentDoc non ha ownerId: si scopa via i booking del proprietario (bookingId).
  const bookingsCol = await collections.bookings();
  const bIds = (
    (await bookingsCol
      .find({ ownerId: new ObjectId(scope.ownerId) })
      .toArray()) as BookingDoc[]
  )
    .map((b) => b._id)
    .filter((id): id is ObjectId => Boolean(id));

  const paymentsCol = await collections.payments();
  const payments = bIds.length
    ? ((await paymentsCol
        .find({ bookingId: { $in: bIds } })
        .sort({ createdAt: -1 })
        .toArray()) as PaymentDoc[])
    : [];

  return NextResponse.json({ payments });
}
