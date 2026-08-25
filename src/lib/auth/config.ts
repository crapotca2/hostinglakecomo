import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { rateLimitByIp } from "@/lib/security/rate-limit";
import { collections } from "@/lib/mongodb/collections";
import { verifyOtp } from "@/lib/auth/otp";
import type { UserRole } from "@/types/database";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "actopark@gmail.com";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Andrei";

/**
 * Risolve role + ownerId dell'utente dalla collection users. Un utente
 * role="owner" ha ownerId = il proprio _id (le query owner-facing filtrano su
 * bookings/properties.ownerId). Se non esiste un UserDoc, è il bootstrap admin.
 */
async function resolveUserClaims(
  email: string,
): Promise<{ role: UserRole; ownerId: string | null }> {
  try {
    const usersCol = await collections.users();
    const user = await usersCol.findOne({ email });
    if (!user) return { role: "admin", ownerId: null };
    const role = user.role ?? "admin";
    const ownerId =
      role === "owner" && user._id ? user._id.toString() : null;
    return { role, ownerId };
  } catch {
    return { role: "admin", ownerId: null };
  }
}

function clientIp(): string {
  try {
    const h = headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password;
        if (!password) return null;

        const ip = clientIp();
        const rl = rateLimitByIp(ip, {
          key: "auth:login",
          windowMs: 5 * 60_000,
          max: 10,
        });
        if (!rl.ok) return null;

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) {
          // Fail closed in production if hash is missing.
          if (process.env.NODE_ENV === "production") return null;
          // Dev-only fallback to plain ADMIN_PASSWORD to ease local bootstrap.
          const plain = process.env.ADMIN_PASSWORD;
          if (plain && password === plain) {
            const claims = await resolveUserClaims(ADMIN_EMAIL);
            return { id: "1", name: ADMIN_NAME, email: ADMIN_EMAIL, ...claims };
          }
          return null;
        }

        const ok = await compare(password, hash);
        if (!ok) return null;
        const claims = await resolveUserClaims(ADMIN_EMAIL);
        return { id: "1", name: ADMIN_NAME, email: ADMIN_EMAIL, ...claims };
      },
    }),
    // Login passwordless per i PROPRIETARI: email + codice OTP (a 6 cifre).
    // Il codice viene richiesto via POST /api/auth/otp/request e verificato qui.
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Codice", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const code = credentials?.code?.trim();
        if (!email || !code) return null;

        const rl = rateLimitByIp(clientIp(), {
          key: "auth:otp-verify",
          windowMs: 5 * 60_000,
          max: 15,
        });
        if (!rl.ok) return null;

        const ok = await verifyOtp(email, code);
        if (!ok) return null;

        const usersCol = await collections.users();
        const user = await usersCol.findOne({ email });
        if (!user) return null;
        const role = user.role ?? "owner";
        const ownerId =
          role === "owner" && user._id ? user._id.toString() : null;
        return {
          id: user._id?.toString() ?? email,
          name: user.name,
          email: user.email,
          role,
          ownerId,
        };
      },
    }),
    // Login PROPRIETARI con email (nome accesso) + password. Cerca l'utente per
    // email nella collection users e confronta l'hash bcrypt (users.passwordHash).
    CredentialsProvider({
      id: "owner",
      name: "Owner",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const rl = rateLimitByIp(clientIp(), {
          key: "auth:owner-login",
          windowMs: 5 * 60_000,
          max: 10,
        });
        if (!rl.ok) return null;

        const usersCol = await collections.users();
        const user = await usersCol.findOne({ email });
        if (!user || !user.passwordHash) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        const role = user.role ?? "owner";
        const ownerId = role === "owner" && user._id ? user._id.toString() : null;
        return {
          id: user._id?.toString() ?? email,
          name: user.name,
          email: user.email,
          role,
          ownerId,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role;
        token.ownerId = (user as { ownerId?: string | null }).ownerId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        session.user.role = token.role;
        session.user.ownerId = token.ownerId ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
