import type { UserRole } from "@/types/database";
import "next-auth";
import "next-auth/jwt";

// Augment della sessione NextAuth: portiamo role + ownerId (l'id del
// proprietario su cui filtrare i dati owner-facing). Per un utente role="owner"
// ownerId = il proprio UserDoc._id; per admin ownerId = null (vede/seleziona).
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
      ownerId?: string | null;
    };
  }
  interface User {
    role?: UserRole;
    ownerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    ownerId?: string | null;
  }
}
