"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MousePointerClick, X } from "lucide-react";

const NAVY = "#1D3A62";

const idleSubs = new Set<(visible: boolean) => void>();
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let listenersAttached = false;
let lastDelayMs = 3000;

function notifyAll(visible: boolean) {
  idleSubs.forEach((cb) => cb(visible));
}

function scheduleIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => notifyAll(true), lastDelayMs);
}

function onUserActivity() {
  notifyAll(false);
  scheduleIdle();
}

function ensureGlobalListeners() {
  if (listenersAttached || typeof window === "undefined") return;
  window.addEventListener("mousemove", onUserActivity, { passive: true });
  window.addEventListener("scroll", onUserActivity, { passive: true });
  window.addEventListener("keydown", onUserActivity);
  window.addEventListener("touchstart", onUserActivity, { passive: true });
  listenersAttached = true;
}

function teardownGlobalListenersIfEmpty() {
  if (idleSubs.size > 0 || !listenersAttached) return;
  window.removeEventListener("mousemove", onUserActivity);
  window.removeEventListener("scroll", onUserActivity);
  window.removeEventListener("keydown", onUserActivity);
  window.removeEventListener("touchstart", onUserActivity);
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  listenersAttached = false;
}

export function ScannableQr({
  url,
  size = 140,
  className = "w-20 h-20 sm:w-24 sm:h-24",
  ariaLabel = "Scan QR code",
  showHint = true,
  hintDelayMs = 3000,
}: {
  url: string;
  size?: number;
  className?: string;
  ariaLabel?: string;
  showHint?: boolean;
  hintDelayMs?: number;
}) {
  const [open, setOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const qrSrc = `/api/qr?data=${encodeURIComponent(url)}&size=${size * 2}&format=svg`;
  const qrSrcBig = `/api/qr?data=${encodeURIComponent(url)}&size=720&format=svg`;

  useEffect(() => {
    if (!showHint || interacted) return;

    lastDelayMs = Math.min(lastDelayMs, hintDelayMs);
    const cb = (visible: boolean) => setHintVisible(visible);
    idleSubs.add(cb);
    ensureGlobalListeners();
    scheduleIdle();

    return () => {
      idleSubs.delete(cb);
      teardownGlobalListenersIfEmpty();
    };
  }, [showHint, interacted, hintDelayMs]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setInteracted(true);
    setHintVisible(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={ariaLabel}
        className="relative group rounded-lg bg-white border border-slate-200 p-1.5 shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3A62] focus-visible:ring-offset-2 print:cursor-default print:hover:scale-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt=""
          aria-hidden
          className={`${className} block`}
        />

        {hintVisible && !interacted && (
          <span
            aria-hidden
            className="qr-hint pointer-events-none absolute -top-3 -right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full text-white shadow-lg print:hidden"
            style={{ backgroundColor: NAVY }}
          >
            <MousePointerClick className="w-5 h-5" strokeWidth={2.4} />
          </span>
        )}
      </button>

      {mounted && open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in print:hidden"
            >
              <button
                ref={closeBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                aria-label="Chiudi"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <X className="w-5 h-5" />
              </button>

              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrcBig}
                  alt={ariaLabel}
                  className="w-[min(72vw,420px)] h-[min(72vw,420px)] block"
                />
                <p className="text-xs sm:text-sm text-slate-600 text-center max-w-xs font-[family-name:var(--font-outfit)]">
                  {ariaLabel}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}

      <style jsx>{`
        @keyframes qrHintPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.7;
          }
        }
        .qr-hint {
          animation: qrHintPulse 1s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        :global(.animate-fade-in) {
          animation: fadeIn 180ms ease-out;
        }
      `}</style>
    </>
  );
}
