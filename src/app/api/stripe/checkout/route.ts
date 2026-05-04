import { NextRequest, NextResponse } from "next/server";
import { assertStripe, stripeEnabled } from "@/lib/stripe/client";
import { collections } from "@/lib/mongodb/collections";
import { computeQuote } from "@/lib/stripe/pricing";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import type { PropertyDoc } from "@/types/database";

export async function POST(req: NextRequest) {
  await ensureSeeded();
  if (!stripeEnabled) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to enable direct bookings." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { slug, checkIn, checkOut, guests, guestEmail, guestName, guestPhone } = body;

  if (!slug || !checkIn || !checkOut || !guests || !guestEmail || !guestName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const propsCol = await collections.properties();
  const property = (await propsCol.findOne({ slug })) as PropertyDoc | null;
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (checkInDate >= checkOutDate) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  const quote = computeQuote(property, checkInDate, checkOutDate, guests);
  const stripe = assertStripe();
  const origin = req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: guestEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: quote.totalCents,
          product_data: {
            name: `${property.name} — ${quote.nights} notti`,
            description: `Check-in ${checkIn} · Check-out ${checkOut} · ${guests} ospiti`,
          },
        },
      },
    ],
    metadata: {
      propertyId: property._id!.toString(),
      propertySlug: slug,
      checkIn,
      checkOut,
      nights: String(quote.nights),
      guests: String(guests),
      guestName,
      guestPhone: guestPhone || "",
      nightlyRate: String(quote.nightlyRate),
      cleaningFee: String(quote.cleaningFee),
      touristTax: String(quote.touristTax),
    },
    success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/booking/cancelled?slug=${slug}`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
