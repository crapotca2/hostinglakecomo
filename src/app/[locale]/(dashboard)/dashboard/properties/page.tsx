"use client";

import {
  Plus,
  MapPin,
  MoreHorizontal,
  Eye,
  Edit2,
  Bed,
  Bath,
  Users,
  Home as HomeIcon,
} from "lucide-react";
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
type TypeKey = "studio" | "apartment" | "house" | "villa";

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();
  const t = useTranslations("dashboard.properties");
  const tProps = useTranslations("properties");

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
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((p) => {
            const zoneKey = (
              [
                "centro-como",
                "primo-bacino",
                "secondo-bacino",
                "alto-lago",
                "valle-intelvi",
                "lecco",
                "altro",
              ].includes(p.zone)
                ? p.zone
                : "altro"
            ) as ZoneKey;
            const statusKey = (
              ["active", "draft", "inactive"].includes(p.status)
                ? p.status
                : "inactive"
            ) as StatusKey;
            const typeKey = (
              ["studio", "apartment", "house", "villa"].includes(p.type)
                ? p.type
                : "apartment"
            ) as TypeKey;
            const cityZone = `${p.address.city} — ${t(`zones.${zoneKey}`)}`;
            return (
              <div
                key={p._id}
                className="group bg-white rounded-2xl overflow-hidden border border-border/50 card-hover flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-muted">
                  {p.images?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
                      <HomeIcon className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-sm ${STATUS_STYLES[p.status]}`}
                  >
                    {t(`status.${statusKey}`)}
                  </span>
                  <span className="absolute top-3 right-12 px-2.5 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    {tProps(`types.${typeKey}`)}
                  </span>
                  <button
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4 text-foreground" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <MapPin className="h-3 w-3" />
                    {cityZone}
                  </div>
                  <h3 className="text-base font-semibold mb-3">{p.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap gap-y-1">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {p.details.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {p.details.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {p.details.maxGuests}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border/50 flex items-baseline gap-1 mb-4">
                    <span className="text-lg font-bold text-foreground">
                      €{p.pricing.basePrice}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("perNight")}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
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
