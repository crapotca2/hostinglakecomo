import type {
  SupportedLocale,
  LocalizedText,
  LocalizedTextOptional,
} from "@/types/database";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["it", "en", "ru", "de", "pl", "es", "fr"];
export const DEFAULT_LOCALE: SupportedLocale = "it";

export function isSupportedLocale(s: unknown): s is SupportedLocale {
  return typeof s === "string" && (SUPPORTED_LOCALES as string[]).includes(s);
}

export function pickLocalized(
  text: LocalizedText | LocalizedTextOptional | undefined | null,
  locale: SupportedLocale,
  fallback: SupportedLocale = DEFAULT_LOCALE,
): string {
  if (!text) return "";
  const direct = text[locale];
  if (typeof direct === "string" && direct.trim().length > 0) return direct;
  const fb = text[fallback];
  if (typeof fb === "string" && fb.trim().length > 0) return fb;
  for (const l of SUPPORTED_LOCALES) {
    const v = text[l];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return "";
}

export function pickLocalizedArray(
  arr: Array<LocalizedText | LocalizedTextOptional> | undefined | null,
  locale: SupportedLocale,
  fallback: SupportedLocale = DEFAULT_LOCALE,
): string[] {
  if (!arr) return [];
  return arr.map((t) => pickLocalized(t, locale, fallback)).filter((s) => s.length > 0);
}

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  it: "Italiano",
  en: "English",
  ru: "Русский",
  de: "Deutsch",
  pl: "Polski",
  es: "Español",
  fr: "Français",
};

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
  ru: "🇷🇺",
  de: "🇩🇪",
  pl: "🇵🇱",
  es: "🇪🇸",
  fr: "🇫🇷",
};
