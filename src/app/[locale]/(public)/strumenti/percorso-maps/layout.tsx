import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Percorso Google Maps per Ospiti — Tool per Host",
    description:
      "Genera un link Google Maps curato per gli ospiti: coordinate, waypoint visivi, indicazioni parcheggio. Riservato ai proprietari in gestione con Como Host.",
  },
  en: {
    title: "Google Maps Route Builder for Guests — Host Tool",
    description:
      "Generate a curated Google Maps link for guests: coordinates, visual waypoints, parking guidance. Reserved for owners managed by Host Como.",
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
    pathname: "/strumenti/percorso-maps",
    title: copy.title,
    description: copy.description,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
