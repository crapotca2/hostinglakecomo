"use client";

import { CreditCard } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { usePayments } from "@/hooks/use-payments";

const STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

type StatusKey = "succeeded" | "pending" | "failed" | "refunded";
type TypeKey = "booking" | "deposit" | "service" | "refund";

function formatEuro(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentsPage() {
  const t = useTranslations("dashboard.payments");
  const locale = useLocale();
  const { data, isLoading } = usePayments();
  const total = (data || [])
    .filter((p) => p.status === "succeeded" && p.type !== "refund")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">{t("title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <CreditCard className="h-5 w-5 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">{t("kpis.totalCollected")}</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(total, locale)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">{t("kpis.transactions")}</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : data?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">{t("kpis.averagePerTransaction")}</div>
          <div className="text-2xl font-bold">
            {isLoading || !data || data.length === 0 ? "—" : formatEuro(total / data.length, locale)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">{t("loading")}</div>
        ) : !data || data.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">{t("headers.date")}</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.type")}</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.paymentId")}</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">{t("headers.amount")}</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-6 py-3.5">{t("headers.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.map((p) => {
                  const typeKey = (
                    ["booking", "deposit", "service", "refund"].includes(p.type) ? p.type : "service"
                  ) as TypeKey;
                  const statusKey = (
                    ["succeeded", "pending", "failed", "refunded"].includes(p.status) ? p.status : "pending"
                  ) as StatusKey;
                  return (
                    <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDateTime(p.createdAt, locale)}</td>
                      <td className="px-4 py-4 text-sm">{t(`type.${typeKey}`)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-muted-foreground truncate max-w-xs">
                        {p.stripePaymentIntentId}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-right tabular-nums">
                        {formatEuro(p.amount, locale)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                          {t(`status.${statusKey}`)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
