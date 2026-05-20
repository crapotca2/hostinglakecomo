#!/usr/bin/env python3
"""
Analyze argegno_monthly.json to produce real ADR per month for the
demo dashboard.

We extract the per-night price from `price.unit.amount` (or `discount`
when present), divide by the window length (always 7 here), and we
filter aggressively by coordinates so we only count listings really
inside Argegno paese (not Torno / Brienno / Pognana that leaked from
the wider bbox).
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
ARGEGNO_LON_MIN = 45.860  # unused, kept for symmetry
ARGEGNO_LON_MIN = 9.110
ARGEGNO_LON_MAX = 9.135

# Known competitor room_ids we care about (from earlier research)
KNOWN_COMPETITORS = {
    1282644095134922931: "Casa Hygge",
    24907620: "Olga House",
    25619757: "Charming House I",
    23346865: "Charming House II",
    27087120: "Petza Apartment",
    1095446294980500595: "My Heart in Argegno",
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
    return amt / nights


def main():
    payload = json.loads(SRC.read_text(encoding="utf-8"))
    print(f"Windows: {len(payload['windows'])}")
    print(f"Total listings (all bbox): {payload['meta']['total_listings_sum']}")
    print()

    monthly_summary = []

    for w in payload["windows"]:
        ci = date.fromisoformat(w["check_in"])
        co = date.fromisoformat(w["check_out"])
        nights = (co - ci).days

        all_prices = []
        argegno_prices = []
        competitor_prices: dict[int, float] = {}

        for item in w["listings"]:
            ppn = price_per_night(item, nights)
            if ppn is None:
                continue
            all_prices.append(ppn)
            if in_argegno(item):
                argegno_prices.append(ppn)
            rid = item.get("room_id")
            if rid in KNOWN_COMPETITORS:
                competitor_prices[rid] = ppn

        monthly_summary.append({
            "window": w["window"],
            "check_in": w["check_in"],
            "argegno_n": len(argegno_prices),
            "argegno_median": round(statistics.median(argegno_prices), 0) if argegno_prices else None,
            "argegno_mean": round(statistics.mean(argegno_prices), 0) if argegno_prices else None,
            "argegno_min": round(min(argegno_prices), 0) if argegno_prices else None,
            "argegno_max": round(max(argegno_prices), 0) if argegno_prices else None,
            "bbox_n": len(all_prices),
            "competitor_prices": {KNOWN_COMPETITORS[k]: round(v, 0) for k, v in competitor_prices.items()},
        })

    print(f"{'Mese':<10}{'#Arg':>6}{'median':>8}{'mean':>7}{'min':>7}{'max':>7}  Competitors")
    print("-" * 90)
    for row in monthly_summary:
        comp = ", ".join(f"{k} €{int(v)}" for k, v in row["competitor_prices"].items())
        median = f"€{int(row['argegno_median'])}" if row["argegno_median"] else "—"
        mean = f"€{int(row['argegno_mean'])}" if row["argegno_mean"] else "—"
        mn = f"€{int(row['argegno_min'])}" if row["argegno_min"] else "—"
        mx = f"€{int(row['argegno_max'])}" if row["argegno_max"] else "—"
        print(f"{row['window']:<10}{row['argegno_n']:>6}{median:>8}{mean:>7}{mn:>7}{mx:>7}  {comp}")

    # Write monthly summary to JSON for the dashboard
    out = OUT_DIR / "argegno_monthly_summary.json"
    out.write_text(json.dumps(monthly_summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWritten {out}")


if __name__ == "__main__":
    main()
