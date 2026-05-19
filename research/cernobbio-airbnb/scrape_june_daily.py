#!/usr/bin/env python3
"""
Daily-granularity scrape for June 2026 — mirrors scrape_daily.py.
30 sliding 2-night windows, start day = Jun 1 → Jun 30.
"""
from __future__ import annotations

import json
import pathlib
import sys
import time
import traceback
from datetime import datetime, date, timedelta

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

START_DAYS = [date(2026, 6, d) for d in range(1, 31)]
WINDOWS = [(d.isoformat(), (d + timedelta(days=2)).isoformat()) for d in START_DAYS]

OUT_DIR = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "june_daily.json"
LOG_FILE = OUT_DIR / ".june_daily.log"


def log(msg):
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main():
    log(f"30 sliding 2-night windows giugno 2026 (start days 1-30)")
    days = []
    for i, (ci, co) in enumerate(WINDOWS, 1):
        log(f"[{i:>2}/30] {ci} → {co}")
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
            days.append({"start": ci, "end": co, "listings": [], "error": str(exc)})
            continue
        log(f"  → {len(res)} listings")
        days.append({"start": ci, "end": co, "listings": res})
        time.sleep(3)

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "month": "giugno 2026",
            "bbox": {"ne": [NE_LAT, NE_LON], "sw": [SW_LAT, SW_LON]},
            "currency": CURRENCY,
            "windows_count": len(WINDOWS),
            "window_kind": "2-night sliding, start = each day of June 2026",
        },
        "days": days,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")
    total = sum(len(d.get("listings", [])) for d in days)
    unique = len({l.get("room_id") for d in days for l in d.get("listings", [])})
    log(f"DONE — {total} rows / {unique} unique listings")
    return 0


if __name__ == "__main__":
    sys.exit(main())
