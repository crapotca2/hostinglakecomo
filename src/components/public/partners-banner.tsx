import { Plane, Heart } from "lucide-react";

type Partner = {
  name: string;
  url: string;
  display: React.ReactNode;
};

const PARTNERS: Partner[] = [
  {
    name: "Booking.com",
    url: "https://www.booking.com",
    display: (
      <span className="text-[22px] font-bold tracking-tight text-[#003580]">
        Booking<span className="text-[#feba02]">.</span>com
      </span>
    ),
  },
  {
    name: "Expedia",
    url: "https://www.expedia.com",
    display: (
      <span className="inline-flex items-center gap-1.5 text-[22px] font-semibold tracking-tight text-[#002244]">
        <Plane
          className="h-5 w-5 -rotate-12 fill-[#fdb913] text-[#fdb913]"
          strokeWidth={1}
        />
        Expedia
      </span>
    ),
  },
  {
    name: "Airbnb",
    url: "https://www.airbnb.com",
    display: (
      <span className="inline-flex items-center gap-1 text-[22px] font-bold tracking-tight text-[#FF385C]">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.5 2 2 6.5 2 12c0 2.4.9 4.6 2.3 6.3.5.6 1.2.9 2 .8.7 0 1.4-.4 1.8-1L12 9.7l3.9 8.4c.4.6 1.1 1 1.8 1 .8.1 1.5-.2 2-.8C21.1 16.6 22 14.4 22 12c0-5.5-4.5-10-10-10zm0 4.5l3.5 7.4c.2.4 0 .9-.4 1.1-.4.2-.9 0-1.1-.4L12 11.4l-2 3.2c-.2.4-.7.6-1.1.4-.4-.2-.6-.7-.4-1.1L12 6.5z" />
        </svg>
        airbnb
      </span>
    ),
  },
  {
    name: "Tripadvisor",
    url: "https://www.tripadvisor.com",
    display: (
      <span className="inline-flex items-center gap-1.5 text-[20px] font-semibold tracking-tight text-[#000000]">
        <svg
          viewBox="0 0 32 16"
          width="32"
          height="16"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="8" cy="8" r="7" fill="#000" />
          <circle cx="8" cy="8" r="3.2" fill="#fff" />
          <circle cx="8" cy="8" r="1.4" fill="#34E0A1" />
          <circle cx="24" cy="8" r="7" fill="#000" />
          <circle cx="24" cy="8" r="3.2" fill="#fff" />
          <circle cx="24" cy="8" r="1.4" fill="#34E0A1" />
        </svg>
        tripadvisor
      </span>
    ),
  },
  {
    name: "Como 1907",
    url: "https://www.como1907.com",
    display: (
      <span className="inline-flex items-center gap-1.5 text-[18px] font-bold tracking-tight italic text-[#0B5FAE]">
        <svg
          viewBox="0 0 24 28"
          width="20"
          height="22"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M2 2 H22 V14 C22 22 12 26 12 26 C12 26 2 22 2 14 Z"
            fill="#0B5FAE"
            stroke="#0B5FAE"
            strokeWidth="1.5"
          />
          <path
            d="M2 2 H22 V8 H2 Z M2 14 H22 V20 C20 22 12 25 12 25 C12 25 4 22 2 20 Z"
            fill="#fff"
          />
        </svg>
        Como<span className="text-foreground font-semibold not-italic ml-0.5">
          1907
        </span>
      </span>
    ),
  },
  {
    name: "Comune di Como",
    url: "https://www.comune.como.it",
    display: (
      <span className="inline-flex items-center gap-2 text-[18px] font-semibold tracking-tight text-foreground">
        <svg
          viewBox="0 0 24 28"
          width="20"
          height="22"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M2 2 H22 V14 C22 22 12 26 12 26 C12 26 2 22 2 14 Z"
            fill="#C62828"
            stroke="#C62828"
            strokeWidth="1.5"
          />
          <path d="M9 9 L12 14 L15 9 L13 9 L13 18 L11 18 L11 9 Z" fill="#fff" />
        </svg>
        <span>
          Comune di <span className="text-[#C62828]">Como</span>
        </span>
      </span>
    ),
  },
  {
    name: "Lake Como Tourism",
    url: "https://www.lakecomo.is.it",
    display: (
      <span className="inline-flex items-baseline gap-1.5 text-[20px] font-medium text-foreground italic">
        <Heart
          className="h-4 w-4 fill-[#0C7489] text-[#0C7489]"
          strokeWidth={0}
        />
        <span style={{ fontFamily: "'Brush Script MT', cursive" }}>
          Lake Como
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground not-italic">
          tourism
        </span>
      </span>
    ),
  },
];

export function PartnersBanner() {
  return (
    <section className="py-14 sm:py-16 bg-white border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">Partner &amp; canali</span>
          <h2 className="text-2xl sm:text-3xl font-light mt-3 text-foreground">
            Distribuiamo le tue proprieta sui{" "}
            <span className="font-semibold">canali leader</span> del mercato
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-14">
          {PARTNERS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              {p.display}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
