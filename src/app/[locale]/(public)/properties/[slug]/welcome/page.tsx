import { notFound } from "next/navigation";
import {
  Baby,
  Sparkles,
  AlertTriangle,
  Waves,
  Ruler,
  BedDouble,
  Utensils,
  Trees,
} from "lucide-react";
import { collections } from "@/lib/mongodb/collections";
import {
  pickLocalized,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "@/lib/welcome-book/i18n";
import type { SupportedLocale, HouseGuideDoc } from "@/types/database";
import type { Locale } from "@/i18n/routing";
import { getPortfolioEntry } from "@/lib/portfolio";
import { welcomeHero } from "@/lib/welcome-book/hero";
import { RoomCarousel } from "@/components/welcome-book/RoomCarousel";
import { BrandHero } from "@/components/welcome-book/BrandDecorations";
import { LocaleSwitcher } from "@/components/welcome-book/LocaleSwitcher";
import { HubNav } from "@/components/welcome-book/HubNav";
import { HeroWifiInline } from "@/components/welcome-book/HeroWifiInline";
import { TileCard } from "@/components/welcome-book/TileCard";
import { sharedLabel } from "@/components/welcome-book/sharedLabels";
import { ReviewBlock } from "@/components/welcome-book/ReviewBlock";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string; locale: Locale };
  searchParams: { lang?: string };
}

export default async function HouseGuidePage({ params, searchParams }: PageProps) {
  const { slug, locale: routeLocale } = params;
  const { lang } = searchParams;
  const locale: SupportedLocale = isSupportedLocale(lang)
    ? lang
    : (routeLocale as SupportedLocale);

  const guidesCol = await collections.houseGuides();
  const guide = (await guidesCol.findOne({ propertySlug: slug })) as HouseGuideDoc | null;
  if (!guide) return notFound();

  const portfolioEntry = getPortfolioEntry(slug);
  const propertyName = portfolioEntry?.name ?? "Aqua Vista";
  const propertyCity = portfolioEntry?.address.city ?? "Argegno";

  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  const basePath = `/properties/${slug}/welcome`;

  const heroImage = welcomeHero(slug);

  // Layout: the lake/courtyard split only fits a 2-bedroom lakefront home.
  // Smaller apartments render a single unified "rooms" section instead.
  const hasLakeView = portfolioEntry?.details?.hasLakeView ?? true;
  const splitLayout =
    hasLakeView &&
    (guide.sections.bedrooms.length > 1 || guide.sections.bathrooms.length > 1);
  // "Cortile" only reads right for the lakefront home; other properties use a
  // neutral "Spazi esterni" label (fits courtyards, terraces and balconies).
  const gardenLabel = hasLakeView
    ? sectionLabel("garden", locale)
    : sectionLabel("outdoor", locale);

  return (
    <main className="font-[family-name:var(--font-outfit)] bg-white">
      <BrandHero
        eyebrow={`${sharedLabel("guideTo", locale).toUpperCase()} ${propertyCity.toUpperCase()}`}
        title={`${sharedLabel("welcomeTo", locale)} ${propertyName}`}
        heroImage={heroImage}
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
      <HubNav slug={slug} routeLocale={routeLocale} contentLocale={locale} current="casa" />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Riga 1 — Camere e bagni (split lago/cortile solo per case fronte-lago) */}
        {splitLayout ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-7 sm:mb-10">
          <div
            className="relative overflow-hidden rounded-3xl p-5 sm:p-7 ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
            style={{ backgroundColor: "#1D3A62" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.10] bg-cover bg-center pointer-events-none print:hidden"
              style={{ backgroundImage: "url('/images/textures/como-trama.webp')" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/15 pointer-events-none"
            />
            <div className="relative flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
              <p className="text-sm sm:text-base uppercase tracking-[0.18em] font-bold text-white">
                {sectionLabel("sideLake", locale)}
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-4 sm:gap-5">
              {guide.sections.bedrooms[0] && (
                <TileCard
                  photo={guide.sections.photos?.bedroom1?.[0]}
                  title={stripParens(t(guide.sections.bedrooms[0].name))}
                  subtitle={guide.sections.bedrooms[0].bedType.replace(/-/g, " ")}
                  captionBelow
                >
                  <RoomModalContent guide={guide} index={0} t={t} />
                </TileCard>
              )}
              {guide.sections.bathrooms[0] && (
                <TileCard
                  photo={guide.sections.photos?.bathroom1?.[0]}
                  title={stripParens(t(guide.sections.bathrooms[0].name))}
                  subtitle={bathSubtitle(guide.sections.bathrooms[0].features, locale)}
                  captionBelow
                >
                  <BathroomModalContent guide={guide} index={0} t={t} />
                </TileCard>
              )}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl p-5 sm:p-7 ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
            style={{ backgroundColor: "#1D3A62" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.10] bg-cover bg-center pointer-events-none print:hidden"
              style={{ backgroundImage: "url('/images/textures/como-trama.webp')" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/15 pointer-events-none"
            />
            <div className="relative flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Trees className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
              <p className="text-sm sm:text-base uppercase tracking-[0.18em] font-bold text-white">
                {sectionLabel("sideCourtyard", locale)}
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-4 sm:gap-5">
              {guide.sections.bedrooms[1] && (
                <TileCard
                  photo={guide.sections.photos?.bedroom2?.[0]}
                  title={stripParens(t(guide.sections.bedrooms[1].name))}
                  subtitle={guide.sections.bedrooms[1].bedType.replace(/-/g, " ")}
                  captionBelow
                >
                  <RoomModalContent guide={guide} index={1} t={t} />
                </TileCard>
              )}
              {guide.sections.bathrooms[1] && (
                <TileCard
                  photo={guide.sections.photos?.bathroom2?.[0]}
                  title={stripParens(t(guide.sections.bathrooms[1].name))}
                  subtitle={bathSubtitle(guide.sections.bathrooms[1].features, locale)}
                  captionBelow
                >
                  <BathroomModalContent guide={guide} index={1} t={t} />
                </TileCard>
              )}
            </div>
          </div>
        </div>
        ) : (
        <div className="mb-7 sm:mb-10">
          <div
            className="relative overflow-hidden rounded-3xl p-5 sm:p-7 ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
            style={{ backgroundColor: "#1D3A62" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.10] bg-cover bg-center pointer-events-none print:hidden"
              style={{ backgroundImage: "url('/images/textures/como-trama.webp')" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/15 pointer-events-none"
            />
            <div className="relative flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <BedDouble className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
              <p className="text-sm sm:text-base uppercase tracking-[0.18em] font-bold text-white">
                {sectionLabel("rooms", locale)}
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
              {guide.sections.bedrooms.map((b, i) => (
                <TileCard
                  key={`bed-${i}`}
                  photo={guide.sections.photos?.[i === 0 ? "bedroom1" : "bedroom2"]?.[0]}
                  title={stripParens(t(b.name))}
                  subtitle={b.bedType.replace(/-/g, " ")}
                  captionBelow
                >
                  <RoomModalContent guide={guide} index={i} t={t} />
                </TileCard>
              ))}
              {guide.sections.bathrooms.map((b, i) => (
                <TileCard
                  key={`bath-${i}`}
                  photo={guide.sections.photos?.[i === 0 ? "bathroom1" : "bathroom2"]?.[0]}
                  title={stripParens(t(b.name))}
                  subtitle={bathSubtitle(b.features, locale)}
                  captionBelow
                >
                  <BathroomModalContent guide={guide} index={i} t={t} />
                </TileCard>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Riga 2 — Zona pranzo, Cucina, Soggiorno */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 last-tile-center-mobile">
          {guide.sections.photos?.diningArea && guide.sections.photos.diningArea.length > 0 && (
            <TileCard
              photo={guide.sections.photos.diningArea[0]}
              title={sectionLabel("dining", locale)}
              captionBelow
            >
              <DiningModalContent guide={guide} t={t} locale={locale} />
            </TileCard>
          )}
          <TileCard
            photo={guide.sections.photos?.kitchen?.[0]}
            title={sectionLabel("kitchen", locale)}
            captionBelow
          >
            <KitchenModalContent guide={guide} t={t} locale={locale} />
          </TileCard>
          <TileCard
            photo={guide.sections.photos?.livingRoom?.[0]}
            title={sectionLabel("living", locale)}
            captionBelow
          >
            <TextRoomModalContent
              photos={guide.sections.photos?.livingRoom ?? []}
              title={sectionLabel("living", locale)}
              body={t(guide.sections.livingRoom)}
            />
          </TileCard>
        </div>

        {/* Riga 3 — Vista esterna, Cortile, Accesso lago */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 last-tile-center-mobile">
          {guide.sections.photos?.exterior && guide.sections.photos.exterior.length > 0 && (
            <TileCard
              photo={guide.sections.photos.exterior[0]}
              title={sectionLabel("exterior", locale)}
              captionBelow
            >
              <TextRoomModalContent
                photos={guide.sections.photos.exterior}
                title={sectionLabel("exterior", locale)}
                body={label(hasLakeView ? "exteriorBlurb" : "exteriorBlurbCity", locale)}
              />
            </TileCard>
          )}
          <TileCard
            photo={guide.sections.photos?.garden?.[0]}
            title={gardenLabel}
            captionBelow
          >
            <TextRoomModalContent
              photos={guide.sections.photos?.garden ?? []}
              title={gardenLabel}
              body={t(guide.sections.outdoor.courtyard)}
            />
          </TileCard>
          {guide.sections.outdoor.beach && (
            <TileCard
              photo={guide.sections.photos?.beach?.[0]}
              title={sectionLabel("beach", locale)}
              captionBelow
            >
              <BeachModalContent guide={guide} t={t} locale={locale} />
            </TileCard>
          )}
        </div>
      </article>

      {guide.sections.feedback && (
        <ReviewBlock feedback={t(guide.sections.feedback)} locale={locale} />
      )}
    </main>
  );
}

type Translator = (text: Parameters<typeof pickLocalized>[0]) => string;

function RoomModalContent({
  guide,
  index,
  t,
}: {
  guide: HouseGuideDoc;
  index: number;
  t: Translator;
}) {
  const b = guide.sections.bedrooms[index];
  if (!b) return null;
  const photoKey = index === 0 ? "bedroom1" : "bedroom2";
  const photos = guide.sections.photos?.[photoKey] ?? [];
  return (
    <div className="p-5 sm:p-7">
      <RoomCarousel photos={photos} alt={t(b.name)} />
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 mb-3">
          <h2 className="font-bold text-2xl text-slate-900 leading-tight">{t(b.name)}</h2>
          {b.surfaceSqm && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-semibold">
              <Ruler className="w-3 h-3" /> {b.surfaceSqm} m²
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-semibold">
            <BedDouble className="w-3 h-3" /> {b.bedType.replace(/-/g, " ")}
          </span>
        </div>
        {b.view && <p className="text-sm text-slate-600 italic mb-3">{t(b.view)}</p>}
        {b.amenities && b.amenities.length > 0 && (
          <ul className="space-y-1.5 text-sm">
            {b.amenities.map((a, j) => (
              <li key={j} className="flex items-start gap-2">
                <span className="text-[#2E5A8C] mt-1 leading-none">•</span>
                <span className="text-slate-700">{t(a)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BathroomModalContent({
  guide,
  index,
  t,
}: {
  guide: HouseGuideDoc;
  index: number;
  t: Translator;
}) {
  const b = guide.sections.bathrooms[index];
  if (!b) return null;
  const photoKey = index === 0 ? "bathroom1" : "bathroom2";
  const photos = guide.sections.photos?.[photoKey] ?? [];
  return (
    <div className="p-5 sm:p-7">
      <RoomCarousel photos={photos} alt={t(b.name)} />
      <div className="mt-5">
        <h2 className="font-bold text-2xl text-slate-900 leading-tight">{t(b.name)}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {b.features.map((f, j) => (
            <span
              key={j}
              className="text-xs px-2 py-0.5 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-medium"
            >
              {f}
            </span>
          ))}
        </div>
        {b.notes && <p className="mt-3 text-sm text-slate-700 leading-relaxed">{t(b.notes)}</p>}
      </div>
    </div>
  );
}

function KitchenModalContent({
  guide,
  t,
  locale,
}: {
  guide: HouseGuideDoc;
  t: Translator;
  locale: SupportedLocale;
}) {
  return (
    <div className="p-5 sm:p-7">
      <RoomCarousel
        photos={guide.sections.photos?.kitchen ?? []}
        alt={sectionLabel("kitchen", locale)}
      />
      <div className="mt-5">
        <h2 className="font-bold text-2xl text-slate-900 leading-tight mb-3">
          {sectionLabel("kitchen", locale)}
        </h2>
        <p className="text-base leading-relaxed text-slate-700">
          {t(guide.sections.kitchen.description)}
        </p>
        {guide.sections.kitchen.historicElements && (
          <p className="mt-4 italic text-sm text-slate-600 bg-amber-50 border-l-4 border-amber-400 pl-3 py-2 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{t(guide.sections.kitchen.historicElements)}</span>
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {guide.sections.kitchen.appliances.map((a, i) => (
            <div
              key={i}
              className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-center"
            >
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                {t(a.name)}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiningModalContent({
  guide,
  t,
  locale,
}: {
  guide: HouseGuideDoc;
  t: Translator;
  locale: SupportedLocale;
}) {
  return (
    <div className="p-5 sm:p-7">
      <RoomCarousel
        photos={guide.sections.photos?.diningArea ?? []}
        alt={sectionLabel("dining", locale)}
      />
      <div className="mt-5">
        <h2 className="font-bold text-2xl text-slate-900 leading-tight mb-3">
          {sectionLabel("dining", locale)}
        </h2>
        {guide.sections.diningArea && (
          <p className="text-base leading-relaxed text-slate-700 mb-4">
            {t(guide.sections.diningArea)}
          </p>
        )}
        {guide.sections.diningArea_chips && guide.sections.diningArea_chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {guide.sections.diningArea_chips.map((c, j) => (
              <span
                key={j}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-semibold"
              >
                {c.icon === "utensils" && <Utensils className="w-3 h-3" />}
                {c.icon === "baby" && <Baby className="w-3 h-3" />}
                {c.icon === "ruler" && <Ruler className="w-3 h-3" />}
                <span>{t(c.label)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TextRoomModalContent({
  photos,
  title,
  body,
}: {
  photos: string[];
  title: string;
  body: string;
}) {
  return (
    <div className="p-5 sm:p-7">
      {photos.length > 0 && <RoomCarousel photos={photos} alt={title} />}
      <div className="mt-5">
        <h2 className="font-bold text-2xl text-slate-900 leading-tight mb-3">{title}</h2>
        <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{body}</p>
      </div>
    </div>
  );
}

function BeachModalContent({
  guide,
  t,
  locale,
}: {
  guide: HouseGuideDoc;
  t: Translator;
  locale: SupportedLocale;
}) {
  return (
    <div className="p-5 sm:p-7">
      <RoomCarousel
        photos={guide.sections.photos?.beach ?? []}
        alt={sectionLabel("beach", locale)}
      />
      <div className="mt-5">
        <h2 className="font-bold text-2xl text-slate-900 leading-tight mb-3">
          {sectionLabel("beach", locale)}
        </h2>
        {guide.sections.outdoor.beach && (
          <p className="text-base leading-relaxed font-medium text-[#1D3A62] flex items-start gap-2">
            <Waves className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{t(guide.sections.outdoor.beach)}</span>
          </p>
        )}
        {guide.sections.outdoor.safety && (
          <p className="mt-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{t(guide.sections.outdoor.safety)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function stripParens(s: string): string {
  return s.replace(/\s*\([^)]*\)/g, "").trim();
}

function bathSubtitle(features: string[] | undefined, locale: SupportedLocale): string | undefined {
  if (!features || features.length === 0) return undefined;
  const primary = features[0].toLowerCase();
  const map: Record<string, Partial<Record<SupportedLocale, string>>> = {
    doccia: { it: "doccia", en: "shower", ru: "душ", de: "Dusche", es: "ducha", fr: "douche" },
    vasca: { it: "vasca", en: "bathtub", ru: "ванна", de: "Badewanne", es: "bañera", fr: "baignoire" },
  };
  return map[primary]?.[locale] ?? map[primary]?.it ?? features[0];
}

function sectionLabel(key: string, locale: SupportedLocale): string {
  const labels: Record<string, Partial<Record<SupportedLocale, string>>> = {
    rooms: { it: "Camere e bagni", en: "Rooms & bathrooms", ru: "Комнаты и ванные", de: "Zimmer & Bäder", es: "Habitaciones y baños", fr: "Chambres et salles de bain" },
    living: { it: "Soggiorno", en: "Living Room", ru: "Гостиная", de: "Wohnzimmer" },
    kitchen: { it: "Cucina", en: "Kitchen", ru: "Кухня", de: "Küche" },
    dining: { it: "Zona pranzo", en: "Dining area", ru: "Обеденная зона", de: "Essbereich", es: "Comedor" },
    exterior: { it: "Vista esterna casa", en: "House exterior", ru: "Внешний вид дома", de: "Außenansicht Haus", es: "Exterior casa" },
    garden: { it: "Cortile", en: "Courtyard", ru: "Двор", de: "Innenhof", es: "Patio", fr: "Cour" },
    outdoor: { it: "Spazi esterni", en: "Outdoor spaces", ru: "Открытые пространства", de: "Außenbereiche", es: "Espacios exteriores", fr: "Espaces extérieurs" },
    beach: { it: "Accesso al lago", en: "Lake access", ru: "Выход к озеру", de: "Seezugang", es: "Acceso al lago" },
    sideLake: { it: "Lato lago", en: "Lake side", ru: "Со стороны озера", de: "Seeseite", es: "Lado del lago", fr: "Côté lac" },
    sideCourtyard: { it: "Lato cortile", en: "Courtyard side", ru: "Со стороны двора", de: "Hofseite", es: "Lado del patio", fr: "Côté cour" },
  };
  return labels[key]?.[locale] ?? labels[key]?.it ?? key;
}

function label(key: string, locale: SupportedLocale): string {
  const labels: Record<string, Partial<Record<SupportedLocale, string>>> = {
    exteriorBlurb: {
      it: "L'esterno della casa fronte lago, dall'ingresso al pontile.",
      en: "Lakefront exterior of the house, from the entrance to the pier.",
      ru: "Внешний вид дома у озера, от входа до пирса.",
      de: "Seeseitige Außenansicht des Hauses, vom Eingang bis zum Steg.",
      es: "Exterior de la casa frente al lago, desde la entrada hasta el muelle.",
    },
    exteriorBlurbCity: {
      it: "Gli spazi esterni della casa: l'edificio, l'ingresso e i dintorni.",
      en: "The home's exterior: the building, the entrance and the surroundings.",
      ru: "Внешние пространства дома: здание, вход и окрестности.",
      de: "Die Außenbereiche des Hauses: Gebäude, Eingang und Umgebung.",
      es: "Los espacios exteriores de la casa: el edificio, la entrada y los alrededores.",
    },
  };
  return labels[key]?.[locale] ?? labels[key]?.it ?? key;
}
