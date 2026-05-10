import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Generatore Nome Proprietà Airbnb — Tool per Host",
    description:
      "Genera in pochi secondi un nome efficace per il tuo annuncio Airbnb sul Lago di Como. Strumento riservato ai proprietari in gestione con Como Host.",
  },
  en: {
    title: "Airbnb Property Name Generator — Host Tool",
    description:
      "Generate an effective listing name for your Lake Como Airbnb in seconds. Reserved for owners managed by Host Como.",
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
    pathname: "/strumenti/nome-proprieta",
    title: copy.title,
    description: copy.description,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
