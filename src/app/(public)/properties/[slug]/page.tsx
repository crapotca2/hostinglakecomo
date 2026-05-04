"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  CheckCircle2,
  Home as HomeIcon,
  Compass,
  Car,
  Info,
  Building2,
  Clock,
  Wifi,
  Wind,
  Waves,
  TreePine,
  CookingPot,
  Sparkles,
  ArrowLeft,
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Landmark,
  Navigation,
  ExternalLink,
  Star,
} from "lucide-react";
import type { PortfolioPoi, PortfolioDistances } from "@/lib/portfolio";
import { getPortfolioEntry, getZoneLabel, getTypeLabel } from "@/lib/portfolio";
import { AirbnbReviewBlock } from "@/components/public/airbnb-review-block";
import { GoogleMapEmbed } from "@/components/public/google-map-embed";
import host from "@/data/host.json";

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "—";
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function MapEmbed({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const link = `https://www.google.com/maps?q=${lat},${lng}`;
  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
            <Navigation className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold">Posizione</h2>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Apri in Google Maps
        </a>
      </div>
      <GoogleMapEmbed
        query={`${lat},${lng}`}
        title={`Mappa ${name}`}
        zoom={16}
        className="h-72"
      />
    </div>
  );
}

function PoiGroup({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: PortfolioPoi[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 6).map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            className="flex items-center justify-between text-sm gap-3"
          >
            <span className="truncate">
              <span className="text-foreground">{p.name}</span>
              {p.subtype && (
                <span className="text-muted-foreground"> · {p.subtype}</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {formatDistance(p.distance)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DistancesBar({ distances }: { distances: PortfolioDistances }) {
  const items: { label: string; value?: number | null }[] = [
    { label: "Duomo Como", value: distances.comoDuomo },
    { label: "Piazza Cavour", value: distances.piazzaCavour },
    { label: "Cernobbio", value: distances.cernobbio },
    { label: "Bellagio", value: distances.bellagio },
    { label: "Menaggio", value: distances.menaggio },
    { label: "Varenna", value: distances.varenna },
  ].filter((i) => typeof i.value === "number");
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Landmark className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Distanze da punti chiave
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((i) => (
          <div
            key={i.label}
            className="bg-muted/40 rounded-lg px-3 py-2 flex flex-col"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {i.label}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatDistance(i.value as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmenityIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="h-4 w-4" />;
  if (lower.includes("aria condizionata")) return <Wind className="h-4 w-4" />;
  if (lower.includes("piscina")) return <Waves className="h-4 w-4" />;
  if (lower.includes("giardino") || lower.includes("terrazza")) return <TreePine className="h-4 w-4" />;
  if (lower.includes("cucina") || lower.includes("elettrodomestici")) return <CookingPot className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
}

function SectionBlock({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const property = getPortfolioEntry(slug);
  const [activeImage, setActiveImage] = useState(0);

  if (!property) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Proprieta non trovata</h1>
          <p className="text-sm text-muted-foreground mb-6">
            La proprieta <code className="text-xs">{slug}</code> non esiste nel
            nostro portfolio.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna al portfolio
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = property.images[activeImage]?.url ?? property.images[0]?.url;
  const sections = property.sections ?? {};
  const facts = property.facts ?? {};
  const nearby = property.nearby;
  const distances = property.distances;
  const geo = property.geo;
  const airbnbListing = property.airbnbListing;
  const hasNearbyAny = nearby
    ? nearby.food.length + nearby.transport.length + nearby.shop.length + nearby.attraction.length > 0
    : false;

  return (
    <div className="pt-24 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tutte le proprieta
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden border border-border/50 mb-6">
          <div className="relative">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={property.name}
                className="w-full h-80 sm:h-[28rem] object-cover"
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
                <HomeIcon className="h-16 w-16 text-primary/40" />
              </div>
            )}
            {property.details.hasLakeView && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                Vista Lago
              </span>
            )}
            {property.images[activeImage]?.room && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                {property.images[activeImage].room}
              </span>
            )}
          </div>

          {property.images.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto">
              {property.images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || `${property.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              {property.address.street ? `${property.address.street}, ` : ""}
              {property.address.city} — {getZoneLabel(property.zone)}
            </div>
            <h1 className="text-3xl font-semibold mb-3">{property.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-xs font-medium">
                {getTypeLabel(property.type)}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" /> {property.details.bedrooms}{" "}
                {property.details.bedrooms === 1 ? "camera" : "camere"}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {property.details.bathrooms}{" "}
                {property.details.bathrooms === 1 ? "bagno" : "bagni"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> max {property.details.maxGuests}{" "}
                ospiti
              </span>
              {airbnbListing?.rating && airbnbListing.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {airbnbListing.rating.toFixed(2)}
                  {airbnbListing.reviewCount && (
                    <span className="text-xs">
                      ({airbnbListing.reviewCount} recensioni)
                    </span>
                  )}
                </span>
              )}
            </div>
            {property.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {property.description}
              </p>
            )}
          </div>

          {(facts.floor ||
            facts.checkInHours ||
            facts.parkingNote ||
            facts.touristTaxNote) && (
            <div className="bg-white rounded-2xl p-6 border border-border/50">
              <h2 className="text-sm font-semibold mb-4">Informazioni pratiche</h2>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {facts.floor && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Piano</dt>
                      <dd className="text-foreground">{facts.floor}</dd>
                    </div>
                  </div>
                )}
                {facts.checkInHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Check-in</dt>
                      <dd className="text-foreground">{facts.checkInHours}</dd>
                    </div>
                  </div>
                )}
                {facts.parkingNote && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Car className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Parcheggio</dt>
                      <dd className="text-foreground">{facts.parkingNote}</dd>
                    </div>
                  </div>
                )}
                {facts.touristTaxNote && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tassa di soggiorno
                      </dt>
                      <dd className="text-foreground">{facts.touristTaxNote}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          )}

          {property.amenities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-border/50">
              <h2 className="text-sm font-semibold mb-4">Servizi e comfort</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="text-primary">
                      <AmenityIcon name={a} />
                    </span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sections.space && (
            <SectionBlock
              icon={HomeIcon}
              title="Lo spazio"
              content={sections.space}
            />
          )}
          {sections.neighborhood && (
            <SectionBlock
              icon={MapPin}
              title="Il quartiere"
              content={sections.neighborhood}
            />
          )}

          {geo && <MapEmbed lat={geo.lat} lng={geo.lng} name={property.name} />}

          {(hasNearbyAny || distances) && (
            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Cosa trovi in zona</h2>
              </div>
              {distances && <DistancesBar distances={distances} />}
              {hasNearbyAny && nearby && (
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                  <PoiGroup
                    icon={UtensilsCrossed}
                    title="Mangiare & bere"
                    items={nearby.food}
                  />
                  <PoiGroup icon={Bus} title="Trasporti" items={nearby.transport} />
                  <PoiGroup
                    icon={ShoppingBag}
                    title="Negozi e servizi"
                    items={nearby.shop}
                  />
                  <PoiGroup
                    icon={Landmark}
                    title="Attrazioni"
                    items={nearby.attraction}
                  />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                Dati OpenStreetMap — raggio 800 m dalla proprieta. Distanze in
                linea d'aria.
              </p>
            </div>
          )}

          {sections.gettingAround && (
            <SectionBlock
              icon={Compass}
              title="Come muoversi"
              content={sections.gettingAround}
            />
          )}
          {sections.directions && (
            <SectionBlock
              icon={Car}
              title="Come arrivare"
              content={sections.directions}
            />
          )}
          {sections.guestAccess && (
            <SectionBlock
              icon={CheckCircle2}
              title="Accesso ospiti"
              content={sections.guestAccess}
            />
          )}
          {sections.services && (
            <SectionBlock
              icon={Sparkles}
              title="Servizi"
              content={sections.services}
            />
          )}
          {property.extras?.map((e) => (
            <SectionBlock
              key={e.title}
              icon={Info}
              title={e.title}
              content={e.content}
            />
          ))}
          {!sections.space && property.descriptionLong && (
            <SectionBlock
              icon={HomeIcon}
              title="Descrizione"
              content={property.descriptionLong}
            />
          )}

          {airbnbListing &&
            airbnbListing.rating != null &&
            airbnbListing.reviewCount != null && (
              <AirbnbReviewBlock
                overall={airbnbListing.rating}
                reviewCount={airbnbListing.reviewCount}
                lovedByGuests={airbnbListing.lovedByGuests}
                categories={airbnbListing.categoryRatings ?? {}}
                airbnbUrl={airbnbListing.url}
              />
            )}

          {airbnbListing && (
            <div className="bg-white rounded-2xl p-6 border border-border/50">
              <div className="flex items-start gap-4 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={host.profilePicture}
                  alt={host.name}
                  className="h-14 w-14 rounded-full object-cover shrink-0 border border-border/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold">
                      Gestita per {host.name}
                    </h3>
                    {host.isSuperhost && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        Superhost
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direttore del team Hosting Lake Como ·{" "}
                    {host.yearsHosting} anni di esperienza diretta ·{" "}
                    {host.responseTime}
                  </p>
                </div>
                <a
                  href={airbnbListing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-muted/40 transition-colors"
                >
                  Vedi su Airbnb
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          <div className="bg-primary/[0.04] border border-primary/10 rounded-2xl p-5 flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              Questa e la proprieta che il team Hosting Lake Como gestisce
              oggi per {host.name}, direttore del nostro team. Lo stesso
              metodo — hospitality, operations e revenue management — lo
              applichiamo alle proprieta dei nostri clienti.{" "}
              <Link
                href="/contact?interest=consulenza&from=portfolio"
                className="text-primary font-semibold hover:underline"
              >
                Richiedi una consulenza
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
