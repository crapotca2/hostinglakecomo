import type { Metadata, Viewport } from "next";
import { Outfit, Bungee, Manrope, Russo_One } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { SITE_URL, BRAND_NAME, brandName } from "@/lib/seo";
import { JsonLdOrganization } from "@/components/seo/jsonld-organization";
import type { Locale } from "@/i18n/routing";

// Outfit has no Cyrillic subset on Google Fonts — we load it as the primary
// body font for Latin/IT/EN and chain Manrope (visually nearest grotesk with
// full Cyrillic support) as per-glyph fallback for RU.
const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit-cyrillic",
  display: "swap",
});

const bungee = Bungee({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-bungee",
  display: "swap",
});

// Bungee has no Cyrillic — Russo One is the closest Cyrillic-capable display
// match (single 400 weight, condensed block sans). Used as per-glyph fallback
// in the .font-bungee chain so "Хост Комо" wordmark renders coherently.
const russoOne = Russo_One({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-bungee-cyrillic",
  display: "swap",
});

const ROOT_COPY = {
  it: {
    defaultTitle: "Como Host — Property Manager Lago di Como",
    description:
      "Property manager professionisti sul Lago di Como. Gestione completa affitti brevi: pricing, accoglienza, compliance, reportistica. 9 anni di esperienza.",
  },
  en: {
    defaultTitle: "Host Como — Lake Como Property Management",
    description:
      "Professional property managers on Lake Como. Full short-term rental management: pricing, hospitality, compliance, reporting. 9 years of experience.",
  },
  ru: {
    defaultTitle: "Хост Комо — Управление недвижимостью на озере Комо",
    description:
      "Профессиональные управляющие недвижимостью на озере Комо. Полное управление краткосрочной арендой: ценообразование, приём гостей, юридическое соответствие, отчётность. 9 лет опыта.",
  },
} as const;

export const viewport: Viewport = {
  themeColor: "#1D3A62",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = ROOT_COPY[locale] ?? ROOT_COPY.it;
  const brand = brandName(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: copy.defaultTitle,
      template: `%s | ${brand}`,
    },
    description: copy.description,
    keywords: [
      "property manager lago di como",
      "gestione affitti brevi como",
      "gestione airbnb como",
      "co-host airbnb como",
      "agenzia gestione airbnb como",
    ],
    applicationName: BRAND_NAME,
    authors: [{ name: "Angelo Talarico" }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      title: "Host Como",
      statusBarStyle: "default",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${manrope.variable} ${bungee.variable} ${russoOne.variable} font-sans`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <JsonLdOrganization />
      </body>
    </html>
  );
}
