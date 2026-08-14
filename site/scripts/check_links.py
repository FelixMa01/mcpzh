#!/usr/bin/env python3
"""Detect broken internal links inside the built dist/.

For every static HTML file, look for href values pointing at relative paths
and check the target exists on disk. External URLs and #anchors are skipped.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / "dist"
HREF_RE = re.compile(r'(?:href|src)="(/[^"#?]*)(?:[?#][^"]*)?"')
# Template-literal placeholders like ${esc(x.slug)} may appear in compiled script tags
# (Astro inlines the script). They're not actual broken links.
TEMPLATE_LITERAL_RE = re.compile(r'\$\{[^}]+\}')


def main() -> int:
    if not DIST.exists():
        print(f"✗ dist/ missing")
        return 1
    broken: dict[str, list[str]] = {}
    for f in DIST.rglob("*.html"):
        text = f.read_text(encoding="utf-8", errors="ignore")
        for match in HREF_RE.finditer(text):
            target = match.group(1)
            if TEMPLATE_LITERAL_RE.search(target):
                continue  # JS template literal placeholder, not a real link
            if target in ("/", "/search", "/rss.xml", "/sitemap.xml", "/favicon.svg", "/logo.svg"):
                continue
            # Astro with trailingSlash: 'never' emits /foo/index.html.
            # Links to /foo are valid in browsers (handled by Cloudflare _redirects),
            # so accept both /foo and /foo/ for this build.
            stripped = target.lstrip("/")
            candidates = [
                DIST / stripped / "index.html",
                DIST / f"{stripped}.html",
                DIST / stripped,  # might exist as a file
            ]
            if not any(p.exists() for p in candidates):
                broken.setdefault(str(f.relative_to(DIST)), []).append(target)

    if broken:
        print(f"✗ found {sum(len(v) for v in broken.values())} broken links in {len(broken)} pages")
        for page, targets in list(broken.items())[:5]:
            print(f"  {page}: {targets[:3]}")
        return 1

    print(f"✓ no broken internal links across {len(list(DIST.rglob('*.html')))} HTML pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())