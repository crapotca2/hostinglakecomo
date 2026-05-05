"use client";

import { ExternalLink } from "lucide-react";

const CATEGORIES: {
  key: keyof CategoryRatings;
  label: string;
}[] = [
  { key: "cleanliness", label: "Pulizia" },
  { key: "accuracy", label: "Precisione" },
  { key: "communication", label: "Comunicazione" },
  { key: "location", label: "Posizione" },
  { key: "value", label: "Qualita/prezzo" },
];

export type CategoryRatings = {
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
};

function LaurelBranch({ side }: { side: "left" | "right" }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/images/voto/${side}.png`}
      alt=""
      aria-hidden="true"
      className="h-20 sm:h-24 w-auto select-none translate-y-2 sm:translate-y-3"
      draggable={false}
    />
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
      <div className="flex items-end justify-center gap-1 sm:gap-2 mb-2">
        <LaurelBranch side="left" />
        <div className="text-6xl sm:text-7xl font-semibold tabular-nums tracking-tight leading-none">
          {formatScore(overall)}
        </div>
        <LaurelBranch side="right" />
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
