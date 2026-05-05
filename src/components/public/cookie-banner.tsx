"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "hlc-cookie-consent";
const CONSENT_VERSION = 1;

type ConsentRecord = {
  v: number;
  date: string;
  accepted: ("necessary" | "analytics" | "marketing")[];
  rejected: ("necessary" | "analytics" | "marketing")[];
};

function readStoredConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed?.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(record: ConsentRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readStoredConsent();
    if (!existing) setVisible(true);
  }, []);

  if (!visible) return null;

  const persist = (
    accepted: ConsentRecord["accepted"],
    rejected: ConsentRecord["rejected"]
  ) => {
    writeConsent({
      v: CONSENT_VERSION,
      date: new Date().toISOString(),
      accepted,
      rejected,
    });
    setVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () =>
    persist(["necessary", "analytics", "marketing"], []);

  const rejectAll = () =>
    persist(["necessary"], ["analytics", "marketing"]);

  const saveCustom = () => {
    const accepted: ConsentRecord["accepted"] = ["necessary"];
    const rejected: ConsentRecord["rejected"] = [];
    if (analytics) accepted.push("analytics");
    else rejected.push("analytics");
    if (marketing) accepted.push("marketing");
    else rejected.push("marketing");
    persist(accepted, rejected);
  };

  return (
    <>
      {/* Banner */}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-banner-title"
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:bottom-4 sm:right-4 sm:left-auto sm:px-0 sm:pb-0 sm:max-w-md"
      >
        <div className="relative overflow-hidden bg-[#1D3A62] text-white rounded-2xl shadow-2xl border border-white/10 p-5 sm:p-6">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
          />
          <div className="relative flex items-start gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Cookie className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2
                id="cookie-banner-title"
                className="text-base font-semibold leading-tight"
              >
                Rispettiamo la tua privacy
              </h2>
              <p className="text-sm text-white/75 leading-relaxed mt-1.5">
                Usiamo solo cookie tecnici necessari al funzionamento del sito.
                Al momento non utilizziamo cookie analitici o di marketing. Per
                approfondire leggi la{" "}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 hover:text-white"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="relative flex flex-col gap-2 mt-4">
            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2.5 rounded-lg bg-white text-[#1D3A62] text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Accetta tutti
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={rejectAll}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors border border-white/15"
              >
                Rifiuta tutti
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors border border-white/15"
              >
                Personalizza
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2
                id="cookie-settings-title"
                className="text-base font-semibold"
              >
                Personalizza i cookie
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Chiudi"
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="rounded-xl border border-border/50 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">Cookie tecnici</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sempre attivi
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label="Cookie tecnici (sempre attivi)"
                    className="mt-1 h-4 w-4 accent-[#1D3A62] cursor-not-allowed opacity-70"
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Necessari al funzionamento del sito: sessione di
                  autenticazione dell&apos;area clienti, preferenze di tema e
                  routing tecnico. Non profilano l&apos;utente.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">Cookie analitici</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Non utilizzati al momento
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    aria-label="Cookie analitici"
                    className="mt-1 h-4 w-4 accent-[#1D3A62] cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Permettono di raccogliere statistiche aggregate
                  sull&apos;utilizzo del sito (pagine visitate, durata sessione).
                  Predisposizione attiva per future integrazioni; al momento
                  nessuno strumento analitico e in uso.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">Cookie di marketing</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Non utilizzati al momento
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    aria-label="Cookie di marketing"
                    className="mt-1 h-4 w-4 accent-[#1D3A62] cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Servono per profilare l&apos;utente e mostrargli annunci
                  personalizzati su altre piattaforme. Predisposizione attiva
                  per eventuali campagne future; al momento nessuno strumento
                  di marketing e in uso.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-border/50 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={rejectAll}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border/50 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Rifiuta tutti
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1D3A62] text-white text-sm font-semibold hover:bg-[#1D3A62]/90 transition-colors"
              >
                Salva preferenze
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
