"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Inbox, Mail, Phone, MapPin, ExternalLink, AlertTriangle } from "lucide-react";
import { useMe } from "@/hooks/use-me";
import {
  useLeads,
  useUpdateLeadStatus,
  type Lead,
  type LeadStatus,
} from "@/hooks/use-leads";

const STATUSES: LeadStatus[] = ["new", "contacted", "archived"];

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-amber-100 text-amber-700",
  archived: "bg-muted text-muted-foreground",
};

export default function LeadsPage() {
  const t = useTranslations("dashboard.leads");
  const locale = useLocale();
  const { data: me } = useMe();
  const isAdmin = me?.role === "admin";

  const { data: leads = [], isLoading } = useLeads();
  const updateStatus = useUpdateLeadStatus();
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Gate admin (i lead sono trasversali all'agenzia). L'API rifiuta comunque
  // i non-admin con 403; qui evitiamo di mostrare la sezione.
  if (me && !isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          {t("forbidden")}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">{t("title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? t("loading")
              : `${t("subtitle")} · ${t("subtitleCount", { count: leads.length })}`}
          </p>
        </div>

        {/* Filtro stato */}
        <div className="inline-flex rounded-xl border border-border/60 bg-white p-1 text-xs">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={
                "px-3 py-1.5 rounded-lg font-medium transition " +
                (filter === s
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {s === "all" ? t("filters.all") : t(`filters.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          {t("loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          <Inbox className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          {t("empty")}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t("headers.date")}</th>
                  <th className="px-4 py-3 font-medium">{t("headers.name")}</th>
                  <th className="px-4 py-3 font-medium">{t("headers.interest")}</th>
                  <th className="px-4 py-3 font-medium">{t("headers.contact")}</th>
                  <th className="px-4 py-3 font-medium">{t("headers.property")}</th>
                  <th className="px-4 py-3 font-medium">{t("headers.message")}</th>
                  <th className="px-4 py-3 font-medium">{t("headers.status")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead: Lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border/30 last:border-0 align-top hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {fmtDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {lead.nome} {lead.cognome}
                      {!lead.emailSent && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          {t("emailNotSent")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-xs">
                        {t(`interest.${lead.interesse}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {lead.email}
                      </a>
                      {lead.telefono && (
                        <a
                          href={`tel:${lead.telefono}`}
                          className="mt-1 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-3.5 w-3.5" /> {lead.telefono}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {lead.indirizzo && (
                        <span className="flex items-start gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="break-words">{lead.indirizzo}</span>
                        </span>
                      )}
                      {lead.onPlatform && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          {t("onPlatform")}
                          {lead.linkAnnuncio && (
                            <a
                              href={lead.linkAnnuncio}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[320px]">
                      <p className="whitespace-pre-wrap break-words text-muted-foreground line-clamp-4">
                        {lead.messaggio}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={lead.status}
                        disabled={updateStatus.isPending}
                        onChange={(e) =>
                          updateStatus.mutate({
                            id: lead.id,
                            status: e.target.value as LeadStatus,
                          })
                        }
                        className={
                          "rounded-lg px-2.5 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-primary/30 " +
                          STATUS_BADGE[lead.status]
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="text-foreground">
                            {t(`status.${s}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
