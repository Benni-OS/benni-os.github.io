/* Benni OS Editorial Light + Dark Theme Toggle */
(function () {
  var STORAGE_KEY = "benni_editorial_theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("ed-theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.innerHTML = theme === "dark" ? "&#9728; Light" : "&#9790; Dark";
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  applyTheme(saved === "dark" ? "dark" : "light");

  function mountToggle() {
    var nav = document.querySelector("nav.nav-links") || document.querySelector("header .nav-container") || document.querySelector("header");
    if (!nav || document.getElementById("ed-theme-toggle")) return;
    var btn = document.createElement("button");
    btn.id = "ed-theme-toggle";
    btn.type = "button";
    btn.className = "ed-theme-toggle";
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
      applyTheme(next);
    });
    nav.appendChild(btn);
    applyTheme(root.getAttribute("data-theme") || "light");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }
})();
