"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export function DisclaimerNote() {
  const t = useTranslations("strumenti");
  return (
    <div className="rounded-2xl border border-border/50 bg-primary/[0.03] px-5 py-4 flex items-start gap-3">
      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {t("disclaimer")}
      </p>
    </div>
  );
}
