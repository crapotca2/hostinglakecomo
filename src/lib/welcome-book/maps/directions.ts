const HOUSE_ORIGIN = "Via Spluga, 44, 22010 Argegno CO";

export type DirectionsMode = "driving" | "walking" | "transit" | "bicycling";

export function buildDirectionsUrl(
  destination: string,
  mode: DirectionsMode = "driving",
): string {
  const params = new URLSearchParams({
    api: "1",
    origin: HOUSE_ORIGIN,
    destination,
    travelmode: mode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function directionsUrlForPoi(poi: {
  name?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  walkMinutes?: number | null;
}): string {
  const mode: DirectionsMode = (poi.walkMinutes ?? 100) <= 10 ? "walking" : "driving";
  const dest =
    poi.address && poi.name
      ? `${poi.name}, ${poi.address}`
      : poi.address
        ? poi.address
        : poi.coordinates
          ? `${poi.coordinates.lat},${poi.coordinates.lng}`
          : poi.name ?? "";
  return buildDirectionsUrl(dest, mode);
}
