"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { LockedToolPreview } from "@/components/strumenti/locked-tool-preview";

export default function WelcomeLetterPage() {
  const t = useTranslations("strumenti.lock.welcomeLetter");
  const bullets = t.raw("bullets") as string[];
  return (
    <LockedToolPreview
      icon={FileText}
      title={t("title")}
      tagline={t("tagline")}
      description={t("description")}
      bullets={bullets}
    />
  );
}
