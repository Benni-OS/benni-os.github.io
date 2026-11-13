import os
import sys
import json
import urllib.request

PROJECT_DIR = r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io"
sys.path.append(os.path.join(PROJECT_DIR, "automation"))
from daily_publishing_engine import update_sitemap, update_feed

ARTICLES = [
    {
        "title_en": "The 8GB VRAM Breakthrough: How PagedAttention and Dynamic KV-Cache Quantization Unlock 64k Context on Consumer GPUs",
        "slug_en": "the-8gb-vram-breakthrough-pagedattention-kv-cache-quantization",
        "slug_pt": "o-salto-dos-8gb-de-vram-pagedattention-quantizacao-kv-cache",
        "summary_en": "Eliminate the PCIe RAM spill cliff on 8GB consumer GPUs using PagedAttention block tables, FP8/INT4 KV-cache quantization, and speculative decoding with BIE."
    },
    {
        "title_en": "Spec-Driven Development (SDD): Eliminating AI Code Drift and Multi-Turn Hallucinations with Formal Consensus",
        "slug_en": "spec-driven-development-eliminating-ai-code-drift-formal-consensus",
        "slug_pt": "desenvolvimento-orientado-a-especificacoes-eliminando-deriva-ia",
        "summary_en": "Why prompt-and-pray coding collapses after 3-5 turns, and how Conductor SDD + Elephant-Goldfish blind review guarantees 0.00% drift."
    },
    {
        "title_en": "The Zero-Trust MCP Gateway: Securing Autonomous AI Agent Tools with Default-Deny, Dynamic Leases, and Atomic Rollback",
        "slug_en": "zero-trust-mcp-gateway-default-deny-dynamic-leases-atomic-rollback",
        "slug_pt": "gateway-mcp-zero-trust-default-deny-leases-dinamicos-rollback",
        "summary_en": "Mitigating indirect prompt injection and tool poisoning in MCP servers via Default-Deny capability gates, ephemeral leases, and atomic rollback."
    }
]

urls_to_index = []
for art in ARTICLES:
    update_sitemap(art["slug_en"], art["slug_pt"])
    update_feed(art["title_en"], art["slug_en"], art["summary_en"])
    urls_to_index.append(f"https://benni-os.net/blog/en/{art['slug_en']}.html")
    urls_to_index.append(f"https://benni-os.net/blog/{art['slug_pt']}.html")

payload = {
    "host": "benni-os.net",
    "key": "3a9b7f14e2c8d501a9b7f14e2c8d501a",
    "keyLocation": "https://benni-os.net/3a9b7f14e2c8d501a9b7f14e2c8d501a.txt",
    "urlList": urls_to_index
}

req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=10) as res:
        print(f"[INDEXNOW] Submitted 6 URLs -> HTTP {res.status}")
except Exception as e:
    print(f"[INDEXNOW WARN] {e}")
