"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { useTransition } from "react";

export function LegalLanguageDisclaimer() {
  const locale = useLocale();
  const t = useTranslations("legalDisclaimer");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (locale !== "en") return null;

  const switchToItalian = () => {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      router.replace(href, { locale: "it" });
    });
  };

  return (
    <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-4 flex items-start gap-3">
      <Languages className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="text-sm font-semibold text-amber-900">{t("title")}</div>
        <p className="text-xs text-amber-800 mt-1 leading-relaxed">{t("body")}</p>
      </div>
      <button
        type="button"
        onClick={switchToItalian}
        disabled={isPending}
        className="text-xs font-semibold text-amber-900 hover:underline disabled:opacity-50 shrink-0 self-center"
      >
        {t("cta")} →
      </button>
    </div>
  );
}
