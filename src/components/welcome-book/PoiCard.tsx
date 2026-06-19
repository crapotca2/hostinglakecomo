"use client";

import { useState } from "react";
import { Footprints, Car, Phone, Info, X, Navigation } from "lucide-react";
import { ScannableQr } from "./ScannableQr";

export type PoiCardData = {
  name: string;
  address?: string;
  phone?: string;
  walkMinutes?: number | null;
  distanceMeters?: number | null;
  directionsHref: string;
  categoryLabel: string;
  notes?: string;
};

export function PoiCard({
  poi,
  scanShortLabel,
  scanAriaLabel,
  minLabel,
  infoLabel,
  callLabel,
  openInMapsLabel,
}: {
  poi: PoiCardData;
  scanShortLabel: string;
  scanAriaLabel: string;
  minLabel: string;
  infoLabel: string;
  callLabel: string;
  openInMapsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const hasExtra = !!poi.phone || !!poi.notes;

  return (
    <article className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#1D3A62]/30 transition-all overflow-hidden p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="hidden md:flex flex-col items-center gap-1 flex-shrink-0">
          <ScannableQr
            url={poi.directionsHref}
            ariaLabel={scanAriaLabel}
            className="w-20 h-20 sm:w-24 sm:h-24"
          />
          <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#1D3A62]/70 text-center leading-tight">
            {scanShortLabel}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-700 leading-none mb-1">
            {poi.categoryLabel}
          </p>
          <h3 className="leading-tight">
            <a
              href={poi.directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-base text-slate-900 hover:text-[#1D3A62] hover:underline underline-offset-2 decoration-2"
            >
              {poi.name}
            </a>
          </h3>
          {poi.address && (
            <p className="text-xs text-slate-700 mt-0.5 leading-snug">{poi.address}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {poi.walkMinutes != null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF5] text-[#1D3A62]">
                <Footprints className="w-3 h-3" />
                {poi.walkMinutes} {minLabel}
              </span>
            )}
            {poi.walkMinutes == null && poi.distanceMeters != null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF5] text-[#1D3A62]">
                <Car className="w-3 h-3" />
                {(poi.distanceMeters / 1000).toFixed(1)} km
              </span>
            )}
            {hasExtra && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={infoLabel}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
                  open
                    ? "bg-[#1D3A62] text-white border-[#1D3A62]"
                    : "bg-white text-[#1D3A62] border-[#1D3A62]/30 hover:bg-[#E8EDF5]"
                }`}
              >
                {open ? <X className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Info className="w-3.5 h-3.5" strokeWidth={2.5} />}
              </button>
            )}
          </div>

          <a
            href={poi.directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden mt-3 inline-flex items-center justify-center gap-1.5 w-full px-3.5 py-2 rounded-xl bg-[#1D3A62] text-white hover:bg-[#2E5A8C] transition-colors text-sm font-semibold"
          >
            <Navigation className="w-4 h-4" />
            {openInMapsLabel}
          </a>
        </div>
      </div>

      {open && hasExtra && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          {poi.phone && (
            <a
              href={`tel:${poi.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-xl bg-[#1D3A62] text-white hover:bg-[#2E5A8C] transition-colors"
            >
              <Phone className="w-4 h-4" />
              {callLabel} <span className="font-mono">{poi.phone}</span>
            </a>
          )}
          {poi.notes && (
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {poi.notes}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
