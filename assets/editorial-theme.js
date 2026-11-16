/* ==========================================================================
   BENNI OS EDITORIAL ENGINE v2.0 (Alabaster Light & Obsidian Dark)
   - Zero-FOUC Theme Persistence
   - Smooth Reading Progress Bar (Article Pages)
   - SVG Favicon Fallback (Eliminates /favicon.ico 404)
   - Accessible Theme Toggle Mounted in Nav
   ========================================================================== */
(function () {
  var STORAGE_KEY = "benni_editorial_theme";
  var root = document.documentElement;

  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}

  var initialTheme = saved === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", initialTheme);

  function ensureFavicon() {
    if (!document.head) return;
    if (document.querySelector('link[rel~="icon"]')) return;
    var link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23111318'/%3E%3Cpath d='M32 10L51 21v22L32 54 13 43V21L32 10z' fill='none' stroke='%239a6f22' stroke-width='3'/%3E%3Ccircle cx='32' cy='32' r='7' fill='%231d4ed8'/%3E%3C/svg%3E";
    document.head.appendChild(link);
  }

  function updateToggleLabel(btn, theme) {
    if (!btn) return;
    var isDark = theme === "dark";
    btn.setAttribute("aria-pressed", String(isDark));
    btn.title = isDark ? "Switch to Alabaster Light" : "Switch to Obsidian Dark";
    btn.innerHTML = isDark
      ? '<span aria-hidden="true">&#9728;</span><span>Light</span>'
      : '<span aria-hidden="true">&#9790;</span><span>Dark</span>';
  }

  function mountReadProgress() {
    if (!document.body) return;
    var hasGrid = document.querySelector("#articles-grid");
    var hasArticle =
      !hasGrid &&
      document.querySelector(
        ".article-body, .article-content, .article-wrapper, article, main"
      );
    if (!hasArticle || document.querySelector(".ed-read-progress")) return;

    var bar = document.createElement("div");
    bar.className = "ed-read-progress";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "Reading progress");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.style.width = "0%";
    document.body.appendChild(bar);

    var ticking = false;
    function updateBar() {
      ticking = false;
      var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      var docHeight =
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        ) - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      bar.style.width = pct.toFixed(2) + "%";
      bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateBar);
        }
      },
      { passive: true }
    );
    updateBar();
  }

  function mountToggle() {
    ensureFavicon();
    mountReadProgress();

    var nav =
      document.querySelector("header nav.nav-links") ||
      document.querySelector(".site-header nav") ||
      document.querySelector("header nav");
    if (!nav || document.getElementById("ed-theme-toggle")) return;

    var btn = document.createElement("button");
    btn.id = "ed-theme-toggle";
    btn.type = "button";
    btn.className = "ed-theme-toggle";
    updateToggleLabel(btn, root.getAttribute("data-theme"));

    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
      updateToggleLabel(btn, next);
    });

    nav.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }
})();
