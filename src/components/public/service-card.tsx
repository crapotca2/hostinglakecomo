import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: "primary" | "accent";
}

export function ServiceCard({
  icon: Icon,
  title,
  desc,
  badge,
  ctaLabel,
  ctaHref,
  variant = "primary",
}: ServiceCardProps) {
  const isAccent = variant === "accent";
  return (
    <div className="bg-white rounded-2xl p-7 border border-border/50 card-hover flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[url('/images/textures/services-bg.jpg')] bg-cover bg-center flex items-center justify-center shadow-sm">
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${
              isAccent ? "bg-[#1D3A62]/70" : "bg-[#1D3A62]/85"
            }`}
          />
          <Icon className="relative h-5 w-5 text-white" />
        </div>
        {badge && (
          <span
            className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
              isAccent
                ? "bg-accent/[0.12] text-accent"
                : "bg-primary/[0.08] text-primary"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2 transition-all"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
