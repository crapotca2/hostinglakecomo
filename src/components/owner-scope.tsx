"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMe } from "@/hooks/use-me";

interface OwnerScope {
  role: "admin" | "owner" | "guest" | undefined;
  isAdmin: boolean;
  /** ownerId da inviare alle API: la selezione admin, oppure null per gli owner
   *  (auto-scoping server-side). */
  ownerId: string | null;
  /** true quando un admin non ha ancora scelto un proprietario. */
  needsPick: boolean;
  setOwnerId: (id: string | null) => void;
  ready: boolean;
}

const Ctx = createContext<OwnerScope | null>(null);
const STORAGE_KEY = "hc_owner_scope";

export function OwnerScopeProvider({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const [selected, setSelected] = useState<string | null>(null);

  // Persiste anche in un cookie: così le richieste server-side (route handler)
  // possono risolvere l'owner selezionato senza che ogni fetch aggiunga ?ownerId.
  const persist = (id: string | null) => {
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage non disponibile */
    }
    try {
      document.cookie = id
        ? `${STORAGE_KEY}=${encodeURIComponent(id)}; path=/; max-age=2592000; samesite=lax`
        : `${STORAGE_KEY}=; path=/; max-age=0; samesite=lax`;
    } catch {
      /* cookie non disponibile */
    }
  };

  // Idrata dalla URL (?ownerId=…) o da localStorage al mount (client-only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URLSearchParams(window.location.search).get("ownerId");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage non disponibile */
    }
    const init = url || stored;
    if (init) {
      setSelected(init);
      persist(init); // allinea il cookie allo stato ripristinato
    }
  }, []);

  const setOwnerId = (id: string | null) => {
    setSelected(id);
    persist(id);
  };

  const role = me?.role;
  const isAdmin = role === "admin";
  const ownerId = isAdmin ? selected : null; // gli owner si auto-scopano server-side
  const needsPick = isAdmin && !selected;

  return (
    <Ctx.Provider
      value={{ role, isAdmin, ownerId, needsPick, setOwnerId, ready: !isLoading && !!me }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useOwnerScope(): OwnerScope {
  const v = useContext(Ctx);
  if (!v) {
    // Default sicuro fuori dal provider (non dovrebbe capitare in dashboard).
    return {
      role: undefined,
      isAdmin: false,
      ownerId: null,
      needsPick: false,
      setOwnerId: () => {},
      ready: false,
    };
  }
  return v;
}
