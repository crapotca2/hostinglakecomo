import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata } from "@/lib/seo";
import comuni from "@/data/comuni.json";
import type { Locale } from "@/i18n/routing";

type Comune = (typeof comuni)[number];

function pickStr(c: Comune, field: string, locale: string): string {
  const map = c as unknown as Record<string, string>;
  if (locale === "en") return map[`${field}_en`] ?? map[`${field}_it`] ?? "";
  return map[`${field}_it`] ?? map[`${field}_en`] ?? "";
}

const INDEX_COPY = {
  it: {
    title: "Property Management Lago di Como — Comuni e Zone",
    description:
      "Property management e gestione affitti brevi su tutto il Lago di Como: Bellagio, Menaggio, Varenna, Como, Tremezzo. Strategia multi-canale calibrata sulla specificità di ogni zona.",
  },
  en: {
    title: "Lake Como Property Management — Towns and Areas",
    description:
      "Property management and short-term rental management across Lake Como: Bellagio, Menaggio, Varenna, Como, Tremezzo. Multi-channel strategy tailored to each area.",
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
    pathname: "/property-management",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PropertyManagementIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PropertyManagementIndexContent locale={locale} />;
}

function PropertyManagementIndexContent({ locale }: { locale: Locale }) {
  const tCommon = useTranslations("common");
  const items = comuni as Comune[];

  const heroTitle =
    locale === "en"
      ? "Property management across Lake Como"
      : "Property management su tutto il Lago";
  const heroSubtitle =
    locale === "en"
      ? "Five hand-picked towns where we operate. Each has its own market dynamics — we tune the strategy accordingly."
      : "Cinque zone selezionate del Lago dove operiamo direttamente. Ogni comune ha dinamiche di mercato proprie — la strategia si calibra di conseguenza.";
  const discoverLabel =
    locale === "en" ? "Discover the area" : "Scopri la zona";

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((c) => {
              const tagline = pickStr(c, "tagline", locale);
              return (
                <Link
                  key={c.slug}
                  href={`/property-management/${c.slug}`}
                  className="group block bg-white rounded-2xl p-6 border border-border/50 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {locale === "en" ? "Lake Como" : "Lago di Como"}
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {c.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {tagline}.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {discoverLabel}
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
