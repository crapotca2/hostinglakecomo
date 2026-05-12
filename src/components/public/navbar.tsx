"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/public/language-toggle";
import { brandName } from "@/lib/seo";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const brand = brandName(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  const navItems: { href: string; label: string }[] = [
    { href: "/", label: t("home") },
    { href: "/properties", label: t("properties") },
    { href: "/services", label: t("services") },
    { href: "/strumenti", label: t("tools") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const showSolid = scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-300",
        showSolid
          ? "bg-white/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : isHome
          ? "bg-transparent"
          : "bg-[#1D3A62]"
      )}
    >
      {!showSolid && !isHome && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0"
            aria-label={t("homeAriaLabel")}
          >
            <span className="relative h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo-marble.png"
                alt=""
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
                  showSolid ? "opacity-100" : "opacity-0"
                )}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo-white.png"
                alt={brand}
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
                  showSolid ? "opacity-0" : "opacity-100"
                )}
              />
            </span>
            <span
              className={cn(
                "font-bungee uppercase text-base sm:text-lg lg:text-xl tracking-wide transition-colors truncate",
                showSolid ? "text-foreground" : "text-white"
              )}
            >
              {brand}
            </span>
          </Link>

          {/* Desktop nav (lg+) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 xl:px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  pathname === item.href
                    ? showSolid
                      ? "text-primary bg-primary/[0.08]"
                      : "text-white bg-white/15"
                    : showSolid
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Language toggle + CTA + mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:block">
              <LanguageToggle variant={showSolid ? "light" : "dark"} />
            </div>
            <Link
              href="/contact?interest=consulenza"
              className={cn(
                "hidden md:inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                showSolid
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white text-primary hover:bg-white/90"
              )}
            >
              <span className="hidden lg:inline">{t("cta")}</span>
              <span className="lg:hidden">{t("ctaShort")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={mobileOpen}
              className={cn(
                "lg:hidden h-10 w-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                showSolid
                  ? "hover:bg-muted/50 text-foreground"
                  : "hover:bg-white/10 text-white"
              )}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-16 bg-foreground/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden absolute top-full inset-x-0 bg-white border-t border-border/40 shadow-xl animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/[0.08]"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between gap-3">
                <LanguageToggle variant="light" />
                <Link
                  href="/contact?interest=consulenza"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white text-sm font-semibold"
                >
                  {t("cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
