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
} from "lucide-react";
import { getPortfolioEntry, getZoneLabel, getTypeLabel } from "@/lib/portfolio";
import { AirbnbReviewBlock } from "@/components/public/airbnb-review-block";
import { GoogleMapEmbed } from "@/components/public/google-map-embed";
import { PropertyGallery } from "@/components/public/property-gallery";

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
        className="h-72 sm:h-80"
      />
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const property = getPortfolioEntry(slug);

  if (!property) {
    return (
      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4">
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

  const sections = property.sections ?? {};
  const geo = property.geo;
  const airbnbListing = property.airbnbListing;

  const SITE_URL = "https://hostinglakecomo.vercel.app";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: property.name,
    description: property.descriptionLong || property.description,
    image: property.images
      .slice(0, 8)
      .map((img) => `${SITE_URL}${img.url}`),
    numberOfRooms: property.details.bedrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: property.details.maxGuests,
    },
    amenityFeature: property.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
    })),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.street || undefined,
      addressLocality: property.address.city,
      addressRegion: "Lombardia",
      postalCode: property.address.zip,
      addressCountry: "IT",
    },
    ...(geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.lat,
        longitude: geo.lng,
      },
    }),
    ...(airbnbListing?.rating && airbnbListing?.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: airbnbListing.rating,
            reviewCount: airbnbListing.reviewCount,
            bestRating: 5,
          },
        }
      : {}),
    ...(airbnbListing?.url && { sameAs: [airbnbListing.url] }),
  };

  return (
    <div className="pt-24 pb-20 bg-muted/20 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tutte le proprieta
        </Link>

        <PropertyGallery
          images={property.images}
          propertyName={property.name}
          hasLakeView={property.details.hasLakeView}
        />

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border/50">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-xs font-medium">
                {getTypeLabel(property.type)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-3">
              {property.name}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground flex-wrap gap-y-2">
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
                  <Star className="h-4 w-4 fill-foreground text-foreground" />
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

            {(sections.space || sections.neighborhood) && (
              <div className="mt-6 pt-6 border-t border-border/40 grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {sections.space && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HomeIcon className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Lo spazio
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
                        Il quartiere
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

          {!sections.space && !sections.neighborhood && property.descriptionLong && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                  <HomeIcon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Descrizione</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.descriptionLong}
              </p>
            </div>
          )}

          <div className="bg-primary/[0.04] border border-primary/10 rounded-2xl p-5 flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              Questa è una delle proprietà che il team Hosting Lake Como gestisce
              oggi: lo stesso metodo — hospitality, operations e revenue
              management — lo applichiamo agli immobili dei nostri clienti.{" "}
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
