"""Syndicate the 9 recent Benni OS English HTML articles to DEV.to with clean Markdown."""

from __future__ import annotations

import html
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BLOG_EN_DIR = Path(r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io\blog\en")

TARGETS: list[tuple[str, list[str]]] = [
    ("claude-code-swarm-parallel-worktrees-file-leases-mcp-blackboard.html", ["claudecode", "anthropic", "ai", "opensource"]),
    ("distributed-file-lock-arbiters-coding-agents-sqlite-wal-pretooluse.html", ["claudecode", "anthropic", "sqlite", "opensource"]),
    ("anthropic-ecosystem-blueprint-hooks-mcp-kernels-deterministic-teams.html", ["claudecode", "anthropic", "mcp", "ai"]),
    ("claude-code-sovereign-hooks-firewall-finops-time-travel.html", ["claudecode", "ai", "opensource", "python"]),
    ("why-claude-code-loses-context-after-compact-bitemporal-memory.html", ["claudecode", "ai", "architecture", "python"]),
    ("zero-trust-pretooluse-governance-autonomous-coding-agents.html", ["claudecode", "security", "ai", "opensource"]),
    ("agent-trace-replay-time-travel-debugging-ai-agents.html", ["ai", "python", "opensource", "debugging"]),
    ("token-economics-hybrid-local-cloud-llm-routing.html", ["ai", "llm", "finops", "opensource"]),
    ("60fps-motion-engineering-and-editorial-web-architecture.html", ["webdev", "javascript", "performance", "css"]),
    ("agent-context-firewall-indirect-prompt-injection-quarantine.html", ["ai", "security", "python", "opensource"]),
    ("zero-drift-agent-swarms-typed-contracts-egm-blind-review.html", ["ai", "architecture", "python", "opensource"]),
    ("bitemporal-memory-for-ai-agents-graphs-lossless-compression.html", ["ai", "database", "python", "opensource"]),
    ("agent-budget-governor-economic-circuit-breaker-ai-agents.html", ["ai", "finops", "python", "opensource"]),
    ("mcp-forge-deterministic-mcp-server-synthesis-zero-boilerplate.html", ["ai", "python", "mcp", "opensource"]),
    ("autonomous-browser-agents-dom-delta-compaction-zero-token-waste.html", ["ai", "webdev", "python", "security"]),
]


def _ssl_ctx() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def fetch_existing_articles(api_key: str) -> tuple[set[str], set[str], list[dict]]:
    req = urllib.request.Request(
        "https://dev.to/api/articles/me?per_page=100",
        headers={"api-key": api_key, "User-Agent": "BenniOS-Syndicator/1.0"},
    )
    with urllib.request.urlopen(req, context=_ssl_ctx(), timeout=30) as resp:
        items = json.loads(resp.read().decode("utf-8"))
    canon_urls = {(a.get("canonical_url") or "").strip().rstrip("/") for a in items if a.get("canonical_url")}
    titles = {(a.get("title") or "").strip().lower() for a in items if a.get("title")}
    return canon_urls, titles, items


TAG_RE = re.compile(r"</?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^<>]*)?/?>")


def _strip_tags(fragment: str) -> str:
    txt = TAG_RE.sub("", fragment)
    return html.unescape(txt).strip()


def _inline_html_to_md(text: str) -> str:
    # Links
    text = re.sub(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        lambda m: f"[{_strip_tags(m.group(2))}]({html.unescape(m.group(1))})",
        text,
        flags=re.S | re.I,
    )
    # Bold / italic / inline code
    text = re.sub(r"<(?:strong|b)[^>]*>(.*?)</(?:strong|b)>", r"**\1**", text, flags=re.S | re.I)
    text = re.sub(r"<(?:em|i)[^>]*>(.*?)</(?:em|i)>", r"*\1*", text, flags=re.S | re.I)
    text = re.sub(r"<code[^>]*>(.*?)</code>", lambda m: f"`{html.unescape(m.group(1)).strip()}`", text, flags=re.S | re.I)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = TAG_RE.sub("", text)
    return html.unescape(text)


def _table_to_md(table_html: str) -> str:
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", table_html, flags=re.S | re.I)
    md_rows: list[list[str]] = []
    for row in rows:
        cells = re.findall(r"<(?:th|td)[^>]*>(.*?)</(?:th|td)>", row, flags=re.S | re.I)
        if cells:
            cleaned = [re.sub(r"\s+", " ", _inline_html_to_md(c)).strip().replace("|", "\\|") for c in cells]
            md_rows.append(cleaned)
    if not md_rows:
        return ""
    header = md_rows[0]
    lines = [
        "| " + " | ".join(header) + " |",
        "| " + " | ".join(["---"] * len(header)) + " |",
    ]
    for r in md_rows[1:]:
        padded = r + [""] * (len(header) - len(r))
        lines.append("| " + " | ".join(padded[: len(header)]) + " |")
    return "\n\n" + "\n".join(lines) + "\n\n"


def _list_to_md(list_html: str, ordered: bool) -> str:
    items = re.findall(r"<li[^>]*>(.*?)</li>", list_html, flags=re.S | re.I)
    out = []
    for idx, item in enumerate(items, 1):
        prefix = f"{idx}." if ordered else "-"
        cleaned = re.sub(r"\s+", " ", _inline_html_to_md(item)).strip()
        if cleaned:
            out.append(f"{prefix} {cleaned}")
    return "\n" + "\n".join(out) + "\n\n"


def html_fragment_to_md(fragment: str) -> str:
    placeholders: dict[str, str] = {}

    def _stash(val: str) -> str:
        key = f"@@PH_{len(placeholders)}@@"
        placeholders[key] = val
        return f"\n\n{key}\n\n"

    # 1. Stash Mermaid diagrams as fenced mermaid blocks
    def _mermaid_repl(m: re.Match[str]) -> str:
        body = html.unescape(m.group(1)).strip()
        return _stash(f"```mermaid\n{body}\n```")

    fragment = re.sub(r'<div[^>]+class=["\'][^"\']*mermaid[^"\']*["\'][^>]*>(.*?)</div>', _mermaid_repl, fragment, flags=re.S | re.I)

    # 2. Stash <pre><code> blocks
    def _pre_repl(m: re.Match[str]) -> str:
        attrs = m.group(1) or ""
        raw_code = html.unescape(m.group(2)).strip("\r\n")
        lang = ""
        ml = re.search(r"language-([a-zA-Z0-9_-]+)", attrs)
        if ml:
            lang = ml.group(1)
        elif raw_code.lstrip().startswith(("import ", "from ", "def ", "class ", "@dataclass")):
            lang = "python"
        elif raw_code.lstrip().startswith(("pip ", "python ", "git ", "npx ", "npm ", "$", "budget-", "context-", "trace-")):
            lang = "bash"
        return _stash(f"```{lang}\n{raw_code}\n```")

    fragment = re.sub(r"<pre[^>]*>\s*<code([^>]*)>(.*?)</code>\s*</pre>", _pre_repl, fragment, flags=re.S | re.I)
    fragment = re.sub(r"<pre[^>]*>(.*?)</pre>", lambda m: _stash(f"```\n{html.unescape(m.group(1)).strip()}\n```"), fragment, flags=re.S | re.I)

    # 3. Stash tables
    fragment = re.sub(r"<table[^>]*>(.*?)</table>", lambda m: _stash(_table_to_md(m.group(1)).strip()), fragment, flags=re.S | re.I)

    # 4. Headings & blockquotes & lists & paragraphs
    fragment = re.sub(r"<h2[^>]*>(.*?)</h2>", lambda m: f"\n\n## {_strip_tags(m.group(1))}\n\n", fragment, flags=re.S | re.I)
    fragment = re.sub(r"<h3[^>]*>(.*?)</h3>", lambda m: f"\n\n### {_strip_tags(m.group(1))}\n\n", fragment, flags=re.S | re.I)
    fragment = re.sub(r"<h4[^>]*>(.*?)</h4>", lambda m: f"\n\n#### {_strip_tags(m.group(1))}\n\n", fragment, flags=re.S | re.I)
    fragment = re.sub(
        r"<blockquote[^>]*>(.*?)</blockquote>",
        lambda m: "\n\n> " + re.sub(r"\s+", " ", _inline_html_to_md(m.group(1))).strip() + "\n\n",
        fragment,
        flags=re.S | re.I,
    )
    fragment = re.sub(r"<ul[^>]*>(.*?)</ul>", lambda m: _list_to_md(m.group(1), ordered=False), fragment, flags=re.S | re.I)
    fragment = re.sub(r"<ol[^>]*>(.*?)</ol>", lambda m: _list_to_md(m.group(1), ordered=True), fragment, flags=re.S | re.I)
    fragment = re.sub(r"<p[^>]*>(.*?)</p>", lambda m: "\n\n" + re.sub(r"\s+", " ", _inline_html_to_md(m.group(1))).strip() + "\n\n", fragment, flags=re.S | re.I)
    fragment = re.sub(r"<hr\s*/?>", "\n\n---\n\n", fragment, flags=re.I)

    # 5. Strip leftover tags and restore placeholders
    fragment = _inline_html_to_md(fragment)
    for key, val in placeholders.items():
        fragment = fragment.replace(key, val)
    fragment = re.sub(r"\n{3,}", "\n\n", fragment).strip()
    return fragment


def extract_article_payload(filename: str, tags: list[str]) -> dict:
    path = BLOG_EN_DIR / filename
    raw_html = path.read_text(encoding="utf-8")

    # Title from <h1>
    m_h1 = re.search(r"<h1\b[^>]*>(.*?)</h1>", raw_html, flags=re.S | re.I)
    title = _strip_tags(m_h1.group(1)) if m_h1 else filename
    title = re.sub(r"\s+", " ", title).strip()
    if len(title) > 125:
        title = title[:122].rsplit(" ", 1)[0].rstrip(",:;-") + "..."

    # Description
    m_desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', raw_html, flags=re.I)
    desc = html.unescape(m_desc.group(1)).strip() if m_desc else title

    # Canonical URL
    m_canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', raw_html, flags=re.I)
    canonical_url = (m_canon.group(1).strip() if m_canon else f"https://benni-os.net/blog/en/{filename}")

    # Hero image
    m_img = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', raw_html, flags=re.I)
    main_image = m_img.group(1).strip() if m_img else "https://benni-os.net/blog/assets/flow_hero_control-plane.jpg"
    if main_image.startswith("/"):
        main_image = "https://benni-os.net" + main_image

    # Article body (<article ...> ... </article>)
    m_art = re.search(r"<article\b[^>]*>(.*?)</article>", raw_html, flags=re.S | re.I)
    art_html = m_art.group(1) if m_art else ""
    body_md = html_fragment_to_md(art_html)

    # FAQs (.article-faq-section)
    m_faq = re.search(r'<section[^>]+class=["\'][^"\']*article-faq-section[^"\']*["\'][^>]*>(.*?)</section>', raw_html, flags=re.S | re.I)
    faq_md = ""
    if m_faq:
        qs = re.findall(r'<div[^>]+class=["\'][^"\']*faq-item-q[^"\']*["\'][^>]*>(.*?)</div>\s*<div[^>]+class=["\'][^"\']*faq-item-a[^"\']*["\'][^>]*>(.*?)</div>', m_faq.group(1), flags=re.S | re.I)
        if qs:
            faq_lines = ["## Frequently Asked Questions"]
            for q, a in qs:
                ans = re.sub(r"\s+", " ", _inline_html_to_md(a)).strip()
                faq_lines.append(f"### {_strip_tags(q)}\n\n{ans}")
            faq_md = "\n\n".join(faq_lines)

    attribution = (
        f"> *By **Benni Alencar** — Chief AI Systems Architect at [Benni OS](https://benni-os.net). "
        f"Canonical article & interactive benchmarks at [benni-os.net]({canonical_url}).*"
    )
    footer_cta = (
        "---\n\n"
        "### Explore the Benni Master OS Open-Source Ecosystem\n\n"
        "- **Portal & Articles:** [https://benni-os.net](https://benni-os.net)\n"
        "- **Operator Academy:** [https://benni-os.net/blog/academy.html](https://benni-os.net/blog/academy.html)\n"
        "- **GitHub Organization:** [https://github.com/Benni-OS](https://github.com/Benni-OS) & [https://github.com/BenniAlencar](https://github.com/BenniAlencar)\n"
    )

    parts = [attribution, body_md]
    if faq_md:
        parts.append(faq_md)
    parts.append(footer_cta)
    full_md = "\n\n".join(p for p in parts if p)

    return {
        "article": {
            "title": title,
            "published": True,
            "description": desc[:250],
            "main_image": main_image,
            "canonical_url": canonical_url,
            "tags": [t.lower()[:30] for t in tags[:4]],
            "body_markdown": full_md,
        }
    }


def publish_with_retry(api_key: str, payload: dict, max_retries: int = 6) -> dict:
    data = json.dumps(payload).encode("utf-8")
    for attempt in range(1, max_retries + 2):
        req = urllib.request.Request(
            "https://dev.to/api/articles",
            data=data,
            headers={
                "api-key": api_key,
                "Content-Type": "application/json",
                "User-Agent": "BenniOS-Syndicator/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, context=_ssl_ctx(), timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", errors="replace")
            if exc.code == 429 and attempt <= max_retries:
                print(f"   [429] Rate limited (attempt {attempt}/{max_retries}). Sleeping 32s...")
                time.sleep(32)
                continue
            raise RuntimeError(f"DEV.to HTTP {exc.code}: {err_body}") from exc
    raise RuntimeError("DEV.to publish exceeded maximum retries.")


def main() -> int:
    api_key = os.getenv("DEV_TO_API_KEY", "").strip()
    if not api_key:
        print("ERROR: Set DEV_TO_API_KEY environment variable before running.", file=sys.stderr)
        return 1

    canon_urls, titles, existing = fetch_existing_articles(api_key)
    print(f"Existing DEV.to articles: {len(existing)}")

    published_now = 0
    for idx, (fname, tags) in enumerate(TARGETS, 1):
        payload = extract_article_payload(fname, tags)
        art = payload["article"]
        canon = art["canonical_url"].rstrip("/")
        if canon in canon_urls or art["title"].lower() in titles:
            print(f"[{idx}/9] SKIP (already live): {art['title']}")
            continue

        if published_now > 0:
            print("   Sleeping 32s to respect DEV.to rate limit...")
            time.sleep(32)

        res = publish_with_retry(api_key, payload)
        published_now += 1
        print(f"[{idx}/9] PUBLISHED: {res.get('title')} -> {res.get('url')}")
        canon_urls.add(canon)
        titles.add(art["title"].lower())

    print(f"\nDone. Newly published: {published_now}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
