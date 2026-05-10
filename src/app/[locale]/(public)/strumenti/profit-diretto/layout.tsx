import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Calcolo Profitto Netto Airbnb — Costi e Margini",
    description:
      "Quanto ti resta in tasca dopo OTA, pulizie, tasse e gestione. Calcolatore trasparente per proprietari sul Lago di Como.",
  },
  en: {
    title: "Airbnb Net Profit Calculator — Costs and Margins",
    description:
      "How much you keep after OTA fees, cleaning, taxes and management. Transparent calculator for owners on Lake Como.",
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
    pathname: "/strumenti/profit-diretto",
    title: copy.title,
    description: copy.description,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
