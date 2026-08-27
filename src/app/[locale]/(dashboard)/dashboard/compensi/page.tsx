"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Download, Users, Wallet, ShieldAlert } from "lucide-react";
import { useMe } from "@/hooks/use-me";
import { useOwnerScope } from "@/components/owner-scope";
import { useStatements } from "@/hooks/use-statements";

const PARTNERS = ["angelo", "andrei"] as const;

function formatEuro(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

interface NoteSummary {
  partner: string; partnerName: string; propertyName: string; periodLabel: string;
  consulenza: number; inps: number; totale: number; bookings: number;
}

export default function CompensiPage() {
  const t = useTranslations("dashboard.compensi");
  const locale = useLocale();
  const { data: me } = useMe();
  const { ownerId } = useOwnerScope();
  const [period, setPeriod] = useState("all");
  const year = new Date().getFullYear();
  const { data: stmts } = useStatements(year);
  const periods = stmts?.payouts?.map((p) => p.period) ?? [];

  if (me && me.role !== "admin") {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("adminOnly")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light"><span className="font-semibold">{t("titleStrong")}</span></h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {!ownerId ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("pickOwner")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">{t("period")}</span>
            <PeriodBtn active={period === "all"} onClick={() => setPeriod("all")} label={t("all")} />
            {periods.map((p) => (
              <PeriodBtn key={p} active={period === p} onClick={() => setPeriod(p)} label={p} />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PARTNERS.map((partner) => (
              <PartnerCard key={partner} partner={partner} ownerId={ownerId} period={period} locale={locale} t={t} />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">{t("note")}</p>
        </>
      )}
    </div>
  );
}

function PeriodBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-primary text-white" : "bg-white border border-border/50 text-muted-foreground hover:bg-muted/50"}`}>
      {label}
    </button>
  );
}

function PartnerCard({ partner, ownerId, period, locale, t }: { partner: string; ownerId: string; period: string; locale: string; t: ReturnType<typeof useTranslations> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["partner-note", partner, ownerId, period],
    queryFn: async () => {
      const qs = new URLSearchParams({ partner, ownerId, period, format: "json" });
      const res = await fetch(`/api/reports/partner-note?${qs}`);
      if (!res.ok) throw new Error("fetch failed");
      return (await res.json()) as NoteSummary;
    },
  });
  const pdfHref = `/api/reports/partner-note?${new URLSearchParams({ partner, ownerId, period })}`;

  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">{data?.partnerName ?? (partner === "angelo" ? "Angelo Talarico" : "Andrei Crapotca")}</div>
            <div className="text-[11px] text-muted-foreground">{data ? `${data.propertyName} · ${data.periodLabel}` : "—"}</div>
          </div>
        </div>
        <a href={pdfHref} title={t("downloadPdf")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
          <Download className="h-3.5 w-3.5" /> PDF
        </a>
      </div>
      <div className="p-6 space-y-2">
        <Row label={t("consulenza")} value={isLoading || !data ? "—" : formatEuro(data.consulenza, locale)} />
        <Row label={t("inps")} value={isLoading || !data ? "—" : formatEuro(data.inps, locale)} muted />
        <div className="border-t border-border/40 pt-2 mt-2">
          <Row label={t("totale")} value={isLoading || !data ? "—" : formatEuro(data.totale, locale)} strong />
        </div>
        {data ? <div className="text-[11px] text-muted-foreground pt-1">{t("bookings", { n: data.bookings })}</div> : null}
      </div>
    </div>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? "text-muted-foreground" : ""}`}>{label}</span>
      <span className={`tabular-nums ${strong ? "text-base font-bold text-primary" : "text-sm font-medium"}`}>{value}</span>
    </div>
  );
}
