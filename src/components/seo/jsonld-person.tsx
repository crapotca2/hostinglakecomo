import { SITE_URL, BRAND_NAME } from "@/lib/seo";

const ANGELO_AIRBNB =
  "https://www.airbnb.it/users/show/1462513131563105498";

export function JsonLdAngelo() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#angelo-talarico`,
    name: "Angelo Talarico",
    jobTitle: "Property Manager, Founder",
    worksFor: { "@id": `${SITE_URL}/#organization` },
    sameAs: [ANGELO_AIRBNB],
    description:
      "Property manager con 9 anni di esperienza diretta come host sul Lago di Como, oltre 350 recensioni positive a 5 stelle, status Superhost.",
    url: `${SITE_URL}/about`,
    nationality: { "@type": "Country", name: "IT" },
    homeLocation: {
      "@type": "Place",
      name: "Como, Lago di Como",
    },
    knowsAbout: [
      "Property Management",
      "Short-term Rental",
      "Airbnb Hosting",
      "Dynamic Pricing",
      "Guest Hospitality",
      "Lake Como",
    ],
    affiliation: { "@id": `${SITE_URL}/#organization`, name: BRAND_NAME },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
