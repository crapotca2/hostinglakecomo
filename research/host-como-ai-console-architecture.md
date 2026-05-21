# Host Como — AI Console Architecture

**Follow-up di:** [github-libraries.md](./github-libraries.md), [beds24-and-unified-approaches.md](./beds24-and-unified-approaches.md)
**Data:** 15 maggio 2026
**Obiettivo concreto:** Una console unica (Claude Code) per fare due cose:
(a) operazioni su annunci singoli — create/edit/publish/manage via Beds24;
(b) intelligence di zona da codice — prezzi, occupancy, statistiche Lago di Como.

---

## Pattern ibrido CLI-first + MCP wrapper

Il tuo CLAUDE.md globale prescrive **CLI-First**: dove possibile preferisci CLI
a MCP. Adattiamo: ogni pilastro ha **un'unica business logic** esposta via
**due interfacce**:

```
┌─────────────────────────────────────────────────┐
│  host-como-ops/                                 │
│  ├── src/core/   ← TypeScript library (verità)  │
│  ├── src/cli/    ← CLI binary (Bash, scripting) │
│  └── src/mcp/    ← MCP server (Claude chat)     │
└─────────────────────────────────────────────────┘
```

- **`host-como-ops` CLI** invocabile da Bash: `npx host-como ops create-property --name "..."`. Claude lo lancia via Bash tool, gli script `cron`/`Vercel` pure.
- **`host-como-ops` MCP** carica gli stessi tool come server MCP — usabile con `Claude Code`, Claude Desktop, Cursor. Wrapper sottile sulla stessa logic.

Stessa struttura per `intel` e `italia`. Vantaggi:
- Test rapidi via CLI senza dover ricaricare MCP server
- Logica testabile in isolation con `vitest`
- Risparmio: scrivi la business logic una volta sola

---

## Architettura a 3 pilastri

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE (console unica)              │
└──────┬────────────────────┬───────────────────────┬─────────┘
       │                    │                       │
   ┌───▼────────────┐  ┌────▼──────────────┐  ┌────▼────────────┐
   │ Pilastro 1     │  │ Pilastro 2        │  │ Pilastro 3      │
   │ OPS ANNUNCI    │  │ MARKET INTEL      │  │ COMPLIANCE IT   │
   │                │  │                   │  │                 │
   │ host-como-     │  │ host-como-        │  │ host-como-      │
   │   ops-mcp      │  │   intel-mcp       │  │   italia-mcp    │
   └────┬───────────┘  └────┬──────────────┘  └────┬────────────┘
        │                   │                       │
   ┌────▼───────────┐  ┌────▼──────────────┐  ┌────▼────────────┐
   │ Beds24 API v2  │  │ Repull market int.│  │ Browser MCP     │
   │ (lionlai SDK)  │  │ + ISTAT BDT       │  │ (Alloggiati Web)│
   │ + Stripe (fut.)│  │ + scraper Booking │  │ Invoicetronic   │
   │                │  │ + Postgres locale │  │ MCP (SDI)       │
   └────────────────┘  └───────────────────┘  └─────────────────┘
```

L'utente sta sempre in Claude Code. I tre MCP sono **plugin che caricano tool
contestualmente**. Beds24 resta backbone dei dati ma la UI nativa diventa
secondaria (solo per casi di debug / override visivo).

---

## Pilastro 1 — Operazioni annunci (`host-como-ops-mcp`)

### Cosa deve permettere
Creare, modificare, pubblicare, sospendere un annuncio. Caricare foto.
Aggiornare calendario, prezzi, regole. Leggere booking, rispondere a messaggi.
Generare statement proprietario. **Tutto via prompt, niente UI manuale.**

### Stack
- **Backbone dati:** Beds24 v2 (API REST + webhook)
- **Client TypeScript:** [`@lionlai/beds24-v2-sdk`](https://www.npmjs.com/package/@lionlai/beds24-v2-sdk) (npm, openapi-fetch, tipi auto-generati)
- **MCP framework:** [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) (TypeScript ufficiale)
- **Runtime:** Node 20+, stdio (Claude Code carica locale)
- **Test data:** Beds24 sandbox account

### Tool da esporre (MVP)

| Tool | Endpoint Beds24 | Cosa fa |
|------|----------------|---------|
| `create_property` | POST /properties | Crea immobile da template + dati zona |
| `update_property` | PUT /properties/{id} | Aggiorna campi (descrizione, amenities, rules) |
| `upload_photos` | POST /properties/{id}/photos | Upload bulk da percorso locale o URL |
| `set_rate_plan` | POST /offers | Crea rate plan stagionale |
| `update_calendar` | PUT /calendar | Set prezzo + min-stay + disponibilità per range |
| `connect_channel` | Settings UI / API | Collega canale Airbnb/Booking/VRBO |
| `list_bookings` | GET /bookings | Filtra per property + range |
| `send_guest_message` | POST /messages | Messaggio in-platform a ospite |
| `generate_owner_statement` | composite query | Aggrega revenue + commissioni mese → PDF |

### Decisione: build interno vs Repull MCP

Repull MCP (free tier) espone 18 tool che coprono buona parte di questa lista
ma è **vendor-locked**. Build interno è **2-3 settimane di lavoro** ma ti dà
controllo totale + tipizzazione TS-native + possibilità di estendere su feature
specifiche Lago di Como (es. POI nearby, mappe).

**Raccomandazione:** partire con Repull MCP free tier per validare il pattern
in giornata. Migrare a build interno (`host-como-ops-mcp`) entro 6 settimane,
mantenendo Repull come fallback su funzioni non implementate.

---

## Pilastro 2 — Market Intelligence (`host-como-intel-mcp`)

### Cosa deve permettere
Da prompt o da chiamata di codice, ottenere statistiche e comparable per una
zona del Lago di Como. Use case tipici:

> "Quanto costa in media una villa per 6 persone a Bellagio in alta stagione?"
> "Dammi 10 comparable della mia proprietà 1379549245986609410, raggio 5km, stessa capacità."
> "Trend prezzi luglio-agosto 2023-2025 a Menaggio."
> "Tasso di occupancy medio nei comuni rivieraschi del ramo Como."

### Stack
- **Dati commerciali ready-made:** Repull market intelligence (incluso nel free tier, per-city KPIs, demand curves)
- **Dati pubblici macro:** ISTAT BDT (Banca Dati Turismo) — API REST gratuita per arrivi/presenze/nazionalità per comune
- **Dati pubblici regionali:** [open.regione.lombardia.it](https://open.regione.lombardia.it) — dataset turismo
- **Scraping comparable:** Booking.com (più permissivo di Airbnb) via Playwright headless + rotation IP
- **Storage:** Postgres locale (Docker) o Vercel Postgres — schema `listings_snapshot`, `booking_observed`, `comune_kpi_monthly`
- **Job scheduler:** Trigger.dev o Vercel Cron — snapshot mensile zona Lago

### Tool da esporre (MVP)

| Tool | Sorgente | Cosa torna |
|------|----------|-----------|
| `get_zone_avg_price` | Repull + scraper Booking | p25/p50/p75 per capacità/notti/stagione |
| `get_zone_occupancy` | Repull + dati osservati | % notti prenotate per comune/mese |
| `get_competitor_listings` | scraper locale | top N annunci comparabili (filtri: capacità, amenities, distanza) |
| `compare_my_listing` | mix | ranking vs comparable set + delta prezzo |
| `get_seasonal_trend` | Postgres storico | serie temporale prezzo medio per comune |
| `get_macro_tourism` | ISTAT BDT | arrivi/presenze/nazionalità per comune e anno |
| `search_listings_by_geom` | scraper + cache | annunci in polygon o raggio km |

### Fonte di verità — chi usare quando

| Quando | Usa |
|--------|-----|
| Vuoi un numero subito, ok approssimazione | Repull market intel (free) |
| Serve dato puntuale su una proprietà specifica | Scraper Booking ad hoc |
| Storico ≥12 mesi su un comune | Postgres locale + storico InsideAirbnb-style |
| Dato ufficiale (presenza/arrivi turistici) | ISTAT BDT |

### Caveat scraping
- **Airbnb resiste** allo scraping (anti-bot aggressivo) — vedi lezione da [`biprashree/marvix-automation-assignment`](https://github.com/biprashree/marvix-automation-assignment).
- **Booking.com è più tollerante** se rate-limited con cura (1 req/3s, user-agent realistico, IP residential pool).
- **Inside Airbnb non copre Como** — niente scorciatoie sui dati Airbnb storici locali, andranno costruiti da zero.

---

## Pilastro 3 — Compliance italiana (`host-como-italia-mcp`)

Coperto in dettaglio in [beds24-and-unified-approaches.md §3](./beds24-and-unified-approaches.md). Recap:

- **Alloggiati Web:** [`browsermcp/mcp`](https://github.com/browsermcp/mcp) controlla la sessione browser autenticata. Tool: `send_alloggiati_schedina(booking_id)`.
- **CIN registry:** nessuna lib decente, da costruire interno (~2 settimane).
- **SDI fatturazione:** [`fgasparetto/invoicetronic-mcp`](https://github.com/fgasparetto/invoicetronic-mcp) + [`invoicetronic/typescript-sdk`](https://github.com/invoicetronic/typescript-sdk).
- **Tassa di soggiorno:** varia per comune Lago di Como, da mappare uno per uno (Como, Bellagio, Menaggio, Tremezzina, Varenna, Cernobbio, Argegno…).

---

## Console unificata — come si usa in pratica

In Claude Code, file `.mcp.json` del progetto Host Como:

```json
{
  "mcpServers": {
    "host-como-ops": {
      "command": "node",
      "args": ["./mcp-servers/ops/dist/index.js"],
      "env": { "BEDS24_API_KEY": "..." }
    },
    "host-como-intel": {
      "command": "node",
      "args": ["./mcp-servers/intel/dist/index.js"],
      "env": { "REPULL_API_KEY": "...", "DATABASE_URL": "..." }
    },
    "host-como-italia": {
      "command": "node",
      "args": ["./mcp-servers/italia/dist/index.js"],
      "env": { "INVOICETRONIC_API_KEY": "..." }
    },
    "browsermcp": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    }
  }
}
```

**Esempio di sessione operativa:**

> "Crea su Beds24 una nuova proprietà 'Villa Tremezzo Lakeview', 4 camere, 8 ospiti, georef lat 45.98 lon 9.22. Imposta tariffe alta stagione €450, bassa €180. Sincronizza su Airbnb e Booking. Poi dimmi se i prezzi sono in linea con comparable a 3km."

Claude orchestra:
1. `host-como-ops/create_property` → Beds24
2. `host-como-ops/upload_photos` → Beds24
3. `host-como-ops/set_rate_plan` → Beds24 + canali OTA
4. `host-como-intel/get_competitor_listings` → Repull + Booking scraper
5. `host-como-intel/compare_my_listing` → ranking
6. Risposta sintetica all'utente con delta % vs mediana

Zero click. Tutto in chat.

---

## Roadmap consigliata (16 settimane)

| Fase | Settimane | Output |
|------|-----------|--------|
| **Phase 0 — Validation** | 1-2 | Beds24 sandbox attivo, lionlai SDK installato, Repull free tier collegato, smoke test 1 listing |
| **Phase 1 — Ops MCP MVP** | 3-6 | `host-como-ops-mcp` con 7 tool core, deploy su .mcp.json, migrazione Villa Angelo |
| **Phase 2 — Intel MCP MVP** | 7-10 | `host-como-intel-mcp` con 5 tool core, scraper Booking mensile, schema Postgres |
| **Phase 3 — Compliance** | 11-13 | `host-como-italia-mcp`, Browser MCP per Alloggiati, Invoicetronic per SDI |
| **Phase 4 — Hardening** | 14-16 | Test, error handling, retry logic, observability, doc per nuovi onboarding proprietà |

**Stima effort:** ~150-200 ore di sviluppo solo per i 3 MCP. Plausibile in 4
mesi a tempo parziale, 2 mesi full-time.

**Costo infrastruttura primo anno (3 proprietà):**
- Beds24: €240
- Repull: free
- Invoicetronic: ~€30-100/mese a seconda volume
- Vercel Postgres: €0-20/mese
- Vercel hosting: ~€20/mese
- Claude API per i 3 MCP: €600-1.200/anno
- **Totale stimato: ~€1.500-2.500/anno**

---

## File rilevanti / Critical paths

Da creare in Host Como repo (struttura proposta):

```
mcp-servers/
├── ops/
│   ├── src/
│   │   ├── index.ts            # MCP server entrypoint
│   │   ├── tools/              # un file per tool esposto
│   │   ├── beds24-client.ts    # wrapper @lionlai/beds24-v2-sdk
│   │   └── schemas.ts          # Zod schemas
│   └── package.json
├── intel/
│   ├── src/
│   │   ├── index.ts
│   │   ├── sources/
│   │   │   ├── repull.ts
│   │   │   ├── istat.ts
│   │   │   └── booking-scraper.ts
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── queries.ts
│   │   └── tools/
│   └── package.json
└── italia/
    ├── src/
    │   ├── index.ts
    │   ├── alloggiati-browser.ts
    │   ├── cin-client.ts
    │   ├── sdi-invoicetronic.ts
    │   └── tools/
    └── package.json
.mcp.json
```

E le env vars in `.env.local` (mai committate):
- `BEDS24_API_KEY` (long-lived token via wiki Beds24)
- `BEDS24_PROPERTY_TEMPLATE_ID` (per `create_property`)
- `REPULL_API_KEY`
- `INVOICETRONIC_API_KEY`
- `DATABASE_URL` (Postgres locale o Vercel)
- `ISTAT_BDT_TOKEN` (se richiesto)

---

## Decisioni aperte da confermare

Prima di partire con Phase 0 vale la pena fissare:

1. **Repull vs build interno per ops layer:** confermi che si parte con Repull free e si decide a Phase 1 se migrare? O preferisci skip Repull e build interno subito?
2. **Postgres dove:** locale Docker per sviluppo + Vercel Postgres per prod? O Supabase / Neon?
3. **Scraping Booking:** Playwright self-hosted (zero costo, gestione anti-bot tua) o Apify actor (paghi per scraping ma è gestito)?
4. **CIN compliance — quando:** essenziale subito (1 proprietà) o si rimanda a Phase 3 (~3 mesi)?
5. **Lingua MCP responses:** italiano sempre, o adattare alla lingua del prompt?

---

## Verifica end-to-end (Phase 0)

Per validare l'intera idea in 3 giorni:

1. **Account Beds24 sandbox** (gratuito 14 giorni) + creazione 1 property test
2. **`@lionlai/beds24-v2-sdk` install** e chiamata `GET /properties` da script standalone
3. **Repull free tier** signup + `repull-mcp` aggiunto a `.mcp.json` di un repo di test
4. **Smoke test in Claude Code**: prompt "lista tutte le mie proprietà Beds24 e mostra disponibilità prossimi 30 giorni". Se entrambi gli MCP rispondono in <5s → pattern validato.

---

## Sources

- [@lionlai/beds24-v2-sdk](https://www.npmjs.com/package/@lionlai/beds24-v2-sdk)
- [Beds24 API v2 docs](https://wiki.beds24.com/index.php/Category:API_V2)
- [Repull](https://repull.dev/) (market intelligence + MCP)
- [ISTAT Banca Dati Turismo](https://www.istat.it/it/turismo)
- [Open Data Regione Lombardia](https://open.regione.lombardia.it)
- [browsermcp/mcp](https://github.com/browsermcp/mcp)
- [fgasparetto/invoicetronic-mcp](https://github.com/fgasparetto/invoicetronic-mcp)
- [Model Context Protocol TS SDK](https://github.com/modelcontextprotocol/typescript-sdk)
