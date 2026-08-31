// Legacy fallback origin (Aqua Vista di Splendore, Argegno). Used only when a
// property has neither geo coordinates nor a street address.
const DEFAULT_ORIGIN = "Via Spluga, 44, 22010 Argegno CO";

export type DirectionsMode = "driving" | "walking" | "transit" | "bicycling";

/**
 * Resolve the directions ORIGIN for a property. Prefers precise geo
 * coordinates ("lat,lng"), falling back to the postal address string, then to
 * the legacy Aqua Vista address. This is what makes every guide's QR/route
 * start from that house instead of a hardcoded one.
 */
export function propertyOrigin(entry?: {
  geo?: { lat: number; lng: number } | null;
  address?: { street?: string; city?: string; province?: string; zip?: string } | null;
} | null): string {
  // Prefer the full postal address (with civic number) as the route origin:
  // Google resolves "Via Camponuovo 106, 22030, Lipomo, CO" reliably to the
  // house, and it matches how the owner thinks of the starting point. Fall back
  // to geo coordinates, then to the legacy Aqua Vista address.
  const a = entry?.address;
  if (a?.street) {
    return [a.street, a.zip, a.city, a.province].filter(Boolean).join(", ");
  }
  const geo = entry?.geo;
  if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
    return `${geo.lat},${geo.lng}`;
  }
  return DEFAULT_ORIGIN;
}

export function buildDirectionsUrl(
  destination: string,
  mode: DirectionsMode = "driving",
  origin: string = DEFAULT_ORIGIN,
): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: mode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function directionsUrlForPoi(
  poi: {
    name?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
    walkMinutes?: number | null;
  },
  origin: string = DEFAULT_ORIGIN,
): string {
  const mode: DirectionsMode = (poi.walkMinutes ?? 100) <= 10 ? "walking" : "driving";
  const dest =
    poi.address && poi.name
      ? `${poi.name}, ${poi.address}`
      : poi.address
        ? poi.address
        : poi.coordinates
          ? `${poi.coordinates.lat},${poi.coordinates.lng}`
          : poi.name ?? "";
  return buildDirectionsUrl(dest, mode, origin);
}
