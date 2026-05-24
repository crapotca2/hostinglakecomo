"use client";

import { Link } from "@/i18n/routing";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Home as HomeIcon,
  Info,
  ArrowLeft,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getPortfolioEntry } from "@/lib/portfolio";
import { pickLocalized } from "@/lib/i18n-data";
import { GoogleMapEmbed } from "@/components/public/google-map-embed";
import { PropertyGallery } from "@/components/public/property-gallery";
import { PotentialDashboard } from "@/components/demo/potential-dashboard";

type DemoLocale = "it" | "en" | "ru";
const DEMO_COPY: Record<DemoLocale, {
  locationBadge: string;
  guestAccessTitle: string;
  servicesTitle: string;
}> = {
  it: {
    locationBadge: "Argegno · Lago di Como",
    guestAccessTitle: "Accesso per gli ospiti",
    servicesTitle: "Servizi inclusi",
  },
  en: {
    locationBadge: "Argegno · Lake Como",
    guestAccessTitle: "Guest access",
    servicesTitle: "Included services",
  },
  ru: {
    locationBadge: "Ардженьо · Озеро Комо",
    guestAccessTitle: "Заселение и доступ гостей",
    servicesTitle: "Включённые услуги",
  },
};

function MapEmbed({ address, name }: { address: string; name: string }) {
  const t = useTranslations("properties.detail");
  const encoded = encodeURIComponent(address);
  const link = `https://www.google.com/maps?q=${encoded}`;
  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
            <Navigation className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold">{t("mapTitle")}</h2>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          {t("mapOpen")}
        </a>
      </div>
      <div className="px-5 py-2 text-xs text-muted-foreground border-b border-border/40">
        {address}
      </div>
      <GoogleMapEmbed
        query={address}
        title={`Map ${name}`}
        zoom={17}
        className="h-72 sm:h-80"
      />
    </div>
  );
}

export default function CasaDelPozzoDemoPage() {
  const t = useTranslations("properties");
  const tDetail = useTranslations("properties.detail");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const property = getPortfolioEntry("aqua-vista-di-splendore");

  if (!property) {
    return (
      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          Demo property not seeded.
        </p>
      </div>
    );
  }

  const sectionsRaw = (property.sections ?? {}) as Record<string, unknown>;
  const sections = {
    space: pickLocalized<string>(sectionsRaw, "space", locale),
    neighborhood: pickLocalized<string>(sectionsRaw, "neighborhood", locale),
    guestAccess: pickLocalized<string>(sectionsRaw, "guestAccess", locale),
    services: pickLocalized<string>(sectionsRaw, "services", locale),
  };
  const description =
    pickLocalized<string>(
      property as unknown as Record<string, unknown>,
      "description",
      locale,
    ) ?? property.description;
  const descriptionLong = pickLocalized<string>(
    property as unknown as Record<string, unknown>,
    "descriptionLong",
    locale,
  );
  const geo = property.geo;

  const bedroomsKey = property.details.bedrooms === 1 ? "bedroomsOne" : "bedroomsOther";
  const bathroomsKey = property.details.bathrooms === 1 ? "bathroomsOne" : "bathroomsOther";

  const demoCopy =
    DEMO_COPY[(locale as DemoLocale) ?? "it"] ?? DEMO_COPY.it;

  return (
    <div className="pt-24 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            {tNav("home")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
          <Link
            href="/properties"
            className="hover:text-foreground transition-colors"
          >
            {tNav("properties")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
          <span className="text-foreground font-medium" aria-current="page">
            {property.name}
          </span>
        </nav>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {tDetail("back")}
        </Link>

        <PropertyGallery
          images={property.images}
          propertyName={property.name}
          hasLakeView={property.details.hasLakeView}
        />

        <div className="mt-8 space-y-6">
          {/* Hero card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border/50">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-xs font-medium">
                {t(`types.${property.type}`)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/[0.08] text-primary text-xs font-medium">
                <MapPin className="h-3 w-3" />
                {demoCopy.locationBadge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-3">
              {property.name}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground flex-wrap gap-y-2">
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />{" "}
                {tDetail(bedroomsKey, { count: property.details.bedrooms })}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />{" "}
                {tDetail(bathroomsKey, { count: property.details.bathrooms })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />{" "}
                {tDetail("guestsMax", { count: property.details.maxGuests })}
              </span>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {description}
              </p>
            )}

            {descriptionLong && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                  {descriptionLong}
                </p>
              </div>
            )}

            {(sections.space || sections.neighborhood) && (
              <div className="mt-6 pt-6 border-t border-border/40 grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {sections.space && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HomeIcon className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {tDetail("spaceTitle")}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {sections.space}
                    </p>
                  </div>
                )}
                {sections.neighborhood && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {tDetail("neighborhoodTitle")}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {sections.neighborhood}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(sections.guestAccess || sections.services) && (
              <div className="mt-6 pt-6 border-t border-border/40 grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {sections.guestAccess && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {demoCopy.guestAccessTitle}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {sections.guestAccess}
                    </p>
                  </div>
                )}
                {sections.services && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {demoCopy.servicesTitle}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {sections.services}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {geo && (
            <MapEmbed
              address={
                geo.displayName ||
                `${property.address.street}, ${property.address.city} (${property.address.province}), ${property.address.zip}`
              }
              name={property.name}
            />
          )}

          {/* Potential dashboard */}
          <PotentialDashboard />
        </div>
      </div>
    </div>
  );
}
