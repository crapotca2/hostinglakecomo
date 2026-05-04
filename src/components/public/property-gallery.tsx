"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import {
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import type { PortfolioImage } from "@/lib/portfolio";

type Props = {
  images: PortfolioImage[];
  propertyName: string;
  hasLakeView?: boolean;
};

export function PropertyGallery({ images, propertyName, hasLakeView }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    emblaApi.on("scroll", update);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const mainImage = images[activeIndex]?.url ?? images[0]?.url;
  const currentRoom = images[activeIndex]?.room;

  const slides = images.map((img) => ({
    src: img.url,
    alt: img.alt || propertyName,
    title: img.room || propertyName,
  }));

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-border/50 mb-6">
        <div className="relative group">
          {mainImage ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full text-left cursor-zoom-in"
              aria-label="Apri la gallery a tutto schermo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage}
                alt={images[activeIndex]?.alt || propertyName}
                className="w-full h-80 sm:h-[32rem] object-cover"
              />
              <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-foreground text-xs font-semibold backdrop-blur-sm shadow-md transition-opacity">
                <Maximize2 className="h-3.5 w-3.5" />
                {images.length} foto · clicca per ingrandire
              </span>
            </button>
          ) : (
            <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
              <HomeIcon className="h-16 w-16 text-primary/40" />
            </div>
          )}
          {hasLakeView && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              Vista Lago
            </span>
          )}
          {currentRoom && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              {currentRoom}
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="relative p-4">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveIndex(i)}
                    className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeIndex
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || `${propertyName} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            {canScrollPrev && (
              <button
                onClick={scrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md hover:bg-muted/40 border border-border/50 flex items-center justify-center transition-colors"
                aria-label="Foto precedenti"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollNext && (
              <button
                onClick={scrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md hover:bg-muted/40 border border-border/50 flex items-center justify-center transition-colors"
                aria-label="Foto successive"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={activeIndex}
        on={{
          view: ({ index }) => setActiveIndex(index),
        }}
        plugins={[Zoom, Fullscreen, Counter]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      />
    </>
  );
}
