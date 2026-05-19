#!/usr/bin/env python3
"""
Scrape hotel listings around Cernobbio via Google Places API (New).

We pull two queries to widen the net:
    1. "hotels in Cernobbio Italy"
    2. "hotels Lake Como Cernobbio Moltrasio"
Then dedupe by place_id and keep up to 30 hotels.

Note on prices: Google Places does NOT expose nightly room rates. We
get name, rating, reviews, address, website, photo, primaryType. For
real pricing the operator should check Booking.com/the hotel website
directly — we add the booking-search deep-link in the Excel output.

Cost: 2 Text Search calls × $0.032 = ~$0.064. Run once per quarter is
plenty (hotel inventory doesn't move fast).
"""
from __future__ import annotations

import json
import os
import pathlib
import sys
from datetime import datetime
from urllib.parse import quote_plus

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import urllib.request
import urllib.error

OUT_DIR = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "hotels.json"

EASYCOMO_ENV = pathlib.Path(
    "C:/Users/Andrei/Desktop/Claudio/easycomo/.env.local"
)


def _read_api_key() -> str:
    if not EASYCOMO_ENV.exists():
        raise SystemExit(f"missing {EASYCOMO_ENV}")
    for line in EASYCOMO_ENV.read_text(encoding="utf-8").splitlines():
        if line.startswith("GOOGLE_MAPS_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("GOOGLE_MAPS_API_KEY not found in easycomo/.env.local")


API_KEY = _read_api_key()
ENDPOINT = "https://places.googleapis.com/v1/places:searchText"
FIELD_MASK = (
    "places.id,places.displayName,places.formattedAddress,"
    "places.location,places.rating,places.userRatingCount,"
    "places.websiteUri,places.internationalPhoneNumber,"
    "places.googleMapsUri,places.primaryType,places.primaryTypeDisplayName,"
    "places.types,places.photos.name"
)

QUERIES = [
    ("hotels in Cernobbio Italy",                "lodging"),
    ("hotels near Lake Como Cernobbio Moltrasio", "lodging"),
]


def places_text_search(query: str, included_type: str | None = None) -> list[dict]:
    body = {
        "textQuery": query,
        "languageCode": "en",
        "regionCode": "IT",
        "pageSize": 20,
    }
    if included_type:
        body["includedType"] = included_type
    data = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        method="POST",
        headers={
            "Content-Type":   "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": FIELD_MASK,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8", errors="ignore")
        print(f"HTTP {e.code} on '{query}': {body_err[:300]}", file=sys.stderr)
        return []
    return payload.get("places") or []


def main() -> int:
    print(f"[hotels] API key loaded ({API_KEY[:7]}…)")
    all_hotels: dict[str, dict] = {}
    for q, t in QUERIES:
        print(f"[hotels] querying: {q!r} (includedType={t})")
        results = places_text_search(q, t)
        print(f"  → {len(results)} results")
        for p in results:
            pid = p.get("id")
            if pid:
                all_hotels.setdefault(pid, p)

    print(f"[hotels] {len(all_hotels)} unique hotels after dedupe")

    rows = []
    for p in all_hotels.values():
        name = (p.get("displayName") or {}).get("text") or ""
        loc = p.get("location") or {}
        # Build a Booking.com search deep-link for July 15-22 (alta stagione)
        # and June 15-22 — the operator can swap dates trivially.
        gmaps_url = p.get("googleMapsUri") or ""
        booking_july = (
            "https://www.booking.com/searchresults.html?"
            f"ss={quote_plus(name + ' Cernobbio')}"
            "&checkin=2026-07-15&checkout=2026-07-22&group_adults=2"
        )
        booking_june = (
            "https://www.booking.com/searchresults.html?"
            f"ss={quote_plus(name + ' Cernobbio')}"
            "&checkin=2026-06-15&checkout=2026-06-22&group_adults=2"
        )
        rows.append({
            "place_id": p.get("id"),
            "name": name,
            "address": p.get("formattedAddress") or "",
            "rating": p.get("rating"),
            "reviews": p.get("userRatingCount"),
            "primary_type": p.get("primaryType") or "",
            "primary_type_display": (p.get("primaryTypeDisplayName") or {}).get("text") or "",
            "types": p.get("types") or [],
            "website": p.get("websiteUri") or "",
            "phone": p.get("internationalPhoneNumber") or "",
            "lat": loc.get("latitude"),
            "lng": loc.get("longitude"),
            "google_maps_url": gmaps_url,
            "booking_july": booking_july,
            "booking_june": booking_june,
        })

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "source": "Google Places API (New) places:searchText",
            "queries": [q for q, _ in QUERIES],
            "total_unique_hotels": len(rows),
        },
        "hotels": rows,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")
    print(f"\n✅  {OUT_FILE} ({len(rows)} hotels)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
