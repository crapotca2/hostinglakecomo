"use client";

import { FileText, ArrowUpRight, Download, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useStatements } from "@/hooks/use-statements";
import { useOwnerScope } from "@/components/owner-scope";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
};

type StatusKey = "paid" | "pending";

function formatEuro(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StatementsPage() {
  const t = useTranslations("dashboard.statements");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  // Owner-scope globale: gli owner si auto-scopano; l'admin sceglie dal selettore
  // nell'header (needsPick = admin senza selezione).
  const { ownerId, needsPick } = useOwnerScope();
  const { data, isLoading } = useStatements(currentYear);

  const payouts = data?.payouts || [];
  const ytdGross = payouts.reduce((s, p) => s + p.grossRevenue, 0);
  const ytdOta = payouts.reduce((s, p) => s + p.otaCommissions, 0);
  const ytdCedolare = payouts.reduce((s, p) => s + (p.cedolare || 0), 0);
  const ytdHostComo = payouts.reduce((s, p) => s + p.airbibbyCommission, 0);
  const ytdNet = payouts.reduce((s, p) => s + p.netPayout, 0);

  const pdfHref = (period: string) =>
    `/api/reports/statements/pdf?period=${period}${ownerId ? `&ownerId=${ownerId}` : ""}`;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("title")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle", { year: currentYear })}
        </p>
      </div>

      {needsPick ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Seleziona un proprietario per vedere il suo rendiconto.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">{t("kpis.ytdGross")}</div>
              <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdGross, locale)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("kpis.revenueHint")}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">{t("kpis.otaCommissions")}</div>
              <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdOta, locale)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("kpis.hostComo")}: {isLoading ? "—" : formatEuro(ytdHostComo, locale)}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">{t("kpis.cedolare")}</div>
              <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdCedolare, locale)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("kpis.cedolareHint")}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">{t("kpis.netPayoutYtd")}</div>
              <div className="text-2xl font-bold text-primary">{isLoading ? "—" : formatEuro(ytdNet, locale)}</div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                <ArrowUpRight className="h-3 w-3" /> {t("kpis.netPayoutHint")}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-muted-foreground">{t("loading")}</div>
            ) : payouts.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">{t("empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">{t("headers.period")}</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.bookings")}</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.gross")}</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.ota")}</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.cedolare")}</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.hostComo")}</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.net")}</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.taxAdvance")}</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.status")}</th>
                      <th className="px-4 py-3.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {payouts.map((s) => {
                      const statusKey = (
                        ["paid", "pending"].includes(s.status) ? s.status : "pending"
                      ) as StatusKey;
                      return (
                        <tr key={s.period} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium">{s.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-center">{s.bookingCount}</td>
                          <td className="px-4 py-4 text-sm text-right font-medium tabular-nums">{formatEuro(s.grossRevenue, locale)}</td>
                          <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                            -{formatEuro(s.otaCommissions, locale)}
                          </td>
                          <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                            -{formatEuro(s.cedolare || 0, locale)}
                          </td>
                          <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                            -{formatEuro(s.airbibbyCommission, locale)}
                          </td>
                          <td className="px-4 py-4 text-sm text-right font-bold text-primary tabular-nums">{formatEuro(s.netPayout, locale)}</td>
                          <td className="px-4 py-4 text-sm text-right text-emerald-600 tabular-nums" title={t("taxAdvanceHint")}>
                            +{formatEuro(s.touristTaxCollected || 0, locale)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[s.status]}`}>
                              {t(`status.${statusKey}`)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <a
                              href={pdfHref(s.period)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={t("downloadPdf")}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/[0.08] hover:text-primary transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
