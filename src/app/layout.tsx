// Root layout: must exist for App Router. Locale-aware HTML/body live in
// src/app/[locale]/layout.tsx so that <html lang> can be set per request.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
