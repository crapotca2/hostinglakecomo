#!/usr/bin/env python3
"""
Scrape Cernobbio Airbnb listings for each of 5 weekly windows covering
the whole month of July 2026 (plus 5-day spill into early August).

Why 5 weekly windows instead of 31 single-day searches:
    - Airbnb minimum-stay rules: many luxury villas refuse <2-3 night
      searches → would disappear from a 1-day query.
    - Weekly cadence is the natural booking unit for Cernobbio in
      high season and gives the trend signal we need (early/mid/late
      July deltas) without burning 6x the time.

Output: july_listings.json
    {
      "meta": {scraped_at, windows, bbox, currency},
      "windows": [
        { "label": "Set. 1 — 1-8 lug", "check_in": "2026-07-01",
          "check_out": "2026-07-08", "listings": [...] },
        ...
      ]
    }
"""
from __future__ import annotations

import json
import pathlib
import sys
import time
import traceback
from datetime import datetime

# Windows console encoding fix
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import pyairbnb

# Same bbox as scrape.py — Cernobbio + neighbouring frazioni of the first basin
NE_LAT, NE_LON = 45.870, 9.110
SW_LAT, SW_LON = 45.825, 9.060
ZOOM = 14

CURRENCY = "EUR"
LANG = "en"
PROXY = ""

# 5 windows covering July 2026 in week-on-week succession, Wed → Wed
# anchored on July 1st 2026 (which is a Wednesday).
WINDOWS = [
    ("Sett. 1 (1-8 lug)",    "2026-07-01", "2026-07-08"),
    ("Sett. 2 (8-15 lug)",   "2026-07-08", "2026-07-15"),
    ("Sett. 3 (15-22 lug)",  "2026-07-15", "2026-07-22"),
    ("Sett. 4 (22-29 lug)",  "2026-07-22", "2026-07-29"),
    ("Sett. 5 (29 lug-5 ago)", "2026-07-29", "2026-08-05"),
]

OUT_DIR = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "july_listings.json"
LOG_FILE = OUT_DIR / ".july.log"


def log(msg: str) -> None:
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main() -> int:
    log(f"bbox sw=({SW_LAT},{SW_LON}) ne=({NE_LAT},{NE_LON})")
    log(f"{len(WINDOWS)} weekly windows covering luglio 2026")

    all_windows = []
    for i, (label, ci, co) in enumerate(WINDOWS, 1):
        log(f"[{i}/{len(WINDOWS)}] {label} ({ci} → {co})")
        try:
            res = pyairbnb.search_all(
                check_in=ci, check_out=co,
                ne_lat=NE_LAT, ne_long=NE_LON,
                sw_lat=SW_LAT, sw_long=SW_LON,
                zoom_value=ZOOM,
                price_min=0, price_max=0,
                currency=CURRENCY, language=LANG,
                proxy_url=PROXY,
            )
        except Exception as exc:
            log(f"  FATAL: {exc}")
            traceback.print_exc()
            all_windows.append({
                "label": label, "check_in": ci, "check_out": co,
                "listings": [], "error": str(exc),
            })
            continue

        log(f"  → {len(res)} listings")
        all_windows.append({
            "label": label, "check_in": ci, "check_out": co,
            "listings": res,
        })
        # Polite gap between weekly calls — Airbnb tolerates ~6/min for
        # geographic searches, we're well under that.
        time.sleep(5)

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "bbox": {"ne": [NE_LAT, NE_LON], "sw": [SW_LAT, SW_LON]},
            "currency": CURRENCY,
            "windows_count": len(WINDOWS),
        },
        "windows": all_windows,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")

    total = sum(len(w.get("listings", [])) for w in all_windows)
    unique = len({l.get("room_id") for w in all_windows for l in w.get("listings", [])})
    log(f"DONE — {total} rows across {len(WINDOWS)} windows, {unique} unique listings.")
    log(f"Next: python build_excel.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
