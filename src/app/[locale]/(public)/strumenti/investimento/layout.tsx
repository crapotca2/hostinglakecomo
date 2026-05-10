import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Simulatore Investimento Immobiliare Como — Cap Rate",
    description:
      "Stima cap rate, cash-on-cash return e payback period su un immobile da affitto breve sul Lago di Como.",
  },
  en: {
    title: "Lake Como Property Investment Simulator — Cap Rate",
    description:
      "Estimate cap rate, cash-on-cash return and payback period for a short-term rental property on Lake Como.",
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
    pathname: "/strumenti/investimento",
    title: copy.title,
    description: copy.description,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
