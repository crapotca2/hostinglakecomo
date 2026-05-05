"use client";

import { useState, useCallback } from "react";
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
import { PicWebp } from "@/components/ui/pic-webp";

const toWebp = (url: string) => url.replace(/\.jpe?g$/i, ".webp");

type Props = {
  images: PortfolioImage[];
  propertyName: string;
  hasLakeView?: boolean;
};

export function PropertyGallery({ images, propertyName, hasLakeView }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const mainImage = images[activeIndex]?.url ?? images[0]?.url;
  const currentRoom = images[activeIndex]?.room;

  const slides = images.map((img) => ({
    src: toWebp(img.url),
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
              <PicWebp
                src={mainImage}
                alt={images[activeIndex]?.alt || propertyName}
                className="w-full h-80 sm:h-[32rem] object-cover"
                loading="eager"
                fetchPriority="high"
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
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-border/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-90"
                aria-label="Foto precedente"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-border/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-90"
                aria-label="Foto successiva"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
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
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 w-max mx-auto">
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
                    <PicWebp
                      src={img.url}
                      alt={img.alt || `${propertyName} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
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
