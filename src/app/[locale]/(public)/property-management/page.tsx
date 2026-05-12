import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight, MapPin, Clock, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata } from "@/lib/seo";
import comuni from "@/data/comuni.json";
import guides from "@/data/guides.json";
import { ComoLakeMap } from "@/components/public/como-lake-map";
import type { Locale } from "@/i18n/routing";

type Comune = (typeof comuni)[number];
type Guide = (typeof guides)[number];

function pickStr(c: Comune | Guide, field: string, locale: string): string {
  const map = c as unknown as Record<string, string>;
  if (locale === "en") return map[`${field}_en`] ?? map[`${field}_it`] ?? "";
  return map[`${field}_it`] ?? map[`${field}_en`] ?? "";
}

const INDEX_COPY = {
  it: {
    title: "Property Management Lago di Como — Comuni e Zone",
    description:
      "Property management e gestione affitti brevi sul Lago di Como: Bellagio, Menaggio, Varenna, Como, Tremezzo, Cernobbio, Lecco e altri comuni. Strategia multi-canale calibrata zona per zona.",
  },
  en: {
    title: "Lake Como Property Management — Towns and Areas",
    description:
      "Property management and short-term rental management across Lake Como: Bellagio, Menaggio, Varenna, Como, Tremezzo, Cernobbio, Lecco and more. Multi-channel strategy tuned area by area.",
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
  const t = useTranslations("pmPublic");
  const items = comuni as Comune[];

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20 border-b border-border/50 bg-gradient-to-b from-primary/[0.04] via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("hero.eyebrow")}
              </span>
              <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
                {t("hero.title1")}{" "}
                <span className="font-semibold">{t("hero.title1Strong")}</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <p className="text-sm text-muted-foreground/80 mt-4 leading-relaxed">
                {t("map.subtitle")}
              </p>
            </div>
            <div>
              <ComoLakeMap
                comuni={items.map((c) => ({
                  slug: c.slug,
                  name: c.name,
                  geo: c.geo,
                  tagline: pickStr(c, "tagline", locale),
                }))}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-light mb-3">
              <span className="font-semibold">{t("areas.title")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("areas.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {items.map((c) => (
              <ComuneCard
                key={c.slug}
                comune={c}
                locale={locale}
                badge={t("areas.lakeBadge")}
                discoverLabel={t("areas.discoverLabel")}
              />
            ))}
          </div>
        </div>
      </section>

      <GuidesSection locale={locale} />
    </div>
  );
}

function GuidesSection({ locale }: { locale: string }) {
  const items = guides as Guide[];
  const eyebrow =
    locale === "en" ? "Guides for owners" : "Guide per proprietari";
  const title =
    locale === "en"
      ? "What we explain before signing"
      : "Quello che spieghiamo prima di firmare";
  const subtitle =
    locale === "en"
      ? "Compliance, yield, channels — the topics that matter most before entrusting a property."
      : "Compliance, rendimento, canali — i temi che contano di più prima di affidarci una proprietà.";
  const readingLabel = locale === "en" ? "min read" : "min di lettura";
  const readMoreLabel = locale === "en" ? "Read the guide" : "Leggi la guida";

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl font-light mt-3 mb-3">
            <span className="font-semibold">{title}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((g) => {
            const guideTitle = pickStr(g, "title", locale);
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
                <h3 className="text-lg sm:text-xl font-semibold mb-3 leading-snug group-hover:text-primary transition-colors">
                  {guideTitle}
                </h3>
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
  );
}

function ComuneCard({
  comune,
  locale,
  badge,
  discoverLabel,
}: {
  comune: Comune;
  locale: string;
  badge: string;
  discoverLabel: string;
}) {
  const tagline = pickStr(comune, "tagline", locale);
  return (
    <Link
      href={`/property-management/${comune.slug}`}
      className="group relative block bg-[#1D3A62] rounded-2xl p-6 border border-white/10 hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
      />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {badge}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">
          {comune.name}
        </h3>
        <p className="text-sm text-white/75 leading-relaxed mb-5">
          {tagline}.
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
          {discoverLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
