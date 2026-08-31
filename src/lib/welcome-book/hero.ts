// Per-property welcome-book hero image. Aqua Vista keeps its original
// destination shot; every other property uses /images/welcome/<slug>/hero.webp.
const HERO_OVERRIDE: Record<string, string> = {
  "aqua-vista-di-splendore":
    "/images/welcome/aqua-vista-di-splendore/destinations/aqua-vista-spritz.webp",
};

export function welcomeHero(slug: string): string {
  return HERO_OVERRIDE[slug] ?? `/images/welcome/${slug}/hero.webp`;
}
