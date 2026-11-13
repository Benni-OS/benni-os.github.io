/* BENNI·OS — Sovereign Blog & Portal Telemetry Engine v2.0 */
(function () {
  "use strict";

  if (window.__BENNI_BLOG_TELEMETRY__) return;
  window.__BENNI_BLOG_TELEMETRY__ = true;

  var STORAGE_KEY = "benni_blog_telemetry";
  var LEGACY_KEY = "benni_events";
  var CONFIG_URL = "/assets/telemetry-config.json";
  var DEFAULT_CONFIG = {
    site: "benni-os.net",
    ga4MeasurementId: "",
    cloudflareBeaconToken: "",
    plausibleDomain: "benni-os.net",
    goatcounterCode: "",
    customEndpoint: "",
    localDashboardStorage: true,
    readCompleteMinScrollPct: 75,
    readCompleteMinActiveSeconds: 20
  };

  var cfg = Object.assign({}, DEFAULT_CONFIG, window.__BENNI_TELEMETRY_CONFIG__ || {});
  var path = window.location.pathname || "/";
  var isBlog = path.indexOf("/blog") === 0;
  var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("pt") === 0 || path.indexOf("/blog/en/") === -1 && isBlog && path !== "/blog/" && path !== "/blog/index.html"
    ? "pt-BR"
    : "en";
  if (path === "/blog/pt.html") lang = "pt-BR";
  if (path === "/blog/" || path === "/blog/index.html" || path.indexOf("/blog/en/") === 0) lang = "en";

  var slug = path.replace(/^\/+|\/+$/g, "").replace(/^blog\/(?:en\/)?/, "").replace(/\.html$/, "") || "index";
  var sessionId = getOrCreateSessionId();
  var maxScrollPct = 0;
  var firedMilestones = {};
  var readCompleted = false;
  var exitSent = false;
  var activeMs = 0;
  var lastVisibleTs = document.visibilityState === "hidden" ? null : Date.now();
  var pendingEvents = [];
  var collectorsReady = false;

  function getOrCreateSessionId() {
    try {
      var sid = sessionStorage.getItem("benni_sid");
      if (!sid) {
        sid = "bs_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
        sessionStorage.setItem("benni_sid", sid);
      }
      return sid;
    } catch (_) {
      return "bs_" + Math.random().toString(36).slice(2, 10);
    }
  }

  function getUtms() {
    var params = new URLSearchParams(window.location.search || "");
    var utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = params.get(k);
      if (v) utm[k] = v;
    });
    return utm;
  }

  function classifyReferrer(ref) {
    if (!ref) return { domain: "direct", channel: "direct" };
    try {
      var u = new URL(ref);
      var host = u.hostname.toLowerCase();
      if (host.indexOf("benni-os.net") !== -1 || host === window.location.hostname) {
        return { domain: host, channel: "internal" };
      }
      if (/google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.|baidu\.|ecosia\./.test(host)) {
        return { domain: host, channel: "organic" };
      }
      if (host.indexOf("dev.to") !== -1 || host.indexOf("medium.com") !== -1 || host.indexOf("hashnode") !== -1) {
        return { domain: host, channel: "dev_community" };
      }
      if (host.indexOf("github.com") !== -1) {
        return { domain: host, channel: "github" };
      }
      if (/t\.co|twitter\.com|x\.com|linkedin\.com|reddit\.com|news\.ycombinator\.com|youtube\.com/.test(host)) {
        return { domain: host, channel: "social" };
      }
      return { domain: host, channel: "referral" };
    } catch (_) {
      return { domain: "unknown", channel: "referral" };
    }
  }

  function getArticleMetadata() {
    var catEl = document.querySelector(".article-category, .badge, [data-category]");
    var h1El = document.querySelector("h1");
    var mainEl = document.querySelector("article, main, .article-content, .content");
    var textLen = mainEl ? (mainEl.innerText || "").trim().split(/\s+/).filter(Boolean).length : 0;
    return {
      title: (h1El && h1El.textContent ? h1El.textContent.trim() : document.title).slice(0, 140),
      category: catEl && catEl.textContent ? catEl.textContent.trim().slice(0, 60) : (isBlog ? "Engineering" : "Portal"),
      word_count: textLen,
      est_read_min: textLen > 0 ? Math.max(1, Math.round(textLen / 220)) : 0
    };
  }

  function syncActiveMs() {
    if (lastVisibleTs !== null) {
      activeMs += Math.max(0, Date.now() - lastVisibleTs);
      lastVisibleTs = document.visibilityState === "hidden" ? null : Date.now();
    }
  }

  function getActiveSeconds() {
    syncActiveMs();
    return Math.round(activeMs / 1000);
  }

  function persistLocal(entry) {
    if (!cfg.localDashboardStorage) return;
    try {
      var list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      list.push(entry);
      if (list.length > 500) list = list.slice(-500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      var legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
      legacy.push({
        name: entry.event,
        props: entry.props,
        timestamp: entry.ts
      });
      if (legacy.length > 200) legacy = legacy.slice(-200);
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));
    } catch (_) {}
  }

  function dispatchRemote(entry) {
    if (typeof window.gtag === "function" && cfg.ga4MeasurementId) {
      window.gtag("event", entry.event, Object.assign({}, entry.props, {
        page_path: path,
        page_lang: lang,
        article_slug: slug
      }));
    }
    if (typeof window.plausible === "function") {
      try {
        window.plausible(entry.event, {
          props: {
            slug: slug,
            lang: lang,
            channel: entry.props.channel || "",
            milestone: entry.props.milestone || "",
            target_type: entry.props.target_type || ""
          }
        });
      } catch (_) {}
    }
    var endpoint = window.__BENNI_ANALYTICS_ENDPOINT__ || cfg.customEndpoint;
    if (endpoint) {
      var payload = JSON.stringify(entry);
      if (entry.beacon && navigator.sendBeacon) {
        try {
          navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
          return;
        } catch (_) {}
      }
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      }).catch(function () {});
    }
  }

  function emit(eventName, props, opts) {
    var entry = {
      event: eventName,
      ts: Date.now(),
      sid: sessionId,
      path: path,
      slug: slug,
      lang: lang,
      is_blog: isBlog,
      beacon: Boolean(opts && opts.beacon),
      props: props || {}
    };
    persistLocal(entry);
    if (collectorsReady) {
      dispatchRemote(entry);
    } else {
      pendingEvents.push(entry);
    }
  }

  function loadScript(src, attrs) {
    return new Promise(function (resolve) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.async = true;
      if (attrs) {
        Object.keys(attrs).forEach(function (k) {
          s.setAttribute(k, attrs[k]);
        });
      }
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  function initCollectors(loadedCfg) {
    cfg = Object.assign({}, cfg, loadedCfg || {});
    var tasks = [];

    if (cfg.ga4MeasurementId && !window.__BENNI_GA4_LOADED__) {
      window.__BENNI_GA4_LOADED__ = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.ga4MeasurementId, {
        page_path: path,
        page_title: document.title,
        custom_map: { dimension1: "article_slug", dimension2: "page_lang" }
      });
      tasks.push(loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4MeasurementId)));
    }

    if (cfg.plausibleDomain && !window.plausible) {
      tasks.push(loadScript("https://plausible.io/js/script.js", { "data-domain": cfg.plausibleDomain }));
    }

    if (cfg.cloudflareBeaconToken) {
      tasks.push(loadScript("https://static.cloudflareinsights.com/beacon.min.js", {
        "data-cf-beacon": JSON.stringify({ token: cfg.cloudflareBeaconToken })
      }));
    }

    if (cfg.goatcounterCode) {
      tasks.push(loadScript("https://" + cfg.goatcounterCode + ".goatcounter.com/count.js", {
        "data-goatcounter": "https://" + cfg.goatcounterCode + ".goatcounter.com/count"
      }));
    }

    Promise.all(tasks).finally(function () {
      collectorsReady = true;
      while (pendingEvents.length > 0) {
        dispatchRemote(pendingEvents.shift());
      }
    });
  }

  function computeScrollPct() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || document.body.scrollTop || 0;
    var scrollHeight = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0) - window.innerHeight;
    if (scrollHeight <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
  }

  function maybeCompleteRead() {
    if (!isBlog || readCompleted) return;
    if (maxScrollPct >= (cfg.readCompleteMinScrollPct || 75) && getActiveSeconds() >= (cfg.readCompleteMinActiveSeconds || 20)) {
      readCompleted = true;
      emit("blog_read_complete", {
        slug: slug,
        lang: lang,
        max_scroll_pct: maxScrollPct,
        active_seconds: getActiveSeconds()
      });
    }
  }

  function onScroll() {
    var pct = computeScrollPct();
    if (pct > maxScrollPct) maxScrollPct = pct;
    [25, 50, 75, 100].forEach(function (milestone) {
      if (pct >= milestone && !firedMilestones[milestone]) {
        firedMilestones[milestone] = true;
        emit("blog_scroll_depth", {
          slug: slug,
          lang: lang,
          milestone: milestone + "%",
          active_seconds: getActiveSeconds()
        });
      }
    });
    maybeCompleteRead();
  }

  function sendExitBeacon() {
    if (exitSent) return;
    exitSent = true;
    emit("blog_engaged_exit", {
      slug: slug,
      lang: lang,
      active_seconds: getActiveSeconds(),
      max_scroll_pct: maxScrollPct,
      completed: readCompleted
    }, { beacon: true });
  }

  function bindEvents() {
    var scrollQueued = false;
    window.addEventListener("scroll", function () {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(function () {
        scrollQueued = false;
        onScroll();
      });
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        syncActiveMs();
        maybeCompleteRead();
      } else {
        lastVisibleTs = Date.now();
      }
    });

    window.addEventListener("pagehide", sendExitBeacon);

    document.addEventListener("copy", function () {
      var sel = window.getSelection ? window.getSelection() : null;
      var anchor = sel && sel.anchorNode ? sel.anchorNode.parentElement : null;
      if (anchor && anchor.closest && anchor.closest("pre, code")) {
        emit("blog_code_copy", {
          slug: slug,
          lang: lang,
          chars: String(sel).length
        });
      }
    });

    document.addEventListener("click", function (ev) {
      var link = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#") return;

      var targetType = "";
      if (link.classList.contains("lang-switcher-pill") || /\/blog\/(en\/)?/.test(href) && (link.textContent || "").match(/EN|PT|English|Portugu/i)) {
        targetType = "lang_switch";
      } else if (href.indexOf("github.com") !== -1) {
        targetType = "github_repo";
      } else if (href.indexOf("dev.to") !== -1) {
        targetType = "devto";
      } else if (href.indexOf("academy.html") !== -1) {
        targetType = "academy_cta";
      } else if (/^https?:\/\//i.test(href) && href.indexOf(window.location.hostname) === -1) {
        targetType = "external";
      }

      if (targetType) {
        emit("blog_outbound_click", {
          slug: slug,
          lang: lang,
          target_type: targetType,
          href: href.slice(0, 180)
        }, { beacon: true });
      }
    });

    setInterval(maybeCompleteRead, 5000);
  }

  // Initial pageview recording immediately (flushed once config/collectors resolve)
  var refInfo = classifyReferrer(document.referrer || "");
  var utms = getUtms();
  var meta = getArticleMetadata();
  emit("blog_pageview", Object.assign({
    slug: slug,
    lang: lang,
    title: meta.title,
    category: meta.category,
    word_count: meta.word_count,
    est_read_min: meta.est_read_min,
    referrer: refInfo.domain,
    channel: utms.utm_source ? "utm:" + utms.utm_source : refInfo.channel
  }, utms));

  bindEvents();

  fetch(CONFIG_URL, { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(initCollectors)
    .catch(function () { initCollectors({}); });

  window.BenniBlogTelemetry = {
    track: emit,
    getConfig: function () { return Object.assign({}, cfg); },
    getStats: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      } catch (_) {
        return [];
      }
    }
  };
})();
