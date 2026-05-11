import { SITE_URL } from "@/lib/seo";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type Props = {
  items: BreadcrumbItem[];
  locale: string;
};

export function JsonLdBreadcrumb({ items, locale }: Props) {
  const prefix = locale === "it" ? "" : `/${locale}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: `${SITE_URL}${prefix}${it.path === "/" ? "" : it.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
