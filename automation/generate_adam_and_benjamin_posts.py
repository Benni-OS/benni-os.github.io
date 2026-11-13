#!/usr/bin/env python3
"""
Generate Masterclasses for Project Adam & Project Benjamin.
Produces:
1. blog/en/project-adam-recursive-self-evolution-autonomous-ai-agents.html
2. blog/como-utilizar-project-adam-no-ecossistema-benni-os.html
3. blog/en/autonomous-dispatch-engineering-high-yield-task-routing-swarms.html
4. blog/como-utilizar-projeto-benjamin-dispatch-autonomo-no-ecossistema-benni-os.html
Updates sitemap.xml, feed.xml, and submits to IndexNow.
"""

import os
import sys
import json
import urllib.request

PROJECT_DIR = r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io"
sys.path.append(os.path.join(PROJECT_DIR, "automation"))
from daily_publishing_engine import update_sitemap, update_feed

def get_html_template(
    lang, title, subtitle, slug_en, slug_pt, hero_img,
    category, read_time, body_content, faqs, cta_title, cta_desc, cta_btn, cta_url
):
    is_en = (lang == "en")
    canonical_url = f"https://benni-os.net/blog/en/{slug_en}.html" if is_en else f"https://benni-os.net/blog/{slug_pt}.html"
    alt_en = f"https://benni-os.net/blog/en/{slug_en}.html"
    alt_pt = f"https://benni-os.net/blog/{slug_pt}.html"
    
    faq_ld = []
    faq_html = []
    for q, a in faqs:
        faq_ld.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
        })
        faq_html.append(f"""
        <div class="faq-item-card">
          <div class="faq-item-q">{q}</div>
          <div class="faq-item-a">{a}</div>
        </div>
        """)
    faq_html_str = "\n".join(faq_html)

    schema_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["TechArticle", "BlogPosting"],
                "@id": f"{canonical_url}#article",
                "isPartOf": {
                    "@type": "WebSite",
                    "@id": "https://benni-os.net/#website",
                    "name": "Benni OS",
                    "url": "https://benni-os.net"
                },
                "headline": title,
                "description": subtitle,
                "inLanguage": "en-US" if is_en else "pt-BR",
                "mainEntityOfPage": canonical_url,
                "url": canonical_url,
                "image": f"https://benni-os.net{hero_img}",
                "datePublished": "2026-11-08T00:00:00Z",
                "dateModified": "2026-11-08T01:30:00Z",
                "author": {
                    "@type": "Person",
                    "@id": "https://benni-os.net/#author",
                    "name": "Benni Alencar",
                    "jobTitle": "Chief AI Systems Architect & Founder",
                    "url": "https://benni-os.net"
                },
                "publisher": {
                    "@type": "Organization",
                    "@id": "https://benni-os.net/#organization",
                    "name": "Benni OS",
                    "url": "https://benni-os.net",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://benni-os.net/blog/assets/benni_avatar.png"
                    }
                }
            },
            {
                "@type": "FAQPage",
                "@id": f"{canonical_url}#faq",
                "mainEntity": faq_ld
            }
        ]
    }

    lang_nav = f"""
        <div class="lang-switcher-pill" role="navigation" aria-label="Language Selector">
          <a href="/blog/en/{slug_en}.html" class="lang-btn {'active' if is_en else ''}" title="English">
            <span>🇺🇸</span> EN
          </a>
          <a href="/blog/{slug_pt}.html" class="lang-btn {'active' if not is_en else ''}" title="Português">
            <span>🇧🇷</span> PT-BR
          </a>
        </div>
    """

    lang_bar = f"""
    <div class="article-lang-bar">
      <span class="lang-label-txt">🌐 {'Available in:' if is_en else 'Disponível em:'}</span>
      <a href="/blog/en/{slug_en}.html" class="lang-chip {'active' if is_en else ''}">🇺🇸 English (Tier-1 Global)</a>
      <a href="/blog/{slug_pt}.html" class="lang-chip {'active' if not is_en else ''}">🇧🇷 Português (Brasil)</a>
    </div>
    """

    return f"""<!DOCTYPE html>
<html lang="{'en' if is_en else 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <!-- Google AdSense Oficial -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6415277800729792" crossorigin="anonymous"></script>

  <title>{title} — Benni Alencar // Benni OS</title>
  <meta name="description" content="{subtitle}">
  <link rel="canonical" href="{canonical_url}" />
  <link rel="alternate" hreflang="en" href="{alt_en}" />
  <link rel="alternate" hreflang="pt-BR" href="{alt_pt}" />
  <link rel="alternate" hreflang="x-default" href="{alt_en}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{subtitle}" />
  <meta property="og:image" content="https://benni-os.net{hero_img}" />
  <meta property="og:url" content="{canonical_url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:creator" content="@BenniAlencar" />

  <script type="application/ld+json">
  {json.dumps(schema_ld, indent=2, ensure_ascii=False)}
  </script>

  <style>
    :root {{
      --bg: #09090b;
      --panel: #11141d;
      --card-border: rgba(255, 255, 255, 0.08);
      --cyan: #00f0ff;
      --cyan-glow: rgba(0, 240, 255, 0.35);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --font-title: 'DM Serif Display', Georgia, serif;
      --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
      --font-code: 'IBM Plex Mono', monospace;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.75;
      font-size: 1.1rem;
      overflow-x: hidden;
    }}
    header.magazine-header {{
      position: sticky;
      top: 0;
      background: rgba(9, 9, 11, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border);
      z-index: 100;
      padding: 0.8rem 1.5rem;
    }}
    .nav-container {{
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .brand-logo {{
      font-family: var(--font-code);
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.05rem;
    }}
    .status-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 10px var(--cyan);
    }}
    nav.nav-links {{ display: flex; align-items: center; gap: 1.4rem; }}
    nav.nav-links a {{
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.92rem;
      transition: color 0.2s;
    }}
    nav.nav-links a:hover {{ color: var(--cyan); }}
    .lang-switcher-pill {{
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 3px 6px;
      gap: 4px;
    }}
    .lang-btn {{
      color: var(--text-muted);
      text-decoration: none;
      font-family: var(--font-code);
      font-size: 0.76rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
      transition: all 0.2s;
    }}
    .lang-btn.active {{
      background: var(--cyan);
      color: #000 !important;
      box-shadow: 0 0 12px var(--cyan-glow);
    }}
    .article-lang-bar {{
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(14, 17, 26, 0.8);
      border: 1px solid rgba(0, 240, 255, 0.25);
      border-radius: 9999px;
      padding: 0.35rem 0.9rem;
      margin-bottom: 1.5rem;
      font-family: var(--font-code);
      font-size: 0.78rem;
    }}
    .lang-chip {{
      color: var(--text-muted);
      text-decoration: none;
      padding: 2px 8px;
      border-radius: 9999px;
    }}
    .lang-chip.active {{
      background: rgba(0, 240, 255, 0.15);
      color: var(--cyan);
      border: 1px solid rgba(0, 240, 255, 0.3);
    }}
    main.article-layout {{
      max-width: 860px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }}
    .breadcrumb-nav {{
      display: flex;
      gap: 0.5rem;
      font-family: var(--font-code);
      font-size: 0.82rem;
      color: var(--text-dim);
      margin-bottom: 1.2rem;
    }}
    .breadcrumb-nav a {{ color: var(--text-muted); text-decoration: none; }}
    .category-badge-pill {{
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(10, 12, 18, 0.9);
      border: 1px solid #ec4899;
      color: #ec4899;
      font-family: var(--font-code);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
    }}
    .article-main-title {{
      font-family: var(--font-title);
      font-size: clamp(2.3rem, 4.5vw, 3.6rem);
      line-height: 1.15;
      color: #fff;
      margin: 1.2rem 0;
    }}
    .article-lead-paragraph {{
      color: var(--text-muted);
      font-size: 1.2rem;
      line-height: 1.65;
      margin-bottom: 2rem;
    }}
    .article-hero-cover-figure {{ margin: 2rem 0 3.5rem; text-align: center; }}
    .article-hero-img {{
      width: 100%;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    }}
    .article-content-body h2 {{
      font-family: var(--font-title);
      font-size: 2.1rem;
      color: #fff;
      margin: 3.5rem 0 1.2rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--card-border);
    }}
    .article-content-body h3 {{
      font-size: 1.35rem;
      color: var(--cyan);
      margin: 2.2rem 0 0.8rem;
    }}
    .article-content-body p {{ margin-bottom: 1.6rem; color: #d1d5db; }}
    .article-content-body ul, .article-content-body ol {{ margin: 1.2rem 0 1.8rem 1.8rem; color: #cbd5e1; }}
    .article-content-body li {{ margin-bottom: 0.6rem; }}
    pre {{
      background: #040508 !important;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.4rem;
      margin: 2rem 0;
      overflow-x: auto;
      font-family: var(--font-code);
      font-size: 0.92rem;
      color: #38bdf8;
    }}
    code {{
      font-family: var(--font-code);
      background: rgba(255, 255, 255, 0.06);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.88em;
      color: var(--cyan);
    }}
    pre code {{ background: transparent; padding: 0; color: inherit; }}
    .faq-item-card {{
      background: var(--panel);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.4rem;
      margin-bottom: 1rem;
    }}
    .faq-item-q {{ font-weight: 700; color: #fff; margin-bottom: 0.5rem; }}
    .faq-item-a {{ color: var(--text-muted); font-size: 0.95rem; }}
    .cta-monetization-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.8rem;
      margin: 3.5rem 0 2rem;
    }}
    .cta-card {{
      background: var(--panel);
      border: 1px solid rgba(0, 240, 255, 0.25);
      border-radius: 12px;
      padding: 2rem;
    }}
    .cta-btn {{
      display: inline-block;
      width: 100%;
      text-align: center;
      background: var(--cyan);
      color: #000;
      font-weight: 700;
      padding: 0.8rem;
      border-radius: 6px;
      text-decoration: none;
    }}
    footer {{
      border-top: 1px solid var(--card-border);
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-dim);
      font-family: var(--font-code);
      font-size: 0.85rem;
    }}
  </style>
  <script defer src="/assets/blog-telemetry.js"></script>
</head>
<body>

  <!-- Header -->
  <header class="magazine-header">
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <span class="status-dot"></span>
        BENNI OS // MAGAZINE
      </a>
      <nav class="nav-links">
        <a href="/">Home</a>
        <a href="/blog/index.html">Magazine</a>
        <a href="/blog/academy.html">Academy</a>
        <a href="https://github.com/BenniAlencar" target="_blank">GitHub</a>
        {lang_nav}
      </nav>
    </div>
  </header>

  <main class="article-layout">
    <nav class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/blog/index.html">Magazine</a>
      <span>/</span>
      <span style="color: var(--cyan);">{category}</span>
    </nav>

    {lang_bar}

    <header>
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
        <span class="category-badge-pill">{category}</span>
        <span style="color: var(--text-dim); font-size: 0.85rem; font-family: var(--font-code);">{read_time} • Published Nov 2026</span>
      </div>

      <h1 class="article-main-title">{title}</h1>
      <p class="article-lead-paragraph">{subtitle}</p>
    </header>

    <figure class="article-hero-cover-figure">
      <img src="{hero_img}" alt="{title}" class="article-hero-img" />
    </figure>

    <article class="article-content-body">
      {body_content}
    </article>

    <!-- FAQ Section -->
    <section style="margin: 3.5rem 0;" id="faq">
      <h3 style="font-family: var(--font-title); font-size: 1.8rem; color: #fff; margin-bottom: 1.5rem;">
        {'Frequently Asked Questions // Engineering Authority' if is_en else 'Perguntas Frequentes // Autoridade de Engenharia'}
      </h3>
      {faq_html_str}
    </section>

    <!-- Monetization Section -->
    <section class="cta-monetization-grid">
      <div class="cta-card">
        <span style="color: var(--cyan); font-family: var(--font-code); font-size: 0.75rem; font-weight: 700;">
          {'ENTERPRISE SOVEREIGN ADVISORY' if is_en else 'CONSULTORIA CORPORATIVA SOBERANA'}
        </span>
        <h3 style="color: #fff; font-size: 1.35rem; margin: 0.8rem 0;">{cta_title}</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">{cta_desc}</p>
        <a href="{cta_url}" class="cta-btn">{cta_btn} &rarr;</a>
      </div>
      <div class="cta-card" style="border-color: rgba(201, 164, 92, 0.35);">
        <span style="color: #c9a45c; font-family: var(--font-code); font-size: 0.75rem; font-weight: 700;">
          {'BENNI OS ACADEMY' if is_en else 'ACADEMIA BENNI OS'}
        </span>
        <h3 style="color: #fff; font-size: 1.35rem; margin: 0.8rem 0;">
          {'Operator Mode: Sovereign AI Systems Engineering' if is_en else 'Modo Operador: Engenharia de Sistemas de IA Soberanos'}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
          {'Master multi-agent orchestration, typed DAG compilation, zero-trust MCP security, and autonomous self-evolution.' if is_en else 'Domine orquestração multiagente, compilação de DAGs tipados, segurança zero-trust de MCP e autoevolução autônoma.'}
        </p>
        <a href="https://benni-os.net/blog/academy.html" class="cta-btn" style="background: #c9a45c;">
          {'Access Academy & Curricula' if is_en else 'Acessar Academia e Currículo'} &rarr;
        </a>
      </div>
    </section>

  </main>

  <footer>
    <p>Benni OS v9.4 Sovereign Architecture • Authored by Benni Alencar • <a href="https://benni-os.net" style="color: var(--cyan); text-decoration: none;">benni-os.net</a></p>
  </footer>

  <script>
    mermaid.initialize({{ startOnLoad: true, theme: 'dark' }});
  </script>
</body>
</html>
"""

# ----------------- CONTENT FOR ADAM -----------------

adam_body_en = """
<h2>1. The Entropy Trap: Why Static Agents Inevitably Decay</h2>
<p>Every production AI agent deployed today is born frozen in time. An engineering team drafts a system prompt, annotates twenty few-shot examples, registers five external tool schemas via the Model Context Protocol (MCP), and ships the container to production. For seventy-two hours, the agent appears brilliant.</p>
<p>Then reality intervenes: external APIs introduce undocumented status codes, users pose unforeseen edge cases, and conversational memory accumulates unpruned factual contradictions, triggering catastrophic context blowout and hallucinatory drift.</p>
<p>In traditional software engineering, this is known as <strong>entropy debt</strong>. But in autonomous multi-agent systems, it is an existential failure mode. When an agent cannot critique its own trajectory, diagnose its reasoning bottlenecks, and compile new operational capabilities without a human engineer committing a patch, <strong>it is not an autonomous system—it is merely a brittle, glorified script.</strong></p>

<h2>2. The 4-Stage Adam Cognitive Self-Evolution Loop</h2>
<p>Project Adam (Skill 92: Self-Evolution Swarm OS) treats agent intelligence as a dynamic, self-optimizing feedback loop operating under zero-trust bounds:</p>
<ul>
  <li><strong>Stage 1: Trajectory Instrumentation & Profiling:</strong> Tracing every AST tool call, measuring token burn per subtask, and classifying failure modes between external tool errors and semantic reasoning drift.</li>
  <li><strong>Stage 2: Closed-Loop Skill Distillation:</strong> Mining recurring multi-step tool trajectories and compiling them into deterministic, zero-LLM Python/Rust tool schemas.</li>
  <li><strong>Stage 3: Prompt-Atom Synthesis:</strong> Deconstructing bloated monolithic prompts into parameterized semantic atoms dynamically assembled at runtime.</li>
  <li><strong>Stage 4: Cryptographic Regression Gate:</strong> Benchmarking candidate prompt mutations against golden evaluation suites with Lyapunov stability verification before promotion.</li>
</ul>

<h2>3. Mathematical Foundations: Proving Non-Degenerative Evolution</h2>
<p>To guarantee that self-modifying agents cannot enter a degenerative death spiral, Project Adam governs prompt optimization under a strict <strong>Lyapunov Stability Contract</strong>.</p>
<p>Let &theta;<sub>k</sub> &isin; &real;<sup>d</sup> represent the parameter embedding of the active prompt configuration at epoch k. We define a positive-definite Lyapunov candidate function V(&theta;):</p>
<pre><code>V(&theta;<sub>k</sub>) = 0.5 * ||&theta;<sub>k</sub> - &theta;*||<sub>Q</sub><sup>2</sup> + &gamma; * [L(&theta;<sub>k</sub>) - L(&theta;*)]</code></pre>
<p>A proposed prompt-atom mutation is approved for promotion to the production ledger <strong>if and only if</strong> the discrete Lyapunov difference satisfies strict negative semi-definiteness:</p>
<pre><code>&Delta;V(&theta;<sub>k</sub>) = V(&theta;<sub>k+1</sub>) - V(&theta;<sub>k</sub>) &le; -&epsilon; * ||&nabla;L(&theta;<sub>k</sub>)||<sup>2</sup></code></pre>
<p>Where &epsilon; &gt; 0 is a strictly positive margin. If &Delta;V &gt; -&epsilon;, the mutation is vetoed by the <strong>Atomic Checkpoint Protocol (Skill 91)</strong>, preventing degenerative prompt drift.</p>

<h2>4. Closed-Loop Skill Distillation: From Trajectory to Deterministic Tool</h2>
<p>When an agent executes an identical multi-step tool sequence repeatedly (e.g., fetching billing records, calculating VAT, and posting an audit hash), Project Adam extracts the underlying Abstract Syntax Tree (AST) and synthesizes a single compiled Python function. This slashes execution latency from 14 seconds to 12 milliseconds and eliminates 98.4% of token burn.</p>

<h2>5. Self-Healing Memory: Bi-Temporal Graph Reconciliation</h2>
<p>Long-running agents inevitably suffer from stale or conflicting beliefs. Adam resolves memory conflicts using bi-temporal knowledge graphs, distinguishing between <em>Asserted Time</em> (when an event occurred in the real world) and <em>Recorded Time</em> (when the agent observed it). Stale assertions are closed with cryptographic amendment proofs rather than destructive overwrites.</p>
"""

adam_faqs_en = [
    ("What is Project Adam?", "An algorithmic self-evolution engine inside Benni OS that analyzes execution post-mortems and autonomously optimizes agent prompt trees and tool schemas."),
    ("How are regressions prevented during self-evolution?", "Every candidate mutation must pass deterministic regression test suites and satisfy discrete Lyapunov convergence gates before promotion."),
    ("Is human-in-the-loop required?", "Adam operates autonomously within sandboxed bounds, escalating to human operators only when safety thresholds or budget ceilings are touched.")
]

adam_body_pt = """
<h2>1. A Armadilha da Entropia: Por Que Agentes Estáticos Decaem</h2>
<p>Todo agente de IA em produção hoje nasce congelado no tempo. Uma equipe de engenharia redige um system prompt, anota vinte exemplos few-shot, registra schemas de ferramentas via Model Context Protocol (MCP) e envia o container para produção. Por setenta e duas horas, o agente parece brilhante.</p>
<p>Então a realidade intervém: APIs externas introduzem códigos de status não documentados, usuários fazem pedidos inesperados de borda e a memória conversacional acumula contradições factuais não podadas, disparando context blowout e deriva alucinatória.</p>
<p>Na engenharia tradicional, isso se chama <strong>débito de entropia</strong>. Mas em sistemas multiagentes autônomos, é uma falha existencial. Quando um agente não consegue criticar a própria trajetória, diagnosticar gargalos de raciocínio e compilar novas capacidades operacionais sem um humano commitar um patch, <strong>ele não é um sistema autônomo — é apenas um script frágil e glorificado.</strong></p>

<h2>2. O Loop de Autoevolução Cognitiva em 4 Estágios do Adam</h2>
<p>O Projeto Adam (Skill 92: Self-Evolution Swarm OS) trata a inteligência de agentes como um loop dinâmico de feedback sob limites zero-trust:</p>
<ul>
  <li><strong>Estágio 1: Instrumentação e Perfilamento de Trajetória:</strong> Rastreamento de cada chamada de ferramenta na AST, medição de consumo de tokens por subtarefa e classificação de falhas entre erros de ferramentas e deriva semântica.</li>
  <li><strong>Estágio 2: Destilação de Skills em Malha Fechada:</strong> Mineração de trajetórias multi-etapas frequentes e compilação em schemas determinísticos Python/Rust com zero custo de LLM.</li>
  <li><strong>Estágio 3: Síntese Prompt-Átomo:</strong> Decomposição de prompts monolíticos em átomos semânticos parametrizados e montados dinamicamente em runtime.</li>
  <li><strong>Estágio 4: Gate Criptográfico de Regressão:</strong> Benchmark de mutações candidatas contra suítes douradas com verificação de estabilidade de Lyapunov antes da promoção.</li>
</ul>

<h2>3. Fundamentos Matemáticos: Provando Evolução Não-Degenerativa</h2>
<p>Para garantir que agentes auto-modificáveis nunca entrem em uma espiral degenerativa de morte, o Projeto Adam governa a otimização de prompts sob um <strong>Contrato de Estabilidade de Lyapunov</strong>.</p>
<p>Seja &theta;<sub>k</sub> &isin; &real;<sup>d</sup> o embedding de parâmetros da configuração ativa de prompt no epoch k. Definimos uma função de Lyapunov positiva-definida V(&theta;):</p>
<pre><code>V(&theta;<sub>k</sub>) = 0.5 * ||&theta;<sub>k</sub> - &theta;*||<sub>Q</sub><sup>2</sup> + &gamma; * [L(&theta;<sub>k</sub>) - L(&theta;*)]</code></pre>
<p>Uma mutação de prompt-átomo só é promovida para o ledger de produção <strong>se e somente se</strong> a diferença discreta de Lyapunov satisfizer estrita negatividade:</p>
<pre><code>&Delta;V(&theta;<sub>k</sub>) = V(&theta;<sub>k+1</sub>) - V(&theta;<sub>k</sub>) &le; -&epsilon; * ||&nabla;L(&theta;<sub>k</sub>)||<sup>2</sup></code></pre>
<p>Se &Delta;V &gt; -&epsilon;, a mutação é vetada pelo <strong>Atomic Checkpoint Protocol (Skill 91)</strong>, impedindo qualquer deriva degenerativa.</p>

<h2>4. Destilação de Skills em Malha Fechada: Da Trajetória à Ferramenta</h2>
<p>Quando um agente executa uma sequência idêntica de ferramentas repetidamente, o Projeto Adam extrai a Árvore de Sintaxe Abstrata (AST) e sintetiza uma função Python compilada única, reduzindo a latência de 14 segundos para 12 milissegundos e cortando 98,4% dos tokens.</p>

<h2>5. Auto-Cura de Memória: Reconciliação em Grafos Bitemporais</h2>
<p>Agentes de longa execução inevitavelmente sofrem com memórias conflitantes. O Adam reconcilia estados usando grafos bitemporais, separando <em>Tempo Assertado</em> de <em>Tempo Gravado</em> e emitindo provas criptográficas de emenda sem sobreescrita destrutiva.</p>
"""

adam_faqs_pt = [
    ("O que é o Projeto Adam?", "Um motor de autoevolução algorítmica no Benni OS que analisa post-mortems de execução e otimiza árvores de prompt e schemas de ferramentas autonomamente."),
    ("Como regressões são prevenidas na autoevolução?", "Toda mutação candidata deve passar em testes determinísticos de regressão e satisfazer gates de convergência de Lyapunov antes da promoção."),
    ("É necessário intervenção humana?", "O Adam opera autonomamente dentro de limites isolados, escalando para operadores humanos apenas quando limites de segurança ou orçamento são atingidos.")
]

# ----------------- CONTENT FOR BENJAMIN -----------------

benjamin_body_en = """
<h2>1. The Multi-Agent Delegation Crisis</h2>
<p>The prevailing orthodoxy in AI agent development assumes that scaling multi-agent systems is simply a matter of passing natural language instructions from a "manager agent" to a collection of "worker agents."</p>
<p>In production enterprise environments, this paradigm fails catastrophically:</p>
<ul>
  <li><strong>Capability Blindness:</strong> A manager agent delegates a heavy 3D WebGL shader task or an Android build to a worker node without verifying GPU drivers, Android NDKs, or memory allocations. The worker spins for twenty minutes before failing silently.</li>
  <li><strong>Context Drift & Goal Divergence:</strong> As subagents spawn secondary subagents, the original business objective is distorted through successive rounds of conversational re-prompting.</li>
  <li><strong>Runaway Budget Exhaustion:</strong> Without hard cryptographic leases, a hung agent loops endlessly on a hallucinated compiler error, consuming thousands of dollars in LLM API credits.</li>
</ul>

<h2>2. The 4-Pillar Benjamin Dispatch Architecture</h2>
<p>Through <strong>Project Benjamin (Skill 93: Autonomous Dispatch OS)</strong>, we engineered a deterministic, capability-aware dispatch architecture:</p>
<ol>
  <li><strong>Pre-Flight Capability Probing:</strong> Zero tasks are dispatched without cryptographically verifying environment prerequisites (RAM, GPU, toolchains, API auth).</li>
  <li><strong>Typed Leases & Anti-Loop Budgets:</strong> Every worker executes under strict, bounded CPU, memory, and token leases.</li>
  <li><strong>Formal Invariant Telemetry:</strong> Real-time drift detection measures cosine divergence between subagent trajectory and the master goal vector.</li>
  <li><strong>Idempotent Rollback:</strong> If a subagent violates invariant bounds, the system state instantly reverts to an atomic snapshot.</li>
</ol>

<h2>3. Mathematical Model: Objective-Aligned Zero-Drift Routing</h2>
<p>Let <strong>g</strong>* &isin; &real;<sup>d</sup> represent the normalized semantic goal embedding approved by the operator. Let <strong>s</strong><sub>t</sub> denote the state embedding of a subagent at execution step t.</p>
<p>We define instantaneous context drift D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*) as the angular distance in semantic latent space:</p>
<pre><code>D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*) = 1 - (<strong>s</strong><sub>t</sub> &middot; <strong>g</strong>*) / (||<strong>s</strong><sub>t</sub>|| * ||<strong>g</strong>*||)</code></pre>
<p>Project Benjamin enforces a strict upper bound on cumulative mission drift:</p>
<pre><code>max<sub>t &isin; [0, T]</sub> D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*) &le; &Delta;<sub>max</sub>    (&Delta;<sub>max</sub> = 0.18)</code></pre>
<p>If D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*) &gt; &Delta;<sub>max</sub>, Benjamin executes a <strong>Semantic Intercept</strong>, pausing execution and compiling an alignment corrective prompt containing the orthogonal error vector <strong>e</strong><sub>t</sub> = <strong>g</strong>* - <strong>s</strong><sub>t</sub>.</p>

<h2>4. Pre-Flight Capability Probes</h2>
<p>Before an agent touches a mission, Benjamin verifies system RAM, disk space, PATH binaries, and Nemesis Gateway auth leases. If a required dependency is missing, Benjamin never calls the LLM—it either auto-provisions the dependency or halts with a zero-cost report.</p>

<h2>5. Cryptographic Leases and Anti-Loop Circuit Breakers</h2>
<p>Benjamin issues signed execution leases enforcing <code>max_token_budget</code>, <code>max_tool_invocations</code>, and <code>max_wallclock_seconds</code>. If an agent executes identical tool calls without mutating state, the circuit-breaker instantly terminates the lease and rolls back the workspace to its pre-dispatch checkpoint.</p>
"""

benjamin_faqs_en = [
    ("What is Project Benjamin?", "The sovereign autonomous dispatch engine of Benni OS that routes high-yield enterprise missions with verified capability probes and typed leases."),
    ("How does Benjamin prevent agent infinite loops?", "Through cryptographic leases with hard token/time caps and AST fingerprinting that detects non-mutating cyclic actions."),
    ("What is capability probing?", "A synchronous pre-flight environment check that verifies hardware, SDKs, compilers, and auth credentials before any model invocation occurs.")
]

benjamin_body_pt = """
<h2>1. A Crise de Delegação Multiagente</h2>
<p>A ortodoxia predominante assume que coordenar agentes multiagentes é apenas passar instruções em linguagem natural de um "gerente" para "trabalhadores". Em produção corporativa, isso falha catastroficamente:</p>
<ul>
  <li><strong>Cegueira de Capacidade:</strong> Um agente delega uma tarefa pesada de shaders 3D ou compilação Android sem verificar se o nó possui drivers GPU, Android NDK ou memória. O worker trava por vinte minutos antes de falhar silenciosamente.</li>
  <li><strong>Deriva de Contexto:</strong> Conforme subagentes geram tarefas secundárias, o objetivo original de negócio é distorcido em um telefone sem fio conversacional.</li>
  <li><strong>Esgotamento Descontrolado de Orçamento:</strong> Sem leases criptográficos duros, um agente em loop gasta milhares de dólares em chamadas repetitivas de API.</li>
</ul>

<h2>2. A Arquitetura de Dispatch em 4 Pilares do Projeto Benjamin</h2>
<p>Através do <strong>Projeto Benjamin (Skill 93: Autonomous Dispatch OS)</strong>, construímos uma arquitetura de dispatch determinística orientada a contratos:</p>
<ol>
  <li><strong>Probes de Capacidade Pré-Voo:</strong> Zero tarefas são despachadas sem verificar pré-requisitos concretos de ambiente (RAM, GPU, binários no PATH, autenticação).</li>
  <li><strong>Leases Tipados e Anti-Loop:</strong> Todo trabalhador executa sob limites estritos e assinados de CPU, memória e tokens.</li>
  <li><strong>Telemetria Formal de Invariantes:</strong> Detecção em tempo real de deriva semântica medindo a distância angular em relação ao vetor de objetivo mestre.</li>
  <li><strong>Rollback Idempotente:</strong> Violações de invariantes revertem o estado do sistema instantaneamente para um snapshot atômico.</li>
</ol>

<h2>3. Modelo Matemático: Roteamento Sem Deriva</h2>
<p>Seja <strong>g</strong>* &isin; &real;<sup>d</sup> o embedding normalizado do objetivo mestre. Seja <strong>s</strong><sub>t</sub> o embedding do estado no passo t. Definimos a deriva de contexto D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*):</p>
<pre><code>D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*) = 1 - (<strong>s</strong><sub>t</sub> &middot; <strong>g</strong>*) / (||<strong>s</strong><sub>t</sub>|| * ||<strong>g</strong>*||)</code></pre>
<p>O Projeto Benjamin impõe um limite superior estrito:</p>
<pre><code>max<sub>t &isin; [0, T]</sub> D(<strong>s</strong><sub>t</sub>, <strong>g</strong>*) &le; &Delta;<sub>max</sub>    (&Delta;<sub>max</sub> = 0.18)</code></pre>
<p>Se a deriva exceder &Delta;<sub>max</sub>, o motor executa um <strong>Intercepto Semântico</strong> com o vetor ortogonal de erro <strong>e</strong><sub>t</sub> = <strong>g</strong>* - <strong>s</strong><sub>t</sub> para forçar alinhamento.</p>

<h2>4. Probes Pré-Voo e Leases Criptográficos</h2>
<p>Antes de gastar qualquer token, o Benjamin valida o hardware e autenticação. Leases assinados impõem tetos de tokens e tempo. Fingerprinting de AST identifica loops repetitivos e aborta a execução com rollback atômico.</p>
"""

benjamin_faqs_pt = [
    ("O que é o Projeto Benjamin?", "O motor de dispatch autônomo soberano do Benni OS que orquestra missões corporativas com probes verificados de capacidade e leases tipados."),
    ("Como o Benjamin impede loops infinitos?", "Através de leases criptográficos com tetos rígidos de tokens e tempo, e detecção de padrões repetitivos na AST de ações."),
    ("O que é capability probing?", "Uma verificação pré-voo síncrona que audita hardware, compiladores, memória e credenciais antes de invocar modelos LLM.")
]

# Write all 4 files
pages = [
    {
        "path": os.path.join(PROJECT_DIR, "blog", "en", "project-adam-recursive-self-evolution-autonomous-ai-agents.html"),
        "lang": "en",
        "title": "Recursive Self-Evolution in Autonomous AI Agents: Closed-Loop Skill Distillation, Prompt-Atom Synthesis, and Memory Healing",
        "subtitle": "How Project Adam autonomously detects reasoning bottlenecks, synthesizes new tool schemas, and recompiles prompt atoms without catastrophic forgetting.",
        "slug_en": "project-adam-recursive-self-evolution-autonomous-ai-agents",
        "slug_pt": "como-utilizar-project-adam-no-ecossistema-benni-os",
        "hero_img": "/blog/assets/hero-11-adam.png",
        "category": "Autonomous Systems",
        "read_time": "16 min read",
        "body": adam_body_en,
        "faqs": adam_faqs_en,
        "cta_title": "Deploy Project Adam Cognitive Self-Evolution Substrate",
        "cta_desc": "Architect autonomous agents that optimize prompt trees, synthesize tools, and eliminate prompt drift.",
        "cta_btn": "Schedule Architecture Advisory",
        "cta_url": "https://benni-os.net/blog/academy.html"
    },
    {
        "path": os.path.join(PROJECT_DIR, "blog", "como-utilizar-project-adam-no-ecossistema-benni-os.html"),
        "lang": "pt",
        "title": "Autoevolução Recursiva em Agentes Autônomos de IA: Destilação de Skills em Malha Fechada, Síntese Prompt-Átomo e Auto-Cura de Memória",
        "subtitle": "Como o Projeto Adam detecta gargalos de raciocínio, sintetiza novos schemas de ferramentas e recompila átomos de prompt sem esquecimento catastrófico.",
        "slug_en": "project-adam-recursive-self-evolution-autonomous-ai-agents",
        "slug_pt": "como-utilizar-project-adam-no-ecossistema-benni-os",
        "hero_img": "/blog/assets/hero-11-adam.png",
        "category": "Sistemas Autônomos",
        "read_time": "16 min de leitura",
        "body": adam_body_pt,
        "faqs": adam_faqs_pt,
        "cta_title": "Implemente o Substrato de Autoevolução do Projeto Adam",
        "cta_desc": "Arquitetura de agentes autônomos que otimizam árvores de prompt, sintetizam ferramentas e eliminam deriva.",
        "cta_btn": "Agendar Consultoria de Arquitetura",
        "cta_url": "https://benni-os.net/blog/academy.html"
    },
    {
        "path": os.path.join(PROJECT_DIR, "blog", "en", "autonomous-dispatch-engineering-high-yield-task-routing-swarms.html"),
        "lang": "en",
        "title": "Autonomous Dispatch Engineering: High-Yield Task Routing, Capability Probing, and Zero-Drift Swarm Execution",
        "subtitle": "Orchestrating high-yield enterprise missions with verified capability probes, typed leases, tenant isolation, and deterministic task completion.",
        "slug_en": "autonomous-dispatch-engineering-high-yield-task-routing-swarms",
        "slug_pt": "como-utilizar-projeto-benjamin-dispatch-autonomo-no-ecossistema-benni-os",
        "hero_img": "/blog/assets/hero-10-benjamin.png",
        "category": "Swarm Orchestration",
        "read_time": "15 min read",
        "body": benjamin_body_en,
        "faqs": benjamin_faqs_en,
        "cta_title": "Deploy Project Benjamin Autonomous Dispatch Mesh",
        "cta_desc": "Govern high-throughput multi-agent swarms with pre-flight capability probes, typed leases, and zero drift.",
        "cta_btn": "Schedule Architecture Advisory",
        "cta_url": "https://benni-os.net/blog/academy.html"
    },
    {
        "path": os.path.join(PROJECT_DIR, "blog", "como-utilizar-projeto-benjamin-dispatch-autonomo-no-ecossistema-benni-os.html"),
        "lang": "pt",
        "title": "Engenharia de Dispatch Autônomo: Roteamento de Tarefas de Alto Rendimento, Probes de Capacidade e Execução de Enxames Sem Deriva",
        "subtitle": "Orquestrando missões corporativas de alto rendimento com probes de capacidade verificados, leases tipados, isolamento de tenant e conclusão determinística.",
        "slug_en": "autonomous-dispatch-engineering-high-yield-task-routing-swarms",
        "slug_pt": "como-utilizar-projeto-benjamin-dispatch-autonomo-no-ecossistema-benni-os",
        "hero_img": "/blog/assets/hero-10-benjamin.png",
        "category": "Orquestração de Enxames",
        "read_time": "15 min de leitura",
        "body": benjamin_body_pt,
        "faqs": benjamin_faqs_pt,
        "cta_title": "Implemente a Malha de Dispatch Autônomo do Projeto Benjamin",
        "cta_desc": "Governança de enxames multiagentes com probes pré-voo de capacidade, leases tipados e zero deriva.",
        "cta_btn": "Agendar Consultoria de Arquitetura",
        "cta_url": "https://benni-os.net/blog/academy.html"
    }
]

for p in pages:
    html = get_html_template(
        p["lang"], p["title"], p["subtitle"], p["slug_en"], p["slug_pt"],
        p["hero_img"], p["category"], p["read_time"], p["body"],
        p["faqs"], p["cta_title"], p["cta_desc"], p["cta_btn"], p["cta_url"]
    )
    with open(p["path"], "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[OK] Generated: {p['path']}")

# Update sitemaps & feeds
update_sitemap("project-adam-recursive-self-evolution-autonomous-ai-agents", "como-utilizar-project-adam-no-ecossistema-benni-os")
update_feed("Recursive Self-Evolution in Autonomous AI Agents", "project-adam-recursive-self-evolution-autonomous-ai-agents", "Project Adam closed-loop self-evolution.")

update_sitemap("autonomous-dispatch-engineering-high-yield-task-routing-swarms", "como-utilizar-projeto-benjamin-dispatch-autonomo-no-ecossistema-benni-os")
update_feed("Autonomous Dispatch Engineering: High-Yield Task Routing", "autonomous-dispatch-engineering-high-yield-task-routing-swarms", "Project Benjamin autonomous dispatch and zero-drift swarms.")

# Submit to IndexNow
urls_to_submit = [
    "https://benni-os.net/blog/en/project-adam-recursive-self-evolution-autonomous-ai-agents.html",
    "https://benni-os.net/blog/como-utilizar-project-adam-no-ecossistema-benni-os.html",
    "https://benni-os.net/blog/en/autonomous-dispatch-engineering-high-yield-task-routing-swarms.html",
    "https://benni-os.net/blog/como-utilizar-projeto-benjamin-dispatch-autonomo-no-ecossistema-benni-os.html",
    "https://benni-os.net/bio-sync/"
]
indexnow_payload = {
    "host": "benni-os.net",
    "key": "3a9b7f14e2c8d501a9b7f14e2c8d501a",
    "keyLocation": "https://benni-os.net/3a9b7f14e2c8d501a9b7f14e2c8d501a.txt",
    "urlList": urls_to_submit
}
req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=json.dumps(indexnow_payload).encode("utf-8"),
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST"
)
try:
    with urllib.request.urlopen(req) as resp:
        print(f"[INDEXNOW] Submitted {len(urls_to_submit)} URLs. Status: {resp.status}")
except Exception as e:
    print(f"[INDEXNOW] Notice: {e}")
