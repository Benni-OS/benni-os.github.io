#!/usr/bin/env python3
"""Idempotent telemetry injector and auditor for Benni OS blog & portal HTML files."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

SCRIPT_TAG = '<script defer src="/assets/blog-telemetry.js"></script>'
MARKER = "/assets/blog-telemetry.js"


def collect_target_htmls(repo_root: Path) -> list[Path]:
    """Return index.html plus all HTML files under blog/."""
    targets: list[Path] = []
    root_index = repo_root / "index.html"
    if root_index.is_file():
        targets.append(root_index)
    blog_dir = repo_root / "blog"
    if blog_dir.is_dir():
        targets.extend(sorted(blog_dir.rglob("*.html")))
    return targets


def inject_into_file(html_path: Path) -> bool:
    """Inject the central telemetry script right before </head>. Return True if modified."""
    raw = html_path.read_text(encoding="utf-8")
    if MARKER in raw:
        return False
    lower = raw.lower()
    idx = lower.find("</head>")
    if idx == -1:
        raise ValueError(f"Missing </head> tag in {html_path}")
    updated = raw[:idx] + f"  {SCRIPT_TAG}\n" + raw[idx:]
    html_path.write_text(updated, encoding="utf-8", newline="")
    return True


def main() -> int:
    """Apply or verify telemetry coverage across the repository."""
    parser = argparse.ArgumentParser(description="Inject or audit blog telemetry script tags.")
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parent.parent), help="Repository root path")
    parser.add_argument("--check", action="store_true", help="Verify coverage without modifying files")
    args = parser.parse_args()

    repo_root = Path(args.repo).resolve()
    required_assets = [
        repo_root / "public" / "assets" / "blog-telemetry.js",
        repo_root / "public" / "assets" / "telemetry-config.json",
        repo_root / "public" / "dashboard.html",
    ]
    missing_assets = [str(p) for p in required_assets if not p.is_file()]
    if missing_assets:
        print(f"[ERROR] Missing required telemetry assets: {missing_assets}", file=sys.stderr)
        return 1

    targets = collect_target_htmls(repo_root)
    missing: list[Path] = []
    modified = 0

    for html_path in targets:
        raw = html_path.read_text(encoding="utf-8")
        if MARKER not in raw:
            if args.check:
                missing.append(html_path)
            else:
                if inject_into_file(html_path):
                    modified += 1

    if args.check:
        if missing:
            print(f"[FAIL] {len(missing)}/{len(targets)} HTML files lack {MARKER}:", file=sys.stderr)
            for p in missing[:10]:
                print(f"  - {p.relative_to(repo_root)}", file=sys.stderr)
            return 2
        print(f"[OK] {len(targets)}/{len(targets)} HTML files instrumented with {MARKER}.")
        return 0

    print(f"[DONE] Scanned {len(targets)} HTML files; injected telemetry script into {modified} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
