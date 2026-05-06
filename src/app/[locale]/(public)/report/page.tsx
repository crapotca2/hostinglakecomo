import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";

export default async function ReportPage() {
  const locale = await getLocale();
  redirect({ href: "/services#dashboard", locale });
}
