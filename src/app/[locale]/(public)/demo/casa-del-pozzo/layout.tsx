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
      ? "Casa del Pozzo — Argegno (demo)"
      : locale === "ru"
      ? "Casa del Pozzo — Ардженьо (демо)"
      : "Casa del Pozzo — Argegno (demo)";
  const description =
    locale === "en"
      ? "Internal preview of Casa del Pozzo, a historic lakefront apartment in Argegno. Not indexed."
      : locale === "ru"
      ? "Внутренний предпросмотр Casa del Pozzo, исторических апартаментов на берегу озера в Ардженьо. Не индексируется."
      : "Anteprima interna di Casa del Pozzo, appartamento storico fronte lago ad Argegno. Non indicizzata.";
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
