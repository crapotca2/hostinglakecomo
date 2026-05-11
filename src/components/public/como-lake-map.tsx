"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/i18n/routing";

type Comune = {
  slug: string;
  name: string;
  geo: { lat: number; lng: number };
  tagline?: string;
};

type Props = {
  comuni: Comune[];
  locale: Locale;
};

const LeafletMap = dynamic(
  () => import("./como-lake-map-client").then((m) => m.ComoLakeMapClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full bg-muted/30 rounded-2xl flex items-center justify-center text-sm text-muted-foreground"
        style={{ aspectRatio: "4 / 3" }}
      >
        <span className="sr-only">Loading map…</span>
        <span aria-hidden>…</span>
      </div>
    ),
  },
);

export function ComoLakeMap(props: Props) {
  return <LeafletMap {...props} />;
}
