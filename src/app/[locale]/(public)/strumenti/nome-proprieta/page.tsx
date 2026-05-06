"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { LockedToolPreview } from "@/components/strumenti/locked-tool-preview";

export default function NomeProprietaPage() {
  const t = useTranslations("strumenti.lock.nomeProprieta");
  const bullets = t.raw("bullets") as string[];
  return (
    <LockedToolPreview
      icon={Sparkles}
      title={t("title")}
      tagline={t("tagline")}
      description={t("description")}
      bullets={bullets}
    />
  );
}
