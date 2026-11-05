#!/usr/bin/env python3
"""
Benni OS Sovereign Daily Publishing Engine
==========================================
Automates the daily syndication of elite engineering masterclasses across:
1. Dev.to (via Dev.to REST API)
2. Benni OS Sovereign Portal (https://benni-os.net)
   - English Masterclass (/blog/en/<slug>.html)
   - Portuguese Masterclass (/blog/<slug-pt>.html)
   - Interactive Language Switcher Pill (.lang-switcher-pill)
   - Schema.org JSON-LD (TechArticle, BlogPosting, FAQPage)
   - Sitemap.xml and RSS feed.xml updates
   - Automated Vite build test & Git promotion to main
3. Strict Proprietary Shield:
   - For private commercial systems: ZERO raw private code exposed, ZERO download commands.
   - Maximum engineering authority: formal mathematics, architecture flowcharts, benchmarks.
   - High-ticket conversion CTAs (Enterprise licensing, sovereign consultation, Benni Academy).
"""

import os
import sys
import json
import re
import datetime
import urllib.request
import urllib.error
import subprocess

PROJECT_DIR = r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io"
AUTOMATION_DIR = os.path.join(PROJECT_DIR, "automation")
CALENDAR_PATH = os.path.join(AUTOMATION_DIR, "daily_content_calendar.json")
STATE_PATH = os.path.join(AUTOMATION_DIR, "publication_state.json")
DEVTO_API_KEY = "WNN2GVYjuCkc129AzB4u7qqD"

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def publish_to_devto(title, body_markdown, tags, canonical_url):
    """Publishes or updates an article on Dev.to"""
    url = "https://dev.to/api/articles"
    payload = {
        "article": {
            "title": title,
            "published": True,
            "body_markdown": body_markdown,
            "tags": tags[:4],
            "canonical_url": canonical_url
        }
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "api-key": DEVTO_API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "BenniDailyPublisher/1.0"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            print(f"[DEVTO SUCCESS] Published: {res_data.get('url')} (ID: {res_data.get('id')})")
            return res_data
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"[DEVTO ERROR] HTTP {e.code}: {err_body}")
        raise

def update_sitemap(slug_en, slug_pt):
    sitemap_path = os.path.join(PROJECT_DIR, "public", "sitemap.xml")
    if not os.path.exists(sitemap_path):
        return
    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    url_en = f"https://benni-os.net/blog/en/{slug_en}.html"
    url_pt = f"https://benni-os.net/blog/{slug_pt}.html"
    
    if url_en in content:
        print("[SITEMAP] Already up to date.")
        return

    today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    block_en = f"""  <url>
    <loc>{url_en}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="{url_en}" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="{url_pt}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="{url_en}" />
    <lastmod>{today_str}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>{url_pt}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="{url_en}" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="{url_pt}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="{url_en}" />
    <lastmod>{today_str}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
"""
    new_content = content.replace("</urlset>", block_en + "</urlset>")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("[SITEMAP] Added URLs to public/sitemap.xml")

def update_feed(title, slug_en, description):
    feed_path = os.path.join(PROJECT_DIR, "public", "feed.xml")
    if not os.path.exists(feed_path):
        return
    with open(feed_path, "r", encoding="utf-8") as f:
        content = f.read()

    url_en = f"https://benni-os.net/blog/en/{slug_en}.html"
    if url_en in content:
        print("[FEED] Already up to date.")
        return

    now_rfc = datetime.datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT")
    item_block = f"""    <item>
      <title><![CDATA[{title}]]></title>
      <link>{url_en}</link>
      <guid isPermaLink="true">{url_en}</guid>
      <pubDate>{now_rfc}</pubDate>
      <author>bennialencar@benni-os.net (Benni Alencar)</author>
      <description><![CDATA[{description}]]></description>
    </item>
"""
    pos = content.find("<item>")
    if pos != -1:
        new_content = content[:pos] + item_block + content[pos:]
    else:
        new_content = content.replace("</channel>", item_block + "</channel>")
    with open(feed_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("[FEED] Added item to public/feed.xml")

def update_magazine_index(item):
    """Inserts the new article card into blog/index.html (EN) and blog/pt.html (PT)"""
    index_en = os.path.join(PROJECT_DIR, "blog", "index.html")
    index_pt = os.path.join(PROJECT_DIR, "blog", "pt.html")
    
    card_en = f"""        <article class="bento-card" data-category="{item['category']}">
          <a href="/blog/en/{item['slug_en']}.html" class="card-image-link">
            <div class="card-image-wrap">
              <img src="{item['hero_image']}" alt="{item['title_en']}" loading="lazy" class="card-thumbnail" />
              <div class="card-badge" style="color: #00f0ff; border-color: #00f0ff;">
                <span class="badge-dot" style="background: #00f0ff;"></span>
                {item['category']}
              </div>
            </div>
          </a>
          <div class="card-body">
            <div class="card-meta">
              <span>{item['reading_time']}</span> &bull; <span>Benni Alencar</span>
            </div>
            <h3 class="card-title">
              <a href="/blog/en/{item['slug_en']}.html">{item['title_en']}</a>
            </h3>
            <p class="card-excerpt">
              {item['summary_en']}
            </p>
            <div class="card-footer">
              <a href="/blog/en/{item['slug_en']}.html" class="card-read-more">Read Architecture Masterclass &rarr;</a>
            </div>
          </div>
        </article>
"""
    if os.path.exists(index_en):
        with open(index_en, "r", encoding="utf-8") as f:
            c = f.read()
        if item['slug_en'] not in c:
            anchor = '<section class="bento-grid">'
            if anchor in c:
                c = c.replace(anchor, anchor + "\n" + card_en)
                with open(index_en, "w", encoding="utf-8") as f:
                    f.write(c)
                print("[MAGAZINE] Injected card into blog/index.html")

    card_pt = f"""        <article class="bento-card" data-category="{item['category']}">
          <a href="/blog/{item['slug_pt']}.html" class="card-image-link">
            <div class="card-image-wrap">
              <img src="{item['hero_image']}" alt="{item['title_pt']}" loading="lazy" class="card-thumbnail" />
              <div class="card-badge" style="color: #00f0ff; border-color: #00f0ff;">
                <span class="badge-dot" style="background: #00f0ff;"></span>
                {item['category']}
              </div>
            </div>
          </a>
          <div class="card-body">
            <div class="card-meta">
              <span>{item['reading_time']}</span> &bull; <span>Benni Alencar</span>
            </div>
            <h3 class="card-title">
              <a href="/blog/{item['slug_pt']}.html">{item['title_pt']}</a>
            </h3>
            <p class="card-excerpt">
              {item['summary_pt']}
            </p>
            <div class="card-footer">
              <a href="/blog/{item['slug_pt']}.html" class="card-read-more">Ler Masterclass Completa &rarr;</a>
            </div>
          </div>
        </article>
"""
    if os.path.exists(index_pt):
        with open(index_pt, "r", encoding="utf-8") as f:
            c = f.read()
        if item['slug_pt'] not in c:
            anchor = '<section class="bento-grid">'
            if anchor in c:
                c = c.replace(anchor, anchor + "\n" + card_pt)
                with open(index_pt, "w", encoding="utf-8") as f:
                    f.write(c)
                print("[MAGAZINE] Injected card into blog/pt.html")

def verify_and_deploy():
    """Runs npm run build and git push"""
    print("[BUILD] Running npm run build...")
    res = subprocess.run(["npm", "run", "build"], cwd=PROJECT_DIR, capture_output=True, text=True, shell=True)
    if res.returncode != 0:
        print(f"[BUILD ERROR]\n{res.stderr}\n{res.stdout}")
        raise RuntimeError("Vite build failed.")
    print("[BUILD SUCCESS] Production bundle built cleanly.")

    print("[GIT] Staging, committing and pushing changes...")
    subprocess.run(["git", "add", "blog/", "public/", "automation/"], cwd=PROJECT_DIR, check=True, shell=True)
    commit_res = subprocess.run(["git", "commit", "-m", "feat(daily-publish): automated daily engineering masterclass [skip ci]"], cwd=PROJECT_DIR, capture_output=True, text=True, shell=True)
    print(commit_res.stdout)
    push_res = subprocess.run(["git", "push", "origin", "main"], cwd=PROJECT_DIR, capture_output=True, text=True, shell=True)
    if push_res.returncode != 0:
        print(f"[GIT PUSH ERROR]\n{push_res.stderr}")
        raise RuntimeError("Git push failed.")
    print("[GIT SUCCESS] Pushed to origin/main. GitHub Pages deployment triggered.")

if __name__ == "__main__":
    print("Benni OS Daily Publishing Engine Initialized.")
