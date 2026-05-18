# Cernobbio Airbnb — competitive intel

Pulls every listing in the Cernobbio bounding box, fetches per-listing details,
and produces a flat comp set you can paste into a pitch deck or a pricing
model. Built on [pyairbnb](https://github.com/johnbalvin/pyairbnb) (the
StaysSearch GraphQL approach, not DOM scraping).

## Quickstart

```bash
pip install pyairbnb pandas matplotlib openpyxl
python scrape.py     # ~5–8 min for ~80–150 listings
python analyze.py    # instant — reads listings.json
```

Outputs land in this folder:

| File | What |
|---|---|
| `listings.json` | Raw + enriched data, one row per listing. Source of truth. |
| `comp_set.xlsx` | Flat comp set, one row per listing, ~25 cols (price, capacity, amenities, host, rating). |
| `summary.txt` | Aggregate stats — median ADR, top/bottom 5, amenity penetration. |
| `price_histogram.png` | Distribution of €/night for that snapshot. |
| `.run.log` | Append-only timestamped log of each scrape run. |

## What's tunable in `scrape.py`

| Var | Default | Why change it |
|---|---|---|
| `NE_LAT` / `SW_LAT` / `NE_LON` / `SW_LON` | bbox di Cernobbio comune | Allarga per cogliere Moltrasio/Carate Urio/Laglio (i bbox suggeriti sono in commento dentro `scrape.py`). |
| `CHECK_IN` / `CHECK_OUT` | 2026-07-15 → 22 (alta stagione) | Sposta su 2026-04-15→22 per stalla primaverile, 2026-12-20→27 per Natale, ecc. |
| `CURRENCY` | EUR | Lascia EUR per il mercato locale; USD se vuoi confronto cross-mercato. |
| `DETAIL_DELAY_SEC` | 2.5 | Più basso = più veloce ma più rischio 429. Sotto 1.5 sconsiglio. |
| `PROXY` | `""` | Per uso occasionale lascia vuoto (parte dal tuo IP). Per scrape settimanali ricorrenti, residential proxy (~€15/mese su Smartproxy/IPRoyal/Bright Data). |

## Price-trend strategies (oltre la singola snapshot)

La snapshot di una singola finestra ti dà il "prezzo di mercato per quella
settimana". Per un trend reale ci sono due strade.

### A — Multi-stagione cross-section

Gira `scrape.py` 4 volte cambiando solo `CHECK_IN`/`CHECK_OUT`:

```python
# Cambia in scrape.py per ogni run, poi rinomina listings.json prima del successivo
# (es. listings-2026-03.json, listings-2026-07.json, ...)
```

| Finestra | Range suggerito | Mood |
|---|---|---|
| Bassa stagione | 2026-03-15 → 22 | Marzo, lago tranquillo |
| Spalla pre-summer | 2026-05-15 → 22 | Maggio, weekend prolungato |
| Alta stagione | 2026-07-15 → 22 | Luglio (default attuale) |
| Spalla post-summer | 2026-09-15 → 22 | Settembre, foliage |
| Natale | 2026-12-21 → 28 | Festività |

Poi un piccolo script che mette in colonna le median ADR per finestra → grafico
del trend. Posso scriverlo io quando hai i 4-5 dump.

### B — Calendar forward 12 mesi (più granulare)

`pyairbnb.get_calendar(room_id)` ti restituisce il calendario forward-looking
per i prossimi 12 mesi con prezzi daily. Più lento (~3 sec × N listing = se hai
100 listing parliamo di ~5-8 min in più), ma il trend è giornaliero, non
finestrato. Quando ti serve davvero (es. modello di pricing dinamico per Host
Como) lo aggiungiamo a `scrape.py` come `--with-calendar` flag.

## Pitfalls noti

1. **Dynamic pricing** — i prezzi che vedi sono già personalizzati (A/B test
   Airbnb, geo del tuo IP). Una snapshot è "un" prezzo, non "il" prezzo. Per la
   distribuzione aggregata va bene, per il valore esatto di un singolo
   appartamento meno.
2. **Field schema** — Airbnb cambia la forma di alcuni campi (price come
   string, dict, talvolta nested). `analyze._parse_price()` ha già il fallback,
   ma se vedi colonne `price_night` vuote, inspect raw `listings.json` per
   capire dove sta il numero adesso e aggiorna il parser.
3. **Rate limiting** — al primo 429 lo script logga la riga e prosegue. Se il
   tasso di failure supera il 20%, fermati, aspetta 1 ora e considera un
   residential proxy.
4. **Uso del dato** — questo è **competitive intelligence interna**, non
   redistribuzione. Va bene per pricing, posizionamento, conversazioni con
   proprietari. Non va bene per ripubblicare le righe tali quali su un sito
   pubblico.

## Schema delle colonne in `comp_set.xlsx`

| Colonna | Tipo | Note |
|---|---|---|
| `room_id` | int | Identificativo Airbnb (link diretto: `https://airbnb.com/rooms/<room_id>`) |
| `title` | str | Titolo annuncio (taglio 120 char) |
| `room_type` | str | `Entire home/apt`, `Private room`, ecc. |
| `person_capacity` | int | Posti letto totali dichiarati |
| `bedrooms` / `beds` / `bathrooms` | int | |
| `lat` / `lng` | float | Coordinate approssimate (Airbnb le maschera ±150m) |
| `price_night` | float | **€/notte estratto**. Vedi note sul parsing. |
| `price_total` | float | Totale stay (price_night × notti + clean + service). Spesso assente. |
| `rating` | float | 0–5 |
| `n_reviews` | int | |
| `is_superhost` | 0/1 | |
| `host_name` / `host_listings` | str / int | Per capire host privati vs host professionali (chi gestisce >3 case di solito è managed) |
| `lake_view` / `pool` / `hot_tub` / `air_conditioning` / `parking` / `kitchen` / `wifi` / `washer` / `balcony` / `elevator` / `beach_access` | 0/1 | Flag costruito da match testuale su amenities + description. Falso positivo possibile su "lake view" se l'annuncio dice "no lake view from this apartment, but…". Rare ma esistono. |
| `url` | str | Link diretto |

## Storia del file & next steps per Host Como

Questo scrape ha due use case immediati:

1. **Pitch ai proprietari**: quando vai a vedere un appartamento, hai già
   median ADR + posizionamento di mercato per Cernobbio in tasca. "La media
   Cernobbio per appartamento da 4 ospiti in alta stagione è X€/notte, il tuo
   immobile è posizionato Y%" è una conversazione che chiude meglio.
2. **Pricing engine per le proprietà in gestione**: una volta entrato in
   gestione, il calendar forward-looking (path B sopra) alimenta il pricing
   dinamico — soglie sopra/sotto la median per stagione, con eventi locali
   (festival, fiere) come bumper.

Quando arriva il momento del pricing engine in produzione: AirDNA è il
benchmark accademico standard (€20–40/mese per Como), questo scraper è il
backup gratuito e custom. Non costruirei Host Como con solo lo scraper come
unica fonte — il **dual-feed** AirDNA + pyairbnb riduce il rischio di single
point of failure quando Airbnb cambia GraphQL schema.
