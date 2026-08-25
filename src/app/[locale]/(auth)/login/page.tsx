"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { brandName } from "@/lib/seo";

type Mode = "admin" | "owner";

export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const brand = brandName(locale);

  const [mode, setMode] = useState<Mode>("admin");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin (password)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Owner (email + password)
  const [email, setEmail] = useState("");

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function handleAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) setError(t("errorInvalid"));
    else if (result?.url) window.location.href = result.url;
  }

  async function handleOwner(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("owner", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) setError(t("errorInvalid"));
    else window.location.href = result?.url ?? "/dashboard";
  }

  const inputClass =
    "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const submitClass =
    "w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-60";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo-marble.png"
            alt={brand}
            className="h-24 w-24 sm:h-28 sm:w-28 mx-auto object-contain"
          />
          <h1 className="text-2xl font-light text-foreground mt-4">{t("brand")}</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "admin" ? t("subtitle") : "Accesso proprietari"}
          </p>
        </div>

        {mode === "admin" ? (
          <form onSubmit={handleAdmin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className={inputClass + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className={submitClass}>
              {t("submit")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOwner} className="space-y-6">
            <div className="space-y-3">
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email"
                className={inputClass}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className={inputClass + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {info && <p className="text-sm text-muted-foreground">{info}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className={submitClass}>
              {loading ? "Verifica…" : "Accedi"}
            </button>
          </form>
        )}

        <div className="text-center">
          {mode === "admin" ? (
            <button
              type="button"
              onClick={() => switchMode("owner")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Sei un proprietario? Accedi con email
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode("admin")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Accesso staff
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
