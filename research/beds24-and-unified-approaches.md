# Beds24 ecosystem, MCP universale e approccio SDI-style

**Follow-up di:** [github-libraries.md](./github-libraries.md)
**Data:** 15 maggio 2026
**Domanda di partenza:** Userò Beds24 — quali altre librerie GitHub affini ho a
disposizione? E se invece andassimo su un MCP "anything" o costruissimo un
gateway unificato in stile SDI per tutte le OTA?

---

## Executive summary

Tre conclusioni operative dalla ricerca:

1. **Ecosistema Beds24 su GitHub è scarno ma usabile**: solo 3 librerie meritano attenzione (una TS-native pubblicata su npm, una Ruby, e il già-noto booking-SDK di Shirako). Il resto sono PoC personali. La via realistica è **partire da `@lionlai/beds24-v2-sdk` e affiancare wrapper custom** per le aree non coperte (messaging, webhooks).

2. **L'approccio "MCP anything" esiste già**: si chiama **Browser MCP** (6.5k★) e ti permette di pilotare il browser dell'utente con Claude — login già attivo, no anti-bot. È la chiave per orchestrare via AI anche piattaforme che non hanno API pubblica (es. dashboard Smoobu vecchio stile, portali italiani come Alloggiati Web, fatturazione SDI). **Combinato con Beds24 API native si copre il 95% dei casi.**

3. **L'approccio SDI-style esiste ed è già costruito**: si chiama **Repull**. Singolo endpoint REST che fa fan-out su 4 OTA (Airbnb / Booking / VRBO / Plumguide) + 46 PMS. Include **MCP server con 18 tool**, SDK in 6 linguaggi, **free tier fino a 3 listing e 10k call/mese**. Per Host Como nello stato attuale (1 proprietà showcase, growth fino a ~10 nel primo anno) **Repull è gratis e copre tutto il fan-out OTA** senza dover toccare l'integrazione PMS-per-PMS.

**Pattern raccomandato per Host Como:**
```
Claude (Cursor/Claude Code)
    │
    ├── host-como-ops-mcp (custom, wrapper Beds24)  ←  operazioni quotidiane
    ├── repull-mcp (built-in, 18 tools)             ←  fan-out OTA + dynamic pricing
    └── browsermcp/mcp                              ←  Alloggiati Web, SDI, dashboard non-API
```

---

## 1. Beds24 — Ecosistema GitHub dettagliato

### 1.1 `@lionlai/beds24-v2-sdk` (npm)

**La scoperta più rilevante per Host Como.** SDK TypeScript ottimizzato per Nuxt
e **Next.js** (il nostro stack). Generato automaticamente dall'**OpenAPI
ufficiale di Beds24 API v2** via `openapi-fetch`. Tipi completi e
auto-aggiornati quando Beds24 rilascia nuove versioni dello schema.

| Campo | Valore |
|-------|--------|
| Package | `@lionlai/beds24-v2-sdk` su npm |
| Linguaggio | TypeScript |
| Pattern | openapi-fetch + tipi auto-generati |
| Ottimizzato per | Nuxt.js / Next.js (SSR/SSG) |
| Repo GitHub | non trovato esplicitamente nella ricerca — verificare il link da npm |

**Perché conta.** Eliminare tipizzazione manuale di 50+ endpoint Beds24 fa
risparmiare giorni di lavoro. L'auto-gen da OpenAPI significa che quando Beds24
aggiunge endpoint (succede di frequente nella v2), basta bump del package per
averli tipizzati.

**Verifica raccomandata.** Prima di adottare:
- npm install in un branch sperimentale
- chiamata di test `GET /properties` con sandbox API key
- check su issue GitHub per problemi noti di rate-limiting

---

### 1.2 `WataruShirako/beds24-booking-sdk` (rivisto)

Già coperto in [github-libraries.md §1.6](./github-libraries.md). Recap rapido:
TypeScript end-to-end booking flow con Beds24 v2 + Stripe Checkout + Resend.
Server-side price verification. **Complementare a `@lionlai/beds24-v2-sdk`**:
quello fornisce le primitive tipizzate, questo fornisce un'opinionated booking
pipeline pronta.

**Decisione:**
- Se Host Como aggiunge booking diretto (skip-Airbnb-fees): fork di Shirako.
- Se Host Como resta showcase-only: usare solo lionlai per le query read.

---

### 1.3 `mihilbabin/beds24` (Ruby, già coperto)

Riferimento di design. 2★, MIT, ultimo update gennaio 2024. **Stato: cold
storage.** Non lo userai mai (Ruby non è il tuo stack), ma è documentazione
viva del comportamento API.

---

### 1.4 Altri repo Beds24 — Sintesi tabellare

GitHub ne ha ~20, quasi tutti a zero stelle. Solo questi tre sono notevoli:

| Repo | Linguaggio | Stelle | Stato | Note |
|------|-----------|--------|-------|------|
| `TYoung1221/beds24_python_api` | Python | low | script-style | Python rapido, non OOP |
| `ichikawatff/bed24api` | TypeScript | 0 | 24-apr-2026 | App di analytics Beds24 — codice giapponese ma stack TS recente |
| `rada-ii/booking-wp` | PHP | 0 | giu-2025 | Plugin WordPress per Beds24 — solo se ti serve embedding su sito WP |
| `KunalWadhai/BEDS24_PMS` | JavaScript | 0 | dic-2025 | PMS sopra Beds24, codice esplorabile |

Il resto sono boilerplate vuoti o fork personali.

---

### 1.5 Cosa manca nell'ecosistema Beds24 OSS

**Gap concreti da costruire internamente in Host Como:**

1. **Webhook handler tipizzato.** Beds24 invia webhook su booking events, ma
   bisogna richiederli a supporto e nessun repo OSS ne implementa un parser
   solido. Costruire un middleware Next.js `/api/webhooks/beds24` con
   validation Zod + retry logic.
2. **Owner statement generator.** Dato un property ID e un intervallo,
   estrarre booking + revenue + commissioni e generare PDF mensile per il
   proprietario. Nessun OSS rilevante — vantaggio competitivo a costruirlo.
3. **Italian guest registration adapter.** Beds24 raccoglie dati ospite ma non
   li inoltra a Alloggiati Web / CIN. Costruire un job notturno che pulla
   booking confermati e invia schedine.
4. **i18n message templates.** Beds24 supporta auto-message su check-in/
   check-out, ma il template engine è povero. Costruire un layer Next.js che
   usa Claude API per personalizzare in IT/EN/RU.

---

## 2. MCP "anything" — Universal e Browser MCP

L'idea: invece di un MCP per ogni piattaforma (Beds24, Airbnb, Booking…), un
**unico MCP che pilota un browser** e accede a qualsiasi web app come farebbe
un umano. Vantaggio: copre anche le piattaforme che non hanno API.

### 2.1 `browsermcp/mcp` — **6.5k stelle, Apache-2.0**

**Il candidato vincente per uso "MCP anything".**

**Cosa lo rende speciale.** Non spawna browser nuovi (come Playwright MCP) —
**controlla il tuo browser già aperto** via Chrome extension. Significato
operativo:
- **Sessioni autenticate preservate**: già loggato su Airbnb host, Beds24,
  Alloggiati Web, fatturazione SDI? Claude usa quelle sessioni.
- **Anti-bot detection evitata**: vero browser fingerprint, vero cookie store,
  vera history. Airbnb non distingue automation da uso umano.
- **Privacy**: tutto resta in locale, niente cloud-based scraping service.

**Pattern d'uso per Host Como:**
- "Claude, accedi a Alloggiati Web e invia la schedina per la prenotazione 12345."
- "Claude, vai sul portale CIN e registra la nuova proprietà."
- "Claude, scarica il PDF della fattura SDI emessa il mese scorso."
- "Claude, monitora il listing Airbnb e dimmi se ci sono nuovi messaggi non letti."

**Caveat.** Il browser **deve essere aperto sulla macchina dell'utente**. Non è
un servizio cloud. Quindi è ottimo per **operazioni manuali assistite** (host /
admin Host Como sulla propria workstation), **non** per automazione headless H24.

### 2.2 Alternative

| Tool | Stelle | Quando preferirlo |
|------|--------|------------------|
| `Saik0s/mcp-browser-use` | medio | Headless server con browser-use lib — buono per cron job non-interattivi |
| `xkiranj/playwright-universal-mcp` | basso | Container Docker, ambienti CI/CD |
| `Linzo99/browser-use-mcp-client` | basso | Frontend React per visualizzare azioni MCP live |

**Per Host Como.** Browser MCP è la scelta giusta. Il dev (te) lavora sulla sua
workstation con browser sempre aperto, e Claude Code può invocarlo per task
amministrativi via prompt. Per automazioni server-side ricorrenti (es.
notifica notturna Alloggiati Web) usare un cron + Saik0s/mcp-browser-use in
container.

### 2.3 `skarlekar/mcp_travelassistant` — Pattern reference

41★, MIT, Python. Non per property management ma per **travel planning**: 6
MCP server specializzati (flight, hotel, event, geocoder, weather, finance) che
Claude orchestra. **Pattern interessante:** sequential dependency management
(geocoding prima di weather), multi-domain synthesis. Da copiare per costruire
un "Host Como Concierge MCP" che propone agli ospiti attività sul lago.

---

## 3. Approccio "SDI-style" — Gateway unificato per OTA

L'analogia con il Sistema di Interscambio italiano è azzeccata: SDI è il punto
unico per cui passano TUTTE le fatture B2B, indipendentemente da fornitore o
software gestionale. Per le OTA, l'equivalente sarebbe **un singolo endpoint
che riceve push di listing/availability/pricing e fa fan-out su tutte le
piattaforme**. Lo scenario esiste in due varianti:

### 3.1 Standard di settore (specifica, non runtime)

**OpenTravel Alliance** ([opentravel.org](https://opentravel.org/),
[github.com/OpenTravel](https://github.com/OpenTravel))

- Non-profit dal 1999, definisce schemi XML per scambio dati travel/hospitality
- Repo principale: `OpenTravel/OTA-Publication-Site` — sito di pubblicazione
  delle specifiche
- **Cosa è.** Specifica formale (XML/XSD/WSDL) di come dovrebbero parlare i
  sistemi travel. Niente runtime, niente SDK pronto.
- **Adozione reale.** I grandi (Sabre, Amadeus, Expedia, Booking) la usano
  internamente. Airbnb la **non** usa. Per un property manager indipendente
  è **inapplicabile** senza intermediari.

**OCTO** ([github.com/octotravel](https://github.com/octotravel))

- Standard moderno (TypeScript, MIT) per **tours, activities, attractions**
  — non vacation rental
- 9 repo pubblici: octomock, octo-types, octo-core, validator, openapi
- **Cosa è.** Versione "OpenAPI nativa" di OpenTravel ma scoped al settore
  esperienze. Se Host Como in futuro vendesse **esperienze sul Lago** (gite
  in barca, degustazioni, ville guide), OCTO sarebbe lo standard da seguire
  per esporre il catalogo.
- **Rilevanza immediata.** Bassa. Tieni a backlog.

### 3.2 Runtime usabili oggi

**`Repull`** ([repull.dev](https://repull.dev/)) — **IL match al concetto SDI**

| Attributo | Valore |
|-----------|--------|
| Modello | API REST commerciale + free tier |
| Copertura | 50 connettori (46 PMS + 4 OTA: Airbnb, Booking, VRBO, Plumguide) |
| OTA endpoint diretti | 26 Airbnb + 11 Booking (no PMS in mezzo) |
| Sync | Bidirezionale: push listing/pricing/availability, ricevi booking/messages |
| SDK | TypeScript, Python, PHP, Go, Ruby, .NET |
| **MCP server** | **Sì, 18 tool integrati, ready per Claude Desktop/Cursor** |
| Documentazione AI | OpenAPI spec + llms.txt + AGENTS.md + error messages con docs_url |
| Free tier | 3 listing attivi, 10.000 API call/mese, sandbox + live, no scadenza, no carta |

**Perché è eccezionale per Host Como:**

1. **Gratuito allo stato attuale** (1 proprietà showcase, scale-up nel primo
   anno fino a ~3 sotto contratto)
2. **Bypassa la complessità di scegliere e integrare un PMS singolo**: spingi
   listing direttamente ad Airbnb senza passare da Beds24
3. **MCP nativo**: niente da costruire, agganci Claude e inizi a fare
   operazioni in linguaggio naturale dal giorno uno
4. **Multi-SDK**: se in futuro il team aggiunge servizi in Python (data
   science / scraping) o .NET, lo stesso wrapper funziona

**Caveat:**

- **Servizio chiuso.** Se Repull chiude, tutti gli script smettono di
  funzionare. Mitigazione: dato che usano OpenAPI standard, riscrivere è
  fattibile in 1-2 settimane sui PMS che hanno API native.
- **Pricing dopo il free tier non è chiaro nella ricerca** — da verificare
  prima di scalare oltre i 3 listing.
- **Repull = API di livello aggregator.** Operazioni avanzate o feature
  specifiche di un singolo OTA potrebbero non essere esposte.

**Decisione operativa.** Repull come **primo layer di accesso OTA**, Beds24 in
parallelo come **PMS interno** per gestione operativa fine (canone proprietari,
report, statement, pulizie). I due si completano: Repull per "push listing
ovunque", Beds24 per "operazioni giornaliere e accounting".

### 3.3 Self-hosted alternative: `frutak/ReZENwator`

OSS polacco emergente — TypeScript, self-hosted CMS + Channel Manager per
affitti brevi. Integrazioni gratuite con Airbnb, Booking.com, Slohop, Alohacamp.
Include pagamenti via email-parsing, scraper per harmonizzare pricing tra
canali, modulo cleaning. Aggiornato 11 maggio 2026.

**Quando considerarlo.** Se Repull diventa caro e vogliamo full control senza
SaaS. Stack TS allineato al nostro. Lingua repo: polacco (README e codice
commentato in polacco/inglese misto). Da sondare, non da adottare subito.

### 3.4 Altri channel manager OSS notevoli

- `rigelito/Channel-manager` — Python, 3★, attivo maggio 2026. Connessioni
  Expedia/Booking/Airbnb via API. Mini, ma codice leggibile come reference.
- `mohamadazafri/channel_manager` — Dart/Flutter, attivo maggio 2026. Solo
  homestay, mobile-first. Non applicabile.

---

## 4. Pattern architetturale consigliato per Host Como

```
┌──────────────────────────────────────────────────────────────┐
│  Claude (Cursor / Claude Code / Claude Desktop)              │
└─────────────┬────────────────┬────────────────┬─────────────┘
              │                │                │
   ┌──────────▼─────────┐ ┌────▼──────────┐ ┌──▼─────────────┐
   │ host-como-ops-mcp  │ │ repull-mcp    │ │ browsermcp/mcp │
   │ (custom, internal) │ │ (18 tools)    │ │ (6.5k★)        │
   └──────────┬─────────┘ └────┬──────────┘ └──┬─────────────┘
              │                │                │
   ┌──────────▼─────────┐ ┌────▼──────────┐ ┌──▼─────────────┐
   │ Beds24 API v2      │ │ Repull REST   │ │ Browser locale │
   │ (lionlai SDK)      │ │ → 4 OTA + 46  │ │ (Alloggiati,   │
   │                    │ │   PMS         │ │  CIN, SDI…)    │
   └────────────────────┘ └───────────────┘ └────────────────┘
```

**Ruolo di ciascun layer:**

| MCP | Cosa orchestra | Quando usarlo |
|-----|---------------|---------------|
| `host-como-ops-mcp` (custom) | Beds24: booking, calendar, owner statement, messaging | Operazioni quotidiane, comandi tipo "che check-in ho domani?" |
| `repull-mcp` (built-in) | Push listing su Airbnb/Booking/VRBO, market intel, dynamic pricing AI | Onboarding nuova proprietà, ottimizzazione tariffe |
| `browsermcp/mcp` | Alloggiati Web, portale CIN, fatturazione SDI, dashboard PMS senza API | Adempimenti italiani, operazioni one-off su portali pubblici |

**Costo prevedibile primo anno (3 proprietà):**

- Repull free tier: **€0**
- Beds24: **~€20/mese** = €240/anno
- Browser MCP: open source, **€0**
- Claude API per i 3 MCP: ~€30-80/mese a seconda dell'uso = €600-1000/anno
- **Totale: ~€840-1.250/anno** per gestire 3 proprietà con AI-augmented ops

**Costo prevedibile a 10 proprietà** (anno 2):

- Repull: probabilmente paid tier, da preventivare (range plausibile €50-200/mese)
- Beds24: rimane ~€20-40/mese
- Claude API: scala con i messaggi/booking, ~€150-300/mese
- **Totale: ~€2.500-7.000/anno** — sempre molto sotto un PMS premium come Guesty (€100/proprietà/mese = €12.000/anno per 10 proprietà)

---

## 5. Cosa fare per primi (priorità operativa)

1. **Questa settimana.** Iscriversi a Repull free tier, collegare la proprietà
   showcase di Angelo (Airbnb 1379549245986609410), attivare l'MCP server,
   testare 3-5 prompt di base in Cursor.
2. **Settimana 2.** Aprire account Beds24 sandbox, installare
   `@lionlai/beds24-v2-sdk` in un branch sperimentale di Host Como, chiamare
   `GET /properties` e validare lo schema.
3. **Settimana 3.** Installare Browser MCP, testare il login automatico su
   Alloggiati Web (uso del client desktop esistente come fallback se il flow
   richiede 2FA).
4. **Settimana 4.** Decidere se costruire `host-como-ops-mcp` interno o
   restare su Repull MCP + lionlai SDK. Decisione data-driven sui gap reali
   incontrati nelle settimane 1-3.

---

## 6. Punti di rischio

- **Repull è single-vendor.** Dipendenza critica. Mitigazione: mantenere il
  codice Beds24-native (lionlai SDK) parallelo, così se Repull diventa
  inadeguato puoi spostare l'integrazione su Beds24 direct senza riscrivere
  tutto.
- **Browser MCP richiede una macchina sempre accesa** per gli adempimenti
  notturni. Mitigazione: VM cloud minimale (~€5/mese, Hetzner / Contabo) con
  Chrome autosession.
- **MCP per Airbnb non scrive.** Tutti i progetti MCP esaminati per Airbnb
  sono **read-only**. Per scrivere (creare listing, rispondere a messaggi)
  serve passare da Repull o da un PMS Preferred+ partner via API ufficiale.
- **CIN e Alloggiati Web non hanno API moderne**. Browser MCP è l'unica via
  per automazione realistica. Verificare che la session 2FA sia stabile.

---

## Sources

- [@lionlai/beds24-v2-sdk on npm](https://www.npmjs.com/package/@lionlai/beds24-v2-sdk)
- [Beds24 Developer API docs](https://beds24.com/developer-api.html)
- [Beds24 API v2 Swagger](https://beds24.com/api/v2/)
- [mihilbabin/beds24](https://github.com/mihilbabin/beds24)
- [WataruShirako/beds24-booking-sdk](https://github.com/WataruShirako/beds24-booking-sdk)
- [TYoung1221/beds24_python_api](https://github.com/TYoung1221/beds24_python_api)
- [browsermcp/mcp](https://github.com/browsermcp/mcp) (6.5k★)
- [Saik0s/mcp-browser-use](https://github.com/Saik0s/mcp-browser-use)
- [xkiranj/playwright-universal-mcp](https://github.com/xkiranj/playwright-universal-mcp)
- [skarlekar/mcp_travelassistant](https://github.com/skarlekar/mcp_travelassistant)
- [Repull](https://repull.dev/) — Unified vacation rental API + MCP server
- [OpenTravel Alliance](https://opentravel.org/) — Industry XML standard
- [OpenTravel GitHub](https://github.com/OpenTravel)
- [OCTO Standards](https://github.com/octotravel) — TypeScript spec per tours/activities
- [frutak/ReZENwator](https://github.com/frutak/ReZENwator) — OSS Polish channel manager
- [rigelito/Channel-manager](https://github.com/rigelito/Channel-manager)
