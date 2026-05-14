import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  MapPin,
  CheckCircle2,
  Navigation,
  Home,
  Building2,
  Globe2,
  Euro,
  TrendingUp,
  Hotel,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { buildMetadata, brandName, SITE_URL } from "@/lib/seo";
import comuni from "@/data/comuni.json";
import { routing, type Locale } from "@/i18n/routing";
import { JsonLdBreadcrumb } from "@/components/seo/jsonld-breadcrumb";
import { GoogleMapEmbed } from "@/components/public/google-map-embed";

type Comune = (typeof comuni)[number];

type TypologySegment = {
  label: string;
  labelEn?: string;
  labelRu?: string;
  pct: number;
};

type MarketStats = {
  airbnbListings: string;
  airbnbListingsEn?: string;
  airbnbListingsRu?: string;
  bookingProperties: string;
  expediaPresence: string;
  expediaPresenceEn?: string;
  expediaPresenceRu?: string;
  adrRange: string;
  adrRangeEn?: string;
  adrRangeRu?: string;
  adrLuxuryRange?: string | null;
  adrLuxuryRangeEn?: string | null;
  adrLuxuryRangeRu?: string | null;
  adrLuxuryNote?: string | null;
  adrLuxuryNoteEn?: string | null;
  adrLuxuryNoteRu?: string | null;
  occupancyRange: string;
  typologyMix?: TypologySegment[];
  topHotels: string[];
  dataNote?: string;
  dataNoteEn?: string;
  dataNoteRu?: string;
};

// Picks the locale-specific suffix variant of a stats field (e.g. `adrRange`,
// `adrRangeEn`, `adrRangeRu`), falling back to EN then IT base.
function pickStat(
  stats: Record<string, unknown>,
  base: string,
  locale: string,
): string | undefined {
  if (locale === "it") return stats[base] as string | undefined;
  const suffix = locale === "en" ? "En" : locale === "ru" ? "Ru" : "";
  return (stats[`${base}${suffix}`] ??
    stats[`${base}En`] ??
    stats[base]) as string | undefined;
}

const TYPOLOGY_COLORS = ["#1D3A62", "#0C7489", "#119DB0", "#7EC8D3", "#C8E5EA"];

type ParsedHotel = {
  name: string;
  stars?: number;
  meta?: string;
};

function parseHotel(raw: string): ParsedHotel {
  const parenMatch = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!parenMatch) return { name: raw.trim() };
  const name = parenMatch[1].trim();
  const inside = parenMatch[2].trim();
  const ratingMatch = inside.match(/(\d+)\*/);
  if (!ratingMatch) return { name, meta: inside };
  const stars = parseInt(ratingMatch[1], 10);
  const meta = inside.replace(/\d+\*/, "").replace(/^[,\s]+|[,\s]+$/g, "");
  return { name, stars, meta: meta || undefined };
}

function getComune(slug: string): Comune | undefined {
  return (comuni as Comune[]).find((c) => c.slug === slug);
}

function pickLocalized<K extends string>(
  c: Comune,
  field: K,
  locale: string,
): string {
  const map = c as unknown as Record<string, string>;
  if (locale !== "it") {
    return (
      map[`${field}_${locale}`] ??
      map[`${field}_en`] ??
      map[`${field}_it`] ??
      ""
    );
  }
  return map[`${field}_it`] ?? map[`${field}_en`] ?? "";
}

function pickLocalizedArray(
  c: Comune,
  field: string,
  locale: string,
): string[] {
  const map = c as unknown as Record<string, string[]>;
  if (locale !== "it") {
    return (
      map[`${field}_${locale}`] ??
      map[`${field}_en`] ??
      map[`${field}_it`] ??
      []
    );
  }
  return map[`${field}_it`] ?? map[`${field}_en`] ?? [];
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
    const notFoundTitle: Record<string, string> = {
      it: "Non trovato",
      en: "Not found",
      ru: "Не найдено",
    };
    return buildMetadata({
      locale,
      pathname: `/property-management/${slug}`,
      title: notFoundTitle[locale] ?? notFoundTitle.it,
      description: "",
      noIndex: true,
    });
  }
  const brand = brandName(locale);
  const metaTitle: Record<string, string> = {
    it: `Property Management ${c.name} — Gestione Affitti Brevi Lago di Como | ${brand}`,
    en: `${c.name} Property Management — Lake Como Short-Term Rentals | ${brand}`,
    ru: `Управление недвижимостью ${c.name} — краткосрочная аренда на озере Комо | ${brand}`,
  };
  const metaDescription: Record<string, string> = {
    it: `Property management e gestione affitti brevi a ${c.name} sul Lago di Como. Airbnb, Booking, Expedia e canali long-stay. 9 anni di esperienza diretta sul lago.`,
    en: `Property management and short-term rental management in ${c.name} on Lake Como. Airbnb, Booking, Expedia plus long-stay channels. 9 years of direct experience.`,
    ru: `Управление недвижимостью и краткосрочной арендой в ${c.name} на озере Комо. Airbnb, Booking, Expedia и каналы long-stay. 9 лет прямого опыта на озере.`,
  };
  const title = metaTitle[locale] ?? metaTitle.it;
  const description = metaDescription[locale] ?? metaDescription.it;
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

  const PILLARS: Record<string, string[]> = {
    it: [
      "Canali primari Airbnb · Booking · Expedia",
      "Canali long-stay per la bassa stagione",
      "Pricing dinamico zona per zona",
    ],
    en: [
      "Primary channels Airbnb · Booking · Expedia",
      "Long-stay channels for low season",
      "Dynamic pricing area by area",
    ],
    ru: [
      "Основные каналы Airbnb · Booking · Expedia",
      "Каналы long-stay для низкого сезона",
      "Динамическое ценообразование зона за зоной",
    ],
  };
  const pillars = PILLARS[locale] ?? PILLARS.it;

  const tagline = pickLocalized(comune, "tagline", locale);
  const introParagraphs = pickLocalizedArray(comune, "intro", locale);
  const highlights = pickLocalizedArray(comune, "highlights", locale);
  const marketStats = (comune as unknown as { marketStats?: MarketStats })
    .marketStats;
  const STATS_LABELS: Record<string, {
    eyebrow: string;
    titlePrefix: string;
    subtitle: string;
    listings: string;
    properties: string;
    adrApt: string;
    adrVilla: string;
    occupancy: string;
    topHotels: string;
    expediaInventory: string;
    typologyMix: string;
  }> = {
    it: {
      eyebrow: "Statistiche di mercato",
      titlePrefix: "Il mercato affitti brevi a",
      subtitle:
        "Dati pubblici aggregati da AirDNA, Booking.com ed Expedia · trailing 12 mesi 2024-2025.",
      listings: "Annunci attivi",
      properties: "Proprietà",
      adrApt: "ADR appartamenti",
      adrVilla: "ADR ville",
      occupancy: "Occupazione picco",
      topHotels: "Hotel classificati",
      expediaInventory: "Inventory in larga parte sovrapposto a Booking.com",
      typologyMix: "Mix per tipologia",
    },
    en: {
      eyebrow: "Market data",
      titlePrefix: "The short-term rental market in",
      subtitle:
        "Public data aggregated from AirDNA, Booking.com and Expedia · trailing 12 months 2024-2025.",
      listings: "Active listings",
      properties: "Properties",
      adrApt: "Apartment ADR",
      adrVilla: "Villa ADR",
      occupancy: "Peak occupancy",
      topHotels: "Main classified hotels",
      expediaInventory: "Inventory mostly mirrored from Booking.com",
      typologyMix: "Listing mix by type",
    },
    ru: {
      eyebrow: "Рыночные данные",
      titlePrefix: "Рынок краткосрочной аренды в",
      subtitle:
        "Публичные данные, агрегированные из AirDNA, Booking.com и Expedia · скользящие 12 месяцев 2024-2025.",
      listings: "Активные объявления",
      properties: "Объекты",
      adrApt: "ADR апартаменты",
      adrVilla: "ADR виллы",
      occupancy: "Пиковая заполняемость",
      topHotels: "Основные классифицированные отели",
      expediaInventory: "Инвентарь в основном дублируется с Booking.com",
      typologyMix: "Распределение объявлений по типу",
    },
  };
  const statsLabels = STATS_LABELS[locale] ?? STATS_LABELS.it;

  const PM_BREADCRUMB: Record<string, string> = {
    it: "Property Management",
    en: "Property management",
    ru: "Управление недвижимостью",
  };
  const breadcrumbs = [
    { name: tNav("home"), path: "/" },
    {
      name: PM_BREADCRUMB[locale] ?? PM_BREADCRUMB.it,
      path: "/property-management",
    },
    { name: comune.name, path: `/property-management/${comune.slug}` },
  ];

  const HERO_LABELS: Record<string, {
    titlePrefix: string;
    subtitleSuffix: string;
    ctaLabel: string;
    sectionWhyHere: string;
    sectionApproach: string;
    sectionApproachBody: string;
  }> = {
    it: {
      titlePrefix: "Property management a",
      subtitleSuffix: "sul Lago di Como, chiavi in mano.",
      ctaLabel: "Richiedi una consulenza",
      sectionWhyHere: "Perché questa zona",
      sectionApproach: "Il nostro approccio",
      sectionApproachBody: `Distribuzione multi-canale su Airbnb, Booking ed Expedia per le prenotazioni turistiche, e canali long-stay per le locazioni medio-lunghe — una strategia 365 giorni calibrata sulle specificità di ${comune.name}.`,
    },
    en: {
      titlePrefix: "Property management in",
      subtitleSuffix: "on Lake Como, end-to-end.",
      ctaLabel: "Request a consultation",
      sectionWhyHere: "Why this area",
      sectionApproach: "Our approach here",
      sectionApproachBody: `Multi-channel distribution on Airbnb, Booking and Expedia for tourist bookings, plus long-stay channels for medium-term lets — a 365-day strategy calibrated on the specifics of ${comune.name}.`,
    },
    ru: {
      titlePrefix: "Управление недвижимостью в",
      subtitleSuffix: "на озере Комо, под ключ.",
      ctaLabel: "Заказать консультацию",
      sectionWhyHere: "Почему эта зона",
      sectionApproach: "Наш подход здесь",
      sectionApproachBody: `Мультиканальная дистрибуция на Airbnb, Booking и Expedia для туристических бронирований, плюс каналы long-stay для среднесрочной аренды — 365-дневная стратегия, откалиброванная на специфику ${comune.name}.`,
    },
  };
  const heroLabels = HERO_LABELS[locale] ?? HERO_LABELS.it;
  const {
    titlePrefix,
    subtitleSuffix,
    ctaLabel,
    sectionWhyHere,
    sectionApproach,
    sectionApproachBody,
  } = heroLabels;

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
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.webp')] bg-cover bg-center pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium mb-5 border border-white/15">
            <MapPin className="h-3.5 w-3.5" />
            {comune.name},{" "}
            {locale === "en"
              ? "Lake Como"
              : locale === "ru"
              ? "Озеро Комо"
              : "Lago di Como"}
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
                    {locale === "en"
                      ? "Where it is"
                      : locale === "ru"
                      ? "Где находится"
                      : "Dove si trova"}
                  </h3>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${comune.geo.lat},${comune.geo.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {locale === "en"
                    ? "Open in Maps"
                    : locale === "ru"
                    ? "Открыть в Maps"
                    : "Apri in Maps"}
                </a>
              </div>
              <GoogleMapEmbed
                query={`${comune.name}, Lago di Como, Italia`}
                title={`Mappa ${comune.name}`}
                zoom={14}
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

      {marketStats && (
        <section className="py-16 sm:py-20 bg-muted/20 border-y border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {statsLabels.eyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light mt-3 mb-3">
                {statsLabels.titlePrefix}{" "}
                <span className="font-semibold">{comune.name}</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {statsLabels.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <PlatformCard
                title="Airbnb"
                iconBg="bg-[#FF5A5F]/10"
                iconColor="text-[#FF5A5F]"
                icon={<Home className="h-4 w-4" />}
              >
                <PlatformStat
                  label={statsLabels.listings}
                  value={
                    pickStat(
                      marketStats as unknown as Record<string, unknown>,
                      "airbnbListings",
                      locale,
                    ) ?? marketStats.airbnbListings
                  }
                />
                <PlatformStat
                  label={statsLabels.adrApt}
                  value={
                    pickStat(
                      marketStats as unknown as Record<string, unknown>,
                      "adrRange",
                      locale,
                    ) ?? marketStats.adrRange
                  }
                />
                {marketStats.adrLuxuryRange && (
                  <PlatformStat
                    label={statsLabels.adrVilla}
                    value={
                      pickStat(
                        marketStats as unknown as Record<string, unknown>,
                        "adrLuxuryRange",
                        locale,
                      ) ?? marketStats.adrLuxuryRange
                    }
                    hint={
                      marketStats.adrLuxuryNote
                        ? pickStat(
                            marketStats as unknown as Record<string, unknown>,
                            "adrLuxuryNote",
                            locale,
                          ) ?? marketStats.adrLuxuryNote
                        : undefined
                    }
                  />
                )}
                {marketStats.typologyMix && marketStats.typologyMix.length > 0 && (
                  <TypologyBar
                    label={statsLabels.typologyMix}
                    segments={marketStats.typologyMix}
                    locale={locale}
                  />
                )}
              </PlatformCard>

              <PlatformCard
                title="Booking.com"
                iconBg="bg-[#003580]/10"
                iconColor="text-[#003580]"
                icon={<Building2 className="h-4 w-4" />}
              >
                <PlatformStat
                  label={statsLabels.properties}
                  value={marketStats.bookingProperties}
                />
                {marketStats.topHotels.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                      {statsLabels.topHotels}
                    </div>
                    <ul className="space-y-1.5">
                      {marketStats.topHotels.slice(0, 5).map((raw) => {
                        const h = parseHotel(raw);
                        return (
                          <li
                            key={raw}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium text-foreground leading-snug">
                                {h.name}
                              </div>
                              {h.meta && (
                                <div className="text-[11px] text-muted-foreground leading-snug">
                                  {h.meta}
                                </div>
                              )}
                            </div>
                            {h.stars && (
                              <span
                                className="shrink-0 inline-flex items-center gap-px text-[#1D3A62] leading-none"
                                aria-label={
                                  locale === "en"
                                    ? `${h.stars} stars`
                                    : locale === "ru"
                                    ? `${h.stars} звёзд`
                                    : `${h.stars} stelle`
                                }
                              >
                                {Array.from({ length: h.stars }).map((_, i) => (
                                  <span
                                    key={i}
                                    aria-hidden
                                    className="text-[13px]"
                                  >
                                    ★
                                  </span>
                                ))}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </PlatformCard>

              <PlatformCard
                title="Expedia"
                iconBg="bg-[#FFC72C]/15"
                iconColor="text-[#B58A00]"
                icon={<Globe2 className="h-4 w-4" />}
              >
                <PlatformStat
                  label={
                    locale === "en"
                      ? "Presence"
                      : locale === "ru"
                      ? "Присутствие"
                      : "Presenza"
                  }
                  value={capitalize(
                    pickStat(
                      marketStats as unknown as Record<string, unknown>,
                      "expediaPresence",
                      locale,
                    ) ?? marketStats.expediaPresence,
                  )}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {statsLabels.expediaInventory}
                </p>
              </PlatformCard>
            </div>

            <div className="bg-white border border-border/50 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                    {statsLabels.occupancy}
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    {locale === "en"
                      ? "Across all platforms"
                      : locale === "ru"
                      ? "По всем платформам"
                      : "Sull'insieme delle piattaforme"}
                  </div>
                </div>
              </div>
              <div className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                {marketStats.occupancyRange}
              </div>
            </div>

            {(marketStats.dataNote || marketStats.dataNoteEn || marketStats.dataNoteRu) && (
              <div className="flex items-start gap-2.5 mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200/60">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  {pickStat(
                    marketStats as unknown as Record<string, unknown>,
                    "dataNote",
                    locale,
                  ) ?? marketStats.dataNote}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-16 bg-white border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light mb-3 text-foreground">
            {locale === "en"
              ? "Want us to manage your property in"
              : locale === "ru"
              ? "Хотите, чтобы мы управляли вашим объектом в"
              : "Vuoi che gestiamo la tua proprietà a"}{" "}
            <span className="font-semibold">{comune.name}</span>?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            {locale === "en"
              ? "A single conversation to see whether we're a good fit. No commitment, we reply within 48 hours."
              : locale === "ru"
              ? "Один разговор, чтобы понять, подходим ли мы вам. Без обязательств, отвечаем в течение 48 часов."
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

function PlatformCard({
  title,
  icon,
  iconBg,
  iconColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border/50 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
        <div
          className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function TypologyBar({
  label,
  segments,
  locale,
}: {
  label: string;
  segments: TypologySegment[];
  locale: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted/40 mb-2">
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{
              width: `${s.pct}%`,
              backgroundColor: TYPOLOGY_COLORS[i % TYPOLOGY_COLORS.length],
            }}
            title={`${locale === "en"
                ? s.labelEn ?? s.label
                : locale === "ru"
                ? s.labelRu ?? s.labelEn ?? s.label
                : s.label}: ${s.pct}%`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{
                backgroundColor:
                  TYPOLOGY_COLORS[i % TYPOLOGY_COLORS.length],
              }}
            />
            <span className="text-foreground font-medium">
              {locale === "en"
                ? s.labelEn ?? s.label
                : locale === "ru"
                ? s.labelRu ?? s.labelEn ?? s.label
                : s.label}
            </span>
            <span className="text-muted-foreground">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlatformStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-0.5">
        {label}
      </div>
      <div className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-tight">
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
          {hint}
        </div>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
