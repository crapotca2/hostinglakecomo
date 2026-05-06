"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CalendarCheck,
  ClipboardCheck,
  Camera,
  Star,
  PackageCheck,
  Calculator,
  FileText,
  Home as HomeIcon,
  type LucideIcon,
} from "lucide-react";

type GroupKey = "setup" | "operations" | "optimization" | "reporting";

const SERVICE_GROUPS: {
  key: GroupKey;
  icons: LucideIcon[];
}[] = [
  {
    key: "setup",
    icons: [HomeIcon, Camera, Sparkles, ClipboardCheck],
  },
  {
    key: "operations",
    icons: [Sparkles, CalendarCheck, HomeIcon, ShieldCheck],
  },
  {
    key: "optimization",
    icons: [TrendingUp, TrendingUp, Star, PackageCheck],
  },
  {
    key: "reporting",
    icons: [ShieldCheck, Calculator, FileText, ClipboardCheck],
  },
];

type GroupItem = {
  title: string;
  desc: string;
  cost?: string;
};

export function ServicesCarousel() {
  const t = useTranslations("services.carousel");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const idx = panelsRef.current.indexOf(
            visible[0].target as HTMLDivElement,
          );
          if (idx >= 0) setActive(idx);
        }
      },
      { root: scroller, threshold: [0.4, 0.6, 0.8] },
    );
    panelsRef.current.forEach((p) => p && obs.observe(p));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (idx: number) => {
    const panel = panelsRef.current[idx];
    if (panel && scrollerRef.current) {
      scrollerRef.current.scrollTo({
        left: panel.offsetLeft - scrollerRef.current.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  const groups = SERVICE_GROUPS.map((g) => {
    const items = t.raw(`groups.${g.key}.items`) as GroupItem[];
    return {
      key: g.key,
      title: t(`groups.${g.key}.title`),
      desc: t(`groups.${g.key}.desc`),
      items: items.map((it, i) => ({
        ...it,
        icon: g.icons[i] ?? g.icons[0],
      })),
    };
  });

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {groups.map((g, i) => (
          <button
            key={g.key}
            type="button"
            onClick={() => scrollTo(i)}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-full border transition-colors ${
              i === active
                ? "bg-white text-[#1D3A62] border-white"
                : "bg-transparent text-white/85 border-white/30 hover:border-white/70 hover:text-white"
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-2"
      >
        <div className="flex gap-6">
          {groups.map((g, i) => (
            <div
              key={g.key}
              ref={(el) => {
                panelsRef.current[i] = el;
              }}
              className="snap-start shrink-0 w-full sm:w-[92%] lg:w-full"
            >
              <div className="rounded-2xl bg-white text-foreground border border-border/50 p-6 sm:p-8 h-full">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-10">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                      {String(i + 1).padStart(2, "0")} {t("ofLabel")}{" "}
                      {String(groups.length).padStart(2, "0")}
                    </div>
                    <h3 className="text-2xl font-light mb-3">
                      <span className="font-semibold">{g.title}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {g.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="rounded-xl bg-muted/30 border border-border/40 p-4 flex gap-3 relative"
                        >
                          <div className="h-9 w-9 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-semibold">
                                {item.title}
                              </h4>
                              {item.cost && (
                                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/[0.08] border border-primary/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  {item.cost}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {groups.map((g, i) => (
          <button
            key={g.key}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={t("goToAria", { title: g.title })}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-8 bg-white" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
