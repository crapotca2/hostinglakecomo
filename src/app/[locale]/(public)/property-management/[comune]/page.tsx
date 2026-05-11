import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowRight, MapPin, CheckCircle2, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata, brandName, SITE_URL } from "@/lib/seo";
import comuni from "@/data/comuni.json";
import { routing, type Locale } from "@/i18n/routing";
import { JsonLdBreadcrumb } from "@/components/seo/jsonld-breadcrumb";
import { GoogleMapEmbed } from "@/components/public/google-map-embed";

type Comune = (typeof comuni)[number];

function getComune(slug: string): Comune | undefined {
  return (comuni as Comune[]).find((c) => c.slug === slug);
}

function pickLocalized<K extends string>(
  c: Comune,
  field: K,
  locale: string,
): string {
  const enKey = `${field}_en` as keyof Comune;
  const itKey = `${field}_it` as keyof Comune;
  if (locale === "en") {
    return ((c[enKey] as string) ?? (c[itKey] as string)) || "";
  }
  return ((c[itKey] as string) ?? (c[enKey] as string)) || "";
}

function pickLocalizedArray(
  c: Comune,
  field: string,
  locale: string,
): string[] {
  const en = (c as unknown as Record<string, string[]>)[`${field}_en`];
  const it = (c as unknown as Record<string, string[]>)[`${field}_it`];
  if (locale === "en") return en ?? it ?? [];
  return it ?? en ?? [];
}

export function generateStaticParams() {
  const params: { locale: Locale; comune: string }[] = [];
  for (const locale of routing.locales) {
    for (const c of comuni as Comune[]) {
      params.push({ locale, comune: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; comune: string }>;
}): Promise<Metadata> {
  const { locale, comune: slug } = await params;
  const c = getComune(slug);
  if (!c) {
    return buildMetadata({
      locale,
      pathname: `/property-management/${slug}`,
      title: locale === "en" ? "Not found" : "Non trovato",
      description: "",
      noIndex: true,
    });
  }
  const brand = brandName(locale);
  const title =
    locale === "en"
      ? `${c.name} Property Management — Lake Como Short-Term Rentals | ${brand}`
      : `Property Management ${c.name} — Gestione Affitti Brevi Lago di Como | ${brand}`;
  const description =
    locale === "en"
      ? `Property management and short-term rental management in ${c.name} on Lake Como. Airbnb, Booking, Expedia plus long-stay channels. 9 years of direct experience.`
      : `Property management e gestione affitti brevi a ${c.name} sul Lago di Como. Airbnb, Booking, Expedia e canali long-stay. 9 anni di esperienza diretta sul lago.`;
  return buildMetadata({
    locale,
    pathname: `/property-management/${slug}`,
    title,
    description,
  });
}

export default async function ComuneLandingPage({
  params,
}: {
  params: Promise<{ locale: Locale; comune: string }>;
}) {
  const { locale, comune: slug } = await params;
  const c = getComune(slug);
  if (!c) notFound();

  return <ComuneLandingClient comune={c} locale={locale} />;
}

function ComuneLandingClient({
  comune,
  locale,
}: {
  comune: Comune;
  locale: Locale;
}) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const pillars =
    locale === "en"
      ? [
          "Primary channels Airbnb · Booking · Expedia",
          "Long-stay channels for low season",
          "Dynamic pricing area by area",
        ]
      : [
          "Canali primari Airbnb · Booking · Expedia",
          "Canali long-stay per la bassa stagione",
          "Pricing dinamico zona per zona",
        ];

  const tagline = pickLocalized(comune, "tagline", locale);
  const introParagraphs = pickLocalizedArray(comune, "intro", locale);
  const highlights = pickLocalizedArray(comune, "highlights", locale);

  const breadcrumbs = [
    { name: tNav("home"), path: "/" },
    {
      name: locale === "en" ? "Property management" : "Property Management",
      path: "/property-management",
    },
    { name: comune.name, path: `/property-management/${comune.slug}` },
  ];

  const titlePrefix =
    locale === "en" ? "Property management in" : "Property management a";
  const subtitleSuffix =
    locale === "en"
      ? "on Lake Como, end-to-end."
      : "sul Lago di Como, chiavi in mano.";
  const ctaLabel =
    locale === "en" ? "Request a consultation" : "Richiedi una consulenza";
  const sectionWhyHere =
    locale === "en" ? "Why this area" : "Perché questa zona";
  const sectionApproach =
    locale === "en" ? "Our approach here" : "Il nostro approccio";
  const sectionApproachBody =
    locale === "en"
      ? `Multi-channel distribution on Airbnb, Booking and Expedia for tourist bookings, plus long-stay channels for medium-term lets — a 365-day strategy calibrated on the specifics of ${comune.name}.`
      : `Distribuzione multi-canale su Airbnb, Booking ed Expedia per le prenotazioni turistiche, e canali long-stay per le locazioni medio-lunghe — una strategia 365 giorni calibrata sulle specificità di ${comune.name}.`;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/property-management/${comune.slug}#localbusiness`,
    name: `${brandName(locale)} — ${comune.name}`,
    url: `${SITE_URL}${locale === "it" ? "" : `/${locale}`}/property-management/${comune.slug}`,
    areaServed: {
      "@type": "Place",
      name: comune.name,
      geo: {
        "@type": "GeoCoordinates",
        latitude: comune.geo.lat,
        longitude: comune.geo.lng,
      },
    },
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <div className="pt-20">
      <JsonLdBreadcrumb items={breadcrumbs} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="relative overflow-hidden bg-[#1D3A62] text-white border-b border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium mb-5 border border-white/15">
            <MapPin className="h-3.5 w-3.5" />
            {comune.name}, {locale === "en" ? "Lake Como" : "Lago di Como"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-light mb-4 leading-tight text-white">
            {titlePrefix}{" "}
            <span className="font-semibold">{comune.name}</span>
            <br />
            <span className="text-white/70 text-2xl sm:text-3xl">
              {subtitleSuffix}
            </span>
          </h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-2xl">
            {tagline}.
          </p>
          <div className="mt-8">
            <Link
              href={`/contact?interest=gestione&from=local-${comune.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-foreground text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[7fr_5fr] gap-10 lg:gap-14">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light mb-5">
              <span className="font-semibold">{sectionWhyHere}</span>
            </h2>
            <div className="space-y-4 mb-8">
              {introParagraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">
                    {locale === "en" ? "Where it is" : "Dove si trova"}
                  </h3>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${comune.geo.lat},${comune.geo.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {locale === "en" ? "Open in Maps" : "Apri in Maps"}
                </a>
              </div>
              <GoogleMapEmbed
                query={`${comune.geo.lat},${comune.geo.lng}`}
                title={`Mappa ${comune.name}`}
                zoom={13}
                className="h-64"
              />
            </div>

            <aside className="bg-muted/20 border border-border/50 rounded-2xl p-6">
              <h3 className="text-base font-semibold mb-3">{sectionApproach}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {sectionApproachBody}
              </p>
              <div className="space-y-2 text-sm">
                {pillars.map((p) => (
                  <div key={p} className="flex items-center gap-2 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {p}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light mb-3 text-foreground">
            {locale === "en"
              ? "Want us to manage your property in"
              : "Vuoi che gestiamo la tua proprietà a"}{" "}
            <span className="font-semibold">{comune.name}</span>?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            {locale === "en"
              ? "A single conversation to see whether we're a good fit. No commitment, we reply within 48 hours."
              : "Una sola conversazione per capire se siamo l'interlocutore giusto. Nessun impegno, ti rispondiamo entro 48 ore."}
          </p>
          <Link
            href={`/contact?interest=gestione&from=local-${comune.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D3A62] text-white text-sm font-semibold hover:bg-[#1D3A62]/90 transition-colors"
          >
            {tCommon("requestConsultation")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
