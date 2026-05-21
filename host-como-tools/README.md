# host-como-tools

Tooling interno per Host Como. Ogni cartella è un pacchetto npm autonomo che
espone la stessa business logic via **CLI** (script/Bash) e via **MCP server**
(Claude Code, Cursor).

## Struttura

```
host-como-tools/
├── ops/        # operazioni su annunci (Beds24)
├── intel/      # market intelligence Lago di Como  [TODO Phase 2]
└── italia/     # compliance italiana (Alloggiati, CIN, SDI)  [TODO Phase 3]
```

Architettura di riferimento: [/research/host-como-ai-console-architecture.md](../research/host-como-ai-console-architecture.md).

## Phase 0 — smoke test (`ops`)

Obiettivo: verificare che lo stack TS + Beds24 v2 + MCP risponda end-to-end.

### Setup

```pwsh
cd host-como-tools/ops
npm install
cp .env.example .env.local
# Aprire .env.local e incollare BEDS24_API_TOKEN dalla UI Beds24 sandbox
```

### Smoke test via CLI

```pwsh
npm run dev:cli -- list-properties
```

Risposta attesa: JSON `{ "count": N, "properties": [...] }` con le proprietà
dell'account Beds24 collegato.

### Smoke test via MCP

```pwsh
npm run build
```

Poi, alla root del repo Host Como, copiare `.mcp.json.example` in `.mcp.json`
e inserire il token. Riavviare Claude Code; il tool `list_properties` deve
comparire nei `/mcp` tools disponibili. Prova:

> "Lista le mie proprietà su Beds24."

## Tool implementati

| Tool | Stato | Descrizione |
|------|-------|-------------|
| `list_properties` | ✓ MVP | Read-only smoke test |
| `create_property` | TODO | POST /properties con template |
| `update_property` | TODO | PUT /properties/{id} |
| `upload_photos` | TODO | Bulk upload |
| `set_rate_plan` | TODO | Stagionalità |
| `update_calendar` | TODO | Prezzo + min-stay + disponibilità |
| `list_bookings` | TODO | Filtro per property + range |
| `send_guest_message` | TODO | Messaggistica in-platform |
| `generate_owner_statement` | TODO | Aggregato mensile PDF |

## Convenzioni

- Ogni tool vive in `ops/src/core/tools/<tool-name>.ts` e esporta:
  - `Input` (Zod schema)
  - `Output` (Zod schema)
  - funzione async che prende `Input` e ritorna `Output`
- `cli/index.ts` mappa il tool a un `commander` sub-command
- `mcp/index.ts` mappa il tool a un MCP handler

Una volta scritta la business logic, le due interfacce sono boilerplate
≤10 righe.
