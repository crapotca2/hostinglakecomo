"use client";

import { Search, Info, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getPortfolio } from "@/lib/portfolio";
import type { PropertyZone, PropertyType } from "@/types/database";
import { PropertyCard } from "@/components/public/property-card";

const PORTFOLIO = getPortfolio();
const SHOW_FILTERS = PORTFOLIO.length > 3;

const ZONE_KEYS: PropertyZone[] = [
  "centro-como",
  "primo-bacino",
  "secondo-bacino",
  "alto-lago",
];

const TYPE_KEYS: PropertyType[] = ["apartment", "villa", "studio", "house"];

export default function PropertiesPage() {
  const t = useTranslations("properties");
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<"all" | PropertyZone>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PropertyType>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PORTFOLIO.filter((p) => {
      if (zoneFilter !== "all" && p.zone !== zoneFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (q) {
        const hay = `${p.name} ${p.address.city} ${p.address.street}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, zoneFilter, typeFilter]);

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-4">
            {t("hero.title1")}{" "}
            <span className="font-semibold">{t("hero.title2")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-4 sm:py-5 bg-primary/[0.04] border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-muted-foreground flex-wrap text-center">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{t("banner.text")}</span>
            <Link
              href="/contact?interest=consulenza"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
            >
              {t("banner.cta")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {SHOW_FILTERS && (
        <section className="sticky top-16 md:top-20 z-30 bg-white/90 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("filters.searchPlaceholder")}
                  className="text-sm bg-transparent border-none outline-none flex-1"
                />
              </div>
              <select
                value={zoneFilter}
                onChange={(e) =>
                  setZoneFilter(e.target.value as "all" | PropertyZone)
                }
                className="rounded-lg border border-border px-3 py-2 text-sm bg-white"
              >
                <option value="all">{t("filters.zonesAll")}</option>
                {ZONE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {t(`zones.${k}`)}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | PropertyType)
                }
                className="rounded-lg border border-border px-3 py-2 text-sm bg-white"
              >
                <option value="all">{t("filters.typesAll")}</option>
                {TYPE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {t(`types.${k}`)}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground ml-auto">
                {t("filters.countLabel", {
                  filtered: filtered.length,
                  total: PORTFOLIO.length,
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <PropertyCard key={p.slug} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
