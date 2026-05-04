"use client";

import { useState } from "react";
import { User, Bell, Shield, CreditCard, Save } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Impostazioni</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestisci il tuo profilo e le preferenze
        </p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border/50 divide-y divide-border/40">
        <div className="px-6 py-4 flex items-center gap-3">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Profilo</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome</label>
              <input
                type="text"
                defaultValue="Andrei"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cognome</label>
              <input
                type="text"
                defaultValue="Crapotca"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              defaultValue="actopark@gmail.com"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Telefono</label>
            <input
              type="tel"
              defaultValue="+39 XXX XXX XXXX"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="px-6 py-4 flex items-center gap-3">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Notifiche</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Nuova prenotazione", desc: "Ricevi una notifica per ogni nuova prenotazione" },
            { label: "Check-in ospiti", desc: "Notifica al check-in degli ospiti" },
            { label: "Report mensile", desc: "Ricevi il rendiconto mensile via email" },
            { label: "Manutenzione urgente", desc: "Alert per richieste di manutenzione urgente" },
          ].map((item) => (
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
          <h2 className="text-sm font-semibold">Sicurezza</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password attuale</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nuova password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Conferma password</label>
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
              Impostazioni salvate!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Salva Modifiche
          </button>
        </div>
      </form>
    </div>
  );
}
