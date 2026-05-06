"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  CalendarCheck,
  FileText,
  TableProperties,
  BarChart3,
  Wallet,
  ArrowRight,
} from "lucide-react";

interface CategoryDef {
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

const CATEGORY_DEFS: CategoryDef[] = [
  { slug: "stay", icon: CalendarCheck, count: 4 },
  { slug: "summary", icon: FileText, count: 3 },
  { slug: "detail", icon: TableProperties, count: 7 },
  { slug: "analysis", icon: BarChart3, count: 12 },
  { slug: "property-management", icon: Wallet, count: 5 },
];

export default function ReportsPage() {
  const t = useTranslations("dashboard.reports.index");

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("titleStrong")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORY_DEFS.map((c) => (
          <Link
            key={c.slug}
            href={`/dashboard/reports/${c.slug}`}
            className="group bg-white rounded-2xl p-6 border border-border/50 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {t("reportCount", { count: c.count })}
              </span>
            </div>
            <h3 className="text-base font-semibold mb-2">{t(`categories.${c.slug}.name` as never)}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t(`categories.${c.slug}.desc` as never)}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              {t("openCategory")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {t("comingSoonTitle")}
        </div>
        <p className="text-sm text-muted-foreground">{t("comingSoonBody")}</p>
      </div>
    </div>
  );
}
