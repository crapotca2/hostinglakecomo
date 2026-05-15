"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { useRouter, usePathname, type Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  variant?: "light" | "dark";
}

// Shared switch logic used by both the desktop button group and the mobile
// dropdown. Centralising it avoids divergence and the rapid-click guard
// (`isPending` early-return) protects against double-navigation.
function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const switchTo = useCallback(
    (next: Locale) => {
      if (next === currentLocale || isPending) return;
      const query = searchParams.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      startTransition(() => {
        router.replace(href, { locale: next });
      });
    },
    [currentLocale, isPending, pathname, searchParams, router],
  );

  return { switchTo, isPending, currentLocale };
}

export function LanguageToggle({ variant = "light" }: LanguageToggleProps) {
  const t = useTranslations("languageToggle");
  const { switchTo, isPending, currentLocale } = useSwitchLocale();

  const baseBtn =
    "px-2 py-1 rounded-md text-xs font-semibold tabular-nums transition-colors disabled:cursor-not-allowed";
  const active =
    variant === "dark" ? "bg-white text-[#1D3A62]" : "bg-primary text-white";
  const inactive =
    variant === "dark"
      ? "text-white/70 hover:text-white"
      : "text-muted-foreground hover:text-foreground";

  return (
    <>
      {/* Desktop (md+): 3-button group, unchanged design */}
      <div
        role="group"
        aria-label={t("label")}
        className={cn(
          "hidden md:inline-flex items-center gap-0.5 rounded-lg p-0.5 border",
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
            aria-pressed={currentLocale === l}
            disabled={isPending}
            className={cn(baseBtn, currentLocale === l ? active : inactive)}
          >
            {t(l)}
          </button>
        ))}
      </div>

      {/* Mobile (<md): compact dropdown trigger with current locale */}
      <div className="md:hidden">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("label")}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-semibold tabular-nums transition-colors disabled:opacity-60",
                variant === "dark"
                  ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
                  : "border-border bg-white text-foreground hover:bg-muted/40",
              )}
            >
              {t(currentLocale)}
              <ChevronDown className="h-3 w-3" aria-hidden />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="z-[60] min-w-[7rem] rounded-lg border border-border bg-white p-1 shadow-lg"
            >
              {routing.locales.map((l) => (
                <DropdownMenu.Item
                  key={l}
                  onSelect={() => switchTo(l)}
                  disabled={isPending}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium cursor-pointer outline-none tabular-nums",
                    "data-[highlighted]:bg-muted/60 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
                    currentLocale === l && "text-primary font-semibold",
                  )}
                >
                  {t(l)}
                  {currentLocale === l && (
                    <span aria-hidden className="ml-3 text-primary">
                      ✓
                    </span>
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </>
  );
}
