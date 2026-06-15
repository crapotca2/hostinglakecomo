import { notFound } from "next/navigation";
import Image from "next/image";
import {
  UtensilsCrossed,
  Sailboat,
  Info,
  Phone,
  Mail,
  Globe,
  Footprints,
  Car,
  Bus,
  Bike,
  CableCar,
  Navigation,
  ExternalLink,
  Star,
  ShoppingBasket,
  Pill,
  Trees,
  Coffee,
  Utensils,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { collections } from "@/lib/mongodb/collections";
import {
  pickLocalized,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "@/lib/welcome-book/i18n";
import type {
  SupportedLocale,
  WelcomeBookPOI,
  WelcomeBookContact,
  WelcomeBookDestination,
  WelcomeBookRestaurant,
  WelcomeBookTransport,
  WelcomeBookDoc,
  HouseGuideDoc,
  LocalizedText,
  LocalizedTextOptional,
} from "@/types/database";
import type { Locale } from "@/i18n/routing";
import { getPortfolioEntry } from "@/lib/portfolio";
import { BrandHero } from "@/components/welcome-book/BrandDecorations";
import { LocaleSwitcher } from "@/components/welcome-book/LocaleSwitcher";
import { ScannableQr } from "@/components/welcome-book/ScannableQr";
import { Carousel } from "@/components/welcome-book/Carousel";
import { HubNav } from "@/components/welcome-book/HubNav";
import { HeroWifiInline } from "@/components/welcome-book/HeroWifiInline";
import { sharedLabel } from "@/components/welcome-book/sharedLabels";
import { TileCard } from "@/components/welcome-book/TileCard";
import { ReviewBlock } from "@/components/welcome-book/ReviewBlock";
import { PoiCard } from "@/components/welcome-book/PoiCard";
import { TexturedSection, GroupHeader } from "@/components/welcome-book/TexturedSection";
import { directionsUrlForPoi } from "@/lib/welcome-book/maps/directions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string; locale: Locale };
  searchParams: { lang?: string };
}

export default async function WelcomeBookPage({ params, searchParams }: PageProps) {
  const { slug, locale: routeLocale } = params;
  const { lang } = searchParams;
  const locale: SupportedLocale = isSupportedLocale(lang)
    ? lang
    : (routeLocale as SupportedLocale);

  const wbCol = await collections.welcomeBooks();
  const wb = (await wbCol.findOne({ propertySlug: slug })) as WelcomeBookDoc | null;
  if (!wb) return notFound();

  const guideCol = await collections.houseGuides();
  const guide = (await guideCol.findOne({ propertySlug: slug })) as HouseGuideDoc | null;

  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  const portfolioEntry = getPortfolioEntry(slug);
  const propertyName = portfolioEntry?.name ?? "Aqua Vista";
  const propertyCity = portfolioEntry?.address.city ?? "Argegno";
  const basePath = `/properties/${slug}/welcome/guida`;

  return (
    <main className="font-[family-name:var(--font-outfit)] bg-white">
      <BrandHero
        eyebrow={`${sharedLabel("guideTo", locale).toUpperCase()} ${propertyCity.toUpperCase()}`}
        title={`${sharedLabel("welcomeTo", locale)} ${propertyName}`}
        heroImage="/images/welcome/aqua-vista-di-splendore/destinations/aqua-vista-spritz.webp"
        wifiBlock={
          guide ? (
            <HeroWifiInline
              ssid={guide.sections.wifi.ssid}
              password={guide.sections.wifi.password}
              ssidLabel={sharedLabel("ssid", locale)}
              passwordLabel={sharedLabel("password", locale)}
              scanLabel={sharedLabel("scanToConnect", locale)}
            />
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-4 print:hidden">
        <div className="flex flex-col items-center gap-4">
          <LocaleSwitcher currentLocale={locale} basePath={basePath} centered />
        </div>
      </div>
      <HubNav slug={slug} routeLocale={routeLocale} contentLocale={locale} current="guida" />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {(wb.sections.walkable.length > 0 ||
          (wb.sections.atmBanking && wb.sections.atmBanking.length > 0) ||
          wb.sections.shopping.length > 0 ||
          (wb.sections.emergencyPharmacies && wb.sections.emergencyPharmacies.length > 0)) && (
          <TexturedSection textured>
            <GroupHeader label={label("groupNearby", locale)} onDark />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {wb.sections.walkable.length > 0 && (
                <TileCard icon={<Footprints />} title={label("walkable", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("walkable", locale)}</h2>
                    <PoiList items={wb.sections.walkable} locale={locale} />
                  </div>
                </TileCard>
              )}
              {wb.sections.atmBanking && wb.sections.atmBanking.length > 0 && (
                <TileCard icon={<Banknote />} title={label("atmBanking", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("atmBanking", locale)}</h2>
                    <PoiList items={wb.sections.atmBanking} locale={locale} />
                  </div>
                </TileCard>
              )}
              {wb.sections.shopping.length > 0 && (
                <TileCard icon={<ShoppingBasket />} title={label("shopping", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("shopping", locale)}</h2>
                    <PoiList items={wb.sections.shopping} locale={locale} />
                  </div>
                </TileCard>
              )}
              {wb.sections.emergencyPharmacies && wb.sections.emergencyPharmacies.length > 0 && (
                <TileCard icon={<Pill />} title={label("emergencyPharmacies", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("emergencyPharmacies", locale)}</h2>
                    <PharmaciesTable items={wb.sections.emergencyPharmacies} locale={locale} />
                  </div>
                </TileCard>
              )}
            </div>
          </TexturedSection>
        )}

        {(wb.sections.eatingDrinking.length > 0 ||
          wb.sections.boatRentals.length > 0 ||
          wb.sections.bikeRentals.length > 0 ||
          wb.sections.activeOutdoor.length > 0) && (
          <TexturedSection>
            <GroupHeader label={label("groupActivities", locale)} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {wb.sections.eatingDrinking.length > 0 && (
                <TileCard icon={<UtensilsCrossed />} title={label("eatingDrinking", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("eatingDrinking", locale)}</h2>
                    <TripAdvisorBanner
                      titleKey="tripadvisorRestaurantsTitle"
                      subtitleKey="tripadvisorRestaurantsSubtitle"
                      url="https://www.tripadvisor.it/Restaurants-g664175-Argegno_Lake_Como_Lombardy.html"
                      locale={locale}
                    />
                    <RestaurantList items={wb.sections.eatingDrinking} locale={locale} />
                  </div>
                </TileCard>
              )}
              {wb.sections.boatRentals.length > 0 && (
                <TileCard icon={<Sailboat />} title={label("boatRentals", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("boatRentals", locale)}</h2>
                    <BoatOptionsSplit
                      featured={wb.sections.boatRentals[0]}
                      tours={wb.sections.boatTours ?? []}
                      locale={locale}
                    />
                  </div>
                </TileCard>
              )}
              {wb.sections.bikeRentals.length > 0 && (
                <TileCard icon={<Bike />} title={label("bikeRentals", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("bikeRentals", locale)}</h2>
                    <ContactList items={wb.sections.bikeRentals} locale={locale} variant="boat" mode="grid" />
                  </div>
                </TileCard>
              )}
              {wb.sections.activeOutdoor.length > 0 && (
                <TileCard icon={<Trees />} title={label("activeOutdoor", locale)}>
                  <div className="p-5 sm:p-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("activeOutdoor", locale)}</h2>
                    <PoiList items={wb.sections.activeOutdoor} locale={locale} />
                  </div>
                </TileCard>
              )}
            </div>
          </TexturedSection>
        )}

        <TexturedSection textured>
          <GroupHeader label={label("groupExplore", locale)} onDark />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {wb.sections.dayTrips.length > 0 && (
              <TileCard icon={<Sailboat />} title={label("dayTrips", locale)}>
                <div className="p-5 sm:p-7">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("dayTrips", locale)}</h2>
                  <DestinationList items={wb.sections.dayTrips} locale={locale} />
                </div>
              </TileCard>
            )}
            {wb.sections.drivingTrips.length > 0 && (
              <TileCard icon={<Car />} title={label("drivingTrips", locale)}>
                <div className="p-5 sm:p-7">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("drivingTrips", locale)}</h2>
                  <DestinationList items={wb.sections.drivingTrips} locale={locale} />
                </div>
              </TileCard>
            )}
            <TileCard icon={<Navigation />} title={label("transport", locale)}>
              <div className="p-5 sm:p-7">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("transport", locale)}</h2>
                <TransportCards transport={wb.sections.transport} locale={locale} />
              </div>
            </TileCard>
          </div>
        </TexturedSection>
      </article>

      {guide?.sections.feedback && (
        <ReviewBlock feedback={t(guide.sections.feedback)} locale={locale} />
      )}
    </main>
  );
}

const TYPE_META: Record<string, { Icon: LucideIcon; key: string }> = {
  supermarket: { Icon: ShoppingBasket, key: "type-supermarket" },
  pharmacy: { Icon: Pill, key: "type-pharmacy" },
  atm: { Icon: Banknote, key: "type-atm" },
  post: { Icon: Mail, key: "type-post" },
  bakery: { Icon: ShoppingBasket, key: "type-bakery" },
  "outdoor-activity": { Icon: Trees, key: "type-outdoor" },
  bar: { Icon: Coffee, key: "type-bar" },
  restaurant: { Icon: Utensils, key: "type-restaurant" },
  newsstand: { Icon: ShoppingBasket, key: "type-newsstand" },
  "ferry-stop": { Icon: Sailboat, key: "type-ferry" },
  "bus-stop": { Icon: Bus, key: "type-bus" },
  funicular: { Icon: CableCar, key: "type-funicular" },
  "boat-rental": { Icon: Sailboat, key: "type-boat-rental" },
  "bike-rental": { Icon: Bike, key: "type-bike-rental" },
};

function PoiList({ items, locale }: { items: WelcomeBookPOI[]; locale: SupportedLocale }) {
  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {items.map((poi, i) => {
        const meta = TYPE_META[poi.type] ?? TYPE_META["outdoor-activity"];
        const directionsHref = poi.directionsUrl ?? directionsUrlForPoi(poi);
        return (
          <PoiCard
            key={i}
            poi={{
              name: poi.name,
              address: poi.address,
              phone: poi.phone,
              walkMinutes: poi.walkMinutes ?? null,
              distanceMeters: poi.distanceMeters ?? null,
              directionsHref,
              categoryLabel: label(meta.key, locale),
              notes: poi.notes ? t(poi.notes) : undefined,
            }}
            scanShortLabel={label("scanShort", locale)}
            scanAriaLabel={label("scanForDirections", locale)}
            minLabel={label("min", locale)}
            infoLabel={label("moreInfo", locale)}
            callLabel={label("call", locale)}
          />
        );
      })}
    </div>
  );
}

function ContactList({
  items,
  locale,
  variant = "default",
  mode = "carousel",
}: {
  items: WelcomeBookContact[];
  locale: SupportedLocale;
  variant?: "default" | "boat";
  mode?: "carousel" | "grid";
}) {
  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);

  if (variant !== "boat") {
    return (
      <div className="space-y-3">
        {items.map((x, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
            <p className="font-bold text-slate-900">{x.name}</p>
            {x.address && <p className="text-xs text-slate-700 mt-1">{x.address}</p>}
            <div className="text-sm mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {x.phone && (
                <a href={`tel:${x.phone}`} className="inline-flex items-center gap-1.5 text-[#1D3A62] font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  {x.phone}
                </a>
              )}
              {x.email && (
                <a href={`mailto:${x.email}`} className="inline-flex items-center gap-1.5 text-[#1D3A62] font-medium break-all">
                  <Mail className="w-3.5 h-3.5" />
                  {x.email}
                </a>
              )}
            </div>
            {x.notes && <p className="text-sm mt-2 leading-relaxed text-slate-700">{t(x.notes)}</p>}
          </div>
        ))}
      </div>
    );
  }

  const isGrid = mode === "grid";
  const Wrapper = isGrid
    ? ({ children }: { children: React.ReactNode }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <Carousel ariaLabel="Boat rentals">{children}</Carousel>
      );

  return (
    <Wrapper>
      {items.map((x, i) => {
        const note = x.notes ? t(x.notes) : "";
        const isTop = x.isTopChoice ?? i === 0;
        const cleanUrl = x.website ? x.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : null;
        const featured = isTop && !!x.heroImage;
        return (
          <article
            key={i}
            className={`group flex flex-col rounded-2xl overflow-hidden bg-white border shadow-sm hover:shadow-lg transition-all ${
              isGrid
                ? ""
                : featured
                  ? "snap-start flex-shrink-0 w-[90vw] sm:w-[560px] md:w-[640px]"
                  : "snap-start flex-shrink-0 w-[85vw] sm:w-[360px] md:w-[400px]"
            } ${isTop ? "border-[#1D3A62] ring-1 ring-[#1D3A62]/20" : "border-slate-200"}`}
          >
            {featured && x.heroImage && (
              <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={x.heroImage}
                  alt={x.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1D3A62] text-white shadow-md">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {label("topChoice", locale)}
                </span>
              </div>
            )}
            <div className={`p-5 flex-1 ${featured ? "sm:p-8" : ""}`}>
              <div className={featured ? "max-w-3xl" : ""}>
                <div className="flex items-start gap-3.5">
                  {x.brandLogo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={x.brandLogo}
                      alt=""
                      aria-hidden
                      className="w-14 h-14 rounded-xl bg-white border border-slate-100 object-contain p-2 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1D3A62] to-[#2E5A8C] flex items-center justify-center flex-shrink-0">
                      <Sailboat className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {isTop && !featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1D3A62] text-white mb-1.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {label("topChoice", locale)}
                      </span>
                    )}
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{x.name}</h3>
                    {x.address && <p className="text-xs text-slate-700 mt-0.5 leading-snug">{x.address}</p>}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
                  {x.phone && (
                    <a href={`tel:${x.phone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF5] text-[#1D3A62] hover:bg-[#1D3A62] hover:text-white transition-colors">
                      <Phone className="w-3 h-3" />
                      {x.phone}
                    </a>
                  )}
                  {x.email && (
                    <a href={`mailto:${x.email}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D3A62] break-all">
                      <Mail className="w-3 h-3" />
                      {x.email}
                    </a>
                  )}
                </div>

                {note && (
                  <details className="mt-3">
                    <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-[#1D3A62] hover:underline">
                      <Info className="w-3 h-3" strokeWidth={2.5} />
                      {label("moreInfo", locale)}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{note}</p>
                  </details>
                )}
              </div>
            </div>

            {x.website && cleanUrl && (
              <div className="border-t border-slate-100 bg-slate-50/60 p-3 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <a
                    href={x.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3A62] hover:text-[#2E5A8C] underline underline-offset-2 break-all"
                  >
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{cleanUrl}</span>
                  </a>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {label("scanToOpen", locale)}
                  </span>
                </div>
                {x.website && (
                  <ScannableQr
                    url={x.website}
                    ariaLabel={label("scanToOpen", locale)}
                    className="w-20 h-20 sm:w-24 sm:h-24"
                  />
                )}
              </div>
            )}
          </article>
        );
      })}
    </Wrapper>
  );
}

function BoatOptionsSplit({
  featured,
  tours,
  locale,
}: {
  featured: WelcomeBookContact;
  tours: WelcomeBookContact[];
  locale: SupportedLocale;
}) {
  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  const cleanUrl = featured.website
    ? featured.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
    : null;
  const featuredNote = featured.notes ? t(featured.notes) : "";

  const toursWithWebsite = tours.filter((tour) => !!tour.website);

  return (
    <div className="space-y-7 sm:space-y-8">
      <article className="rounded-2xl overflow-hidden bg-white border border-[#1D3A62] ring-1 ring-[#1D3A62]/20 shadow-sm md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {featured.heroImage && (
          <div className="relative w-full aspect-[16/9] md:aspect-auto md:min-h-full bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.heroImage}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1D3A62] text-white shadow-md">
              <Star className="w-2.5 h-2.5 fill-current" />
              {label("topChoice", locale)}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <div className="p-5 sm:p-6 flex-1">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{featured.name}</h3>
            {featured.address && <p className="text-xs text-slate-700 mt-1">{featured.address}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
              {featured.phone && (
                <a
                  href={`tel:${featured.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF5] text-[#1D3A62] hover:bg-[#1D3A62] hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {featured.phone}
                </a>
              )}
              {featured.email && (
                <a
                  href={`mailto:${featured.email}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D3A62] break-all"
                >
                  <Mail className="w-3 h-3" />
                  {featured.email}
                </a>
              )}
            </div>

            {featuredNote && (
              <p className="text-sm mt-3 leading-relaxed text-slate-700">{featuredNote}</p>
            )}
          </div>

          {featured.website && cleanUrl && (
            <div className="border-t border-slate-100 bg-slate-50/60 p-3 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <a
                  href={featured.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3A62] hover:text-[#2E5A8C] underline underline-offset-2 break-all"
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cleanUrl}</span>
                </a>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  {label("scanToOpen", locale)}
                </span>
              </div>
              <ScannableQr
                url={featured.website}
                ariaLabel={label("scanToOpen", locale)}
                className="w-20 h-20 sm:w-24 sm:h-24"
              />
            </div>
          )}
        </div>
      </article>

      {toursWithWebsite.length > 0 && (
        <div>
          <GroupHeader label={label("boatTours", locale)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {toursWithWebsite.map((tour, i) => {
              const clean = tour.website!.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
              return (
                <article
                  key={i}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#1D3A62]/30 transition-all p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <ScannableQr
                        url={tour.website!}
                        ariaLabel={label("scanToOpen", locale)}
                        className="w-20 h-20 sm:w-24 sm:h-24"
                      />
                      <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#1D3A62]/70 text-center leading-tight">
                        {label("scanShort", locale)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-900 leading-tight">{tour.name}</h3>
                      <a
                        href={tour.website!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3A62] hover:text-[#2E5A8C] underline underline-offset-2 break-all"
                      >
                        <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{clean}</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const TRAVEL_MODE_ICON: Record<string, LucideIcon> = {
  ferry: Sailboat,
  bus: Bus,
  car: Car,
  bike: Bike,
  walking: Footprints,
  funicular: CableCar,
};

function DestinationList({
  items,
  locale,
}: {
  items: WelcomeBookDestination[];
  locale: SupportedLocale;
}) {
  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  const cols = items.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${cols} gap-5`}>
      {items.map((dest, i) => {
        const directionsHref =
          dest.directionsUrl ??
          directionsUrlForPoi({ name: dest.name, address: dest.address ?? dest.name, coordinates: dest.coordinates });
        const featured = !!dest.isFeatured;
        const spanFull = featured && items.length >= 3 ? "lg:col-span-3" : "md:col-span-2";
        return (
          <article
            key={i}
            className={`group rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-shadow ${
              featured ? `${spanFull} md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` : "flex flex-col"
            }`}
          >
            {dest.photoUrl && (
              <div className={`relative bg-slate-100 ${featured ? "min-h-[260px] md:min-h-0" : "w-full aspect-[16/10]"}`}>
                <Image
                  src={dest.photoUrl}
                  alt={dest.name}
                  fill
                  sizes={featured ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 50vw"}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className={`p-5 flex-1 flex flex-col ${featured ? "sm:p-7" : ""}`}>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1D3A62] hover:underline underline-offset-2"
                >
                  {dest.name}
                </a>
              </h3>

              <div className="mt-2 space-y-1 text-sm text-slate-700">
                {dest.travelOptions.map((opt, j) => {
                  const ModeIcon = TRAVEL_MODE_ICON[opt.mode] ?? Car;
                  return (
                    <div key={j} className="flex items-baseline gap-2 leading-snug">
                      <ModeIcon className="w-3.5 h-3.5 text-[#1D3A62] flex-shrink-0 translate-y-0.5" />
                      <span className="whitespace-nowrap font-semibold text-slate-800">
                        {opt.durationMinutes} {label("min", locale)}
                      </span>
                      {opt.cost && <span className="text-slate-600">· {opt.cost}</span>}
                    </div>
                  );
                })}
              </div>

              {(dest.description || dest.bestTime || (dest.highlights && dest.highlights.length > 0)) && (
                <details className="mt-3 group">
                  <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#1D3A62] hover:underline">
                    <Info className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {label("moreInfo", locale)}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {dest.description && (
                      <p className="text-sm text-slate-800 leading-relaxed">{t(dest.description)}</p>
                    )}
                    {dest.bestTime && (
                      <p className="text-sm text-slate-700 leading-relaxed">
                        <span className="font-semibold text-[#1D3A62]">{label("bestTime", locale)}:</span>{" "}
                        {t(dest.bestTime)}
                      </p>
                    )}
                    {dest.highlights && dest.highlights.length > 0 && (
                      <ul className="text-sm text-slate-800 space-y-1.5">
                        {dest.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-[#1D3A62] flex-shrink-0 mt-0.5" fill="currentColor" />
                            <span className="leading-relaxed">{t(h)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-auto pt-4 flex flex-wrap gap-3 text-xs">
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1D3A62] font-semibold underline underline-offset-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {label("getDirections", locale)}
                </a>
                {dest.officialUrl && (
                  <a
                    href={dest.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#1D3A62] font-semibold underline underline-offset-2"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {label("officialSite", locale)}
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RestaurantList({
  items,
  locale,
}: {
  items: WelcomeBookRestaurant[];
  locale: SupportedLocale;
}) {
  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  return (
    <Carousel ariaLabel={label("eatingDrinking", locale)}>
      {items.map((rst, i) => {
        const directionsHref = rst.directionsUrl ?? directionsUrlForPoi(rst);
        return (
          <article
            key={i}
            className="snap-start flex-shrink-0 w-[80vw] sm:w-[300px] md:w-[320px] rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
          >
            <div className="p-4 flex-1 flex gap-3">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <ScannableQr
                  url={directionsHref}
                  ariaLabel={label("scanForDirections", locale)}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                />
                <span className="text-[8px] uppercase tracking-[0.1em] font-bold text-[#1D3A62]/70 text-center leading-tight">
                  {label("scanShort", locale)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-tight">
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 hover:text-[#1D3A62] hover:underline underline-offset-2"
                    >
                      {rst.name}
                    </a>
                  </h3>
                  {rst.priceRange && (
                    <span className="text-xs font-bold text-[#1D3A62] flex-shrink-0">{rst.priceRange}</span>
                  )}
                </div>
                {rst.address && (
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug line-clamp-1">{rst.address}</p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                  {rst.tripadvisorRating != null && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#34E0A1]/15 text-emerald-800 font-semibold">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {rst.tripadvisorRating.toFixed(1)}
                    </span>
                  )}
                  {rst.walkMinutes != null && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-semibold">
                      <Footprints className="w-2.5 h-2.5" />
                      {rst.walkMinutes} {label("min", locale)}
                    </span>
                  )}
                </div>

                {rst.cuisine && rst.cuisine.length > 0 && (
                  <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-1">
                    {rst.cuisine.slice(0, 3).join(" · ")}
                  </p>
                )}

                {(rst.notes || rst.phone || rst.tripadvisorUrl) && (
                  <details className="mt-2 group">
                    <summary className="cursor-pointer list-none inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#1D3A62] hover:underline">
                      <Info className="w-3 h-3" strokeWidth={2.5} />
                      {label("moreInfo", locale)}
                    </summary>
                    <div className="mt-2 space-y-1.5">
                      {rst.notes && (
                        <p className="text-[11px] leading-relaxed text-slate-700">{t(rst.notes)}</p>
                      )}
                      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px]">
                        {rst.phone && (
                          <a
                            href={`tel:${rst.phone.replace(/\s+/g, "")}`}
                            className="inline-flex items-center gap-1 text-[#1D3A62] font-semibold"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            {rst.phone}
                          </a>
                        )}
                        {rst.tripadvisorUrl && (
                          <a
                            href={rst.tripadvisorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#1D3A62] underline underline-offset-2"
                          >
                            TripAdvisor
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </Carousel>
  );
}

function TransportCards({
  transport,
  locale,
}: {
  transport: WelcomeBookTransport;
  locale: SupportedLocale;
}) {
  const t = (text: LocalizedText | LocalizedTextOptional | undefined) =>
    text ? pickLocalized(text, locale, DEFAULT_LOCALE) : "";

  return (
    <div className="space-y-4">
      {transport.ferry && (
        <TransportRow
          icon={<Sailboat className="w-5 h-5" />}
          title={label("ferry", locale)}
          subtitle={transport.ferry.operator}
          stopName={transport.ferry.pontileName}
          walkMinutes={transport.ferry.walkMinutesFromHouse}
          operatorUrl={transport.ferry.operatorUrl}
          locale={locale}
          expandedContent={
            <>
              {transport.ferry.seasonalSchedule?.highSeason && (
                <p className="text-sm text-slate-800 leading-relaxed">
                  {t(transport.ferry.seasonalSchedule.highSeason)}
                </p>
              )}
              {transport.ferry.keyDestinations && transport.ferry.keyDestinations.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-[10px] uppercase font-bold text-[#1D3A62]">
                        <th className="py-1.5 pr-2">{label("destination", locale)}</th>
                        <th className="py-1.5 pr-2">{label("time", locale)}</th>
                        <th className="py-1.5 text-right">{label("price", locale)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transport.ferry.keyDestinations.map((d, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 pr-2 font-semibold text-slate-900">{d.name}</td>
                          <td className="py-1.5 pr-2 text-slate-700 whitespace-nowrap">{d.minutes}&apos;</td>
                          <td className="py-1.5 font-mono text-[#1D3A62] font-semibold text-right whitespace-nowrap">
                            €{d.priceAdultEur?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          }
        />
      )}

      {transport.bus && (
        <TransportRow
          icon={<Bus className="w-5 h-5" />}
          title={label("bus", locale)}
          subtitle={`${transport.bus.line ?? ""}${transport.bus.operator ? ` · ${transport.bus.operator}` : ""}`}
          stopName={transport.bus.stopName}
          walkMinutes={transport.bus.walkMinutesFromHouse}
          operatorUrl={transport.bus.operatorUrl}
          locale={locale}
          expandedContent={
            <>
              {transport.bus.frequency && (
                <p className="text-sm text-slate-800 leading-relaxed">
                  {t(transport.bus.frequency)}
                </p>
              )}
              {transport.bus.keyDestinations && transport.bus.keyDestinations.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-[10px] uppercase font-bold text-[#1D3A62]">
                        <th className="py-1.5 pr-2">{label("destination", locale)}</th>
                        <th className="py-1.5 pr-2">{label("time", locale)}</th>
                        <th className="py-1.5 text-right">{label("price", locale)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transport.bus.keyDestinations.map((d, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 pr-2 font-semibold text-slate-900">{d.name}</td>
                          <td className="py-1.5 pr-2 text-slate-700 whitespace-nowrap">{d.minutes}&apos;</td>
                          <td className="py-1.5 font-mono text-[#1D3A62] font-semibold text-right whitespace-nowrap">
                            €{d.priceAdultEur?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          }
        />
      )}

      {transport.funicular && (
        <TransportRow
          icon={<CableCar className="w-5 h-5" />}
          title={label("funicular", locale)}
          subtitle={transport.funicular.name}
          stopName={undefined}
          walkMinutes={transport.funicular.walkMinutesFromHouse}
          operatorUrl={transport.funicular.operatorUrl}
          priceChip={
            transport.funicular.priceRoundTripEur
              ? `€${transport.funicular.priceRoundTripEur} ${label("roundTrip", locale)}`
              : undefined
          }
          locale={locale}
          expandedContent={
            <>
              {transport.funicular.schedule && (
                <p className="text-sm text-slate-800 leading-relaxed">
                  {t(transport.funicular.schedule)}
                </p>
              )}
              {transport.funicular.notes && (
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {t(transport.funicular.notes)}
                </p>
              )}
            </>
          }
        />
      )}
    </div>
  );
}

function TransportRow({
  icon,
  title,
  subtitle,
  stopName,
  walkMinutes,
  operatorUrl,
  priceChip,
  expandedContent,
  locale,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string | null;
  stopName?: string | null;
  walkMinutes?: number | null;
  operatorUrl?: string | null;
  priceChip?: string;
  expandedContent?: React.ReactNode;
  locale: SupportedLocale;
}) {
  return (
    <article className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 sm:p-5 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#E8EDF5] text-[#1D3A62] flex-shrink-0">
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-slate-900 leading-tight">{title}</h3>
              {subtitle && (
                <p className="text-xs text-slate-700 leading-snug truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            {walkMinutes != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-semibold whitespace-nowrap">
                <Footprints className="w-3 h-3" />
                {walkMinutes} {label("minWalk", locale)}
              </span>
            )}
            {stopName && (
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">{stopName}</span>
              </span>
            )}
            {priceChip && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[#1D3A62] font-semibold whitespace-nowrap">
                {priceChip}
              </span>
            )}
            {operatorUrl && (
              <a
                href={operatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#1D3A62] hover:text-[#2E5A8C] underline underline-offset-2"
              >
                <Globe className="w-3 h-3 flex-shrink-0" />
                {label("officialSite", locale)}
              </a>
            )}
          </div>

          {expandedContent && (
            <details className="mt-3">
              <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-[#1D3A62] hover:underline">
                <Info className="w-3 h-3" strokeWidth={2.5} />
                {label("moreInfo", locale)}
              </summary>
              <div className="mt-3">{expandedContent}</div>
            </details>
          )}
        </div>

        {operatorUrl && (
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <ScannableQr
              url={operatorUrl}
              ariaLabel={label("scanToOpen", locale)}
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
            <span className="text-[8px] uppercase tracking-[0.1em] font-bold text-[#1D3A62]/70 text-center leading-tight">
              {label("scanShort", locale)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function PharmaciesTable({
  items,
  locale,
}: {
  items: Array<{ pharmacyName: string; distanceFromPropertyKm?: number; phone?: string; googleMapsUrl?: string }>;
  locale: SupportedLocale;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <p className="text-sm mb-4 text-slate-800 leading-relaxed">{label("pharmaciesNote", locale)}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs uppercase font-bold text-[#1D3A62]">
              <th className="py-2.5 pr-3">{label("phName", locale)}</th>
              <th className="py-2.5 pr-3 hidden sm:table-cell">{label("phDistance", locale)}</th>
              <th className="py-2.5">{label("phPhone", locale)}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-3 font-semibold text-slate-900">{p.pharmacyName}</td>
                <td className="py-3 pr-3 hidden sm:table-cell text-slate-800 font-medium">{p.distanceFromPropertyKm} km</td>
                <td className="py-3">
                  {p.phone && (
                    <a href={`tel:${p.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1.5 text-[#1D3A62] font-mono font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      {p.phone}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TripAdvisorBanner({
  titleKey,
  subtitleKey,
  url,
  locale,
}: {
  titleKey: string;
  subtitleKey: string;
  url: string;
  locale: SupportedLocale;
}) {
  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#34E0A1]/10 via-white to-[#34E0A1]/5 border border-[#34E0A1]/40 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch">
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#34E0A1] text-white">
              <Star className="w-4 h-4 fill-current" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#1D3A62]">TripAdvisor</span>
          </div>
          <h3 className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {label(titleKey, locale)}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{label(subtitleKey, locale)}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#1D3A62] underline underline-offset-4 hover:text-[#2E5A8C] break-all"
          >
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            {url.replace("https://www.", "")}
          </a>
        </div>
        <div className="flex items-center justify-center bg-white p-4 sm:px-6 sm:border-l sm:border-slate-200">
          <ScannableQr
            url={url}
            ariaLabel="QR TripAdvisor"
            className="w-28 h-28 sm:w-32 sm:h-32"
            size={200}
          />
        </div>
      </div>
    </div>
  );
}

function label(key: string, locale: SupportedLocale): string {
  const labels: Record<string, Partial<Record<SupportedLocale, string>>> = {
    walkable: { it: "I più vicini", en: "Closest to you", ru: "Самые ближние", de: "Am nächsten", es: "Los más cercanos", fr: "Les plus proches" },
    atmBanking: { it: "Bancomat & banche", en: "ATMs & banks", ru: "Банкоматы и банки", de: "Geldautomaten & Banken" },
    shopping: { it: "Supermercati zona", en: "Supermarkets nearby", ru: "Супермаркеты", de: "Supermärkte" },
    eatingDrinking: { it: "Ristoranti e bar", en: "Restaurants & bars", ru: "Рестораны и бары", de: "Restaurants & Bars" },
    boatRentals: { it: "Noleggio barche", en: "Boat rentals", ru: "Аренда лодок", de: "Bootsverleih" },
    boatTours: { it: "Tour con skipper", en: "Skippered tours", ru: "Туры со шкипером", de: "Touren mit Skipper" },
    bikeRentals: { it: "Noleggio bici", en: "Bike rentals", ru: "Аренда велосипедов", de: "Fahrradverleih" },
    activeOutdoor: { it: "Outdoor & sport", en: "Outdoor & sports", ru: "Активный отдых", de: "Outdoor & Sport" },
    dayTrips: { it: "Mete in barca o bus", en: "By boat or bus", ru: "На лодке или автобусе", de: "Mit Boot oder Bus" },
    drivingTrips: { it: "Mete in auto", en: "Driving trips", ru: "Поездки на машине", de: "Autoausflüge" },
    transport: { it: "Trasporti", en: "Transport", ru: "Транспорт", de: "Verkehr" },
    ferry: { it: "Traghetto", en: "Ferry", ru: "Паром", de: "Fähre" },
    bus: { it: "Autobus", en: "Bus", ru: "Автобус", de: "Bus" },
    funicular: { it: "Funivia per Pigra", en: "Cable car to Pigra", ru: "Фуникулёр в Пигра", de: "Seilbahn nach Pigra" },
    emergencyPharmacies: { it: "Farmacie della zona", en: "Local pharmacies", ru: "Местные аптеки", de: "Apotheken vor Ort" },
    pharmaciesNote: {
      it: "Il turno di guardia cambia settimanalmente. Per sapere quale farmacia è di turno ORA chiama il numero 1240 (gratuito, 24/7).",
      en: "On-call shift rotates weekly. To know which pharmacy is on-call NOW call 1240 (free, 24/7).",
      ru: "Дежурство меняется еженедельно. Чтобы узнать, какая аптека дежурит СЕЙЧАС, звоните 1240 (бесплатно, 24/7).",
      de: "Notdienst wechselt wöchentlich. Um zu erfahren, welche Apotheke JETZT Notdienst hat, rufen Sie 1240 an (kostenlos, 24/7).",
    },
    groupNearby: { it: "Vicino a casa", en: "Close to home", ru: "Рядом с домом", de: "In der Nähe", es: "Cerca de casa", fr: "Près de chez vous" },
    groupActivities: { it: "Cibo, sport e noleggi", en: "Food, sport & rentals", ru: "Еда, спорт и аренда", de: "Essen, Sport & Verleih", es: "Comida, deporte y alquileres", fr: "Restauration, sport & locations" },
    groupExplore: { it: "Esplora il Lago", en: "Explore the lake", ru: "Исследуйте озеро", de: "Erkunden Sie den See", es: "Explora el lago", fr: "Explorez le lac" },
    min: { it: "min", en: "min", ru: "мин", de: "Min" },
    minWalk: { it: "min a piedi", en: "min walk", ru: "мин пешком", de: "Min zu Fuß" },
    getDirections: { it: "Indicazioni", en: "Directions", ru: "Маршрут", de: "Wegbeschreibung" },
    bestTime: { it: "Quando andarci", en: "Best time", ru: "Лучшее время", de: "Beste Zeit", es: "Mejor momento", fr: "Meilleur moment" },
    scanForDirections: { it: "Inquadra per le indicazioni", en: "Scan for directions", ru: "Отсканируйте для маршрута", de: "Scannen für Wegbeschreibung" },
    scanShort: { it: "Inquadra", en: "Scan", ru: "Скан", de: "Scan", es: "Escanea", fr: "Scanne" },
    moreInfo: { it: "Altre info", en: "More info", ru: "Подробнее", de: "Mehr Infos", es: "Más info", fr: "Plus d'infos" },
    call: { it: "Chiama", en: "Call", ru: "Позвонить", de: "Anrufen", es: "Llamar", fr: "Appeler" },
    scanToOpen: { it: "Inquadra per aprire", en: "Scan to open", ru: "Отсканируйте, чтобы открыть", de: "Zum Öffnen scannen" },
    officialSite: { it: "Sito ufficiale", en: "Official site", ru: "Офиц. сайт", de: "Offizielle Seite", es: "Sitio oficial", fr: "Site officiel" },
    destination: { it: "Destinazione", en: "Destination", ru: "Назначение", de: "Ziel", es: "Destino", fr: "Destination" },
    time: { it: "Tempo", en: "Time", ru: "Время", de: "Zeit", es: "Tiempo", fr: "Durée" },
    price: { it: "Prezzo", en: "Price", ru: "Цена", de: "Preis", es: "Precio", fr: "Prix" },
    roundTrip: { it: "a/r", en: "round trip", ru: "туда-обратно", de: "Hin & Zurück", es: "i/v", fr: "a/r" },
    topChoice: { it: "Top", en: "Top", ru: "Топ", de: "Top" },
    phName: { it: "Farmacia", en: "Pharmacy", ru: "Аптека", de: "Apotheke" },
    phDistance: { it: "Distanza", en: "Distance", ru: "Расстояние", de: "Entfernung" },
    phPhone: { it: "Tel.", en: "Phone", ru: "Тел.", de: "Tel." },
    "type-supermarket": { it: "Alimentari", en: "Groceries", ru: "Продукты", de: "Lebensmittel" },
    "type-pharmacy": { it: "Farmacia", en: "Pharmacy", ru: "Аптека", de: "Apotheke" },
    "type-atm": { it: "Banca / ATM", en: "Bank / ATM", ru: "Банк / ATM", de: "Bank / ATM" },
    "type-post": { it: "Posta", en: "Post office", ru: "Почта", de: "Post" },
    "type-bakery": { it: "Forno", en: "Bakery", ru: "Пекарня", de: "Bäckerei" },
    "type-outdoor": { it: "Outdoor", en: "Outdoor", ru: "Активный отдых", de: "Outdoor" },
    "type-bar": { it: "Bar", en: "Bar", ru: "Бар", de: "Bar" },
    "type-restaurant": { it: "Ristorante", en: "Restaurant", ru: "Ресторан", de: "Restaurant" },
    "type-newsstand": { it: "Edicola", en: "Newsstand", ru: "Газетный киоск", de: "Kiosk" },
    "type-ferry": { it: "Traghetto", en: "Ferry", ru: "Паром", de: "Fähre" },
    "type-bus": { it: "Autobus", en: "Bus", ru: "Автобус", de: "Bus" },
    "type-funicular": { it: "Funivia", en: "Cable car", ru: "Фуникулёр", de: "Seilbahn" },
    "type-boat-rental": { it: "Noleggio barche", en: "Boat rental", ru: "Аренда лодок", de: "Bootsverleih" },
    "type-bike-rental": { it: "Noleggio bici", en: "Bike rental", ru: "Аренда велосипедов", de: "Fahrradverleih" },
    tripadvisorRestaurantsTitle: {
      it: "I ristoranti di Argegno su TripAdvisor",
      en: "Argegno restaurants on TripAdvisor",
      ru: "Рестораны Ардженьо на TripAdvisor",
      de: "Argegnos Restaurants auf TripAdvisor",
    },
    tripadvisorRestaurantsSubtitle: {
      it: "Vedi tutte le recensioni, foto e classifiche in tempo reale. Inquadra il QR per aprire la pagina sul tuo smartphone.",
      en: "See all reviews, photos and live rankings. Scan the QR to open the page on your phone.",
      ru: "Все отзывы, фото и актуальные рейтинги. Отсканируйте QR, чтобы открыть страницу на смартфоне.",
      de: "Alle Bewertungen, Fotos und Live-Rankings. QR scannen, um die Seite auf dem Smartphone zu öffnen.",
    },
  };
  return labels[key]?.[locale] ?? labels[key]?.it ?? key;
}
