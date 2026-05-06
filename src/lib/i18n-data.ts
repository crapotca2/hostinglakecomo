/**
 * Helpers to read locale-aware fields from data files (team.json, properties.json).
 *
 * Convention: alongside an Italian field `foo`, an English variant lives at
 * `foo_en`. For locales other than `en` we always return the base field.
 * For `en` we prefer `foo_en` and fall back to `foo` if the EN variant is
 * missing or empty.
 */

export type SupportedLocale = "it" | "en";

/**
 * Picks the localised value of `field` from `obj`. For `en` locale, looks for
 * `${field}_en`; otherwise returns `obj[field]`. Falls back to the base field
 * if the EN variant is missing or an empty string/array.
 */
export function pickLocalized<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  field: string,
  locale: string,
): T | undefined {
  if (!obj) return undefined;
  const base = obj[field] as T | undefined;
  if (locale !== "en") return base;
  const en = obj[`${field}_en`] as T | undefined;
  if (en === undefined || en === null) return base;
  if (typeof en === "string" && en.trim() === "") return base;
  if (Array.isArray(en) && en.length === 0) return base;
  return en;
}
