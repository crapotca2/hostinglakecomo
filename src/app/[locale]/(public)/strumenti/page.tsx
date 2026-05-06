import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Wand2,
  Lightbulb,
  BookOpen,
  PenTool,
  ArrowRight,
  Navigation,
  Euro,
  CheckCircle2,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";

type RoadmapStage = "ready" | "in-progress";
type RoadmapKey =
  | "dynamicPricing"
  | "istruzioniArrivoVideo"
  | "listingOptimizer"
  | "calcolatoreTasse"
  | "welcomeBook"
  | "logo";

interface RoadmapTool {
  key: RoadmapKey;
  stage: RoadmapStage;
  icon: React.ComponentType<{ className?: string }>;
}

const ROADMAP_TOOLS: RoadmapTool[] = [
  { key: "dynamicPricing", stage: "ready", icon: Wand2 },
  { key: "istruzioniArrivoVideo", stage: "ready", icon: Navigation },
  { key: "listingOptimizer", stage: "ready", icon: Lightbulb },
  { key: "calcolatoreTasse", stage: "in-progress", icon: Euro },
  { key: "welcomeBook", stage: "in-progress", icon: BookOpen },
  { key: "logo", stage: "in-progress", icon: PenTool },
];

export default function StrumentiPage() {
  const tSection = useTranslations("strumenti.indice.section1");
  const tRoadmap = useTranslations("strumenti.indice.roadmap");
  const tFinal = useTranslations("strumenti.indice.finalCta");

  const sectionBullets = tSection.raw("bullets") as string[];
  const mockupNameOptions = tSection.raw("mockupName.options") as string[];

  const advanced = [...ROADMAP_TOOLS].sort(
    (a, b) =>
      (a.stage === "ready" ? 0 : 1) - (b.stage === "ready" ? 0 : 1)
  );

  return (
    <div className="pt-20">
      {/* TOOL AREA CLIENTI — stacked mockups, white */}
      <section className="pt-24 pb-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[5fr_6fr] gap-12 lg:gap-16 items-center">
            {/* TEXT */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
                {tSection("title1")}{" "}
                <span className="font-semibold">{tSection("title2")}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {tSection("body")}
              </p>
              <ul className="space-y-3 mb-8">
                {sectionBullets.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D3A62] text-white text-sm font-semibold hover:bg-[#1D3A62]/90 transition-colors shadow-md"
              >
                {tSection("ctaDashboard")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* STACKED MOCKUPS */}
            <div className="relative h-[460px] sm:h-[480px] lg:h-[420px] mt-8 lg:mt-0">
              {/* Map mockup — back card */}
              <div className="absolute right-0 bottom-0 w-[78%] sm:w-[70%] rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(29,58,98,0.55)] border border-border/40 overflow-hidden rotate-[3deg] translate-y-2">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {tSection("mockupMap.title")}
                  </span>
                </div>
                <div className="relative h-32 bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 overflow-hidden">
                  {/* Stylised roads */}
                  <svg
                    viewBox="0 0 200 120"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M-10 70 Q 60 60, 110 80 T 220 70"
                      stroke="#94a3b8"
                      strokeWidth="3"
                      fill="none"
                      opacity="0.6"
                    />
                    <path
                      d="M30 -10 L 80 90 L 130 130"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                    />
                    <path
                      d="M40 60 L 90 75 L 140 60 L 175 50"
                      stroke="#1D3A62"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  <div className="absolute" style={{ left: "44%", top: "55%" }}>
                    <MapPin className="h-5 w-5 text-rose-500 fill-rose-500 drop-shadow" />
                  </div>
                </div>
                <div className="px-4 py-2.5 text-[10px] text-muted-foreground border-t border-border/40">
                  {tSection("mockupMap.caption")}
                </div>
              </div>

              {/* Welcome letter mockup — middle card */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[72%] sm:w-[64%] rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(29,58,98,0.55)] border border-border/40 overflow-hidden -rotate-[2deg] z-10">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {tSection("mockupWelcome.title")}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    {tSection("mockupWelcome.languages")}
                  </span>
                </div>
                <div className="p-4 space-y-2 bg-white">
                  <div className="text-xs font-semibold text-foreground">
                    {tSection("mockupWelcome.preview")}
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-muted/60 w-full" />
                    <div className="h-1.5 rounded-full bg-muted/60 w-[92%]" />
                    <div className="h-1.5 rounded-full bg-muted/60 w-[78%]" />
                  </div>
                  <div className="pt-1 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted/60 w-[88%]" />
                    <div className="h-1.5 rounded-full bg-muted/60 w-[70%]" />
                  </div>
                </div>
              </div>

              {/* Nome proprieta mockup — front card */}
              <div className="absolute right-2 top-0 w-[74%] sm:w-[62%] rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(29,58,98,0.55)] border border-border/40 overflow-hidden rotate-[2deg] z-20">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {tSection("mockupName.title")}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {mockupNameOptions.map((name, i) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                        i === 0
                          ? "bg-primary/[0.08] border border-primary/20 text-foreground font-semibold"
                          : "bg-muted/30 border border-border/40 text-muted-foreground"
                      }`}
                    >
                      <span>{name}</span>
                      {i === 0 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP PRODOTTO */}
      <section className="py-20 bg-[#1D3A62] text-white relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-light text-white">
              <span className="font-semibold">{tRoadmap("title")}</span>
            </h2>
            <p className="mt-2 text-white/75">{tRoadmap("subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advanced.map((tool) => {
              const isReady = tool.stage === "ready";
              return (
                <div
                  key={tool.key}
                  className="bg-white text-foreground rounded-2xl p-7 border border-border/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold">
                      {tRoadmap(`tools.${tool.key}.name`)}
                    </h3>
                    {!isReady && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                        <Clock className="h-2.5 w-2.5" />
                        {tRoadmap("inProgress")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tRoadmap(`tools.${tool.key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">
            {tFinal("title1")}{" "}
            <span className="font-semibold">{tFinal("title2")}</span>
            {tFinal("title3")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {tFinal("subtitle")}
          </p>
          <Link
            href="/contact?interest=consulenza&from=strumenti"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            {tFinal("button")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
