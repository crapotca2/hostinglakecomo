import { redirect } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

export default async function WelcomeLetterRedirect({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect({ href: "/strumenti", locale });
}
