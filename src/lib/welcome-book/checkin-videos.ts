import type { SupportedLocale } from "@/types/database";

export type CheckinVideo = {
  /** Bilingual (IT + EN) clip source, self-hosted in /public. */
  src: string;
  /** Poster frame shown before playback. */
  poster: string;
};

/**
 * Self check-in walkthrough videos, keyed by property slug.
 * One silent, vertical (9:16) clip per property with bilingual captions
 * (Italian + English on every step), so a single file serves all locales.
 * The interior walk is sped up, and the keybox code is never shown — the
 * combination is delivered to the guest separately.
 */
const CHECKIN_VIDEOS: Record<string, CheckinVideo> = {
  "aqua-vista-di-splendore": {
    src: "/videos/welcome/aqua-vista-di-splendore/checkin.mp4",
    poster: "/videos/welcome/aqua-vista-di-splendore/checkin-poster.jpg",
  },
};

/** Returns the check-in video for a property, or null when none exists. */
export function getCheckinVideo(
  slug: string,
  // Kept for call-site symmetry with the rest of the welcome book; the clip
  // itself is bilingual, so the locale does not change the source.
  _locale: SupportedLocale,
): CheckinVideo | null {
  return CHECKIN_VIDEOS[slug] ?? null;
}
