/** Bandiera emoji da codice ISO-3166 alpha-2 (es. "FR" → 🇫🇷). */
export function flagEmoji(code?: string | null): string {
  if (!code) return "";
  const cc = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const base = 0x1f1e6 - 65;
  return String.fromCodePoint(base + cc.charCodeAt(0), base + cc.charCodeAt(1));
}

const NAMES_IT: Record<string, string> = {
  IT: "Italia", US: "Stati Uniti", DE: "Germania", FR: "Francia",
  PL: "Polonia", DK: "Danimarca", GB: "Regno Unito", NL: "Paesi Bassi",
  CH: "Svizzera", ES: "Spagna", PT: "Portogallo", BE: "Belgio",
  AT: "Austria", SE: "Svezia", NO: "Norvegia", FI: "Finlandia",
  IE: "Irlanda", CZ: "Cechia", RU: "Russia", CA: "Canada",
  AU: "Australia", BR: "Brasile", CN: "Cina", JP: "Giappone",
};

/** Nome del paese in italiano da codice ISO alpha-2. */
export function countryName(code?: string | null): string {
  if (!code) return "";
  const cc = code.trim().toUpperCase();
  return NAMES_IT[cc] || cc;
}

/** "🇫🇷 Francia" (o solo il codice se sconosciuto). */
export function flagWithName(code?: string | null): string {
  if (!code) return "";
  const f = flagEmoji(code);
  const n = countryName(code);
  return f ? `${f} ${n}` : n;
}
