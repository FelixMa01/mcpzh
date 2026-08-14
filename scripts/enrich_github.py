#!/usr/bin/env python3
"""Enrich parsed servers with GitHub stars + last commit.

Uses GitHub Search API by owner/repo path (rate-limited but free for unauth = 60 req/h,
so we sample top-N by frequency).
"""
import json
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path


def gh_get(url: str):
    try:
        req = urllib.request.Request(
            url,
            headers={"Accept": "application/vnd.github+json", "User-Agent": "mcpzh-enricher/1.0"},
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError) as e:
        return None


def extract_github_path(url):
    if "github.com/" not in url:
        return None
    m = re.search(r"github\.com/([^/]+)/([^/?#]+)", url)
    if not m:
        return None
    return f"{m.group(1)}/{m.group(2)}"


def enrich(input_path, output_path, top_n=200):
    data = json.loads(Path(input_path).read_text(encoding="utf-8"))
    # Collect GH paths
    candidates = []
    seen = set()
    for s in data:
        path = extract_github_path(s.get("url", ""))
        if path and path not in seen:
            seen.add(path)
            candidates.append((path, s))
    print(f"Unique GH repos: {len(candidates)}")
    # Sample top N (deterministic)
    candidates = candidates[:top_n]

    enriched = 0
    rate_limited = 0
    for i, (path, server) in enumerate(candidates):
        url = f"https://api.github.com/repos/{path}"
        info = gh_get(url)
        if info is None:
            rate_limited += 1
            continue
        if isinstance(info, dict) and "stargazers_count" in info:
            server["stars"] = info.get("stargazers_count", 0)
            server["last_commit"] = info.get("pushed_at", "")
            server["gh_forks"] = info.get("forks_count", 0)
            server["gh_open_issues"] = info.get("open_issues_count", 0)
            server["gh_license"] = (info.get("license") or {}).get("spdx_id", "")
            server["gh_default_branch"] = info.get("default_branch", "main")
            server["gh_topics"] = info.get("topics", [])
            enriched += 1
        if (i + 1) % 20 == 0:
            print(f"  [{i+1}/{len(candidates)}] enriched={enriched} rate_limited={rate_limited}")
        # Respect rate limit
        if rate_limited > 5:
            print("  hit rate limit, stopping")
            break
        time.sleep(0.1)

    Path(output_path).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✓ Enriched {enriched}/{len(candidates)} servers → {output_path}")


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "/tmp/punkpeye_servers.json"
    dst = sys.argv[2] if len(sys.argv) > 2 else "/tmp/punkpeye_enriched.json"
    top = int(sys.argv[3]) if len(sys.argv) > 3 else 200
    enrich(src, dst, top)
