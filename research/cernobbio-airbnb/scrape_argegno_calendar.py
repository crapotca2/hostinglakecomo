#!/usr/bin/env python3
"""
Argegno competitor CALENDAR scrape — 12 months forward, day-by-day
availability per competitor listing.

Why this is different from scrape_argegno_monthly.py:
    - monthly = one search window per month → captures PRICE at sample dates
    - calendar = pyairbnb.get_calendar(room_id) per listing → captures
      AVAILABILITY day-by-day for the next ~365 days

Combining the two we can compute the only competitive intel that matters
for pricing strategy: per-month OCCUPANCY RATE per competitor.

Methodology caveat (same as AirDNA / AirBtics):
    Calendar "unavailable" days include BOTH actual bookings AND host
    personal blocks / maintenance / advance-booking limits. Industry
    estimate: ~70-80% of "no" days are real bookings. So the occupancy
    we compute slightly OVERESTIMATES reality. We apply a 0.85 correction
    in analyze_calendar_occupancy.py.

Output: argegno_calendar.json — one entry per scraped room_id with
{ room_id, name, scraped_at, days: [{date, available, min_nights}, ...] }

Runtime: ~3 sec per listing × N. For 20-30 competitors expect 1-2 min.
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

# ── Source of competitor list ────────────────────────────────────────────────
# We don't hardcode room_ids (they go stale — see analyze_argegno.py history).
# Instead, we auto-discover from the most recent monthly scrape, keeping
# only listings that match the competitor profile for Casa del Pozzo.

OUT_DIR = pathlib.Path(__file__).parent
MONTHLY_SRC = OUT_DIR / "argegno_monthly.json"
OUT_FILE = OUT_DIR / "argegno_calendar.json"
LOG_FILE = OUT_DIR / ".argegno_calendar.log"

# ── Filters for the competitor profile (Casa del Pozzo benchmark) ────────────
# Argegno paese centro storico — match the analyze_argegno.py polygon
TARGET_LAT_MIN, TARGET_LAT_MAX = 45.860, 45.880
TARGET_LON_MIN, TARGET_LON_MAX = 9.110, 9.135

# Casa del Pozzo is 2 cam / 4 ospiti — benchmark against 1-3 bedrooms and
# 2-6 guests so we have a fair comparable set (not luxury villas, not
# studios).
TARGET_BEDROOMS_MIN, TARGET_BEDROOMS_MAX = 1, 3
TARGET_GUESTS_MIN, TARGET_GUESTS_MAX = 2, 6

# Cap on how many we calendar-scrape (rate limit, polite to Airbnb)
MAX_COMPETITORS = 30

# Throttle between get_calendar() calls
DELAY_SEC = 3.0

# Currency + lang are not strictly required for get_calendar (returns
# only availability + minStay), but pyairbnb wants them
CURRENCY = "EUR"
LANG = "en"
PROXY = ""


def log(msg: str) -> None:
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def _parse_bedrooms_guests(item: dict) -> tuple[int | None, int | None]:
    """
    Extract (bedrooms, guests) from the same structuredContent shape that
    analyze.py uses. Defensive — these fields are flaky.
    """
    sc = item.get("structuredContent") or {}
    if not isinstance(sc, dict):
        return None, None
    bedrooms = None
    guests = None
    for line in (sc.get("primaryLine") or []) + (sc.get("secondaryLine") or []):
        if not isinstance(line, dict):
            continue
        body = str(line.get("body") or "").lower()
        # Extract leading number
        num = None
        for tok in body.split():
            try:
                num = int(float(tok.replace(",", "")))
                break
            except ValueError:
                continue
        if num is None:
            continue
        if "bedroom" in body or "camera" in body:
            bedrooms = num
        elif "guest" in body or "ospit" in body or "sleeps" in body:
            guests = num
    return bedrooms, guests


def _coords(item: dict) -> tuple[float | None, float | None]:
    c = item.get("coordinates") or {}
    lat = c.get("latitude")
    # Airbnb typo "longitud" in some responses
    lon = c.get("longitud") or c.get("longitude")
    return lat, lon


def _in_polygon(lat: float | None, lon: float | None) -> bool:
    if lat is None or lon is None:
        return False
    return (
        TARGET_LAT_MIN <= lat <= TARGET_LAT_MAX
        and TARGET_LON_MIN <= lon <= TARGET_LON_MAX
    )


def select_competitors() -> list[dict]:
    """
    Build a deduplicated list of competitor room_ids from
    argegno_monthly.json, filtered to the Casa del Pozzo profile.
    Picks the first window that has data so we have a stable sample.
    """
    if not MONTHLY_SRC.exists():
        log(f"FATAL: {MONTHLY_SRC} not found. Run scrape_argegno_monthly.py first.")
        sys.exit(1)

    payload = json.loads(MONTHLY_SRC.read_text(encoding="utf-8"))
    seen: dict[int, dict] = {}

    for w in payload.get("windows", []):
        for item in w.get("listings", []):
            rid = item.get("room_id")
            if not rid or rid in seen:
                continue
            lat, lon = _coords(item)
            if not _in_polygon(lat, lon):
                continue
            bedrooms, guests = _parse_bedrooms_guests(item)
            if bedrooms is not None and not (TARGET_BEDROOMS_MIN <= bedrooms <= TARGET_BEDROOMS_MAX):
                continue
            if guests is not None and not (TARGET_GUESTS_MIN <= guests <= TARGET_GUESTS_MAX):
                continue
            seen[rid] = {
                "room_id": rid,
                "name": (item.get("name") or item.get("title") or "")[:100],
                "lat": lat,
                "lon": lon,
                "bedrooms": bedrooms,
                "guests": guests,
            }

    competitors = list(seen.values())[:MAX_COMPETITORS]
    return competitors


def fetch_calendar(room_id: int) -> list[dict] | None:
    """
    Call pyairbnb.get_calendar(room_id) and return a flat list of
    { date, available, min_nights, max_nights } dicts.

    pyairbnb returns a months-keyed structure; we flatten and skip days
    without a 'date' key (some payloads pad with nulls).
    """
    try:
        cal = pyairbnb.get_calendar(
            room_id=int(room_id),
            currency=CURRENCY,
            language=LANG,
            proxy_url=PROXY,
        )
    except Exception as exc:
        log(f"  ✗ get_calendar({room_id}) failed: {exc}")
        traceback.print_exc()
        return None

    days: list[dict] = []
    # pyairbnb shape: { "calendar_months": [{ "days": [...] }, ...] } or
    # similar; defensive parsing handles both shapes
    months = cal.get("calendar_months") or cal.get("months") or []
    if not months and isinstance(cal, list):
        # raw list of days
        months = [{"days": cal}]

    for month in months:
        for d in month.get("days", []) or []:
            if not isinstance(d, dict):
                continue
            date_str = d.get("calendar_date") or d.get("date") or d.get("dateString")
            if not date_str:
                continue
            days.append({
                "date": date_str,
                "available": bool(d.get("available", False) or d.get("bookable", False)),
                "min_nights": d.get("min_nights") or d.get("minNights"),
                "max_nights": d.get("max_nights") or d.get("maxNights"),
            })
    return days


def main() -> int:
    log("selecting competitors from argegno_monthly.json …")
    competitors = select_competitors()
    log(f"  → {len(competitors)} competitor candidates "
        f"(filters: {TARGET_BEDROOMS_MIN}-{TARGET_BEDROOMS_MAX} cam, "
        f"{TARGET_GUESTS_MIN}-{TARGET_GUESTS_MAX} ospiti, "
        f"in poligono Argegno paese)")

    if not competitors:
        log("FATAL: no competitor matches the filters. Widen the bbox or "
            "adjust BEDROOMS/GUESTS limits.")
        return 1

    results = []
    fail_count = 0
    for i, c in enumerate(competitors, 1):
        log(f"[{i}/{len(competitors)}] get_calendar room_id={c['room_id']} "
            f"({c['name'][:50]})")
        days = fetch_calendar(c["room_id"])
        if days is None:
            fail_count += 1
            results.append({**c, "calendar": [], "error": "fetch failed"})
            time.sleep(DELAY_SEC)
            continue
        log(f"  → {len(days)} days fetched, "
            f"{sum(1 for d in days if d['available'])} available")
        results.append({**c, "calendar": days})
        time.sleep(DELAY_SEC)

    payload = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "competitors_attempted": len(competitors),
            "competitors_succeeded": len(competitors) - fail_count,
            "competitors_failed": fail_count,
            "polygon": {
                "lat": [TARGET_LAT_MIN, TARGET_LAT_MAX],
                "lon": [TARGET_LON_MIN, TARGET_LON_MAX],
            },
            "filters": {
                "bedrooms": [TARGET_BEDROOMS_MIN, TARGET_BEDROOMS_MAX],
                "guests": [TARGET_GUESTS_MIN, TARGET_GUESTS_MAX],
            },
        },
        "competitors": results,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                        encoding="utf-8")
    log(f"DONE — {len(results)} competitors written to {OUT_FILE} "
        f"({fail_count} failed)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
