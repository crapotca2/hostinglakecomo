import type { SupportedLocale } from "@/types/database";
import { DEFAULT_LOCALE } from "@/lib/welcome-book/i18n";

export type CheckinVideo = {
  /** Per-locale MP4 source (self-hosted in /public). */
  src: Partial<Record<SupportedLocale, string>>;
  /** Shared poster frame shown before playback. */
  poster: string;
};

/**
 * Self check-in walkthrough videos, keyed by property slug.
 * The clips are silent, mounted vertically (9:16) and never show the keybox
 * code — the code is delivered to the guest separately. When a locale has no
 * dedicated cut, `getCheckinVideo` falls back to the default locale.
 */
const CHECKIN_VIDEOS: Record<string, CheckinVideo> = {
  "aqua-vista-di-splendore": {
    src: {
      it: "/videos/welcome/aqua-vista-di-splendore/checkin-it.mp4",
      en: "/videos/welcome/aqua-vista-di-splendore/checkin-en.mp4",
    },
    poster: "/videos/welcome/aqua-vista-di-splendore/checkin-poster.jpg",
  },
};

/** Returns the check-in video for a property in the requested locale, or null. */
export function getCheckinVideo(
  slug: string,
  locale: SupportedLocale,
): { src: string; poster: string } | null {
  const entry = CHECKIN_VIDEOS[slug];
  if (!entry) return null;
  const src = entry.src[locale] ?? entry.src[DEFAULT_LOCALE];
  if (!src) return null;
  return { src, poster: entry.poster };
}
