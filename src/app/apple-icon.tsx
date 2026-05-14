import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
        {/* subtle dot grain — bigger circles than the SVG favicon since we have room */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <pattern id="d" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="7" r="1.2" fill="#ffffff" fillOpacity="0.09" />
            </pattern>
          </defs>
          <rect width="180" height="180" fill="url(#d)" />
        </svg>

        {/* hi glyph, scaled-up version of icon.svg paths (viewBox 0 0 64 64 -> 120x120 centered) */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 64 64"
          style={{ position: "relative" }}
        >
          <g fill="#ffffff">
            <path d="M14 14 H22 V28 Q22 25 26 25 H32 Q38 25 38 31 V50 H30 V33 Q30 32 28 32 H22 V50 H14 Z" />
            <rect x="44" y="25" width="8" height="25" />
            <rect x="44" y="14" width="8" height="7" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
