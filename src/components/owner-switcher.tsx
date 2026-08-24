"use client";

import { Users } from "lucide-react";
import { useOwnerScope } from "@/components/owner-scope";
import { useOwners } from "@/hooks/use-owners";

/** Selettore proprietario nell'header, visibile SOLO agli admin. La scelta
 *  guida owner-scope su tutta la dashboard (persistita in localStorage). */
export function OwnerSwitcher() {
  const { isAdmin, ownerId, setOwnerId } = useOwnerScope();
  const { data } = useOwners(isAdmin);

  if (!isAdmin) return null;
  const owners = data?.owners ?? [];

  return (
    <div className="flex items-center gap-2 bg-background/80 rounded-xl px-3 py-2 border border-border/60">
      <Users className="h-4 w-4 text-muted-foreground/70 shrink-0" />
      <select
        value={ownerId ?? ""}
        onChange={(e) => setOwnerId(e.target.value || null)}
        className="text-sm bg-transparent border-none outline-none max-w-[220px] cursor-pointer"
        aria-label="Proprietario"
      >
        <option value="">— Seleziona proprietario —</option>
        {owners.map((o) => (
          <option key={o.ownerId} value={o.ownerId}>
            {o.name}
            {o.propertiesCount ? ` (${o.propertiesCount})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
