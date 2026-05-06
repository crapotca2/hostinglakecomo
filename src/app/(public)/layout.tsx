import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { CookieBanner } from "@/components/public/cookie-banner";
import { QueryProvider } from "@/components/query-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </QueryProvider>
  );
}
