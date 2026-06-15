"use client";

import { useState } from "react";
import { Footprints, Car, Zap, Info, X, Globe } from "lucide-react";
import { ScannableQr } from "./ScannableQr";

export type ParkingPoiData = {
  categoryLabel: string;
  name: string;
  address?: string;
  qrUrl: string;
  scanShortLabel: string;
  scanAriaLabel: string;
  minLabel: string;
  walkMinutes?: number | null;
  distanceKm?: number | null;
  paidStatus?: "free" | "paid";
  freeLabel?: string;
  paidLabel?: string;
  powerKw?: number | null;
  notes?: string;
  appUrl?: string;
  infoLabel: string;
  appWebsiteLabel?: string;
};

export function ParkingPoiCard({ poi }: { poi: ParkingPoiData }) {
  const [open, setOpen] = useState(false);
  const hasExtra = !!poi.notes || !!poi.appUrl;

  return (
    <article className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#1D3A62]/30 transition-all overflow-hidden p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ScannableQr
            url={poi.qrUrl}
            ariaLabel={poi.scanAriaLabel}
            className="w-20 h-20 sm:w-24 sm:h-24"
          />
          <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#1D3A62]/70 text-center leading-tight">
            {poi.scanShortLabel}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-700 leading-none mb-1">
            {poi.categoryLabel}
          </p>
          <h3 className="leading-tight">
            <a
              href={poi.qrUrl}
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
                {poi.walkMinutes} {poi.minLabel}
              </span>
            )}
            {poi.walkMinutes == null && poi.distanceKm != null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF5] text-[#1D3A62]">
                <Car className="w-3 h-3" />
                {poi.distanceKm} km
              </span>
            )}
            {poi.paidStatus === "free" && poi.freeLabel && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">
                {poi.freeLabel}
              </span>
            )}
            {poi.paidStatus === "paid" && poi.paidLabel && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                {poi.paidLabel}
              </span>
            )}
            {poi.powerKw != null && poi.powerKw > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                <Zap className="w-3 h-3" />
                {poi.powerKw} kW
              </span>
            )}
            {hasExtra && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={poi.infoLabel}
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
        </div>
      </div>

      {open && hasExtra && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          {poi.notes && (
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {poi.notes}
            </p>
          )}
          {poi.appUrl && poi.appWebsiteLabel && (
            <a
              href={poi.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-xl bg-[#1D3A62] text-white hover:bg-[#2E5A8C] transition-colors"
            >
              <Globe className="w-4 h-4" />
              {poi.appWebsiteLabel}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
