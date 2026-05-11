type Partner = {
  name: string;
  url: string;
  logo: string;
  heightClass: string;
};

const PARTNERS: Partner[] = [
  {
    name: "Booking.com",
    url: "https://www.booking.com",
    logo: "/images/partners/booking.svg",
    heightClass: "h-7 sm:h-8",
  },
  {
    name: "Expedia",
    url: "https://www.expedia.com",
    logo: "/images/partners/expedia.svg",
    heightClass: "h-6 sm:h-7",
  },
  {
    name: "Airbnb",
    url: "https://www.airbnb.com",
    logo: "/images/partners/airbnb.svg",
    heightClass: "h-8 sm:h-9",
  },
  {
    name: "Tripadvisor",
    url: "https://www.tripadvisor.com",
    logo: "/images/partners/tripadvisor.svg",
    heightClass: "h-7 sm:h-8",
  },
  {
    name: "Como 1907",
    url: "https://www.como1907.com",
    logo: "/images/partners/como-1907.svg",
    heightClass: "h-14 sm:h-16",
  },
  {
    name: "Lake Como Tourism",
    url: "https://lakecomotourism.it",
    logo: "/images/partners/lake-como-tourism.png",
    heightClass: "h-14 sm:h-16",
  },
];

export function PartnersBanner() {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-12 sm:py-14 bg-white border-y border-border/50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {loop.map((p, i) => (
            <a
              key={`${p.name}-${i}`}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              className="shrink-0 flex items-center justify-center px-10 sm:px-14 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.logo}
                alt={p.name}
                className={`${p.heightClass} w-auto object-contain`}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
