# Hosting Lake Como — Beds24 Integration + Public Holidays Design

**Data:** 2026-04-14
**Autore:** Andrei Crapotca
**Stato:** Design approvato, pronto per implementation plan

## Contesto

Hosting Lake Como e' una piattaforma di property management per affitti brevi sul Lago di Como.
Portfolio iniziale: 1-10 proprieta'. L'attuale dashboard usa dati mock.

**Problema:** Le API dirette delle OTA (Airbnb, Booking.com, Vrbo) sono programmi
partner chiusi — non accessibili a singoli operatori. Serve un layer intermedio che
gestisca la connettivita' multi-canale mentre Hosting Lake Como mantiene il controllo della
logica di business, del reporting e dell'interfaccia utente.

**Soluzione scelta:** Usare **Beds24** come channel manager (API V2 RESTful aperta,
connectivity partner certificato con tutte le OTA principali) e costruire su Hosting Lake Como
tutto il layer di business intelligence, compliance italiana, e UX personalizzata.

**Integrazione aggiuntiva:** AbstractAPI Public Holidays per arricchire il calendario
con festivita' italiane ed estere (utile per pricing dinamico e previsione domanda
per nazionalita' degli ospiti).

## Obiettivi

1. Dashboard proprietario con **dati reali** provenienti da Beds24 (prenotazioni,
   calendario, messaggi) al posto degli attuali mock.
2. **Reporting automatico**: revenue, occupancy, ADR, RevPAR, payout mensile,
   performance per canale.
3. **Compliance italiana automatizzata**: export per Alloggiati Web, report ISTAT,
   calcolo tassa di soggiorno.
4. **Calendario unificato** con festivita' italiane ed estere evidenziate.
5. **Guest communication** via inbox unificata (Beds24 messages API).

## Architettura

### Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Database:** MongoDB Atlas (schemas gia' definiti in `src/types/database.ts`)
- **Auth:** NextAuth.js v5 con CredentialsProvider (gia' esistente)
- **API Client:** Native `fetch` con wrapper tipizzato per Beds24
- **Cache:** MongoDB per holidays (refresh annuale), memoria per token Beds24
- **Charts:** Recharts per analytics (o AntV/G2 se preferito)
- **Deploy:** Vercel (gia' configurato)

### Diagramma

```
[Proprietario]
      ↓
[Hosting Lake Como Dashboard]
      ↓
[Next.js API Routes]
  ├── /api/beds24/*  → Beds24Client → Beds24 V2 API → OTA
  ├── /api/holidays/* → HolidaysClient → AbstractAPI → MongoDB cache
  └── /api/reports/*  → ReportGenerator → MongoDB aggregations
      ↓
[MongoDB Atlas]
  ├── properties (cache locale + metadata Hosting Lake Como)
  ├── bookings (sincronizzate da Beds24)
  ├── holidays (cache annuale per Paese)
  └── compliance_records (log invii Questura/ISTAT)
```

## Componenti

### 1. Beds24Client (`src/lib/beds24/client.ts`)

Wrapper tipizzato per Beds24 API V2. Singola classe con metodi per ogni endpoint
usato.

**Responsabilita':**
- Gestione token (long-life read token + refresh token per scritture)
- Auto-refresh token alla scadenza
- Retry su errori 5xx con exponential backoff
- Rate limiting (max 5 req/sec per rispettare limiti Beds24)
- Tipizzazione completa delle risposte

**Metodi principali:**
```ts
class Beds24Client {
  // Bookings
  getBookings(filters?: BookingFilters): Promise<Beds24Booking[]>
  getBookingById(id: string): Promise<Beds24Booking>
  updateBooking(id: string, data: Partial<Beds24Booking>): Promise<void>

  // Calendar & availability
  getCalendar(propertyId: string, from: Date, to: Date): Promise<CalendarDay[]>
  updateCalendar(propertyId: string, updates: CalendarUpdate[]): Promise<void>
  checkAvailability(propertyId: string, from: Date, to: Date): Promise<boolean>

  // Messages
  getMessages(bookingId: string): Promise<Beds24Message[]>
  sendMessage(bookingId: string, text: string): Promise<void>

  // Properties
  getProperties(): Promise<Beds24Property[]>
  getPropertyById(id: string): Promise<Beds24Property>
}
```

**Env variables necessarie:**
- `BEDS24_API_URL` = `https://api.beds24.com/v2`
- `BEDS24_REFRESH_TOKEN` (generato dal proprietario dell'account Beds24)
- `BEDS24_LONG_LIFE_TOKEN` (read-only, per query frequenti)

### 2. HolidaysClient (`src/lib/holidays/client.ts`)

Wrapper per AbstractAPI Public Holidays. Strategy: fetch annuale per Paese +
cache in MongoDB (TTL 365 giorni).

**Metodi:**
```ts
class HolidaysClient {
  getHolidays(country: string, year: number): Promise<Holiday[]>
  getUpcomingHolidays(country: string, days: number): Promise<Holiday[]>
  isHoliday(date: Date, country: string): Promise<boolean>
}
```

**Paesi target (MVP):**
- `IT` — sempre, per proprieta' e pricing
- `DE`, `FR`, `UK`, `US`, `NL`, `CH` — top mercati sorgente per Lago di Como

**Env variables:**
- `ABSTRACTAPI_HOLIDAYS_KEY`

### 3. SyncEngine (`src/lib/sync/engine.ts`)

Orchestratore della sincronizzazione. Due modalita':

**A) Webhook-driven (preferred):**
Beds24 chiama `/api/beds24/webhook` quando cambia qualcosa. Verifica signature,
aggiorna MongoDB, emette notifiche.

**B) Polling fallback:**
Cron job Vercel (ogni 15 minuti) che chiama `getBookings({ modified: lastSync })`.

**Eventi gestiti:**
- `booking.created` → insert in MongoDB, invia email notifica
- `booking.modified` → update MongoDB
- `booking.cancelled` → soft delete, trigger refund logic
- `message.received` → update inbox, notifica proprietario

### 4. ReportGenerator (`src/lib/reports/generator.ts`)

Aggregazioni MongoDB per dashboard analytics.

**Report supportati:**
- Revenue per proprieta' / mese / canale
- Occupancy rate (notti occupate / notti disponibili)
- ADR (Average Daily Rate) = revenue totale / notti vendute
- RevPAR = revenue totale / notti disponibili
- Performance per fonte (Airbnb vs Booking vs Direct)
- Payout proprietario mensile (revenue - commissioni - spese)
- Gap analysis (notti vuote recuperabili)

Output: JSON strutturato per grafici + PDF generator per rendiconti ufficiali.

### 5. ComplianceEngine (`src/lib/compliance/engine.ts`)

Automazione obblighi fiscali/amministrativi italiani.

**Moduli:**

#### Alloggiati Web (Questura)
- Estrae dati ospite da ogni `booking` con status `checked_in`
- Formatta nel formato richiesto dalla Polizia di Stato (fixed-width text)
- Export CSV/TXT scaricabile (upload manuale al portale Alloggiati Web)
- Futuro: auto-submit via API non documentata (rischioso, per ora manuale)

#### ISTAT
- Report mensile per ogni Comune (Como, Cernobbio, Bellagio, etc.)
- Campi: arrivi, presenze, nazionalita', motivo viaggio
- Export nel formato richiesto dalla Regione Lombardia
- Alert automatico il 1° del mese

#### Tassa di soggiorno
- Calcolo per prenotazione (tariffa comunale × notti × ospiti, max 5 notti)
- Report trimestrale per versamento al Comune
- Scheda riepilogativa per ogni proprieta'

### 6. Dashboard UI Updates

**Nuove pagine / aggiornamenti:**

- `/dashboard` — Overview aggiornata con dati reali da Beds24
- `/dashboard/calendar` — **NUOVA** — Calendario mensile unificato multi-proprieta',
  con festivita' IT/EU evidenziate come badge colorati
- `/dashboard/bookings/[id]` — **NUOVA** — Detail view con messaggi, guest info,
  azioni rapide
- `/dashboard/compliance` — **NUOVA** — Centro compliance (Questura, ISTAT,
  tassa soggiorno) con export button

## Data Model

### Nuove collezioni MongoDB

#### `holidays`
```ts
{
  _id: ObjectId,
  country: "IT" | "DE" | "FR" | ...,
  year: number,
  date: Date,
  name: string,
  nameLocal: string,
  type: "national" | "regional" | "religious" | "observance",
  cachedAt: Date
}
// Index: { country: 1, year: 1, date: 1 }
```

#### `beds24_sync_log`
```ts
{
  _id: ObjectId,
  event: "webhook" | "polling",
  type: "booking.created" | "booking.modified" | ...,
  beds24Id: string,
  localId?: ObjectId,
  status: "success" | "failed",
  payload: object,
  error?: string,
  timestamp: Date
}
// Index: { timestamp: -1 }, TTL 90 giorni
```

#### `compliance_records`
```ts
{
  _id: ObjectId,
  type: "alloggiati_web" | "istat" | "tassa_soggiorno",
  propertyId: ObjectId,
  period: { from: Date, to: Date },
  generatedAt: Date,
  status: "draft" | "submitted" | "confirmed",
  exportFormat: "csv" | "txt" | "pdf",
  fileUrl?: string,
  bookingIds: ObjectId[]
}
```

### Modifiche collezioni esistenti

#### `bookings` (aggiunta campi)
```ts
{
  // ... campi esistenti ...
  beds24Id?: string,           // ID nel sistema Beds24
  beds24LastSync?: Date,
  compliance: {
    alloggiatiWebSubmitted: boolean,
    alloggiatiWebDate?: Date,
    istatIncluded: boolean,
    touristTaxPaid: boolean
  }
}
```

#### `properties` (aggiunta campi)
```ts
{
  // ... campi esistenti ...
  beds24PropertyId?: string,
  beds24RoomId?: string,
  cinCode?: string,             // Codice CIN nazionale
  touristTaxRate?: number,      // Tariffa comunale per persona/notte
  maxTouristTaxNights?: number  // Default 5
}
```

## Flussi Chiave

### Flusso 1 — Nuova prenotazione arriva da Airbnb

```
1. Ospite prenota su Airbnb
2. Airbnb → Beds24 (via connectivity)
3. Beds24 → webhook POST /api/beds24/webhook (Hosting Lake Como)
4. Hosting Lake Como valida signature
5. SyncEngine.handleBookingCreated()
   ├── Lookup property via beds24PropertyId
   ├── Insert in bookings collection
   ├── Calcola commissioni e payout
   └── Emit event: notifica proprietario (email)
6. Dashboard si aggiorna in tempo reale (React Query invalidation)
```

### Flusso 2 — Report payout mensile

```
1. Cron (1° del mese, 9:00) → /api/reports/monthly-payout
2. ReportGenerator per ogni proprieta':
   ├── Aggrega bookings del mese precedente
   ├── Calcola revenue lordo
   ├── Sottrae commissioni OTA
   ├── Sottrae commissione Hosting Lake Como (% da contratto)
   ├── Sottrae spese (pulizia, biancheria, manutenzione)
   └── Genera PDF rendiconto
3. Invia email al proprietario con PDF allegato
4. Salva record in compliance_records
```

### Flusso 3 — Export Alloggiati Web

```
1. Proprietario va su /dashboard/compliance
2. Seleziona periodo (default: ultimi 7 giorni)
3. Click "Genera export Questura"
4. ComplianceEngine.generateAlloggiatiWebExport(dateRange)
   ├── Query bookings con status checked_in nel periodo
   ├── Per ogni booking, estrae guest data
   ├── Formatta in formato fixed-width text (spec Polizia)
   └── Ritorna TXT file
5. Download automatico del file
6. Proprietario carica su portale Alloggiati Web manualmente
7. Click "Marca come inviato" → update compliance_records
```

### Flusso 4 — Calendario con festivita'

```
1. Proprietario apre /dashboard/calendar
2. Fetch bookings del mese corrente
3. Fetch holidays da MongoDB (IT + top-5 nazionalita' degli ospiti del mese)
4. Rendering:
   ├── Griglia mensile
   ├── Per ogni giorno con booking: card colorata per fonte
   ├── Per ogni giorno festivo IT: badge rosso in alto
   ├── Per ogni giorno festivo estero con ospite nazionalita' match: badge colorato
   └── Hover tooltip: dettagli prenotazione / nome festivita'
5. Alert banner se prossima festivita' importante (Ferragosto, Natale, Pasqua)
```

## Error Handling

- **Beds24 API down:** fallback a cache MongoDB, mostra banner "Sync temporaneamente
  non disponibile"
- **Token scaduto:** auto-refresh via refresh token, retry originale
- **Webhook duplicato:** idempotency check tramite `beds24_sync_log`
- **Rate limit superato:** queue in-memory con delay, log warning
- **AbstractAPI quota superata:** usa cache MongoDB anche se piu' vecchia di 1 anno,
  log warning
- **Webhook signature invalida:** 401, log security event

## Security

- **Webhook verification:** Beds24 invia HMAC-SHA256 signature header, verifichiamo
  con secret condiviso prima di processare
- **API tokens:** MAI nel client, sempre server-side in env variables Vercel
- **Guest data (GDPR):** documenti identita' cifrati at rest in MongoDB
  (field-level encryption per campi sensibili)
- **Rate limiting:** su API pubbliche (`/api/beds24/webhook`) per prevenire abuse
- **Audit log:** ogni export compliance salvato in `compliance_records`

## Testing

- **Unit tests:** ogni metodo di Beds24Client, HolidaysClient, ReportGenerator
- **Integration tests:** SyncEngine con webhook mock, end-to-end flussi principali
- **Manual QA:** checklist per ogni sprint (vedi roadmap)
- **Staging env:** branch `staging` → Vercel preview → account Beds24 sandbox

## File da Modificare / Creare

### Nuovi file

- `src/lib/beds24/client.ts` — Beds24 API client
- `src/lib/beds24/types.ts` — TypeScript types per Beds24 API
- `src/lib/beds24/webhook.ts` — Webhook handler helper
- `src/lib/holidays/client.ts` — AbstractAPI wrapper
- `src/lib/holidays/types.ts`
- `src/lib/sync/engine.ts` — Sync orchestrator
- `src/lib/reports/generator.ts` — Report aggregations
- `src/lib/reports/pdf.ts` — PDF generation (usando `@react-pdf/renderer`)
- `src/lib/compliance/alloggiati.ts` — Export Questura
- `src/lib/compliance/istat.ts` — Export ISTAT
- `src/lib/compliance/tassa-soggiorno.ts` — Calcolo tassa
- `src/app/api/beds24/webhook/route.ts` — Endpoint webhook
- `src/app/api/beds24/sync/route.ts` — Manual sync trigger
- `src/app/api/holidays/route.ts` — Holidays endpoint
- `src/app/api/reports/[type]/route.ts` — Report generator endpoint
- `src/app/api/compliance/[type]/route.ts` — Compliance export endpoint
- `src/app/(dashboard)/dashboard/calendar/page.tsx` — Calendar view
- `src/app/(dashboard)/dashboard/bookings/[id]/page.tsx` — Booking detail
- `src/app/(dashboard)/dashboard/compliance/page.tsx` — Compliance center
- `src/components/calendar/month-grid.tsx` — Calendar UI component
- `src/components/calendar/holiday-badge.tsx`

### File da modificare

- `src/types/database.ts` — aggiungi campi compliance, beds24Id
- `src/lib/mongodb/collections.ts` — aggiungi holidays, sync_log, compliance_records
- `src/app/(dashboard)/dashboard/page.tsx` — dati reali invece di mock
- `src/app/(dashboard)/dashboard/bookings/page.tsx` — dati reali
- `src/app/(dashboard)/dashboard/analytics/page.tsx` — dati reali
- `src/app/(dashboard)/dashboard/statements/page.tsx` — dati reali + PDF export
- `src/components/layout/sidebar.tsx` — aggiungi link Calendar, Compliance
- `.env.local` + Vercel env — aggiungi BEDS24_*, ABSTRACTAPI_HOLIDAYS_KEY

## Roadmap di Implementazione

**Sprint 1 — Foundations (1-2 giorni)**
- Aggiornare schemas MongoDB (aggiungere campi compliance, beds24Id)
- Creare Beds24Client con auth e 3 metodi base (getBookings, getCalendar, getMessages)
- Creare HolidaysClient con cache MongoDB
- Aggiungere env variables su Vercel

**Sprint 2 — Holidays + Calendar (1-2 giorni)**
- Endpoint `/api/holidays` con seed initial IT + 5 paesi
- Pagina `/dashboard/calendar` con griglia mensile
- Integrazione festivita' come badge sul calendario

**Sprint 3 — Sync Engine (2-3 giorni)**
- Webhook receiver con signature verification
- SyncEngine per booking.created/modified/cancelled
- Polling fallback con Vercel cron
- Log sync events

**Sprint 4 — Real Data Dashboard (1-2 giorni)**
- Sostituire mock data con query MongoDB in tutte le pagine dashboard
- React Query per real-time updates
- Loading states e error handling

**Sprint 5 — Reporting (2-3 giorni)**
- ReportGenerator per revenue, occupancy, ADR, RevPAR
- PDF generation per rendiconti
- Email automatica payout mensile

**Sprint 6 — Compliance (2-3 giorni)**
- Export Alloggiati Web (formato fixed-width)
- Export ISTAT
- Calcolo tassa di soggiorno
- Pagina `/dashboard/compliance`

**Sprint 7 — Messages & Polish (1-2 giorni)**
- Inbox unificata via Beds24 messages API
- Booking detail page con thread messaggi
- Template risposte automatiche

**Sprint 8 — Stripe Checkout (2-3 giorni)**
- StripeClient con Checkout API
- Pagina booking publica `/properties/[slug]/book`
- Webhook `/api/stripe/webhook` per conferme pagamento
- Test mode end-to-end con carta test

**Sprint 9 — Stripe Connect (2-3 giorni)**
- Onboarding Connect per proprietari
- Dashboard KYC status
- Transfer automatici al payout mensile
- Pagina `/dashboard/payments` con storico

**Totale stimato:** 14-23 giorni di lavoro (sprint 1-9)

## Verification

Dopo ogni sprint, verificare:

1. **Sprint 1:** `npm run dev` parte, MongoDB collections nuove sono create, env
   vars caricate. Test manuale: chiamare `Beds24Client.getBookings()` dalla console.
2. **Sprint 2:** Navigare a `/dashboard/calendar`, verificare che festivita' IT
   appaiono sui giorni corretti. Test: il 25 dicembre deve avere badge "Natale".
3. **Sprint 3:** Creare booking test su Beds24 sandbox, verificare che arriva webhook
   e che booking appare in MongoDB entro 5 secondi.
4. **Sprint 4:** Dashboard overview mostra numeri reali (anche se iniziali sono
   piccoli).
5. **Sprint 5:** Click "Scarica rendiconto" produce PDF con dati corretti.
   Verificare totali manualmente con calcolatrice.
6. **Sprint 6:** Export Alloggiati Web produce file TXT caricabile sul portale
   Polizia (test con file sample).
7. **Sprint 7:** Messaggio inviato dalla dashboard appare su Beds24 e di conseguenza
   all'ospite sulla piattaforma originale.

## Rischi e Mitigazioni

| Rischio | Probabilita' | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Beds24 API cambia breaking | Bassa | Alto | Versioning esplicito in Beds24Client, test di integrazione |
| AbstractAPI rate limit | Media | Basso | Cache MongoDB aggressiva (1 anno), fallback a cache scaduta |
| Webhook perso/duplicato | Media | Medio | Idempotency via beds24_sync_log, polling fallback |
| Formato Alloggiati Web cambia | Bassa | Alto | Spec documentata, export manuale come fallback |
| Volume dati eccessivo | Bassa | Medio | Indici MongoDB, paginazione, TTL su sync_log |

## Stripe Integration (aggiunta allo scope)

### Use Cases per Hosting Lake Como

1. **Prenotazioni dirette** — Ospiti che prenotano via sito Hosting Lake Como (non via OTA)
   pagano tramite Stripe Checkout. Questo evita le commissioni OTA (15-20%) e aumenta
   margine per proprietario.

2. **Payout ai proprietari** — Via Stripe Connect (Express accounts): Hosting Lake Como
   trattiene la commissione (es. 20%) e versa il netto al proprietario mensilmente
   o per booking. Gestione automatica dei KYC e tax documents.

3. **Caparra di sicurezza** — Pre-autorizzazione carta per security deposit, release
   dopo check-out senza addebito (o addebito parziale per danni).

4. **Servizi aggiuntivi ospiti** — Upsell durante il soggiorno (transfer aeroporto,
   noleggio barca, tour guidati): one-time payment link generato dall'app.

### Componenti Stripe

#### StripeClient (`src/lib/stripe/client.ts`)
```ts
class StripeClient {
  // Checkout
  createBookingCheckout(booking: Booking): Promise<CheckoutSession>
  createServiceCheckout(service: GuestService, guestEmail: string): Promise<CheckoutSession>

  // Connect (owner payouts)
  createConnectedAccount(owner: Owner): Promise<ConnectedAccount>
  getAccountOnboardingLink(accountId: string): Promise<string>
  createTransfer(accountId: string, amount: number, bookingId: string): Promise<Transfer>

  // Deposits
  createSecurityDepositHold(amount: number, paymentMethodId: string): Promise<PaymentIntent>
  captureDeposit(paymentIntentId: string, amount: number): Promise<void>
  releaseDeposit(paymentIntentId: string): Promise<void>
}
```

#### Webhook handler (`src/app/api/stripe/webhook/route.ts`)
Eventi gestiti:
- `checkout.session.completed` → conferma booking, trigger sync Beds24
- `payment_intent.succeeded` → update booking payment status
- `charge.refunded` → update booking, notifica proprietario
- `account.updated` → update KYC status owner
- `transfer.created` → log payout in `payouts` collection

### Nuove collezioni MongoDB

#### `payments`
```ts
{
  _id: ObjectId,
  type: "booking" | "deposit" | "service" | "refund",
  bookingId?: ObjectId,
  stripePaymentIntentId: string,
  stripeSessionId?: string,
  amount: number,
  currency: "EUR",
  status: "pending" | "succeeded" | "failed" | "refunded",
  createdAt: Date
}
```

#### `payouts`
```ts
{
  _id: ObjectId,
  ownerId: ObjectId,
  period: { from: Date, to: Date },
  grossRevenue: number,
  airbibbyCommission: number,
  expenses: number,
  netPayout: number,
  stripeTransferId?: string,
  status: "calculated" | "scheduled" | "paid" | "failed",
  bookingIds: ObjectId[]
}
```

#### `users` (extension)
```ts
{
  // ... esistenti ...
  stripeCustomerId?: string,        // per ospiti
  stripeConnectedAccountId?: string, // per proprietari
  kycStatus?: "pending" | "verified" | "restricted"
}
```

### UI Additions

- **Public site** — Checkout flow per prenotazioni dirette su `/properties/[slug]/book`
- **Dashboard** — `/dashboard/payments` nuova pagina con storico pagamenti e payouts
- **Onboarding proprietario** — Flow di connessione Stripe Connect durante il setup

### Env variables aggiuntive

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_CONNECT_CLIENT_ID`

## Strategia senza Keys Esterne (fase iniziale)

Poiche' Beds24 e AbstractAPI keys non sono ancora disponibili, implementiamo:

### Fase 0 — Mock Mode (development)

**Beds24Client:**
- Flag `USE_BEDS24_MOCK=true` in `.env.local`
- Se attivo, ritorna dati fixture realistici (20 prenotazioni di esempio,
  calendario 90 giorni, messaggi di prova)
- Interfaccia identica — quando arriva il token vero basta rimuovere il flag

**HolidaysClient:**
- Embed statico delle festivita' italiane 2026 hardcoded in codice
  (sono deterministic quindi conosciute)
- Per altri Paesi: fixture JSON con i dati principali (Natale, Capodanno,
  festivita' nazionali piu' note per DE/FR/UK/US)
- Quando arriva AbstractAPI key, sostituiamo il loader con fetch vero

**StripeClient:**
- Stripe ha **keys di test free** — possiamo creare un account test subito
  su dashboard.stripe.com e iniziare con quelle
- Test mode supporta tutti i flussi (checkout, Connect, webhooks) senza
  spese, con numeri carta fake (`4242 4242 4242 4242`)
- Quando si va live, switch a keys production

### Vantaggi di questo approccio

- Tutta la logica di business, UI, reporting e compliance e' implementata e
  testabile senza dipendere da credenziali esterne
- Il giorno che arrivano le keys Beds24, tempo di integrazione ~30 min
  (solo sostituzione client mock con client reale)
- Stripe e' pronto da subito in test mode per iterare sul checkout

## Out of Scope (per ora)

- Dynamic pricing automatico (solo suggerimenti, decisione manuale)
- Multi-tenant (ora un solo proprietario Admin, in futuro multi-owner)
- Mobile app nativa (responsive web e' sufficiente)
- AI guest messaging (solo template manuali per ora)
- API pubblica Hosting Lake Como per terze parti
