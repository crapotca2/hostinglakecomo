#!/usr/bin/env python3
"""
Daily-level price scrape for Cernobbio + zone, July 2026.

Issues 30 sliding 2-night search windows (one per starting day, Jul 1-30).
For each listing in each window we extract the per-night rack rate from
the price.break_down line. The result is a matrix listing × start-day.

Why 2-night windows (not 1-night):
    - Many properties enforce >=2-night minimum stays. A 1-night search
      drops them. 2-night is permissive enough to surface ~all of them.
    - The per-night rate we parse is the rack rate per night — invariant
      to whether the window is 1, 2 or 7 nights. So 2-night doesn't bias
      the daily price.

Why not get_calendar:
    - We already tested: `localPriceFormatted` is None for forward-looking
      July days on Airbnb's Merlin calendar endpoint. Only present once a
      check-in/check-out context is set, which is exactly what search_all
      provides.

Runtime: 30 windows × ~5 sec/call + 3 sec polite gap ≈ ~4 minutes.
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

# Same bbox as the weekly scraper — Cernobbio + frazioni first basin
NE_LAT, NE_LON = 45.870, 9.110
SW_LAT, SW_LON = 45.825, 9.060
ZOOM = 14

CURRENCY = "EUR"
LANG = "en"
PROXY = ""

# Build 30 windows: start day = Jul 1 → Jul 30, each window 2 nights
START_DAYS = [date(2026, 7, d) for d in range(1, 31)]
WINDOWS = [(d.isoformat(), (d + timedelta(days=2)).isoformat()) for d in START_DAYS]

OUT_DIR = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "july_daily.json"
LOG_FILE = OUT_DIR / ".daily.log"


def log(msg: str) -> None:
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main() -> int:
    log(f"bbox sw=({SW_LAT},{SW_LON}) ne=({NE_LAT},{NE_LON})")
    log(f"{len(WINDOWS)} sliding 2-night windows, Jul 1 → Jul 30 (start days)")

    days = []
    for i, (ci, co) in enumerate(WINDOWS, 1):
        log(f"[{i:>2}/{len(WINDOWS)}] {ci} → {co}")
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
            days.append({"start": ci, "end": co, "listings": [], "error": str(exc)})
            continue
        log(f"  → {len(res)} listings")
        days.append({"start": ci, "end": co, "listings": res})
        time.sleep(3)  # polite gap

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "bbox": {"ne": [NE_LAT, NE_LON], "sw": [SW_LAT, SW_LON]},
            "currency": CURRENCY,
            "windows_count": len(WINDOWS),
            "window_kind": "2-night sliding, start = each day of July 2026",
        },
        "days": days,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")

    total = sum(len(d.get("listings", [])) for d in days)
    unique = len({l.get("room_id") for d in days for l in d.get("listings", [])})
    log(f"DONE — {total} rows across {len(WINDOWS)} day-windows, {unique} unique listings.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
