"""Map all broken, 404, or 28KB-placeholder blog images to real 1376x768 Nano Banana Pro Flow JPGs."""

from __future__ import annotations

import glob
import os
import re

REPO = r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io"
BLOG_DIR = os.path.join(REPO, "blog")

DIRECT_REPLACEMENTS = {
    "/blog/assets/image-6-nemesis-seal.png": "/blog/assets/flow_hero_nemesis-gateway.jpg",
    "/blog/assets/flow_hero_agent-eval-harness.png": "/blog/assets/flow_hero_agent-eval-harness.jpg",
    "/blog/assets/flow_hero_autonomous-ai-browser-agents-with-zero-token-waste-dom-delta-and-prompt-injection-guardrails.png": "/blog/assets/flow_hero_agent-browser-mesh.jpg",
    "/blog/assets/flow_hero_agent-browser-mesh.png": "/blog/assets/flow_hero_agent-browser-mesh.jpg",
    "/blog/assets/flow_hero_zero-dependency-micro-second-code-sandbox-for-ai-agents--eliminating-cold-start-latency-and-context-blowout-via-ast-static-analysis-and-token-shielding.png": "/blog/assets/flow_hero_agent-code-sandbox.jpg",
    "/blog/assets/flow_hero_agent-code-sandbox.png": "/blog/assets/flow_hero_agent-code-sandbox.jpg",
    "/blog/assets/flow_hero_autonomous-deep-research-for-ai-agents--eliminating-hallucinated-citations-and-85--token-burn-via-bm25-distillation-and-cryptographic-provenance-ledgers.png": "/blog/assets/flow_hero_agent-deep-research.jpg",
    "/blog/assets/flow_hero_agent-deep-research.png": "/blog/assets/flow_hero_agent-deep-research.jpg",
    "/blog/assets/flow_hero_deterministic-zero-cloud-evaluation-and-red-teaming-for-ai-agents--eliminating-llm-judge-token-burn-and-telemetry-leaks-via-invariant-assertion-matrices.png": "/blog/assets/flow_hero_agent-eval-harness.jpg",
    "/blog/assets/flow_hero_cyber-sentinel.png": "/blog/assets/flow_hero_cyber-sentinel.jpg",
    "/blog/assets/flow_hero_agent-run-ledger.png": "/blog/assets/flow_hero_agent-run-ledger.jpg",
    "/blog/assets/flow_hero_control-plane.png": "/blog/assets/flow_hero_control-plane.jpg",
    "/blog/assets/flow_hero_inference-engine.png": "/blog/assets/flow_hero_inference-engine.jpg",
    "/blog/assets/test_swarm_orchestration.png": "/blog/assets/flow_hero_agent-armies.jpg",
    "/blog/assets/test_swarm_downloaded.png": "/blog/assets/flow_hero_agent-armies.jpg",
    "/blog/assets/test_puter_schematic.png": "/blog/assets/flow_hero_puter-serverless.jpg",
    "/blog/assets/flow_hero_project-adam.png": "/blog/assets/hero-11-adam.png",
    "/blog/assets/flow_arch_project-adam.png": "/blog/assets/hero-11-the-first-move.png",
    "/blog/assets/test_benjamin_code.png": "/blog/assets/hero-10-the-decision.png",
    "/blog/assets/flow_test_quantum_node_architecture_4d1351a1.png": "/blog/assets/flow_hero_agent-browser-mesh.jpg",
}

NO_IMG_HERO_MAP = {
    "como-utilizar-agent-intent-compiler-no-ecossistema-benni-os.html": "/blog/assets/flow_hero_control-plane.jpg",
    "agent-intent-compiler-typed-dag-execution.html": "/blog/assets/flow_hero_control-plane.jpg",
    "como-utilizar-agent-token-optimizer-no-ecossistema-benni-os.html": "/blog/assets/flow_hero_token-optimizer.jpg",
    "agent-token-optimizer-slashing-llm-token-bills.html": "/blog/assets/flow_hero_token-optimizer.jpg",
}


def process_file(fp: str) -> bool:
    with open(fp, "r", encoding="utf-8", errors="replace") as f:
        orig = f.read()

    if 'http-equiv="refresh"' in orig.lower() or "<title>Redirecionando" in orig:
        return False

    txt = orig
    base = os.path.basename(fp)

    for old, new in DIRECT_REPLACEMENTS.items():
        if old in txt:
            txt = txt.replace(old, new)

    # Give agent-memory-mesh its dedicated quartz archive cover
    if "agent-memory-mesh" in base:
        txt = txt.replace("/blog/assets/flow_hero_cyber-sentinel.jpg", "/blog/assets/flow_hero_bitemporal-memory.jpg")

    # Give nemesis-manifesto & zero-trust-mcp-gateway distinct vault/shield variations
    if "manifesto-nemesis" in base or "the-nemesis-manifesto" in base:
        txt = txt.replace("/blog/assets/flow_hero_nemesis-gateway.jpg", "/blog/assets/flow_hero_nemesis-manifesto.jpg")
    elif "zero-trust-mcp-gateway" in base or "gateway-mcp-zero-trust" in base:
        txt = txt.replace("/blog/assets/flow_hero_nemesis-gateway.jpg", "/blog/assets/flow_hero_zero-trust.jpg")

    # Remove broken mindmap_project-adam.svg <img ...> or <figure ...> blocks
    txt = re.sub(
        r'<img[^>]+src=["\']/blog/assets/mindmap_project-adam\.svg["\'][^>]*>\s*',
        "",
        txt,
    )

    # Inject hero cover figure for articles that previously had no <img>
    if base in NO_IMG_HERO_MAP:
        hero_url = NO_IMG_HERO_MAP[base]
        if hero_url not in txt:
            m_t = re.search(r"<title>([^<]+)</title>", txt)
            alt = (m_t.group(1).split("|")[0].strip() if m_t else "Benni OS Engineering").replace('"', "&quot;")
            fig = f'<figure class="article-hero-cover-figure"><img src="{hero_url}" alt="{alt}" class="article-hero-img" /></figure>\n'
            txt = re.sub(r"(<article\b)", fig + r"\1", txt, count=1)

    if txt != orig:
        with open(fp, "w", encoding="utf-8") as f:
            f.write(txt)
        return True
    return False


def main() -> None:
    files = sorted(glob.glob(os.path.join(BLOG_DIR, "**", "*.html"), recursive=True))
    changed = sum(1 for fp in files if process_file(fp))
    print(f"Updated image mappings in {changed} / {len(files)} blog HTML files.")


if __name__ == "__main__":
    main()
