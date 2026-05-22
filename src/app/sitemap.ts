import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import propertiesData from "@/data/properties.json";
import comuniData from "@/data/comuni.json";
import guidesData from "@/data/guides.json";

type PropertyImage = { url: string; alt?: string };
type PropertyShape = { slug: string; images?: PropertyImage[]; demo?: boolean };

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/services", priority: 0.95, changeFrequency: "monthly" },
  { path: "/properties", priority: 0.9, changeFrequency: "weekly" },
  { path: "/property-management", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.85, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.85, changeFrequency: "yearly" },
  { path: "/strumenti", priority: 0.8, changeFrequency: "monthly" },
  { path: "/strumenti/rendita", priority: 0.75, changeFrequency: "monthly" },
  { path: "/strumenti/investimento", priority: 0.75, changeFrequency: "monthly" },
  { path: "/strumenti/profit-diretto", priority: 0.75, changeFrequency: "monthly" },
];

function localizedUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  if (locale === routing.defaultLocale) return `${SITE_URL}${clean || ""}`;
  return `${SITE_URL}/${locale}${clean}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified,
        changeFrequency,
        priority,
      });
    }
  }

  for (const comune of comuniData as { slug: string }[]) {
    const path = `/property-management/${comune.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  for (const guide of guidesData as { slug: string; lastUpdated: string }[]) {
    const path = `/guide/${guide.slug}`;
    const updated = new Date(guide.lastUpdated);
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified: updated,
        changeFrequency: "yearly",
        priority: 0.75,
      });
    }
  }

  for (const property of propertiesData as PropertyShape[]) {
    // Skip demo/preview-only listings — they should not be indexed
    if (property.demo) continue;
    const path = `/properties/${property.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  return entries;
}
