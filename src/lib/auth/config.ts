import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { rateLimitByIp } from "@/lib/security/rate-limit";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "actopark@gmail.com";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Andrei";

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
            return { id: "1", name: ADMIN_NAME, email: ADMIN_EMAIL };
          }
          return null;
        }

        const ok = await compare(password, hash);
        if (!ok) return null;
        return { id: "1", name: ADMIN_NAME, email: ADMIN_EMAIL };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
};
