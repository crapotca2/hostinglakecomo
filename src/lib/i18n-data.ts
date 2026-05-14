/**
 * Helpers to read locale-aware fields from data files (team.json, properties.json).
 *
 * Convention: alongside an Italian field `foo`, locale variants live at
 * `foo_<locale>` (e.g. `foo_en`, `foo_ru`). For `it` we always return the
 * base field. For other locales we prefer the suffixed variant and fall back
 * to the base field if the variant is missing or empty.
 */

export type SupportedLocale = "it" | "en" | "ru";

/**
 * Picks the localised value of `field` from `obj`. For non-IT locales looks
 * for `${field}_${locale}`; otherwise returns `obj[field]`. Falls back to the
 * base field if the localised variant is missing or empty.
 */
export function pickLocalized<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  field: string,
  locale: string,
): T | undefined {
  if (!obj) return undefined;
  const base = obj[field] as T | undefined;
  if (locale === "it") return base;
  const localized = obj[`${field}_${locale}`] as T | undefined;
  if (localized === undefined || localized === null) return base;
  if (typeof localized === "string" && localized.trim() === "") return base;
  if (Array.isArray(localized) && localized.length === 0) return base;
  return localized;
}
