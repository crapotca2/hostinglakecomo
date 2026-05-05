"use client";

import {
  MapPin,
  Bed,
  Bath,
  Users,
  Search,
  Info,
  Home as HomeIcon,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getPortfolio,
  getZoneLabel,
  getTypeLabel,
  type PortfolioEntry,
} from "@/lib/portfolio";
import type { PropertyZone, PropertyType } from "@/types/database";
import { PicWebp } from "@/components/ui/pic-webp";

const PORTFOLIO = getPortfolio();
const SHOW_FILTERS = PORTFOLIO.length > 3;

const ZONES: { value: "all" | PropertyZone; label: string }[] = [
  { value: "all", label: "Tutte le zone" },
  { value: "centro-como", label: "Centro Como" },
  { value: "primo-bacino", label: "Primo Bacino" },
  { value: "secondo-bacino", label: "Secondo Bacino" },
  { value: "alto-lago", label: "Alto Lago" },
];

const TYPES: { value: "all" | PropertyType; label: string }[] = [
  { value: "all", label: "Qualsiasi tipo" },
  { value: "apartment", label: "Appartamento" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "Casa" },
];

function PropertyCard({ property }: { property: PortfolioEntry }) {
  const firstImage = property.images[0]?.url;
  const cityZone = `${property.address.city} — ${getZoneLabel(property.zone)}`;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-border/50 card-hover flex flex-col"
    >
      <div className="relative h-56 overflow-hidden bg-muted">
        {firstImage ? (
          <PicWebp
            src={firstImage}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
            <HomeIcon className="h-10 w-10 text-primary/40" />
          </div>
        )}
        {property.details.hasLakeView && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            Vista Lago
          </span>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
          {getTypeLabel(property.type)}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <MapPin className="h-3 w-3" />
          {cityZone}
        </div>
        <h3 className="text-base font-semibold mb-3">{property.name}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap gap-y-1">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {property.details.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.details.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {property.details.maxGuests}
          </span>
          {property.airbnbListing?.rating != null &&
            property.airbnbListing.rating > 0 && (
              <span className="flex items-center gap-1 text-foreground font-medium">
                <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                {property.airbnbListing.rating.toFixed(2)}
              </span>
            )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
            Scopri
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">
            Gestita da noi
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PropertiesPage() {
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
            Le case che curiamo sul <span className="font-semibold">Lago di Como</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Una panoramica degli immobili che gestiamo direttamente. Ogni proprietà
            che vedi qui riceve la stessa cura: dal pricing dinamico alla pulizia,
            dall&apos;accoglienza ospite alla reportistica mensile per il
            proprietario.
          </p>
        </div>
      </section>

      <section className="py-4 sm:py-5 bg-primary/[0.04] border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-muted-foreground flex-wrap text-center">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Vuoi che la prossima proprietà a comparire qui sia la tua?</span>
            <Link
              href="/contact?interest=consulenza"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
            >
              Richiedi una valutazione gratuita
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
                  placeholder="Cerca per nome o localita..."
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
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
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
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground ml-auto">
                {filtered.length} di {PORTFOLIO.length}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-sm text-muted-foreground">
              Nessuna proprieta corrisponde ai filtri selezionati.
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
