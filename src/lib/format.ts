// Helper di formattazione numerica condivisi.
// Locale-aware: in IT separatore migliaia è il punto, in EN la virgola, in RU lo spazio.

type Locale = "it" | "en" | "ru";

export function intlLocale(locale?: string): string {
  if (locale === "en") return "en-GB";
  if (locale === "ru") return "ru-RU";
  return "it-IT";
}

const resolveLocale = intlLocale;

export function formatEuro(
  amount: number,
  decimals = 0,
  locale?: Locale,
): string {
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: "always",
  }).format(amount);
}

export function formatInteger(value: number, locale?: Locale): string {
  return new Intl.NumberFormat(resolveLocale(locale), {
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(value);
}
