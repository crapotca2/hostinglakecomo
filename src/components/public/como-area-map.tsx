"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

type Comune = {
  slug: string;
  name: string;
  geo: { lat: number; lng: number };
};

type Props = {
  comuni: Comune[];
  locale: Locale;
};

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 760;

const LAT_MAX = 46.22;
const LAT_MIN = 45.71;
const LNG_MIN = 9.0;
const LNG_MAX = 9.46;

function projectLng(lng: number): number {
  const ratio = (lng - LNG_MIN) / (LNG_MAX - LNG_MIN);
  return ratio * VIEWBOX_WIDTH;
}

function projectLat(lat: number): number {
  const ratio = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN);
  return ratio * VIEWBOX_HEIGHT;
}

const ANCHORS = {
  domaso: projectFromGeo(46.1429, 9.3315),
  gravedonaApprox: projectFromGeo(46.15, 9.305),
  menaggio: projectFromGeo(46.022, 9.2415),
  bellagio: projectFromGeo(45.9858, 9.2606),
  varenna: projectFromGeo(46.0107, 9.2842),
  como: projectFromGeo(45.8081, 9.0852),
  lecco: projectFromGeo(45.857, 9.3973),
  tremezzo: projectFromGeo(45.9824, 9.2271),
};

function projectFromGeo(lat: number, lng: number) {
  return { x: projectLng(lng), y: projectLat(lat) };
}

function buildLakePath(): string {
  const { domaso, bellagio, como, lecco } = ANCHORS;
  const northBend = { x: bellagio.x + 8, y: bellagio.y - 90 };
  const comoBend = { x: bellagio.x - 90, y: bellagio.y + 70 };
  const leccoBend = { x: bellagio.x + 80, y: bellagio.y + 50 };
  return [
    `M ${domaso.x} ${domaso.y}`,
    `Q ${northBend.x} ${northBend.y}, ${bellagio.x} ${bellagio.y}`,
    `M ${bellagio.x} ${bellagio.y}`,
    `Q ${comoBend.x} ${comoBend.y}, ${como.x} ${como.y}`,
    `M ${bellagio.x} ${bellagio.y}`,
    `Q ${leccoBend.x} ${leccoBend.y}, ${lecco.x} ${lecco.y}`,
  ].join(" ");
}

const LAKE_PATH = buildLakePath();

const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  bellagio: { dx: 18, dy: -10 },
  menaggio: { dx: -16, dy: -12 },
  varenna: { dx: 18, dy: 4 },
  como: { dx: -16, dy: 22 },
  tremezzo: { dx: -16, dy: 4 },
  cernobbio: { dx: -16, dy: -12 },
  brienno: { dx: -16, dy: -12 },
  argegno: { dx: -16, dy: 4 },
  lenno: { dx: -16, dy: -12 },
  lierna: { dx: 18, dy: -4 },
  domaso: { dx: 18, dy: 4 },
  lecco: { dx: 18, dy: 4 },
  cantu: { dx: 18, dy: 4 },
  erba: { dx: 18, dy: 18 },
};

const PROVINCE_BG_PATH = `M 40 ${VIEWBOX_HEIGHT - 240}
  Q ${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT - 320}, ${VIEWBOX_WIDTH - 40} ${VIEWBOX_HEIGHT - 240}
  L ${VIEWBOX_WIDTH - 40} ${VIEWBOX_HEIGHT - 40}
  Q ${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT}, 40 ${VIEWBOX_HEIGHT - 40}
  Z`;

export function ComoAreaMap({ comuni, locale }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const ariaLabel =
    locale === "en"
      ? "Map of Lake Como and Como province with the towns we cover"
      : "Mappa del Lago di Como e della provincia con i comuni in cui operiamo";

  const provinceLabel = locale === "en" ? "Como province" : "Provincia di Como";

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lakeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D3A62" />
            <stop offset="100%" stopColor="#0C7489" />
          </linearGradient>
        </defs>

        {/* Provincia background blob */}
        <path d={PROVINCE_BG_PATH} fill="#1D3A62" fillOpacity="0.05" />
        <text
          x={VIEWBOX_WIDTH / 2}
          y={VIEWBOX_HEIGHT - 60}
          textAnchor="middle"
          fontSize="13"
          fontWeight={600}
          fill="#1D3A62"
          fillOpacity="0.55"
          letterSpacing="3"
        >
          {provinceLabel.toUpperCase()}
        </text>

        {/* Lago di Como — Y stilizzata */}
        <path
          d={LAKE_PATH}
          stroke="url(#lakeFill)"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
        <path
          d={LAKE_PATH}
          stroke="#FFFFFF"
          strokeOpacity="0.18"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Markers */}
        {comuni.map((c) => {
          const cx = projectLng(c.geo.lng);
          const cy = projectLat(c.geo.lat);
          const offset = LABEL_OFFSETS[c.slug] ?? { dx: 18, dy: 4 };
          const isHover = hovered === c.slug;
          const labelAnchor = offset.dx < 0 ? "end" : "start";

          return (
            <Link
              key={c.slug}
              href={`/property-management/${c.slug}`}
              aria-label={
                locale === "en"
                  ? `Property management in ${c.name}`
                  : `Property management a ${c.name}`
              }
            >
              <g
                onMouseEnter={() => setHovered(c.slug)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(c.slug)}
                onBlur={() => setHovered(null)}
                className="cursor-pointer"
                style={{ transition: "transform 200ms ease" }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHover ? 13 : 10}
                  fill="white"
                  stroke="#0C7489"
                  strokeWidth="2.5"
                  style={{ transition: "r 200ms ease" }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHover ? 5.5 : 4.5}
                  fill={isHover ? "#0C7489" : "#119DB0"}
                  style={{ transition: "r 200ms ease, fill 200ms ease" }}
                />
                <text
                  x={cx + offset.dx}
                  y={cy + offset.dy}
                  textAnchor={labelAnchor}
                  fontSize="15"
                  fontWeight={isHover ? 700 : 600}
                  fill={isHover ? "#0C7489" : "#1D3A62"}
                  style={{ transition: "fill 200ms ease, font-weight 200ms ease" }}
                >
                  {c.name}
                </text>
              </g>
            </Link>
          );
        })}
      </svg>

      <p className="text-center text-xs text-muted-foreground mt-3">
        {locale === "en"
          ? "Click a town to see how we manage properties in that area."
          : "Clicca un comune per vedere come gestiamo le proprietà nella zona."}
      </p>
    </div>
  );
}
