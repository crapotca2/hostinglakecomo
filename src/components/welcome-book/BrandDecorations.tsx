import type { LucideIcon } from "lucide-react";

const NAVY = "#1D3A62";
const TEXTURE_URL = "/images/textures/como-trama.webp";

export function BrandHero({
  eyebrow,
  title,
  subtitle,
  heroImage,
  wifiBlock,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  heroImage?: string;
  wifiBlock?: React.ReactNode;
}) {
  const hasPhoto = Boolean(heroImage);
  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div
          className={
            hasPhoto
              ? "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              : "max-w-3xl mx-auto text-center"
          }
        >
          <div
            className={
              hasPhoto
                ? "lg:col-span-5 lg:pr-4 text-center lg:text-left flex flex-col items-center lg:items-stretch"
                : ""
            }
          >
            {eyebrow && (
              <p
                className="font-[family-name:var(--font-outfit)] text-xs sm:text-sm uppercase tracking-[0.22em] font-semibold mb-4"
                style={{ color: NAVY }}
              >
                {eyebrow}
              </p>
            )}
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p
                className={`mt-5 font-[family-name:var(--font-outfit)] text-base sm:text-lg text-slate-600 leading-relaxed ${
                  hasPhoto ? "max-w-prose" : "max-w-2xl mx-auto"
                }`}
              >
                {subtitle}
              </p>
            )}
            {wifiBlock}
          </div>

          {hasPhoto && (
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GradientDivider() {
  return (
    <div className="my-12 flex items-center justify-center print:hidden">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#1D3A62]" />
      <div className="mx-2 h-2 w-2 rounded-full bg-[#1D3A62]" />
      <div className="h-px w-24 bg-[#1D3A62]" />
      <div className="mx-2 h-2 w-2 rounded-full bg-[#1D3A62]" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#1D3A62]" />
    </div>
  );
}

export function SectionHeader({
  Icon,
  icon,
  eyebrow,
  title,
}: {
  Icon?: LucideIcon;
  icon?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div
      className="relative overflow-hidden mb-8 sm:mb-10 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-5 sm:px-8 py-6 sm:py-8 text-white text-center"
      style={{ backgroundColor: NAVY }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10] bg-cover bg-center pointer-events-none print:hidden"
        style={{ backgroundImage: `url('${TEXTURE_URL}')` }}
      />
      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
        {(Icon || icon) && (
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 ring-1 ring-white/25 mb-2.5"
          >
            {Icon ? (
              <Icon className="w-5 h-5 text-white" strokeWidth={2} />
            ) : (
              <span className="text-base sm:text-lg">{icon}</span>
            )}
          </span>
        )}
        {eyebrow && (
          <p className="font-[family-name:var(--font-outfit)] text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-semibold text-white/70 mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl md:text-3xl font-bold text-white leading-[1.15] tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}
