"use client";

import { useState, isValidElement, cloneElement } from "react";
import type { ReactElement, SVGProps } from "react";
import { Modal } from "./Modal";

const NAVY = "#1D3A62";

export function TileCard({
  photo,
  icon,
  title,
  subtitle,
  ariaLabel,
  children,
  highlight = false,
  captionBelow = false,
}: {
  photo?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  highlight?: boolean;
  captionBelow?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = ariaLabel ?? title;

  const styledIcon =
    isValidElement(icon)
      ? cloneElement(icon as ReactElement<SVGProps<SVGSVGElement> & { strokeWidth?: number }>, {
          className: `w-6 h-6 sm:w-7 sm:h-7 ${highlight ? "text-white" : "text-[#1D3A62]"}`,
          strokeWidth: 2.2,
        })
      : icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="group relative block w-full rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/70 transition-all duration-200 hover:ring-[#1D3A62]/40 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3A62]/40 focus-visible:ring-offset-2 text-left"
      >
        {photo ? (
          captionBelow ? (
            <>
              <div className="relative aspect-[5/4] bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-bold text-sm sm:text-base leading-tight text-slate-900 line-clamp-2">
                  {title}
                </h3>
                {subtitle && (
                  <p
                    className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-semibold mt-1 line-clamp-1"
                    style={{ color: `${NAVY}AA` }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="relative aspect-[4/3] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-2">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-semibold text-white/85 mt-1 line-clamp-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )
        ) : (
          <div
            className={`relative aspect-[4/3] flex flex-col items-center justify-center text-center p-4 sm:p-5 ${
              highlight
                ? "bg-gradient-to-br from-[#1D3A62] to-[#2E5A8C] text-white"
                : "bg-white"
            }`}
          >
            {styledIcon && (
              <span
                className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-3 ${
                  highlight ? "bg-white/15 ring-1 ring-white/30" : "bg-[#E8EDF5]"
                }`}
              >
                {styledIcon}
              </span>
            )}
            <h3
              className={`font-bold text-sm sm:text-base leading-tight ${
                highlight ? "text-white" : "text-slate-900"
              }`}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={`text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-semibold mt-1.5 ${
                  highlight ? "text-white/80" : "text-[#1D3A62]/70"
                }`}
                style={!highlight ? { color: `${NAVY}AA` } : undefined}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} ariaLabel={label}>
        {children}
      </Modal>
    </>
  );
}
