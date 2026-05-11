"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/components/seo/jsonld-faq";

type Props = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="space-y-3">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        return (
          <li
            key={it.q}
            className="bg-white border border-border/50 rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                {it.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1">
                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed whitespace-pre-line">
                  {it.a}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
