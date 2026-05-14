"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HOLIDOIT_EMBED_ID = "a0322330-c209-4489-a1a2-264cc0027c6c";
const HOLIDOIT_EXPERIENCE_IDS = "3872,3880,3883,3876";
const HOLIDOIT_RESELLER_UUID = "f4640116-9b9d-4fbb-9643-a76bf1cc71d5";
const PARTNER_HOMEPAGE_IT = "https://lakecomocharter.com/it/";
const PARTNER_HOMEPAGE_EN = "https://lakecomocharter.com/en/";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: "it" | "en" | "ru";
};

const COPY = {
  it: {
    title: "Prenota la tua esperienza sul Lago",
    subtitle:
      "In collaborazione con Lake Como Charter — partner ufficiale per le esperienze nautiche sul Lago di Como.",
    externalCta: "Scopri Lake Como Charter",
    loading: "Caricamento esperienze…",
  },
  en: {
    title: "Book your experience on the Lake",
    subtitle:
      "In partnership with Lake Como Charter — official partner for water experiences on Lake Como.",
    externalCta: "Discover Lake Como Charter",
    loading: "Loading experiences…",
  },
  ru: {
    title: "Забронируйте впечатление на озере",
    subtitle:
      "В сотрудничестве с Lake Como Charter — официальным партнёром по водным впечатлениям на озере Комо.",
    externalCta: "Узнать о Lake Como Charter",
    loading: "Загрузка впечатлений…",
  },
} as const;

export function CharterExperienceDialog({ open, onOpenChange, locale }: Props) {
  const c = COPY[locale];
  const partnerUrl = locale === "en" ? PARTNER_HOMEPAGE_EN : PARTNER_HOMEPAGE_IT;
  // Holidoit widget supports it/en only — fall back to EN for RU users.
  const widgetLang = locale === "ru" ? "en" : locale;
  const iframeSrc = `https://cdn.holidoit.com/widgets/widget-experience-grid.html?embedId=${HOLIDOIT_EMBED_ID}&experienceId=${encodeURIComponent(
    HOLIDOIT_EXPERIENCE_IDS,
  )}&lang=${widgetLang}&resellerUuid=${HOLIDOIT_RESELLER_UUID}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl pr-8">{c.title}</DialogTitle>
          <DialogDescription className="text-xs">
            {c.subtitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-[60vh] sm:min-h-[600px] bg-muted/10">
          <iframe
            title={c.title}
            src={iframeSrc}
            className="w-full h-full min-h-[60vh] sm:min-h-[600px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="px-6 py-3 border-t border-border/40 text-center">
          <a
            href={partnerUrl}
            target="_blank"
            rel="noopener noreferrer external"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {c.externalCta}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
