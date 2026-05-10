import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Proprietà in Gestione sul Lago di Como — Como Host",
    description:
      "Le case che gestiamo per i nostri proprietari: Como città, Primo Bacino, Alto Lago. Esempi di hosting professionale.",
  },
  en: {
    title: "Properties Under Management on Lake Como — Host Como",
    description:
      "The homes we manage for our owners: Como city, First Basin, Upper Lake. Examples of professional hosting.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale] ?? COPY.it;
  return buildMetadata({
    locale,
    pathname: "/properties",
    title: copy.title,
    description: copy.description,
  });
}

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
