# Plan 2a: Reporting + Compliance + Analytics

**Goal:** Wire the Analytics and Statements pages to real aggregated data, add Italian compliance exports (Alloggiati Web for Questura, ISTAT, tassa di soggiorno), and make PDF statements downloadable.

**Architecture:** Server-side aggregation via MongoDB queries in new `/api/reports/*` and `/api/compliance/*` endpoints. React Query hooks consume them. PDF generation via `@react-pdf/renderer`. Italian compliance formats generated server-side as downloadable files (TXT for Alloggiati Web fixed-width, CSV for ISTAT, PDF for tassa soggiorno).

**Tech Stack:** Next.js 14, MongoDB, TypeScript, TanStack React Query, Recharts for charts, @react-pdf/renderer for statements PDF.

---

## File Structure

### Create
- `src/lib/reports/revenue.ts` — Revenue/ADR/RevPAR aggregations
- `src/lib/reports/occupancy.ts` — Occupancy calculations
- `src/lib/reports/sources.ts` — Source breakdown (Airbnb, Booking, etc.)
- `src/lib/reports/payout.ts` — Monthly payout calculator per owner/property
- `src/lib/compliance/alloggiati.ts` — Fixed-width text export for Questura
- `src/lib/compliance/istat.ts` — CSV export per Regione Lombardia
- `src/lib/compliance/tassa-soggiorno.ts` — Tax calculation + report
- `src/app/api/reports/analytics/route.ts` — Full analytics payload
- `src/app/api/reports/statements/route.ts` — List of monthly statements
- `src/app/api/reports/statements/[period]/pdf/route.ts` — PDF statement download
- `src/app/api/compliance/alloggiati/route.ts` — Alloggiati Web TXT export
- `src/app/api/compliance/istat/route.ts` — ISTAT CSV export
- `src/app/api/compliance/tassa-soggiorno/route.ts` — Tax summary
- `src/hooks/use-analytics.ts`
- `src/hooks/use-statements.ts`
- `src/app/(dashboard)/dashboard/compliance/page.tsx` — Compliance center

### Modify
- `src/app/(dashboard)/dashboard/analytics/page.tsx` — Wire to real data
- `src/app/(dashboard)/dashboard/statements/page.tsx` — Wire to real data + PDF download
- `src/components/layout/sidebar.tsx` — Add "Compliance" link
- `package.json` — Add `recharts` and `@react-pdf/renderer`

---

## Task 1: Install dependencies

- [ ] Install packages

Run: `npm install recharts @react-pdf/renderer`

- [ ] Commit

```
git add package.json package-lock.json
git commit -m "deps: add recharts and react-pdf for analytics and statements"
```

---

## Task 2: Revenue aggregator

**Create file:** `src/lib/reports/revenue.ts`

```typescript
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc, PropertyDoc } from "@/types/database";
import { ObjectId } from "mongodb";

export interface MonthlyRevenue {
  month: string; // "2026-04"
  label: string; // "Apr"
  revenue: number;
  bookings: number;
  nights: number;
}

export interface PropertyPerformance {
  propertyId: string;
  name: string;
  revenue: number;
  bookings: number;
  nights: number;
  avgRate: number;
  occupancy: number;
}

export async function getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const bookings = (await bookingsCol.find({}).toArray()).filter(
    (b) => b.checkIn >= start && b.checkIn < end && b.status !== "cancelled"
  );

  const months = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
  ];
  const result: MonthlyRevenue[] = months.map((label, i) => ({
    month: `${year}-${String(i + 1).padStart(2, "0")}`,
    label,
    revenue: 0,
    bookings: 0,
    nights: 0,
  }));

  for (const b of bookings) {
    const monthIdx = b.checkIn.getMonth();
    result[monthIdx].revenue += b.pricing?.totalAmount || 0;
    result[monthIdx].bookings += 1;
    result[monthIdx].nights += b.nights;
  }

  return result;
}

export async function getPropertyPerformance(year: number): Promise<PropertyPerformance[]> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();
  const properties = await propsCol.find({ status: "active" }).toArray();

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const daysInYear = 365; // close enough for display

  const result: PropertyPerformance[] = [];

  for (const p of properties) {
    const propertyBookings = (await bookingsCol.find({ propertyId: p._id as ObjectId }).toArray()).filter(
      (b) => b.checkIn >= start && b.checkIn < end && b.status !== "cancelled"
    );

    const revenue = propertyBookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
    const nights = propertyBookings.reduce((s, b) => s + b.nights, 0);
    const bookings = propertyBookings.length;
    const avgRate = nights > 0 ? Math.round(revenue / nights) : 0;
    const occupancy = Math.round((nights / daysInYear) * 100);

    result.push({
      propertyId: p._id!.toString(),
      name: p.name,
      revenue,
      bookings,
      nights,
      avgRate,
      occupancy,
    });
  }

  return result.sort((a, b) => b.revenue - a.revenue);
}

export async function getKpiSummary(year: number) {
  const monthly = await getMonthlyRevenue(year);
  const properties = await getPropertyPerformance(year);

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthly.reduce((s, m) => s + m.bookings, 0);
  const totalNights = monthly.reduce((s, m) => s + m.nights, 0);
  const avgOccupancy = properties.length
    ? Math.round(properties.reduce((s, p) => s + p.occupancy, 0) / properties.length)
    : 0;
  const avgRate = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

  return {
    totalRevenue,
    totalBookings,
    avgOccupancy,
    avgRate,
  };
}
```

- [ ] Verify TS, commit

```
git add src/lib/reports/revenue.ts
git commit -m "feat: add revenue and property performance aggregators"
```

---

## Task 3: Source breakdown aggregator

**Create file:** `src/lib/reports/sources.ts`

```typescript
import { collections } from "@/lib/mongodb/collections";

export interface SourceBreakdown {
  source: string;
  label: string;
  color: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

const SOURCE_META: Record<string, { label: string; color: string }> = {
  airbnb: { label: "Airbnb", color: "#FF5A5F" },
  booking: { label: "Booking.com", color: "#003580" },
  vrbo: { label: "Vrbo", color: "#3B5998" },
  direct: { label: "Direct", color: "#0C7489" },
  expedia: { label: "Expedia", color: "#FFC72C" },
  other: { label: "Altro", color: "#9CA3AF" },
};

export async function getSourceBreakdown(year: number): Promise<SourceBreakdown[]> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const bookings = (await bookingsCol.find({}).toArray()).filter(
    (b) => b.checkIn >= start && b.checkIn < end && b.status !== "cancelled"
  );

  const bySource = new Map<string, { revenue: number; bookings: number }>();
  for (const b of bookings) {
    const key = b.source || "other";
    const prev = bySource.get(key) || { revenue: 0, bookings: 0 };
    prev.revenue += b.pricing?.totalAmount || 0;
    prev.bookings += 1;
    bySource.set(key, prev);
  }

  const total = Array.from(bySource.values()).reduce((s, v) => s + v.revenue, 0);
  const result: SourceBreakdown[] = [];
  for (const [source, data] of bySource.entries()) {
    const meta = SOURCE_META[source] || SOURCE_META.other;
    result.push({
      source,
      label: meta.label,
      color: meta.color,
      revenue: data.revenue,
      bookings: data.bookings,
      percentage: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
    });
  }

  return result.sort((a, b) => b.revenue - a.revenue);
}
```

- [ ] Verify TS, commit

```
git add src/lib/reports/sources.ts
git commit -m "feat: add source breakdown aggregator"
```

---

## Task 4: Payout calculator

**Create file:** `src/lib/reports/payout.ts`

```typescript
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";

export interface MonthlyPayout {
  period: string; // "2026-04"
  label: string; // "Aprile 2026"
  propertiesCount: number;
  grossRevenue: number;
  otaCommissions: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
  bookingCount: number;
  status: "paid" | "pending";
}

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export async function getMonthlyPayouts(year: number): Promise<MonthlyPayout[]> {
  const bookingsCol = await collections.bookings();
  const bookings = (await bookingsCol.find({}).toArray()).filter(
    (b) => b.checkIn.getFullYear() === year && b.status !== "cancelled"
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const result: MonthlyPayout[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthBookings = bookings.filter((b) => b.checkIn.getMonth() === i);
    if (monthBookings.length === 0 && (year !== currentYear || i > currentMonth)) continue;

    const grossRevenue = monthBookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
    const otaCommissions = monthBookings.reduce((s, b) => s + (b.pricing?.commissionAmount || 0), 0);
    const airbibbyCommission = Math.round(grossRevenue * 0.1);
    const expenses = Math.round(grossRevenue * 0.05); // estimate 5% for cleaning/maintenance
    const touristTax = monthBookings.reduce((s, b) => s + (b.pricing?.touristTax || 0), 0);
    const netPayout = grossRevenue - otaCommissions - airbibbyCommission - expenses - touristTax;
    const propsSet = new Set(monthBookings.map((b) => b.propertyId.toString()));

    const isPast = year < currentYear || (year === currentYear && i < currentMonth);

    result.push({
      period: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[i]} ${year}`,
      propertiesCount: propsSet.size,
      grossRevenue,
      otaCommissions,
      airbibbyCommission,
      expenses,
      touristTax,
      netPayout,
      bookingCount: monthBookings.length,
      status: isPast ? "paid" : "pending",
    });
  }

  return result;
}

export async function getPayoutForPeriod(period: string): Promise<{
  payout: MonthlyPayout | null;
  bookings: BookingDoc[];
}> {
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(monthIdx)) return { payout: null, bookings: [] };

  const all = await getMonthlyPayouts(year);
  const payout = all.find((p) => p.period === period) || null;

  const bookingsCol = await collections.bookings();
  const bookings = (await bookingsCol.find({}).toArray()).filter(
    (b) =>
      b.checkIn.getFullYear() === year &&
      b.checkIn.getMonth() === monthIdx &&
      b.status !== "cancelled"
  );

  return { payout, bookings };
}
```

- [ ] Verify TS, commit

```
git add src/lib/reports/payout.ts
git commit -m "feat: add monthly payout calculator"
```

---

## Task 5: Analytics API endpoint

**Create file:** `src/app/api/reports/analytics/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getMonthlyRevenue, getPropertyPerformance, getKpiSummary } from "@/lib/reports/revenue";
import { getSourceBreakdown } from "@/lib/reports/sources";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  const [kpis, monthly, properties, sources] = await Promise.all([
    getKpiSummary(year),
    getMonthlyRevenue(year),
    getPropertyPerformance(year),
    getSourceBreakdown(year),
  ]);

  return NextResponse.json({ year, kpis, monthly, properties, sources });
}
```

- [ ] Commit

```
git add src/app/api/reports/analytics/route.ts
git commit -m "feat: add analytics API endpoint"
```

---

## Task 6: Statements API endpoint

**Create file:** `src/app/api/reports/statements/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPayouts } from "@/lib/reports/payout";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const payouts = await getMonthlyPayouts(year);
  return NextResponse.json({ year, payouts });
}
```

- [ ] Commit

```
git add src/app/api/reports/statements/route.ts
git commit -m "feat: add statements list API endpoint"
```

---

## Task 7: Alloggiati Web export

**Create file:** `src/lib/compliance/alloggiati.ts`

```typescript
import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";

// Alloggiati Web fixed-width format per Polizia di Stato spec
// https://alloggiatiweb.poliziadistato.it
// Record type 16 (Ospite singolo) — simplified example

function pad(s: string, len: number, char = " "): string {
  return (s || "").slice(0, len).padEnd(len, char);
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export interface AlloggiatiRecord {
  bookingId: string;
  checkIn: string;
  guestName: string;
  line: string;
}

export async function generateAlloggiatiExport(
  from: Date,
  to: Date
): Promise<{ content: string; records: AlloggiatiRecord[] }> {
  const bookingsCol = await collections.bookings();
  const bookings = (await bookingsCol.find({}).toArray()).filter(
    (b) =>
      b.status !== "cancelled" &&
      b.checkIn >= from &&
      b.checkIn <= to
  );

  const records: AlloggiatiRecord[] = [];
  const lines: string[] = [];

  for (const b of bookings) {
    // Record type 16 (Ospite singolo) semplificato
    const recordType = "16";
    const arrival = formatDate(b.checkIn);
    const nights = String(b.nights).padStart(2, "0");
    const [cognome, ...nomeParts] = b.guestInfo.name.split(" ");
    const nome = nomeParts.join(" ") || "—";
    const sesso = "1"; // 1=M, 2=F — in real scenario from guest data
    const nascitaData = "01/01/1990"; // placeholder
    const comuneNascita = "999999999"; // placeholder codice ISTAT
    const provNascita = "EE";
    const statoNascita = b.guestInfo.nationality || "100000100";
    const cittadinanza = b.guestInfo.nationality || "100000100";
    const tipoDocumento = b.guestInfo.documentType || "IDEL";
    const numeroDocumento = b.guestInfo.documentNumber || "XXX000000";
    const luogoRilascio = "100000100";

    const line =
      pad(recordType, 2) +
      pad(arrival, 10) +
      pad(nights, 2) +
      pad(cognome, 50) +
      pad(nome, 30) +
      pad(sesso, 1) +
      pad(nascitaData, 10) +
      pad(comuneNascita, 9) +
      pad(provNascita, 2) +
      pad(statoNascita, 9) +
      pad(cittadinanza, 9) +
      pad(tipoDocumento, 5) +
      pad(numeroDocumento, 20) +
      pad(luogoRilascio, 9);

    lines.push(line);
    records.push({
      bookingId: b._id!.toString(),
      checkIn: arrival,
      guestName: b.guestInfo.name,
      line,
    });
  }

  return { content: lines.join("\n"), records };
}
```

- [ ] Commit

```
git add src/lib/compliance/alloggiati.ts
git commit -m "feat: add Alloggiati Web fixed-width export generator"
```

---

## Task 8: ISTAT export

**Create file:** `src/lib/compliance/istat.ts`

```typescript
import { collections } from "@/lib/mongodb/collections";

export interface IstatRow {
  date: string;
  arrivals: number;
  presences: number;
  countryCode: string;
}

export async function generateIstatExport(
  month: number,
  year: number
): Promise<{ rows: IstatRow[]; csv: string }> {
  const bookingsCol = await collections.bookings();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const bookings = (await bookingsCol.find({}).toArray()).filter(
    (b) => b.status !== "cancelled" && b.checkIn <= end && b.checkOut >= start
  );

  // Group by date + country
  const byDateCountry = new Map<string, { arrivals: number; presences: number }>();

  for (const b of bookings) {
    const country = b.guestInfo.nationality || "IT";

    // Arrivals: only on check-in day (if within period)
    if (b.checkIn >= start && b.checkIn <= end) {
      const key = `${b.checkIn.toISOString().slice(0, 10)}|${country}`;
      const prev = byDateCountry.get(key) || { arrivals: 0, presences: 0 };
      prev.arrivals += b.guests;
      byDateCountry.set(key, prev);
    }

    // Presences: for each night in period
    const dayMs = 24 * 60 * 60 * 1000;
    for (let d = new Date(b.checkIn); d < b.checkOut; d = new Date(d.getTime() + dayMs)) {
      if (d >= start && d <= end) {
        const key = `${d.toISOString().slice(0, 10)}|${country}`;
        const prev = byDateCountry.get(key) || { arrivals: 0, presences: 0 };
        prev.presences += b.guests;
        byDateCountry.set(key, prev);
      }
    }
  }

  const rows: IstatRow[] = [];
  for (const [key, vals] of byDateCountry.entries()) {
    const [date, country] = key.split("|");
    rows.push({
      date,
      arrivals: vals.arrivals,
      presences: vals.presences,
      countryCode: country,
    });
  }
  rows.sort((a, b) => (a.date + a.countryCode).localeCompare(b.date + b.countryCode));

  const header = "Data;Arrivi;Presenze;Paese";
  const csv = [header, ...rows.map((r) => `${r.date};${r.arrivals};${r.presences};${r.countryCode}`)].join("\n");

  return { rows, csv };
}
```

- [ ] Commit

```
git add src/lib/compliance/istat.ts
git commit -m "feat: add ISTAT monthly export generator"
```

---

## Task 9: Tassa di soggiorno calculator

**Create file:** `src/lib/compliance/tassa-soggiorno.ts`

```typescript
import { collections } from "@/lib/mongodb/collections";
import { ObjectId } from "mongodb";

export interface TaxRow {
  propertyId: string;
  propertyName: string;
  bookingCount: number;
  totalNights: number;
  totalGuests: number;
  taxCollected: number;
  taxOwed: number;
}

export async function generateTouristTaxReport(
  from: Date,
  to: Date
): Promise<{ rows: TaxRow[]; totalOwed: number }> {
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();

  const properties = await propsCol.find({}).toArray();
  const rows: TaxRow[] = [];
  let totalOwed = 0;

  for (const p of properties) {
    const bookings = (await bookingsCol.find({ propertyId: p._id as ObjectId }).toArray()).filter(
      (b) =>
        b.status !== "cancelled" &&
        b.checkOut > from &&
        b.checkIn < to
    );

    const bookingCount = bookings.length;
    const totalNights = bookings.reduce((s, b) => s + Math.min(b.nights, p.maxTouristTaxNights || 5), 0);
    const totalGuests = bookings.reduce((s, b) => s + b.guests, 0);
    const taxCollected = bookings.reduce((s, b) => s + (b.pricing?.touristTax || 0), 0);

    // Tax owed = nights_capped × guests × rate
    const rate = p.touristTaxRate || 0;
    const taxOwed = bookings.reduce((s, b) => {
      const nights = Math.min(b.nights, p.maxTouristTaxNights || 5);
      return s + nights * b.guests * rate;
    }, 0);

    if (bookingCount > 0) {
      rows.push({
        propertyId: p._id!.toString(),
        propertyName: p.name,
        bookingCount,
        totalNights,
        totalGuests,
        taxCollected,
        taxOwed,
      });
      totalOwed += taxOwed;
    }
  }

  return { rows, totalOwed };
}
```

- [ ] Commit

```
git add src/lib/compliance/tassa-soggiorno.ts
git commit -m "feat: add tourist tax calculator"
```

---

## Task 10: Compliance API endpoints

**Create file:** `src/app/api/compliance/alloggiati/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateAlloggiatiExport } from "@/lib/compliance/alloggiati";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const format = searchParams.get("format") || "json";

  const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const to = toParam ? new Date(toParam) : new Date();

  const { content, records } = await generateAlloggiatiExport(from, to);

  if (format === "txt") {
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="alloggiati_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.txt"`,
      },
    });
  }

  return NextResponse.json({ records, recordCount: records.length });
}
```

**Create file:** `src/app/api/compliance/istat/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateIstatExport } from "@/lib/compliance/istat";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
  const format = searchParams.get("format") || "json";

  const { rows, csv } = await generateIstatExport(month, year);

  if (format === "csv") {
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="istat_${year}_${String(month).padStart(2, "0")}.csv"`,
      },
    });
  }

  return NextResponse.json({ rows, rowCount: rows.length });
}
```

**Create file:** `src/app/api/compliance/tassa-soggiorno/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateTouristTaxReport } from "@/lib/compliance/tassa-soggiorno";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam
    ? new Date(fromParam)
    : new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const to = toParam ? new Date(toParam) : now;

  const { rows, totalOwed } = await generateTouristTaxReport(from, to);
  return NextResponse.json({ from, to, rows, totalOwed });
}
```

- [ ] Commit

```
git add src/app/api/compliance/
git commit -m "feat: add compliance export API endpoints (Alloggiati, ISTAT, tassa soggiorno)"
```

---

## Task 11: React Query hooks for analytics and statements

**Create file:** `src/hooks/use-analytics.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export interface AnalyticsData {
  year: number;
  kpis: {
    totalRevenue: number;
    totalBookings: number;
    avgOccupancy: number;
    avgRate: number;
  };
  monthly: Array<{ month: string; label: string; revenue: number; bookings: number; nights: number }>;
  properties: Array<{ propertyId: string; name: string; revenue: number; bookings: number; nights: number; avgRate: number; occupancy: number }>;
  sources: Array<{ source: string; label: string; color: string; revenue: number; bookings: number; percentage: number }>;
}

export function useAnalytics(year?: number) {
  const yr = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ["analytics", yr],
    queryFn: async () => {
      const res = await fetch(`/api/reports/analytics?year=${yr}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return (await res.json()) as AnalyticsData;
    },
  });
}
```

**Create file:** `src/hooks/use-statements.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export interface MonthlyPayout {
  period: string;
  label: string;
  propertiesCount: number;
  grossRevenue: number;
  otaCommissions: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
  bookingCount: number;
  status: "paid" | "pending";
}

export function useStatements(year?: number) {
  const yr = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ["statements", yr],
    queryFn: async () => {
      const res = await fetch(`/api/reports/statements?year=${yr}`);
      if (!res.ok) throw new Error("Failed to fetch statements");
      return (await res.json()) as { year: number; payouts: MonthlyPayout[] };
    },
  });
}
```

- [ ] Commit

```
git add src/hooks/use-analytics.ts src/hooks/use-statements.ts
git commit -m "feat: add React Query hooks for analytics and statements"
```

---

## Task 12: Wire analytics page to real data

**REPLACE ENTIRELY** `src/app/(dashboard)/dashboard/analytics/page.tsx`:

```typescript
"use client";

import { Euro, TrendingUp, CalendarDays, Home, ArrowUpRight } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useAnalytics(currentYear);

  const maxMonthRevenue = data ? Math.max(...data.monthly.map((m) => m.revenue), 1) : 1;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance del portfolio — Anno {currentYear}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Euro} label="Revenue Annuale" value={data ? formatEuro(data.kpis.totalRevenue) : "—"} loading={isLoading} />
        <KpiCard icon={CalendarDays} label="Prenotazioni Totali" value={data ? String(data.kpis.totalBookings) : "—"} loading={isLoading} />
        <KpiCard icon={TrendingUp} label="Occupazione Media" value={data ? `${data.kpis.avgOccupancy}%` : "—"} loading={isLoading} />
        <KpiCard icon={Home} label="Tariffa Media" value={data ? formatEuro(data.kpis.avgRate) : "—"} loading={isLoading} />
      </div>

      {/* Revenue Chart (CSS bars) */}
      <div className="bg-white rounded-2xl p-6 border border-border/50">
        <h2 className="text-sm font-semibold mb-6">Revenue Mensile</h2>
        {isLoading ? (
          <div className="h-48 bg-muted/20 animate-pulse rounded" />
        ) : (
          <div className="flex items-end gap-2 h-48">
            {(data?.monthly || []).map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-medium text-foreground">
                  {d.revenue > 0 ? `€${(d.revenue / 1000).toFixed(1)}k` : "—"}
                </div>
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
                  style={{ height: `${Math.max(2, (d.revenue / maxMonthRevenue) * 100)}%` }}
                />
                <div className="text-[10px] text-muted-foreground">{d.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Property Performance */}
        <div className="bg-white rounded-2xl border border-border/50">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Performance per Proprieta</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Caricamento...</div>
          ) : !data || data.properties.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nessun dato</div>
          ) : (
            <div className="divide-y divide-border/30">
              {data.properties.map((p) => (
                <div key={p.propertyId} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-sm font-bold">{formatEuro(p.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Occupazione: {p.occupancy}%</span>
                    <span>Prenotazioni: {p.bookings}</span>
                    <span>Media: {formatEuro(p.avgRate)}/notte</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, p.occupancy)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-2xl border border-border/50">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Fonti di Prenotazione</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Caricamento...</div>
          ) : !data || data.sources.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nessun dato</div>
          ) : (
            <div className="p-6 space-y-4">
              {data.sources.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{formatEuro(s.revenue)}</span>
                      <span className="text-sm font-semibold">{s.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.percentage}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, loading }: { icon: typeof Euro; label: string; value: string; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {loading ? <span className="inline-block w-20 h-6 bg-muted rounded animate-pulse" /> : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
```

- [ ] Commit

```
git add "src/app/(dashboard)/dashboard/analytics/page.tsx"
git commit -m "feat: wire analytics page to real aggregated data"
```

---

## Task 13: Wire statements page to real data

**REPLACE ENTIRELY** `src/app/(dashboard)/dashboard/statements/page.tsx`:

```typescript
"use client";

import { FileText, Download, ArrowUpRight } from "lucide-react";
import { useStatements } from "@/hooks/use-statements";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pagato",
  pending: "In elaborazione",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StatementsPage() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useStatements(currentYear);

  const payouts = data?.payouts || [];
  const ytdGross = payouts.reduce((s, p) => s + p.grossRevenue, 0);
  const ytdCommissions = payouts.reduce((s, p) => s + p.otaCommissions + p.airbibbyCommission, 0);
  const ytdExpenses = payouts.reduce((s, p) => s + p.expenses + p.touristTax, 0);
  const ytdNet = payouts.reduce((s, p) => s + p.netPayout, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Rendiconti</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Riepilogo mensile dei payout — Anno {currentYear}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Revenue Lordo YTD</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdGross)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Commissioni Totali</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdCommissions)}</div>
          <div className="text-xs text-muted-foreground mt-1">OTA + Hosting Lake Como</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Spese Operative</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdExpenses)}</div>
          <div className="text-xs text-muted-foreground mt-1">Pulizie + tassa soggiorno</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Net Payout YTD</div>
          <div className="text-2xl font-bold text-primary">{isLoading ? "—" : formatEuro(ytdNet)}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <ArrowUpRight className="h-3 w-3" /> Il tuo guadagno netto
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Nessun rendiconto disponibile</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">Periodo</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">Prenotaz.</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Lordo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Commissioni</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Spese</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Netto</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {payouts.map((s) => (
                  <tr key={s.period} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{s.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">{s.bookingCount}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium tabular-nums">{formatEuro(s.grossRevenue)}</td>
                    <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                      -{formatEuro(s.otaCommissions + s.airbibbyCommission)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                      -{formatEuro(s.expenses + s.touristTax)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-bold text-primary tabular-nums">{formatEuro(s.netPayout)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[s.status]}`}>
                        {STATUS_LABELS[s.status]}
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

- [ ] Commit

```
git add "src/app/(dashboard)/dashboard/statements/page.tsx"
git commit -m "feat: wire statements page to real payout data"
```

---

## Task 14: Compliance page

Create directory `src/app/(dashboard)/dashboard/compliance/` if not exists.

**Create file:** `src/app/(dashboard)/dashboard/compliance/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Shield, Download, FileText, Users, Euro } from "lucide-react";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function CompliancePage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [alloggiatiFrom, setAlloggiatiFrom] = useState(weekAgo.toISOString().slice(0, 10));
  const [alloggiatiTo, setAlloggiatiTo] = useState(now.toISOString().slice(0, 10));
  const [istatMonth, setIstatMonth] = useState(String(now.getMonth() + 1));
  const [istatYear, setIstatYear] = useState(String(now.getFullYear()));
  const [quarterFrom, setQuarterFrom] = useState(
    new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().slice(0, 10)
  );
  const [quarterTo, setQuarterTo] = useState(now.toISOString().slice(0, 10));

  function downloadAlloggiati() {
    const url = `/api/compliance/alloggiati?from=${alloggiatiFrom}&to=${alloggiatiTo}&format=txt`;
    downloadFile(url, `alloggiati_${alloggiatiFrom}_${alloggiatiTo}.txt`);
  }

  function downloadIstat() {
    const url = `/api/compliance/istat?month=${istatMonth}&year=${istatYear}&format=csv`;
    downloadFile(url, `istat_${istatYear}_${String(istatMonth).padStart(2, "0")}.csv`);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">Compliance</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adempimenti normativi italiani per affitti brevi
          </p>
        </div>
        <Shield className="h-5 w-5 text-primary" />
      </div>

      {/* Alloggiati Web */}
      <div className="bg-white rounded-2xl border border-border/50 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Alloggiati Web (Questura)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comunicazione dati ospiti alla Polizia di Stato entro 24h dall'arrivo.
              Esporta il file TXT formato fisso e caricalo manualmente sul portale.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Dal</label>
            <input
              type="date"
              value={alloggiatiFrom}
              onChange={(e) => setAlloggiatiFrom(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Al</label>
            <input
              type="date"
              value={alloggiatiTo}
              onChange={(e) => setAlloggiatiTo(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={downloadAlloggiati}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Scarica TXT
          </button>
        </div>
      </div>

      {/* ISTAT */}
      <div className="bg-white rounded-2xl border border-border/50 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">ISTAT (Regione Lombardia)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Report mensile flussi turistici (arrivi, presenze, nazionalita') da
              inviare alla Regione Lombardia via portale turistico.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mese</label>
            <select
              value={istatMonth}
              onChange={(e) => setIstatMonth(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-white"
            >
              {["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"].map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Anno</label>
            <input
              type="number"
              value={istatYear}
              onChange={(e) => setIstatYear(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm w-24"
            />
          </div>
          <button
            onClick={downloadIstat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Scarica CSV
          </button>
        </div>
      </div>

      {/* Tassa di soggiorno */}
      <TaxSection quarterFrom={quarterFrom} setQuarterFrom={setQuarterFrom} quarterTo={quarterTo} setQuarterTo={setQuarterTo} />
    </div>
  );
}

function TaxSection({
  quarterFrom,
  setQuarterFrom,
  quarterTo,
  setQuarterTo,
}: {
  quarterFrom: string;
  setQuarterFrom: (v: string) => void;
  quarterTo: string;
  setQuarterTo: (v: string) => void;
}) {
  const [data, setData] = useState<{
    rows: Array<{ propertyId: string; propertyName: string; bookingCount: number; totalNights: number; totalGuests: number; taxCollected: number; taxOwed: number }>;
    totalOwed: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTax() {
    setLoading(true);
    try {
      const res = await fetch(`/api/compliance/tassa-soggiorno?from=${quarterFrom}&to=${quarterTo}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
          <Euro className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold">Tassa di soggiorno</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Calcolo trimestrale da versare al Comune. Le tariffe sono configurate
            per proprieta' (tipicamente €2-4 per persona/notte, max 5 notti).
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 mt-4 mb-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Dal</label>
          <input
            type="date"
            value={quarterFrom}
            onChange={(e) => setQuarterFrom(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Al</label>
          <input
            type="date"
            value={quarterTo}
            onChange={(e) => setQuarterTo(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={loadTax}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {loading ? "Caricamento..." : "Calcola"}
        </button>
      </div>

      {data && data.rows.length > 0 && (
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left text-xs font-semibold text-muted-foreground py-2">Proprieta</th>
                <th className="text-center text-xs font-semibold text-muted-foreground py-2">Prenotaz.</th>
                <th className="text-center text-xs font-semibold text-muted-foreground py-2">Notti</th>
                <th className="text-center text-xs font-semibold text-muted-foreground py-2">Ospiti</th>
                <th className="text-right text-xs font-semibold text-muted-foreground py-2">Dovuto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.rows.map((r) => (
                <tr key={r.propertyId}>
                  <td className="py-2 text-sm font-medium">{r.propertyName}</td>
                  <td className="py-2 text-sm text-center">{r.bookingCount}</td>
                  <td className="py-2 text-sm text-center">{r.totalNights}</td>
                  <td className="py-2 text-sm text-center">{r.totalGuests}</td>
                  <td className="py-2 text-sm text-right font-semibold tabular-nums">
                    {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(r.taxOwed)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/30">
                <td colSpan={4} className="py-3 text-sm font-bold">
                  Totale da versare al Comune
                </td>
                <td className="py-3 text-base font-bold text-primary text-right tabular-nums">
                  {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(data.totalOwed)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {data && data.rows.length === 0 && (
        <div className="mt-4 p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
          Nessuna prenotazione nel periodo selezionato
        </div>
      )}
    </div>
  );
}
```

Modify sidebar.tsx to add "Compliance" link. Update `NAV_ITEMS` to include `{ href: "/dashboard/compliance", icon: Shield, label: "Compliance" }` between Rendiconti and Impostazioni. Import `Shield` from lucide-react.

- [ ] Commit

```
git add "src/app/(dashboard)/dashboard/compliance/page.tsx" src/components/layout/sidebar.tsx
git commit -m "feat: add compliance page with Alloggiati Web, ISTAT, tassa soggiorno exports"
```

---

## Task 15: Build, test, deploy

- [ ] Verify build

Run: `npm run build`
Expected: compiled successfully, includes /dashboard/compliance route.

- [ ] Push and deploy

```
git push origin master
vercel --prod
```

- [ ] Verify production

Navigate to https://air-bibby.vercel.app/dashboard/analytics, /dashboard/statements, /dashboard/compliance after login. Seed endpoint stays disabled (use local for full data verification).
