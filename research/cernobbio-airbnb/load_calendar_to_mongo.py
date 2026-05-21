#!/usr/bin/env python3
"""
Load argegno_calendar.json + argegno_intel_combined.json into MongoDB
collections that the Next.js dashboard reads.

Collections populated (idempotent upsert on natural keys):
  - competitor_listings           (one per airbnbRoomId)
  - competitor_calendar           (one per (airbnbRoomId, date))
  - competitor_monthly_stats      (one per (airbnbRoomId, monthKey))
  - competitor_zone_stats         (one per (zone, monthKey))

Idempotency rules:
  - listing: lastSeenAt updated each run, firstSeenAt only on insert,
    isActive=True. Listings missing from this run keep their state
    untouched (no soft-delete; we expect re-scrape to fix any gaps).
  - calendar snapshot: full replace on (room_id, date). scrapedAt =
    now() so the dashboard can show data freshness.
  - monthly stats: same logic, replace on (room_id, monthKey).
  - zone stats: replace on (zone, monthKey).

Requirements:
  pip install pymongo python-dotenv

Reads MONGODB_URI + MONGODB_DB from a .env file at repo root (or env).
"""
from __future__ import annotations

import json
import os
import pathlib
import sys
from datetime import datetime

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

try:
    from pymongo import MongoClient, UpdateOne
    from pymongo.errors import BulkWriteError
except ImportError:
    print("pymongo missing. Run: pip install pymongo python-dotenv", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # optional, env vars can be set externally


HERE = pathlib.Path(__file__).parent
REPO_ROOT = HERE.parent.parent  # research/cernobbio-airbnb → repo root
CAL_SRC = HERE / "argegno_calendar.json"
COMBINED_SRC = HERE / "argegno_intel_combined.json"

ZONE = "argegno"


def get_db():
    if load_dotenv:
        # Try both .env and .env.local
        load_dotenv(REPO_ROOT / ".env")
        load_dotenv(REPO_ROOT / ".env.local", override=True)

    uri = os.environ.get("MONGODB_URI")
    db_name = os.environ.get("MONGODB_DB", "air_bibby")

    if not uri:
        print("MONGODB_URI not set in env (.env.local). Aborting.", file=sys.stderr)
        sys.exit(1)

    client = MongoClient(uri)
    return client[db_name]


def load_listings(db, competitors: list[dict]) -> dict[str, str]:
    """
    Upsert competitor_listings. Returns {airbnbRoomId: _id_string} so
    downstream collections can reference the ObjectId.
    """
    col = db["competitor_listings"]
    now = datetime.utcnow()
    ops = []
    for c in competitors:
        rid = str(c["room_id"])
        doc = {
            "airbnbRoomId": rid,
            "zone": ZONE,
            "name": c.get("name", ""),
            "url": f"https://www.airbnb.com/rooms/{rid}",
            "lat": c.get("lat"),
            "lng": c.get("lon") or c.get("lng"),
            "bedrooms": c.get("bedrooms"),
            "maxGuests": c.get("guests"),
            "isActive": True,
            "lastSeenAt": now,
            "updatedAt": now,
        }
        ops.append(UpdateOne(
            {"airbnbRoomId": rid},
            {
                "$set": doc,
                "$setOnInsert": {"firstSeenAt": now, "createdAt": now},
            },
            upsert=True,
        ))
    if ops:
        try:
            col.bulk_write(ops, ordered=False)
        except BulkWriteError as exc:
            print(f"listings bulk error: {exc.details}", file=sys.stderr)

    # Map room_id → ObjectId for FK propagation
    id_map = {}
    for doc in col.find({"zone": ZONE}, {"airbnbRoomId": 1}):
        id_map[doc["airbnbRoomId"]] = doc["_id"]
    return id_map


def load_calendar(db, competitors: list[dict], id_map: dict) -> int:
    """Upsert daily calendar snapshots. Returns rows affected."""
    col = db["competitor_calendar"]
    now = datetime.utcnow()
    ops = []
    for c in competitors:
        rid = str(c["room_id"])
        listing_id = id_map.get(rid)
        if not listing_id:
            continue
        for d in c.get("calendar", []) or []:
            try:
                date_obj = datetime.fromisoformat(d["date"])
            except (ValueError, KeyError, TypeError):
                continue
            doc = {
                "competitorListingId": listing_id,
                "airbnbRoomId": rid,
                "date": date_obj,
                "available": bool(d.get("available")),
                "minNights": d.get("min_nights"),
                "maxNights": d.get("max_nights"),
                "scrapedAt": now,
                "updatedAt": now,
            }
            ops.append(UpdateOne(
                {"airbnbRoomId": rid, "date": date_obj},
                {"$set": doc, "$setOnInsert": {"createdAt": now}},
                upsert=True,
            ))
            # Flush in chunks to avoid 16MB BSON limit on bulk_write
            if len(ops) >= 1000:
                try:
                    col.bulk_write(ops, ordered=False)
                except BulkWriteError as exc:
                    print(f"calendar bulk error (partial): {exc.details}",
                          file=sys.stderr)
                ops = []
    if ops:
        try:
            col.bulk_write(ops, ordered=False)
        except BulkWriteError as exc:
            print(f"calendar bulk error (final): {exc.details}", file=sys.stderr)
    return col.count_documents({"airbnbRoomId": {"$in": list(id_map.keys())}})


def load_monthly_stats(db, per_listing: list[dict], id_map: dict) -> int:
    """Upsert competitor_monthly_stats from the per_listing block of intel_combined."""
    col = db["competitor_monthly_stats"]
    now = datetime.utcnow()
    ops = []
    for pl in per_listing:
        rid = str(pl["room_id"])
        listing_id = id_map.get(rid)
        if not listing_id:
            continue
        for month_key, stats in (pl.get("monthly") or {}).items():
            doc = {
                "competitorListingId": listing_id,
                "airbnbRoomId": rid,
                "zone": ZONE,
                "monthKey": month_key,
                "daysSeen": stats["days_seen"],
                "unavailableDays": stats["unavailable_days"],
                "occupancyRaw": stats["occupancy_raw"],
                "occupancyCorrected": stats["occupancy_corrected"],
                "correctionFactor": 0.85,
                "computedAt": now,
                "updatedAt": now,
            }
            ops.append(UpdateOne(
                {"airbnbRoomId": rid, "monthKey": month_key},
                {"$set": doc, "$setOnInsert": {"createdAt": now}},
                upsert=True,
            ))
    if ops:
        try:
            col.bulk_write(ops, ordered=False)
        except BulkWriteError as exc:
            print(f"monthly stats bulk error: {exc.details}", file=sys.stderr)
    return len(ops)


def load_zone_stats(db, monthly_combined: list[dict]) -> int:
    """Upsert competitor_zone_stats: one row per (zone, monthKey)."""
    col = db["competitor_zone_stats"]
    now = datetime.utcnow()
    ops = []
    for row in monthly_combined:
        doc = {
            "zone": ZONE,
            "monthKey": row["month_key"],
            "monthLabel": row["month_label"],
            "nCompetitorsCalendar": row["n_competitors_calendar"],
            "nListingsPriceSample": row.get("n_listings_price_sample"),
            "occupancyMedian": row["occupancy_median"],
            "occupancyP25": row["occupancy_p25"],
            "occupancyP75": row["occupancy_p75"],
            "occupancyRawMedian": row["occupancy_raw_median"],
            "adrMedian": row.get("adr_median"),
            "adrMeanClipped": row.get("adr_mean_clipped"),
            "revpanMedian": row.get("revpan_median"),
            "computedAt": now,
            "updatedAt": now,
        }
        ops.append(UpdateOne(
            {"zone": ZONE, "monthKey": row["month_key"]},
            {"$set": doc, "$setOnInsert": {"createdAt": now}},
            upsert=True,
        ))
    if ops:
        try:
            col.bulk_write(ops, ordered=False)
        except BulkWriteError as exc:
            print(f"zone stats bulk error: {exc.details}", file=sys.stderr)
    return len(ops)


def main() -> int:
    if not CAL_SRC.exists():
        print(f"missing {CAL_SRC} — run scrape_argegno_calendar.py first",
              file=sys.stderr)
        return 1
    if not COMBINED_SRC.exists():
        print(f"missing {COMBINED_SRC} — run analyze_calendar_occupancy.py first",
              file=sys.stderr)
        return 1

    db = get_db()
    print(f"connected to MongoDB db={db.name}")

    cal_data = json.loads(CAL_SRC.read_text(encoding="utf-8"))
    combined = json.loads(COMBINED_SRC.read_text(encoding="utf-8"))

    competitors = cal_data.get("competitors", [])
    per_listing = combined.get("per_listing", [])
    monthly_combined = combined.get("monthly_combined", [])

    print(f"loading {len(competitors)} listings…")
    id_map = load_listings(db, competitors)
    print(f"  → {len(id_map)} listings upserted")

    print(f"loading calendar snapshots…")
    n_cal = load_calendar(db, competitors, id_map)
    print(f"  → ~{n_cal} calendar rows in collection (zone={ZONE})")

    print(f"loading per-listing monthly stats…")
    n_monthly = load_monthly_stats(db, per_listing, id_map)
    print(f"  → {n_monthly} monthly stats upserted")

    print(f"loading zone-level stats…")
    n_zone = load_zone_stats(db, monthly_combined)
    print(f"  → {n_zone} zone-month rows upserted")

    print("DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
