"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
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
      setError("Password non valida");
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold"
            style={{ background: "linear-gradient(135deg, #0C7489 0%, #119DB0 100%)" }}>
            HLC
          </div>
          <h1 className="text-2xl font-light text-foreground mt-4">
            Hosting Lake Como
          </h1>
          <p className="text-sm text-muted-foreground">
            Area riservata proprietari
          </p>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
          Accedi
        </button>
      </form>
    </div>
  );
}
