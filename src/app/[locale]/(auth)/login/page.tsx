"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("login");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    if (result?.error) {
      setError(t("errorInvalid"));
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo-marble.png"
            alt="Hosting Lake Como"
            className="h-24 w-24 sm:h-28 sm:w-28 mx-auto object-contain"
          />
          <h1 className="text-2xl font-light text-foreground mt-4">
            {t("brand")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="w-full rounded-lg border px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
        >
          {t("submit")}
        </button>
      </form>
    </div>
  );
}
