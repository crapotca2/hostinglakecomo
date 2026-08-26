"use client";

// Analytics e Rendiconti sono stati unificati in un'unica vista (grafici +
// tabelle) sotto /dashboard/reports/property-management. Questa route storica
// reindirizza lì per non lasciare una pagina doppia.
import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function AnalyticsRedirect() {
  const router = useRouter();
  const t = useTranslations("dashboard.reports.common");

  useEffect(() => {
    router.replace("/dashboard/reports/property-management");
  }, [router]);

  return <div className="p-12 text-center text-sm text-muted-foreground animate-fade-in">{t("loading")}</div>;
}
