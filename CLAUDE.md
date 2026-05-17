# Host Como

Piattaforma B2B per property management sul Lago di Como (dominio:
hostcomo.com). Convince i proprietari di immobili ad affidarci la gestione
degli affitti brevi, sfruttando l'esperienza di Angelo (host da 10 anni sul
Lago).

## Stack
- Next.js 14 (App Router) + React 18 + TypeScript strict
- Tailwind CSS + shadcn/ui
- MongoDB Atlas (memory store fallback via USE_MEMORY_STORE=true)
- NextAuth.js (password-based, area clienti)
- Deploy: Vercel via push a master

## i18n
- Locales supportati: `it` (default), `en`, `ru`
- Routing: next-intl con `localePrefix: "as-needed"` — IT è default, EN/RU hanno prefisso `/en/...` o `/ru/...`
- Messaggi UI: `messages/{it,en,ru}.json` (~1700 chiavi ciascuno, devono restare in struttura mirror)
- Data files locale-aware (`team.json`, `properties.json`, `guides.json`, `comuni.json`): convenzione `field`, `field_en`, `field_ru` letta da `pickLocalized` in `src/lib/i18n-data.ts`
- Pagine legali (`privacy`, `terms`, `cookies`, `note-legali`): COPY object con chiavi `it`/`en`/`ru`

## Design
- Stile moderno minimal, sfondo bianco
- Primario: teal #0C7489 -> #119DB0 (gradient)
- Font: Outfit (body) + Bungee (wordmark)
- Logo: monogramma "HLC" su quadrato gradient (filename neutri, non rinominato)

## Repo
- GitHub: crapotca2/hostinglakecomo (nome legacy, da rinominare via UI)
- Vercel: hostinglakecomo (nome legacy, da rinominare via UI)
- Dominio produzione: hostcomo.com

## Posizionamento
- **Solo B2B**: convince proprietari ad affidarci gestione (no B2C ospiti).
- **No booking sul sito**: showcase + lead-gen only. Le prenotazioni reali
  delle proprieta in gestione passano da Airbnb/altre piattaforme, non da qui.
- **Storia di Angelo**: 10 anni di hosting documentati. La pagina /about e
  un upsell speech basato sul suo profilo Airbnb 1462513131563105498.

## Portfolio iniziale
- Una sola proprieta showcase: Airbnb listing 1379549245986609410 di Angelo.
- Detail page mostra info, foto, mappa, POI; nessun bottone di prenotazione.

## Aree del sito
- /, /properties, /properties/[slug] (showcase)
- /services (solo proprietari)
- /strumenti (3 simulatori pubblici + 3 tool area clienti locked)
- /report (preview deliverable mensili)
- /about (storia Angelo)
- /contact (lead form con preset interest)
- /login + /dashboard (area clienti proprietari)
