"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Phone, Mail, Send } from "lucide-react";

const INTEREST_OPTIONS: { value: string; label: string }[] = [
  { value: "consulenza", label: "Consulenza Personalizzata" },
  { value: "home-staging", label: "Home Staging" },
  { value: "gestione", label: "Gestione del mio immobile" },
  { value: "valutazione", label: "Valutazione redditivita" },
  { value: "prenotazione", label: "Prenotare un soggiorno" },
  { value: "partnership", label: "Partnership" },
  { value: "altro", label: "Altro" },
];

function ContactForm() {
  const searchParams = useSearchParams();
  const requestedInterest = searchParams.get("interest") ?? "";
  const from = searchParams.get("from") ?? "";
  const initialInterest = INTEREST_OPTIONS.some((o) => o.value === requestedInterest)
    ? requestedInterest
    : "gestione";
  const [interest, setInterest] = useState(initialInterest);
  const [sent, setSent] = useState(false);
  const [onPlatform, setOnPlatform] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-10 text-center border border-emerald-200">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Send className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-800 mb-2">
          Messaggio Inviato!
        </h3>
        <p className="text-sm text-emerald-600">
          Ti risponderemo entro 24 ore. Grazie per averci contattato.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-8 border border-border/50 border-t-[3px] border-t-[#1D3A62] shadow-[0_25px_60px_-12px_rgba(29,58,98,0.45)] space-y-5"
    >
      <h2 className="text-xl font-semibold mb-2">Invia un Messaggio</h2>
      {from && (
        <div className="text-xs text-muted-foreground bg-primary/[0.04] border border-primary/10 rounded-lg px-3 py-2">
          Richiesta proveniente da: <span className="font-semibold">{from}</span>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Nome</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Cognome</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <input
            type="email"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Telefono</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Interesse</label>
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          {INTEREST_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Indirizzo dell&apos;immobile
        </label>
        <input
          type="text"
          placeholder="Via, città, provincia"
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="rounded-lg border border-border px-4 py-3 bg-muted/30">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={onPlatform}
            onChange={(e) => setOnPlatform(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          <span className="text-sm">
            L&apos;immobile è già su una piattaforma di affitto
            <span className="block text-xs text-muted-foreground mt-0.5">
              Es. Airbnb, Booking, Expedia
            </span>
          </span>
        </label>
        {onPlatform && (
          <div className="mt-3 pl-7">
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
              Link dell&apos;annuncio
            </label>
            <input
              type="url"
              placeholder="https://www.airbnb.com/rooms/..."
              className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>
        )}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Messaggio</label>
        <textarea
          rows={4}
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Send className="h-4 w-4" />
        Invia Messaggio
      </button>
    </form>
  );
}

function ContactFormFallback() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-border/50 shadow-sm h-96 animate-pulse" />
  );
}

export default function ContactPage() {
  return (
    <div className="pt-20">
      <section className="py-16 bg-[#1D3A62] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-light text-white">
            <span className="font-semibold">Contattaci</span>
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
            {/* INFO LEFT */}
            <div className="lg:pt-2">
              <h2 className="text-2xl sm:text-3xl font-light text-foreground mb-4">
                Parliamo del tuo{" "}
                <span className="font-semibold">immobile</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Richiedi un preventivo o contattaci per qualsiasi informazione.
                Ti rispondiamo entro 48 ore con una valutazione preliminare e i
                prossimi passi per affidarci la tua proprieta sul Lago di Como.
              </p>
              <div className="space-y-5">
                <a
                  href="tel:+39031547xxxx"
                  className="flex items-center gap-4 group"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Telefono
                    </div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      +39 XXX XXX XXXX
                    </div>
                  </div>
                </a>
                <a
                  href="mailto:info@airbibby.com"
                  className="flex items-center gap-4 group"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      info@airbibby.com
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* FORM RIGHT */}
            <div>
              <Suspense fallback={<ContactFormFallback />}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
