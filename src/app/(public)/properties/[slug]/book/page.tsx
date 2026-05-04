"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Lock,
  CheckCircle2,
  CreditCard,
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
  Star,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import type {
  PortfolioPoi,
  PortfolioDistances,
  PortfolioAirbnb,
} from "@/lib/portfolio";
import {
  getPortfolioEntry,
  getZoneLabel,
  getTypeLabel,
  type PortfolioEntry,
} from "@/lib/portfolio";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "—";
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function MapEmbed({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const delta = 0.004;
  const bbox = [
    (lng - delta).toFixed(6),
    (lat - delta * 0.6).toFixed(6),
    (lng + delta).toFixed(6),
    (lat + delta * 0.6).toFixed(6),
  ].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
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
          Apri in OpenStreetMap
        </a>
      </div>
      <iframe
        title={`Mappa ${name}`}
        src={src}
        className="w-full h-72 border-0"
        loading="lazy"
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

function MarketComparison({
  airbnb,
  ourPrice,
}: {
  airbnb: PortfolioAirbnb;
  ourPrice: number;
}) {
  const { bestMatch, marketContext } = airbnb;
  const confidenceLabel = {
    high: "Alta",
    medium: "Media",
    low: "Bassa",
  }[bestMatch.confidence];
  const confidenceColor = {
    high: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-slate-50 text-slate-600 border-slate-200",
  }[bestMatch.confidence];

  const avgPrice = marketContext.avgNightlyPrice;
  const priceDelta = avgPrice
    ? Math.round(((avgPrice - ourPrice) / ourPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold">Confronto con il mercato</h2>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${confidenceColor}`}
        >
          Match {confidenceLabel}
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {avgPrice !== null && avgPrice !== undefined && (
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Media zona
            </div>
            <div className="text-lg font-bold tabular-nums">
              €{avgPrice}
              <span className="text-xs font-normal text-muted-foreground">/notte</span>
            </div>
            {priceDelta !== null && Math.abs(priceDelta) >= 1 && (
              <div
                className={`text-[10px] font-medium mt-0.5 ${
                  priceDelta > 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {priceDelta > 0 ? "+" : ""}
                {priceDelta}% vs nostra tariffa
              </div>
            )}
          </div>
        )}

        {marketContext.minNightlyPrice !== null && marketContext.minNightlyPrice !== undefined && (
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Range zona
            </div>
            <div className="text-sm font-semibold tabular-nums">
              €{marketContext.minNightlyPrice}–{marketContext.maxNightlyPrice}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              su {marketContext.sampleSize} proprieta vicine
            </div>
          </div>
        )}

        {marketContext.avgRating !== null && marketContext.avgRating !== undefined && (
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Rating medio zona
            </div>
            <div className="text-lg font-bold tabular-nums flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {marketContext.avgRating.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {bestMatch.title && (
        <div className="border-t border-border/40 pt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Listing di riferimento vicina
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {bestMatch.title.replace(/\s*-\s*Appartamenti.*$/, "")}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                {bestMatch.distanceFromOurGeo !== undefined && (
                  <span>{bestMatch.distanceFromOurGeo}m di distanza</span>
                )}
                {bestMatch.personCapacity && (
                  <span>{bestMatch.personCapacity} ospiti</span>
                )}
                {bestMatch.rating && bestMatch.rating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {bestMatch.rating.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <a
              href={bestMatch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Vedi su Airbnb
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Dati di riferimento raccolti dal mercato pubblico di Airbnb per proprieta
        vicine. Utilizzati a scopo di benchmark e non rappresentano la proprieta
        stessa.
      </p>
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

function BookingWidget({ property }: { property: PortfolioEntry }) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const quote = useMemo(() => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (ci >= co) return null;
    const nights = Math.round((co.getTime() - ci.getTime()) / 86400000);
    if (nights < 1) return null;
    const msPerDay = 86400000;
    let subtotal = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(ci.getTime() + i * msPerDay);
      const dow = d.getDay();
      const isWeekend = dow === 5 || dow === 6;
      subtotal += Math.round(
        property.pricing.basePrice *
          (isWeekend ? property.pricing.weekendMultiplier : 1)
      );
    }
    const cleaningFee = property.pricing.cleaningFee;
    const taxRate = property.touristTaxRate ?? 3;
    const maxTaxNights = property.maxTouristTaxNights ?? 5;
    const touristTax = Math.min(nights, maxTaxNights) * guests * taxRate;
    const total = subtotal + cleaningFee + touristTax;
    return { nights, subtotal, cleaningFee, touristTax, total };
  }, [property, checkIn, checkOut, guests]);

  async function handleBook() {
    if (!guestName || !guestEmail) {
      setError("Inserisci nome e email");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: property.slug,
          checkIn,
          checkOut,
          guests,
          guestName,
          guestEmail,
          guestPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante la creazione del pagamento");
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Errore di rete");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-4">
        <h2 className="text-sm font-semibold">Dettagli soggiorno</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Ospiti</label>
            <input
              type="number"
              min={1}
              max={property.details.maxGuests}
              value={guests}
              onChange={(e) =>
                setGuests(
                  Math.max(
                    1,
                    Math.min(
                      property.details.maxGuests,
                      parseInt(e.target.value) || 1
                    )
                  )
                )
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-4">
        <h2 className="text-sm font-semibold">I tuoi dati</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Nome completo</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Mario Rossi"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Email</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="mario@example.com"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Telefono (opzionale)</label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+39 333 1234567"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-4">
        <h2 className="text-sm font-semibold">Riepilogo prezzo</h2>
        {quote ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                {formatEuro(Math.round(quote.subtotal / quote.nights))} ×{" "}
                {quote.nights} notti
              </span>
              <span className="tabular-nums">{formatEuro(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pulizia finale</span>
              <span className="tabular-nums">
                {formatEuro(quote.cleaningFee)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tassa di soggiorno</span>
              <span className="tabular-nums">
                {formatEuro(quote.touristTax)}
              </span>
            </div>
            <div className="pt-3 border-t border-border/50 flex justify-between font-bold">
              <span>Totale</span>
              <span className="text-primary tabular-nums">
                {formatEuro(quote.total)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Seleziona date valide per vedere il prezzo
          </p>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={!quote || submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            "Reindirizzamento..."
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Paga con Stripe
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          Pagamento sicuro con Stripe · Cancellazione gratuita entro 48h
        </div>

        <div className="pt-3 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            Conferma immediata via email
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            Supporto dedicato durante il soggiorno
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
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
  const airbnb = property.airbnb;
  const hasNearbyAny = nearby
    ? nearby.food.length + nearby.transport.length + nearby.shop.length + nearby.attraction.length >
      0
    : false;

  return (
    <div className="pt-24 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="w-full h-80 sm:h-96 object-cover"
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
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              Portfolio di riferimento
            </span>
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

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" />
                {property.address.street
                  ? `${property.address.street}, `
                  : ""}
                {property.address.city} — {getZoneLabel(property.zone)}
              </div>
              <h1 className="text-3xl font-semibold mb-3">{property.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-xs font-medium">
                  {getTypeLabel(property.type)}
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" /> {property.details.bedrooms} camere
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {property.details.bathrooms} bagni
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> max{" "}
                  {property.details.maxGuests} ospiti
                </span>
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
                <h2 className="text-sm font-semibold mb-4">
                  Informazioni pratiche
                </h2>
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
                  {facts.checkOutHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Check-out</dt>
                        <dd className="text-foreground">{facts.checkOutHours}</dd>
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
                        <dd className="text-foreground">
                          {facts.touristTaxNote}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-border/50">
                <h2 className="text-sm font-semibold mb-4">
                  Servizi e comfort
                </h2>
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

            {geo && (
              <MapEmbed lat={geo.lat} lng={geo.lng} name={property.name} />
            )}

            {airbnb && (
              <MarketComparison
                airbnb={airbnb}
                ourPrice={property.pricing.basePrice}
              />
            )}

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
                    <PoiGroup
                      icon={Bus}
                      title="Trasporti"
                      items={nearby.transport}
                    />
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
                  Dati OpenStreetMap — raggio {Math.round(800)} m dalla
                  proprieta. Distanze in linea d'aria.
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

            <div className="flex items-start gap-3 text-xs text-muted-foreground bg-primary/[0.04] border border-primary/10 rounded-xl p-4">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>
                Le informazioni di questa proprieta provengono da un portfolio
                di riferimento utilizzato per illustrare le tipologie che
                gestiamo. Per gestire con noi un immobile simile,{" "}
                <Link
                  href="/contact?interest=consulenza&from=portfolio"
                  className="text-primary font-semibold hover:underline"
                >
                  richiedi una consulenza
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <BookingWidget property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
