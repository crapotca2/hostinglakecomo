"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Phone, Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";

const INTEREST_KEYS = [
  { value: "consulenza", labelKey: "consulenza" },
  { value: "home-staging", labelKey: "homeStaging" },
  { value: "gestione", labelKey: "gestione" },
  { value: "valutazione", labelKey: "valutazione" },
  { value: "prenotazione", labelKey: "prenotazione" },
  { value: "partnership", labelKey: "partnership" },
  { value: "altro", labelKey: "altro" },
] as const;

function ContactForm() {
  const tForm = useTranslations("contact.form");
  const tInt = useTranslations("contact.interestOptions");
  const searchParams = useSearchParams();
  const requestedInterest = searchParams.get("interest") ?? "";
  const initialInterest = INTEREST_KEYS.some(
    (o) => o.value === requestedInterest,
  )
    ? requestedInterest
    : "gestione";
  const [interest, setInterest] = useState(initialInterest);
  const [sent, setSent] = useState(false);
  const [onPlatform, setOnPlatform] = useState(false);
  const mountedAt = useRef<number>(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // anti-bot: hidden honeypot must stay empty
    if (honeypotRef.current?.value) {
      setSent(true);
      return;
    }
    // anti-bot: form filled too quickly is almost certainly a bot
    if (Date.now() - mountedAt.current < 2000) {
      setSent(true);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-10 text-center border border-emerald-200">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Send className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-800 mb-2">
          {tForm("successTitle")}
        </h3>
        <p className="text-sm text-emerald-600">{tForm("successBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-8 border border-border/50 shadow-[0_25px_60px_-12px_rgba(29,58,98,0.45)] space-y-5"
    >
      <h2 className="text-xl font-semibold mb-2">{tForm("title")}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {tForm("nome")}
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {tForm("cognome")}
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {tForm("emailLabel")}
          </label>
          <input
            type="email"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {tForm("telefono")}
          </label>
          <input
            type="tel"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {tForm("interesse")}
          </label>
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            {INTEREST_KEYS.map((o) => (
              <option key={o.value} value={o.value}>
                {tInt(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {tForm("indirizzo")}
          </label>
          <input
            type="text"
            placeholder={tForm("indirizzoPlaceholder")}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
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
            {tForm("piattaformaCheckbox")}
            <span className="block text-xs text-muted-foreground mt-0.5">
              {tForm("piattaformaHint")}
            </span>
          </span>
        </label>
        {onPlatform && (
          <div className="mt-3 pl-7">
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
              {tForm("linkAnnuncio")}
            </label>
            <input
              type="url"
              placeholder={tForm("linkAnnuncioPlaceholder")}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>
        )}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          {tForm("messaggio")}
        </label>
        <textarea
          rows={3}
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Send className="h-4 w-4" />
        {tForm("invia")}
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
  const t = useTranslations("contact");
  return (
    <div className="pt-20">
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[4fr_8fr] gap-12 lg:gap-16 items-center">
            {/* INFO LEFT */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("eyebrow")}
              </span>
              <h1 className="text-3xl sm:text-4xl font-light text-foreground mt-3 mb-4">
                {t("title1")}{" "}
                <span className="font-semibold">{t("title1Strong")}</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t("body")}
              </p>
              <div className="space-y-5">
                <a
                  href="tel:+393517180435"
                  className="flex items-center gap-4 group"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("telefono")}
                    </div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      +39 351 718 0435
                    </div>
                  </div>
                </a>
                <a
                  href="mailto:angelo.talarico@gmail.com"
                  className="flex items-center gap-4 group"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("email")}
                    </div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      angelo.talarico@gmail.com
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
