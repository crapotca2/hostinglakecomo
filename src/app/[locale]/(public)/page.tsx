import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  ArrowRight,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getPortfolio } from "@/lib/portfolio";
import { PartnersBanner } from "@/components/public/partners-banner";
import { ExperiencesSection } from "@/components/public/experiences-section";
import { PropertyCard } from "@/components/public/property-card";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const HOME_COPY = {
  it: {
    title: "Property Manager Lago di Como · 9 anni · 350+ recensioni 5★",
    description:
      "Gestiamo i tuoi affitti brevi sul Lago di Como: pricing dinamico, accoglienza, compliance, report mensili. 9 anni di esperienza · 350+ recensioni 5★. Consulenza gratuita.",
  },
  en: {
    title: "Lake Como Property Management · 9 yrs · 350+ 5★ reviews",
    description:
      "We manage your short-term rentals on Lake Como: dynamic pricing, hospitality, compliance, monthly reports. 9 years · 350+ 5★ reviews. Free consult.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = HOME_COPY[locale] ?? HOME_COPY.it;
  return buildMetadata({
    locale,
    pathname: "/",
    title: copy.title,
    description: copy.description,
  });
}

const FEATURED_PROPERTIES = (() => {
  const all = getPortfolio();
  return all.filter((p) => p.images.length > 0).slice(0, 3);
})();

const OWNER_SERVICE_KEYS = [
  "dynamicPricing",
  "bookings",
  "compliance",
  "hospitality",
  "promotion",
  "dashboard",
] as const;

const SIMULATOR_SLUGS = ["rendita", "investimento", "profitDiretto"] as const;
const SIMULATOR_HREFS: Record<(typeof SIMULATOR_SLUGS)[number], string> = {
  rendita: "/strumenti/rendita",
  investimento: "/strumenti/investimento",
  profitDiretto: "/strumenti/profit-diretto",
};

export default function HomePage() {
  const tc = useTranslations("common");
  const tHero = useTranslations("home.hero");
  const tMc = useTranslations("home.multiChannel");
  const tOs = useTranslations("home.ownerServices");
  const tFp = useTranslations("home.featuredProperties");
  const tSim = useTranslations("home.simulators");
  const tCta = useTranslations("home.ctaBanner");

  const whyUs = tMc.raw("bullets") as string[];

  return (
    <>
      {/* ═══ VIDEO HERO ═══ */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        {/* Mobile: solo poster image (no autoplay video per risparmio banda) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/listing/casa-di-miriam/02-vista-lago.webp"
          alt=""
          aria-hidden="true"
          className="md:hidden absolute inset-0 w-full h-full object-cover"
        />
        {/* Desktop+: video autoplay */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/listing/casa-di-miriam/02-vista-lago.webp"
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D3A62]/80 via-[#1D3A62]/45 to-[#1D3A62]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm border border-white/20">
              <MapPin className="h-3.5 w-3.5" />
              {tHero("location")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[1.05] mb-6">
              {tHero("title1")}
              <br />
              <span className="font-semibold">{tHero("title2")}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
              {tHero("subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?interest=consulenza&from=hero"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-foreground text-sm font-semibold hover:bg-white/90 transition-all shadow-lg"
              >
                {tHero("ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4" />
                {tHero("ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ MULTI-CANALE / GESTIONE ═══ */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-12 items-center">
            <div>
              <div className="max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-6">
                  {tMc("title1")}{" "}
                  <span className="font-semibold">{tMc("title2")}</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {tMc("body")}
                </p>
                <ul className="space-y-4 mb-8">
                  {whyUs.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {tc("discoverServices")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/host.webp"
                alt={tMc("imageAlt")}
                width={1200}
                height={900}
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                className="w-full h-auto [mask-image:linear-gradient(to_right,black_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_82%,transparent_100%)]"
              />
              <div className="absolute -bottom-12 left-0 lg:left-4 bg-white rounded-2xl p-5 shadow-xl border border-border/50 hidden lg:block">
                <div className="text-2xl font-bold text-primary">
                  {tMc("yearsBadgeYears")}
                </div>
                <div className="text-xs text-muted-foreground whitespace-pre-line">
                  {tMc("yearsBadgeText")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PARTNERS & CHANNELS ═══ */}
      <PartnersBanner />

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/banners/more-info.jpg"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#1D3A62]/65" />
            <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
              <picture>
                <source srcSet="/images/logo/logo-white.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/logo-white.png"
                  alt=""
                  width={112}
                  height={112}
                  className="h-24 w-24 md:h-28 md:w-28 mx-auto mb-5 object-contain [filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.55))]"
                />
              </picture>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-4 [text-shadow:0_10px_36px_rgba(0,0,0,0.7)]">
                {tCta("title")}
              </h2>
              <p className="text-white text-sm md:text-base max-w-2xl mx-auto mb-7 uppercase tracking-wide font-medium leading-relaxed">
                {tCta("subtitleLine1")}
                <br />
                {tCta("subtitleLine2")}
              </p>
              <Link
                href="/contact?interest=consulenza&from=cta-home"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white hover:bg-white/90 text-foreground font-semibold text-sm tracking-wide transition-colors shadow-lg"
              >
                {tc("requestConsultation")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVIZI PER PROPRIETARI ═══ */}
      <section className="py-24 relative bg-[url('/images/textures/services-bg.webp')] bg-cover bg-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#1D3A62]/75 pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {tOs("eyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white mt-3 mb-4">
              {tOs("title1")}{" "}
              <span className="font-semibold">{tOs("title2")}</span>
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              {tOs("subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OWNER_SERVICE_KEYS.map((key) => (
              <div
                key={key}
                className="group bg-white rounded-2xl p-7 border border-border/50 card-hover"
              >
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {tOs(`items.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tOs(`items.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              {tc("discoverServices")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ESPERIENZE — Lake Como Charter ═══ */}
      <ExperiencesSection />

      {/* ═══ SIMULATORI / POTENZIALE ═══ */}
      <section className="py-24 bg-[#1D3A62] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.webp')] bg-cover bg-center"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
              {tSim("title1")}{" "}
              <span className="font-semibold">{tSim("title2")}</span>
              {tSim("title3") ? ` ${tSim("title3")}` : ""}
            </h2>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed">
              {tSim("subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIMULATOR_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={SIMULATOR_HREFS[slug]}
                className="group card-hover block bg-white text-foreground rounded-2xl p-7 border border-border/50"
              >
                <h3 className="text-base font-semibold mb-2">
                  {tSim(`${slug}.name`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {tSim(`${slug}.desc`)}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  {tc("tryTheTool")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROPRIETA IN EVIDENZA ═══ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground">
                {tFp("title1")}{" "}
                <span className="font-semibold">{tFp("title2")}</span>
              </h2>
            </div>
            <Link
              href="/properties"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              {tc("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PROPERTIES.map((p) => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
