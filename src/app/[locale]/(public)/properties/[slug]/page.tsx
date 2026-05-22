"use client";

import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Home as HomeIcon,
  Info,
  ArrowLeft,
  Star,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getPortfolioEntry } from "@/lib/portfolio";
import { pickLocalized } from "@/lib/i18n-data";
import { AirbnbReviewBlock } from "@/components/public/airbnb-review-block";
import { GoogleMapEmbed } from "@/components/public/google-map-embed";
import { PropertyGallery } from "@/components/public/property-gallery";
import { ExperiencesSection } from "@/components/public/experiences-section";
import { JsonLdLodging } from "@/components/seo/jsonld-lodging";
import { JsonLdBreadcrumb } from "@/components/seo/jsonld-breadcrumb";

function MapEmbed({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const t = useTranslations("properties.detail");
  const link = `https://www.google.com/maps?q=${lat},${lng}`;
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
      <GoogleMapEmbed
        query={`${lat},${lng}`}
        title={`Map ${name}`}
        zoom={16}
        className="h-72 sm:h-80"
      />
    </div>
  );
}

export default function PropertyDetailPage() {
  const t = useTranslations("properties");
  const tDetail = useTranslations("properties.detail");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const propertyRaw = getPortfolioEntry(slug);
  // Hide demo/preview-only listings from the public detail surface as well.
  // The dedicated /demo/<slug> page remains accessible by direct URL for
  // internal onboarding sharing.
  const property = propertyRaw && !propertyRaw.demo ? propertyRaw : undefined;

  if (!property) {
    return (
      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">{tDetail("notFoundTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {tDetail("notFoundBody")}
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {tDetail("backToPortfolio")}
          </Link>
        </div>
      </div>
    );
  }

  const sectionsRaw = (property.sections ?? {}) as Record<string, unknown>;
  const sections = {
    space: pickLocalized<string>(sectionsRaw, "space", locale),
    neighborhood: pickLocalized<string>(sectionsRaw, "neighborhood", locale),
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
  const airbnbListing = property.airbnbListing;
  const seoDescription = (descriptionLong || description || "").slice(0, 600);

  const breadcrumbs = [
    { name: tNav("home"), path: "/" },
    { name: tNav("properties"), path: "/properties" },
    { name: property.name, path: `/properties/${slug}` },
  ];

  const bedroomsKey = property.details.bedrooms === 1 ? "bedroomsOne" : "bedroomsOther";
  const bathroomsKey = property.details.bathrooms === 1 ? "bathroomsOne" : "bathroomsOther";

  return (
    <div className="pt-24 pb-20 bg-muted/20 min-h-screen">
      <JsonLdLodging
        property={property}
        locale={locale}
        description={seoDescription}
      />
      <JsonLdBreadcrumb items={breadcrumbs} locale={locale} />
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

        <div className="mt-8 -mx-4 sm:mx-0 sm:rounded-2xl sm:overflow-hidden">
          <ExperiencesSection compact />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border/50">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-xs font-medium">
                {t(`types.${property.type}`)}
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
              {airbnbListing?.rating && airbnbListing.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-foreground text-foreground" />
                  {airbnbListing.rating.toFixed(2)}
                  {airbnbListing.reviewCount && (
                    <span className="text-xs">
                      {tDetail("reviewsCount", {
                        count: airbnbListing.reviewCount,
                      })}
                    </span>
                  )}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {description}
              </p>
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
          </div>

          {geo && <MapEmbed lat={geo.lat} lng={geo.lng} name={property.name} />}

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

          {!sections.space && !sections.neighborhood && descriptionLong && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                  <HomeIcon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">{tDetail("descriptionTitle")}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {descriptionLong}
              </p>
            </div>
          )}

          <div className="bg-primary/[0.04] border border-primary/10 rounded-2xl p-5 flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              {tDetail("ctaIntroPart1")}
              <Link
                href="/contact?interest=consulenza&from=portfolio"
                className="text-primary font-semibold hover:underline"
              >
                {tDetail("ctaIntroLink")}
              </Link>
              {tDetail("ctaIntroPart2")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
