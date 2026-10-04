"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMe } from "@/hooks/use-me";

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");
  const { data: me } = useMe();

  const parts = (me?.name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("title")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Profilo (sola lettura: l'editing non è ancora disponibile) */}
      <div className="bg-white rounded-2xl border border-border/50 divide-y divide-border/40">
        <div className="px-6 py-4 flex items-center gap-3">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{t("profile.title")}</h2>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-x-4 gap-y-5">
          <Field label={t("profile.firstName")} value={firstName} />
          <Field label={t("profile.lastName")} value={lastName} />
          <div className="sm:col-span-2">
            <Field label={t("profile.email")} value={me?.email ?? ""} />
          </div>
        </div>
        <div className="px-6 py-4">
          <p className="text-xs text-muted-foreground">{t("readOnlyNote")}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium mb-1.5">{label}</div>
      <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground">
        {value || "—"}
      </div>
    </div>
  );
}
