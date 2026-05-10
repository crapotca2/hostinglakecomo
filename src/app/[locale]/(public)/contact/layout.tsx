import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Contattaci — Affida la tua casa a Como Host",
    description:
      "Richiedi una consulenza gratuita: valutiamo il potenziale di rendita della tua casa sul Lago di Como.",
  },
  en: {
    title: "Contact Us — Trust Host Como with Your Property",
    description:
      "Request a free consultation: we'll assess the rental potential of your home on Lake Como.",
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
    pathname: "/contact",
    title: copy.title,
    description: copy.description,
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
