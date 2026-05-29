# BIMI logo per hostcomo.com

Il file [logo.svg](./logo.svg) è il logo BIMI di Host Como, servito da
`https://hostcomo.com/bimi/logo.svg`. Viene letto da Gmail/Yahoo/Apple Mail
per mostrare l'avatar del brand accanto alle email mandate da
`*@hostcomo.com`.

## Spec rispettata

- SVG Tiny 1.2 PS (Profile Specification) — l'unico subset accettato da BIMI
- `version="1.2"` + `baseProfile="tiny-ps"` obbligatori
- Quadrato 512×512 (viewBox)
- Background pieno (no trasparenza)
- `<title>` obbligatorio
- Niente `<script>`, niente external references, niente `<image>` con URL

## Limitazione attuale

Il monogramma "HLC" è renderizzato come `<text font-family="sans-serif">`.
Funziona per BIMI base ma per Verified Mark Certificate (VMC, il "checkmark
blu" verificato di Gmail, ~$1.500/anno DigiCert) i validator richiedono
glifi convertiti in `<path>`. Per upgrade VMC futuro: aprire il file in
Inkscape o Illustrator → "Path > Object to Path" → salvare.
