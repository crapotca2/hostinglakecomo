"use client";

import { Home, FileText, ArrowUpRight, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useMe } from "@/hooks/use-me";
import { useOwners } from "@/hooks/use-owners";

const ZONE_LABEL: Record<string, string> = {
  "centro-como": "Centro Como",
  "primo-bacino": "Primo bacino",
  "secondo-bacino": "Secondo bacino",
  "alto-lago": "Alto lago",
  "valle-intelvi": "Valle Intelvi",
  lecco: "Lecco",
  altro: "Altro",
};

export default function OwnersPage() {
  const { data: me } = useMe();
  const isAdmin = me?.role === "admin";
  const { data, isLoading } = useOwners();
  const owners = data?.owners ?? [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Proprietari</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin
            ? "Ogni proprietario con i suoi immobili. Apri il rendiconto per vedere i payout."
            : "I tuoi immobili e il tuo rendiconto."}
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          Caricamento…
        </div>
      ) : owners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          Nessun proprietario registrato.
        </div>
      ) : (
        <div className="space-y-5">
          {owners.map((o) => (
            <section
              key={o.ownerId}
              className="bg-white rounded-2xl border border-border/50 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{o.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {o.propertiesCount} immobil{o.propertiesCount === 1 ? "e" : "i"}
                  </span>
                  <Link
                    href={`/dashboard/statements?ownerId=${o.ownerId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition"
                  >
                    <FileText className="h-3.5 w-3.5" /> Rendiconto
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {o.properties.length === 0 ? (
                <div className="px-6 py-5 text-sm text-muted-foreground">
                  Nessun immobile collegato a questo proprietario.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                  {o.properties.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-border/50 p-4 flex items-start gap-3"
                    >
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Home className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ZONE_LABEL[p.zone] ?? p.zone}
                          {p.status !== "active" ? ` · ${p.status}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
