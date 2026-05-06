"use client";

import { Plus, MapPin, MoreHorizontal, Eye, Edit2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProperties } from "@/hooks/use-properties";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

type StatusKey = "active" | "draft" | "inactive";
type ZoneKey =
  | "centro-como"
  | "primo-bacino"
  | "secondo-bacino"
  | "alto-lago"
  | "valle-intelvi"
  | "lecco"
  | "altro";

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();
  const t = useTranslations("dashboard.properties");

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            {t("title1")} <span className="font-semibold">{t("title2")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? t("subtitleLoading")
              : t("subtitleCount", { count: properties?.length || 0 })}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          {t("addButton")}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-muted-foreground border border-border/50">
          {t("loadingList")}
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-muted-foreground border border-border/50">
          {t("emptyList")}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((p) => {
            const zoneKey = (
              ["centro-como", "primo-bacino", "secondo-bacino", "alto-lago", "valle-intelvi", "lecco", "altro"].includes(p.zone)
                ? p.zone
                : "altro"
            ) as ZoneKey;
            const statusKey = (
              ["active", "draft", "inactive"].includes(p.status) ? p.status : "inactive"
            ) as StatusKey;
            return (
              <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-border/50 card-hover">
                <div className="relative h-44 overflow-hidden">
                  {p.images?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      {t("noImage")}
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[p.status]}`}>
                    {t(`status.${statusKey}`)}
                  </span>
                  <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-foreground" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    {p.address.city} — {t(`zones.${zoneKey}`)}
                  </div>
                  <h3 className="text-base font-semibold mb-1">{p.name}</h3>
                  <div className="text-xs text-muted-foreground mb-4">
                    {t("details", {
                      type: p.type,
                      bedrooms: p.details.bedrooms,
                      bathrooms: p.details.bathrooms,
                      maxGuests: p.details.maxGuests,
                    })}
                  </div>
                  <div className="pt-4 border-t border-border/50 flex items-baseline gap-1 mb-4">
                    <span className="text-lg font-bold text-foreground">€{p.pricing.basePrice}</span>
                    <span className="text-xs text-muted-foreground">{t("perNight")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition-colors">
                      <Eye className="h-3.5 w-3.5" />
                      {t("view")}
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                      {t("edit")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
