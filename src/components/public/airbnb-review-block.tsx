"use client";

import {
  SprayCan,
  CheckCircle2,
  MessageSquare,
  Map as MapIcon,
  Tag,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

const CATEGORIES: {
  key: keyof CategoryRatings;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "cleanliness", label: "Pulizia", icon: SprayCan },
  { key: "accuracy", label: "Precisione", icon: CheckCircle2 },
  { key: "communication", label: "Comunicazione", icon: MessageSquare },
  { key: "location", label: "Posizione", icon: MapIcon },
  { key: "value", label: "Qualita/prezzo", icon: Tag },
];

export type CategoryRatings = {
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
};

function LaurelBranch({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 80"
      width="32"
      height="80"
      className={`text-foreground ${flip ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <path
          d="M22 6 Q 12 40, 4 76"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="20" cy="14" rx="5.5" ry="2.4" transform="rotate(-30 20 14)" />
        <ellipse cx="18" cy="26" rx="6.2" ry="2.6" transform="rotate(-32 18 26)" />
        <ellipse cx="14" cy="38" rx="6.6" ry="2.8" transform="rotate(-34 14 38)" />
        <ellipse cx="11" cy="50" rx="6.4" ry="2.7" transform="rotate(-36 11 50)" />
        <ellipse cx="8" cy="62" rx="5.8" ry="2.5" transform="rotate(-38 8 62)" />
        <ellipse cx="5" cy="73" rx="4.5" ry="2.0" transform="rotate(-40 5 73)" />
      </g>
    </svg>
  );
}

function formatScore(value: number | undefined): string {
  if (value == null) return "—";
  return value.toFixed(1).replace(".", ",");
}

export function AirbnbReviewBlock({
  overall,
  reviewCount,
  categories,
  lovedByGuests,
  airbnbUrl,
}: {
  overall: number;
  reviewCount: number;
  categories: CategoryRatings;
  lovedByGuests?: boolean;
  airbnbUrl: string;
}) {
  const hasAnyCategory = CATEGORIES.some((c) => categories[c.key] != null);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 border border-border/50">
      <div className="flex items-center justify-center gap-2 sm:gap-6 mb-2">
        <LaurelBranch />
        <div className="text-5xl sm:text-6xl font-semibold tabular-nums tracking-tight">
          {formatScore(overall)}
        </div>
        <LaurelBranch flip />
      </div>

      {lovedByGuests && (
        <div className="text-center mb-2">
          <h3 className="text-xl sm:text-2xl font-semibold">Amato dagli ospiti</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
            Questa proprieta e una delle piu amate dagli ospiti in base a
            valutazioni, recensioni e affidabilita.
          </p>
        </div>
      )}

      {hasAnyCategory && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-6 mt-8 pt-8 border-t border-border/40">
          {CATEGORIES.map((cat) => {
            const v = categories[cat.key];
            if (v == null) return null;
            return (
              <div
                key={cat.key}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {cat.label}
                </div>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatScore(v)}
                </div>
                <cat.icon className="h-6 w-6 text-foreground/80" strokeWidth={1.5} />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border/40 text-center">
        <a
          href={airbnbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-muted/40 transition-colors"
        >
          Leggi le {reviewCount} recensioni reali su Airbnb
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="text-[11px] text-muted-foreground mt-3">
          Valutazioni e recensioni pubbliche raccolte dalla scheda originale
          Airbnb di questa proprieta.
        </p>
      </div>
    </div>
  );
}
