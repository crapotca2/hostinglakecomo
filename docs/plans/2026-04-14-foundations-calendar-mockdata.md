# Plan 1: Foundations + Calendar + Mock Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the data foundation, holiday-aware calendar, and wire the dashboard to MongoDB (fixtures) so Hosting Lake Como is fully functional and demo-ready without external API keys.

**Architecture:** Extend existing MongoDB schemas for compliance/Stripe fields. Create mock Beds24 client and static holidays client behind interfaces so real API swap is trivial later. Seed MongoDB with realistic fixture data. Replace mock arrays in dashboard pages with MongoDB queries via React Query. Add new calendar page with month-grid view showing bookings + Italian/European holidays as badges.

**Tech Stack:** Next.js 14 App Router, MongoDB Atlas (with in-memory fallback already present), TypeScript, TanStack React Query, Tailwind CSS, date-fns for date logic.

---

## File Structure

### Create

- `src/lib/beds24/types.ts` — TypeScript types mirroring Beds24 API V2 responses
- `src/lib/beds24/client.ts` — Beds24Client class with mock mode
- `src/lib/beds24/fixtures.ts` — Realistic fixture data (20 bookings, calendars, messages)
- `src/lib/holidays/types.ts` — Holiday types
- `src/lib/holidays/client.ts` — HolidaysClient with static embedded holidays
- `src/lib/holidays/data/it-2026.ts` — Italian holidays 2026
- `src/lib/holidays/data/eu-2026.ts` — DE/FR/UK/NL/CH holidays 2026
- `src/lib/holidays/data/us-2026.ts` — US holidays 2026
- `src/lib/seed/seed-fixtures.ts` — Seed script for MongoDB fixtures
- `src/hooks/use-bookings.ts` — React Query hook for bookings
- `src/hooks/use-properties.ts` — React Query hook for properties
- `src/hooks/use-holidays.ts` — React Query hook for holidays
- `src/hooks/use-dashboard-stats.ts` — React Query hook for aggregated stats
- `src/app/api/bookings/route.ts` — GET/POST bookings (already exists but incomplete — rewrite)
- `src/app/api/properties/route.ts` — GET/POST properties (exists, verify)
- `src/app/api/holidays/route.ts` — GET holidays by country+year
- `src/app/api/dashboard/stats/route.ts` — Aggregated KPIs for overview
- `src/app/api/seed/route.ts` — POST to seed fixtures (dev only)
- `src/app/(dashboard)/dashboard/calendar/page.tsx` — Calendar page
- `src/components/calendar/month-grid.tsx` — Month calendar grid
- `src/components/calendar/day-cell.tsx` — Single day cell with bookings + holidays
- `src/components/calendar/holiday-badge.tsx` — Holiday badge component
- `src/components/calendar/property-selector.tsx` — Multi-property filter
- `src/lib/date-utils.ts` — Date helpers (startOfMonth, eachDayOfInterval using date-fns)

### Modify

- `src/types/database.ts` — Add compliance fields to BookingDoc and PropertyDoc, add new types (HolidayDoc, PaymentDoc, PayoutDoc)
- `src/lib/mongodb/collections.ts` — Add holidays, payments, payouts, beds24_sync_log, compliance_records collections
- `src/components/query-provider.tsx` — Ensure proper React Query setup
- `src/app/(dashboard)/dashboard/page.tsx` — Replace STATS/RECENT_BOOKINGS const arrays with React Query hooks
- `src/app/(dashboard)/dashboard/bookings/page.tsx` — Replace BOOKINGS const with useBookings hook
- `src/app/(dashboard)/dashboard/properties/page.tsx` — Replace PROPERTIES const with useProperties hook
- `src/app/(dashboard)/dashboard/analytics/page.tsx` — Compute data from real bookings
- `src/components/layout/sidebar.tsx` — Add "Calendario" nav item before "Analytics"
- `package.json` — Add dependencies (date-fns)

---

## Task 1: Install date-fns dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install date-fns**

Run: `cd "c:/Users/Andrei/Desktop/Claudio/Hosting Lake Como" && npm install date-fns`
Expected: `added 1 package` in output, no errors.

- [ ] **Step 2: Verify install**

Run: `npm list date-fns`
Expected: `air-bibby@0.1.0` → `date-fns@<version>` listed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add date-fns for calendar date logic"
```

---

## Task 2: Extend database types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add compliance and Stripe fields to existing types**

Open `src/types/database.ts` and replace the entire file content with:

```typescript
import { ObjectId } from "mongodb";

export interface BaseDoc {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── USERS ──

export type UserRole = "admin" | "owner" | "guest";

export interface UserDoc extends BaseDoc {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
  language?: "it" | "en" | "de" | "fr";
  stripeCustomerId?: string;
  stripeConnectedAccountId?: string;
  kycStatus?: "pending" | "verified" | "restricted";
}

// ── PROPERTIES ──

export type PropertyStatus = "active" | "draft" | "inactive";
export type PropertyType = "apartment" | "villa" | "room" | "house" | "studio";

export type PropertyZone =
  | "centro-como"
  | "primo-bacino"
  | "secondo-bacino"
  | "alto-lago"
  | "valle-intelvi"
  | "lecco"
  | "altro";

export interface PropertyDoc extends BaseDoc {
  name: string;
  slug: string;
  ownerId: ObjectId;
  status: PropertyStatus;
  type: PropertyType;
  zone: PropertyZone;
  description: string;
  descriptionEn?: string;
  address: {
    street: string;
    city: string;
    province: string;
    zip: string;
    lat?: number;
    lng?: number;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    sqMeters?: number;
    floor?: number;
    hasLakeView?: boolean;
    hasParking?: boolean;
    hasWifi?: boolean;
    hasAC?: boolean;
    hasGarden?: boolean;
    hasPool?: boolean;
  };
  amenities: string[];
  images: { url: string; alt?: string; order: number }[];
  pricing: {
    basePrice: number;
    cleaningFee: number;
    weekendMultiplier: number;
    seasonalRates?: {
      name: string;
      startDate: string;
      endDate: string;
      multiplier: number;
    }[];
  };
  cin?: string;
  channelManagerId?: string;
  tags?: string[];
  beds24PropertyId?: string;
  beds24RoomId?: string;
  touristTaxRate?: number;
  maxTouristTaxNights?: number;
}

// ── BOOKINGS ──

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type BookingSource =
  | "direct"
  | "airbnb"
  | "booking"
  | "vrbo"
  | "expedia"
  | "other";

export interface BookingDoc extends BaseDoc {
  propertyId: ObjectId;
  guestId?: ObjectId;
  ownerId: ObjectId;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  status: BookingStatus;
  source: BookingSource;
  guestInfo: {
    name: string;
    email: string;
    phone?: string;
    nationality?: string;
    documentType?: string;
    documentNumber?: string;
  };
  pricing: {
    nightlyRate: number;
    cleaningFee: number;
    totalAmount: number;
    commissionRate: number;
    commissionAmount: number;
    ownerPayout: number;
    touristTax: number;
  };
  stripePaymentId?: string;
  beds24Id?: string;
  beds24LastSync?: Date;
  compliance?: {
    alloggiatiWebSubmitted: boolean;
    alloggiatiWebDate?: Date;
    istatIncluded: boolean;
    touristTaxPaid: boolean;
  };
  notes?: string;
}

// ── SERVICES ──

export type ServiceCategory = "owner" | "guest";

export interface ServiceDoc extends BaseDoc {
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  icon: string;
  price?: number;
  priceType?: "fixed" | "per_night" | "per_person" | "quote";
  active: boolean;
  order: number;
}

// ── REVIEWS ──

export interface ReviewDoc extends BaseDoc {
  propertyId: ObjectId;
  bookingId: ObjectId;
  guestName: string;
  rating: number;
  comment: string;
  source: BookingSource;
  response?: string;
}

// ── HOLIDAYS ──

export type HolidayType = "national" | "regional" | "religious" | "observance";

export interface HolidayDoc extends BaseDoc {
  country: string;
  year: number;
  date: Date;
  name: string;
  nameLocal: string;
  type: HolidayType;
}

// ── PAYMENTS ──

export type PaymentType = "booking" | "deposit" | "service" | "refund";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface PaymentDoc extends BaseDoc {
  type: PaymentType;
  bookingId?: ObjectId;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

// ── PAYOUTS ──

export type PayoutStatus = "calculated" | "scheduled" | "paid" | "failed";

export interface PayoutDoc extends BaseDoc {
  ownerId: ObjectId;
  period: { from: Date; to: Date };
  grossRevenue: number;
  airbibbyCommission: number;
  expenses: number;
  netPayout: number;
  stripeTransferId?: string;
  status: PayoutStatus;
  bookingIds: ObjectId[];
}

// ── BEDS24 SYNC LOG ──

export interface Beds24SyncLogDoc extends BaseDoc {
  event: "webhook" | "polling";
  type: string;
  beds24Id: string;
  localId?: ObjectId;
  status: "success" | "failed";
  payload: Record<string, unknown>;
  error?: string;
}

// ── COMPLIANCE RECORDS ──

export type ComplianceType = "alloggiati_web" | "istat" | "tassa_soggiorno";
export type ComplianceStatus = "draft" | "submitted" | "confirmed";

export interface ComplianceRecordDoc extends BaseDoc {
  type: ComplianceType;
  propertyId: ObjectId;
  period: { from: Date; to: Date };
  generatedAt: Date;
  status: ComplianceStatus;
  exportFormat: "csv" | "txt" | "pdf";
  fileUrl?: string;
  bookingIds: ObjectId[];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: extend database types with compliance, holidays, payments, payouts"
```

---

## Task 3: Register new MongoDB collections

**Files:**
- Modify: `src/lib/mongodb/collections.ts`

- [ ] **Step 1: Update collections registry**

Open `src/lib/mongodb/collections.ts` and replace entire content with:

```typescript
import type {
  UserDoc,
  PropertyDoc,
  BookingDoc,
  ServiceDoc,
  ReviewDoc,
  HolidayDoc,
  PaymentDoc,
  PayoutDoc,
  Beds24SyncLogDoc,
  ComplianceRecordDoc,
} from "@/types/database";

const USE_MEMORY =
  !process.env.MONGODB_URI || process.env.USE_MEMORY_STORE === "true";

async function getMongoCollection<T extends { _id?: any }>(name: string) {
  const clientPromise = (await import("./client")).default;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "air_bibby");
  return db.collection<T>(name);
}

async function getMemoryCollection<T extends { _id?: any }>(name: string) {
  const { memoryStore } = await import("./memory-store");
  return memoryStore.getCollection<T>(name) as any;
}

function getCollection<T extends { _id?: any }>(name: string) {
  if (USE_MEMORY) return getMemoryCollection<T>(name);
  return getMongoCollection<T>(name);
}

export const collections = {
  users: () => getCollection<UserDoc>("users"),
  properties: () => getCollection<PropertyDoc>("properties"),
  bookings: () => getCollection<BookingDoc>("bookings"),
  services: () => getCollection<ServiceDoc>("services"),
  reviews: () => getCollection<ReviewDoc>("reviews"),
  holidays: () => getCollection<HolidayDoc>("holidays"),
  payments: () => getCollection<PaymentDoc>("payments"),
  payouts: () => getCollection<PayoutDoc>("payouts"),
  beds24SyncLog: () => getCollection<Beds24SyncLogDoc>("beds24_sync_log"),
  complianceRecords: () =>
    getCollection<ComplianceRecordDoc>("compliance_records"),
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mongodb/collections.ts
git commit -m "feat: register new collections (holidays, payments, payouts, sync log, compliance)"
```

---

## Task 4: Italian holidays 2026 data

**Files:**
- Create: `src/lib/holidays/data/it-2026.ts`

- [ ] **Step 1: Create Italian holidays file**

Create `src/lib/holidays/data/it-2026.ts` with:

```typescript
import type { Holiday } from "../types";

// Italian public holidays for 2026
// Source: national calendar (Gazzetta Ufficiale)
export const ITALY_HOLIDAYS_2026: Holiday[] = [
  { country: "IT", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "Capodanno", type: "national" },
  { country: "IT", year: 2026, date: "2026-01-06", name: "Epiphany", nameLocal: "Epifania", type: "religious" },
  { country: "IT", year: 2026, date: "2026-04-05", name: "Easter Sunday", nameLocal: "Pasqua", type: "religious" },
  { country: "IT", year: 2026, date: "2026-04-06", name: "Easter Monday", nameLocal: "Pasquetta", type: "religious" },
  { country: "IT", year: 2026, date: "2026-04-25", name: "Liberation Day", nameLocal: "Festa della Liberazione", type: "national" },
  { country: "IT", year: 2026, date: "2026-05-01", name: "Labour Day", nameLocal: "Festa del Lavoro", type: "national" },
  { country: "IT", year: 2026, date: "2026-06-02", name: "Republic Day", nameLocal: "Festa della Repubblica", type: "national" },
  { country: "IT", year: 2026, date: "2026-08-15", name: "Assumption Day", nameLocal: "Ferragosto", type: "religious" },
  { country: "IT", year: 2026, date: "2026-11-01", name: "All Saints' Day", nameLocal: "Ognissanti", type: "religious" },
  { country: "IT", year: 2026, date: "2026-12-08", name: "Immaculate Conception", nameLocal: "Immacolata Concezione", type: "religious" },
  { country: "IT", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Natale", type: "religious" },
  { country: "IT", year: 2026, date: "2026-12-26", name: "St. Stephen's Day", nameLocal: "Santo Stefano", type: "religious" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/holidays/data/it-2026.ts
git commit -m "feat: add Italian public holidays 2026"
```

---

## Task 5: EU & US holidays 2026 data

**Files:**
- Create: `src/lib/holidays/data/eu-2026.ts`
- Create: `src/lib/holidays/data/us-2026.ts`

- [ ] **Step 1: Create EU holidays file**

Create `src/lib/holidays/data/eu-2026.ts` with top 5 source markets for Lake Como:

```typescript
import type { Holiday } from "../types";

// Top 5 source markets for Lake Como tourism
// Simplified: major national holidays only
export const EU_HOLIDAYS_2026: Holiday[] = [
  // Germany (DE)
  { country: "DE", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "Neujahr", type: "national" },
  { country: "DE", year: 2026, date: "2026-04-03", name: "Good Friday", nameLocal: "Karfreitag", type: "religious" },
  { country: "DE", year: 2026, date: "2026-04-06", name: "Easter Monday", nameLocal: "Ostermontag", type: "religious" },
  { country: "DE", year: 2026, date: "2026-05-01", name: "Labour Day", nameLocal: "Tag der Arbeit", type: "national" },
  { country: "DE", year: 2026, date: "2026-10-03", name: "German Unity Day", nameLocal: "Tag der Deutschen Einheit", type: "national" },
  { country: "DE", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Weihnachten", type: "religious" },
  { country: "DE", year: 2026, date: "2026-12-26", name: "Boxing Day", nameLocal: "Zweiter Weihnachtstag", type: "religious" },

  // France (FR)
  { country: "FR", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "Jour de l'An", type: "national" },
  { country: "FR", year: 2026, date: "2026-04-06", name: "Easter Monday", nameLocal: "Lundi de Pâques", type: "religious" },
  { country: "FR", year: 2026, date: "2026-05-01", name: "Labour Day", nameLocal: "Fête du Travail", type: "national" },
  { country: "FR", year: 2026, date: "2026-05-08", name: "Victory Day", nameLocal: "Fête de la Victoire", type: "national" },
  { country: "FR", year: 2026, date: "2026-07-14", name: "Bastille Day", nameLocal: "Fête Nationale", type: "national" },
  { country: "FR", year: 2026, date: "2026-08-15", name: "Assumption Day", nameLocal: "Assomption", type: "religious" },
  { country: "FR", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Noël", type: "religious" },

  // United Kingdom (GB)
  { country: "GB", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "New Year's Day", type: "national" },
  { country: "GB", year: 2026, date: "2026-04-03", name: "Good Friday", nameLocal: "Good Friday", type: "religious" },
  { country: "GB", year: 2026, date: "2026-04-06", name: "Easter Monday", nameLocal: "Easter Monday", type: "religious" },
  { country: "GB", year: 2026, date: "2026-05-04", name: "Early May Bank Holiday", nameLocal: "Early May Bank Holiday", type: "national" },
  { country: "GB", year: 2026, date: "2026-05-25", name: "Spring Bank Holiday", nameLocal: "Spring Bank Holiday", type: "national" },
  { country: "GB", year: 2026, date: "2026-08-31", name: "Summer Bank Holiday", nameLocal: "Summer Bank Holiday", type: "national" },
  { country: "GB", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Christmas Day", type: "religious" },
  { country: "GB", year: 2026, date: "2026-12-28", name: "Boxing Day (observed)", nameLocal: "Boxing Day", type: "religious" },

  // Netherlands (NL)
  { country: "NL", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "Nieuwjaarsdag", type: "national" },
  { country: "NL", year: 2026, date: "2026-04-27", name: "King's Day", nameLocal: "Koningsdag", type: "national" },
  { country: "NL", year: 2026, date: "2026-05-05", name: "Liberation Day", nameLocal: "Bevrijdingsdag", type: "national" },
  { country: "NL", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Eerste Kerstdag", type: "religious" },
  { country: "NL", year: 2026, date: "2026-12-26", name: "Second Christmas Day", nameLocal: "Tweede Kerstdag", type: "religious" },

  // Switzerland (CH)
  { country: "CH", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "Neujahrstag", type: "national" },
  { country: "CH", year: 2026, date: "2026-04-03", name: "Good Friday", nameLocal: "Karfreitag", type: "religious" },
  { country: "CH", year: 2026, date: "2026-04-06", name: "Easter Monday", nameLocal: "Ostermontag", type: "religious" },
  { country: "CH", year: 2026, date: "2026-08-01", name: "Swiss National Day", nameLocal: "Bundesfeier", type: "national" },
  { country: "CH", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Weihnachten", type: "religious" },
  { country: "CH", year: 2026, date: "2026-12-26", name: "St. Stephen's Day", nameLocal: "Stephanstag", type: "religious" },
];
```

- [ ] **Step 2: Create US holidays file**

Create `src/lib/holidays/data/us-2026.ts`:

```typescript
import type { Holiday } from "../types";

export const US_HOLIDAYS_2026: Holiday[] = [
  { country: "US", year: 2026, date: "2026-01-01", name: "New Year's Day", nameLocal: "New Year's Day", type: "national" },
  { country: "US", year: 2026, date: "2026-01-19", name: "MLK Day", nameLocal: "Martin Luther King Jr. Day", type: "national" },
  { country: "US", year: 2026, date: "2026-02-16", name: "Presidents' Day", nameLocal: "Presidents' Day", type: "national" },
  { country: "US", year: 2026, date: "2026-05-25", name: "Memorial Day", nameLocal: "Memorial Day", type: "national" },
  { country: "US", year: 2026, date: "2026-07-04", name: "Independence Day", nameLocal: "Independence Day", type: "national" },
  { country: "US", year: 2026, date: "2026-09-07", name: "Labor Day", nameLocal: "Labor Day", type: "national" },
  { country: "US", year: 2026, date: "2026-11-11", name: "Veterans Day", nameLocal: "Veterans Day", type: "national" },
  { country: "US", year: 2026, date: "2026-11-26", name: "Thanksgiving", nameLocal: "Thanksgiving Day", type: "national" },
  { country: "US", year: 2026, date: "2026-12-25", name: "Christmas Day", nameLocal: "Christmas Day", type: "religious" },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/holidays/data/eu-2026.ts src/lib/holidays/data/us-2026.ts
git commit -m "feat: add EU and US holidays 2026"
```

---

## Task 6: Holidays types and client

**Files:**
- Create: `src/lib/holidays/types.ts`
- Create: `src/lib/holidays/client.ts`

- [ ] **Step 1: Create types file**

Create `src/lib/holidays/types.ts`:

```typescript
export type HolidayType = "national" | "regional" | "religious" | "observance";

export interface Holiday {
  country: string;
  year: number;
  date: string; // ISO format YYYY-MM-DD
  name: string;
  nameLocal: string;
  type: HolidayType;
}

export const SUPPORTED_COUNTRIES = ["IT", "DE", "FR", "GB", "NL", "CH", "US"] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];
```

- [ ] **Step 2: Create HolidaysClient**

Create `src/lib/holidays/client.ts`:

```typescript
import type { Holiday, SupportedCountry } from "./types";
import { ITALY_HOLIDAYS_2026 } from "./data/it-2026";
import { EU_HOLIDAYS_2026 } from "./data/eu-2026";
import { US_HOLIDAYS_2026 } from "./data/us-2026";

const ALL_HOLIDAYS: Holiday[] = [
  ...ITALY_HOLIDAYS_2026,
  ...EU_HOLIDAYS_2026,
  ...US_HOLIDAYS_2026,
];

export class HolidaysClient {
  getHolidays(country: string, year: number): Holiday[] {
    return ALL_HOLIDAYS.filter(
      (h) => h.country === country && h.year === year
    );
  }

  getHolidaysForMonth(country: string, year: number, month: number): Holiday[] {
    // month is 1-indexed (1 = January)
    return this.getHolidays(country, year).filter((h) => {
      const date = new Date(h.date);
      return date.getUTCMonth() === month - 1;
    });
  }

  isHoliday(date: Date, country: string): Holiday | null {
    const year = date.getUTCFullYear();
    const dateStr = date.toISOString().slice(0, 10);
    const match = this.getHolidays(country, year).find(
      (h) => h.date === dateStr
    );
    return match || null;
  }

  getUpcomingHolidays(country: string, daysAhead: number): Holiday[] {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const year = now.getUTCFullYear();
    return this.getHolidays(country, year)
      .filter((h) => {
        const d = new Date(h.date);
        return d >= now && d <= future;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const holidaysClient = new HolidaysClient();
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 4: Commit**

```bash
git add src/lib/holidays/types.ts src/lib/holidays/client.ts
git commit -m "feat: add HolidaysClient with static embedded data"
```

---

## Task 7: Holidays API route

**Files:**
- Create: `src/app/api/holidays/route.ts`

- [ ] **Step 1: Create API endpoint**

Create `src/app/api/holidays/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { holidaysClient } from "@/lib/holidays/client";
import { SUPPORTED_COUNTRIES } from "@/lib/holidays/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "IT";
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (!SUPPORTED_COUNTRIES.includes(country as any)) {
    return NextResponse.json(
      { error: `Country ${country} not supported. Supported: ${SUPPORTED_COUNTRIES.join(", ")}` },
      { status: 400 }
    );
  }

  if (isNaN(year) || year < 2020 || year > 2030) {
    return NextResponse.json(
      { error: "Year must be between 2020 and 2030" },
      { status: 400 }
    );
  }

  const holidays = holidaysClient.getHolidays(country, year);
  return NextResponse.json({ holidays });
}
```

- [ ] **Step 2: Start dev server and test**

Run: `npm run dev` in one terminal (leave running), then in another:
`curl "http://localhost:3000/api/holidays?country=IT&year=2026"`
Expected: JSON response with `holidays` array containing 12 Italian holidays including Capodanno, Ferragosto, Natale.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/holidays/route.ts
git commit -m "feat: add /api/holidays endpoint with country filter"
```

---

## Task 8: Beds24 types

**Files:**
- Create: `src/lib/beds24/types.ts`

- [ ] **Step 1: Create Beds24 types**

Create `src/lib/beds24/types.ts`:

```typescript
// Types mirroring Beds24 API V2 responses
// See https://api.beds24.com/v2/

export interface Beds24Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  roomCount: number;
}

export interface Beds24Room {
  id: string;
  propertyId: string;
  name: string;
  maxGuests: number;
  qty: number;
}

export interface Beds24Booking {
  id: string;
  propertyId: string;
  roomId: string;
  status: "new" | "confirmed" | "cancelled" | "request" | "black";
  arrival: string; // YYYY-MM-DD
  departure: string; // YYYY-MM-DD
  numAdult: number;
  numChild: number;
  guestFirstName: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestCountry?: string;
  price: number;
  commission?: number;
  referer: string; // "Airbnb" | "Booking.com" | "Vrbo" | "Direct" | ...
  bookingTime: string; // ISO datetime
  modifiedTime: string;
}

export interface Beds24CalendarDay {
  date: string; // YYYY-MM-DD
  propertyId: string;
  roomId: string;
  price?: number;
  available: number; // 0 = not available, 1+ = available
  minStay?: number;
  maxStay?: number;
}

export interface Beds24Message {
  id: string;
  bookingId: string;
  source: "guest" | "host" | "system";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface BookingFilters {
  propertyId?: string;
  from?: string;
  to?: string;
  status?: Beds24Booking["status"];
  modifiedSince?: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/beds24/types.ts
git commit -m "feat: add Beds24 API V2 TypeScript types"
```

---

## Task 9: Beds24 fixtures

**Files:**
- Create: `src/lib/beds24/fixtures.ts`

- [ ] **Step 1: Create fixtures file**

Create `src/lib/beds24/fixtures.ts`:

```typescript
import type {
  Beds24Property,
  Beds24Booking,
  Beds24CalendarDay,
  Beds24Message,
} from "./types";

export const FIXTURE_PROPERTIES: Beds24Property[] = [
  { id: "b24_p1", name: "Villa Infinity", address: "Via del Lago 12", city: "Cernobbio", country: "IT", roomCount: 1 },
  { id: "b24_p2", name: "Appartamento Rovelli", address: "Via Rovelli 45", city: "Como", country: "IT", roomCount: 1 },
  { id: "b24_p3", name: "Villa Cosima", address: "Via Garibaldi 8", city: "Bellagio", country: "IT", roomCount: 1 },
  { id: "b24_p4", name: "Casa Nesso", address: "Via Lungolago 3", city: "Nesso", country: "IT", roomCount: 1 },
];

const SOURCES: Beds24Booking["referer"][] = ["Airbnb", "Booking.com", "Vrbo", "Direct"];
const COUNTRIES = ["IT", "DE", "FR", "GB", "US", "NL", "CH"];
const FIRST_NAMES = ["Marco", "Sarah", "Thomas", "Giulia", "Pierre", "Emma", "Luca", "Anna", "Klaus", "Maria"];
const LAST_NAMES = ["Rossi", "Mitchell", "Berger", "Ferretti", "Dupont", "Williams", "Bianchi", "Schmidt", "Mueller", "Gonzalez"];

function randomDate(start: Date, daysOffset: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

export function generateFixtureBookings(count = 20): Beds24Booking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookings: Beds24Booking[] = [];

  for (let i = 0; i < count; i++) {
    const property = FIXTURE_PROPERTIES[i % FIXTURE_PROPERTIES.length];
    const nightsCount = 2 + Math.floor(Math.random() * 6);
    const offsetDays = -30 + Math.floor(Math.random() * 120); // -30 to +90 days from today
    const arrival = randomDate(today, offsetDays);
    const departure = randomDate(today, offsetDays + nightsCount);
    const guests = 1 + Math.floor(Math.random() * 5);
    const nightlyRate = 90 + Math.floor(Math.random() * 350);
    const total = nightlyRate * nightsCount;
    const source = SOURCES[i % SOURCES.length];
    const isPast = offsetDays + nightsCount < 0;
    const isCurrent = offsetDays <= 0 && offsetDays + nightsCount >= 0;

    bookings.push({
      id: `b24_b${i + 1}`,
      propertyId: property.id,
      roomId: `${property.id}_r1`,
      status: isPast ? "confirmed" : i % 7 === 0 ? "request" : "confirmed",
      arrival,
      departure,
      numAdult: guests,
      numChild: 0,
      guestFirstName: FIRST_NAMES[i % FIRST_NAMES.length],
      guestName: LAST_NAMES[i % LAST_NAMES.length],
      guestEmail: `guest${i + 1}@example.com`,
      guestPhone: `+39 333 ${1000000 + i}`,
      guestCountry: COUNTRIES[i % COUNTRIES.length],
      price: total,
      commission: Math.round(total * (source === "Direct" ? 0 : 0.15)),
      referer: source,
      bookingTime: new Date(today.getTime() - (30 - (offsetDays < 0 ? 0 : offsetDays)) * 24 * 60 * 60 * 1000).toISOString(),
      modifiedTime: new Date().toISOString(),
    });
  }

  return bookings;
}

export function generateFixtureCalendar(
  propertyId: string,
  daysAhead = 90
): Beds24CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Beds24CalendarDay[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const basePrice = 180;
    days.push({
      date: d.toISOString().slice(0, 10),
      propertyId,
      roomId: `${propertyId}_r1`,
      price: Math.round(basePrice * (isWeekend ? 1.3 : 1)),
      available: 1,
      minStay: isWeekend ? 2 : 1,
    });
  }

  return days;
}

export const FIXTURE_MESSAGES: Beds24Message[] = [
  {
    id: "b24_m1",
    bookingId: "b24_b1",
    source: "guest",
    message: "Hi, what time is check-in available?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "b24_m2",
    bookingId: "b24_b1",
    source: "host",
    message: "Hello! Check-in is available from 3 PM. Please let me know your ETA.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/beds24/fixtures.ts
git commit -m "feat: add Beds24 fixture data generators"
```

---

## Task 10: Beds24 mock client

**Files:**
- Create: `src/lib/beds24/client.ts`

- [ ] **Step 1: Create Beds24Client**

Create `src/lib/beds24/client.ts`:

```typescript
import type {
  Beds24Property,
  Beds24Booking,
  Beds24CalendarDay,
  Beds24Message,
  BookingFilters,
} from "./types";
import {
  FIXTURE_PROPERTIES,
  FIXTURE_MESSAGES,
  generateFixtureBookings,
  generateFixtureCalendar,
} from "./fixtures";

const USE_MOCK =
  !process.env.BEDS24_REFRESH_TOKEN ||
  process.env.USE_BEDS24_MOCK === "true";

export class Beds24Client {
  private readonly baseUrl: string;
  private readonly refreshToken: string;
  private readonly longLifeToken: string;
  private accessToken: string | null = null;
  private accessTokenExpiry: number = 0;
  private cachedBookings: Beds24Booking[] | null = null;

  constructor() {
    this.baseUrl = process.env.BEDS24_API_URL || "https://api.beds24.com/v2";
    this.refreshToken = process.env.BEDS24_REFRESH_TOKEN || "";
    this.longLifeToken = process.env.BEDS24_LONG_LIFE_TOKEN || "";
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiry) {
      return this.accessToken;
    }
    const res = await fetch(`${this.baseUrl}/authentication/token`, {
      method: "GET",
      headers: { refreshToken: this.refreshToken },
    });
    if (!res.ok) throw new Error(`Beds24 auth failed: ${res.status}`);
    const data = await res.json();
    this.accessToken = data.token;
    this.accessTokenExpiry = Date.now() + (data.expiresIn - 60) * 1000;
    return this.accessToken!;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        token,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Beds24 API error ${res.status}: ${errText}`);
    }
    return (await res.json()) as T;
  }

  async getProperties(): Promise<Beds24Property[]> {
    if (USE_MOCK) return FIXTURE_PROPERTIES;
    const data = await this.request<{ data: Beds24Property[] }>("/properties");
    return data.data;
  }

  async getBookings(filters: BookingFilters = {}): Promise<Beds24Booking[]> {
    if (USE_MOCK) {
      if (!this.cachedBookings) this.cachedBookings = generateFixtureBookings(20);
      let results = this.cachedBookings;
      if (filters.propertyId) {
        results = results.filter((b) => b.propertyId === filters.propertyId);
      }
      if (filters.status) {
        results = results.filter((b) => b.status === filters.status);
      }
      return results;
    }
    const query = new URLSearchParams();
    if (filters.propertyId) query.set("propertyId", filters.propertyId);
    if (filters.from) query.set("arrival", filters.from);
    if (filters.to) query.set("departure", filters.to);
    if (filters.status) query.set("status", filters.status);
    const data = await this.request<{ data: Beds24Booking[] }>(
      `/bookings?${query.toString()}`
    );
    return data.data;
  }

  async getCalendar(
    propertyId: string,
    from: string,
    to: string
  ): Promise<Beds24CalendarDay[]> {
    if (USE_MOCK) {
      const daysBetween = Math.ceil(
        (new Date(to).getTime() - new Date(from).getTime()) / (24 * 60 * 60 * 1000)
      );
      return generateFixtureCalendar(propertyId, daysBetween || 90);
    }
    const query = new URLSearchParams({ propertyId, from, to });
    const data = await this.request<{ data: Beds24CalendarDay[] }>(
      `/inventory/rooms/calendar?${query.toString()}`
    );
    return data.data;
  }

  async getMessages(bookingId: string): Promise<Beds24Message[]> {
    if (USE_MOCK) {
      return FIXTURE_MESSAGES.filter((m) => m.bookingId === bookingId);
    }
    const data = await this.request<{ data: Beds24Message[] }>(
      `/bookings/messages?bookingId=${bookingId}`
    );
    return data.data;
  }

  isMockMode(): boolean {
    return USE_MOCK;
  }
}

export const beds24Client = new Beds24Client();
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/beds24/client.ts
git commit -m "feat: add Beds24Client with mock mode fallback"
```

---

## Task 11: Seed fixtures script and endpoint

**Files:**
- Create: `src/lib/seed/seed-fixtures.ts`
- Create: `src/app/api/seed/route.ts`

- [ ] **Step 1: Create seed logic**

Create `src/lib/seed/seed-fixtures.ts`:

```typescript
import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { beds24Client } from "@/lib/beds24/client";
import { holidaysClient } from "@/lib/holidays/client";
import type { PropertyDoc, BookingDoc, UserDoc, HolidayDoc } from "@/types/database";

const OWNER_ID = new ObjectId("000000000000000000000001");

function mapSource(referer: string): BookingDoc["source"] {
  const lower = referer.toLowerCase();
  if (lower.includes("airbnb")) return "airbnb";
  if (lower.includes("booking")) return "booking";
  if (lower.includes("vrbo")) return "vrbo";
  if (lower.includes("expedia")) return "expedia";
  if (lower.includes("direct")) return "direct";
  return "other";
}

function mapStatus(status: string): BookingDoc["status"] {
  if (status === "request") return "pending";
  if (status === "cancelled") return "cancelled";
  if (status === "confirmed") {
    return "confirmed";
  }
  return "pending";
}

export async function seedFixtures() {
  const usersCol = await collections.users();
  const propsCol = await collections.properties();
  const bookingsCol = await collections.bookings();
  const holidaysCol = await collections.holidays();

  // Clear
  await usersCol.deleteMany({});
  await propsCol.deleteMany({});
  await bookingsCol.deleteMany({});
  await holidaysCol.deleteMany({});

  const now = new Date();

  // Owner
  const owner: UserDoc = {
    _id: OWNER_ID,
    name: "Andrei Crapotca",
    email: "actopark@gmail.com",
    role: "owner",
    language: "it",
    createdAt: now,
    updatedAt: now,
  };
  await usersCol.insertOne(owner);

  // Properties from Beds24 fixtures
  const b24Properties = await beds24Client.getProperties();
  const propertyIdMap = new Map<string, ObjectId>();

  const PROPERTY_METADATA: Record<string, Partial<PropertyDoc>> = {
    b24_p1: {
      slug: "villa-infinity",
      type: "villa",
      zone: "primo-bacino",
      description: "Villa di lusso con vista lago spettacolare",
      details: { bedrooms: 3, bathrooms: 2, maxGuests: 6, hasLakeView: true, hasPool: true, hasWifi: true, hasAC: true, hasParking: true },
      images: [{ url: "/images/rentallcomo_Villa-Infinity2-1024x683.jpg", order: 0 }],
      pricing: { basePrice: 280, cleaningFee: 80, weekendMultiplier: 1.3 },
      touristTaxRate: 3.5,
      maxTouristTaxNights: 5,
    },
    b24_p2: {
      slug: "appartamento-rovelli",
      type: "apartment",
      zone: "centro-como",
      description: "Appartamento moderno nel cuore di Como",
      details: { bedrooms: 2, bathrooms: 1, maxGuests: 4, hasWifi: true, hasAC: true },
      images: [{ url: "/images/Rent_All_Como_Apt_Rovelli112-1024x683.jpg", order: 0 }],
      pricing: { basePrice: 165, cleaningFee: 50, weekendMultiplier: 1.2 },
      touristTaxRate: 2.5,
      maxTouristTaxNights: 5,
    },
    b24_p3: {
      slug: "villa-cosima",
      type: "villa",
      zone: "secondo-bacino",
      description: "Elegante villa storica a Bellagio con vista mozzafiato",
      details: { bedrooms: 4, bathrooms: 3, maxGuests: 8, hasLakeView: true, hasGarden: true, hasWifi: true, hasAC: true },
      images: [{ url: "/images/rent-all-como_villa-cosima-1-1024x683.jpg", order: 0 }],
      pricing: { basePrice: 420, cleaningFee: 120, weekendMultiplier: 1.4 },
      touristTaxRate: 4.0,
      maxTouristTaxNights: 5,
    },
    b24_p4: {
      slug: "casa-nesso",
      type: "apartment",
      zone: "primo-bacino",
      description: "Casa caratteristica nel borgo di Nesso",
      details: { bedrooms: 2, bathrooms: 1, maxGuests: 4, hasLakeView: true, hasWifi: true },
      images: [{ url: "/images/rent-all-como_villa-the-writer-s-nest-cover-1024x683.jpg", order: 0 }],
      pricing: { basePrice: 175, cleaningFee: 60, weekendMultiplier: 1.25 },
      touristTaxRate: 2.0,
      maxTouristTaxNights: 5,
    },
  };

  for (const p of b24Properties) {
    const meta = PROPERTY_METADATA[p.id];
    if (!meta) continue;
    const doc: PropertyDoc = {
      _id: new ObjectId(),
      name: p.name,
      slug: meta.slug!,
      ownerId: OWNER_ID,
      status: "active",
      type: meta.type!,
      zone: meta.zone!,
      description: meta.description!,
      address: {
        street: p.address || "",
        city: p.city || "",
        province: "CO",
        zip: "22100",
      },
      details: meta.details!,
      amenities: [],
      images: meta.images!,
      pricing: meta.pricing!,
      beds24PropertyId: p.id,
      beds24RoomId: `${p.id}_r1`,
      touristTaxRate: meta.touristTaxRate,
      maxTouristTaxNights: meta.maxTouristTaxNights,
      createdAt: now,
      updatedAt: now,
    };
    await propsCol.insertOne(doc);
    propertyIdMap.set(p.id, doc._id!);
  }

  // Bookings from Beds24 fixtures
  const b24Bookings = await beds24Client.getBookings();
  for (const b of b24Bookings) {
    const propertyId = propertyIdMap.get(b.propertyId);
    if (!propertyId) continue;
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(b.departure).getTime() - new Date(b.arrival).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );
    const nightlyRate = Math.round(b.price / nights);
    const cleaningFee = 60;
    const totalAmount = b.price + cleaningFee;
    const commissionRate = b.referer === "Direct" ? 0 : 0.15;
    const commissionAmount = Math.round(b.price * commissionRate);
    const airBibbyCommission = Math.round(b.price * 0.1);
    const touristTax = Math.min(5, nights) * b.numAdult * 3;
    const ownerPayout = b.price - commissionAmount - airBibbyCommission - touristTax;

    const doc: BookingDoc = {
      _id: new ObjectId(),
      propertyId,
      ownerId: OWNER_ID,
      checkIn: new Date(b.arrival),
      checkOut: new Date(b.departure),
      nights,
      guests: b.numAdult + b.numChild,
      status: mapStatus(b.status),
      source: mapSource(b.referer),
      guestInfo: {
        name: `${b.guestFirstName} ${b.guestName}`.trim(),
        email: b.guestEmail || "",
        phone: b.guestPhone,
        nationality: b.guestCountry,
      },
      pricing: {
        nightlyRate,
        cleaningFee,
        totalAmount,
        commissionRate,
        commissionAmount,
        ownerPayout,
        touristTax,
      },
      beds24Id: b.id,
      beds24LastSync: now,
      compliance: {
        alloggiatiWebSubmitted: false,
        istatIncluded: false,
        touristTaxPaid: false,
      },
      createdAt: new Date(b.bookingTime),
      updatedAt: now,
    };
    await bookingsCol.insertOne(doc);
  }

  // Holidays
  const countries = ["IT", "DE", "FR", "GB", "NL", "CH", "US"];
  const holidayDocs: HolidayDoc[] = [];
  for (const country of countries) {
    const list = holidaysClient.getHolidays(country, 2026);
    for (const h of list) {
      holidayDocs.push({
        _id: new ObjectId(),
        country: h.country,
        year: h.year,
        date: new Date(h.date),
        name: h.name,
        nameLocal: h.nameLocal,
        type: h.type,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  if (holidayDocs.length > 0) {
    for (const h of holidayDocs) {
      await holidaysCol.insertOne(h);
    }
  }

  return {
    users: 1,
    properties: propertyIdMap.size,
    bookings: b24Bookings.length,
    holidays: holidayDocs.length,
  };
}
```

- [ ] **Step 2: Create seed API endpoint**

Create `src/app/api/seed/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { seedFixtures } from "@/lib/seed/seed-fixtures";

export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    return NextResponse.json(
      { error: "Seeding disabled in production. Set ALLOW_SEED=true to enable." },
      { status: 403 }
    );
  }
  try {
    const result = await seedFixtures();
    return NextResponse.json({ success: true, counts: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Seed the database**

With dev server running, run:
`curl -X POST http://localhost:3000/api/seed`
Expected: `{"success":true,"counts":{"users":1,"properties":4,"bookings":20,"holidays":66}}` (holiday count may differ slightly).

- [ ] **Step 4: Commit**

```bash
git add src/lib/seed/seed-fixtures.ts src/app/api/seed/route.ts
git commit -m "feat: add fixtures seed script and /api/seed endpoint"
```

---

## Task 12: Bookings API route

**Files:**
- Modify: `src/app/api/bookings/route.ts`

- [ ] **Step 1: Rewrite bookings endpoint**

Open `src/app/api/bookings/route.ts` (or create if not exists) and replace content with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
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
```

- [ ] **Step 2: Test endpoint**

Run: `curl "http://localhost:3000/api/bookings" | head -c 500`
Expected: JSON with `bookings` array containing the 20 seeded bookings.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/bookings/route.ts
git commit -m "feat: implement bookings API with filters"
```

---

## Task 13: Properties API route

**Files:**
- Modify: `src/app/api/properties/route.ts`

- [ ] **Step 1: Read existing route**

Run: `cat "src/app/api/properties/route.ts"`
Expected: See current content to verify.

- [ ] **Step 2: Rewrite to ensure consistency**

Replace content with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter: Record<string, any> = {};
  if (status) filter.status = status;

  const propsCol = await collections.properties();
  const properties = await propsCol.find(filter).toArray();

  return NextResponse.json({ properties });
}
```

- [ ] **Step 3: Test endpoint**

Run: `curl "http://localhost:3000/api/properties" | head -c 300`
Expected: JSON with `properties` array containing 4 properties.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/properties/route.ts
git commit -m "feat: implement properties API endpoint"
```

---

## Task 14: Dashboard stats API

**Files:**
- Create: `src/app/api/dashboard/stats/route.ts`

- [ ] **Step 1: Create stats endpoint**

Create `src/app/api/dashboard/stats/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { collections } from "@/lib/mongodb/collections";

export async function GET() {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const allBookings = await bookingsCol.find({}).toArray();
  const thisMonthBookings = allBookings.filter(
    (b) =>
      b.checkIn >= monthStart &&
      b.checkIn <= monthEnd &&
      b.status !== "cancelled"
  );

  const activeBookings = allBookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "checked_in") &&
      b.checkOut >= now
  );

  const monthRevenue = thisMonthBookings.reduce(
    (sum, b) => sum + (b.pricing?.totalAmount || 0),
    0
  );

  // Occupancy: nights booked / nights available (this month, across all properties)
  const properties = await propsCol.find({ status: "active" }).toArray();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const totalAvailableNights = properties.length * daysInMonth;
  const bookedNights = thisMonthBookings.reduce((sum, b) => {
    const start = b.checkIn > monthStart ? b.checkIn : monthStart;
    const end = b.checkOut < monthEnd ? b.checkOut : monthEnd;
    const nights = Math.max(
      0,
      Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    );
    return sum + nights;
  }, 0);
  const occupancyRate =
    totalAvailableNights > 0
      ? Math.round((bookedNights / totalAvailableNights) * 100)
      : 0;

  return NextResponse.json({
    monthRevenue,
    activeBookings: activeBookings.length,
    occupancyRate,
    propertyCount: properties.length,
    recentBookings: allBookings
      .filter((b) => b.status !== "cancelled")
      .sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime())
      .slice(0, 5),
  });
}
```

- [ ] **Step 2: Test endpoint**

Run: `curl "http://localhost:3000/api/dashboard/stats"`
Expected: JSON with `monthRevenue`, `activeBookings`, `occupancyRate`, `propertyCount`, `recentBookings`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/stats/route.ts
git commit -m "feat: add dashboard aggregated stats endpoint"
```

---

## Task 15: React Query hooks

**Files:**
- Create: `src/hooks/use-bookings.ts`
- Create: `src/hooks/use-properties.ts`
- Create: `src/hooks/use-holidays.ts`
- Create: `src/hooks/use-dashboard-stats.ts`

- [ ] **Step 1: Create use-bookings hook**

Create `src/hooks/use-bookings.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export interface BookingFilters {
  propertyId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.propertyId) params.set("propertyId", filters.propertyId);
      if (filters.status) params.set("status", filters.status);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      return data.bookings as Array<{
        _id: string;
        propertyId: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        guests: number;
        status: string;
        source: string;
        guestInfo: { name: string; email: string; nationality?: string };
        pricing: { totalAmount: number; ownerPayout: number };
      }>;
    },
  });
}
```

- [ ] **Step 2: Create use-properties hook**

Create `src/hooks/use-properties.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function useProperties(status?: string) {
  return useQuery({
    queryKey: ["properties", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      return data.properties as Array<{
        _id: string;
        name: string;
        slug: string;
        type: string;
        zone: string;
        status: string;
        address: { city: string };
        details: { bedrooms: number; bathrooms: number; maxGuests: number };
        pricing: { basePrice: number };
        images: { url: string }[];
      }>;
    },
  });
}
```

- [ ] **Step 3: Create use-holidays hook**

Create `src/hooks/use-holidays.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export interface Holiday {
  country: string;
  year: number;
  date: string;
  name: string;
  nameLocal: string;
  type: "national" | "regional" | "religious" | "observance";
}

export function useHolidays(country: string = "IT", year?: number) {
  const yr = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ["holidays", country, yr],
    queryFn: async () => {
      const res = await fetch(`/api/holidays?country=${country}&year=${yr}`);
      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      return data.holidays as Holiday[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}
```

- [ ] **Step 4: Create use-dashboard-stats hook**

Create `src/hooks/use-dashboard-stats.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return (await res.json()) as {
        monthRevenue: number;
        activeBookings: number;
        occupancyRate: number;
        propertyCount: number;
        recentBookings: Array<{
          _id: string;
          propertyId: string;
          checkIn: string;
          checkOut: string;
          nights: number;
          guests: number;
          status: string;
          source: string;
          guestInfo: { name: string };
          pricing: { totalAmount: number };
        }>;
      };
    },
  });
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/
git commit -m "feat: add React Query hooks (bookings, properties, holidays, stats)"
```

---

## Task 16: Date utilities

**Files:**
- Create: `src/lib/date-utils.ts`

- [ ] **Step 1: Create date helpers**

Create `src/lib/date-utils.ts`:

```typescript
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { it } from "date-fns/locale";

export function getMonthGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function formatMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy", { locale: it });
}

export function formatDayLabel(date: Date): string {
  return format(date, "d");
}

export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export { isSameDay, isSameMonth };

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/date-utils.ts
git commit -m "feat: add date utilities for calendar"
```

---

## Task 17: Calendar components — HolidayBadge and DayCell

**Files:**
- Create: `src/components/calendar/holiday-badge.tsx`
- Create: `src/components/calendar/day-cell.tsx`

- [ ] **Step 1: Create HolidayBadge**

Create `src/components/calendar/holiday-badge.tsx`:

```typescript
import type { Holiday } from "@/hooks/use-holidays";

const COUNTRY_COLORS: Record<string, { bg: string; text: string }> = {
  IT: { bg: "bg-red-50", text: "text-red-700" },
  DE: { bg: "bg-yellow-50", text: "text-yellow-800" },
  FR: { bg: "bg-blue-50", text: "text-blue-700" },
  GB: { bg: "bg-indigo-50", text: "text-indigo-700" },
  US: { bg: "bg-purple-50", text: "text-purple-700" },
  NL: { bg: "bg-orange-50", text: "text-orange-700" },
  CH: { bg: "bg-rose-50", text: "text-rose-700" },
};

export function HolidayBadge({ holiday }: { holiday: Holiday }) {
  const colors = COUNTRY_COLORS[holiday.country] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
  };
  return (
    <span
      title={`${holiday.nameLocal} (${holiday.country})`}
      className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
    >
      {holiday.country}
    </span>
  );
}
```

- [ ] **Step 2: Create DayCell**

Create `src/components/calendar/day-cell.tsx`:

```typescript
import { isSameDay, formatDayLabel, formatDateISO } from "@/lib/date-utils";
import { HolidayBadge } from "./holiday-badge";
import type { Holiday } from "@/hooks/use-holidays";

interface Booking {
  _id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  guestInfo: { name: string };
}

interface DayCellProps {
  date: Date;
  inCurrentMonth: boolean;
  bookings: Booking[];
  holidays: Holiday[];
  isToday: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  airbnb: "bg-[#FF5A5F]",
  booking: "bg-[#003580]",
  vrbo: "bg-[#3B5998]",
  direct: "bg-primary",
  other: "bg-gray-400",
};

export function DayCell({
  date,
  inCurrentMonth,
  bookings,
  holidays,
  isToday,
}: DayCellProps) {
  const dateIso = formatDateISO(date);
  const dayBookings = bookings.filter((b) => {
    const ci = b.checkIn.slice(0, 10);
    const co = b.checkOut.slice(0, 10);
    return dateIso >= ci && dateIso < co;
  });
  const dayHolidays = holidays.filter((h) => h.date === dateIso);

  return (
    <div
      className={`min-h-[90px] p-1.5 border border-border/40 ${
        inCurrentMonth ? "bg-white" : "bg-muted/20"
      } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className={`text-xs font-semibold ${
            inCurrentMonth ? "text-foreground" : "text-muted-foreground/50"
          } ${isToday ? "text-primary" : ""}`}
        >
          {formatDayLabel(date)}
        </span>
        <div className="flex flex-wrap gap-0.5 justify-end">
          {dayHolidays.slice(0, 3).map((h, i) => (
            <HolidayBadge key={i} holiday={h} />
          ))}
        </div>
      </div>
      <div className="space-y-0.5">
        {dayBookings.slice(0, 3).map((b) => (
          <div
            key={b._id}
            title={`${b.guestInfo.name} (${b.source})`}
            className={`text-[10px] text-white px-1.5 py-0.5 rounded truncate ${
              SOURCE_COLORS[b.source] || SOURCE_COLORS.other
            }`}
          >
            {b.guestInfo.name}
          </div>
        ))}
        {dayBookings.length > 3 && (
          <div className="text-[10px] text-muted-foreground">
            +{dayBookings.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/calendar/holiday-badge.tsx src/components/calendar/day-cell.tsx
git commit -m "feat: add calendar day cell and holiday badge components"
```

---

## Task 18: Month grid component

**Files:**
- Create: `src/components/calendar/month-grid.tsx`

- [ ] **Step 1: Create MonthGrid**

Create `src/components/calendar/month-grid.tsx`:

```typescript
"use client";

import {
  getMonthGrid,
  formatMonthLabel,
  isSameMonth,
  isSameDay,
  WEEKDAY_LABELS,
} from "@/lib/date-utils";
import { DayCell } from "./day-cell";
import type { Holiday } from "@/hooks/use-holidays";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  _id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  guestInfo: { name: string };
}

interface MonthGridProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  bookings: Booking[];
  holidays: Holiday[];
}

export function MonthGrid({
  month,
  onMonthChange,
  bookings,
  holidays,
}: MonthGridProps) {
  const days = getMonthGrid(month);
  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <h2 className="text-sm font-semibold capitalize">
          {formatMonthLabel(month)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() - 1, 1)
              )
            }
            className="h-8 w-8 rounded-lg border border-border hover:bg-muted/50 transition-colors inline-flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMonthChange(new Date())}
            className="h-8 px-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-xs font-medium"
          >
            Oggi
          </button>
          <button
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() + 1, 1)
              )
            }
            className="h-8 w-8 rounded-lg border border-border hover:bg-muted/50 transition-colors inline-flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            inCurrentMonth={isSameMonth(day, month)}
            bookings={bookings}
            holidays={holidays}
            isToday={isSameDay(day, today)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/components/calendar/month-grid.tsx
git commit -m "feat: add month grid calendar component"
```

---

## Task 19: Calendar page

**Files:**
- Create: `src/app/(dashboard)/dashboard/calendar/page.tsx`

- [ ] **Step 1: Create calendar directory**

Run: `mkdir -p "src/app/(dashboard)/dashboard/calendar"`
Expected: directory created.

- [ ] **Step 2: Create page**

Create `src/app/(dashboard)/dashboard/calendar/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { useBookings } from "@/hooks/use-bookings";
import { useHolidays } from "@/hooks/use-holidays";
import { CalendarDays } from "lucide-react";

const COUNTRY_OPTIONS = [
  { code: "IT", label: "Italia" },
  { code: "DE", label: "Germania" },
  { code: "FR", label: "Francia" },
  { code: "GB", label: "Regno Unito" },
  { code: "NL", label: "Paesi Bassi" },
  { code: "CH", label: "Svizzera" },
  { code: "US", label: "Stati Uniti" },
];

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [countries, setCountries] = useState<string[]>(["IT"]);

  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  // Fetch holidays for all selected countries
  const holidayQueries = countries.map((c) => useHolidays(c, month.getFullYear()));
  const allHolidays = holidayQueries
    .flatMap((q) => q.data || [])
    .filter((h) => h !== undefined);

  function toggleCountry(code: string) {
    setCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">Calendario</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista unificata delle prenotazioni con festivita'
          </p>
        </div>
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>

      {/* Country filter */}
      <div className="bg-white rounded-2xl border border-border/50 p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Festivita' visualizzate
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => toggleCountry(opt.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                countries.includes(opt.code)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              {opt.code} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {bookingsLoading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          Caricamento calendario...
        </div>
      ) : (
        <MonthGrid
          month={month}
          onMonthChange={setMonth}
          bookings={bookings || []}
          holidays={allHolidays}
        />
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-border/50 p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Legenda
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#FF5A5F]" />
            Airbnb
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#003580]" />
            Booking.com
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#3B5998]" />
            Vrbo
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            Diretto
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add sidebar link**

Open `src/components/layout/sidebar.tsx` and replace the `NAV_ITEMS` array:

```typescript
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/properties", icon: Home, label: "Proprieta" },
  { href: "/dashboard/bookings", icon: CalendarDays, label: "Prenotazioni" },
  { href: "/dashboard/calendar", icon: CalendarDays, label: "Calendario" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/statements", icon: FileText, label: "Rendiconti" },
  { href: "/dashboard/settings", icon: Settings, label: "Impostazioni" },
];
```

- [ ] **Step 4: Test calendar page manually**

With dev server running, navigate to `http://localhost:3000/dashboard/calendar` (after login). Verify:
- Current month shows
- Italian holidays appear as red "IT" badges on correct days (e.g., 25 Apr has "IT" badge)
- Bookings appear as colored bars on days between check-in and check-out
- Navigation works (prev/next/today buttons)
- Toggling country filters changes which holidays appear

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/dashboard/calendar/page.tsx" src/components/layout/sidebar.tsx
git commit -m "feat: add calendar page with holidays and booking visualization"
```

---

## Task 20: Wire dashboard overview to real data

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace with data-driven version**

Replace entire content of `src/app/(dashboard)/dashboard/page.tsx`:

```typescript
"use client";

import Link from "next/link";
import {
  Home,
  CalendarDays,
  TrendingUp,
  Users,
  Euro,
  ArrowRight,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  checked_in: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confermata",
  checked_in: "In corso",
  pending: "In attesa",
  cancelled: "Cancellata",
};

const SOURCE_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  vrbo: "Vrbo",
  direct: "Direct",
  other: "Altro",
};

const QUICK_ACTIONS = [
  { label: "Proprieta", href: "/dashboard/properties", icon: Home },
  { label: "Prenotazioni", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Calendario", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
];

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            Buongiorno, <span className="font-semibold">Andrei</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ecco il riepilogo delle tue proprieta sul Lago di Como.
          </p>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString("it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Euro}
          label="Revenue Mensile"
          value={data ? formatEuro(data.monthRevenue) : "—"}
          loading={isLoading}
        />
        <StatCard
          icon={CalendarDays}
          label="Prenotazioni Attive"
          value={data ? String(data.activeBookings) : "—"}
          loading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Tasso Occupazione"
          value={data ? `${data.occupancyRate}%` : "—"}
          loading={isLoading}
        />
        <StatCard
          icon={Home}
          label="Proprieta Gestite"
          value={data ? String(data.propertyCount) : "—"}
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-white hover:bg-muted/30 transition-colors group"
          >
            <action.icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium flex-1">{action.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-border/50">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Prenotazioni Recenti</h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs text-primary font-medium hover:underline"
          >
            Vedi tutte
          </Link>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Caricamento...
          </div>
        ) : !data || data.recentBookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nessuna prenotazione recente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Ospite</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Notti</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Fonte</th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Importo</th>
                  <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{b.guestInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center">{b.nights}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">
                      {SOURCE_LABELS[b.source] || b.source}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-right tabular-nums">
                      {formatEuro(b.pricing.totalAmount)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                        {STATUS_LABELS[b.status]}
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

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {loading ? <span className="inline-block w-16 h-6 bg-muted rounded animate-pulse" /> : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

Navigate to `http://localhost:3000/dashboard`. Verify:
- Stats cards show real numbers (not mock)
- Recent bookings table populated with seeded data
- Loading state briefly shown on first load

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/dashboard/page.tsx"
git commit -m "feat: wire dashboard overview to real MongoDB data"
```

---

## Task 21: Wire bookings page to real data

**Files:**
- Modify: `src/app/(dashboard)/dashboard/bookings/page.tsx`

- [ ] **Step 1: Replace with data-driven version**

Replace entire content:

```typescript
"use client";

import { useState } from "react";
import { Users, Search } from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { useProperties } from "@/hooks/use-properties";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  checked_in: "bg-blue-50 text-blue-700",
  checked_out: "bg-gray-100 text-gray-600",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confermata",
  checked_in: "In corso",
  checked_out: "Completata",
  pending: "In attesa",
  cancelled: "Cancellata",
};

const SOURCE_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  vrbo: "Vrbo",
  direct: "Diretto",
  other: "Altro",
};

const SOURCE_COLORS: Record<string, string> = {
  airbnb: "text-[#FF5A5F]",
  booking: "text-[#003580]",
  vrbo: "text-[#3B5998]",
  direct: "text-primary",
  other: "text-muted-foreground",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");

  const { data: bookings, isLoading } = useBookings({
    status: statusFilter || undefined,
  });
  const { data: properties } = useProperties();

  const propertyMap = new Map(
    (properties || []).map((p) => [p._id, p.name])
  );

  const filtered = (bookings || []).filter((b) => {
    if (sourceFilter && b.source !== sourceFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const propertyName = propertyMap.get(b.propertyId) || "";
      return (
        b.guestInfo.name.toLowerCase().includes(term) ||
        propertyName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Prenotazioni</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Caricamento..." : `${filtered.length} prenotazioni`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-border/50 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca ospite o proprieta..."
            className="text-sm bg-transparent border-none outline-none flex-1"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border/50 px-3 py-2 text-sm bg-white"
        >
          <option value="">Tutti gli stati</option>
          <option value="confirmed">Confermata</option>
          <option value="checked_in">In corso</option>
          <option value="pending">In attesa</option>
          <option value="checked_out">Completata</option>
          <option value="cancelled">Cancellata</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-border/50 px-3 py-2 text-sm bg-white"
        >
          <option value="">Tutte le fonti</option>
          <option value="airbnb">Airbnb</option>
          <option value="booking">Booking.com</option>
          <option value="vrbo">Vrbo</option>
          <option value="direct">Diretto</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Nessuna prenotazione trovata</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">Ospite</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Proprieta</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Date</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">Notti</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Fonte</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Importo</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-6 py-3.5">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{b.guestInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {propertyMap.get(b.propertyId) || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">{b.nights}</td>
                    <td className={`px-4 py-4 text-sm font-medium ${SOURCE_COLORS[b.source]}`}>
                      {SOURCE_LABELS[b.source] || b.source}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-right tabular-nums">
                      {formatEuro(b.pricing.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                        {STATUS_LABELS[b.status]}
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

- [ ] **Step 2: Test in browser**

Navigate to `http://localhost:3000/dashboard/bookings`. Verify filters work.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/dashboard/bookings/page.tsx"
git commit -m "feat: wire bookings page to real data with working filters"
```

---

## Task 22: Wire properties page to real data

**Files:**
- Modify: `src/app/(dashboard)/dashboard/properties/page.tsx`

- [ ] **Step 1: Replace with data-driven version**

Replace entire content:

```typescript
"use client";

import { Plus, MapPin, MoreHorizontal, Eye, Edit2 } from "lucide-react";
import { useProperties } from "@/hooks/use-properties";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Attiva",
  draft: "Bozza",
  inactive: "Disattivata",
};

const ZONE_LABELS: Record<string, string> = {
  "centro-como": "Centro Como",
  "primo-bacino": "Primo Bacino",
  "secondo-bacino": "Secondo Bacino",
  "alto-lago": "Alto Lago",
  "valle-intelvi": "Valle Intelvi",
  "lecco": "Lecco",
  "altro": "Altro",
};

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            Le Mie <span className="font-semibold">Proprieta</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Caricamento..." : `${properties?.length || 0} proprieta' nel portfolio`}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Aggiungi Proprieta
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-muted-foreground border border-border/50">
          Caricamento proprieta'...
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-muted-foreground border border-border/50">
          Nessuna proprieta' nel portfolio
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-border/50 card-hover">
              <div className="relative h-44 overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    Nessuna immagine
                  </div>
                )}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
                <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-foreground" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  {p.address.city} — {ZONE_LABELS[p.zone] || p.zone}
                </div>
                <h3 className="text-base font-semibold mb-1">{p.name}</h3>
                <div className="text-xs text-muted-foreground mb-4">
                  {p.type} · {p.details.bedrooms} cam · {p.details.bathrooms} bagni · max {p.details.maxGuests} ospiti
                </div>
                <div className="pt-4 border-t border-border/50 flex items-baseline gap-1 mb-4">
                  <span className="text-lg font-bold text-foreground">€{p.pricing.basePrice}</span>
                  <span className="text-xs text-muted-foreground">/ notte</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                    Vedi
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                    Modifica
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

Navigate to `http://localhost:3000/dashboard/properties`. Verify 4 properties appear with real images.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/dashboard/properties/page.tsx"
git commit -m "feat: wire properties page to real data"
```

---

## Task 23: Final E2E verification and deploy

**Files:** (no changes, validation only)

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No output.

- [ ] **Step 2: Full build check**

Run: `npm run build`
Expected: "Compiled successfully" and list of routes including `/dashboard/calendar`.

- [ ] **Step 3: Manual E2E verification checklist**

With dev server running, login to `/login` with password `AirBibby2026!`, then verify each page:

1. **`/dashboard`** — Stats show real numbers, recent bookings table populated, quick actions work
2. **`/dashboard/calendar`** — Month visible, Italian holidays show (e.g., 25 Apr "IT" badge), bookings appear on correct days as colored bars, prev/next navigation works, country toggle adds/removes holidays
3. **`/dashboard/properties`** — 4 properties displayed with real images from `/images/`, status badges correct
4. **`/dashboard/bookings`** — 20 bookings in table, search filter works, status filter works, source filter works
5. **`/dashboard/analytics`** — Page loads (still shows mock — wire-up deferred to Plan 2)
6. **`/dashboard/statements`** — Page loads (still mock)
7. **`/dashboard/settings`** — Page loads

- [ ] **Step 4: Deploy to Vercel**

Run: `git push origin master`
Expected: push succeeds.

Then run: `vercel --prod`
Expected: build succeeds, deploy URL printed, aliased to `https://air-bibby.vercel.app`.

- [ ] **Step 5: Seed production database**

After deploy, run:
`curl -X POST https://air-bibby.vercel.app/api/seed`
Expected: `{"success":true,"counts":{...}}`.

Note: `USE_MEMORY_STORE=true` on Vercel means data persists only per serverless function instance. This is fine for demo purposes. For persistent data, add `MONGODB_URI` to Vercel env and remove `USE_MEMORY_STORE`.

- [ ] **Step 6: Verify production**

Navigate to `https://air-bibby.vercel.app/login`, login, verify calendar page works and shows real bookings + holidays.

- [ ] **Step 7: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "chore: Plan 1 complete — foundations, calendar, real data"
git push origin master
```

---

## Self-Review Checklist (completed by plan author)

**Spec coverage:**
- [x] Schemas extended (compliance, Stripe, holidays, payments, payouts) — Task 2
- [x] MongoDB collections registered — Task 3
- [x] Beds24Client with mock mode — Tasks 8-10
- [x] HolidaysClient with static data — Tasks 4-6
- [x] Seed script — Task 11
- [x] API endpoints (bookings, properties, stats, holidays, seed) — Tasks 7, 12-14
- [x] React Query hooks — Task 15
- [x] Calendar page with holidays — Tasks 16-19
- [x] Dashboard pages wired to real data (overview, bookings, properties) — Tasks 20-22
- [x] Deploy — Task 23

**Out-of-scope for this plan** (documented as such in spec):
- Analytics page real data (Plan 2 — needs report aggregations)
- Statements page real data (Plan 2)
- Compliance exports (Plan 2)
- Beds24 real API (Plan 2)
- Stripe integration (Plan 3)

**No placeholders:** All code shown inline, no TODO markers, no "similar to" references.

**Type consistency verified:**
- `BookingDoc.source` uses values `"airbnb" | "booking" | "vrbo" | ...` consistently across seed, hooks, pages
- `Holiday.date` is always ISO string `"YYYY-MM-DD"` from types through components
- `propertyId` is ObjectId in MongoDB, string in API responses (matches React Query hook types)
