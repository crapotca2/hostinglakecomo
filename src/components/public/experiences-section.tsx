"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ExternalLink, Anchor } from "lucide-react";
import { CharterExperienceDialog } from "./charter-experience-dialog";

const CATEGORIES = [
  {
    key: "barca-legno",
    image: "/images/charter/barca-legno/barca-legno-hero",
  },
  {
    key: "speed-boat",
    image: "/images/charter/speed-boat/speed-boat-hero",
  },
  {
    key: "taxi-boat",
    image: "/images/charter/taxi-boat/taxi-boat-hero",
  },
] as const;

const PARTNER_HOMEPAGE_IT = "https://lakecomocharter.com/it/";
const PARTNER_HOMEPAGE_EN = "https://lakecomocharter.com/en/";

type Props = {
  /** Layout compatto per property detail page (banner orizzontale, no grid card) */
  compact?: boolean;
};

export function ExperiencesSection({ compact = false }: Props) {
  const t = useTranslations("home.experiences");
  const locale = useLocale() as "it" | "en";
  const [open, setOpen] = useState(false);
  const partnerUrl = locale === "en" ? PARTNER_HOMEPAGE_EN : PARTNER_HOMEPAGE_IT;

  if (compact) {
    return (
      <section className="py-12 bg-gradient-to-br from-primary/[0.04] to-primary/[0.01] border-y border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="flex gap-2 shrink-0">
              {CATEGORIES.map((c) => (
                <div
                  key={c.key}
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden ring-2 ring-white shadow-md"
                >
                  <picture>
                    <source srcSet={`${c.image}.webp`} type="image/webp" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${c.image}.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </picture>
                </div>
              ))}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary mb-1.5">
                <Anchor className="h-3 w-3" />
                {t("eyebrow")}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1.5">
                {t("compactTitle")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("compactSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {t("compactCta")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <CharterExperienceDialog
          open={open}
          onOpenChange={setOpen}
          locale={locale}
        />
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/[0.04] to-primary/[0.01] border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            <Anchor className="h-3.5 w-3.5" />
            {t("eyebrow")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
            {t("title1")}{" "}
            <span className="font-semibold">{t("title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="md:hidden">{t("subtitle_short")}</span>
            <span className="hidden md:inline">{t("subtitle")}</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setOpen(true)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-border/50 hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <picture>
                  <source srcSet={`${c.image}.webp`} type="image/webp" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${c.image}.jpg`}
                    alt={t(`cards.${c.key}.title`)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </picture>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1.5">
                  {t(`cards.${c.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[2.5em]">
                  <span className="md:hidden">
                    {t(`cards.${c.key}.tagline_short`)}
                  </span>
                  <span className="hidden md:inline">
                    {t(`cards.${c.key}.tagline`)}
                  </span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {t("cardCta")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={partnerUrl}
            target="_blank"
            rel="noopener noreferrer external"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {t("externalLinkCta")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <CharterExperienceDialog
        open={open}
        onOpenChange={setOpen}
        locale={locale}
      />
    </section>
  );
}
