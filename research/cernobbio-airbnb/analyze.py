#!/usr/bin/env python3
"""
Turn listings.json into a flat Excel comp set + summary stats + price histogram.

Output files:
    - comp_set.xlsx        one row per listing, ~25 columns
    - summary.txt          aggregate stats (median ADR, by type, by capacity)
    - price_histogram.png  distribution of price-per-night

Run: python analyze.py  (after scrape.py has produced listings.json)
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from statistics import median, mean

# Windows console encoding fix (same reason as scrape.py)
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import pandas as pd

OUT_DIR  = pathlib.Path(__file__).parent
IN_FILE  = OUT_DIR / "listings.json"
XLSX     = OUT_DIR / "comp_set.xlsx"
SUMMARY  = OUT_DIR / "summary.txt"
HIST_PNG = OUT_DIR / "price_histogram.png"


# Amenities the competitive analysis actually cares about. Each maps to a
# list of substrings — we hit-test against amenity titles/descriptions in
# any language. Lake-view detection is the trickiest: Airbnb stores it as
# both an amenity ("Lake view") and as part of the description.
AMENITY_PROBES = {
    "lake_view":       ["lake view", "vista lago", "vista sul lago"],
    "pool":            ["pool", "piscina"],
    "hot_tub":         ["hot tub", "jacuzzi", "idromassagg", "vasca idromass"],
    "air_conditioning":["air conditioning", "aria condizionata", "ac unit"],
    "parking":         ["free parking", "parcheggio", "parking on premises"],
    "kitchen":         ["kitchen", "cucina"],
    "wifi":            ["wifi", "wi-fi"],
    "washer":          ["washer", "lavatrice"],
    "balcony":         ["balcony", "balcone", "terrace", "terrazza"],
    "elevator":        ["elevator", "ascensore"],
    "beach_access":    ["beachfront", "fronte lago", "waterfront"],
}


def _amenity_text(details: dict) -> str:
    """Flatten the amenities tree into one lowercase blob for substring tests."""
    chunks = []
    for amen in details.get("amenities", []) or []:
        if isinstance(amen, dict):
            chunks.append(str(amen.get("title", "")))
            chunks.append(str(amen.get("subtitle", "")))
            for v in (amen.get("values") or []):
                if isinstance(v, dict):
                    chunks.append(str(v.get("title", "")))
                    chunks.append(str(v.get("subtitle", "")))
                else:
                    chunks.append(str(v))
        else:
            chunks.append(str(amen))
    # Also fold the description so "vista lago mozzafiato" not in amenities
    # gets caught.
    for k in ("description", "html_description", "subtitle"):
        v = details.get(k)
        if isinstance(v, str):
            chunks.append(v)
        elif isinstance(v, dict):
            chunks.append(str(v.get("text") or v.get("description") or ""))
    return " | ".join(chunks).lower()


def _parse_price(search_row: dict, details: dict, nights: int = 7) -> tuple[float | None, float | None]:
    """
    Return (price_per_night, price_total) in EUR.

    Airbnb's search payload places the per-stay total at `price.unit.amount`
    and a break-down line with the rack-rate per night (before discounts):
        price.break_down[0].description = "7 nights x €240.83"

    The corrupted "currency_symbol" you'll see in the raw JSON is mojibake
    from the GraphQL response — it has no impact on the numeric amounts.
    """
    sp = search_row.get("price") or {}
    if not isinstance(sp, dict):
        return None, None

    # Primary: total amount on price.unit.amount (the "stay total")
    total = None
    unit = sp.get("unit") or {}
    if isinstance(unit, dict):
        amt = unit.get("amount")
        if isinstance(amt, (int, float)) and amt > 0:
            total = float(amt)

    # Secondary: parse the first break-down line, which has the pre-discount
    # rack rate per night ("N nights x €X"). Airbnb's GraphQL response uses
    # US/international number format: comma = thousands separator, dot =
    # decimal. "1,000.61" → 1000.61, NOT 1.00061.
    per_night = None
    for ln in sp.get("break_down", []) or []:
        if not isinstance(ln, dict):
            continue
        desc = str(ln.get("description") or "")
        m = re.search(r"(?:nights?|notti)\s*x\s*\D*([\d.,]+)", desc, re.I)
        if m:
            tok = m.group(1)
            # US format: drop commas (thousands), keep dot (decimal)
            clean = tok.replace(",", "")
            try:
                per_night = float(clean)
                break
            except ValueError:
                pass

    # Fallback: divide total by nights
    if per_night is None and total is not None and nights > 0:
        per_night = round(total / nights, 2)

    return per_night, total


def _parse_bed_bath(search_row: dict) -> dict:
    """
    Read bedroom/bed/bath counts from `structuredContent.primaryLine` (and
    its `mapPrimaryLine` twin). Each entry is a labelled MainSectionMessage
    with `type` ∈ {BEDINFO, BATHROOMINFO, OCCUPANCYINFO, GUESTINFO} and
    `body` like "2 bedrooms" / "1.5 baths" / "Sleeps 6".
    """
    out = {"bedrooms": None, "beds": None, "bathrooms": None, "person_capacity": None}
    sc = search_row.get("structuredContent") or {}
    if not isinstance(sc, dict):
        return out
    for line in (sc.get("primaryLine") or []) + (sc.get("secondaryLine") or []):
        if not isinstance(line, dict):
            continue
        body = str(line.get("body") or "")
        kind = str(line.get("type") or "").upper()
        num_match = re.search(r"([\d.]+)", body)
        if not num_match:
            continue
        try:
            num = float(num_match.group(1))
        except ValueError:
            continue
        body_low = body.lower()
        if "bedroom" in body_low or "camera" in body_low:
            out["bedrooms"] = num
        elif "bath" in body_low or "bagn" in body_low:
            out["bathrooms"] = num
        elif "bed" in body_low or "letto" in body_low:
            out["beds"] = num
        elif "guest" in body_low or "sleeps" in body_low or "ospit" in body_low:
            out["person_capacity"] = num
    return out


def _parse_host(search_row: dict) -> dict:
    """
    Pull host-type hints from secondaryLine — strings like:
        "Superhost" / "Business host" / "Hosted by Maria"
    """
    out = {"is_superhost": 0, "is_business": 0, "host_blurb": ""}
    sc = search_row.get("structuredContent") or {}
    blurbs = []
    for line in (sc.get("secondaryLine") or []):
        if not isinstance(line, dict):
            continue
        body = str(line.get("body") or "")
        blurbs.append(body)
        bl = body.lower()
        if "superhost" in bl:
            out["is_superhost"] = 1
        if "business host" in bl or "host professionale" in bl:
            out["is_business"] = 1
    out["host_blurb"] = " | ".join(blurbs)
    return out


def _flatten_one(row: dict, nights: int = 7) -> dict:
    """
    Flatten one enriched listing into a single dataframe row. Works whether
    or not `details` is populated (FETCH_DETAILS=False in scrape.py gives an
    empty details dict).
    """
    search_row = row.get("search_row") or {}
    d = row.get("details") or {}
    coords = search_row.get("coordinates") or {}
    # Airbnb's payload uses the typo "longitud" (no 'e') in some responses.
    lat = coords.get("latitude") if isinstance(coords, dict) else None
    lng = (
        coords.get("longitude") or coords.get("longitud")
        if isinstance(coords, dict) else None
    )

    per_night, total = _parse_price(search_row, d, nights=nights)
    bedbath = _parse_bed_bath(search_row)
    host = _parse_host(search_row)

    # Amenity flags: only useful when we have details. Without them the only
    # signal is the search-row name/title text — better than nothing for
    # "lake" / "view" hits, useless for "pool"/"jacuzzi" which don't appear
    # in titles reliably.
    text_blob = _amenity_text(d) + " | " + (search_row.get("name") or "") + " | " + (search_row.get("title") or "")
    text_blob = text_blob.lower()
    amen_flags = {k: int(any(p in text_blob for p in probes))
                  for k, probes in AMENITY_PROBES.items()}

    rating_obj = search_row.get("rating") or {}
    rating_value = rating_obj.get("value") if isinstance(rating_obj, dict) else None
    review_count = rating_obj.get("reviewCount") if isinstance(rating_obj, dict) else None
    # 0 rating = unrated (new listing), keep as None so it doesn't skew the mean
    if rating_value == 0:
        rating_value = None
    if review_count == 0:
        review_count = None

    out = {
        "room_id":         row.get("room_id"),
        "name":            (search_row.get("name") or "")[:120],
        "type":            search_row.get("title") or "",
        "person_capacity": bedbath["person_capacity"],
        "bedrooms":        bedbath["bedrooms"],
        "beds":            bedbath["beds"],
        "bathrooms":       bedbath["bathrooms"],
        "lat":             lat,
        "lng":             lng,
        "price_night":     per_night,
        "price_total":     total,
        "rating":          rating_value,
        "n_reviews":       review_count,
        "is_superhost":    host["is_superhost"],
        "is_business":     host["is_business"],
        "host_blurb":      host["host_blurb"],
        "url":             f"https://www.airbnb.com/rooms/{row.get('room_id')}",
        **amen_flags,
    }
    return out


def main() -> int:
    if not IN_FILE.exists():
        print(f"missing {IN_FILE} — run scrape.py first", file=sys.stderr)
        return 1
    payload = json.loads(IN_FILE.read_text(encoding="utf-8"))
    listings = payload.get("listings") or []
    meta = payload.get("meta") or {}
    if not listings:
        print("empty listings array", file=sys.stderr)
        return 1

    # Compute number of nights from the scrape window for per-night fallback
    from datetime import datetime as _dt
    try:
        d1 = _dt.fromisoformat(meta.get("check_in"))
        d2 = _dt.fromisoformat(meta.get("check_out"))
        nights = max(1, (d2 - d1).days)
    except Exception:
        nights = 7

    rows = [_flatten_one(r, nights=nights) for r in listings]
    df = pd.DataFrame(rows)

    # Sort for readability
    df = df.sort_values(by=["price_night"], ascending=True, na_position="last")

    # ── Excel ────────────────────────────────────────────────────────────────
    with pd.ExcelWriter(XLSX, engine="openpyxl") as w:
        df.to_excel(w, sheet_name="comp_set", index=False)
        # Summary tab
        summary_rows = []

        def _stat(label, series):
            s = series.dropna()
            if s.empty:
                summary_rows.append([label, 0, None, None, None, None, None])
                return
            summary_rows.append([
                label, len(s),
                round(s.min(), 2), round(s.quantile(0.25), 2),
                round(s.median(), 2), round(s.quantile(0.75), 2),
                round(s.max(), 2),
            ])

        _stat("All listings — €/night",    df["price_night"])
        _stat("All listings — total stay", df["price_total"])
        if "type" in df.columns:
            for rt, sub in df.groupby("type"):
                if not rt:
                    continue
                _stat(f"{rt} — €/night", sub["price_night"])
        # By capacity bucket
        if "person_capacity" in df.columns:
            for label, lo, hi in [("1-2 guests",1,2),("3-4 guests",3,4),
                                  ("5-6 guests",5,6),("7+ guests",7,99)]:
                sub = df[(df["person_capacity"] >= lo) & (df["person_capacity"] <= hi)]
                if len(sub) > 0:
                    _stat(f"{label} — €/night", sub["price_night"])

        sumdf = pd.DataFrame(summary_rows,
                             columns=["scope","n","min","p25","median","p75","max"])
        sumdf.to_excel(w, sheet_name="summary", index=False)

    # ── summary.txt — pretty CLI digest ─────────────────────────────────────
    prices = [r["price_night"] for r in rows if r["price_night"] is not None]
    n_super = sum(r["is_superhost"] for r in rows)
    n_lake  = sum(r["lake_view"] for r in rows)
    n_pool  = sum(r["pool"] for r in rows)
    lines = []
    lines.append(f"Cernobbio Airbnb comp set — {meta.get('check_in')} → {meta.get('check_out')}")
    lines.append(f"  scraped at: {meta.get('scraped_at')}")
    lines.append(f"  total listings: {len(rows)}")
    lines.append("")
    if prices:
        lines.append(f"Price per night ({meta.get('currency','EUR')}):")
        lines.append(f"  count   : {len(prices)}")
        lines.append(f"  min     : {min(prices):>7.0f}")
        lines.append(f"  p25     : {sorted(prices)[len(prices)//4]:>7.0f}")
        lines.append(f"  median  : {median(prices):>7.0f}")
        lines.append(f"  mean    : {mean(prices):>7.0f}")
        lines.append(f"  p75     : {sorted(prices)[3*len(prices)//4]:>7.0f}")
        lines.append(f"  max     : {max(prices):>7.0f}")
        lines.append("")
    lines.append("Amenity / status penetration:")
    lines.append(f"  superhost listings : {n_super:>3}/{len(rows)}  ({100*n_super/max(len(rows),1):.0f}%)")
    lines.append(f"  with lake view     : {n_lake:>3}/{len(rows)}  ({100*n_lake/max(len(rows),1):.0f}%)")
    lines.append(f"  with pool          : {n_pool:>3}/{len(rows)}  ({100*n_pool/max(len(rows),1):.0f}%)")
    lines.append("")
    if prices:
        # Top-5 most expensive listings
        top5 = sorted(rows, key=lambda r: r["price_night"] or 0, reverse=True)[:5]
        lines.append("Top 5 most expensive per night:")
        for r in top5:
            lines.append(f"  €{r['price_night']:>6.0f}/n  {r['name'][:60]}  ({r['room_id']})")
        lines.append("")
        # Bottom-5 cheapest (filter out None)
        bot5 = sorted([r for r in rows if r["price_night"]], key=lambda r: r["price_night"])[:5]
        lines.append("Top 5 cheapest per night:")
        for r in bot5:
            lines.append(f"  €{r['price_night']:>6.0f}/n  {r['name'][:60]}  ({r['room_id']})")

    SUMMARY.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))

    # ── Histogram ────────────────────────────────────────────────────────────
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        if prices:
            plt.figure(figsize=(9, 4.5))
            plt.hist(prices, bins=20, color="#1B7AAF", edgecolor="#0A2540")
            plt.axvline(median(prices), color="#FF7A45", linestyle="--",
                        linewidth=1.5, label=f"median €{median(prices):.0f}")
            plt.title(f"Cernobbio Airbnb — price/night distribution "
                      f"({meta.get('check_in')} → {meta.get('check_out')})")
            plt.xlabel("€ per night")
            plt.ylabel("listings")
            plt.legend()
            plt.tight_layout()
            plt.savefig(HIST_PNG, dpi=130)
            print(f"\n📊  histogram saved: {HIST_PNG}")
    except Exception as exc:
        print(f"  (histogram skipped: {exc})")

    print(f"\n✅  Excel: {XLSX}")
    print(f"✅  Summary: {SUMMARY}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
