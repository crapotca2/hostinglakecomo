import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "en"
      ? "Aqua Vista di Splendore — Argegno (demo)"
      : locale === "ru"
      ? "Aqua Vista di Splendore — Ардженьо (демо)"
      : "Aqua Vista di Splendore — Argegno (demo)";
  const description =
    locale === "en"
      ? "Internal preview of Aqua Vista di Splendore, a historic lakefront apartment in Argegno. Not indexed."
      : locale === "ru"
      ? "Внутренний предпросмотр Aqua Vista di Splendore, исторических апартаментов на берегу озера в Ардженьо. Не индексируется."
      : "Anteprima interna di Aqua Vista di Splendore, appartamento storico fronte lago ad Argegno. Non indicizzata.";
  return buildMetadata({
    locale,
    pathname: "/demo/casa-del-pozzo",
    title,
    description,
    noIndex: true,
  });
}

export default function CasaDelPozzoDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
