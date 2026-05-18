#!/usr/bin/env python3
"""
Cernobbio Airbnb competitive-intel scraper.

Pulls every active listing in the Cernobbio bounding box for a fixed check-in
window, then fetches per-listing details (amenities, host, description). The
output is one JSON dump that analyze.py turns into Excel + stats.

Why pyairbnb (johnbalvin):
    - Talks the StaysSearch GraphQL endpoint directly, not the DOM
    - Uses curl_cffi → impersonates a real Chrome TLS fingerprint
    - Bounding-box geo search → perfect for a single comune
    - MIT license, actively maintained

Honest caveats:
    - These are PUBLIC LIST PRICES, not booking confirmations. Airbnb dynamic
      pricing skews the snapshot.
    - Detail fetch is rate-limited to ~3 sec/listing to stay under the
      anti-bot radar; ~120 listings ≈ 6-7 minutes.
    - This is competitive intelligence, not redistribution. Don't republish
      the raw rows on a public site — use the aggregates (median ADR,
      stagione delta, amenity penetration).
"""
from __future__ import annotations

import json
import pathlib
import sys
import time
import traceback
from datetime import datetime

# Windows default console is cp1252 — force UTF-8 so log lines with arrows
# and emoji don't crash with UnicodeEncodeError.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import pyairbnb

# ── Tuning ────────────────────────────────────────────────────────────────────
# Cernobbio comune bbox (slightly padded so we catch frazioni like Rovenna,
# Piazza Santo Stefano). The Comune di Cernobbio sits between Como city and
# Moltrasio on the western shore of the first basin.
#
# To expand to neighbouring comuni:
#   - Moltrasio   sw=(45.860,9.050) ne=(45.890,9.080)
#   - Carate Urio sw=(45.870,9.040) ne=(45.900,9.070)
#   - Laglio      sw=(45.890,9.030) ne=(45.910,9.060)
NE_LAT, NE_LON = 45.870, 9.110
SW_LAT, SW_LON = 45.825, 9.060
ZOOM = 14

# Mid-July → high season, low cancellation noise (most listings already
# published their summer rates). Change here if you want shoulder/low season.
CHECK_IN  = "2026-07-15"
CHECK_OUT = "2026-07-22"

CURRENCY = "EUR"
LANG     = "en"
PROXY    = ""  # leave empty for residential IP; add proxy URL for repeated runs

# Polite throttle between detail fetches (seconds). Lower = faster, higher
# risk of 429. 3.0 is conservative; 1.5 is the floor I'd dare in one session.
DETAIL_DELAY_SEC = 2.5

# pyairbnb 2.2.1 + curl_cffi 0.15.0 has a regression where get_details() blows
# up on cookie serialization ("'Cookies' object has no attribute 'isoformat'").
# Until upstream patches it, run with FETCH_DETAILS=False — the search rows
# already carry enough for a comp set (price, capacity, rating, coords, name).
FETCH_DETAILS = False

OUT_DIR  = pathlib.Path(__file__).parent
OUT_FILE = OUT_DIR / "listings.json"
LOG_FILE = OUT_DIR / ".run.log"


def log(msg: str) -> None:
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main() -> int:
    log(f"bbox sw=({SW_LAT},{SW_LON}) ne=({NE_LAT},{NE_LON})")
    log(f"date range {CHECK_IN} → {CHECK_OUT}, currency={CURRENCY}")

    # ── 1) Search bounding box ───────────────────────────────────────────────
    log("[1/3] search_all() — querying StaysSearch…")
    try:
        listings = pyairbnb.search_all(
            check_in=CHECK_IN,
            check_out=CHECK_OUT,
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
        log(f"FATAL search_all failed: {exc}")
        traceback.print_exc()
        return 1

    log(f"  → {len(listings)} listings in bbox")
    if not listings:
        log("  (empty result — try widening the bbox or different dates)")
        return 0

    # ── 2) Enrich each with details ──────────────────────────────────────────
    enriched = []
    failed = []
    n = len(listings)

    if not FETCH_DETAILS:
        log(f"[2/3] FETCH_DETAILS=False — using only search_all() rows for {n} listings")
        for item in listings:
            room_id = item.get("room_id") or item.get("id")
            if not room_id:
                failed.append({"reason": "no room_id", "row": item})
                continue
            enriched.append({
                "room_id": int(room_id),
                "search_row": item,
                "details": {},  # placeholder; analyze.py handles empty details
            })
    else:
        log(f"[2/3] get_details() × {n} listings (rate-limited {DETAIL_DELAY_SEC}s)")
        for i, item in enumerate(listings, 1):
            room_id = item.get("room_id") or item.get("id")
            if not room_id:
                failed.append({"reason": "no room_id in search row", "row": item})
                continue
            try:
                details = pyairbnb.get_details(
                    room_id=int(room_id),
                    check_in=CHECK_IN,
                    check_out=CHECK_OUT,
                    currency=CURRENCY,
                    language=LANG,
                    proxy_url=PROXY,
                )
            except Exception as exc:
                failed.append({"room_id": room_id, "reason": str(exc)})
                print(f"  {i:>3}/{n}  ✗ {room_id}: {exc}", flush=True)
                time.sleep(DETAIL_DELAY_SEC)
                continue

            merged = {
                "room_id": int(room_id),
                "search_row": item,
                "details": details,
            }
            enriched.append(merged)
            # Compact progress line — title + price if available
            title = (details.get("title") or item.get("name") or "?")[:42]
            price = item.get("price", {})
            ptxt = price.get("price") if isinstance(price, dict) else price
            print(f"  {i:>3}/{n}  ✓ {room_id:>10}  {ptxt}  {title}", flush=True)
            time.sleep(DETAIL_DELAY_SEC)

    # ── 3) Dump JSON ─────────────────────────────────────────────────────────
    log(f"[3/3] write {OUT_FILE}")
    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "check_in": CHECK_IN,
            "check_out": CHECK_OUT,
            "bbox": {"ne": [NE_LAT, NE_LON], "sw": [SW_LAT, SW_LON]},
            "currency": CURRENCY,
            "total_found": len(listings),
            "total_enriched": len(enriched),
            "total_failed": len(failed),
        },
        "listings": enriched,
        "failures": failed,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")

    log(f"DONE — {len(enriched)}/{len(listings)} enriched, {len(failed)} failed.")
    log(f"Next: python analyze.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
