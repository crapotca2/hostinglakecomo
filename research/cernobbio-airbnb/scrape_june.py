#!/usr/bin/env python3
"""
Same weekly-windows scraper as scrape_july.py but for June 2026.

June 2026 starts on Monday June 1. We use Wed→Wed windows anchored
on the first Wednesday (June 3) for consistency with the July
dataset. The first window straddles the May→June boundary slightly
but lands the majority of nights in June.
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

NE_LAT, NE_LON = 45.870, 9.110
SW_LAT, SW_LON = 45.825, 9.060
ZOOM = 14
CURRENCY = "EUR"
LANG = "en"
PROXY = ""

WINDOWS = [
    ("Sett. 1 (3-10 giu)",    "2026-06-03", "2026-06-10"),
    ("Sett. 2 (10-17 giu)",   "2026-06-10", "2026-06-17"),
    ("Sett. 3 (17-24 giu)",   "2026-06-17", "2026-06-24"),
    ("Sett. 4 (24 giu-1 lug)","2026-06-24", "2026-07-01"),
]

OUT_DIR = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "june_listings.json"
LOG_FILE = OUT_DIR / ".june.log"


def log(msg):
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main():
    log(f"bbox sw=({SW_LAT},{SW_LON}) ne=({NE_LAT},{NE_LON})")
    log(f"{len(WINDOWS)} weekly windows giugno 2026")
    all_windows = []
    for i, (label, ci, co) in enumerate(WINDOWS, 1):
        log(f"[{i}/{len(WINDOWS)}] {label} ({ci} → {co})")
        try:
            res = pyairbnb.search_all(
                check_in=ci, check_out=co,
                ne_lat=NE_LAT, ne_long=NE_LON,
                sw_lat=SW_LAT, sw_long=SW_LON,
                zoom_value=ZOOM, price_min=0, price_max=0,
                currency=CURRENCY, language=LANG, proxy_url=PROXY,
            )
        except Exception as exc:
            log(f"  FATAL: {exc}")
            traceback.print_exc()
            all_windows.append({"label": label, "check_in": ci, "check_out": co,
                                "listings": [], "error": str(exc)})
            continue
        log(f"  → {len(res)} listings")
        all_windows.append({"label": label, "check_in": ci, "check_out": co,
                            "listings": res})
        time.sleep(5)

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "month": "giugno 2026",
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
    log(f"DONE — {total} rows / {unique} unique listings")
    return 0


if __name__ == "__main__":
    sys.exit(main())
