import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    title: "Accedi — Area Clienti Como Host",
    description:
      "Accedi all'area clienti riservata ai proprietari in gestione con Como Host.",
  },
  en: {
    title: "Sign In — Host Como Client Area",
    description:
      "Sign in to the client area reserved for owners managed by Host Como.",
  },
  ru: {
    title: "Вход — Личный кабинет Хост Комо",
    description:
      "Войдите в закрытую зону для собственников, передавших управление Хост Комо.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale] ?? COPY.it;
  return buildMetadata({
    locale,
    pathname: "/login",
    title: copy.title,
    description: copy.description,
    noIndex: true,
  });
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
