"use client";

import { useState } from "react";
import { User, Bell, Shield, Save } from "lucide-react";
import { useTranslations } from "next-intl";

type NotificationItem = { label: string; desc: string };

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const notificationItems = t.raw("notifications.items") as NotificationItem[];

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("title")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border/50 divide-y divide-border/40">
        <div className="px-6 py-4 flex items-center gap-3">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{t("profile.title")}</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("profile.firstName")}</label>
              <input
                type="text"
                defaultValue="Andrei"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("profile.lastName")}</label>
              <input
                type="text"
                defaultValue="Crapotca"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("profile.email")}</label>
            <input
              type="email"
              defaultValue="actopark@gmail.com"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("profile.phone")}</label>
            <input
              type="tel"
              placeholder={t("profile.phonePlaceholder")}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="px-6 py-4 flex items-center gap-3">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{t("notifications.title")}</h2>
        </div>
        <div className="p-6 space-y-4">
          {notificationItems.map((item) => (
            <label key={item.label} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 rounded border-border text-primary focus:ring-primary/30"
              />
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Security */}
        <div className="px-6 py-4 flex items-center gap-3">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{t("security.title")}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("security.currentPassword")}</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("security.newPassword")}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("security.confirmPassword")}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="px-6 py-4 flex items-center justify-between">
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">
              {t("savedMessage")}
            </span>
          )}
          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            {t("saveButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
