# BIMI setup per hostcomo.com — istruzioni pannello IONOS

L'obiettivo è far comparire il logo HC come avatar in tutte le mail mandate
da `info@hostcomo.com` (e qualsiasi altro alias del dominio) in Gmail,
Yahoo Mail, Apple Mail iOS 16+, Fastmail. Senza certificato VMC (gratis).

## Stato attuale (verificato il 2026-05-29)

| Record | Valore attuale | OK per BIMI? |
|---|---|---|
| MX | `mx00/01.ionos.it` | ✓ |
| SPF | `v=spf1 include:_spf-eu.ionos.com ~all` | ✓ |
| DKIM | NON CONFIGURATO (nessun selector trovato) | ✗ |
| DMARC | `v=DMARC1; p=none;` | ✗ (BIMI richiede `p=quarantine` o `p=reject`) |
| BIMI | non presente | ✗ |

Quindi servono 3 step in ordine: **prima DKIM, poi DMARC, infine BIMI**.
Saltare l'ordine = mail finiscono in spam.

---

## Step 1 — Attivare DKIM su IONOS

DKIM firma crittograficamente le mail outbound dimostrando che vengono
davvero dai server IONOS. Senza DKIM, alzare DMARC manda tutto in spam.

1. Login su [my.ionos.it](https://my.ionos.it) come admin del dominio
2. Menu **E-Mail** → seleziona dominio `hostcomo.com`
3. Tab **Sicurezza** (o "DKIM" diretto se visibile)
4. Cerca il toggle **DKIM** → attivalo
5. IONOS crea automaticamente i record CNAME/TXT necessari nel DNS
6. **Aspetta 24h** poi verifica con:
   ```
   nslookup -type=TXT s1._domainkey.hostcomo.com
   nslookup -type=TXT s2._domainkey.hostcomo.com
   ```
   Dovresti vedere chiavi pubbliche RSA invece di "Non-existent domain".

Se IONOS non ti mostra l'opzione DKIM nel pannello, il tuo piano email
potrebbe non includerlo — chiama il loro supporto e chiedi "abilitare
DKIM signing per il dominio hostcomo.com". È gratis su tutti i piani
business, talvolta sui piani base no.

---

## Step 2 — Alzare DMARC (rollout graduale, no big-bang)

Una volta che DKIM è attivo e verificato, alza DMARC da `p=none` a
`p=quarantine` ma in modo graduale via `pct=25` → osservi una settimana →
`pct=50` → `pct=100`. Così se qualche sorgente outbound non firmava (es.
un service esterno che mandava per nostro conto), te ne accorgi piano e
puoi sistemare prima che diventi un problema.

### Settimana 1 (test soft, 25% delle mail under quarantine):

In IONOS dashboard DNS → record TXT esistente per `_dmarc.hostcomo.com`,
sostituisci il valore con:
```
v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc-reports@hostcomo.com; ruf=mailto:dmarc-reports@hostcomo.com; fo=1
```

Crea anche `dmarc-reports@hostcomo.com` come alias verso comohosting@gmail.com
per ricevere i report aggregati (XML) dei provider — è il modo per scoprire
chi sta inviando per tuo nome.

### Settimana 2 (se report OK): cambia `pct=25` → `pct=50`.

### Settimana 3 (se ancora OK): cambia `pct=50` → `pct=100`.

A regime, il record deve essere:
```
v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@hostcomo.com; ruf=mailto:dmarc-reports@hostcomo.com; fo=1
```

Optional (più sicuro ancora): dopo qualche mese senza problemi puoi salire
a `p=reject;` invece di `p=quarantine;` — le mail unauthenticated vengono
proprio rifiutate invece di finire in spam.

---

## Step 3 — Aggiungere il record BIMI

Solo dopo che DMARC è a `p=quarantine pct=100` (o `p=reject`):

In IONOS dashboard DNS → **aggiungi nuovo record TXT**:

| Campo | Valore |
|---|---|
| Tipo | TXT |
| Nome / Host | `default._bimi` |
| Valore | `v=BIMI1; l=https://hostcomo.com/bimi/logo.svg;` |
| TTL | 3600 (1h) — di default |

Salva. Verifica con:
```
nslookup -type=TXT default._bimi.hostcomo.com
```
Deve restituire la stringa che hai messo.

L'SVG è già live qui:
- File master: [public/bimi/logo.svg](public/bimi/logo.svg)
- URL pubblica: https://hostcomo.com/bimi/logo.svg

Test online con il BIMI Inspector di DigiCert:
https://bimigroup.org/bimi-generator/

Dopo qualche ora, mandando una mail da `info@hostcomo.com` a un account
Gmail, dovresti vedere il logo HLC come avatar al posto del cerchio
con la "I" automatica.

---

## Tempi realistici end-to-end

| Step | Tempo |
|---|---|
| Attivare DKIM in IONOS panel | 5 min click |
| Propagazione DKIM DNS | 24h |
| Settimana 1 DMARC p=quarantine pct=25 + monitor report | 7 giorni |
| Settimana 2 pct=50 | 7 giorni |
| Settimana 3 pct=100 | 7 giorni |
| Aggiungere BIMI record | 5 min |
| Propagazione BIMI + cache Gmail | 24-72h |
| **TOTALE** | ~25-30 giorni per il rollout completo sicuro |

Volendo, puoi anche fare big-bang (skippare la gradualizzazione del DMARC
e andare diretto a `p=quarantine pct=100`) — ma SOLO se sei sicuro al 100%
che TUTTE le sorgenti outbound (IONOS, eventuali Gmail Send-As, Vercel
forms, MailChimp, ecc.) firmino correttamente. La via prudente è graduale.

---

## Cosa NON serve

- VMC (Verified Mark Certificate, ~$1.500/anno DigiCert/Entrust): dà il
  "checkmark blu" verificato di Gmail ma NON è necessario per mostrare
  l'avatar. BIMI base senza VMC funziona già su Gmail/Yahoo/Apple.
- Cambiare provider mail (IONOS è OK).
- Migrazione a Google Workspace.
