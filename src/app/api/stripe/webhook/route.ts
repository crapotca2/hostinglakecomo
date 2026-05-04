import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { assertStripe, getWebhookSecret } from "@/lib/stripe/client";
import { collections } from "@/lib/mongodb/collections";
import type Stripe from "stripe";
import type { BookingDoc, PaymentDoc } from "@/types/database";

const DEFAULT_OWNER_ID = new ObjectId("000000000000000000000001");

export async function POST(req: NextRequest) {
  const stripe = assertStripe();
  const secret = getWebhookSecret();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook signature invalid: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  if (!meta.propertyId) return;

  const now = new Date();
  const propertyId = new ObjectId(meta.propertyId);
  const checkIn = new Date(meta.checkIn);
  const checkOut = new Date(meta.checkOut);
  const nights = parseInt(meta.nights, 10);
  const guests = parseInt(meta.guests, 10);
  const totalAmount = (session.amount_total || 0) / 100;
  const nightlyRate = parseInt(meta.nightlyRate, 10);
  const cleaningFee = parseInt(meta.cleaningFee, 10);
  const touristTax = parseFloat(meta.touristTax);

  const bookingsCol = await collections.bookings();
  const paymentsCol = await collections.payments();

  const existingPayment = await paymentsCol.findOne({ stripeSessionId: session.id });
  if (existingPayment) return;

  const airbibbyCommission = Math.round((totalAmount - cleaningFee - touristTax) * 0.1);

  const booking: BookingDoc = {
    _id: new ObjectId(),
    propertyId,
    ownerId: DEFAULT_OWNER_ID,
    checkIn,
    checkOut,
    nights,
    guests,
    status: "confirmed",
    source: "direct",
    guestInfo: {
      name: meta.guestName || session.customer_details?.name || "",
      email: session.customer_email || session.customer_details?.email || "",
      phone: meta.guestPhone || session.customer_details?.phone || undefined,
    },
    pricing: {
      nightlyRate,
      cleaningFee,
      totalAmount,
      commissionRate: 0,
      commissionAmount: 0,
      ownerPayout: totalAmount - airbibbyCommission - touristTax,
      touristTax,
    },
    stripePaymentId: (session.payment_intent as string) || undefined,
    compliance: {
      alloggiatiWebSubmitted: false,
      istatIncluded: false,
      touristTaxPaid: false,
    },
    createdAt: now,
    updatedAt: now,
  };
  await bookingsCol.insertOne(booking);

  const payment: PaymentDoc = {
    _id: new ObjectId(),
    type: "booking",
    bookingId: booking._id,
    stripePaymentIntentId: (session.payment_intent as string) || session.id,
    stripeSessionId: session.id,
    amount: totalAmount,
    currency: (session.currency || "eur").toUpperCase(),
    status: "succeeded",
    createdAt: now,
    updatedAt: now,
  };
  await paymentsCol.insertOne(payment);
}
