import type { Metadata } from "next";
import Image from "next/image";
import {
  Star,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import team from "@/data/team.json";
import { pickLocalized } from "@/lib/i18n-data";
import { buildMetadata } from "@/lib/seo";
import { JsonLdAngelo } from "@/components/seo/jsonld-person";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { JsonLdFaq, type FaqItem } from "@/components/seo/jsonld-faq";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Chi Siamo — Angelo Talarico, Superhost dal 2017",
    description:
      "9 anni di esperienza diretta come host sul Lago di Como, oltre 350 recensioni positive a 5 stelle. La storia dietro Como Host.",
  },
  en: {
    title: "About Us — Angelo Talarico, Superhost since 2017",
    description:
      "9 years of hands-on hosting experience on Lake Como, 350+ five-star reviews. The story behind Host Como.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale] ?? COPY.it;
  return buildMetadata({
    locale,
    pathname: "/about",
    title: copy.title,
    description: copy.description,
  });
}

const COMPETENCE_AREAS = [
  { key: "accoglienza", icon: Sparkles },
  { key: "operativita", icon: ShieldCheck },
  { key: "esperienze", icon: MapPinned },
] as const;

export default function AboutPage() {
  const tHero = useTranslations("about.hero");
  const tNarr = useTranslations("about.narrative");
  const tComp = useTranslations("about.competenceAreas");
  const tTeam = useTranslations("about.team");
  const tSpot = useTranslations("about.team.spotlight");
  const tFaq = useTranslations("about.faq");
  const faqItems = tFaq.raw("items") as FaqItem[];
  const locale = useLocale();

  return (
    <div className="pt-20">
      <JsonLdAngelo />
      <section className="py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-light mb-4">
            {tHero("title1")}{" "}
            <span className="font-semibold">{tHero("title1Strong")}</span>
            <br />
            {tHero("title2")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {tHero("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#1D3A62] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.webp')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[6fr_5fr] gap-10 lg:gap-14 items-center">
            <div className="space-y-5 leading-relaxed">
              <p className="text-lg">
                {tNarr("p1Prefix")}
                <strong>{tNarr("p1Strong1")}</strong>
                {tNarr("p1Mid")}
                <strong>{tNarr("p1Strong2")}</strong>
                {tNarr("p1Suffix")}
              </p>
              <p className="text-white/85">
                {tNarr("p2Prefix")}
                <strong className="text-white">{tNarr("p2Strong1")}</strong>
                {tNarr("p2Mid")}
                <strong className="text-white">{tNarr("p2Strong2")}</strong>
                {tNarr("p2Suffix")}
              </p>
              <p className="text-white/85">{tNarr("p3")}</p>
            </div>

            {/* Tre aree di specializzazione */}
            <div className="space-y-3">
              {COMPETENCE_AREAS.map((c) => (
                <div
                  key={c.key}
                  className="bg-white/[0.06] border border-white/15 rounded-xl px-5 py-4 flex items-start gap-3 backdrop-blur-sm"
                >
                  <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <c.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {tComp(`${c.key}.title`)}
                    </div>
                    <div className="text-[12px] text-white/75 leading-relaxed mt-0.5">
                      {tComp(`${c.key}.desc`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">
              {tTeam("title1")}{" "}
              <span className="font-semibold">{tTeam("title1Strong")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {tTeam("subtitle")}
            </p>
          </div>

          {/* Spotlight Angelo */}
          {(() => {
            const angelo = team.members.find((m) => m.id === "angelo");
            if (!angelo) return null;
            const role = pickLocalized<string>(angelo, "role", locale) ?? angelo.role;
            const bio = pickLocalized<string>(angelo, "bio", locale) ?? angelo.bio;
            const highlights =
              pickLocalized<string[]>(angelo, "highlights", locale) ??
              angelo.highlights;
            return (
              <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden grid md:grid-cols-[5fr_7fr] max-w-4xl mx-auto">
                <div className="aspect-square md:aspect-auto bg-muted relative overflow-hidden">
                  {angelo.profilePicture && (
                    <Image
                      src={angelo.profilePicture}
                      alt={`${angelo.name} — ${role}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                  )}
                  {angelo.isSuperhost && (
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                        {tSpot("superhostBadge")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                    {tSpot("eyebrow")}
                  </span>
                  <h3 className="text-2xl font-semibold mb-1">{angelo.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{role}</p>
                  <p className="text-foreground leading-relaxed mb-5">{bio}</p>
                  <ul className="space-y-2 mb-6">
                    {highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  {angelo.airbnbProfileUrl && (
                    <a
                      href={angelo.airbnbProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-muted/40 transition-colors w-fit"
                    >
                      {tSpot("viewProfile")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <JsonLdFaq items={faqItems} />
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {tFaq("eyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-3">
              {tFaq("title1")}{" "}
              <span className="font-semibold">{tFaq("title1Strong")}</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {tFaq("subtitle")}
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}
