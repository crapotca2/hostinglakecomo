import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Welcome Letter Multilingua per Ospiti — Tool per Host",
    description:
      "Genera una welcome letter firmata e tradotta in 4 lingue per i tuoi ospiti. Riservato ai proprietari in gestione con Como Host.",
  },
  en: {
    title: "Multilingual Welcome Letter Generator — Host Tool",
    description:
      "Generate a signed welcome letter translated into 4 languages for your guests. Reserved for owners managed by Host Como.",
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
    pathname: "/strumenti/welcome-letter",
    title: copy.title,
    description: copy.description,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
