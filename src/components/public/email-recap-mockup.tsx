"use client";

import { Star, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

const HIGHLIGHT_KEYS = ["revenue", "nights", "adr", "reviews"] as const;

export function EmailRecapMockup() {
  const t = useTranslations("mockups.email");
  return (
    <div className="rounded-2xl border border-border/60 bg-white text-foreground shadow-2xl overflow-hidden select-none max-w-md mx-auto">
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            {t("period")}
          </div>
          <div className="text-base font-semibold">{t("propertyName")}</div>
        </div>
        <p className="text-sm leading-relaxed">
          {t("introPrefix")}
          <strong>{t("introStrong")}</strong>
          {t("introSuffix")}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {HIGHLIGHT_KEYS.map((k) => (
            <div
              key={k}
              className="rounded-xl border border-border/50 p-3 bg-muted/10"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                {t(`kpis.${k}.label`)}
              </div>
              <div className="text-base font-bold tabular-nums leading-none">
                {t(`kpis.${k}.value`)}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1.5">
                {t(`kpis.${k}.delta`)}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/50 p-3.5 bg-amber-50/50">
          <div className="flex items-start gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>{t("review.label")}</strong> &ldquo;{t("review.quote")}
              &rdquo;
              <span className="text-muted-foreground">
                {" "}
                — {t("review.author")}
              </span>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl bg-[#1D3A62] text-white p-4 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.1] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
          />
          <div className="relative text-[10px] uppercase tracking-wider opacity-80 font-semibold mb-1">
            {t("ottimizzazioni.label")}
          </div>
          <p className="relative text-xs leading-relaxed mb-2">
            {t("ottimizzazioni.body")}
          </p>
          <span className="relative inline-flex items-center gap-1 text-[11px] font-semibold">
            {t("ottimizzazioni.cta")}
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pt-1">
          {t("footer")}
        </div>
      </div>
    </div>
  );
}
