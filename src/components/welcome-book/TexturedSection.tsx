const NAVY = "#1D3A62";
const TEXTURE_URL = "/images/textures/como-trama.webp";

export function TexturedSection({
  children,
  textured = false,
}: {
  children: React.ReactNode;
  textured?: boolean;
}) {
  if (!textured) {
    return <section className="py-2 sm:py-4">{children}</section>;
  }
  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden py-12 sm:py-16"
      style={{ backgroundColor: NAVY }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] bg-cover bg-center pointer-events-none print:hidden"
        style={{ backgroundImage: `url('${TEXTURE_URL}')` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/15 pointer-events-none"
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function GroupHeader({
  label,
  onDark = false,
}: {
  label: string;
  onDark?: boolean;
}) {
  const textCls = onDark ? "text-white" : "text-[#1D3A62]";
  const lineGrad = onDark
    ? "from-transparent via-white/40 to-white/40"
    : "from-transparent via-[#1D3A62]/30 to-[#1D3A62]/30";
  return (
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <span aria-hidden className={`h-px flex-1 bg-gradient-to-r ${lineGrad}`} />
      <h2 className={`text-xs sm:text-sm uppercase tracking-[0.18em] font-bold ${textCls}`}>
        {label}
      </h2>
      <span aria-hidden className={`h-px flex-1 bg-gradient-to-l ${lineGrad}`} />
    </div>
  );
}
