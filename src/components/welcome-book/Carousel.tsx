"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < max);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = (el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <div className="relative -mx-4 sm:-mx-6 print:mx-0">
      <div
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden print:flex-wrap print:overflow-visible print:snap-none"
      >
        {children}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scorri a sinistra"
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 items-center justify-center text-[#1D3A62] hover:bg-[#1D3A62] hover:text-white hover:border-[#1D3A62] transition-colors print:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3A62]/40"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scorri a destra"
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 items-center justify-center text-[#1D3A62] hover:bg-[#1D3A62] hover:text-white hover:border-[#1D3A62] transition-colors print:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3A62]/40"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
