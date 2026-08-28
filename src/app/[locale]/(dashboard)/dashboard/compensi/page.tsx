"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Download, Users, Wallet, ShieldAlert, Plus, Trash2, Save, SlidersHorizontal } from "lucide-react";
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
  consulenza: number; inps: number; lordo: number; parcheggio: number;
  favore: number; favoreNote?: string; acconto: number; accontoGuests: string[];
  totale: number; bookings: number;
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

          <AdjustmentsEditor ownerId={ownerId} period={period} t={t} />

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
        {data && data.inps > 0 ? (
          <div className="border-t border-border/40 pt-2 mt-2 space-y-2">
            <Row label={t("inps")} value={formatEuro(data.inps, locale)} muted />
            <Row label={t("lordo")} value={formatEuro(data.lordo, locale)} />
          </div>
        ) : null}
        {data && data.parcheggio > 0 ? (
          <Row label={t("parcheggio")} value={`+ ${formatEuro(data.parcheggio, locale)}`} />
        ) : null}
        {data && data.favore > 0 ? (
          <Row label={data.favoreNote || t("favore")} value={`+ ${formatEuro(data.favore, locale)}`} />
        ) : null}
        {data && data.acconto > 0 ? (
          <Row
            label={`${t("acconto")}${data.accontoGuests?.length ? ` (${data.accontoGuests.join(" / ")})` : ""}`}
            value={`− ${formatEuro(data.acconto, locale)}`}
            muted
          />
        ) : null}
        <div className="border-t border-border/40 pt-2 mt-2">
          <Row label={t("totale")} value={isLoading || !data ? "—" : formatEuro(data.totale, locale)} strong />
        </div>
        {data ? <div className="text-[11px] text-muted-foreground pt-1">{t("bookings", { n: data.bookings })}</div> : null}
      </div>
    </div>
  );
}

interface AdjEntry {
  period: string;
  kind: "favore" | "acconto";
  partner: "angelo" | "andrei";
  amount: number;
  note?: string;
}

function AdjustmentsEditor({ ownerId, period, t }: { ownerId: string; period: string; t: ReturnType<typeof useTranslations> }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["partner-adjustments", ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/reports/partner-adjustments?ownerId=${ownerId}`);
      if (!res.ok) throw new Error("fetch failed");
      return (await res.json()).entries as AdjEntry[];
    },
  });
  const [draft, setDraft] = useState<AdjEntry[] | null>(null);
  const rows = draft ?? data ?? [];
  const dirty = draft !== null;

  const save = useMutation({
    mutationFn: async (entries: AdjEntry[]) => {
      const res = await fetch(`/api/reports/partner-adjustments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, entries }),
      });
      if (!res.ok) throw new Error("save failed");
      return (await res.json()).entries as AdjEntry[];
    },
    onSuccess: (saved) => {
      setDraft(null);
      qc.setQueryData(["partner-adjustments", ownerId], saved);
      qc.invalidateQueries({ queryKey: ["partner-note"] });
    },
  });

  const update = (i: number, patch: Partial<AdjEntry>) => {
    const next = rows.map((r, j) => (j === i ? { ...r, ...patch } : r));
    setDraft(next);
  };
  const add = () =>
    setDraft([...rows, { period: period === "all" ? "2026-07" : period, kind: "acconto", partner: "angelo", amount: 0, note: "" }]);
  const remove = (i: number) => setDraft(rows.filter((_, j) => j !== i));

  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">{t("adjTitle")}</div>
            <div className="text-[11px] text-muted-foreground">{t("adjSubtitle")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border/50 text-xs font-medium hover:bg-muted/50">
            <Plus className="h-3.5 w-3.5" /> {t("adjAdd")}
          </button>
          <button
            onClick={() => save.mutate(rows)}
            disabled={!dirty || save.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> {save.isPending ? "…" : t("adjSave")}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">{t("adjNone")}</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-2 py-1">{t("adjPeriod")}</th>
                <th className="text-left font-semibold px-2 py-1">{t("adjKind")}</th>
                <th className="text-left font-semibold px-2 py-1">{t("adjPartner")}</th>
                <th className="text-right font-semibold px-2 py-1">{t("adjAmount")}</th>
                <th className="text-left font-semibold px-2 py-1">{t("adjNote")}</th>
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border/30">
                  <td className="px-2 py-1">
                    <input value={r.period} onChange={(e) => update(i, { period: e.target.value })} placeholder="2026-07" className="w-20 rounded border border-border/50 px-1.5 py-1 tabular-nums" />
                  </td>
                  <td className="px-2 py-1">
                    <select value={r.kind} onChange={(e) => update(i, { kind: e.target.value as AdjEntry["kind"] })} className="rounded border border-border/50 px-1.5 py-1">
                      <option value="favore">{t("favore")}</option>
                      <option value="acconto">{t("acconto")}</option>
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <select value={r.partner} onChange={(e) => update(i, { partner: e.target.value as AdjEntry["partner"] })} className="rounded border border-border/50 px-1.5 py-1">
                      <option value="angelo">Angelo</option>
                      <option value="andrei">Andrei</option>
                    </select>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input type="number" step="0.01" value={r.amount} onChange={(e) => update(i, { amount: Number(e.target.value) })} className="w-24 rounded border border-border/50 px-1.5 py-1 text-right tabular-nums" />
                  </td>
                  <td className="px-2 py-1">
                    <input value={r.note ?? ""} onChange={(e) => update(i, { note: e.target.value })} placeholder="—" className="w-full min-w-[140px] rounded border border-border/50 px-1.5 py-1" />
                  </td>
                  <td className="px-2 py-1 text-right">
                    <button onClick={() => remove(i)} className="text-muted-foreground hover:text-red-600" title={t("adjRemove")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-[11px] text-muted-foreground px-2 pt-3">{t("adjHint")}</p>
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
