#!/usr/bin/env python3
"""
Argegno Airbnb monthly pricing snapshot — 12 windows (Jun 2026 → May 2027).

For each month we pick a representative mid-month week (Sat→Sat), run
StaysSearch on the Argegno bounding box, and dump per-listing nightly
prices. Output: one JSON with prices per month per listing.

This replaces the hand-rolled "Casa Hygge €210" estimates in the demo
dashboard with real Airbnb list prices.

Honest caveats (same as scrape.py):
    - These are PUBLIC LIST PRICES, not booking confirmations. Airbnb
      dynamic pricing skews the snapshot.
    - One week per month is a sample, not a full distribution.
    - This is competitive intelligence, not redistribution. The aggregated
      median ADR per month can go in the dashboard; the raw rows stay
      internal.
"""
from __future__ import annotations

import json
import pathlib
import sys
import time
import traceback
from datetime import datetime

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import pyairbnb

# ── Bounding box: comune di Argegno + frazione lago/lungo Telo ───────────────
# Argegno paese ~ 45.866N 9.123E. Box leggermente largo per catturare i
# listing alle frazioni storiche (Sant'Anna alta, Riva, lungo Telo).
NE_LAT, NE_LON = 45.880, 9.140
SW_LAT, SW_LON = 45.855, 9.110
ZOOM = 14

CURRENCY = "EUR"
LANG     = "en"
PROXY    = ""

# 12 finestre mensili: prendiamo una settimana centrale (sabato → sabato).
# Le date sono 2026 → 2027 perché siamo a maggio 2026.
WINDOWS = [
    # (label, check_in, check_out)
    ("Giu 2026", "2026-06-13", "2026-06-20"),
    ("Lug 2026", "2026-07-11", "2026-07-18"),
    ("Ago 2026", "2026-08-15", "2026-08-22"),
    ("Set 2026", "2026-09-12", "2026-09-19"),
    ("Ott 2026", "2026-10-10", "2026-10-17"),
    ("Nov 2026", "2026-11-14", "2026-11-21"),
    ("Dic 2026", "2026-12-12", "2026-12-19"),
    ("Gen 2027", "2027-01-17", "2027-01-24"),
    ("Feb 2027", "2027-02-14", "2027-02-21"),
    ("Mar 2027", "2027-03-14", "2027-03-21"),
    ("Apr 2027", "2027-04-17", "2027-04-24"),
    ("Mag 2027", "2027-05-15", "2027-05-22"),
]

# Polite throttle between windows.
WINDOW_DELAY_SEC = 4.0

OUT_DIR  = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "argegno_monthly.json"
LOG_FILE = OUT_DIR / ".argegno_monthly.log"


def log(msg: str) -> None:
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main() -> int:
    log(f"bbox sw=({SW_LAT},{SW_LON}) ne=({NE_LAT},{NE_LON})")
    log(f"windows: {len(WINDOWS)} monthly samples Jun 2026 → May 2027")

    all_results = []
    for i, (label, ci, co) in enumerate(WINDOWS, 1):
        log(f"[{i}/{len(WINDOWS)}] {label}  {ci} → {co}")
        try:
            listings = pyairbnb.search_all(
                check_in=ci,
                check_out=co,
                ne_lat=NE_LAT, ne_long=NE_LON,
                sw_lat=SW_LAT, sw_long=SW_LON,
                zoom_value=ZOOM,
                price_min=0,
                price_max=0,
                currency=CURRENCY,
                language=LANG,
                proxy_url=PROXY,
            )
        except Exception as exc:
            log(f"  ✗ search_all failed: {exc}")
            traceback.print_exc()
            listings = []

        log(f"  → {len(listings)} listings")
        all_results.append({
            "window": label,
            "check_in": ci,
            "check_out": co,
            "listings": listings,
        })
        time.sleep(WINDOW_DELAY_SEC)

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "bbox": {"ne": [NE_LAT, NE_LON], "sw": [SW_LAT, SW_LON]},
            "currency": CURRENCY,
            "windows": len(WINDOWS),
            "total_listings_sum": sum(len(w["listings"]) for w in all_results),
        },
        "windows": all_results,
    }
    OUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    log(f"DONE — written {OUT_FILE}")
    log(f"Total listings across all windows: {payload['meta']['total_listings_sum']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
