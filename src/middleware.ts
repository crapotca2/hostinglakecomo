import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export default function middleware(req: NextRequest) {
  const protectedPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(/dashboard|/admin)(/.*)?/?$`,
    "i",
  );

  if (protectedPathnameRegex.test(req.nextUrl.pathname)) {
    return (authMiddleware as unknown as (req: NextRequest) => Response)(req);
  }

  return intlMiddleware(req);
}

export const config = {
  // Excludes: api routes, Next internals, Vercel internals, anything with a dot
  // (favicon.ico, *.svg, *.png, manifest.webmanifest...) and the apple-icon
  // metadata route which Next.js serves without a file extension.
  matcher: ["/((?!api|_next|_vercel|apple-icon|.*\\..*).*)"],
};
