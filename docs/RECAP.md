# Hosting Lake Como — Project Recap

**Data aggiornamento:** 2026-04-14
**Stato:** Live in produzione
**URL produzione:** https://air-bibby.vercel.app
**Repository:** https://github.com/crapotca2/air-bibby

---

## Overview

Hosting Lake Como e' una piattaforma web per la gestione professionale di affitti brevi sul Lago di Como. Offre sia il sito pubblico per attirare proprietari (lead gen) e ospiti (prenotazioni dirette), sia una dashboard backend per la gestione operativa del portfolio.

---

## Stack Tecnico

| Area | Tecnologia |
|------|-----------|
| Framework | Next.js 14 (App Router) + React 18 |
| Linguaggio | TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MongoDB Atlas (con in-memory fallback per demo) |
| Auth | NextAuth.js v5 (password-based, single admin) |
| State client | TanStack React Query v5 |
| Icons | Lucide React |
| Date utils | date-fns 4 |
| Charts | CSS bars (custom) — Recharts installato ma non usato |
| PDF | @react-pdf/renderer (installato, non ancora usato) |
| Payments | Stripe SDK (test mode ready, keys da configurare) |
| Deploy | Vercel (deploy automatico su push a master) |

---

## Struttura del Sito

### Sito Pubblico (`src/app/(public)/`)

| Route | Descrizione |
|-------|-------------|
| `/` | Landing con video hero (Lago di Como), stats, sezioni servizi, featured properties |
| `/properties` | Lista 8 proprieta' seed con filtri zona/tipo |
| `/properties/[slug]/book` | Flusso prenotazione diretta con Stripe Checkout |
| `/booking/success` | Conferma post-pagamento |
| `/booking/cancelled` | Annullamento pagamento (con retry) |
| `/services` | 9 servizi proprietari + 6 servizi ospiti |
| `/about` | Chi siamo + 4 stats + 3 zone coperte |
| `/contact` | Form contatto con success state |
| `/strumenti` | Indice 14 tool (8 attivi, 6 coming soon) |
| `/strumenti/rendita` | Calcolatore rendita (ricavo vs zona/tipo) |
| `/strumenti/investimento` | ROI calculator (cap rate, cash-on-cash, payback) |
| `/strumenti/profit-diretto` | Profit diretto vs OTA (simulatore risparmio) |
| `/strumenti/compliance-italia` | Checklist 9 adempimenti italiani (CIN, Questura, etc.) |
| `/strumenti/nome-proprieta` | Generatore nomi (5 stili × 4 zone) |
| `/strumenti/welcome-letter` | Template IT/EN/DE editabile live |
| `/strumenti/dynamic-pricing` | Simulatore tariffe stagionali Lago di Como |
| `/strumenti/readiness-score` | 20 domande in 4 categorie, score + tip |

### Dashboard (`src/app/(dashboard)/`)

Accesso: `/login` con password `AirBibby2026!`

| Route | Descrizione |
|-------|-------------|
| `/dashboard` | Overview con KPI mensili (revenue, attive, occupazione, proprieta') + recent bookings |
| `/dashboard/properties` | Grid 8 proprieta' con status, metriche, actions |
| `/dashboard/bookings` | Tabella prenotazioni con filtri (stato, fonte, ricerca) |
| `/dashboard/calendar` | Griglia mensile unified multi-proprieta' con festivita' IT/EU/US |
| `/dashboard/analytics` | Revenue mensile bars + performance per proprieta' + source breakdown |
| `/dashboard/reports` | Hub con 5 categorie report → **31 report totali** |
| `/dashboard/reports/stay` | Daily Checklist, Date Range, Available Nights, Empty Units |
| `/dashboard/reports/summary` | Bookings/Payments/Taxes summary |
| `/dashboard/reports/detail` | 7 report dettaglio (bookings, guests, transactions, taxes, fees) |
| `/dashboard/reports/analysis` | 12 analytics (overview, days-in-advance, occupancy, gaps, repeat, site-perf) |
| `/dashboard/reports/property-management` | Commissioni + owner remittance |
| `/dashboard/statements` | Rendiconti mensili con payout breakdown |
| `/dashboard/payments` | Storico transazioni Stripe |
| `/dashboard/compliance` | Export Alloggiati Web (TXT), ISTAT (CSV), Tassa soggiorno |
| `/dashboard/settings` | Profilo, notifiche, sicurezza |

### API Routes (`src/app/api/`)

| Endpoint | Descrizione |
|----------|-------------|
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/seed` | Popola DB con fixtures (dev + ALLOW_SEED=true in prod) |
| `/api/properties` | GET properties con filtro status |
| `/api/properties/[id]` | GET singola proprieta' |
| `/api/bookings` | GET bookings con filtri (propertyId, status, range) |
| `/api/dashboard/stats` | KPI aggregati per dashboard overview |
| `/api/holidays?country=IT&year=2026` | Festivita' IT/DE/FR/GB/NL/CH/US |
| `/api/reports/analytics` | Analytics page data |
| `/api/reports/statements` | Statements data |
| `/api/reports/stay` | 4 stay reports (type param) |
| `/api/reports/summary` | 3 summary reports (type param) |
| `/api/reports/detail` | 7 detail reports (type param) |
| `/api/reports/analysis` | 6 analysis endpoints (type param) |
| `/api/reports/property-management` | 5 PM reports (type param) |
| `/api/payments` | Lista pagamenti Stripe |
| `/api/compliance/alloggiati` | Export TXT Polizia di Stato |
| `/api/compliance/istat` | Export CSV Regione Lombardia |
| `/api/compliance/tassa-soggiorno` | Calcolo trimestrale |
| `/api/stripe/checkout` | Crea Stripe Checkout Session |
| `/api/stripe/webhook` | Riceve eventi Stripe (payment success → booking) |

---

## Data Model (MongoDB)

### Collections

| Collection | Documenti seed | Schema (principali campi) |
|-----------|---------------|---------------------------|
| `users` | 1 owner | name, email, role, stripeCustomerId, stripeConnectedAccountId |
| `properties` | 8 | name, slug, type, zone, address, details, pricing, images, touristTaxRate, cin, beds24PropertyId |
| `bookings` | 48 | propertyId, guestInfo, checkIn/out, nights, guests, pricing (totalAmount, commission, touristTax, ownerPayout), status, source, stripePaymentId, beds24Id, compliance |
| `payments` | 0 | type, bookingId, stripePaymentIntentId, amount, currency, status |
| `payouts` | 0 | ownerId, period, grossRevenue, airbibbyCommission, netPayout, bookingIds |
| `holidays` | 54 | country, year, date, name, nameLocal, type |
| `beds24_sync_log` | 0 | event, type, beds24Id, status, payload |
| `compliance_records` | 0 | type, propertyId, period, status, exportFormat |

### Seed Data

- 1 owner (Andrei)
- 8 proprieta' (Villa Infinity, Appartamento Rovelli, Villa Cosima, Casa Nesso, Villa Writer's Nest, Appartamento Duomo, Casa Lungolago, Experience Loft) con foto reali del portfolio
- 48 prenotazioni distribuite tra -30 giorni e +90 giorni, 4 fonti (Airbnb/Booking/Vrbo/Direct), 7 nazionalita'
- 54 festivita' per IT, DE, FR, GB, NL, CH, US anno 2026

**Auto-seed strategy:** su Vercel serverless, ogni cold-start di un'istanza ripopola automaticamente il memory store via `ensureSeeded()` chiamato all'inizio degli endpoint GET. Cosi' i dati demo sono sempre disponibili anche senza MongoDB Atlas.

---

## Integrazioni Esterne

### Stripe (ready, attende keys)
- **Stato:** SDK installato, client wrapper con graceful fallback, checkout endpoint + webhook pronti
- **Test mode:** key gratuite su https://dashboard.stripe.com/test/apikeys
- **Env variables richieste:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Flusso:** prenotazione diretta su `/properties/[slug]/book` → Stripe Checkout → webhook conferma → booking creato con source=`direct`
- **Dashboard:** `/dashboard/payments` mostra tutte le transazioni

### Beds24 (pianificato, mock mode attivo)
- **Stato:** Client wrapper con mock fixtures. Quando arrivano i token, rimuovere `USE_BEDS24_MOCK` flag
- **Env variables richieste:** `BEDS24_REFRESH_TOKEN`, `BEDS24_LONG_LIFE_TOKEN`
- **Capabilities pronte:** `getProperties`, `getBookings`, `getCalendar`, `getMessages` (tutti con mock)

### AbstractAPI Holidays (non usata)
- **Stato:** Client scritto ma usa data embedded statica (54 festivita' per 2026)
- **Env variable:** `ABSTRACTAPI_HOLIDAYS_KEY` (opzionale, fallback su embedded)

---

## Environment Variables

```
# Vercel Production (attualmente)
NEXTAUTH_SECRET=air-bibby-secret-prod-2026-xK9mP2qR
NEXTAUTH_URL=https://air-bibby.vercel.app
ADMIN_PASSWORD=AirBibby2026!
USE_MEMORY_STORE=true
ALLOW_SEED=true  # per auto-seed serverless

# Da aggiungere quando disponibili
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
BEDS24_REFRESH_TOKEN=
BEDS24_LONG_LIFE_TOKEN=
ABSTRACTAPI_HOLIDAYS_KEY=
MONGODB_URI=  # per persistenza reale (sostituisce USE_MEMORY_STORE)
```

---

## Design System

- **Primary:** Teal `#0C7489`
- **Accent:** Amber/Gold (38 72% 58%)
- **Background:** Bianco puro `#FFFFFF`
- **Text:** Dark slate (220 20% 10%)
- **Font:** Inter 300/400/500/600/700
- **Radius:** 0.75rem default
- **Dark mode:** forzato off (ThemeProvider ritorna sempre "light")

### Layout

- Navbar fissa top con backdrop blur
- Sidebar dashboard 260px con icone + labels
- Footer con sfondo immagine tramonto Lago di Como (`footer-sunset.jpg`) e overlay gradient scuro
- Cards con `rounded-2xl`, `border border-border/50`, hover `card-hover`

---

## Componenti Shared

| Componente | Path |
|-----------|------|
| ReportTable | `src/components/reports/report-table.tsx` |
| ReportFilters | `src/components/reports/report-filters.tsx` |
| StatCard | `src/components/reports/stat-card.tsx` |
| downloadCSV | `src/components/reports/csv-export.ts` |
| MonthGrid | `src/components/calendar/month-grid.tsx` |
| DayCell | `src/components/calendar/day-cell.tsx` |
| HolidayBadge | `src/components/calendar/holiday-badge.tsx` |
| Navbar | `src/components/public/navbar.tsx` |
| Footer | `src/components/public/footer.tsx` |
| Sidebar | `src/components/layout/sidebar.tsx` |
| Header | `src/components/layout/header.tsx` |
| QueryProvider | `src/components/query-provider.tsx` |
| ThemeProvider | `src/components/theme-provider.tsx` |

---

## React Query Hooks

| Hook | Path |
|------|------|
| useBookings | `src/hooks/use-bookings.ts` |
| useProperties | `src/hooks/use-properties.ts` |
| useHolidays | `src/hooks/use-holidays.ts` |
| useDashboardStats | `src/hooks/use-dashboard-stats.ts` |
| useAnalytics | `src/hooks/use-analytics.ts` |
| useStatements | `src/hooks/use-statements.ts` |
| usePayments | `src/hooks/use-payments.ts` |

---

## Aggregators Server-Side (`src/lib/reports/`)

| File | Funzioni export |
|------|-----------------|
| `revenue.ts` | getMonthlyRevenue, getPropertyPerformance, getKpiSummary |
| `sources.ts` | getSourceBreakdown |
| `payout.ts` | getMonthlyPayouts, getPayoutForPeriod |
| `stay.ts` | getDailyChecklist, getDateRange, getAvailableNights, getEmptyUnits |
| `summary.ts` | getBookingsSummary, getPaymentsSummary, getTaxesSummary |
| `detail.ts` | getBookingsDetail, getNameCrosscheck, getEmailList, getPaymentsDetail, getTaxesDetail, getListingSiteFees, getCreditCardHistory |
| `analysis.ts` | getOverview, getDaysInAdvance, getOccupancyReport, getAvailabilityGaps, getRepeatGuests, getListingSitePerformance |
| `property-management.ts` | getCommissionSummary, getCommissionDetail, getOwnerRemittanceSummary, getOwnerRemittanceDetail, getOwnerStatementBookings |

---

## Compliance Italiana (Implementato)

- **CIN Check:** info + link portale BDSR
- **CIR Lombardia:** info SCIA + link portale regionale
- **Alloggiati Web (Questura):** export TXT formato fisso 128 caratteri per caricamento manuale
- **ISTAT:** export CSV mensile arrivi/presenze per nazionalita', formato Regione Lombardia
- **Tassa di soggiorno:** calcolatore trimestrale con cap notti configurabile per proprieta'
- **Cedolare secca:** stima 21% nei report tasse
- **Checklist readiness:** 9 adempimenti completi con sanzioni, scadenze, link ufficiali

---

## Report Module (Dettaglio)

**31 report attivi** divisi in 5 categorie, accessibili da `/dashboard/reports`:

### Stay (4)
- Daily Checklist — check-in/checkout/in-house del giorno
- Date Range — bookings nel range selezionato
- Available Nights — disponibilita' per proprieta'
- Empty Units — unita' senza ospiti correnti

### Summary (3)
- Bookings — aggregati per periodo (day/week/month)
- Payments — transazioni Stripe con fee 2.9%
- Taxes — tassa soggiorno + stima cedolare 21% per proprieta'

### Detail (7)
- Bookings Detail — full detail 14 colonne
- Name Crosscheck — guests con multiple prenotazioni
- Email List — lista email unique per marketing
- Payments Detail — tutte transazioni Stripe
- Credit Card History — sottoinsieme con Payment Intent
- Taxes Detail — per-booking tax breakdown
- Listing Site Fees — commissioni per canale

### Analysis (12 metriche consolidate)
- Overview — 10 KPI (bookings, nights, guests, ADR, RevPAR, occupancy, avg nights/booking, avg guests/booking, guest-nights, revenue)
- Days in Advance — distribuzione anticipo prenotazione
- Occupancy — per proprieta'
- Availability Gaps — notti vuote tra bookings consecutive
- Repeat Guests — ospiti ritornanti (group by email)
- Site Performance — performance per canale

### Property Management (5)
- Commission Summary — per canale
- Commission Detail — per-booking
- Owner Remittance Summary — mensile per l'anno
- Owner Remittance Detail — per-proprieta' per periodo
- Booking Remittance — ogni booking con payout calcolato

### Deferred (9, richiedono schema extensions)
- Line Items / Line Item Pivot (itemized pricing)
- Insurance (campo dedicato)
- Conversion Speed / Inquiries / Quotes / Inquiry/Booking Volume (sistema inquiry)
- Expense Detail (tracking spese)
- Manager Remittance (multi-tenant)

---

## Plans e Docs

| Documento | Path |
|-----------|------|
| Spec Beds24 | `docs/specs/2026-04-14-beds24-integration-design.md` |
| Plan 1 Foundations | `docs/plans/2026-04-14-foundations-calendar-mockdata.md` |
| Plan 2a Reporting+Compliance | `docs/plans/2026-04-14-reporting-compliance.md` |
| Plan 3a Stripe | `docs/plans/2026-04-14-stripe-checkout.md` |
| Reports Module | `docs/plans/2026-04-14-reports-module.md` |
| Recap (questo file) | `docs/RECAP.md` |

---

## Known Limitations

1. **Memory store su Vercel:** ogni serverless function instance ha memoria isolata. `ensureSeeded()` compensa ripopolando al cold start, ma azioni di scrittura (nuove prenotazioni, pagamenti) non persistono tra istanze. Soluzione: MongoDB Atlas.

2. **Stripe non attivo in prod:** code pronto ma env vars non configurate. Tentando un pagamento si ottiene 503 con messaggio esplicativo.

3. **Beds24 in mock mode:** tutti gli endpoint funzionano ma con fixture dati. Swap a real API = solo rimuovere flag.

4. **Line items:** 3 report (Line Items, Line Item Pivot, Summary Line Items) non implementati perche' richiedono itemizzazione pricing nello schema booking.

5. **Inquiry/Quote system:** 4 report legati a inquiries non implementati perche' manca il sistema inquiry (non c'e' form di richiesta informazioni separato dalle prenotazioni).

---

## Come Riprendere in Una Nuova Sessione

1. **Context quick-load:** leggi questo `RECAP.md` + `CLAUDE.md` + ultimo plan attivo
2. **Verifica stato:** `git log --oneline -10` per commit recenti, `git status` per modifiche pending
3. **Deploy status:** https://air-bibby.vercel.app/ deve caricare correttamente
4. **Login dashboard:** password `AirBibby2026!`
5. **Prossimi step suggeriti:**
   - Configurare Stripe test keys per attivare prenotazioni dirette
   - MongoDB Atlas cluster gratuito (M0) per persistenza reale
   - Beds24 application come connectivity partner
   - Domain custom (air-bibby.com o airbibby.com)
   - Email SMTP per notifiche booking
