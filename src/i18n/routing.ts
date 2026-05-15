import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["it", "en", "ru"],
  defaultLocale: "it",
  localePrefix: "as-needed",
  // With `as-needed`, the middleware would otherwise re-read the NEXT_LOCALE
  // cookie / Accept-Language header on each request and redirect back to the
  // last-visited locale, even after the user explicitly clicked IT. Disabling
  // detection makes the language toggle the single source of truth.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
