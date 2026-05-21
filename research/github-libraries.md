# Ricerca GitHub — Librerie & Repository utili per Host Como

**Data ricerca:** 15 maggio 2026
**Scope:** Property management sul Lago di Como (B2B, lead-gen, showcase). Focus su
automazioni operative, integrazioni piattaforme OTA, gestionali, intelligence di
mercato, server MCP per controllo via AI, e alternative professional-grade.

---

## Executive summary

Lo stato dell'arte open-source per la gestione di affitti brevi è oggi
**frammentato e dominato da progetti accademici o PoC personali**: pochi repo
production-ready, molte demo con stelle a zero. La leva più interessante per
Host Como non è ricostruire un PMS da zero ma **costruire uno strato sottile
sopra Beds24/Hostaway** e affiancare il tutto a un **MCP server custom** per
permettere a Claude di pilotare le operazioni quotidiane (messaggi ospiti,
pricing, report). La pista MCP è la novità più rilevante del 2025-2026: esiste
già `openbnb-org/mcp-server-airbnb` con 451 stelle, e il pattern si sta
espandendo a Lodgify, Guesty, Channex. Per l'Italia il punto cieco è la mancanza
di librerie native per CIN/Alloggiati Web — c'è solo un client C# desktop
(`SergioArc69/invio_schedine-alloggiatiweb`) che vale come riferimento tecnico
ma non come dipendenza.

**Tre cose da rubare subito:**
1. Pattern MCP read-only di `openbnb-org/mcp-server-airbnb` per esporre comparable di mercato a Claude.
2. Architettura SDK di `WataruShirako/beds24-booking-sdk` (TypeScript + Stripe + Resend) come blueprint per il booking engine custom.
3. Logica IMAP-driven di `engineerthefuture/RentalTurnManager` per intercettare prenotazioni e orchestrare turnover.

---

## Tabella indice — Top repo per categoria

| Categoria | Repo | Stelle | Lingua | Ultimo aggiornamento | Licenza |
|-----------|------|--------|--------|---------------------|---------|
| Automation ops | [engineerthefuture/RentalTurnManager](https://github.com/engineerthefuture/RentalTurnManager) | 0 | C# (.NET 10 + AWS) | 2026 attivo | MIT |
| Automation ops | [steai111/Guest_Welcome_Agent](https://github.com/steai111/Guest_Welcome_Agent) | 0 | Python | 2026 | n/d |
| Automation ops | [LibreProperty/LibreProperty](https://github.com/LibreProperty/LibreProperty) | 16 | Python/Flask | attivo | Apache-2.0 |
| Automation ops | [RentTools.io](https://github.com/topics/short-term-rental) | 0 | TypeScript | recente | n/d |
| Automation ops | [biprashree/marvix-automation-assignment](https://github.com/biprashree/marvix-automation-assignment) | 0 | TypeScript (Playwright) | recente | n/d |
| Integrazioni piattaforma | [WataruShirako/beds24-booking-sdk](https://github.com/WataruShirako/beds24-booking-sdk) | 2 | TypeScript | 2026 | MIT |
| Integrazioni piattaforma | [mihilbabin/beds24](https://github.com/mihilbabin/beds24) | 2 | Ruby | 2024 | MIT |
| Integrazioni piattaforma | [hospitable-python](https://github.com/topics/short-term-rental) | 2 | Python | recente | n/d |
| Integrazioni piattaforma | [SergioArc69/invio_schedine-alloggiatiweb](https://github.com/SergioArc69/invio_schedine-alloggiatiweb) | 3 | C# WPF | 31-mar-2026 | GPL-3.0 |
| Gestionali (PMS) | [QloApps](https://github.com/topics/property-management-system) | ~1k | PHP | attivo | OSL-3.0 |
| Gestionali (PMS) | [Movin' In](https://movin-in.github.io/) | ~50 | TypeScript | attivo | MIT |
| Gestionali (PMS) | [open-condo-software/condo](https://github.com/open-condo-software/condo) | ~100 | TypeScript | attivo | MIT |
| Gestionali (PMS) | [OCA/pms](https://github.com/OCA/pms) | varia | Python (Odoo) | attivo | AGPL-3.0 |
| Market & pricing | [tule2236/Airbnb-Dynamic-Pricing-Optimization](https://github.com/tule2236/Airbnb-Dynamic-Pricing-Optimization) | 237 | Jupyter | accademico | n/d |
| Market & pricing | [inside-airbnb](http://insideairbnb.com/) | dataset | dataset | mensile | dataset |
| Market & pricing | [LucPeeters21/Airbnb-pricing](https://github.com/LucPeeters21/Airbnb-pricing) | low | R/Shiny | attivo | n/d |
| Market & pricing | [databooter/Airbnb_Scraper](https://github.com/databooter/Airbnb_Scraper) | low | Python (Scrapy) | attivo | n/d |
| MCP / AI-native | [openbnb-org/mcp-server-airbnb](https://github.com/openbnb-org/mcp-server-airbnb) | **451** | JavaScript | 10-apr-2026 | MIT |
| MCP / AI-native | [Fast-Transients/lodgify-mcp-server](https://github.com/Fast-Transients/lodgify-mcp-server) | 2 | Python | attivo | MIT |
| MCP / AI-native | [guesty-mcp-server](https://github.com/topics/short-term-rental) | 5 | JavaScript | attivo | n/d |
| MCP / AI-native | [channex-mcp](https://github.com/topics/short-term-rental) | 4 | TypeScript | attivo | n/d |
| MCP / AI-native | [samwang0723/mcp-booking](https://github.com/samwang0723/mcp-booking) | low | TypeScript | attivo | MIT |
| Data warehouse | [short-term-rentals-warehouse](https://github.com/topics/short-term-rental) | 14 | Python (Snowflake/dbt) | attivo | n/d |

---

## 1. Schede dettagliate — Repo forniti dall'utente

### 1.1 `biprashree/marvix-automation-assignment`

**Cosa fa.** Framework di test automation in Playwright + TypeScript che valida
il flow di login Airbnb e una ricerca proprietà a Mumbai con estrazione dati
host. È un assignment tecnico, non un prodotto. Adotta Page Object Model e
gestisce dismissal di popup dinamici.

**Stack.** Playwright, TypeScript, Node.js. 100% TypeScript.

**Stelle / licenza / data.** 0 stelle, licenza non specificata, repository
recente.

**Punto chiave.** Il maintainer **dichiara esplicitamente di non automatizzare
il login** perché Airbnb usa CAPTCHA, OTP e device fingerprinting aggressivi.
Questo è il take-away più prezioso: conferma che qualsiasi tentativo di RPA
diretto su Airbnb come host indipendente è destinato a rompersi. La strada
giusta resta API ufficiali via PMS partner.

**Riutilizzabilità per Host Como.** Bassa come codice. Alta come **lezione
strategica**: lascia perdere lo scraping diretto di Airbnb per operazioni
critiche, usa channel manager certificati. Il Page Object Model resta uno
schema pulito da copiare se in futuro servisse automazione browser su
piattaforme senza anti-bot (Beds24 web UI per esempio).

---

### 1.2 `steai111/Guest_Welcome_Agent`

**Cosa fa.** Sistema operativo che ogni giorno legge il calendario di **Beddy**
(PMS italiano), trova gli ospiti in arrivo il giorno dopo, estrae nome, telefono
e nazionalità, genera un messaggio di benvenuto in lingua e lo consegna in
Telegram pronto da inoltrare manualmente in WhatsApp. **Preserva l'oversight
umano** sull'invio finale.

**Stack.** Python, Playwright (per leggere Beddy via browser), Telegram Bot,
cron scheduler, template engine, OTP/session bridge.

**Stelle / licenza / data.** 0 stelle, licenza non specificata, 4 commit. Repo
personale, ma il pattern è solido.

**Riutilizzabilità per Host Como.** Media. Pattern architetturale ottimo:
**generate-but-don't-send**. Per Host Como ha senso una variante che legge i
booking da Hostaway/Beds24 (no Playwright, usa API), genera in italiano/inglese/
russo, e propone via dashboard interna invece che Telegram. La parte di language
detection per ospite vale come copia diretta.

---

### 1.3 `engineerthefuture/RentalTurnManager`

**Cosa fa.** Applicazione **serverless AWS** che monitora caselle IMAP per
intercettare conferme di prenotazione da Airbnb/VRBO/Booking.com, e contatta
automaticamente in priorità le persone delle pulizie via email con conferma o
proposta di slot alternativi. Include override del proprietario, cancellazione
pulizia, e calendar invites ICS. Notifiche SMS via email-to-SMS gateway.

**Stack.** C# / .NET 10, AWS Lambda + Step Functions + EventBridge + S3 + SES +
API Gateway, xUnit/Moq, Spec Kit per dev workflow. 330 commit.

**Stelle / licenza / data.** 0 stelle, **MIT**, creato gennaio 2026, attivo.

**Riutilizzabilità per Host Como.** Alta come **architettura di riferimento**.
Pattern key: usare la casella email come trigger universale per booking
(funziona anche senza API). State machine via Step Functions per orchestrare
timeout multi-livello (9h / 3h) è elegante. Lo stack .NET non è in linea con il
nostro Next.js, ma la logica si porta in TypeScript senza problemi su Vercel
edge functions + Upstash QStash. Da rubare: parsing email Airbnb/Booking,
priority queue cleaner, ICS generation, token-based owner override.

---

### 1.4 `mishoka23/airbnb_tax`

**Cosa fa.** "Airbnb Accounting Automation for Bulgaria". Documentazione
limitata (file .docx invece di README), nessun codice ispezionabile dalla
landing page.

**Stelle / licenza / data.** 0 stelle, licenza non specificata, repo embrionale.

**Riutilizzabilità per Host Como.** **Nulla diretta** (logica fiscale bulgara
diversa dall'italiana). Vale come reminder che la fiscalità degli affitti brevi
è un dominio verticale per paese — Host Como avrà bisogno di una libreria
**cedolare secca italiana** (21% / 26% sopra 4 immobili, ritenuta 21% sostituto
d'imposta del portale) che non esiste open-source e va costruita.

---

### 1.5 `mihilbabin/beds24`

**Cosa fa.** Gem Ruby che wrappa l'API Beds24, con client JSON e XML. Espone
list properties, property details, bookings (read + modify). Parsing
automatico XML→Hash.

**Stack.** Ruby, RSpec, Bundler, Travis CI.

**Stelle / licenza / data.** 2 stelle, MIT, ultimo lavoro 2024.

**Riutilizzabilità per Host Como.** Bassa come dipendenza (Ruby, stack diverso),
**alta come riferimento di design**. La struttura dei filtri parametrici e la
separazione tra client JSON e client XML sono pattern utili da replicare in TS.
Beds24 ha **due API** (v1 legacy XML e v2 JSON moderna): nostro punto d'ingresso
è la v2, ma il gem documenta bene come la v1 fa parsing complicato — utile
sapere prima di scegliere.

---

### 1.6 `WataruShirako/beds24-booking-sdk`

**Cosa fa.** **SDK all-in-one** per costruire un sistema di booking custom
sopra Beds24 v2, con sync calendario, pricing dinamico (rate weekend/feriali +
surcharge ospiti aggiuntivi), Stripe Checkout per pagamento, creazione booking
automatica via webhook post-payment, email di conferma via Resend con template
giapponesi. Server-side price verification per anti-tampering.

**Stack.** TypeScript 100%, Node.js >=18, Beds24 API v2, Stripe, Resend.

**Stelle / licenza / data.** 2 stelle, **MIT**, attivo 2026.

**Riutilizzabilità per Host Como.** **Altissima.** È esattamente lo stack di
Host Como (TS, Node 18+, Vercel-friendly). Anche se il sito è showcase + lead-gen
senza booking on-site, in futuro l'area clienti proprietari potrebbe ospitare un
booking engine diretto (saltare commissioni Airbnb sui repeat guest). Da rubare
**oggi**: il pattern di server-side price verification (sicurezza), la
modularità degli import (`/calendar`, `/pricing`, `/stripe`), e il webhook
handler Stripe→Beds24. I template email JP vanno ovviamente sostituiti con
IT/EN/RU. Questa è probabilmente la dipendenza più immediatamente utile di
tutta la ricerca.

---

## 2. Automazioni operative — Top 5

1. **`engineerthefuture/RentalTurnManager`** (vedi scheda 1.3). Serverless, MIT, monitor IMAP→cleaners.
2. **`LibreProperty/LibreProperty`** — Apache-2.0, 16★, Flask/Python, Docker. Roadmap ambiziosa (multi-listing sync, dynamic pricing, smart locks, booking website). **Nessun prototipo funzionante ancora**, ma vale tenerlo monitorato come potenziale upstream.
3. **`steai111/Guest_Welcome_Agent`** (vedi scheda 1.2). Pattern Telegram-as-staging per messaggistica ospiti.
4. **`RentTools.io`** (TS, recente) — sync calendari Airbnb+Booking, scheduling pulizie e documenti ospiti. Stack allineato al nostro, vale un fork-test.
5. **`biprashree/marvix-automation-assignment`** (vedi scheda 1.1). Solo come reminder anti-RPA su Airbnb.

---

## 3. Librerie di integrazione piattaforme — Top 5

1. **`WataruShirako/beds24-booking-sdk`** (vedi scheda 1.6). **Pick principale.**
2. **`mihilbabin/beds24`** (vedi scheda 1.5). Reference di design API Beds24.
3. **`hospitable-python`** — SDK Python per Hospitable (PMS Airbnb-Preferred+ partner). 2★, attivo. Utile se valutiamo Hospitable invece di Beds24 (più premium, prezzo più alto, ma webhooks sotto il minuto).
4. **`SergioArc69/invio_schedine-alloggiatiweb`** — C# WPF desktop, GPL-3.0, 3★, aggiornato 31 marzo 2026. Client SOAP per portale Alloggiati Web (Polizia di Stato). **Pratica:** GPL-3 ci impedisce di linkarlo direttamente in un prodotto chiuso, ma documenta il protocollo SOAP. Il dev sta scrivendo anche una versione Flutter. Per Host Como conviene **scrivere un client TypeScript autonomo** ispirato a questa implementazione.
5. **`samwang0723/mcp-booking`** — MCP server per Booking.com. Coperto sotto MCP.

**Gap aperto.** Non esiste libreria open-source TypeScript-native per:
- API CIN (Codice Identificativo Nazionale, obbligatorio dal 2024)
- Alloggiati Web (la libreria sopra è C#)
- Tassa di soggiorno comunale Lago di Como (ogni comune ha tariffe e bollettini diversi)

Questi sono **moat builder** per Host Como — costruirli internamente e
pubblicarli OSS sarebbe marketing forte verso altri property manager italiani.

---

## 4. Gestionali (PMS open-source) — Top 5

1. **QloApps** — PHP, OSL-3.0, hotel-oriented. Maturo ma settoriale "alberghiero classico", da considerare solo come reference architecture.
2. **Movin' In** — TypeScript fullstack, MIT, admin panel + frontend + mobile app. **Stack vicino al nostro**, vale clone test.
3. **`open-condo-software/condo`** — SaaS OSS per gestione condomini/proprietà condivise, TypeScript, MIT. Marketplace di mini-app interno, estensibile. Sovra-dimensionato per Host Como solo, ma il modello "extension marketplace" è interessante se in futuro vendiamo Host Como come piattaforma white-label ad altri property manager.
4. **`OCA/pms`** — PMS su Odoo. AGPL-3.0. Pesante (richiede tutto l'ecosistema Odoo) ma maturo. Solo se decidiamo di standardizzare su Odoo per accounting.
5. **ORPMS** — Node.js, real estate property management. Più "edifici/uffici" che vacation rental, non perfetto fit.

**Take-away.** Nessun PMS OSS al 2026 è production-ready per affitti brevi
multi-piattaforma. La via realistica resta **PMS commerciale (Beds24/Hostaway/
Hospitable) + UI custom Host Como come strato proprietario**.

---

## 5. Market intelligence & pricing — Top 5

1. **`tule2236/Airbnb-Dynamic-Pricing-Optimization`** — 237★, Jupyter. Progetto accademico (BA project) con K-means + kNN regression + ottimizzazione di profitto annuale. Non production-ready (prezzi costanti nei cluster), ma la **metodologia è riusabile**. Pattern: clustering competitor in 3-mile radius → baseline kNN → optimization daily.
2. **Inside Airbnb** (insideairbnb.com) — non un repo ma il **dataset gold standard**. Snapshot mensili per città, listing + reviews + calendar disponibili. **Como/Bellagio/Menaggio non sono coperti** ufficialmente, ma la pipeline è clonabile da `short-term-rentals-warehouse` (Snowflake+dbt, 14★) e si può scrapare per il bacino del lago.
3. **`LucPeeters21/Airbnb-pricing`** — Shiny app + Make pipeline per stimare prezzi su città EU. R, non TS, ma il workflow di data engineering è solido.
4. **`databooter/Airbnb_Scraper`** — Python/Scrapy per estrarre listing search results. Funziona ma fragile (anti-bot Airbnb). Da usare con caution per market research mensile, non per dati real-time.
5. **Vrbo Scraper** (citato nei topic, repo vario) — utile per comparable cross-platform se vuoi vedere Como sia su Airbnb che VRBO.

**Take-away.** Per Host Como la strategia pragmatica è:
- Mensile: scraping/inside-airbnb-style snapshot zona Lago di Como.
- Trimestrale: aggiornamento dashboard prezzi medi per comune (CIN ora rende le statistiche più tracciabili).
- Real-time: NO scraping, NO pricing dinamico fai-da-te. Se serve, plug-in **PriceLabs o Wheelhouse** via Beds24 (commerciali ma battle-tested).

---

## 6. MCP / AI-native — Top 5

Questa categoria è la **novità del 2026** e la più strategica per Host Como.
L'idea: esporre operazioni di proprietà come tool MCP così Claude può fare
"crea l'annuncio per la nuova villa a Tremezzo" o "rispondi all'ospite che
chiede info parcheggio" senza UI custom.

1. **`openbnb-org/mcp-server-airbnb`** — **451 stelle, MIT, aggiornato 10 aprile 2026**. JavaScript. Espone `airbnb_search` e `airbnb_listing_details`. **Read-only** (no booking, no listing creation). Include geocoding Photon/Nominatim per query non-US. **Da clonare subito** per il caso d'uso "comparable analysis via prompt": un agente che dato un comune del lago restituisce 5 listing comparabili con prezzi medi.
2. **`Fast-Transients/lodgify-mcp-server`** — 2★, MIT, Python. Espone `get_properties`, `get_property_by_id`, `get_bookings`, `create_booking`, `update_booking_status`, `get_calendar`. **Read + write su Lodgify** (Preferred Airbnb partner). 92 commit, 3 release, 8 issue aperte — attivo.
3. **`guesty-mcp-server`** — 5★, JavaScript. **38 tool** integrati con Guesty per reservations, messaging, pricing, financial ops. Più completo, ma Guesty è il PMS più caro del mercato.
4. **`channex-mcp`** — 4★, TypeScript. MCP per Channex.io (channel manager) — gestisce properties e rate plans cross-OTA. Più "thin" come scope ma diretto sul layer channel manager.
5. **`samwang0723/mcp-booking`** — MCP server per Booking.com. TypeScript, MIT. Scope più limitato (Booking.com API è restrittiva).

**Bonus segnalati ma non analizzati a fondo:**
- `vacationrentalmcp.com` (Extenteam) — servizio commerciale, non open source.
- `ivannikolovbg/repull-mcp` — wrap dell'API Repull che a sua volta unifica 46+ piattaforme. Approccio "MCP sopra aggregator" interessante in teoria, ma aggiunge un layer di dipendenza.
- `airbnb-mcp` di vedantparmar12 / suvraadeep — varianti meno mantenute.

**Pattern emergente.** Tre archetipi distinti:
- **Read-only public scraping MCP** (openbnb-airbnb): non ha bisogno di credenziali, ottimo per intelligence di mercato.
- **PMS-wrapping MCP** (lodgify, guesty): richiede API key, abilita operazioni reali.
- **Channel manager MCP** (channex): astrazione cross-OTA, sacrifica feature granulari.

**Raccomandazione per Host Como.** Costruire **due MCP** in-house:
1. `host-como-intelligence-mcp` — fork di `mcp-server-airbnb` con focus zona Lago di Como, fonti aggiuntive Booking/VRBO.
2. `host-como-ops-mcp` — wrap dell'API Beds24 (una volta scelto Beds24 come backbone), espone tool come `list_upcoming_checkins`, `send_guest_message`, `update_pricing_rule`, `generate_owner_report`.

---

## 7. Soluzioni alternative professional-grade

Quattro filoni che meritano esplorazione separata dai PMS classici:

### 7.1 Workflow platform
- **n8n** (self-hosted, fair-code) come orchestratore: cleaning schedules, message
templates, OTA sync. Esistono `n8n-mcp-server` per esporre workflow come tool MCP.
- **Activepieces** — alternativa OSS più nuova.
- **Trigger.dev v4** — code-first orchestration in TypeScript, perfetto se vuoi
mantenere tutto il backend coerente con il main codebase Host Como.

### 7.2 Guest-facing AI
- **Pre-arrival concierge chatbot**: cercare `guest chatbot rental`,
`LLM hospitality concierge`. Non esistono OSS dominanti, è un'occasione di
costruzione interna sopra Claude API.
- **AI inbox**: HostAI, Besty, Enso Connect sono SaaS chiusi. Niente clone OSS
serio al momento.

### 7.3 Cleaning & turnover ops
- **`engineerthefuture/RentalTurnManager`** (vedi 1.3) — riferimento.
- Cercare `turno`, `properly clone`, `inspection app open source` per tooling
mobile per cleaner.

### 7.4 Italia-specifici (gap di mercato)
- **Cedolare secca calculator**: nessuno OSS rilevante. Da costruire.
- **Fatturazione affitti brevi**: integrazione con SDI/fattura elettronica via
`fatturapa-typescript` (se esiste) o costruzione interna.
- **CIN registry sync**: nessuna libreria — strada API tramite portale BDSR.

---

## 8. Raccomandazioni operative — Cosa clonare per primi

Ordine consigliato basato su valore vs sforzo:

1. **Clona oggi**: [`openbnb-org/mcp-server-airbnb`](https://github.com/openbnb-org/mcp-server-airbnb)
   → smonta, capisci il pattern read-only, addatta per zona Lago di Como.
   Output: prototipo MCP che dato "Bellagio, 4 ospiti, 5 notti" torna 10 comparable.
2. **Studia entro 1 settimana**: [`WataruShirako/beds24-booking-sdk`](https://github.com/WataruShirako/beds24-booking-sdk)
   → blueprint per booking engine futuro. Anche se Host Como non vende prenotazioni oggi, ti dà chiarezza su cosa serve per Beds24 v2 integration.
3. **Tieni in osservazione**: [`Fast-Transients/lodgify-mcp-server`](https://github.com/Fast-Transients/lodgify-mcp-server)
   → modello di MCP read+write su PMS. Se decidi PMS commerciale, replica questo pattern sul provider scelto.
4. **Architettura di riferimento**: [`engineerthefuture/RentalTurnManager`](https://github.com/engineerthefuture/RentalTurnManager)
   → leggi spec e workflow, porta logica in TypeScript su Vercel/Trigger.dev.
5. **Backlog ricerca**: [`tule2236/Airbnb-Dynamic-Pricing-Optimization`](https://github.com/tule2236/Airbnb-Dynamic-Pricing-Optimization)
   → utile quando avrai >5 proprietà in gestione e dati storici sufficienti.

---

## 9. Caveat e disclaimer

- **Airbnb e Booking non hanno API pubbliche** per host indipendenti.
  Necessario passare da un PMS Preferred/Preferred+ partner (Beds24, Smoobu,
  Lodgify, Hostaway, Hospitable, Guesty).
- **Beds24 e Smoobu** sono Preferred (5-15 min polling), **Hostaway,
  Hospitable, Guesty** sono Preferred+ (webhook sub-minuto). Per Host Como con
  poche proprietà inizialmente, Beds24 ha il miglior rapporto prezzo/qualità
  (~€20/mese vs €100+/mese di Guesty).
- **Tutti i repo "MCP server PMS" ispezionati hanno <50 stelle** tranne
  `openbnb-server-airbnb`. È un ecosistema giovanissimo: aspettarsi breaking
  changes, doc lacunose, manutenzione discontinua. **Forkare** è quasi sempre
  più sicuro che dipendere come npm package.
- **AGPL-3.0 (Odoo PMS), GPL-3.0 (Alloggiati C#) sono incompatibili** con un
  prodotto Host Como chiuso. Solo lettura/ispirazione, niente linking diretto.
- **InsideAirbnb non copre il Lago di Como**: per intelligence locale serve
  pipeline scraping interna.

---

## 10. Verifica

Per validare la ricerca:
1. Clonare `openbnb-org/mcp-server-airbnb`, configurare in Claude Code via
   `.mcp.json`, lanciare query del tipo "trova 5 ville sul Lago di Como con 4
   camere disponibili dal 1 luglio al 7 luglio". Se Claude risponde con dati
   reali → pattern validato.
2. Aprire account Beds24 sandbox, eseguire un `GET /properties` con la API key
   di test. Confrontare output con la struttura attesa da `WataruShirako/beds24-booking-sdk`.
3. Provare a inviare 1 schedina test su Alloggiati Web tramite il client di
   `SergioArc69` per capire formato XML e ricevuta PDF — prima di scrivere il
   client TypeScript interno.

---

## Sources & ringraziamenti

Ricerca eseguita via GitHub Topics, search API e fetch diretto delle repo.
Date e stelle riflettono il 15 maggio 2026.

- [openbnb-org/mcp-server-airbnb](https://github.com/openbnb-org/mcp-server-airbnb)
- [Fast-Transients/lodgify-mcp-server](https://github.com/Fast-Transients/lodgify-mcp-server)
- [LibreProperty/LibreProperty](https://github.com/LibreProperty/LibreProperty)
- [tule2236/Airbnb-Dynamic-Pricing-Optimization](https://github.com/tule2236/Airbnb-Dynamic-Pricing-Optimization)
- [SergioArc69/invio_schedine-alloggiatiweb](https://github.com/SergioArc69/invio_schedine-alloggiatiweb)
- [engineerthefuture/RentalTurnManager](https://github.com/engineerthefuture/RentalTurnManager)
- [steai111/Guest_Welcome_Agent](https://github.com/steai111/Guest_Welcome_Agent)
- [biprashree/marvix-automation-assignment](https://github.com/biprashree/marvix-automation-assignment)
- [mishoka23/airbnb_tax](https://github.com/mishoka23/airbnb_tax)
- [mihilbabin/beds24](https://github.com/mihilbabin/beds24)
- [WataruShirako/beds24-booking-sdk](https://github.com/WataruShirako/beds24-booking-sdk)
- [GitHub Topic: short-term-rental](https://github.com/topics/short-term-rental)
- [GitHub Topic: vacation-rental](https://github.com/topics/vacation-rental)
- [GitHub Topic: property-management-system](https://github.com/topics/property-management-system)
- [Inside Airbnb dataset](http://insideairbnb.com/)
- [TensorBlock awesome-mcp-servers (travel/transportation)](https://github.com/TensorBlock/awesome-mcp-servers/blob/main/docs/travel--transportation.md)
