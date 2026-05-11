"use client";

import { useEffect, useMemo } from "react";
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

function FitToComuni({ comuni }: { comuni: Comune[] }) {
  const map = useMap();
  useEffect(() => {
    if (comuni.length === 0) return;
    const bounds: LatLngBoundsLiteral = comuni.reduce<LatLngBoundsLiteral>(
      (acc, c) => {
        const lat = c.geo.lat;
        const lng = c.geo.lng;
        if (acc.length === 0) {
          return [
            [lat, lng],
            [lat, lng],
          ];
        }
        const [[minLat, minLng], [maxLat, maxLng]] = acc;
        return [
          [Math.min(minLat, lat), Math.min(minLng, lng)],
          [Math.max(maxLat, lat), Math.max(maxLng, lng)],
        ];
      },
      [],
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [comuni, map]);
  return null;
}

export function ComoLakeMapClient({ comuni, locale }: Props) {
  const router = useRouter();
  const center: LatLngExpression = useMemo(() => {
    if (comuni.length === 0) return [45.95, 9.2];
    const avgLat =
      comuni.reduce((s, c) => s + c.geo.lat, 0) / comuni.length;
    const avgLng =
      comuni.reduce((s, c) => s + c.geo.lng, 0) / comuni.length;
    return [avgLat, avgLng];
  }, [comuni]);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-border/50 shadow-sm bg-white"
      style={{ aspectRatio: "5 / 6" }}
    >
      <MapContainer
        center={center}
        zoom={10}
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
        <FitToComuni comuni={comuni} />
        {comuni.map((c) => (
          <CircleMarker
            key={c.slug}
            center={[c.geo.lat, c.geo.lng]}
            radius={8}
            pathOptions={{
              color: "#0C7489",
              weight: 2.5,
              fillColor: "#119DB0",
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => {
                router.push(`/property-management/${c.slug}`);
              },
              mouseover: (e) => {
                e.target.setStyle({ radius: 11, fillColor: "#0C7489" });
              },
              mouseout: (e) => {
                e.target.setStyle({ radius: 8, fillColor: "#119DB0" });
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
