import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { pickLocalized } from "@/lib/i18n-data";
import propertiesData from "@/data/properties.json";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = (propertiesData as Array<Record<string, unknown>>).find(
    (p) => p.slug === slug,
  );

  if (!property) {
    return buildMetadata({
      locale,
      pathname: `/properties/${slug}`,
      title: locale === "en" ? "Property not found" : "Proprietà non trovata",
      description: "",
      noIndex: true,
    });
  }

  const name = (property.name as string) ?? "";
  const description =
    pickLocalized<string>(property, "description", locale) ?? "";
  const address = property.address as { city?: string } | undefined;
  const city = address?.city ?? "Como";

  const titleSuffix = locale === "en" ? "Lake Como" : "Lago di Como";
  const inWord = locale === "en" ? "in" : "a";
  const brand = locale === "en" ? "Host Como" : "Como Host";
  const title = `${name} ${inWord} ${city} — ${titleSuffix} | ${brand}`;
  const trimmedDesc =
    description.length > 155
      ? `${description.slice(0, 152)}...`
      : description;

  // First property image as OG (if available)
  const images = property.images as Array<{ url: string }> | undefined;
  const ogImage = images?.[0]?.url;

  if (!property.slug) notFound();

  return buildMetadata({
    locale,
    pathname: `/properties/${slug}`,
    title,
    description: trimmedDesc,
    ogImage,
  });
}

export default function PropertySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
