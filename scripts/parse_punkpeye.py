#!/usr/bin/env python3
"""Parse punkpeye/awesome-mcp-servers README.md → structured JSON.

Robust against nested markdown badges: [![name](img)](url) <badges> - desc
"""
import json
import re
import sys
from pathlib import Path


def strip_markdown_links(text: str) -> str:
    """Remove markdown link syntax but keep text."""
    # ![alt](url) → ''
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    # [text](url) → text
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text


def parse_punkpeye(readme_path: str) -> list[dict]:
    raw = Path(readme_path).read_text(encoding="utf-8")
    lines = raw.splitlines()

    servers: list[dict] = []
    current_category = "Other"
    current_subcategory = ""

    # Cat heading: ### 🔗 <a name="slug"></a>Title
    cat_re = re.compile(
        r"^#{2,4}\s+(?:.+?\s+)?<a\s+name=\"(?P<slug>[^\"]+)\"></a>(?P<title>.+?)\s*$"
    )
    # Item line: - [name](url) [badges...] <emojis> - desc
    item_re = re.compile(r"^[\-\*]\s+(?P<rest>.+)$")
    # Code lang
    code_lang_re = re.compile(r"`(\w+)`")

    skip_categories = {
        "What is MCP?", "Clients", "Tutorials", "Community",
        "Legend", "Frameworks", "Tips & Tricks", "Server Implementations",
    }

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        # Category heading?
        m = cat_re.match(line)
        if m:
            cat_title = m.group("title").strip()
            cat_slug = m.group("slug").strip()
            # Top-level "Server Implementations" → keep its subcategories
            current_category = cat_title
            current_subcategory = ""
            continue

        # Generic heading check (skip non-category top-level)
        h = re.match(r"^(#{1,4})\s+(.+)$", line)
        if h:
            title = h.group(2).strip()
            if title in skip_categories:
                current_category = "_SKIP_"
                current_subcategory = ""
            elif title.startswith(("Server Implementations", "Frameworks", "Tips", "Community")):
                current_category = "_SKIP_"
                current_subcategory = ""
            continue

        if current_category == "_SKIP_":
            continue

        # Item line?
        m = item_re.match(line)
        if not m:
            continue
        rest = m.group("rest")

        # Strip nested badges first
        rest_clean = strip_markdown_links(rest)

        # Now rest_clean looks like:
        # name <badges> - desc
        # Pull first [...] url part
        link_m = re.match(r"^\[([^\]]+)\]\(([^)]+)\)", rest)
        if not link_m:
            continue
        name = link_m.group(1).strip()
        url = link_m.group(2).strip()

        # Split off description at " - " after first emoji cluster
        # Find first " - " or " – " separator
        desc_m = re.search(r"\s+[\-–]\s+(?P<desc>.+)$", rest_clean)
        desc = desc_m.group("desc").strip() if desc_m else ""

        # Extract language
        lang_match = code_lang_re.search(desc)
        language = lang_match.group(1) if lang_match else ""

        # Detect emoji badges (Emoji subset)
        emoji_map = {
            "🎖️": "official", "🏎️": "fast", "☁️": "cloud",
            "🏠": "local_install", "🐍": "python", "📇": "nodejs",
            "🦀": "rust", "🐢": "go", "🏗️": "java", "🤖": "ai_native",
            "⚙️": "cli", "📟": "embedded", "🍎": "macos",
            "🪟": "windows", "🐧": "linux", "🚀": "remote",
            "🔌": "plugin", "🔧": "tool", "📦": "package",
        }
        badges = {v: (e in rest_clean) for e, v in emoji_map.items()}

        # GitHub URL
        github_url = ""
        if "github.com/" in url:
            github_url = url

        # Compatible clients (heuristic by language/runtime)
        compatible_clients = ["claude_code", "cursor", "codex", "windsurf", "continue", "cline"]

        servers.append({
            "name": name,
            "url": url,
            "github_url": github_url,
            "description": desc,
            "category": current_category,
            "subcategory": current_subcategory,
            "language": language,
            "badges": badges,
            "compatible_clients": compatible_clients,
            "source": "punkpeye/awesome-mcp-servers",
            "stars": 0,
            "last_commit": "",
        })

    return servers


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "/tmp/punkpeye_readme.md"
    out = sys.argv[2] if len(sys.argv) > 2 else "/tmp/punkpeye_servers.json"
    data = parse_punkpeye(src)
    Path(out).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Parsed {len(data)} servers → {out}")
    cats: dict[str, int] = {}
    for s in data:
        cats[s["category"]] = cats.get(s["category"], 0) + 1
    print(f"\nTop categories ({len(cats)} total):")
    for c, n in sorted(cats.items(), key=lambda x: -x[1])[:20]:
        print(f"  {n:>4} | {c}")
