#!/usr/bin/env python3
"""
Compute per-month OCCUPANCY RATE for each Argegno competitor from the
calendar dump produced by scrape_argegno_calendar.py.

Occupancy_raw(listing, month) = unavailable_days / days_in_month
Occupancy_corrected = Occupancy_raw × 0.85
  (industry-standard adjustment — see AirDNA methodology. Calendar
  "unavailable" includes host personal blocks + advance booking limits
  + maintenance, not only real bookings. The 0.85 factor approximates
  the % that is actually bookings.)

Also merges in the per-month median ADR from argegno_monthly_summary.json
so the dashboard gets one unified per-month line:
  { window, median_adr_zone, median_occupancy_competitors, n_competitors }

Output: argegno_intel_combined.json — ready for dashboard ingest.
"""
from __future__ import annotations

import json
import pathlib
import statistics
import sys
from collections import defaultdict
from datetime import date

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

OUT_DIR = pathlib.Path(__file__).parent
CAL_SRC = OUT_DIR / "argegno_calendar.json"
PRICE_SRC = OUT_DIR / "argegno_monthly_summary.json"
OUT_FILE = OUT_DIR / "argegno_intel_combined.json"

# Industry-standard calendar→bookings correction. AirDNA uses 0.80-0.90
# depending on market; 0.85 is a defensible default for STR in Italy.
OCCUPANCY_CORRECTION = 0.85


def _month_key(date_str: str) -> str | None:
    """Returns 'YYYY-MM' from 'YYYY-MM-DD' or None on parse failure."""
    try:
        d = date.fromisoformat(date_str)
        return f"{d.year:04d}-{d.month:02d}"
    except (ValueError, TypeError):
        return None


def _month_label_it(month_key: str) -> str:
    """'2026-06' → 'Giu 2026' for display consistency with monthly summary."""
    months_it = ["", "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
                 "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
    try:
        y, m = month_key.split("-")
        return f"{months_it[int(m)]} {y}"
    except (ValueError, IndexError):
        return month_key


def compute_listing_occupancy(calendar: list[dict]) -> dict[str, dict]:
    """
    From a flat list of {date, available} produce
      { 'YYYY-MM': {days, unavailable, occupancy_raw, occupancy_corrected} }
    """
    monthly: dict[str, dict] = defaultdict(lambda: {"days": 0, "unavailable": 0})
    for d in calendar:
        mk = _month_key(d.get("date"))
        if mk is None:
            continue
        monthly[mk]["days"] += 1
        if not d.get("available", False):
            monthly[mk]["unavailable"] += 1

    out = {}
    for mk, stats in monthly.items():
        days = stats["days"]
        unavail = stats["unavailable"]
        raw = unavail / days if days > 0 else 0
        out[mk] = {
            "days_seen": days,
            "unavailable_days": unavail,
            "occupancy_raw": round(raw, 3),
            "occupancy_corrected": round(raw * OCCUPANCY_CORRECTION, 3),
        }
    return out


def main() -> int:
    if not CAL_SRC.exists():
        print(f"missing {CAL_SRC} — run scrape_argegno_calendar.py first",
              file=sys.stderr)
        return 1

    cal_payload = json.loads(CAL_SRC.read_text(encoding="utf-8"))
    competitors = cal_payload.get("competitors", [])

    # 1) Per-competitor monthly occupancy
    per_listing = []
    for c in competitors:
        cal = c.get("calendar", [])
        if not cal:
            continue
        monthly = compute_listing_occupancy(cal)
        per_listing.append({
            "room_id": c["room_id"],
            "name": c["name"],
            "bedrooms": c.get("bedrooms"),
            "guests": c.get("guests"),
            "monthly": monthly,
        })

    if not per_listing:
        print("no competitors with calendar data — fix the scrape first",
              file=sys.stderr)
        return 1

    # 2) Aggregate per month: median occupancy across competitors
    all_months: set[str] = set()
    for pl in per_listing:
        all_months.update(pl["monthly"].keys())

    monthly_zone: list[dict] = []
    for mk in sorted(all_months):
        occ_corrected = [
            pl["monthly"][mk]["occupancy_corrected"]
            for pl in per_listing if mk in pl["monthly"]
        ]
        occ_raw = [
            pl["monthly"][mk]["occupancy_raw"]
            for pl in per_listing if mk in pl["monthly"]
        ]
        if not occ_corrected:
            continue
        monthly_zone.append({
            "month_key": mk,
            "month_label": _month_label_it(mk),
            "n_competitors": len(occ_corrected),
            "occupancy_median_raw": round(statistics.median(occ_raw), 3),
            "occupancy_median_corrected": round(statistics.median(occ_corrected), 3),
            "occupancy_p25_corrected": round(
                statistics.quantiles(occ_corrected, n=4)[0] if len(occ_corrected) >= 4 else min(occ_corrected),
                3
            ),
            "occupancy_p75_corrected": round(
                statistics.quantiles(occ_corrected, n=4)[2] if len(occ_corrected) >= 4 else max(occ_corrected),
                3
            ),
        })

    # 3) Merge with price snapshot (argegno_monthly_summary.json)
    price_by_label: dict[str, dict] = {}
    if PRICE_SRC.exists():
        price_data = json.loads(PRICE_SRC.read_text(encoding="utf-8"))
        for row in price_data:
            price_by_label[row["window"]] = row

    combined = []
    for mz in monthly_zone:
        price_row = price_by_label.get(mz["month_label"], {})
        combined.append({
            "month_key": mz["month_key"],
            "month_label": mz["month_label"],
            "n_competitors_calendar": mz["n_competitors"],
            "occupancy_median": mz["occupancy_median_corrected"],
            "occupancy_p25": mz["occupancy_p25_corrected"],
            "occupancy_p75": mz["occupancy_p75_corrected"],
            "occupancy_raw_median": mz["occupancy_median_raw"],
            "adr_median": price_row.get("argegno_median"),
            "adr_mean_clipped": price_row.get("argegno_mean_clipped"),
            "n_listings_price_sample": price_row.get("argegno_n"),
            # Derived: RevPAN = ADR × occupancy
            "revpan_median": (
                round(price_row["argegno_median"] * mz["occupancy_median_corrected"], 1)
                if price_row.get("argegno_median") else None
            ),
        })

    payload = {
        "meta": {
            "occupancy_correction_factor": OCCUPANCY_CORRECTION,
            "n_competitors_total": len(per_listing),
            "months_covered": len(combined),
            "competitors_sample": [
                {"room_id": pl["room_id"], "name": pl["name"]}
                for pl in per_listing[:10]
            ],
        },
        "monthly_combined": combined,
        "per_listing": per_listing,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")

    # ── CLI digest ─────────────────────────────────────────────────────
    print(f"Competitors with calendar data: {len(per_listing)}")
    print(f"Months covered: {len(combined)}")
    print(f"Occupancy correction factor: {OCCUPANCY_CORRECTION}")
    print()
    print(f"{'Mese':<10}{'ADR':>7}{'Occ%':>7}{'P25%':>7}{'P75%':>7}{'RevPAN':>9}{'#cmp':>6}")
    print("-" * 60)
    for row in combined:
        adr = f"€{int(row['adr_median'])}" if row.get('adr_median') else "—"
        occ = f"{int(row['occupancy_median'] * 100)}%"
        p25 = f"{int(row['occupancy_p25'] * 100)}%"
        p75 = f"{int(row['occupancy_p75'] * 100)}%"
        revpan = f"€{int(row['revpan_median'])}" if row.get('revpan_median') else "—"
        print(f"{row['month_label']:<10}{adr:>7}{occ:>7}{p25:>7}{p75:>7}{revpan:>9}{row['n_competitors_calendar']:>6}")
    print(f"\nWritten {OUT_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
