import Link from "next/link";
import { MapPin, Home as HomeIcon, ParkingSquare, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SupportedLocale } from "@/types/database";
import type { Locale } from "@/i18n/routing";

export type HubTab = "guida" | "casa" | "parcheggi" | "info";

type TabDef = {
  key: HubTab;
  segment: string;
  Icon: LucideIcon;
  label: Partial<Record<SupportedLocale, string>>;
};

const TABS: TabDef[] = [
  {
    key: "casa",
    segment: "",
    Icon: HomeIcon,
    label: {
      it: "Tour della casa",
      en: "House tour",
      ru: "Тур по дому",
      de: "Haustour",
      pl: "Zwiedzanie domu",
      es: "Tour de la casa",
      fr: "Visite maison",
    },
  },
  {
    key: "guida",
    segment: "/guida",
    Icon: MapPin,
    label: {
      it: "Guida zona",
      en: "Area guide",
      ru: "Гид по зоне",
      de: "Reiseführer",
      pl: "Przewodnik po okolicy",
      es: "Guía de zona",
      fr: "Guide zone",
    },
  },
  {
    key: "parcheggi",
    segment: "/parcheggi",
    Icon: ParkingSquare,
    label: {
      it: "Parcheggi",
      en: "Parking",
      ru: "Парковка",
      de: "Parken",
      pl: "Parking",
      es: "Aparcamiento",
      fr: "Parking",
    },
  },
  {
    key: "info",
    segment: "/info-utili",
    Icon: LifeBuoy,
    label: {
      it: "Info & emergenze",
      en: "Info & emergencies",
      ru: "Инфо и экстренные",
      de: "Info & Notfälle",
      pl: "Info i nagłe wypadki",
      es: "Info & emergencias",
      fr: "Infos & urgences",
    },
  },
];

export function HubNav({
  slug,
  routeLocale,
  contentLocale,
  current,
}: {
  slug: string;
  routeLocale: Locale;
  contentLocale: SupportedLocale;
  current: HubTab;
}) {
  const localePrefix = routeLocale === "it" ? "" : `/${routeLocale}`;
  const langQuery =
    contentLocale !== routeLocale ? `?lang=${contentLocale}` : "";

  return (
    <nav
      aria-label="Menu sezioni"
      className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 print:hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {TABS.map((tab) => {
          const active = tab.key === current;
          const Icon = tab.Icon;
          const href = `${localePrefix}/properties/${slug}/welcome${tab.segment}${langQuery}`;
          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-4 sm:py-4 min-h-[64px] rounded-2xl bg-[#1D3A62] text-white text-sm font-semibold shadow-md ring-2 ring-[#1D3A62]/30 ring-offset-2 transition-all"
                  : "group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-4 sm:py-4 min-h-[64px] rounded-2xl bg-white text-[#1D3A62] text-sm font-semibold border-2 border-slate-200 shadow-sm hover:border-[#1D3A62] hover:bg-[#E8EDF5] active:bg-[#E8EDF5] transition-all"
              }
            >
              <Icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2.2} />
              <span className="text-center sm:text-left leading-tight">
                {tab.label[contentLocale] ?? tab.label.it}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
