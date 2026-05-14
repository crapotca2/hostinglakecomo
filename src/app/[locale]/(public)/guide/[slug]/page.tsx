import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata, brandName, SITE_URL } from "@/lib/seo";
import guides from "@/data/guides.json";
import { routing, type Locale } from "@/i18n/routing";
import { JsonLdBreadcrumb } from "@/components/seo/jsonld-breadcrumb";

type Guide = (typeof guides)[number];
type Section = {
  h: string;
  p: string[];
  cta?: { label: string; href: string };
};

function getGuide(slug: string): Guide | undefined {
  return (guides as Guide[]).find((g) => g.slug === slug);
}

function pickStr(g: Guide, field: string, locale: string): string {
  const map = g as unknown as Record<string, string>;
  if (locale === "en") return map[`${field}_en`] ?? map[`${field}_it`] ?? "";
  return map[`${field}_it`] ?? map[`${field}_en`] ?? "";
}

function pickBody(g: Guide, locale: string): Section[] {
  const map = g as unknown as Record<string, Section[]>;
  if (locale === "en") return map.body_en ?? map.body_it ?? [];
  return map.body_it ?? map.body_en ?? [];
}

export function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const g of guides as Guide[]) {
      params.push({ locale, slug: g.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = getGuide(slug);
  if (!g) {
    return buildMetadata({
      locale,
      pathname: `/guide/${slug}`,
      title: locale === "en" ? "Not found" : "Non trovato",
      description: "",
      noIndex: true,
    });
  }
  return buildMetadata({
    locale,
    pathname: `/guide/${slug}`,
    title: pickStr(g, "title", locale),
    description: pickStr(g, "description", locale),
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  return <GuideContent guide={g} locale={locale} />;
}

function GuideContent({ guide, locale }: { guide: Guide; locale: Locale }) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const title = pickStr(guide, "title", locale);
  const description = pickStr(guide, "description", locale);
  const category = pickStr(guide, "category", locale);
  const body = pickBody(guide, locale);

  const breadcrumbs = [
    { name: tNav("home"), path: "/" },
    {
      name: locale === "en" ? "Property management" : "Property Management",
      path: "/property-management",
    },
    { name: title, path: `/guide/${guide.slug}` },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: locale === "en" ? "en-US" : "it-IT",
    datePublished: guide.lastUpdated,
    dateModified: guide.lastUpdated,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}${locale === "it" ? "" : `/${locale}`}/guide/${guide.slug}`,
  };

  const readingLabel = locale === "en" ? "min read" : "min di lettura";
  const updatedLabel = locale === "en" ? "Updated" : "Aggiornato il";
  const ctaTitle =
    locale === "en"
      ? "Want this handled for you?"
      : "Vuoi che ce ne occupiamo noi?";
  const ctaBody =
    locale === "en"
      ? "We handle compliance, channels and pricing end-to-end. A single conversation to see if it's a fit. No commitment."
      : "Ci occupiamo end-to-end di compliance, canali e pricing. Una conversazione per capire se siamo l'interlocutore giusto. Nessun impegno.";

  return (
    <div className="pt-20">
      <JsonLdBreadcrumb items={breadcrumbs} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section className="relative overflow-hidden bg-[#1D3A62] text-white border-b border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.webp')] bg-cover bg-center pointer-events-none"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-white/70 mb-5"
          >
            <Link href="/" className="hover:text-white transition-colors">
              {tNav("home")}
            </Link>
            <span className="opacity-60">/</span>
            <Link
              href="/property-management"
              className="hover:text-white transition-colors"
            >
              {locale === "en" ? "Property management" : "Property Management"}
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-xs text-white/75 mb-3">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {category}
            </span>
            <span className="opacity-60">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {guide.readingMinutes} {readingLabel}
            </span>
            <span className="opacity-60">·</span>
            <span>
              {updatedLabel} {guide.lastUpdated}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight mb-4 text-white">
            {title}
          </h1>
          <p className="text-white/85 text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {body.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-semibold leading-snug">
                {section.h}
              </h2>
              {section.p.map((para, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-muted-foreground"
                >
                  {para}
                </p>
              ))}
              {section.cta && (
                <div className="pt-2">
                  <Link
                    href={section.cta.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D3A62] text-white text-sm font-semibold hover:bg-[#1D3A62]/90 transition-colors"
                  >
                    {section.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          ))}
        </div>
      </article>

      <section className="py-16 bg-white border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light mb-3 text-foreground">
            <span className="font-semibold">{ctaTitle}</span>
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">{ctaBody}</p>
          <Link
            href={`/contact?interest=gestione&from=guide-${guide.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D3A62] text-white text-sm font-semibold hover:bg-[#1D3A62]/90 transition-colors"
          >
            {tCommon("requestConsultation")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="text-xs text-muted-foreground/80 mt-6 max-w-md mx-auto">
            {brandName(locale)} · {locale === "en" ? "Lake Como" : "Lago di Como"}
          </div>
        </div>
      </section>
    </div>
  );
}
