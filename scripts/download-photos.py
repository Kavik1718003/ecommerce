"""Download the chosen Commons photos (800px) into frontend/image/products
and write frontend/image/CREDITS.json. Usage: download-photos.py CANDIDATES_DIR"""
import json, os, re, sys, time, html, urllib.request
from PIL import Image
import io

UA = {"User-Agent": "CartivaShop/1.0 (local dev; contact: admin@cartiva.com)"}
CAND = json.load(open(os.path.join(sys.argv[1], "candidates.json")))
PICKS = {
 "wireless-noise-cancelling-headphones": 0, "smart-fitness-watch": 5, "portable-bluetooth-speaker": 2,
 "ultra-slim-laptop-14-inch": 0, "lightweight-running-shoes": 1, "classic-cotton-t-shirt": 0,
 "windproof-casual-jacket": 0, "polarised-sunglasses": 3, "modern-table-lamp": 4,
 "electric-kettle-1-8l": 0, "non-stick-frying-pan": 4, "memory-foam-pillow": 1,
 "daily-moisturising-cream": 0, "eau-de-parfum-50ml": 6, "matte-lipstick": 3,
 "vitamin-c-face-serum": 2, "adjustable-dumbbell-set": 7, "anti-slip-yoga-mat": 5,
 "insulated-water-bottle-1l": 0, "match-football-size-5": 6, "the-art-of-focus-paperback": 2,
 "hardcover-ruled-notebook": 5, "premium-gel-pen-set-of-5": 5, "everyday-laptop-backpack": 5,
}
OUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "image")
def get(url):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except Exception: time.sleep(3 * (i + 1))
credits = {}
for slug, n in PICKS.items():
    c = CAND[slug][n]
    url = re.sub(r"/\d+px-", "/960px-", c["thumb"])
    b = get(url)
    im = Image.open(io.BytesIO(b)).convert("RGB")
    im.thumbnail((800, 800))
    # square-ish crop keeps cards consistent
    w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)) if abs(w - h) / max(w, h) < 0.35 else im
    im.save(os.path.join(OUT, "products", slug + ".jpg"), quality=84, optimize=True)
    artist = re.sub(r"<[^>]+>", "", html.unescape(c["artist"])).strip()
    credits[slug] = {"title": c["title"].replace("File:", ""), "author": artist, "license": c["lic"], "source": c["page"]}
    print(slug, im.size, c["lic"], flush=True)
    time.sleep(0.6)
json.dump(credits, open(os.path.join(OUT, "CREDITS.json"), "w"), indent=1, ensure_ascii=False)
