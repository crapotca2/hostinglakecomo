import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hostcomo.com";

// Canonical legal name (used in JSON-LD Organization @name + sameAs).
export const BRAND_NAME = "Host Como";

// Display name shown in UI/title varies by locale.
// Italian visitors see "Como Host" (italian word order), English visitors see "Host Como".
const BRAND_NAMES: Record<string, string> = {
  it: "Como Host",
  en: "Host Como",
};

export function brandName(locale: string): string {
  return BRAND_NAMES[locale] ?? BRAND_NAME;
}

export const DEFAULT_OG_IMAGE = "/images/como-lake-boat-2048x1366.jpg";

function localePath(locale: Locale, pathname: string): string {
  const clean = pathname === "/" ? "" : pathname;
  if (locale === routing.defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

function absoluteUrl(locale: Locale, pathname: string): string {
  const path = localePath(locale, pathname);
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

type BuildMetadataInput = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  locale,
  pathname,
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(locale, pathname);

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absoluteUrl(l, pathname);
  }
  languages["x-default"] = absoluteUrl(routing.defaultLocale, pathname);

  const ogLocale = locale === "it" ? "it_IT" : "en_US";
  const alternateLocales = routing.locales
    .filter((l) => l !== locale)
    .map((l) => (l === "it" ? "it_IT" : "en_US"));

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: brandName(locale),
      title,
      description,
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
      ],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
