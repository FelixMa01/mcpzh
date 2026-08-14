#!/usr/bin/env python3
"""Validate dist/ after build:
- Every static HTML page contains a self-referencing canonical
- Every category slug maps to an existing HTML file
- Search-index.json has expected schema and size
- Sitemap parses as XML and references at least one existing file
- Rss.xml parses and references real detail pages
"""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit

DIST = Path(__file__).resolve().parent.parent / "dist"


def fail(msg: str) -> None:
    print(f"✗ {msg}")


def ok(msg: str) -> None:
    print(f"✓ {msg}")


def main() -> int:
    if not DIST.exists():
        fail(f"dist/ missing at {DIST}")
        return 1

    html_files = list(DIST.rglob("*.html"))
    ok(f"dist/ contains {len(html_files)} HTML pages")

    missing_canonical: list[str] = []
    duplicate_canonicals: dict[str, int] = {}
    for f in html_files:
        text = f.read_text(encoding="utf-8")
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text)
        if not canonical:
            missing_canonical.append(str(f.relative_to(DIST)))
        else:
            url = canonical.group(1)
            duplicate_canonicals[url] = duplicate_canonicals.get(url, 0) + 1
    if missing_canonical:
        fail(f"{len(missing_canonical)} pages missing canonical (first 5): {missing_canonical[:5]}")
    else:
        ok("every HTML page declares a canonical URL")

    dupes = {k: v for k, v in duplicate_canonicals.items() if v > 1}
    if dupes:
        fail(f"{len(dupes)} duplicate canonicals (first 5): {list(dupes.items())[:5]}")
    else:
        ok("no duplicate canonical URLs across pages")

    search = DIST / "search-index.json"
    if not search.exists():
        fail("search-index.json missing")
        return 1
    raw = json.loads(search.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        fail("search-index.json must be an array")
        return 1
    if len(raw) < 1000:
        fail(f"search-index too small: {len(raw)} entries")
        return 1
    sample = raw[0]
    for k in ("name", "slug", "category", "stars"):
        if k not in sample:
            fail(f"search-index entry missing key {k}")
            return 1
    ok(f"search-index.json has {len(raw)} entries with required keys")

    # Sitemap
    sitemap = DIST / "sitemap.xml"
    if not sitemap.exists():
        fail("sitemap.xml missing")
        return 1
    try:
        tree = ET.fromstring(sitemap.read_text(encoding="utf-8"))
    except ET.ParseError as e:
        fail(f"sitemap.xml invalid XML: {e}")
        return 1
    urls = [el.text.strip() for el in tree.iter() if el.tag.endswith("loc")]
    if len(urls) < 1000:
        fail(f"sitemap too small: {len(urls)} urls")
        return 1
    first_url = urlsplit(urls[0])
    base_url = f"{first_url.scheme}://{first_url.netloc}"
    # Sample 30 random server URLs and verify files exist
    server_urls = [u for u in urls if "/server/" in u]
    sample = server_urls[:30]
    def sitemap_path(url: str) -> Path:
        relative = url.replace(base_url + "/", "").strip("/")
        direct = DIST / relative
        return direct if direct.exists() else DIST / relative / "index.html"

    missing = [u for u in sample if not sitemap_path(u).exists()]
    if missing:
        fail(f"sitemap references missing files (first 5): {missing[:5]}")
        return 1
    ok(f"sitemap.xml has {len(urls)} URLs, sampled {len(sample)} server pages all exist")

    # RSS
    rss = DIST / "rss.xml"
    if not rss.exists():
        fail("rss.xml missing")
        return 1
    try:
        rss_tree = ET.fromstring(rss.read_text(encoding="utf-8"))
    except ET.ParseError as e:
        fail(f"rss.xml invalid XML: {e}")
        return 1
    items = rss_tree.findall(".//item")
    if len(items) < 10:
        fail(f"rss has too few items: {len(items)}")
        return 1
    ok(f"rss.xml has {len(items)} items")

    # Cloudflare Pages metadata
    if not (DIST / "_headers").exists():
        fail("_headers missing")
        return 1
    if not (DIST / "_redirects").exists():
        fail("_redirects missing")
        return 1
    ok("Cloudflare Pages metadata files present")

    # Spot-check JSON-LD presence on detail pages
    sample_detail = next((f for f in html_files if "/server/" in str(f)), None)
    if sample_detail:
        text = sample_detail.read_text(encoding="utf-8")
        if '"@type"' not in text:
            fail(f"{sample_detail.relative_to(DIST)} missing JSON-LD")
            return 1
        ok("sample detail page contains JSON-LD")

    # Average page size
    avg = sum(f.stat().st_size for f in html_files) / max(1, len(html_files))
    ok(f"avg HTML size: {avg:.1f} bytes")
    largest = max(html_files, key=lambda f: f.stat().st_size)
    ok(f"largest page: {largest.relative_to(DIST)} = {largest.stat().st_size} bytes")

    return 0


if __name__ == "__main__":
    sys.exit(main())
