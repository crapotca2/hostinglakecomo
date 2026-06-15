"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function RoomCarousel({
  photos,
  alt,
  aspect = "aspect-[4/3]",
}: {
  photos: string[];
  alt: string;
  aspect?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : Math.min(i + 1, photos.length - 1)));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : Math.max(i - 1, 0)));
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIdx, photos.length]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="relative -mx-4 sm:mx-0 mb-4">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden print:grid print:grid-cols-3 print:gap-2 print:overflow-visible print:snap-none print:p-0"
        role="region"
        aria-label={alt}
      >
        {photos.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className={`snap-start flex-shrink-0 group relative ${aspect} w-[78vw] sm:w-[280px] md:w-[320px] rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 hover:ring-[#1D3A62]/40 transition-all cursor-zoom-in print:w-full print:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3A62]`}
            aria-label={`${alt} — foto ${i + 1} di ${photos.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Foto precedente"
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 shadow-lg border border-slate-200 items-center justify-center text-[#1D3A62] hover:bg-[#1D3A62] hover:text-white hover:border-[#1D3A62] transition-colors print:hidden"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Foto successiva"
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 shadow-lg border border-slate-200 items-center justify-center text-[#1D3A62] hover:bg-[#1D3A62] hover:text-white hover:border-[#1D3A62] transition-colors print:hidden"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {mounted && lightboxIdx !== null
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              onClick={() => setLightboxIdx(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 print:hidden"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(null);
                }}
                aria-label="Chiudi"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>

              {lightboxIdx > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) => (i === null ? null : Math.max(i - 1, 0)));
                  }}
                  aria-label="Foto precedente"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {lightboxIdx < photos.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) => (i === null ? null : Math.min(i + 1, photos.length - 1)));
                  }}
                  aria-label="Foto successiva"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-[92vw] max-h-[88vh]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[lightboxIdx]}
                  alt={`${alt} — foto ${lightboxIdx + 1} di ${photos.length}`}
                  className="block max-w-[92vw] max-h-[88vh] rounded-2xl shadow-2xl object-contain"
                />
                <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/80 whitespace-nowrap">
                  {lightboxIdx + 1} / {photos.length}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
