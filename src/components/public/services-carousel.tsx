"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

export type ServiceGroup = {
  title: string;
  desc: string;
  items: Item[];
};

export function ServicesCarousel({ groups }: { groups: ServiceGroup[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // IntersectionObserver to track which panel is most visible
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
            visible[0].target as HTMLDivElement
          );
          if (idx >= 0) setActive(idx);
        }
      },
      { root: scroller, threshold: [0.4, 0.6, 0.8] }
    );
    panelsRef.current.forEach((p) => p && obs.observe(p));
    return () => obs.disconnect();
  }, [groups.length]);

  const scrollTo = (idx: number) => {
    const panel = panelsRef.current[idx];
    if (panel && scrollerRef.current) {
      scrollerRef.current.scrollTo({
        left: panel.offsetLeft - scrollerRef.current.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  const canPrev = active > 0;
  const canNext = active < groups.length - 1;

  return (
    <div className="relative">
      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {groups.map((g, i) => (
            <button
              key={g.title}
              type="button"
              onClick={() => scrollTo(i)}
              className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                i === active
                  ? "bg-[#1D3A62] text-white border-[#1D3A62]"
                  : "bg-white text-foreground border-border/60 hover:border-foreground/40"
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => canPrev && scrollTo(active - 1)}
            disabled={!canPrev}
            aria-label="Area precedente"
            className="h-9 w-9 rounded-full border border-border/60 bg-white flex items-center justify-center text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => canNext && scrollTo(active + 1)}
            disabled={!canNext}
            aria-label="Area successiva"
            className="h-9 w-9 rounded-full border border-border/60 bg-white flex items-center justify-center text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroller */}
      <div
        ref={scrollerRef}
        className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-2"
      >
        <div className="flex gap-6">
          {groups.map((g, i) => (
            <div
              key={g.title}
              ref={(el) => {
                panelsRef.current[i] = el;
              }}
              className="snap-start shrink-0 w-full sm:w-[92%] lg:w-full"
            >
              <div className="rounded-2xl bg-white border border-border/50 p-6 sm:p-8 h-full">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-10">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                      {String(i + 1).padStart(2, "0")} di {String(groups.length).padStart(2, "0")}
                    </div>
                    <h3 className="text-2xl font-light mb-3">
                      <span className="font-semibold">{g.title}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {g.items.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl bg-muted/30 border border-border/40 p-4 flex gap-3"
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-5">
        {groups.map((g, i) => (
          <button
            key={g.title}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Vai a ${g.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-8 bg-[#1D3A62]" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
