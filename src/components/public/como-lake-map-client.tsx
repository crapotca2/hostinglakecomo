"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useRouter } from "@/i18n/routing";
import type { LatLngExpression, LatLngBoundsLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Locale } from "@/i18n/routing";

type Comune = {
  slug: string;
  name: string;
  geo: { lat: number; lng: number };
  tagline?: string;
};

type Props = {
  comuni: Comune[];
  locale: Locale;
};

const OPERATING_AREA_BOUNDS: LatLngBoundsLiteral = [
  [45.79, 9.06],
  [46.04, 9.31],
];

function FitToOperatingArea() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(OPERATING_AREA_BOUNDS, { padding: [10, 10] });
  }, [map]);
  return null;
}

export function ComoLakeMapClient({ comuni, locale }: Props) {
  const router = useRouter();
  const center: LatLngExpression = [45.97, 9.25];

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-border/50 shadow-sm bg-white"
      style={{ aspectRatio: "4 / 3" }}
    >
      <MapContainer
        center={center}
        zoom={10}
        minZoom={9}
        maxZoom={12}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
          opacity={0.85}
        />
        <FitToOperatingArea />
        {comuni.map((c) => (
          <CircleMarker
            key={c.slug}
            center={[c.geo.lat, c.geo.lng]}
            radius={8}
            pathOptions={{
              color: "#0F172A",
              weight: 2.5,
              fillColor: "#1D3A62",
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => {
                router.push(`/property-management/${c.slug}`);
              },
              mouseover: (e) => {
                e.target.setStyle({ radius: 11, fillColor: "#119DB0" });
              },
              mouseout: (e) => {
                e.target.setStyle({ radius: 8, fillColor: "#1D3A62" });
              },
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              opacity={1}
              className="como-lake-map-tooltip"
            >
              <div className="text-sm font-semibold text-[#1D3A62]">
                {c.name}
              </div>
              {c.tagline && (
                <div className="text-xs text-[#1D3A62]/70 mt-0.5 max-w-[200px]">
                  {c.tagline}
                </div>
              )}
              <div className="text-[10px] text-[#0C7489] mt-1 uppercase tracking-wider font-semibold">
                {locale === "en" ? "Click to open" : "Clicca per aprire"}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control,
        .leaflet-tile-pane,
        .leaflet-marker-pane,
        .leaflet-shadow-pane,
        .leaflet-popup-pane,
        .leaflet-tooltip-pane,
        .leaflet-map-pane {
          z-index: 0 !important;
        }
        .leaflet-container {
          z-index: 0 !important;
          background: #eaf2f7 !important;
        }
        .como-lake-map-tooltip {
          background: white !important;
          border: 1px solid rgba(12, 116, 137, 0.2) !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 16px rgba(29, 58, 98, 0.12) !important;
          padding: 8px 12px !important;
          font-family: inherit !important;
        }
        .como-lake-map-tooltip::before {
          display: none !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #1d3a62 !important;
          border: 1px solid rgba(29, 58, 98, 0.12) !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f7f9fb !important;
          color: #0c7489 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          margin: 12px !important;
        }
      `}</style>
    </div>
  );
}
