import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Calcolo Rendita Airbnb Como — Simulatore Gratuito",
    description:
      "Calcola in 30 secondi quanto può rendere la tua casa sul Lago di Como con Airbnb. Stima ricavi annui basata su zona, mq, ospiti.",
  },
  en: {
    title: "Lake Como Airbnb Rental Yield Calculator — Free Tool",
    description:
      "Calculate in 30 seconds how much your home on Lake Como can earn on Airbnb. Annual revenue estimate by zone, sqm, guests.",
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
    pathname: "/strumenti/rendita",
    title: copy.title,
    description: copy.description,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
