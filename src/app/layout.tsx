import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hosting Lake Como — Co-hosting professionale sul Lago di Como",
  description:
    "Affidaci la tua proprieta sul Lago di Como. Co-hosting con 9 anni di esperienza diretta: pricing, accoglienza, compliance, reportistica.",
  keywords: [
    "co-hosting lago di como",
    "gestione affitti brevi como",
    "property management lago di como",
    "hosting lago di como",
    "airbnb cohost como",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
