#!/usr/bin/env python3
"""
Analyze argegno_monthly.json to produce real ADR per month for the
demo dashboard.

We extract the per-night price from `price.unit.amount` (or `discount`
when present), divide by the window length (always 7 here), and we
filter aggressively by coordinates so we only count listings really
inside Argegno paese (not Torno / Brienno / Pognana that leaked from
the wider bbox).

History/changes:
    2026-05-21: fixed double-assignment of ARGEGNO_LON_MIN (was set to a
                latitude value 45.860 then overwritten). Added outlier
                clipping (P5–P95) so single luxury villa at €6067/notte
                doesn't poison the mean. Added warning when no
                KNOWN_COMPETITOR is matched (silent {} bug).
"""
from __future__ import annotations

import json
import pathlib
import statistics
import sys
from datetime import date

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

OUT_DIR = pathlib.Path(__file__).parent
SRC = OUT_DIR / "argegno_monthly.json"

# Argegno paese effettivo (centro storico + frazioni alte adiacenti).
# More aggressive than the scrape bbox to drop Torno / Pognana / Brienno.
ARGEGNO_LAT_MIN = 45.860
ARGEGNO_LAT_MAX = 45.880
ARGEGNO_LON_MIN = 9.110
ARGEGNO_LON_MAX = 9.135

# Outlier clipping: drop top/bottom 5% before computing mean/min/max so
# one ultra-luxury villa (€6067/n in winter) doesn't poison the stats.
# Median is robust by nature so we keep it on the unclipped set.
OUTLIER_CLIP_PCT = 0.05

# Known competitor room_ids — these have to be VALIDATED via the latest
# scrape. If a room_id stops appearing in the bbox results, it's either
# been removed from Airbnb, renamed, or the host changed id. The
# analyzer now logs a warning per missing competitor so we don't silently
# end up with an empty competitor_prices dict (which is what was
# happening on the prior version of this script).
#
# NB: the ids below were sourced from a manual pitch-deck mapping and
# never re-validated. As of 2026-05-21 NONE of them appear in
# argegno_monthly.json — they're probably stale. Either re-source them
# or replace with a name-based fuzzy match (see _find_competitors_by_name).
KNOWN_COMPETITORS_BY_ID: dict[int, str] = {
    1282644095134922931: "Casa Hygge",
    24907620: "Olga House",
    25619757: "Charming House I",
    23346865: "Charming House II",
    27087120: "Petza Apartment",
    1095446294980500595: "My Heart in Argegno",
}

# Fallback: substring match on listing name. Less precise (false positives
# possible if Airbnb has multiple "Casa Hygge"), but resilient to room_id
# churn. Match is case-insensitive on the `name` field.
KNOWN_COMPETITORS_BY_NAME: dict[str, str] = {
    "casa hygge": "Casa Hygge",
    "olga house": "Olga House",
    "charming house i": "Charming House I",
    "charming house ii": "Charming House II",
    "petza": "Petza Apartment",
    "my heart in argegno": "My Heart in Argegno",
}


def in_argegno(item: dict) -> bool:
    c = item.get("coordinates") or {}
    lat = c.get("latitude")
    lon = c.get("longitud") or c.get("longitude")
    if lat is None or lon is None:
        return False
    return (
        ARGEGNO_LAT_MIN <= lat <= ARGEGNO_LAT_MAX
        and ARGEGNO_LON_MIN <= lon <= ARGEGNO_LON_MAX
    )


def price_per_night(item: dict, nights: int) -> float | None:
    p = item.get("price") or {}
    unit = p.get("unit") or {}
    amt = unit.get("amount")
    if amt is None or amt == 0:
        # Some listings only have a discount field (promo)
        amt = unit.get("discount")
    if amt is None or amt == 0:
        return None
    if not isinstance(amt, (int, float)):
        # Defensive: some payloads return amount as string with US format
        try:
            amt = float(str(amt).replace(",", ""))
        except (ValueError, TypeError):
            return None
    return amt / nights


def _find_competitors(listings: list[dict]) -> dict[str, float]:
    """
    Match against both room_id (preferred) and name substring (fallback).
    Returns {competitor_display_name: price_per_night}. If a competitor
    matches via BOTH id and name we keep the id-based price (more precise).
    """
    found: dict[str, float] = {}
    nights = 7  # all argegno_monthly windows are Sat→Sat
    for item in listings:
        rid = item.get("room_id")
        # 1) ID match
        if rid in KNOWN_COMPETITORS_BY_ID:
            ppn = price_per_night(item, nights)
            if ppn is not None:
                found[KNOWN_COMPETITORS_BY_ID[rid]] = ppn
            continue
        # 2) Name match
        name = (item.get("name") or "").lower()
        for pattern, display in KNOWN_COMPETITORS_BY_NAME.items():
            if pattern in name and display not in found:
                ppn = price_per_night(item, nights)
                if ppn is not None:
                    found[display] = ppn
                break
    return found


def _clip_outliers(values: list[float], pct: float) -> list[float]:
    """Drop top and bottom `pct` of values. Stable for small lists."""
    if not values or pct <= 0:
        return values
    s = sorted(values)
    n = len(s)
    cut = max(1, int(n * pct))  # at least 1 element off each end if list big enough
    if 2 * cut >= n:
        return s  # too few rows, don't clip
    return s[cut : n - cut]


def main() -> int:
    payload = json.loads(SRC.read_text(encoding="utf-8"))
    print(f"Windows: {len(payload['windows'])}")
    print(f"Total listings (all bbox): {payload['meta']['total_listings_sum']}")
    print()

    monthly_summary = []
    total_competitor_matches = 0

    for w in payload["windows"]:
        ci = date.fromisoformat(w["check_in"])
        co = date.fromisoformat(w["check_out"])
        nights = (co - ci).days

        all_prices = []
        argegno_prices = []

        for item in w["listings"]:
            ppn = price_per_night(item, nights)
            if ppn is None:
                continue
            all_prices.append(ppn)
            if in_argegno(item):
                argegno_prices.append(ppn)

        # Competitor match runs on the FULL bbox listings, not the
        # Argegno-clipped set: a competitor whose coordinates are masked
        # slightly outside the polygon should still match by id/name.
        competitor_prices = _find_competitors(w["listings"])
        total_competitor_matches += len(competitor_prices)

        # Outlier-clipped stats for mean/min/max
        clipped = _clip_outliers(argegno_prices, OUTLIER_CLIP_PCT)

        monthly_summary.append({
            "window": w["window"],
            "check_in": w["check_in"],
            "argegno_n": len(argegno_prices),
            "argegno_n_clipped": len(clipped),
            "argegno_median": round(statistics.median(argegno_prices), 0) if argegno_prices else None,
            "argegno_mean_clipped": round(statistics.mean(clipped), 0) if clipped else None,
            "argegno_min_clipped": round(min(clipped), 0) if clipped else None,
            "argegno_max_clipped": round(max(clipped), 0) if clipped else None,
            "argegno_max_raw": round(max(argegno_prices), 0) if argegno_prices else None,
            "bbox_n": len(all_prices),
            "competitor_prices": {k: round(v, 0) for k, v in competitor_prices.items()},
        })

    # Surface the silent-empty bug: warn if we matched zero competitors
    # across all 12 windows. That's almost always a stale id list (or a
    # bbox change that excluded the relevant area).
    if total_competitor_matches == 0:
        print("⚠️  WARNING: no KNOWN_COMPETITORS matched in any of the 12 windows.")
        print("    The hardcoded room_ids in KNOWN_COMPETITORS_BY_ID are likely stale.")
        print("    Open the dashboard for one of the competitor listings on airbnb.com,")
        print("    extract the new room_id from the URL, and update this file.")
        print()

    print(f"{'Mese':<10}{'#Arg':>6}{'median':>9}{'mean':>9}{'min':>8}{'max':>8}  Competitors")
    print("-" * 100)
    for row in monthly_summary:
        comp = ", ".join(f"{k} €{int(v)}" for k, v in row["competitor_prices"].items()) or "—"
        median = f"€{int(row['argegno_median'])}" if row["argegno_median"] else "—"
        mean = f"€{int(row['argegno_mean_clipped'])}" if row["argegno_mean_clipped"] else "—"
        mn = f"€{int(row['argegno_min_clipped'])}" if row["argegno_min_clipped"] else "—"
        mx = f"€{int(row['argegno_max_clipped'])}" if row["argegno_max_clipped"] else "—"
        print(f"{row['window']:<10}{row['argegno_n']:>6}{median:>9}{mean:>9}{mn:>8}{mx:>8}  {comp}")

    # Write monthly summary to JSON for the dashboard
    out = OUT_DIR / "argegno_monthly_summary.json"
    out.write_text(json.dumps(monthly_summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWritten {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
