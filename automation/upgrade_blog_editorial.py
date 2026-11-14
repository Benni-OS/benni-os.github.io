"""Upgrade Benni OS blog HTML files to Google Discover Editorial Light+Dark standard
and fix broken markup (duplicate H1s, duplicate AdSense scripts, unrendered
markdown image tags, unrendered Mermaid blocks, and missing Discover meta).
"""

from __future__ import annotations

import glob
import os
import re

REPO = r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io"
BLOG_DIR = os.path.join(REPO, "blog")

DISCOVER_META = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />'
THEME_CSS = '<link rel="stylesheet" href="/assets/editorial-theme.css" />'
THEME_JS = '<script src="/assets/editorial-theme.js"></script>'
MERMAID_CDN = '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>'


def asset_exists(url_path: str) -> bool:
    rel = url_path.lstrip("/").replace("/", os.sep)
    return (
        os.path.exists(os.path.join(REPO, rel))
        or os.path.exists(os.path.join(REPO, "public", rel))
    )


def upgrade_file(fp: str) -> bool:
    with open(fp, "r", encoding="utf-8", errors="replace") as f:
        orig = f.read()

    if 'http-equiv="refresh"' in orig.lower() or "<title>Redirecionando" in orig:
        return False

    txt = orig

    # 1. Deduplicate AdSense <script> tags
    ads_pat = re.compile(
        r'<script[^>]+pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^>]*></script>\s*'
    )
    matches = list(ads_pat.finditer(txt))
    if len(matches) > 1:
        for m in reversed(matches[1:]):
            txt = txt[: m.start()] + txt[m.end() :]

    # 2. Ensure Discover max-image-preview:large meta
    if "max-image-preview:large" not in txt:
        if re.search(r'<meta[^>]+name=["\']robots["\'][^>]*>', txt, re.I):
            txt = re.sub(
                r'<meta[^>]+name=["\']robots["\'][^>]*>',
                DISCOVER_META,
                txt,
                count=1,
                flags=re.I,
            )
        else:
            txt = txt.replace("</head>", f"  {DISCOVER_META}\n</head>", 1)

    # 3. Inject editorial-theme.css and editorial-theme.js idempotently
    if "/assets/editorial-theme.css" not in txt:
        txt = txt.replace("</head>", f"  {THEME_CSS}\n  {THEME_JS}\n</head>", 1)

    # 4. Fix /assets/images/flow_hero_* -> /blog/assets/flow_hero_*
    txt = txt.replace("/assets/images/flow_hero_", "/blog/assets/flow_hero_")

    # 5. Convert duplicate <h1> tags (keep only the first <h1>, convert rest to <h2>)
    h1_count = 0

    def _demote_extra_h1(m: re.Match[str]) -> str:
        nonlocal h1_count
        h1_count += 1
        if h1_count == 1:
            return m.group(0)
        return re.sub(r"^<h1\b", "<h2", m.group(1), flags=re.I) + m.group(2) + "</h2>"

    txt = re.sub(r"(<h1\b[^>]*>)(.*?)</h1>", _demote_extra_h1, txt, flags=re.S | re.I)

    # 6. Clean up literal markdown ![Alt](url) inside HTML
    def _replace_md_img(m: re.Match[str]) -> str:
        alt = m.group(1)
        url = m.group(2)
        if asset_exists(url):
            return f'<figure class="editorial-diagram"><img src="{url}" alt="{alt}" loading="lazy" /></figure>'
        return ""

    txt = re.sub(
        r"(?:<p>\s*)?(?:<code>\s*)?!\[([^\]]*)\]\(([^)]+)\)(?:\s*</code>)?(?:\s*</p>)?",
        _replace_md_img,
        txt,
    )

    # 7. Convert <pre><code class="language-mermaid">...</code></pre> -> <div class="mermaid">...</div>
    txt = re.sub(
        r'<pre><code class=["\']language-mermaid["\']>(.*?)</code></pre>',
        r'<div class="mermaid">\1</div>',
        txt,
        flags=re.S,
    )

    # 8. Ensure Mermaid CDN if <div class="mermaid"> exists
    if 'class="mermaid"' in txt and "mermaid.min.js" not in txt and "mermaid.esm.min.mjs" not in txt:
        mermaid_init = (
            f"{MERMAID_CDN}\n"
            "<script>if(window.mermaid){mermaid.initialize({startOnLoad:true,theme:'neutral'});}</script>"
        )
        txt = txt.replace("</body>", f"  {mermaid_init}\n</body>", 1)

    if txt != orig:
        with open(fp, "w", encoding="utf-8") as f:
            f.write(txt)
        return True
    return False


def main() -> None:
    files = sorted(glob.glob(os.path.join(BLOG_DIR, "**", "*.html"), recursive=True))
    changed = 0
    for fp in files:
        if upgrade_file(fp):
            changed += 1
    print(f"Upgraded {changed} / {len(files)} blog HTML files.")


if __name__ == "__main__":
    main()
