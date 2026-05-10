import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { SITE_URL, BRAND_NAME } from "@/lib/seo";
import { JsonLdOrganization } from "@/components/seo/jsonld-organization";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — Property Manager Lago di Como`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Property manager professionisti sul Lago di Como. Gestione completa affitti brevi: pricing, accoglienza, compliance, reportistica. 9 anni di esperienza.",
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
};

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
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <JsonLdOrganization />
      </body>
    </html>
  );
}
