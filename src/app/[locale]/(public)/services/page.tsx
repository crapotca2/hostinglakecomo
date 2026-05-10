import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardMockup } from "@/components/public/dashboard-mockup";
import { EmailRecapMockup } from "@/components/public/email-recap-mockup";
import { ServicesCarousel } from "@/components/public/services-carousel";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const SERVICES_COPY = {
  it: {
    title: "Gestione Affitti Brevi Como — Servizi Property Manager",
    description:
      "Tariffe dinamiche, accoglienza ospiti, adempimenti CIN e cedolare, multi-canale Airbnb/Booking. Il property manager che gestisce tutto per te.",
  },
  en: {
    title: "Lake Como Short-Term Rental Management Services",
    description:
      "Dynamic pricing, guest hospitality, CIN and tax compliance, Airbnb/Booking multi-channel. The property manager that handles everything for you.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = SERVICES_COPY[locale] ?? SERVICES_COPY.it;
  return buildMetadata({
    locale,
    pathname: "/services",
    title: copy.title,
    description: copy.description,
  });
}

export default function ServicesPage() {
  const tHero = useTranslations("services.hero");
  const tCar = useTranslations("services.carousel");
  const tDash = useTranslations("services.dashboard");
  const tEmail = useTranslations("services.email");
  const tCta = useTranslations("services.cta");

  const dashboardBlocks = tDash.raw("blocks") as {
    title: string;
    desc: string;
  }[];
  const emailBullets = tEmail.raw("bullets") as string[];

  return (
    <div className="pt-20">
      {/* HERO */}
      <section className="relative py-24 sm:py-28 overflow-hidden bg-gradient-to-b from-primary/[0.04] via-white to-white border-b border-border/50">
        <div className="absolute inset-0 -z-10 opacity-[0.03] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light mb-5 tracking-tight">
            {tHero("title1")}{" "}
            <span className="font-semibold">{tHero("title1Strong")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {tHero("bodyPrefix")}
            <strong className="text-foreground">{tHero("bodyStrong1")}</strong>
            {tHero("bodyMid")}
            <strong className="text-foreground">{tHero("bodyStrong2")}</strong>
            {tHero("bodySuffix")}
          </p>
        </div>
      </section>

      {/* SERVICE GROUPS */}
      <section
        id="services"
        className="py-24 bg-[#1D3A62] text-white relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-3 text-white sm:whitespace-nowrap">
              {tCar("title1")}{" "}
              <span className="font-semibold">{tCar("title1Strong")}</span>
              {tCar("title2")}{" "}
              <span className="font-semibold">{tCar("title2Strong")}</span>{" "}
              {tCar("title3")}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              {tCar("subtitle")}
            </p>
          </div>

          <ServicesCarousel />
        </div>
      </section>

      {/* DASHBOARD */}
      <section id="dashboard" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[5fr_6fr] gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light mb-4">
                {tDash("title1")}{" "}
                <span className="font-semibold">{tDash("title1Strong")}</span>{" "}
                {tDash("title2")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {tDash("body")}
              </p>
              <ul className="space-y-3">
                {dashboardBlocks.map((b) => (
                  <li
                    key={b.title}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="h-6 w-6 rounded-md bg-primary/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <strong className="font-semibold">{b.title}</strong>
                      <span className="text-muted-foreground">
                        {" "}
                        — {b.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:sticky lg:top-24">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* EMAIL RECAP */}
      <section
        id="email"
        className="py-24 bg-[#1D3A62] text-white relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[6fr_5fr] gap-10 lg:gap-14 items-center">
            <div className="order-2 lg:order-1">
              <EmailRecapMockup />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-light mb-4 text-white">
                {tEmail("title1")}{" "}
                <span className="font-semibold">{tEmail("title1Strong")}</span>{" "}
                {tEmail("title2")}
              </h2>
              <p className="text-white/80 leading-relaxed mb-5">
                {tEmail("body")}
              </p>
              <ul className="space-y-2 text-sm text-white/90">
                {emailBullets.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <ArrowRight className="h-3.5 w-3.5 text-white/70 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-4">
            {tCta("title1")}{" "}
            <span className="font-semibold">{tCta("title1Strong")}</span>
            {tCta("title2")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {tCta("bodyLine1")}
            <br />
            {tCta("bodyLine2")}
          </p>
          <Link
            href="/contact?interest=consulenza&from=services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            {tCta("button")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
