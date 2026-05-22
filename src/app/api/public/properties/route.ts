import { NextResponse } from "next/server";
import { getPublicPortfolio } from "@/lib/portfolio";

// Public, no-auth endpoint consumed by easycomo.com (the sibling tourism site)
// to surface Host Como managed properties in its "Stay" funnel.
//
// Returns a minimal projection of each property: only fields needed by the
// Easy Como cards. CORS open for the sibling origin.

export const revalidate = 3600;

export async function GET() {
  const portfolio = getPublicPortfolio();
  const projection = portfolio.map((p) => ({
    slug: p.slug,
    name: p.name,
    zone: p.zone,
    city: p.address.city,
    description: p.description,
    image: p.images?.[0]?.url ?? null,
    url: `https://hostcomo.com/properties/${p.slug}`,
  }));

  return NextResponse.json(projection, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
