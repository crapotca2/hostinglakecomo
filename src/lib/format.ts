// Helper di formattazione numerica condivisi.
// Locale-aware: in IT separatore migliaia è il punto, in EN la virgola.

type Locale = "it" | "en";

function resolveLocale(locale?: Locale): string {
  return locale === "en" ? "en-GB" : "it-IT";
}

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
