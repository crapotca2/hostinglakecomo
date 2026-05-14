import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Tiny inline SVG of just paths (no <defs>/<pattern>) — Satori supports <svg>/<rect>/<path>
// but not pattern/gradient/defs, which is why we render the dot grain as positioned divs.
function HiGlyph() {
  return (
    <svg width="120" height="120" viewBox="0 0 64 64">
      <path
        d="M14 14 H22 V28 Q22 25 26 25 H32 Q38 25 38 31 V50 H30 V33 Q30 32 28 32 H22 V50 H14 Z"
        fill="#ffffff"
      />
      <rect x="44" y="25" width="8" height="25" fill="#ffffff" />
      <rect x="44" y="14" width="8" height="7" fill="#ffffff" />
    </svg>
  );
}

// 13x13 grid of subtle dots — replaces the unsupported <pattern> in the SVG favicon.
function DotGrain() {
  const cells = [];
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 13; x++) {
      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x * 14 + 7,
            top: y * 14 + 7,
            width: 2.4,
            height: 2.4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.10)",
          }}
        />,
      );
    }
  }
  return <>{cells}</>;
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1D3A62",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <DotGrain />
        <HiGlyph />
      </div>
    ),
    { ...size },
  );
}
