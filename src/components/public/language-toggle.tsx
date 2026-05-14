"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname, type Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  variant?: "light" | "dark";
}

export function LanguageToggle({ variant = "light" }: LanguageToggleProps) {
  const t = useTranslations("languageToggle");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      router.replace(href, { locale: next });
    });
  };

  const baseBtn =
    "px-2 py-1 rounded-md text-xs font-semibold tabular-nums transition-colors";
  const active =
    variant === "dark"
      ? "bg-white text-[#1D3A62]"
      : "bg-primary text-white";
  const inactive =
    variant === "dark"
      ? "text-white/70 hover:text-white"
      : "text-muted-foreground hover:text-foreground";

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg p-0.5 border",
        variant === "dark"
          ? "border-white/20 bg-white/5"
          : "border-border bg-white",
        isPending && "opacity-60",
      )}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={cn(baseBtn, locale === l ? active : inactive)}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
