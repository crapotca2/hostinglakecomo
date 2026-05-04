# Plan 3a: Stripe Checkout for Direct Bookings

**Goal:** Allow guests to book properties directly on the Hosting Lake Como site (bypassing OTAs) by paying via Stripe Checkout. After successful payment, the booking is created in MongoDB with `source: "direct"`.

**Architecture:** Public property page → date selector → creates Stripe Checkout Session → user pays on Stripe-hosted checkout → Stripe webhook confirms payment → backend creates booking in MongoDB. Dashboard gets a new `/dashboard/payments` page listing all Stripe transactions.

**Tech Stack:** stripe SDK (Node), @stripe/stripe-js (browser), Next.js API routes, MongoDB.

---

## File Structure

### Create
- `src/lib/stripe/client.ts` — Stripe SDK wrapper with graceful no-key fallback
- `src/lib/stripe/pricing.ts` — Price computation for booking (nights × rate + cleaning + tax)
- `src/app/api/stripe/checkout/route.ts` — POST to create checkout session
- `src/app/api/stripe/webhook/route.ts` — POST webhook receiver
- `src/app/api/payments/route.ts` — GET list of payments (for dashboard)
- `src/app/(public)/properties/[slug]/book/page.tsx` — Public booking page
- `src/app/(public)/properties/[slug]/page.tsx` — Property detail page (new — redirects from booking button)
- `src/app/(public)/booking/success/page.tsx` — Post-payment success page
- `src/app/(public)/booking/cancelled/page.tsx` — Post-payment cancel page
- `src/app/(dashboard)/dashboard/payments/page.tsx` — Payments history
- `src/hooks/use-payments.ts`

### Modify
- `package.json` — Add `stripe` and `@stripe/stripe-js`
- `.env.local` — Add Stripe test keys (placeholder if not yet provided)
- `src/components/layout/sidebar.tsx` — Add "Pagamenti" link
- `src/app/(public)/properties/page.tsx` — Link each property card to booking page

---

## Task 1: Install Stripe dependencies

- [ ] Run

```
npm install stripe @stripe/stripe-js
```

- [ ] Commit

```
git add package.json package-lock.json
git commit -m "deps: add stripe SDK and stripe-js"
```

---

## Task 2: Stripe client wrapper with graceful fallback

**Create file:** `src/lib/stripe/client.ts`

```typescript
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeEnabled = Boolean(STRIPE_SECRET_KEY);

export const stripe: Stripe | null = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" })
  : null;

export function assertStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local. Get a test key from https://dashboard.stripe.com/test/apikeys"
    );
  }
  return stripe;
}

export function getWebhookSecret(): string {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET not set. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook` to get one."
    );
  }
  return STRIPE_WEBHOOK_SECRET;
}
```

- [ ] Commit

```
git add src/lib/stripe/client.ts
git commit -m "feat: add Stripe client with graceful no-key fallback"
```

---

## Task 3: Pricing helpers

**Create file:** `src/lib/stripe/pricing.ts`

```typescript
import type { PropertyDoc } from "@/types/database";

export interface BookingQuote {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  touristTax: number;
  totalAmount: number;
  totalCents: number;
}

export function computeQuote(
  property: PropertyDoc,
  checkIn: Date,
  checkOut: Date,
  guests: number
): BookingQuote {
  const msPerDay = 24 * 60 * 60 * 1000;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay)
  );

  // Apply weekend multiplier on Friday/Saturday nights
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn.getTime() + i * msPerDay);
    const dow = d.getDay();
    const isWeekend = dow === 5 || dow === 6;
    const rate = property.pricing.basePrice * (isWeekend ? property.pricing.weekendMultiplier : 1);
    subtotal += Math.round(rate);
  }

  const nightlyRate = Math.round(subtotal / nights);
  const cleaningFee = property.pricing.cleaningFee;
  const maxTaxNights = property.maxTouristTaxNights || 5;
  const taxRate = property.touristTaxRate || 0;
  const touristTax = Math.min(nights, maxTaxNights) * guests * taxRate;
  const totalAmount = subtotal + cleaningFee + touristTax;
  const totalCents = Math.round(totalAmount * 100);

  return {
    nights,
    nightlyRate,
    subtotal,
    cleaningFee,
    touristTax,
    totalAmount,
    totalCents,
  };
}
```

- [ ] Commit

```
git add src/lib/stripe/pricing.ts
git commit -m "feat: add booking quote calculator"
```

---

## Task 4: Checkout session endpoint

**Create file:** `src/app/api/stripe/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { assertStripe, stripeEnabled } from "@/lib/stripe/client";
import { collections } from "@/lib/mongodb/collections";
import { computeQuote } from "@/lib/stripe/pricing";
import type { PropertyDoc } from "@/types/database";

export async function POST(req: NextRequest) {
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
```

- [ ] Commit

```
git add src/app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe checkout session creation endpoint"
```

---

## Task 5: Webhook handler

**Create file:** `src/app/api/stripe/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { assertStripe, getWebhookSecret } from "@/lib/stripe/client";
import { collections } from "@/lib/mongodb/collections";
import type Stripe from "stripe";
import type { BookingDoc, PaymentDoc, UserDoc } from "@/types/database";

// The owner ID used as fallback (same as seed)
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

  // Idempotency: don't duplicate if session already handled
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
```

- [ ] Commit

```
git add src/app/api/stripe/webhook/route.ts
git commit -m "feat: add Stripe webhook to create booking on successful payment"
```

---

## Task 6: Payments list API

**Create file:** `src/app/api/payments/route.ts`

```typescript
import { NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";

export async function GET() {
  const paymentsCol = await collections.payments();
  const payments = await paymentsCol.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ payments });
}
```

- [ ] Commit

```
git add src/app/api/payments/route.ts
git commit -m "feat: add payments list API endpoint"
```

---

## Task 7: Payments hook and dashboard page

**Create file:** `src/hooks/use-payments.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export interface Payment {
  _id: string;
  type: string;
  bookingId?: string;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments");
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      return data.payments as Payment[];
    },
  });
}
```

**Create file:** `src/app/(dashboard)/dashboard/payments/page.tsx`

```typescript
"use client";

import { CreditCard, ExternalLink } from "lucide-react";
import { usePayments } from "@/hooks/use-payments";

const STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  succeeded: "Completato",
  pending: "In attesa",
  failed: "Fallito",
  refunded: "Rimborsato",
};

const TYPE_LABELS: Record<string, string> = {
  booking: "Prenotazione",
  deposit: "Caparra",
  service: "Servizio",
  refund: "Rimborso",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentsPage() {
  const { data, isLoading } = usePayments();
  const total = (data || [])
    .filter((p) => p.status === "succeeded" && p.type !== "refund")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">Pagamenti</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transazioni Stripe da prenotazioni dirette
          </p>
        </div>
        <CreditCard className="h-5 w-5 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Totale Incassato</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(total)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Transazioni</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : data?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Media per Transazione</div>
          <div className="text-2xl font-bold">
            {isLoading || !data || data.length === 0 ? "—" : formatEuro(total / data.length)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
        ) : !data || data.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nessuna transazione. Le prenotazioni dirette pagate via Stripe appariranno qui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">Data</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Tipo</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Payment ID</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Importo</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-6 py-3.5">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-4 text-sm">{TYPE_LABELS[p.type] || p.type}</td>
                    <td className="px-4 py-4 text-xs font-mono text-muted-foreground truncate max-w-xs">
                      {p.stripePaymentIntentId}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-right tabular-nums">
                      {formatEuro(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

Add sidebar link: Modify `src/components/layout/sidebar.tsx` to add `{ href: "/dashboard/payments", icon: CreditCard, label: "Pagamenti" }` between Rendiconti and Compliance. Import `CreditCard` from lucide-react.

- [ ] Commit

```
git add src/hooks/use-payments.ts "src/app/(dashboard)/dashboard/payments/page.tsx" src/components/layout/sidebar.tsx
git commit -m "feat: add payments dashboard page with Stripe transactions history"
```

---

## Task 8: Public booking page

Create directory if needed: `src/app/(public)/properties/[slug]/book/`.

**Create file:** `src/app/(public)/properties/[slug]/book/page.tsx`

```typescript
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProperties } from "@/hooks/use-properties";
import { MapPin, Bed, Bath, Users, Lock, CheckCircle2, CreditCard } from "lucide-react";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BookPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: properties, isLoading } = useProperties();
  const property = properties?.find((p) => p.slug === slug);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const quote = useMemo(() => {
    if (!property) return null;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (ci >= co) return null;
    const nights = Math.round((co.getTime() - ci.getTime()) / 86400000);
    if (nights < 1) return null;
    const msPerDay = 86400000;
    let subtotal = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(ci.getTime() + i * msPerDay);
      const dow = d.getDay();
      const isWeekend = dow === 5 || dow === 6;
      subtotal += Math.round(property.pricing.basePrice * (isWeekend ? 1.3 : 1));
    }
    const cleaningFee = 60;
    const touristTax = Math.min(nights, 5) * guests * 3;
    const total = subtotal + cleaningFee + touristTax;
    return { nights, subtotal, cleaningFee, touristTax, total };
  }, [property, checkIn, checkOut, guests]);

  async function handleBook() {
    if (!guestName || !guestEmail) {
      setError("Inserisci nome e email");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          checkIn,
          checkOut,
          guests,
          guestName,
          guestEmail,
          guestPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante la creazione del pagamento");
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError("Errore di rete");
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Proprieta non trovata</h1>
          <p className="text-sm text-muted-foreground">La proprieta {slug} non esiste.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: property preview + dates */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-border/50">
              {property.images?.[0] && (
                <img src={property.images[0].url} alt={property.name} className="w-full h-64 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  {property.address.city}
                </div>
                <h1 className="text-2xl font-semibold mb-2">{property.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.details.bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.details.bathrooms}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> max {property.details.maxGuests}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-4">
              <h2 className="text-sm font-semibold">Dettagli soggiorno</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Ospiti</label>
                  <input
                    type="number"
                    min={1}
                    max={property.details.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Math.min(property.details.maxGuests, parseInt(e.target.value) || 1)))}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-4">
              <h2 className="text-sm font-semibold">I tuoi dati</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Nome completo</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="mario@example.com"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Telefono (opzionale)</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+39 333 1234567"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: price breakdown + checkout button */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-border/50 sticky top-24 space-y-4">
              <h2 className="text-sm font-semibold">Riepilogo</h2>

              {quote ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{formatEuro(quote.subtotal / quote.nights)} × {quote.nights} notti</span>
                    <span className="tabular-nums">{formatEuro(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pulizia finale</span>
                    <span className="tabular-nums">{formatEuro(quote.cleaningFee)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tassa di soggiorno</span>
                    <span className="tabular-nums">{formatEuro(quote.touristTax)}</span>
                  </div>
                  <div className="pt-3 border-t border-border/50 flex justify-between font-bold">
                    <span>Totale</span>
                    <span className="text-primary tabular-nums">{formatEuro(quote.total)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Seleziona date valide per vedere il prezzo</p>
              )}

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={!quote || submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  "Reindirizzamento..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Paga con Stripe
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Pagamento sicuro con Stripe · Cancellazione gratuita entro 48h
              </div>

              <div className="pt-3 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  Conferma immediata via email
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  Check-in flessibile 14:00-23:00
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  Supporto 24/7 durante il soggiorno
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Commit

```
git add "src/app/(public)/properties/[slug]/book/page.tsx"
git commit -m "feat: add public booking page with Stripe checkout"
```

---

## Task 9: Success and cancelled pages

Create `src/app/(public)/booking/success/page.tsx`:

```typescript
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-muted/20">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Prenotazione confermata!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ti abbiamo inviato una email di conferma con tutti i dettagli del soggiorno.
          A breve riceverai anche le istruzioni per il check-in.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
```

Create `src/app/(public)/booking/cancelled/page.tsx`:

```typescript
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

export default function BookingCancelledPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-muted/20">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Pagamento annullato</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Nessun addebito e stato effettuato. Puoi riprovare quando vuoi.
        </p>
        <div className="flex gap-3 justify-center">
          {slug && (
            <Link
              href={`/properties/${slug}/book`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Riprova
            </Link>
          )}
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white transition-colors"
          >
            Altre proprieta
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Commit

```
git add "src/app/(public)/booking/"
git commit -m "feat: add booking success and cancelled pages"
```

---

## Task 10: Link properties list to booking page

**Modify** `src/app/(public)/properties/page.tsx`:

Read the file first. Find the `<Link>` inside the `PROPERTIES.map(...)` block. The current href is `/properties/${p.slug}`. Change it to `/properties/${p.slug}/book`.

If the existing code uses `/properties/${p.slug}` just replace that path to `/properties/${p.slug}/book`.

- [ ] Commit

```
git add "src/app/(public)/properties/page.tsx"
git commit -m "feat: link property cards to booking page"
```

---

## Task 11: Update .env.local and docs

**Append to** `.env.local`:

```
# Stripe (get test keys from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

(Leave values empty — user will fill them in.)

- [ ] Commit

```
git add .env.local
git commit -m "docs: document Stripe env var placeholders"
```

---

## Task 12: Build, deploy, verify

- [ ] Build: `npm run build` — expected: compiles successfully with new routes
- [ ] Push: `git push origin master`
- [ ] Deploy: `vercel --prod`
- [ ] Verify: visit `https://air-bibby.vercel.app/properties/villa-infinity/book` — should load booking page. Click "Paga con Stripe" — should show "Stripe not configured" error (expected until keys added).

Final notes for the user:
1. Get test keys at https://dashboard.stripe.com/test/apikeys
2. Add `STRIPE_SECRET_KEY=sk_test_...` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` to both `.env.local` and Vercel env
3. For webhook secret locally: run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. For webhook secret on Vercel: create a webhook endpoint in Stripe dashboard pointing to `https://air-bibby.vercel.app/api/stripe/webhook`, then copy the signing secret
