"""Search Wikimedia Commons for free-licence photos per product and save
candidate thumbnails + metadata for manual review.
Usage: python3 scripts/find-photos.py OUTDIR"""
import json, os, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "CartivaShop/1.0 (local dev; contact: admin@cartiva.com)"}
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

QUERIES = {
 "wireless-noise-cancelling-headphones": "over-ear headphones",
 "smart-fitness-watch": "smartwatch on wrist",
 "portable-bluetooth-speaker": "portable bluetooth speaker",
 "ultra-slim-laptop-14-inch": "laptop computer on desk",
 "lightweight-running-shoes": "running shoes sneakers",
 "classic-cotton-t-shirt": "plain t-shirt",
 "windproof-casual-jacket": "jacket outerwear",
 "polarised-sunglasses": "sunglasses",
 "modern-table-lamp": "table lamp",
 "electric-kettle-1-8l": "electric kettle",
 "non-stick-frying-pan": "frying pan",
 "memory-foam-pillow": "pillow bed",
 "daily-moisturising-cream": "cosmetic cream",
 "eau-de-parfum-50ml": "perfume bottle",
 "matte-lipstick": "lipstick",
 "vitamin-c-face-serum": "dropper bottle",
 "adjustable-dumbbell-set": "dumbbells",
 "anti-slip-yoga-mat": "yoga mat",
 "insulated-water-bottle-1l": "stainless steel water bottle",
 "match-football-size-5": "football soccer ball",
 "the-art-of-focus-paperback": "paperback book",
 "hardcover-ruled-notebook": "notebook",
 "premium-gel-pen-set-of-5": "gel pens",
 "everyday-laptop-backpack": "backpack",
}
OK = ("CC0", "Public domain", "PD", "CC BY 2", "CC BY 3", "CC BY 4", "CC BY-SA 2", "CC BY-SA 3", "CC BY-SA 4")

def get(url):
    for i in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        except Exception as e:
            time.sleep(2 * (i + 1))
    return None

meta = {}
ONLY = sys.argv[2:] 
for slug, q in QUERIES.items():
    if ONLY and slug not in ONLY: continue
    params = urllib.parse.urlencode({
        "action": "query", "generator": "search", "gsrnamespace": 6, "gsrlimit": 30,
        "gsrsearch": q + " filetype:bitmap", "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 320, "format": "json"})
    raw = get("https://commons.wikimedia.org/w/api.php?" + params)
    cands = []
    if raw:
        for p in json.loads(raw).get("query", {}).get("pages", {}).values():
            i = p["imageinfo"][0]; m = i["extmetadata"]
            lic = m.get("LicenseShortName", {}).get("value", "")
            if i["mime"] not in ("image/jpeg", "image/png") or i["width"] < 900 or not lic.startswith(OK):
                continue
            cands.append({"title": p["title"], "lic": lic, "w": i["width"], "h": i["height"],
                          "thumb": i["thumburl"], "url": i["url"], "page": i["descriptionurl"],
                          "artist": m.get("Artist", {}).get("value", ""), "index": p.get("index", 99)})
    cands.sort(key=lambda c: c["index"])
    cands = cands[:8]
    d = os.path.join(OUT, slug); os.makedirs(d, exist_ok=True)
    for n, c in enumerate(cands):
        b = get(c["thumb"])
        if b: open(os.path.join(d, f"{n}.jpg"), "wb").write(b)
        time.sleep(0.4)
    meta[slug] = cands
    print(slug, len(cands), flush=True)
path = os.path.join(OUT, "candidates.json")
old = json.load(open(path)) if os.path.exists(path) else {}
old.update(meta)
json.dump(old, open(path, "w"), indent=1)
