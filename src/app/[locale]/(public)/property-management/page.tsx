import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata } from "@/lib/seo";
import comuni from "@/data/comuni.json";
import { ComoAreaMap } from "@/components/public/como-area-map";
import type { Locale } from "@/i18n/routing";

type Comune = (typeof comuni)[number];

const NON_LAKE_SLUGS = new Set(["cantu", "erba"]);

function pickStr(c: Comune, field: string, locale: string): string {
  const map = c as unknown as Record<string, string>;
  if (locale === "en") return map[`${field}_en`] ?? map[`${field}_it`] ?? "";
  return map[`${field}_it`] ?? map[`${field}_en`] ?? "";
}

const INDEX_COPY = {
  it: {
    title: "Property Management Lago di Como e Provincia — Comuni e Zone",
    description:
      "Property management e gestione affitti brevi sul Lago di Como e in provincia di Como. Bellagio, Menaggio, Varenna, Tremezzo, Cernobbio, Lecco, Cantù, Erba e altri comuni. Strategia multi-canale calibrata zona per zona.",
  },
  en: {
    title: "Lake Como & Como Province Property Management — Towns and Areas",
    description:
      "Property management and short-term rental management on Lake Como and across Como province. Bellagio, Menaggio, Varenna, Tremezzo, Cernobbio, Lecco, Cantù, Erba and more. Multi-channel strategy tuned area by area.",
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
  const lakeItems = items.filter((c) => !NON_LAKE_SLUGS.has(c.slug));
  const provinceItems = items.filter((c) => NON_LAKE_SLUGS.has(c.slug));

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20 border-b border-border/50 bg-gradient-to-b from-primary/[0.04] via-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("hero.eyebrow")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            {t("hero.title1")}{" "}
            <span className="font-semibold">{t("hero.title1Strong")}</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-light mb-3">
              <span className="font-semibold">{t("map.title")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("map.subtitle")}
            </p>
          </div>
          <ComoAreaMap
            comuni={items.map((c) => ({
              slug: c.slug,
              name: c.name,
              geo: c.geo,
            }))}
            locale={locale}
          />
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#1D3A62] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light mb-4">
            <span className="font-semibold">{t("province.title")}</span>
          </h2>
          <p className="text-white/85 leading-relaxed">{t("province.body")}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-light mb-3">
              <span className="font-semibold">{t("areas.title")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("areas.subtitle")}
            </p>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            {t("areas.lakeBadge")}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {lakeItems.map((c) => (
              <ComuneCard
                key={c.slug}
                comune={c}
                locale={locale}
                badge={t("areas.lakeBadge")}
                discoverLabel={t("areas.discoverLabel")}
              />
            ))}
          </div>

          {provinceItems.length > 0 && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                {t("areas.provinceBadge")}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {provinceItems.map((c) => (
                  <ComuneCard
                    key={c.slug}
                    comune={c}
                    locale={locale}
                    badge={t("areas.provinceBadge")}
                    discoverLabel={t("areas.discoverLabel")}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
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
      className="group block bg-white rounded-2xl p-6 border border-border/50 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-3">
        <MapPin className="h-3.5 w-3.5" />
        {badge}
      </div>
      <h4 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
        {comune.name}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {tagline}.
      </p>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        {discoverLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
