import { notFound } from "next/navigation";
import { Car, Zap, ZapOff, AlertTriangle, Euro } from "lucide-react";
import { collections } from "@/lib/mongodb/collections";
import {
  pickLocalized,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "@/lib/welcome-book/i18n";
import type { SupportedLocale, HouseGuideDoc, WelcomeBookDoc, ParkingSpot, EvChargingStation } from "@/types/database";
import type { Locale } from "@/i18n/routing";
import { getPortfolioEntry } from "@/lib/portfolio";
import { BrandHero } from "@/components/welcome-book/BrandDecorations";
import { welcomeHero } from "@/lib/welcome-book/hero";
import { LocaleSwitcher } from "@/components/welcome-book/LocaleSwitcher";
import { HubNav } from "@/components/welcome-book/HubNav";
import { RoomCarousel } from "@/components/welcome-book/RoomCarousel";
import { HeroWifiInline } from "@/components/welcome-book/HeroWifiInline";
import { TileCard } from "@/components/welcome-book/TileCard";
import { sharedLabel, welcomeTitle } from "@/components/welcome-book/sharedLabels";
import { ReviewBlock } from "@/components/welcome-book/ReviewBlock";
import { ParkingPoiCard } from "@/components/welcome-book/ParkingPoiCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string; locale: Locale };
  searchParams: { lang?: string };
}

const HOUSE_ORIGIN = "Via Spluga 44, Argegno";

function buildDirectionsUrl(destination: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin: HOUSE_ORIGIN,
    destination,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export default async function ParkingPage({ params, searchParams }: PageProps) {
  const { slug, locale: routeLocale } = params;
  const { lang } = searchParams;
  const locale: SupportedLocale = isSupportedLocale(lang)
    ? lang
    : (routeLocale as SupportedLocale);

  const guidesCol = await collections.houseGuides();
  const guide = (await guidesCol.findOne({ propertySlug: slug })) as HouseGuideDoc | null;
  if (!guide) return notFound();

  const wbCol = await collections.welcomeBooks();
  const wb = (await wbCol.findOne({ propertySlug: slug })) as WelcomeBookDoc | null;

  const portfolioEntry = getPortfolioEntry(slug);
  const propertyName = portfolioEntry?.name ?? "Aqua Vista";
  const propertyCity = portfolioEntry?.address.city ?? "Argegno";

  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  const parking = guide.sections.parking;
  const pkc = wb?.sections.parkingAndCharging;
  const basePath = `/properties/${slug}/welcome/parcheggi`;

  const privateModal = (
    <div className="p-5 sm:p-7">
      <RoomCarousel
        photos={guide.sections.photos?.parking ?? []}
        alt={label("housePrivateParking", locale)}
      />
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {label("housePrivateParking", locale)}
          </h2>
          <span className="inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-[#1D3A62] border border-slate-200">
            <Euro className="w-3 h-3" />
            {label("privatePriceChip", locale)}
          </span>
        </div>

        <p className="text-base leading-relaxed text-slate-800">
          {label("privateDescription", locale)}
        </p>

        <p className="mt-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{label("condoRules", locale)}</span>
        </p>

        {parking.maxDimensions && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider font-bold text-[#1D3A62] mb-2">
              {label("maxDimensions", locale)}
            </p>
            <div className="inline-flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1.5 rounded-md bg-[#E8EDF5] border border-[#1D3A62]/20 font-mono font-bold text-[#1D3A62]">
                H {parking.maxDimensions.heightM} m
              </span>
              <span className="px-3 py-1.5 rounded-md bg-[#E8EDF5] border border-[#1D3A62]/20 font-mono font-bold text-[#1D3A62]">
                L {parking.maxDimensions.lengthM} m
              </span>
              <span className="px-3 py-1.5 rounded-md bg-[#E8EDF5] border border-[#1D3A62]/20 font-mono font-bold text-[#1D3A62]">
                W {parking.maxDimensions.widthM} m
              </span>
            </div>
          </div>
        )}

        {!parking.evChargingAllowed && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
            <ZapOff className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{label("noEvCharging", locale)}</span>
          </p>
        )}
      </div>
    </div>
  );

  const publicSpots = (pkc?.localParking ?? []).filter((p: ParkingSpot) => p.type !== "paid-private");
  const publicModal = publicSpots.length > 0 ? (
    <div className="p-5 sm:p-7">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        {label("publicParkingArgegno", locale)}
      </h2>
      {pkc?.generalInfo && (
        <p className="text-sm leading-relaxed text-slate-700 mb-5">{t(pkc.generalInfo)}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {publicSpots.map((p: ParkingSpot, i: number) => {
          const destination = p.googleMapsUrl
            ? new URL(p.googleMapsUrl).searchParams.get("query") ?? p.address ?? p.name
            : p.address ?? p.name;
          return (
            <ParkingPoiCard
              key={i}
              poi={{
                categoryLabel: label("catPublicParking", locale),
                name: p.name,
                address: p.address,
                qrUrl: buildDirectionsUrl(destination),
                scanShortLabel: label("scanShort", locale),
                scanAriaLabel: label("scanAriaParking", locale),
                minLabel: label("min", locale),
                walkMinutes: p.walkMinutes ?? null,
                paidStatus: p.type === "free" ? "free" : "paid",
                freeLabel: label("free", locale),
                paidLabel: label("paid", locale),
                notes: p.notes ? t(p.notes) : undefined,
                infoLabel: label("moreInfo", locale),
                openInMapsLabel: label("openInMaps", locale),
              }}
            />
          );
        })}
      </div>
    </div>
  ) : null;

  const evModal = pkc?.evChargingStations && pkc.evChargingStations.length > 0 ? (
    <div className="p-5 sm:p-7">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">{label("evCharging", locale)}</h2>
      <p className="text-sm leading-relaxed text-slate-700 mb-5">{label("evIntro", locale)}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {pkc.evChargingStations.map((e: EvChargingStation, i: number) => {
          const connectors = e.connectors ?? [];
          const maxKw = connectors.length > 0 ? Math.max(...connectors.map((c: { type: string; powerKw: number; pricePerKwhEur?: number }) => c.powerKw ?? 0)) : 0;
          const destination = e.googleMapsUrl
            ? new URL(e.googleMapsUrl).searchParams.get("query") ?? e.address ?? e.stationName
            : e.address ?? e.stationName;
          return (
            <ParkingPoiCard
              key={i}
              poi={{
                categoryLabel: label("catEvCharging", locale),
                name: e.stationName,
                address: e.address,
                qrUrl: buildDirectionsUrl(destination),
                scanShortLabel: label("scanShort", locale),
                scanAriaLabel: label("scanAriaEv", locale),
                minLabel: label("min", locale),
                distanceKm: e.distanceFromPropertyKm ?? null,
                powerKw: maxKw || null,
                notes: e.notes ? t(e.notes) : undefined,
                appUrl: e.appUrl,
                appWebsiteLabel: label("appWebsite", locale),
                infoLabel: label("moreInfo", locale),
                openInMapsLabel: label("openInMaps", locale),
              }}
            />
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <main className="font-[family-name:var(--font-outfit)] bg-white">
      <BrandHero
        eyebrow={`${sharedLabel("guideTo", locale).toUpperCase()} ${propertyCity.toUpperCase()}`}
        title={welcomeTitle(propertyName, locale)}
        heroImage={welcomeHero(slug)}
        wifiBlock={
          <HeroWifiInline
            ssid={guide.sections.wifi.ssid}
            password={guide.sections.wifi.password}
            ssidLabel={sharedLabel("ssid", locale)}
            passwordLabel={sharedLabel("password", locale)}
            scanLabel={sharedLabel("scanToConnect", locale)}
          />
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-4 print:hidden">
        <div className="flex flex-col items-center gap-4">
          <LocaleSwitcher currentLocale={locale} basePath={basePath} centered />
        </div>
      </div>
      <HubNav slug={slug} routeLocale={routeLocale} contentLocale={locale} current="parcheggi" />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="hidden md:flex relative items-center justify-center py-6 min-h-[28rem]">
          {publicModal && (
            <div className="relative w-[26%] -mr-10 z-10 transform -rotate-3 scale-[0.92] opacity-95 transition-all duration-300 hover:rotate-0 hover:scale-[0.98] hover:opacity-100 hover:z-40">
              <TileCard
                icon={<Car />}
                title={label("publicParkingArgegno", locale)}
                subtitle={label("freePaid", locale)}
              >
                {publicModal}
              </TileCard>
            </div>
          )}

          <div className="relative w-[44%] z-30 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.35)] rounded-2xl">
            <TileCard
              photo={guide.sections.photos?.parking?.[0]}
              icon={<Car />}
              title={label("housePrivateParking", locale)}
              subtitle={label("privatePriceChip", locale)}
              captionBelow
            >
              {privateModal}
            </TileCard>
          </div>

          {evModal && (
            <div className="relative w-[26%] -ml-10 z-10 transform rotate-3 scale-[0.92] opacity-95 transition-all duration-300 hover:rotate-0 hover:scale-[0.98] hover:opacity-100 hover:z-40">
              <TileCard
                icon={<Zap />}
                title={label("evCharging", locale)}
                subtitle={label("perKw", locale)}
              >
                {evModal}
              </TileCard>
            </div>
          )}
        </div>

        <div className="md:hidden flex flex-col items-center gap-4">
          <div className="w-full max-w-md">
            <TileCard
              photo={guide.sections.photos?.parking?.[0]}
              icon={<Car />}
              title={label("housePrivateParking", locale)}
              subtitle={label("privatePriceChip", locale)}
              captionBelow
            >
              {privateModal}
            </TileCard>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {publicModal && (
              <TileCard
                icon={<Car />}
                title={label("publicParkingArgegno", locale)}
              >
                {publicModal}
              </TileCard>
            )}
            {evModal && (
              <TileCard
                icon={<Zap />}
                title={label("evCharging", locale)}
              >
                {evModal}
              </TileCard>
            )}
          </div>
        </div>
      </article>

      {guide.sections.feedback && (
        <ReviewBlock feedback={t(guide.sections.feedback)} locale={locale} />
      )}
    </main>
  );
}

const LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  guideTo: { it: "Guida a", en: "Guide to", ru: "Гид по", de: "Reiseführer", es: "Guía de", fr: "Guide de" },
  housePrivateParking: {
    it: "Parcheggio privato della casa",
    en: "House private parking",
    ru: "Частная парковка дома",
    de: "Privater Hausparkplatz",
    es: "Aparcamiento privado de la casa",
    fr: "Parking privé de la maison",
  },
  publicParkingArgegno: {
    it: "Parcheggi pubblici ad Argegno",
    en: "Public parking in Argegno",
    ru: "Общественная парковка в Ардженьо",
    de: "Öffentliche Parkplätze in Argegno",
    es: "Aparcamientos públicos en Argegno",
    fr: "Parkings publics à Argegno",
  },
  evCharging: {
    it: "Stazioni di ricarica EV",
    en: "EV charging stations",
    ru: "Зарядные станции EV",
    de: "EV-Ladestationen",
    es: "Estaciones de carga EV",
    fr: "Bornes de recharge EV",
  },
  openInMaps: {
    it: "Apri Maps",
    en: "Open Maps",
    ru: "Открыть карту",
    de: "In Maps öffnen",
    es: "Abrir Maps",
    fr: "Ouvrir Maps",
  },
  privatePriceChip: {
    it: "€10 / notte",
    en: "€10 / night",
    ru: "€10 / ночь",
    de: "€10 / Nacht",
    es: "€10 / noche",
    fr: "€10 / nuit",
  },
  privateDescription: {
    it: "Posto auto privato della casa con ascensore. La tariffa è di €10 a notte per chi sceglie di lasciare l'auto parcheggiata. Gli ospiti possono comunque accedere gratuitamente per scaricare la spesa e i bagagli senza fermarsi a lungo.",
    en: "Private parking spot with car lift. The fee is €10 per night for guests who want to leave the car parked. Free access is allowed for unloading groceries and luggage without a long stay.",
    ru: "Частное парковочное место с автомобильным лифтом. Стоимость — €10 за ночь для тех, кто оставляет машину. Бесплатный заезд для выгрузки покупок и багажа без длительной стоянки.",
    de: "Privater Stellplatz mit Autoaufzug. Die Gebühr beträgt €10 pro Nacht für Gäste, die das Auto parken möchten. Kostenloser Zugang zum kurzen Be- und Entladen von Einkäufen und Gepäck.",
    es: "Plaza de aparcamiento privada con ascensor para coche. La tarifa es de €10 por noche para quien deja el coche aparcado. Acceso gratuito para descargar la compra y el equipaje sin estancia prolongada.",
    fr: "Place de parking privée avec ascenseur. Le tarif est de €10 par nuit pour les voyageurs qui souhaitent y laisser leur voiture. Accès gratuit pour décharger les courses et les bagages sans stationnement prolongé.",
  },
  condoRules: {
    it: "Regole condominiali: NON è consentito lasciare l'auto parcheggiata sui posti superiori del condominio. Solo carico/scarico breve. Per la sosta prolungata utilizzate il posto auto della casa con ascensore.",
    en: "Condo rules: cars CANNOT be left parked in the upper condo spots. Short loading/unloading only. For longer stays use the house parking spot with the car lift.",
    ru: "Правила кондоминиума: НЕЛЬЗЯ оставлять машину на верхних местах кондоминиума. Только короткая разгрузка. Для длительной стоянки — место с автомобильным лифтом.",
    de: "Hausordnung: Autos dürfen NICHT auf den oberen Stellplätzen des Hauses geparkt werden. Nur kurzes Be- und Entladen. Für längeres Parken den Hausstellplatz mit Autoaufzug nutzen.",
    es: "Reglas de la comunidad: NO está permitido dejar el coche aparcado en las plazas superiores. Solo carga/descarga breve. Para estancia prolongada usen el parking de la casa con ascensor.",
    fr: "Règles de copropriété : il n'est PAS permis de laisser la voiture stationnée sur les places supérieures de la copropriété. Chargement/déchargement court uniquement. Pour un stationnement prolongé utilisez la place de la maison avec ascenseur.",
  },
  appWebsite: { it: "Sito operatore", en: "Operator site", ru: "Сайт оператора", de: "Anbieter-Website", es: "Sitio del operador", fr: "Site de l'opérateur" },
  noEvCharging: {
    it: "ATTENZIONE: la ricarica di veicoli elettrici NON è consentita su questo posto auto privato della casa.",
    en: "WARNING: EV charging is NOT allowed in this private house parking spot.",
    ru: "ВНИМАНИЕ: зарядка электромобилей ЗАПРЕЩЕНА на этом частном парковочном месте дома.",
    de: "ACHTUNG: EV-Ladung ist an diesem privaten Hausparkplatz NICHT erlaubt.",
    es: "ATENCIÓN: la carga de vehículos eléctricos NO está permitida en esta plaza privada de la casa.",
    fr: "ATTENTION : la recharge de véhicules électriques N'EST PAS autorisée sur cette place privée de la maison.",
  },
  catPublicParking: {
    it: "PARCHEGGIO PUBBLICO",
    en: "PUBLIC PARKING",
    ru: "ОБЩЕСТВЕННАЯ ПАРКОВКА",
    de: "ÖFFENTLICHER PARKPLATZ",
    es: "APARCAMIENTO PÚBLICO",
    fr: "PARKING PUBLIC",
  },
  catEvCharging: {
    it: "RICARICA EV",
    en: "EV CHARGING",
    ru: "ЗАРЯДКА EV",
    de: "EV-LADUNG",
    es: "CARGA EV",
    fr: "RECHARGE EV",
  },
  scanShort: { it: "INQUADRA", en: "SCAN", ru: "СКАНИРУЙ", de: "SCANNEN", es: "ESCANEA", fr: "SCANNEZ" },
  scanAriaParking: {
    it: "Scansiona per il percorso al parcheggio",
    en: "Scan for directions to the parking",
    ru: "Сканируйте для маршрута к парковке",
    de: "Scannen für Wegbeschreibung zum Parkplatz",
    es: "Escanea para la ruta al aparcamiento",
    fr: "Scannez pour l'itinéraire vers le parking",
  },
  scanAriaEv: {
    it: "Scansiona per il percorso alla colonnina EV",
    en: "Scan for directions to the EV station",
    ru: "Сканируйте для маршрута к зарядке EV",
    de: "Scannen für Wegbeschreibung zur Ladestation",
    es: "Escanea para la ruta a la estación EV",
    fr: "Scannez pour l'itinéraire vers la borne EV",
  },
  min: { it: "min", en: "min", ru: "мин", de: "Min", es: "min", fr: "min" },
  free: { it: "Gratis", en: "Free", ru: "Бесплатно", de: "Kostenlos", es: "Gratis", fr: "Gratuit" },
  paid: { it: "A pagamento", en: "Paid", ru: "Платно", de: "Kostenpflichtig", es: "De pago", fr: "Payant" },
  moreInfo: { it: "Maggiori info", en: "More info", ru: "Подробнее", de: "Mehr Infos", es: "Más info", fr: "Plus d'infos" },
  maxDimensions: { it: "Dimensioni massime ascensore", en: "Max lift dimensions", ru: "Макс. размеры лифта", de: "Max. Aufzugmaße", es: "Dimensiones máx. ascensor", fr: "Dimensions max. ascenseur" },
  freePaid: { it: "gratis / a pagamento", en: "free / paid", ru: "бесплатно / платно", de: "kostenlos / kostenpflichtig", es: "gratis / de pago", fr: "gratuit / payant" },
  perKw: { it: "fast charge / standard", en: "fast charge / standard", ru: "быстрая / стандарт", de: "Schnell / Standard", es: "rápida / estándar", fr: "rapide / standard" },
  parkingOptionsAria: {
    it: "Opzioni di parcheggio",
    en: "Parking options",
    ru: "Варианты парковки",
    de: "Parkoptionen",
    es: "Opciones de aparcamiento",
    fr: "Options de stationnement",
  },
  evIntro: {
    it: "Le colonnine elettriche più vicine alla casa. Inquadra il QR per il percorso da Aqua Vista alla stazione di ricarica da te scelta.",
    en: "The closest EV chargers to the house. Scan the QR for directions from Aqua Vista to the charging station of your choice.",
    ru: "Ближайшие зарядки EV к дому. Сканируйте QR для маршрута от Aqua Vista до выбранной вами зарядной станции.",
    de: "Die nächstgelegenen EV-Ladestationen zum Haus. QR scannen für die Wegbeschreibung von Aqua Vista zur von Ihnen gewählten Ladestation.",
    es: "Las estaciones EV más cercanas a la casa. Escanea el QR para la ruta desde Aqua Vista a la estación de carga que elijas.",
    fr: "Les bornes EV les plus proches de la maison. Scannez le QR pour l'itinéraire depuis Aqua Vista jusqu'à la borne de recharge de votre choix.",
  },
};

function label(key: string, locale: SupportedLocale): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.it ?? key;
}
