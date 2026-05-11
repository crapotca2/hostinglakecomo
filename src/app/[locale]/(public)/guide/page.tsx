import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata } from "@/lib/seo";
import guides from "@/data/guides.json";
import type { Locale } from "@/i18n/routing";

type Guide = (typeof guides)[number];

function pickStr(g: Guide, field: string, locale: string): string {
  const map = g as unknown as Record<string, string>;
  if (locale === "en") return map[`${field}_en`] ?? map[`${field}_it`] ?? "";
  return map[`${field}_it`] ?? map[`${field}_en`] ?? "";
}

const INDEX_COPY = {
  it: {
    title: "Guide e approfondimenti — Lago di Como",
    description:
      "Articoli pratici per proprietari di immobili sul Lago di Como: compliance CIR/CIN, rendimento affitti brevi, gestione canali, esperienza ospite.",
  },
  en: {
    title: "Guides and insights — Lake Como",
    description:
      "Practical articles for property owners on Lake Como: CIR/CIN compliance, short-term rental yield, channel management, guest experience.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = INDEX_COPY[locale] ?? INDEX_COPY.it;
  return buildMetadata({
    locale,
    pathname: "/guide",
    title: copy.title,
    description: copy.description,
  });
}

export default async function GuideIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <GuideIndexContent locale={locale} />;
}

function GuideIndexContent({ locale }: { locale: Locale }) {
  const tCommon = useTranslations("common");
  const items = guides as Guide[];

  const heroTitle =
    locale === "en" ? "Guides and insights" : "Guide e approfondimenti";
  const heroSubtitle =
    locale === "en"
      ? "What we explain to property owners before they sign with us."
      : "Quello che spieghiamo ai proprietari prima che ci affidino la gestione.";
  const readingLabel = locale === "en" ? "min read" : "min di lettura";
  const readMoreLabel = locale === "en" ? "Read the guide" : "Leggi la guida";

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20 border-b border-border/50 bg-gradient-to-b from-primary/[0.04] via-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {tCommon("discoverMore")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            <span className="font-semibold">{heroTitle}</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((g) => {
              const title = pickStr(g, "title", locale);
              const description = pickStr(g, "description", locale);
              const category = pickStr(g, "category", locale);
              return (
                <Link
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  className="group block bg-white rounded-2xl p-6 sm:p-7 border border-border/50 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {category}
                    </span>
                    <span className="opacity-60">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {g.readingMinutes} {readingLabel}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 leading-snug group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {readMoreLabel}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
