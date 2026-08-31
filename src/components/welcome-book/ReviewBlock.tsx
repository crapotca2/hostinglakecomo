import { Star } from "lucide-react";
import type { SupportedLocale } from "@/types/database";

const LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  title: {
    it: "Lasciaci una recensione",
    en: "Leave us a review",
    ru: "Оставьте отзыв",
    de: "Hinterlassen Sie eine Bewertung",
    pl: "Zostaw nam opinię",
    es: "Déjanos una reseña",
    fr: "Laissez-nous un avis",
  },
};

export function ReviewBlock({
  feedback,
  locale,
}: {
  feedback: string;
  locale: SupportedLocale;
}) {
  if (!feedback) return null;
  const title = LABELS.title[locale] ?? LABELS.title.it ?? "Lasciaci una recensione";
  return (
    <section
      aria-label={title}
      className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 print:hidden"
    >
      <div className="rounded-2xl bg-gradient-to-br from-[#E8EDF5] to-[#F2F5FA] border border-[#1D3A62]/15 p-5 sm:p-6 flex items-start gap-4">
        <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm flex-shrink-0">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#1D3A62]" strokeWidth={2.2} fill="currentColor" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5">{title}</h2>
          <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
            {feedback}
          </p>
        </div>
      </div>
    </section>
  );
}
