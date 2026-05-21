import { SITE_URL, BRAND_NAME } from "@/lib/seo";

const ORG_PHONE = "+393517180435";
const ORG_EMAIL = "info@hostcomo.com";
const ORG_LOCALITY = "Como";
const ORG_REGION = "Lombardia";
const ORG_COUNTRY = "IT";
const ORG_GEO = { lat: 45.808, lng: 9.085 };
const ANGELO_AIRBNB =
  "https://www.airbnb.it/users/show/1462513131563105498";

export function JsonLdOrganization() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        alternateName: ["Como Host"],
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo/logo-marble.png`,
        image: `${SITE_URL}/images/host.webp`,
        email: ORG_EMAIL,
        telephone: ORG_PHONE,
        address: {
          "@type": "PostalAddress",
          addressLocality: ORG_LOCALITY,
          addressRegion: ORG_REGION,
          addressCountry: ORG_COUNTRY,
        },
        sameAs: [ANGELO_AIRBNB],
        founder: {
          "@type": "Person",
          name: "Angelo Talarico",
          sameAs: ANGELO_AIRBNB,
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: BRAND_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/images/logo/logo-marble.png`,
        email: ORG_EMAIL,
        telephone: ORG_PHONE,
        priceRange: "€€",
        areaServed: {
          "@type": "Place",
          name: "Lago di Como",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: ORG_LOCALITY,
          addressRegion: ORG_REGION,
          addressCountry: ORG_COUNTRY,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: ORG_GEO.lat,
          longitude: ORG_GEO.lng,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND_NAME,
        inLanguage: ["it-IT", "en-US"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
