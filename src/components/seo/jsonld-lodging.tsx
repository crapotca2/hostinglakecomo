import { SITE_URL, BRAND_NAME } from "@/lib/seo";
import type { PortfolioEntry } from "@/lib/portfolio";

type Props = {
  property: PortfolioEntry;
  locale: string;
  description: string;
};

export function JsonLdLodging({ property, locale, description }: Props) {
  const url = `${SITE_URL}${locale === "it" ? "" : `/${locale}`}/properties/${property.slug}`;
  const images = property.images
    .slice(0, 8)
    .map((img) =>
      img.url.startsWith("http") ? img.url : `${SITE_URL}${img.url}`,
    );

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${url}#lodging`,
    name: property.name,
    description,
    url,
    image: images,
    priceRange: "€€",
    numberOfRooms: property.details.bedrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: property.details.maxGuests,
    },
    amenityFeature: property.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.address.city,
      addressRegion: "Lombardia",
      postalCode: property.address.zip || undefined,
      addressCountry: "IT",
    },
    provider: { "@id": `${SITE_URL}/#organization` },
    brand: BRAND_NAME,
  };

  if (property.geo) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: property.geo.lat,
      longitude: property.geo.lng,
    };
  }

  const listing = property.airbnbListing;
  if (listing?.rating != null && listing.reviewCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.reviewCount,
      bestRating: 5,
    };
    data.sameAs = [listing.url];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
