"use client";

import { Map } from "lucide-react";
import { useTranslations } from "next-intl";
import { LockedToolPreview } from "@/components/strumenti/locked-tool-preview";

export default function PercorsoMapsPage() {
  const t = useTranslations("strumenti.lock.percorsoMaps");
  const bullets = t.raw("bullets") as string[];
  return (
    <LockedToolPreview
      icon={Map}
      title={t("title")}
      tagline={t("tagline")}
      description={t("description")}
      bullets={bullets}
    />
  );
}
