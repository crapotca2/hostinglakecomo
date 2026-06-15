import Link from "next/link";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/lib/welcome-book/i18n";
import type { SupportedLocale } from "@/types/database";

const FLAG_COUNTRY: Record<SupportedLocale, string> = {
  it: "it",
  en: "gb",
  ru: "ru",
  de: "de",
  es: "es",
  fr: "fr",
};

export function LocaleSwitcher({
  currentLocale,
  basePath,
  centered = false,
}: {
  currentLocale: SupportedLocale;
  /** Base path della pagina corrente (es. "/properties/aqua-vista-di-splendore/welcome"). */
  basePath: string;
  centered?: boolean;
}) {
  return (
    <nav
      className={`flex flex-wrap items-center gap-2 text-sm font-[family-name:var(--font-outfit)] ${
        centered ? "justify-center" : "justify-end"
      }`}
      aria-label="Language"
    >
      {SUPPORTED_LOCALES.map((loc) => {
        const active = loc === currentLocale;
        const cc = FLAG_COUNTRY[loc];
        const classes = active
          ? "bg-[#1D3A62] text-white border-[#1D3A62] shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:border-[#1D3A62] hover:text-[#1D3A62]";
        // Per le 3 lingue native del sito (it/en/ru) usa URL prefix nativi.
        // Per le 3 extra (de/es/fr) usa query ?lang=.
        const isNativeLocale = loc === "it" || loc === "en" || loc === "ru";
        const href = isNativeLocale
          ? `${loc === "it" ? "" : `/${loc}`}${basePath}`
          : `${basePath}?lang=${loc}`;
        return (
          <Link
            key={loc}
            href={href}
            aria-current={active ? "true" : undefined}
            className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border font-semibold transition-all ${classes}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/48x36/${cc}.png`}
              srcSet={`https://flagcdn.com/96x72/${cc}.png 2x`}
              alt=""
              aria-hidden
              width={24}
              height={18}
              className="rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_1px_2px_rgba(15,23,42,0.18)] object-cover flex-shrink-0"
              loading="lazy"
            />
            <span className="hidden sm:inline">{LOCALE_LABELS[loc]}</span>
            <span className="sm:hidden uppercase text-xs tracking-wide">{loc}</span>
          </Link>
        );
      })}
    </nav>
  );
}
