# Reports Module — Feasibility + Implementation Plan

**Goal:** Add a comprehensive Reports section to the dashboard modeled after Hospitable/Lodgify, covering ~40 report types across 5 categories.

**Current data inventory:**
- `BookingDoc`: propertyId, checkIn, checkOut, nights, guests, status, source, guestInfo (name/email/phone/nationality/documentType/documentNumber), pricing (nightlyRate/cleaningFee/totalAmount/commissionRate/commissionAmount/ownerPayout/touristTax), stripePaymentId, beds24Id, compliance (alloggiatiWebSubmitted/istatIncluded/touristTaxPaid), createdAt
- `PropertyDoc`: name, slug, ownerId, status, type, zone, address, details, pricing (basePrice/cleaningFee/weekendMultiplier), cin, touristTaxRate, maxTouristTaxNights
- `PaymentDoc`: type, bookingId, stripePaymentIntentId, stripeSessionId, amount, currency, status, createdAt
- `PayoutDoc`: ownerId, period, grossRevenue, airbibbyCommission, expenses, netPayout, bookingIds, status
- `HolidayDoc`: country, year, date, name, type

## Feasibility Matrix

Legend: ✅ Buildable now · ⚠️ Needs minor data · ❌ Needs schema extension (deferred)

### Stay Reports
| Report | Status | Source |
|--------|--------|--------|
| Daily Checklist | ✅ | Bookings with check-in/check-out today + upcoming |
| Date Range | ✅ | Bookings filtered by date range |
| Available Nights | ✅ | Calendar: properties × days - booked nights |
| Empty Units | ✅ | Properties without active bookings in range |

### Summary Reports
| Report | Status | Source |
|--------|--------|--------|
| Bookings | ✅ | Aggregated booking counts/revenue by period |
| Payments | ✅ | PaymentDoc aggregated by period |
| Line Items | ❌ | Would need itemized pricing (cleaning, tax, extras as separate items). Schema extension |
| Taxes | ✅ | touristTax + estimated cedolare secca |

### Detail Reports
| Report | Status | Source |
|--------|--------|--------|
| Bookings | ✅ | All BookingDoc fields |
| Name Crosscheck | ✅ | Group by guestInfo.name, find duplicates |
| Email List | ✅ | All unique guestInfo.email |
| Payments | ✅ | PaymentDoc with full detail |
| Line Items | ❌ | Same as above |
| Line Item Pivot | ❌ | Same |
| Taxes | ✅ | touristTax breakdown per property/booking |
| Listing Site Fees | ✅ | commissionAmount grouped by source |
| Credit Card Processing History | ✅ | PaymentDoc where stripePaymentIntentId exists |
| Insurance | ❌ | No insurance field. Deferred |

### Analysis and Statistics
| Report | Status | Source |
|--------|--------|--------|
| Booking Statistics | ✅ | Counts, revenue, growth month-over-month |
| Conversion Speed | ❌ | Needs inquiry timestamps. Deferred |
| Days in Advance | ✅ | createdAt vs checkIn distribution |
| Bookings (analytics) | ✅ | Existing analytics |
| Inquiries | ❌ | No inquiry system. Deferred |
| Quotes | ❌ | No quote system. Deferred |
| Nights/Booking | ✅ | Average nights per booking |
| People/Booking | ✅ | Average guests per booking |
| Occupancy | ✅ | Already built |
| % Occupied | ✅ | Same |
| Nights | ✅ | Total nights booked |
| People/Night | ✅ | Total guests × nights / total nights |
| People | ✅ | Total unique guest-nights |
| Availability Gaps | ✅ | Sequential gaps between bookings per property |
| Repeat Guests | ✅ | Group by email, count |
| Inquiry/Booking Volume | ❌ | Deferred |
| Listing Site Performance | ✅ | Already built |

### Property Management
| Report | Status | Source |
|--------|--------|--------|
| Expense Summary | ⚠️ | Only have estimated expenses (5% of revenue). Can show with caveat |
| Expense Detail | ❌ | Needs expense tracking schema. Deferred |
| Commission Summary | ✅ | commissionAmount aggregated |
| Commission Detail | ✅ | Per-booking commission breakdown |
| Owner Remittance Summary | ✅ | Already built (Statements page) |
| Owner Remittance Detail | ✅ | Per-booking owner payout |
| Owner Statement Bookings Remittance | ✅ | Per-period booking list with payout |
| Manager Remittance Summary | ⚠️ | Multi-tenant not yet implemented. Treat as single-manager |
| Manager Remittance Detail | ⚠️ | Same |

## Scope for This Plan

**Build now (22 reports):**
- Stay Reports: all 4
- Summary Reports: Bookings, Payments, Taxes (3 of 4)
- Detail Reports: Bookings, Name Crosscheck, Email List, Payments, Taxes, Listing Site Fees, Credit Card History (7 of 10)
- Analysis: Booking Statistics, Days in Advance, Nights/Booking, People/Booking, Occupancy, % Occupied, Nights, People/Night, People, Availability Gaps, Repeat Guests, Listing Site Performance (12 of 16)
- Property Management: Commission Summary, Commission Detail, Owner Remittance Summary, Owner Remittance Detail, Owner Statement Bookings Remittance (5 of 9)

**Total: 31 reports (out of ~40 listed)**

**Deferred (9 reports, need schema extensions):**
- Line Items, Line Item Pivot, Summary Line Items (need itemized pricing schema)
- Insurance (need insurance field)
- Conversion Speed, Inquiries, Quotes, Inquiry/Booking Volume (need inquiry system)
- Expense Detail (need expense tracking)

## Architecture

Rather than 31 separate pages, group reports into a single dashboard section with category tabs and report selector.

```
/dashboard/reports/
├── page.tsx                      # Landing with category cards
├── stay/page.tsx                 # Stay reports (tabs: Daily, Date Range, Available, Empty)
├── summary/page.tsx              # Summary reports (tabs: Bookings, Payments, Taxes)
├── detail/page.tsx               # Detail reports (tabs inside)
├── analysis/page.tsx             # Analysis & Statistics (tabs)
└── property-management/page.tsx  # PM reports (tabs)
```

Each category page has:
- Tab navigation between reports in that category
- Date range filter
- Property filter (multi-select)
- CSV export button
- Data table + summary stat cards

## Backend

Create aggregator modules in `src/lib/reports/`:
- `stay.ts` — daily checklist, date range, availability, empty units
- `summary.ts` — bookings, payments, taxes summary
- `detail.ts` — full detail queries
- `analysis.ts` — statistics, distributions, gaps, repeat guests
- `property-management.ts` — commissions, owner remittance

Single API route: `/api/reports/[category]/[report]?from=&to=&propertyIds=`

## Implementation Batches (via subagents)

**Batch 1:** Reports infrastructure
- Landing page `/dashboard/reports`
- Category routing
- Shared components: ReportTable, ReportFilters, StatCards, CSVExport
- Add "Reports" link to sidebar

**Batch 2:** Stay + Summary aggregators + pages
- Backend: stay.ts, summary.ts
- Pages: `/dashboard/reports/stay`, `/dashboard/reports/summary`
- API endpoints

**Batch 3:** Detail + Analysis aggregators + pages
- Backend: detail.ts, analysis.ts
- Pages: `/dashboard/reports/detail`, `/dashboard/reports/analysis`

**Batch 4:** Property Management + polish
- Backend: property-management.ts
- Page: `/dashboard/reports/property-management`
- Deploy

## Files to Create/Modify

### New
- `src/lib/reports/stay.ts`
- `src/lib/reports/summary.ts`
- `src/lib/reports/detail.ts`
- `src/lib/reports/analysis.ts`
- `src/lib/reports/property-management.ts`
- `src/app/api/reports/stay/route.ts`
- `src/app/api/reports/summary/route.ts`
- `src/app/api/reports/detail/route.ts`
- `src/app/api/reports/analysis/route.ts`
- `src/app/api/reports/property-management/route.ts`
- `src/app/(dashboard)/dashboard/reports/page.tsx`
- `src/app/(dashboard)/dashboard/reports/stay/page.tsx`
- `src/app/(dashboard)/dashboard/reports/summary/page.tsx`
- `src/app/(dashboard)/dashboard/reports/detail/page.tsx`
- `src/app/(dashboard)/dashboard/reports/analysis/page.tsx`
- `src/app/(dashboard)/dashboard/reports/property-management/page.tsx`
- `src/components/reports/report-table.tsx`
- `src/components/reports/report-filters.tsx`
- `src/components/reports/stat-card.tsx`
- `src/components/reports/csv-export.tsx`
- `src/hooks/use-report.ts`

### Modify
- `src/components/layout/sidebar.tsx` — add Reports link

## Verification per Batch

After each batch:
1. `npx tsc --noEmit` passes
2. `npm run build` includes new routes
3. API endpoints return correct JSON shape
4. UI renders data correctly with fixtures
