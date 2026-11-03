// src/wave14/performance.ts
function initWave14() {
  console.log("\u{1F30A} Wave 14 \u2013 Performance & Content Integration (Vite + PWA)");
  const lazyElements = document.querySelectorAll("img.lazy, video.lazy, .lazy");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.tagName === "IMG" && el.dataset.src) {
            el.src = el.dataset.src;
            el.onload = () => el.classList.add("loaded");
          }
          if (el.tagName === "VIDEO" && el.dataset.src) {
            el.src = el.dataset.src;
            el.load();
            el.classList.add("loaded");
          }
          if (el.dataset.src && el.tagName !== "IMG" && el.tagName !== "VIDEO") {
            el.style.backgroundImage = `url(${el.dataset.src})`;
            el.classList.add("loaded");
          }
          observer.unobserve(el);
        }
      });
    }, { rootMargin: "200px 0px" });
    lazyElements.forEach((el) => observer.observe(el));
  }
  const threeSection = document.querySelector("#benjaminPullquote, #wave12-canvas");
  let threeLoaded = typeof THREE !== "undefined";
  function loadThree() {
    if (threeLoaded || typeof THREE !== "undefined") {
      threeLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        threeLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  if (threeSection && "IntersectionObserver" in window && !threeLoaded) {
    const threeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !threeLoaded) {
          loadThree().then(() => {
            console.log("\u2705 Three.js carregado sob demanda");
            if (window.__BENNI_DROP__?.init) window.__BENNI_DROP__.init();
          }).catch(() => console.warn("\u26A0\uFE0F Three.js falhou, usando fallback 2D"));
        }
      });
    }, { rootMargin: "400px 0px" });
    threeObserver.observe(threeSection);
  }
  async function loadPuterContent() {
    if (typeof puter === "undefined") {
      console.log("\u2139\uFE0F Puter SDK em modo offline/local");
      return;
    }
    try {
      const kv = puter.kv;
      if (!kv) return;
      const keys = ["hero_title", "hero_body", "dossier_declaration"];
      for (const key of keys) {
        const value = await kv.get(key);
        if (value) {
          const el = document.querySelector(`[data-content="${key}"]`);
          if (el) {
            el.innerHTML = value;
            el.classList.remove("dynamic-content-placeholder");
          }
        }
      }
      console.log("\u2705 Conte\xFAdo din\xE2mico do Puter carregado com sucesso");
    } catch (e) {
      console.warn("\u26A0\uFE0F Informa\xE7\xE3o Puter KV:", e);
    }
  }
  if (document.readyState === "complete") {
    loadPuterContent();
  } else {
    window.addEventListener("load", loadPuterContent);
  }
  if ("performance" in window && "PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          const lcp = last.startTime;
          console.log(`\u{1F4CA} LCP (Largest Contentful Paint): ${Math.round(lcp)}ms`);
          if (lcp > 2500) console.warn("\u26A0\uFE0F LCP alto. Otimize imagens e fontes.");
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (_) {
    }
  }
  console.log("\u2705 Wave 14 (Vite + PWA) ativada!");
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWave14);
} else {
  initWave14();
}

// src/sovereign-ui/experience-bus.ts
var owned = /* @__PURE__ */ new WeakMap();
function acquireExperienceBus(view = window) {
  if (!view?.document || !view.requestAnimationFrame || !view.cancelAnimationFrame) {
    throw new Error("BROWSER_FRAME_CAPABILITY_REQUIRED");
  }
  if (view.__BENNI_RUNTIME__ && !owned.has(view)) {
    const bus = view.__BENNI_RUNTIME__;
    if (typeof bus.onFrame !== "function" || typeof bus.onScroll !== "function") {
      throw new Error("EXISTING_RUNTIME_REQUIRES_ONFRAME_ADAPTER");
    }
    if (bus.version === "benni.shared-bus/v1" && typeof bus.acquireLease === "function") {
      return bus.acquireLease();
    }
    return { bus, release() {
    }, ownership: "existing_host_bus" };
  }
  let record = owned.get(view);
  if (!record) {
    const frames = /* @__PURE__ */ new Set();
    const scroll = /* @__PURE__ */ new Set();
    const resize = /* @__PURE__ */ new Set();
    const pointer = /* @__PURE__ */ new Set();
    const removals = [];
    let raf = null;
    let tickerAttached = false;
    let previous = null;
    let ticks = 0;
    let errors = [];
    const ticker = view.gsap?.ticker;
    const clockMode = ticker?.add && ticker?.remove ? "existing_gsap_ticker" : "shared_native_raf";
    const report = (error) => {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(msg);
      errors = errors.slice(-20);
    };
    const publish = (subscribers, ...args) => {
      for (const callback of [...subscribers]) {
        try {
          callback(...args);
        } catch (error) {
          report(error);
          subscribers.delete(callback);
        }
      }
    };
    const schedule = () => {
      const active = frames.size > 0 && !view.document.hidden;
      if (!active) {
        if (raf !== null) view.cancelAnimationFrame(raf);
        raf = null;
        if (tickerAttached && ticker) ticker.remove(tickerCallback);
        tickerAttached = false;
        previous = null;
        return;
      }
      if (clockMode === "existing_gsap_ticker" && ticker) {
        if (!tickerAttached) {
          tickerAttached = true;
          ticker.add(tickerCallback);
        }
      } else if (raf === null) {
        raf = view.requestAnimationFrame(tick);
      }
    };
    const tick = (timestamp) => {
      raf = null;
      const delta = previous === null ? 0 : Math.min(0.1, Math.max(0, (timestamp - previous) / 1e3));
      previous = timestamp;
      ticks++;
      publish(frames, delta, timestamp);
      schedule();
    };
    const tickerCallback = (seconds) => tick(seconds * 1e3);
    const listen = (target, event, callback) => {
      target.addEventListener(event, callback, { passive: true });
      removals.push(() => target.removeEventListener(event, callback));
    };
    const state = {
      scrollY: 0,
      scrollProgress: 0,
      width: view.innerWidth,
      height: view.innerHeight
    };
    const measure = () => {
      const element = view.document.scrollingElement;
      state.scrollY = element?.scrollTop || view.scrollY || 0;
      state.scrollProgress = state.scrollY / Math.max(1, (element?.scrollHeight || 0) - (element?.clientHeight || view.innerHeight || 0));
    };
    listen(view, "scroll", () => {
      measure();
      publish(scroll, state.scrollProgress, state.scrollY, 0);
    });
    listen(view, "resize", () => {
      state.width = view.innerWidth;
      state.height = view.innerHeight;
      measure();
      publish(resize, state.width, state.height, Math.min(view.devicePixelRatio || 1, 2));
    });
    listen(view, "pointermove", (event) => {
      publish(
        pointer,
        event.clientX,
        event.clientY,
        event.clientX / Math.max(1, view.innerWidth) * 2 - 1,
        event.clientY / Math.max(1, view.innerHeight) * 2 - 1
      );
    });
    listen(view.document, "visibilitychange", schedule);
    measure();
    const collect = () => {
      if (record?.refs === 0 && frames.size + scroll.size + resize.size + pointer.size === 0) {
        bus.destroy();
        if (view.__BENNI_RUNTIME__ === bus) delete view.__BENNI_RUNTIME__;
        owned.delete(view);
      }
    };
    const subscribe = (set, callback, clock = false) => {
      if (typeof callback !== "function") throw new Error("BUS_CALLBACK_REQUIRED");
      set.add(callback);
      if (clock) schedule();
      return () => {
        set.delete(callback);
        if (clock) schedule();
        collect();
      };
    };
    const bus = {
      version: "benni.shared-bus/v1",
      frame_unit: "seconds",
      get scrollY() {
        return state.scrollY;
      },
      get scrollProgress() {
        return state.scrollProgress;
      },
      get width() {
        return state.width;
      },
      get height() {
        return state.height;
      },
      onFrame: (callback) => subscribe(frames, callback, true),
      onScroll: (callback) => subscribe(scroll, callback),
      onResize: (callback) => subscribe(resize, callback),
      onPointerMove: (callback) => subscribe(pointer, callback),
      diagnostics: () => ({
        lease_refs: record?.refs ?? 0,
        clock_mode: clockMode,
        active_frame_subscribers: frames.size,
        pending_native_raf: raf === null ? 0 : 1,
        ticks,
        callback_errors: [...errors],
        total_subscribers: frames.size + scroll.size + resize.size + pointer.size
      }),
      acquireLease: () => {
        if (!record) throw new Error("BUS_NOT_INITIALIZED");
        record.refs++;
        let released = false;
        return {
          bus,
          ownership: "shared_owned_bus",
          release() {
            if (released || !record) return;
            released = true;
            record.refs--;
            if (record.refs === 0 && bus.diagnostics().total_subscribers === 0) {
              bus.destroy();
              if (view.__BENNI_RUNTIME__ === bus) delete view.__BENNI_RUNTIME__;
              owned.delete(view);
            }
          }
        };
      },
      destroy() {
        frames.clear();
        scroll.clear();
        resize.clear();
        pointer.clear();
        schedule();
        removals.splice(0).forEach((remove) => remove());
      }
    };
    record = { bus, refs: 0 };
    owned.set(view, record);
    view.__BENNI_RUNTIME__ = bus;
  }
  return record.bus.acquireLease();
}

// src/sovereign-ui/halo.ts
var HaloEngine = class {
  canvas = null;
  ctx = null;
  width = 0;
  height = 0;
  breathPhase = 0;
  scrollVelocity = 0;
  lastScrollY = 0;
  unsubscribeFrame = null;
  init() {
    let existing = document.getElementById("benni-halo-canvas");
    if (!existing) {
      existing = document.createElement("canvas");
      existing.id = "benni-halo-canvas";
      existing.setAttribute("aria-hidden", "true");
      existing.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:1;mix-blend-mode:screen;opacity:0.65;";
      document.body.prepend(existing);
    }
    this.canvas = existing;
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    const { bus } = acquireExperienceBus(window);
    bus.onResize(() => this.resize());
    bus.onScroll((_, scrollY) => this.onScroll(scrollY));
    this.unsubscribeFrame = bus.onFrame((delta) => this.render(delta));
  }
  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.max(1, Math.floor(this.width / 2));
    this.canvas.height = Math.max(1, Math.floor(this.height / 2));
  }
  onScroll(currentY) {
    this.scrollVelocity = Math.min(Math.abs(currentY - this.lastScrollY) * 0.05, 1.5);
    this.lastScrollY = currentY;
  }
  render = (delta) => {
    if (!this.ctx || !this.canvas) return;
    this.breathPhase += Math.max(8e-3, delta * 0.9);
    this.scrollVelocity *= 0.92;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.35 + Math.sin(this.breathPhase * 0.7) * 20;
    const baseRadius = Math.min(w, h) * (0.35 + Math.sin(this.breathPhase) * 0.05 + this.scrollVelocity * 0.1);
    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, baseRadius));
    grad.addColorStop(0, "rgba(212, 175, 55, 0.22)");
    grad.addColorStop(0.35, "rgba(212, 175, 55, 0.08)");
    grad.addColorStop(0.7, "rgba(120, 95, 25, 0.02)");
    grad.addColorStop(1, "rgba(5, 5, 7, 0)");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);
  };
  dispose() {
    this.unsubscribeFrame?.();
    this.unsubscribeFrame = null;
  }
};

// src/sovereign-ui/lumen.ts
var LumenSpotlight = class {
  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;
  targetX = window.innerWidth / 2;
  targetY = window.innerHeight / 2;
  spotlightEl = null;
  init() {
    let el = document.getElementById("benni-lumen-spotlight");
    if (!el) {
      el = document.createElement("div");
      el.id = "benni-lumen-spotlight";
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = "position:fixed;top:0;left:0;width:400px;height:400px;border-radius:50%;pointer-events:none;z-index:2;transform:translate(-50%, -50%);background:radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 45%, transparent 70%);mix-blend-mode:screen;transition:opacity 0.3s ease;";
      document.body.appendChild(el);
    }
    this.spotlightEl = el;
    const { bus } = acquireExperienceBus(window);
    bus.onPointerMove((clientX, clientY) => {
      this.targetX = clientX;
      this.targetY = clientY;
    });
    bus.onFrame(() => this.loop());
  }
  loop = () => {
    this.mouseX += (this.targetX - this.mouseX) * 0.12;
    this.mouseY += (this.targetY - this.mouseY) * 0.12;
    if (this.spotlightEl) {
      this.spotlightEl.style.transform = `translate3d(${(this.mouseX - 200).toFixed(1)}px, ${(this.mouseY - 200).toFixed(1)}px, 0)`;
    }
  };
};

// src/sovereign-ui/magnet.ts
var MagnetField = class {
  elements = [];
  init() {
    this.refresh();
    window.addEventListener("pointermove", (e) => this.onMove(e));
  }
  refresh() {
    this.elements = Array.from(document.querySelectorAll("[data-magnet], .btn-monumental, .btn-primary, .adam-action-pill"));
  }
  onMove(e) {
    const radius = 80;
    for (const el of this.elements) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);
      if (distance < radius) {
        const pull = 1 - distance / radius;
        const moveX = distX * pull * 0.32;
        const moveY = distY * pull * 0.32;
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      } else {
        el.style.transform = "";
      }
    }
  }
};

// src/sovereign-ui/liquid.ts
var LiquidSurface = class {
  init() {
    const cards = document.querySelectorAll("[data-liquid], .hero-card, .stack-card, .product-card");
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        card.style.setProperty("--liquid-x", `${x}%`);
        card.style.setProperty("--liquid-y", `${y}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--liquid-x", "50%");
        card.style.setProperty("--liquid-y", "50%");
      });
    });
  }
};

// src/sovereign-ui/cera.ts
var CeraHaptics = class _CeraHaptics {
  static trigger(type = "subtle") {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        switch (type) {
          case "subtle":
            navigator.vibrate(8);
            break;
          case "medium":
            navigator.vibrate(22);
            break;
          case "heavy":
            navigator.vibrate([35, 20, 35]);
            break;
        }
      } catch (_) {
      }
    }
  }
  attachListeners() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest("button, a, [data-magnet]");
      if (target) {
        _CeraHaptics.trigger("subtle");
      }
    });
  }
};

// src/sovereign-ui/aura.ts
var AuraAtmosphere = class {
  init() {
    let aura = document.getElementById("benni-aura-layer");
    if (!aura) {
      aura = document.createElement("div");
      aura.id = "benni-aura-layer";
      aura.setAttribute("aria-hidden", "true");
      aura.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 70% 60% at 50% 20%, rgba(212,175,55,0.035), transparent 80%);";
      document.body.prepend(aura);
    }
  }
};

// src/sovereign-ui/veu.ts
var VeuCinematics = class {
  init() {
    let vignette = document.getElementById("benni-veu-vignette");
    if (!vignette) {
      vignette = document.createElement("div");
      vignette.id = "benni-veu-vignette";
      vignette.setAttribute("aria-hidden", "true");
      vignette.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9;box-shadow:inset 0 0 120px rgba(5,5,7,0.85);";
      document.body.appendChild(vignette);
    }
  }
};

// src/sovereign-ui/ritual.ts
var RitualProgress = class {
  maxProgress = 0;
  progressBar = null;
  init() {
    let bar = document.getElementById("benni-ritual-ruler");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "benni-ritual-ruler";
      bar.setAttribute("aria-hidden", "true");
      bar.style.cssText = "position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg, #D4AF37, #FFFFFF);z-index:9999;width:0%;transition:width 0.1s linear;box-shadow:0 0 8px rgba(212,175,55,0.7);";
      document.body.appendChild(bar);
    }
    this.progressBar = bar;
    window.addEventListener("scroll", () => this.update(), { passive: true });
    this.update();
  }
  update() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const current = window.scrollY / totalHeight;
    this.maxProgress = Math.max(this.maxProgress, current);
    if (this.progressBar) {
      this.progressBar.style.width = `${(current * 100).toFixed(2)}%`;
    }
  }
};

// src/sovereign-ui/flux.ts
var FluxParticles = class {
  canvas = null;
  ctx = null;
  particles = [];
  init() {
    let canvas = document.getElementById("benni-flux-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "benni-flux-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0.4;";
      document.body.prepend(canvas);
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    const { bus } = acquireExperienceBus(window);
    bus.onResize(() => this.resize());
    this.particles = [];
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas.width || 800),
        y: Math.random() * (this.canvas.height || 600),
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.3,
        size: 1 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.5
      });
    }
    bus.onFrame(() => this.render());
  }
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  render = () => {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#D4AF37";
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  };
};

// src/sovereign-ui/soundscape.ts
var ProceduralSoundscape = class {
  ctx = null;
  isMuted = true;
  masterGain = null;
  init() {
    const saved = localStorage.getItem("benni_sound_enabled");
    if (saved === "true") {
      this.isMuted = false;
    }
    this.injectControl();
  }
  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  playClick(freq = 880) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.2, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1e-3, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
  playSubDrone() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(54, this.ctx.currentTime);
    gain.gain.setValueAtTime(1e-3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(1e-4, this.ctx.currentTime + 2.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.6);
  }
  toggle() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem("benni_sound_enabled", String(!this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
    }
    if (!this.isMuted) {
      this.playClick(440);
    }
    this.updateButton();
    return !this.isMuted;
  }
  injectControl() {
    let btn = document.getElementById("benni-sound-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "benni-sound-toggle";
      btn.className = "nav-sound-toggle";
      btn.title = "Soundscape Procedural";
      btn.style.cssText = "position:fixed;bottom:24px;left:24px;z-index:999;background:rgba(15,15,20,0.85);border:1px solid rgba(212,175,55,0.3);color:#D4AF37;padding:8px 14px;border-radius:24px;font-family:inherit;font-size:11px;letter-spacing:1px;cursor:pointer;backdrop-filter:blur(8px);display:flex;align-items:center;gap:6px;transition:all 0.2s ease;";
      btn.addEventListener("click", () => this.toggle());
      document.body.appendChild(btn);
    }
    this.updateButton();
  }
  updateButton() {
    const btn = document.getElementById("benni-sound-toggle");
    if (btn) {
      btn.innerHTML = this.isMuted ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#666;"></span> AUDIO: OFF' : '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#D4AF37;box-shadow:0 0 6px #D4AF37;"></span> AUDIO: ON';
    }
  }
};

// src/sovereign-ui/tilt.ts
var TiltEngine = class {
  init() {
    const elements = document.querySelectorAll("[data-tilt], .hero-card, .stack-card");
    elements.forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = (y - cy) / cy * -6;
        const rotateY = (x - cx) / cx * 6;
        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });
    });
  }
};

// src/sovereign-ui/terminal.ts
var QuantumTerminalStreamer = class {
  container = null;
  logs = [
    "[BENNI-CORE] Sovereign Engine v2026.1 initialized",
    "[NEMESIS] Agent swarm verification: 12 nodes aligned",
    "[INFERENCE] Neural dispatch latency p99: 14.2ms",
    "[SECURITY] Cryptographic state verified (zero drift)",
    "[RITUAL] Spatial audio & optical telemetry active"
  ];
  init() {
    this.container = document.querySelector(".terminal-feed, [data-terminal]");
    if (!this.container) return;
    let index = 0;
    setInterval(() => {
      if (!this.container) return;
      const line = document.createElement("div");
      line.className = "terminal-line";
      line.textContent = this.logs[index % this.logs.length];
      this.container.appendChild(line);
      if (this.container.children.length > 8) {
        this.container.removeChild(this.container.children[0]);
      }
      index++;
    }, 2800);
  }
};

// src/sovereign-ui/perf-monitor.ts
var PerformanceWatchdog = class {
  lastTime = performance.now();
  frames = 0;
  fps = 60;
  init() {
    const { bus } = acquireExperienceBus(window);
    bus.onFrame((_, now) => {
      this.frames++;
      if (now >= this.lastTime + 1e3) {
        this.fps = Math.round(this.frames * 1e3 / (now - this.lastTime));
        this.frames = 0;
        this.lastTime = now;
        const fpsReadout = document.getElementById("benni-drawer-fps");
        if (fpsReadout) {
          fpsReadout.textContent = `${Math.min(60, Math.max(30, this.fps))} FPS \xB7 LOCKED`;
        }
        if (this.fps < 30) {
          document.body.classList.add("low-power-mode");
        }
      }
    });
  }
  get currentFps() {
    return this.fps;
  }
};

// src/sovereign-ui/ecosystem-drawer.ts
var EcosystemDrawer = class {
  init() {
    const trigger = document.querySelector("[data-drawer-trigger]");
    const drawer = document.getElementById("benni-ecosystem-drawer");
    if (!trigger || !drawer) return;
    if (!drawer.querySelector(".drawer-quick-links")) {
      const fpsRow = drawer.querySelector("div > div:last-child span:last-child");
      if (fpsRow) fpsRow.id = "benni-drawer-fps";
      const navWrap = document.createElement("div");
      navWrap.className = "drawer-quick-links";
      navWrap.style.cssText = 'margin-top:16px;padding-top:14px;border-top:1px solid rgba(212,175,55,0.2);display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:"IBM Plex Mono",monospace;font-size:10px;';
      const links = [
        ["#hero", "01 \xB7 HERO LAB"],
        ["#actIIDossier", "02 \xB7 DOSSIER"],
        ["#genesisIde", "03 \xB7 GENESIS IDE"],
        ["#sovereigntyPipeline", "04 \xB7 7 STAGES"],
        ["#actIIIDecision", "05 \xB7 BENJAMIN"],
        ["#actIIIAdam", "06 \xB7 ADAM"]
      ];
      links.forEach(([href, label]) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        a.style.cssText = "color:#e8e1d5;text-decoration:none;padding:7px 10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);transition:border-color 0.2s,color 0.2s;";
        a.addEventListener("mouseenter", () => {
          a.style.borderColor = "rgba(212,175,55,0.5)";
          a.style.color = "#d4af37";
        });
        a.addEventListener("mouseleave", () => {
          a.style.borderColor = "rgba(255,255,255,0.08)";
          a.style.color = "#e8e1d5";
        });
        a.addEventListener("click", () => {
          drawer.classList.remove("open");
          trigger.setAttribute("aria-expanded", "false");
        });
        navWrap.appendChild(a);
      });
      drawer.appendChild(navWrap);
    }
    const setOpen = (open) => {
      drawer.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !drawer.classList.contains("open");
      setOpen(isOpen);
    });
    document.addEventListener("click", (e) => {
      if (!drawer.classList.contains("open")) return;
      const target = e.target;
      if (target && !drawer.contains(target) && !trigger.contains(target)) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        setOpen(false);
        trigger.focus();
      }
    });
  }
};

// src/sovereign-ui/lethe.ts
var LetheTypography = class {
  init() {
    const headings = document.querySelectorAll("[data-lethe], .monument-title, .hero-chapter-title");
    headings.forEach((el) => {
      el.classList.add("lethe-active");
      el.addEventListener("pointerenter", () => {
        el.style.filter = "blur(1.5px)";
        el.style.letterSpacing = "0.04em";
        setTimeout(() => {
          el.style.filter = "none";
          el.style.letterSpacing = "";
        }, 320);
      });
    });
  }
};

// src/sovereign-ui/spectral.ts
var SpectralAberration = class {
  init() {
    const triggers = document.querySelectorAll("[data-spectral], .badge, .status-pill");
    triggers.forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.08;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.08;
        el.style.textShadow = `${dx.toFixed(1)}px ${dy.toFixed(1)}px 0 rgba(255,0,60,0.4), ${(-dx).toFixed(1)}px ${(-dy).toFixed(1)}px 0 rgba(0,220,255,0.4)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.textShadow = "";
      });
    });
  }
};

// src/sovereign-ui/audio-visualizer.ts
var AudioVisualizerEngine = class {
  init() {
    const visualizerContainers = document.querySelectorAll("[data-audio-viz], .sound-wave-container");
    visualizerContainers.forEach((container) => {
      container.innerHTML = "";
      const barCount = 16;
      for (let i = 0; i < barCount; i++) {
        const bar = document.createElement("div");
        bar.className = "audio-viz-bar";
        bar.style.cssText = "width:2px;background:#D4AF37;height:4px;display:inline-block;margin:0 1px;transition:height 0.08s ease;opacity:0.75;";
        container.appendChild(bar);
      }
      setInterval(() => {
        const bars = container.querySelectorAll(".audio-viz-bar");
        bars.forEach((bar, idx) => {
          const h = 3 + Math.sin(Date.now() * 8e-3 + idx * 0.5) * 12 + Math.random() * 6;
          bar.style.height = `${Math.max(2, h).toFixed(1)}px`;
        });
      }, 90);
    });
  }
};

// src/sovereign-ui/genesis-controller.ts
var GenesisIdeController = class {
  manualApproved = false;
  manualModeIndex = null;
  init() {
    const track = document.querySelector(".genesis-scroll-track");
    const desktop = document.querySelector(".genesis-desktop-frame");
    const mobile = document.querySelector(".genesis-mobile-frame");
    const modesOverlay = document.querySelector(".genesis-modes-overlay");
    const modePills = document.querySelectorAll(".genesis-mode-pill");
    const founderPanel = document.querySelector(".genesis-founder-panel");
    const phaseFill = document.querySelector(".genesis-phase-fill");
    const phaseNum = document.getElementById("genesisPhaseNum");
    const phaseTitle = document.getElementById("genesisPhaseTitle");
    const approveBtn = document.querySelector(".mobile-touch-approve");
    const headerHud = document.querySelector(".genesis-header-hud");
    const tabs = document.querySelectorAll(".genesis-tab");
    const editorBody = document.querySelector(".genesis-editor-body");
    const terminalBar = document.querySelector(".genesis-terminal-bar");
    const mobileDiffBox = document.querySelector(".mobile-diff-box");
    if (!track || !desktop || !mobile) return;
    const tabContents = [
      {
        lines: [
          `<div class="code-line"><span class="code-num">01</span><span style="color:#71717a;">// BENNI OS Genesis Action Protocol v1.0 \u2014 Shared Core</span></div>`,
          `<div class="code-line"><span class="code-num">02</span><span style="color:#ff79c6;">import</span> { <span style="color:#8be9fd;">SovereignEngine</span>, <span style="color:#8be9fd;">PolicyGate</span> } <span style="color:#ff79c6;">from</span> <span style="color:#f1fa8c;">'@benni-os/core'</span>;</div>`,
          `<div class="code-line"><span class="code-num">03</span></div>`,
          `<div class="code-line"><span class="code-num">04</span><span style="color:#ff79c6;">export async function</span> <span style="color:#50fa7b;">deployAutonomousPatch</span>(intent: <span style="color:#8be9fd;">string</span>) {</div>`,
          `<div class="code-line code-diff-del"><span class="code-num">05</span>-  const patch = await legacyCloudAi.generateWithoutProof(intent);</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">06</span>+  const plan = await SovereignEngine.compileIntent({ intent, bounds: STRICT });</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">07</span>+  const approval = await PolicyGate.requestMobileTouch('GENESIS_MOBILE_OP');</div>`,
          `<div class="code-line"><span class="code-num">08</span>   return approval.status === 'VERIFIED' ? plan.execute() : plan.rollback();</div>`,
          `<div class="code-line"><span class="code-num">09</span>}</div>`
        ],
        terminalLeft: "genesis-terminal: tauri-rust allowlist [23 cmds active]",
        terminalRight: "\u2713 0 drift \xB7 p99 latency 11.4ms",
        mobileDiff: `<span style="color:#ff6b8b;">- 12 legacy cloud calls</span><br><span style="color:#50fa7b;">+ 1 local sovereign loop</span><br><span style="color:#71717a;">Target: SovereignLoop.ts</span>`
      },
      {
        lines: [
          `<div class="code-line"><span class="code-num">01</span><span style="color:#71717a;">// Rust Tauri v2 Cryptographic Settlement Kernel</span></div>`,
          `<div class="code-line"><span class="code-num">02</span><span style="color:#ff79c6;">use</span> benni_nemesis::{<span style="color:#8be9fd;">Blake3Ledger</span>, <span style="color:#8be9fd;">SovereignSeal</span>};</div>`,
          `<div class="code-line"><span class="code-num">03</span></div>`,
          `<div class="code-line"><span class="code-num">04</span><span style="color:#ff79c6;">#[tauri::command]</span></div>`,
          `<div class="code-line"><span class="code-num">05</span><span style="color:#ff79c6;">pub async fn</span> <span style="color:#50fa7b;">seal_action_receipt</span>(hash: <span style="color:#8be9fd;">&amp;str</span>) -&gt; <span style="color:#8be9fd;">Result&lt;SovereignSeal, Error&gt;</span> {</div>`,
          `<div class="code-line code-diff-del"><span class="code-num">06</span>-  unverified_fs::write_log(hash)?;</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">07</span>+  let digest = Blake3Ledger::append_atomic(hash, Policy::DefaultDeny)?;</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">08</span>+  Ok(SovereignSeal::sign_ed25519(digest))</div>`,
          `<div class="code-line"><span class="code-num">09</span>}</div>`
        ],
        terminalLeft: "cargo-check: nemesis-audit-chain [ed25519 + blake3]",
        terminalRight: "\u2713 Merkle root sealed \xB7 4.1ms",
        mobileDiff: `<span style="color:#ff6b8b;">- unverified log write</span><br><span style="color:#50fa7b;">+ Ed25519 + BLAKE3 seal</span><br><span style="color:#71717a;">Target: AuditChain.rs</span>`
      },
      {
        lines: [
          `<div class="code-line"><span class="code-num">01</span>{</div>`,
          `<div class="code-line"><span class="code-num">02</span>  <span style="color:#8be9fd;">"runtime"</span>: <span style="color:#f1fa8c;">"benni.genesis/v2026.1"</span>,</div>`,
          `<div class="code-line"><span class="code-num">03</span>  <span style="color:#8be9fd;">"policy_gate"</span>: <span style="color:#f1fa8c;">"DEFAULT_DENY_STRICT"</span>,</div>`,
          `<div class="code-line code-diff-del"><span class="code-num">04</span>- <span style="color:#8be9fd;">"telemetry_exfiltration"</span>: <span style="color:#bd93f9;">true</span>,</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">05</span>+ <span style="color:#8be9fd;">"telemetry_exfiltration"</span>: <span style="color:#bd93f9;">false</span>,</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">06</span>+ <span style="color:#8be9fd;">"mobile_companion_bridge"</span>: <span style="color:#f1fa8c;">"QUIC_MTLS_PINNED"</span>,</div>`,
          `<div class="code-line"><span class="code-num">07</span>  <span style="color:#8be9fd;">"fps_budget_target"</span>: <span style="color:#bd93f9;">60</span>,</div>`,
          `<div class="code-line"><span class="code-num">08</span>  <span style="color:#8be9fd;">"nodes_active"</span>: <span style="color:#bd93f9;">12</span></div>`,
          `<div class="code-line"><span class="code-num">09</span>}</div>`
        ],
        terminalLeft: "genesis.config.json: zero-exfiltration policy verified",
        terminalRight: "\u2713 QUIC mTLS paired \xB7 12 nodes",
        mobileDiff: `<span style="color:#ff6b8b;">- cloud telemetry leak</span><br><span style="color:#50fa7b;">+ QUIC mTLS zero-exfil</span><br><span style="color:#71717a;">Target: genesis.config.json</span>`
      }
    ];
    tabs.forEach((tab, idx) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("tabindex", "0");
      const activateTab = () => {
        tabs.forEach((t, i) => t.classList.toggle("active", i === idx));
        const data = tabContents[idx] || tabContents[0];
        if (editorBody) editorBody.innerHTML = data.lines.join("");
        if (terminalBar) {
          terminalBar.innerHTML = `<span>${data.terminalLeft}</span><span style="color:#50fa7b;">${data.terminalRight}</span>`;
        }
        if (mobileDiffBox) mobileDiffBox.innerHTML = data.mobileDiff;
      };
      tab.addEventListener("click", activateTab);
      tab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateTab();
        }
      });
    });
    const modeStatus = [
      "MODE 01 \xB7 THINK // Step ledger & causal graph active",
      "MODE 02 \xB7 BUILD // Streaming AST & Monaco diff synthesis",
      "MODE 03 \xB7 OPERATE // 12-node Nemesis agent mesh dispatched",
      "MODE 04 \xB7 RESEARCH // Citation-grounded primary source index",
      "MODE 05 \xB7 WITNESS // Cryptographic AuditChain & 1-click rollback"
    ];
    modePills.forEach((pill, idx) => {
      pill.setAttribute("role", "button");
      pill.setAttribute("tabindex", "0");
      const selectMode = () => {
        this.manualModeIndex = idx;
        modePills.forEach((p, i) => p.classList.toggle("active", i === idx));
        if (terminalBar && terminalBar.firstElementChild) {
          terminalBar.firstElementChild.textContent = modeStatus[idx] || modeStatus[0];
        }
      };
      pill.addEventListener("click", selectMode);
      pill.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectMode();
        }
      });
    });
    if (approveBtn) {
      approveBtn.addEventListener("click", () => {
        this.manualApproved = !this.manualApproved;
        approveBtn.classList.toggle("approved", this.manualApproved);
        approveBtn.textContent = this.manualApproved ? "\u2713 SIGNED & AUDITED" : "TOUCH TO APPROVE";
      });
    }
    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const totalScroll = track.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const rawProgress = -rect.top / totalScroll;
      const progress = Math.max(0, Math.min(1, rawProgress));
      if (phaseFill) phaseFill.style.width = `${(progress * 100).toFixed(1)}%`;
      const diffDelLines = document.querySelectorAll(".code-diff-del");
      const diffAddLines = document.querySelectorAll(".code-diff-add");
      if (progress < 0.22) {
        const p1 = progress / 0.22;
        if (phaseNum) phaseNum.textContent = "01";
        if (phaseTitle) phaseTitle.textContent = "CORE AWAKENING";
        const rx = 14 * (1 - p1);
        const ry = -10 * (1 - p1);
        const tz = -80 * (1 - p1);
        desktop.style.transform = `translate3d(0px, 24px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
        desktop.style.opacity = `${Math.min(1, 0.55 + p1 * 0.45)}`;
        mobile.style.transform = `translate3d(140px, 60px, -100px) rotateY(-22deg) scale(0.86)`;
        mobile.style.opacity = "0.15";
        if (modesOverlay) modesOverlay.style.opacity = "0.5";
        if (founderPanel) founderPanel.classList.remove("visible");
        if (headerHud) headerHud.style.opacity = "1";
      } else if (progress >= 0.22 && progress < 0.48) {
        const p2 = (progress - 0.22) / 0.26;
        if (phaseNum) phaseNum.textContent = "02";
        if (phaseTitle) phaseTitle.textContent = "DUAL SURFACE SYNC";
        const deskX = -110 * p2;
        desktop.style.transform = `translate3d(${deskX.toFixed(1)}px, 20px, 0px) rotateX(2deg) rotateY(${(-6 * p2).toFixed(1)}deg) scale(${(1 - 0.06 * p2).toFixed(3)})`;
        desktop.style.opacity = "1";
        const mobX = 140 * (1 - p2);
        const mobY = 60 * (1 - p2);
        mobile.style.transform = `translate3d(${mobX.toFixed(1)}px, ${mobY.toFixed(1)}px, 30px) rotateY(${(-18 + 8 * p2).toFixed(1)}deg) scale(${(0.86 + 0.14 * p2).toFixed(3)})`;
        mobile.style.opacity = `${Math.min(1, 0.25 + p2 * 0.95)}`;
        if (modesOverlay) modesOverlay.style.opacity = "0.75";
        if (founderPanel) founderPanel.classList.remove("visible");
        if (headerHud) headerHud.style.opacity = `${Math.max(0.15, 1 - p2 * 0.85)}`;
      } else if (progress >= 0.48 && progress < 0.7) {
        const p3 = (progress - 0.48) / 0.22;
        if (phaseNum) phaseNum.textContent = "03";
        if (phaseTitle) phaseTitle.textContent = "SOVEREIGN APPROVAL";
        desktop.style.transform = `translate3d(-110px, 16px, 0px) rotateX(0deg) rotateY(-6deg) scale(0.94)`;
        desktop.style.opacity = "1";
        mobile.style.transform = `translate3d(0px, 6px, 60px) rotateY(-6deg) scale(1.02)`;
        mobile.style.opacity = "1";
        if (p3 > 0.35) {
          diffDelLines.forEach((l) => l.style.opacity = "0.4");
          diffAddLines.forEach((l) => l.style.opacity = "1");
        } else {
          diffDelLines.forEach((l) => l.style.opacity = "1");
          diffAddLines.forEach((l) => l.style.opacity = "0.35");
        }
        const isApproved = this.manualApproved || p3 > 0.55;
        if (approveBtn) {
          approveBtn.classList.toggle("approved", isApproved);
          approveBtn.textContent = isApproved ? "\u2713 SIGNED & AUDITED" : "TOUCH TO APPROVE";
        }
        if (modesOverlay) modesOverlay.style.opacity = "0.9";
        if (founderPanel) founderPanel.classList.remove("visible");
        if (headerHud) headerHud.style.opacity = "0";
      } else if (progress >= 0.7 && progress < 0.9) {
        const p4 = (progress - 0.7) / 0.2;
        if (phaseNum) phaseNum.textContent = "04";
        if (phaseTitle) phaseTitle.textContent = "5 SOVEREIGN MODES";
        desktop.style.transform = `translate3d(-125px, 10px, -20px) rotateY(-8deg) scale(0.9)`;
        desktop.style.opacity = "1";
        mobile.style.transform = `translate3d(15px, 12px, 40px) rotateY(-4deg) scale(0.95)`;
        mobile.style.opacity = "1";
        const activeModeIndex = this.manualModeIndex !== null ? this.manualModeIndex : Math.min(Math.floor(p4 * 5), 4);
        modePills.forEach((pill, idx) => {
          pill.classList.toggle("active", idx === activeModeIndex);
        });
        if (modesOverlay) modesOverlay.style.opacity = "1";
        if (founderPanel) founderPanel.classList.remove("visible");
        if (headerHud) headerHud.style.opacity = "0";
      } else {
        if (phaseNum) phaseNum.textContent = "05";
        if (phaseTitle) phaseTitle.textContent = "FOUNDER ALPHA";
        desktop.style.transform = `translate3d(0, 0, -200px) scale(0.75)`;
        desktop.style.opacity = "0.2";
        mobile.style.transform = `translate3d(0, 0, -100px) scale(0.75)`;
        mobile.style.opacity = "0.2";
        if (modesOverlay) modesOverlay.style.opacity = "0.25";
        if (founderPanel) founderPanel.classList.add("visible");
        if (headerHud) headerHud.style.opacity = "0";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }
};

// src/sovereign-ui/orbital-gallery.ts
var OrbitalGalleryEngine = class {
  init() {
    this.initHeroChapterStepper();
    this.initDossierBlueprints();
    this.initPipelineInspector();
    this.initCommandPalette();
  }
  initHeroChapterStepper() {
    const hero = document.getElementById("hero");
    const stage = document.getElementById("heroStage");
    if (!hero || !stage || stage.querySelector(".hero-chapter-stepper")) return;
    const stepper = document.createElement("div");
    stepper.className = "hero-chapter-stepper";
    stepper.setAttribute("aria-label", "Navega\xE7\xE3o dos 11 cap\xEDtulos do Hero");
    const meta = document.createElement("div");
    meta.className = "hero-stepper-meta";
    meta.innerHTML = `<span>OPTICAL RIG</span><span class="hero-stepper-mode-badge" id="heroStepperMode">FOREGROUND-VIDEO</span>`;
    const pills = document.createElement("div");
    pills.className = "hero-stepper-pills";
    pills.setAttribute("role", "tablist");
    const chapterStarts = [0, 0.095, 0.175, 0.26, 0.34, 0.425, 0.535, 0.625, 0.715, 0.805, 0.9];
    const chapterModes = [
      "FOREGROUND-VIDEO",
      "RECESSED-VIDEO",
      "LATERAL-SPLIT",
      "RECESSED-VIDEO",
      "FOREGROUND-VIDEO",
      "LATERAL-SPLIT",
      "RECESSED-VIDEO",
      "FOREGROUND-VIDEO",
      "RECESSED-VIDEO",
      "MONOLITH-DECISION",
      "FOREGROUND-VIDEO"
    ];
    const buttons = [];
    for (let i = 0; i < 11; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `hero-stepper-btn${i === 0 ? " is-active" : ""}`;
      const num = String(i + 1).padStart(2, "0");
      btn.textContent = num;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(i === 0));
      btn.setAttribute("aria-label", `Ir para o cap\xEDtulo ${num}`);
      btn.addEventListener("click", () => {
        const total = Math.max(1, hero.offsetHeight - window.innerHeight);
        const targetProgress = chapterStarts[i] + 0.015;
        const targetY = hero.offsetTop + targetProgress * total;
        const lenis = window.__BENNI_LENIS__;
        if (lenis) {
          lenis.scrollTo(targetY, { duration: 1.35 });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      });
      buttons.push(btn);
      pills.appendChild(btn);
    }
    stepper.append(meta, pills);
    stage.appendChild(stepper);
    const modeBadge = meta.querySelector("#heroStepperMode");
    const syncStepper = () => {
      const currentChapter = stage.dataset.chapter || "01";
      const idx = Math.max(0, Math.min(10, parseInt(currentChapter, 10) - 1));
      buttons.forEach((b, i) => {
        const active = i === idx;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      if (modeBadge) {
        modeBadge.textContent = chapterModes[idx] || "FOREGROUND-VIDEO";
      }
    };
    const { bus } = acquireExperienceBus(window);
    bus.onScroll(syncStepper);
    bus.onResize(syncStepper);
    bus.onFrame(syncStepper);
  }
  initDossierBlueprints() {
    const rows = Array.from(document.querySelectorAll("#actIIDossier .ledger-row"));
    const dossierVideo = document.querySelector("#actIIDossier .dossier-video");
    if (!rows.length) return;
    const specs = [
      {
        num: "01",
        kicker: "CONTRACT // 00-MASTER-ORCHESTRATOR-BRAIN",
        desc: "Governs macro-strategy, mission decomposition, budget envelopes, and deterministic multi-agent dispatch across the sovereign mesh.",
        metrics: ["SLA: < 8ms dispatch", "QUORUM: 12 nodes", "ROLLBACK: Atomic SHA"],
        code: `const mission = await MasterOS.compileMission({
  intent: "sovereign_execution",
  budgetCap: "strict",
  evidenceRequired: true
});`,
        videoSrc: "card-orchestrate.mp4",
        posterSrc: "card-orchestrate-still.png"
      },
      {
        num: "02",
        kicker: "CONTRACT // 90-CONTROL-PLANE-AGENT-OS",
        desc: "Maintains typed session graphs, immutable run ledgers, and cross-session state continuity without context drift.",
        metrics: ["STATE: Typed DAG", "RETENTION: Verifiable", "SYNC: Puter KV + Local"],
        code: `await ControlPlane.snapshot({
  scope: "workspace_locked",
  digest: "blake3_256",
  rehydrateOnBoot: true
});`,
        videoSrc: "inside-memory.mp4",
        posterSrc: "inside-memory-still.png"
      },
      {
        num: "03",
        kicker: "CONTRACT // 97-NEMESIS-GATEWAY-OS",
        desc: "Enforces default-deny policy gates, capability probes, and human-in-the-loop touch approval before any consequential external mutation.",
        metrics: ["GATE: Default-Deny", "SIGNATURE: Ed25519", "DRIFT: 0.00%"],
        code: `const permit = await Nemesis.verifyPolicy({
  action: "external_mutation",
  requireOperatorTouch: true
});`,
        videoSrc: "inside-policy.mp4",
        posterSrc: "inside-policy-still.png"
      },
      {
        num: "04",
        kicker: "CONTRACT // MCP-FORGE DECLARATIVE ENGINE",
        desc: "Synthesizes zero-boilerplate MCP servers directly from strictly typed signatures with automatic STDIO, HTTP, and SSE transport bindings.",
        metrics: ["SCHEMA: Auto-Derived", "TRANSPORT: STDIO \xB7 HTTP \xB7 SSE", "LOCK-IN: Zero"],
        code: `@app.tool({ policy: "governed" })
export async function auditLedger(txId: string): Promise<Receipt> {
  return Ledger.verify(txId);
}`,
        videoSrc: "card-execute.mp4",
        posterSrc: "card-execute-still.png"
      },
      {
        num: "05",
        kicker: "CONTRACT // 81-LOCAL-LLM-OS & INFERENCE",
        desc: "Evaluates consequence, causal weight, and token unit economics before committing compute or external execution.",
        metrics: ["LATENCY p99: 14.2ms", "ROUTING: Hybrid Local/Cloud", "PRIVACY: Zero-Exfil"],
        code: `const decision = await Inference.weighConsequence({
  hypothesis, 
  riskThreshold: 0.02
});`,
        videoSrc: "inside-inference.mp4",
        posterSrc: "inside-inference-still.png"
      },
      {
        num: "06",
        kicker: "CONTRACT // 01-OPERATOR-CORE-CONTRACT",
        desc: "Unifies models, MCP tools, persistent memory, and human operators along a single cryptographically audited bridge.",
        metrics: ["BRIDGE: MCP \u2194 HTTP", "LEASE: Bounded TTL", "AUDIT: 100% Traceable"],
        code: `const channel = OperatorGateway.openBridge({
  protocol: "MCP_2026",
  mutualTls: true
});`,
        videoSrc: "card-approve.mp4",
        posterSrc: "card-orchestrate-still.png"
      },
      {
        num: "07",
        kicker: "CONTRACT // BENNI NEXUS MESH ROUTER",
        desc: "Routes intelligence across specialized model tiers and autonomous swarms while preserving end-to-end observability.",
        metrics: ["TOPOLOGY: 3D Mesh", "FAILOVER: < 12ms", "OBSERVABILITY: Full"],
        code: `const route = Nexus.routeIntelligence({
  taskClass: "architectural_synthesis",
  slaMs: 16
});`,
        videoSrc: "card-reason.mp4",
        posterSrc: "card-reason-still.png"
      }
    ];
    rows.forEach((row, idx) => {
      const spec = specs[idx];
      if (!spec || row.querySelector(".ledger-blueprint")) return;
      const blueprint = document.createElement("div");
      blueprint.className = "ledger-blueprint";
      blueprint.innerHTML = `
        <div class="ledger-blueprint-specs">
          <div class="ledger-blueprint-kicker">${spec.kicker}</div>
          <div class="ledger-blueprint-desc">${spec.desc}</div>
          <div class="ledger-blueprint-metrics">
            ${spec.metrics.map((m) => `<span class="ledger-metric-pill">${m}</span>`).join("")}
          </div>
        </div>
        <div class="ledger-blueprint-code">
          <button type="button" class="ledger-copy-btn" data-copy-code="${idx}">COPY CONTRACT</button>
          <pre style="margin:0;font-family:inherit;white-space:pre-wrap;"><code>${spec.code}</code></pre>
        </div>
      `;
      row.appendChild(blueprint);
      const copyBtn = blueprint.querySelector(".ledger-copy-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(spec.code).catch(() => {
          });
          copyBtn.textContent = "\u2713 COPIED";
          setTimeout(() => {
            copyBtn.textContent = "COPY CONTRACT";
          }, 1600);
        });
      }
      const activateRow = () => {
        const wasExpanded = row.classList.contains("is-expanded");
        rows.forEach((r) => r.classList.remove("is-expanded"));
        if (!wasExpanded) {
          row.classList.add("is-expanded");
          if (dossierVideo && dossierVideo.getAttribute("src") !== spec.videoSrc) {
            dossierVideo.poster = spec.posterSrc;
            dossierVideo.src = spec.videoSrc;
            dossierVideo.play().catch(() => {
            });
          }
        }
      };
      row.addEventListener("click", activateRow);
      if (idx === 0) {
        row.classList.add("is-expanded");
      }
    });
  }
  initPipelineInspector() {
    const section = document.getElementById("sovereigntyPipeline");
    const grid = section?.querySelector(".pipeline-grid");
    const cards = Array.from(section?.querySelectorAll(".pipeline-card") || []);
    if (!section || !grid || !cards.length) return;
    const stages = [
      {
        step: "STAGE 01 // INTENT CORE",
        name: "Intent Core",
        title: "01 \xB7 Raw Operator Intent Compilation",
        desc: "Captures natural operator intent and compiles it into a bounded, typed execution contract with explicit scope and rollback invariants.",
        sla: "1.8 ms",
        protocol: "INTENT-AST / V3",
        verification: "Schema + Scope Lock",
        hash: "blake3::91a4...c08e"
      },
      {
        step: "STAGE 02 // CONTROL PLANE",
        name: "Control Plane",
        title: "02 \xB7 Persistent State & Context Hydration",
        desc: "Hydrates the execution plan with historical decisions, project memory graph, and active workspace constraints before any agent is spawned.",
        sla: "3.2 ms",
        protocol: "DAG-LEDGER / KV",
        verification: "Zero Context Drift",
        hash: "blake3::47f2...19b0"
      },
      {
        step: "STAGE 03 // AGENT SWARM",
        name: "Agent Swarm",
        title: "03 \xB7 Disjoint Ownership Swarm Formation",
        desc: "Allocates specialized autonomous brains into typed slots with strict token budgets, isolated workspaces, and deterministic handoff contracts.",
        sla: "6.4 ms",
        protocol: "SWARM-MESH / 12x",
        verification: "Slot Budget Enforced",
        hash: "blake3::c309...88d1"
      },
      {
        step: "STAGE 04 // POLICY GATE",
        name: "Policy Gate",
        title: "04 \xB7 Nemesis Default-Deny Policy Gate",
        desc: "Intercepts every consequential tool call, validating risk tier, credentials, and operator touch approval before execution is permitted.",
        sla: "2.1 ms",
        protocol: "NEMESIS-GATE / STRICT",
        verification: "Ed25519 Signed Permit",
        hash: "blake3::e820...54a9"
      },
      {
        step: "STAGE 05 // EXECUTION SWIRL",
        name: "Execution Swirl",
        title: "05 \xB7 High-Throughput Parallel Execution",
        desc: "Executes verified mutations across local runtimes, MCP servers, and hybrid cloud workers with real-time telemetry and circuit breakers.",
        sla: "11.4 ms",
        protocol: "MCP-FORGE / QUIC",
        verification: "Idempotent Lease",
        hash: "blake3::7b11...3f6c"
      },
      {
        step: "STAGE 06 // NEMESIS SEAL",
        name: "Nemesis Seal",
        title: "06 \xB7 Cryptographic Receipt & State Seal",
        desc: "Seals the post-execution state digest, diff artifacts, and resource attribution into a tamper-evident cryptographic receipt.",
        sla: "4.1 ms",
        protocol: "MERKLE-SEAL / V2",
        verification: "SHA-256 + BLAKE3",
        hash: "blake3::0d5e...a72f"
      },
      {
        step: "STAGE 07 // EVIDENCE LEDGER",
        name: "Evidence Ledger",
        title: "07 \xB7 Verifiable Evidence & Instant Rollback",
        desc: "Publishes the final audit trail and visual/runtime evidence to the Operator Cockpit, keeping 1-click atomic rollback ready at any time.",
        sla: "2.5 ms",
        protocol: "AUDIT-CHAIN / IMMUTABLE",
        verification: "100% Reconciled",
        hash: "blake3::f94c...e21b"
      }
    ];
    let inspector = section.querySelector(".pipeline-inspector");
    if (!inspector) {
      inspector = document.createElement("div");
      inspector.className = "pipeline-inspector";
      inspector.setAttribute("aria-live", "polite");
      grid.after(inspector);
    }
    const selectStage = (idx) => {
      const spec = stages[idx] || stages[0];
      cards.forEach((c, i) => {
        const active = i === idx;
        c.classList.toggle("is-selected", active);
        c.setAttribute("aria-pressed", String(active));
      });
      if (inspector) {
        inspector.innerHTML = `
          <div>
            <div class="pipeline-inspector-kicker">${spec.step}</div>
            <h3 class="pipeline-inspector-title">${spec.title}</h3>
            <p class="pipeline-inspector-desc">${spec.desc}</p>
          </div>
          <div class="pipeline-inspector-telemetry">
            <div class="pipeline-telemetry-cell">
              <span class="pipeline-telemetry-label">STAGE LATENCY SLA</span>
              <span class="pipeline-telemetry-val" style="color:#50fa7b;">${spec.sla}</span>
            </div>
            <div class="pipeline-telemetry-cell">
              <span class="pipeline-telemetry-label">ACTIVE PROTOCOL</span>
              <span class="pipeline-telemetry-val" style="color:#8bb2ff;">${spec.protocol}</span>
            </div>
            <div class="pipeline-telemetry-cell">
              <span class="pipeline-telemetry-label">POLICY VERIFICATION</span>
              <span class="pipeline-telemetry-val" style="color:#d4af37;">${spec.verification}</span>
            </div>
            <div class="pipeline-telemetry-cell">
              <span class="pipeline-telemetry-label">SETTLEMENT DIGEST</span>
              <span class="pipeline-telemetry-val">${spec.hash}</span>
            </div>
          </div>
        `;
      }
    };
    cards.forEach((card, idx) => {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", () => selectStage(idx));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectStage(idx);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = (idx + 1) % cards.length;
          cards[next].focus();
          selectStage(next);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = (idx - 1 + cards.length) % cards.length;
          cards[prev].focus();
          selectStage(prev);
        }
      });
    });
    selectStage(0);
  }
  initCommandPalette() {
    const statusGroup = document.querySelector(".site-nav .nav-status-group");
    if (!statusGroup || document.querySelector(".benni-cmd-backdrop")) return;
    const triggerBtn = document.createElement("button");
    triggerBtn.type = "button";
    triggerBtn.className = "nav-cmd-trigger";
    triggerBtn.setAttribute("aria-label", "Abrir paleta de comandos (Ctrl+K)");
    triggerBtn.innerHTML = `<span class="cmd-label">COMMAND</span><kbd>\u2318K</kbd>`;
    statusGroup.prepend(triggerBtn);
    const backdrop = document.createElement("div");
    backdrop.className = "benni-cmd-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", "Paleta de Comandos Soberana BENNI\xB7OS");
    backdrop.innerHTML = `
      <div class="benni-cmd-dialog">
        <div class="benni-cmd-header">
          <span style="color:#d4af37;font-family:'IBM Plex Mono',monospace;font-size:12px;">\u276F</span>
          <input type="search" class="benni-cmd-input" placeholder="Jump to section, chapter, architectural contract, or runtime action..." aria-label="Buscar comando ou se\xE7\xE3o" />
          <kbd style="font:500 10px 'IBM Plex Mono',monospace;color:#71717a;background:#050507;padding:3px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);">ESC</kbd>
        </div>
        <div class="benni-cmd-list" role="listbox"></div>
        <div class="benni-cmd-footer">
          <span>BENNI\xB7OS SHARED BUS // v1 \xB7 60 FPS</span>
          <span id="benniCmdDiagnostics">12 NODES \xB7 0 DRIFT</span>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    const input = backdrop.querySelector(".benni-cmd-input");
    const list = backdrop.querySelector(".benni-cmd-list");
    const diagSpan = backdrop.querySelector("#benniCmdDiagnostics");
    const scrollToSelector = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const lenis = window.__BENNI_LENIS__;
      if (lenis) {
        lenis.scrollTo(el, { offset: -76, duration: 1.5 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    const items = [
      { label: "Act I \u2014 Hero 3D Lab (11 Chapters)", tag: "SECTION", keywords: "hero arrival awakening origin", run: () => scrollToSelector("#hero") },
      { label: "Act II \u2014 System Dossier (01\u201307 Blueprints)", tag: "ARCHITECTURE", keywords: "dossier master os control plane nemesis mcp forge", run: () => scrollToSelector("#actIIDossier") },
      { label: "Act II \u2014 Memory, Policy & Inference Corridor", tag: "CORRIDOR", keywords: "corridor memory policy inference", run: () => scrollToSelector("#actIICorridor") },
      { label: "Act II \u2014 Capability Chamber (Orchestrate \xB7 Reason \xB7 Execute)", tag: "CHAMBER", keywords: "chamber capability plates", run: () => scrollToSelector("#actIIChamber") },
      { label: "Live Agent Mesh in Action (Action Reels)", tag: "REELS", keywords: "living reels dispatch approval ledger topology", run: () => scrollToSelector("#livingReels") },
      { label: "BENNI OS Genesis IDE \u2014 Dual Desktop + Mobile Experience", tag: "GENESIS IDE", keywords: "genesis ide tauri expo code diff modes", run: () => scrollToSelector("#genesisIde") },
      { label: "The 7 Stages of Sovereignty Pipeline", tag: "PIPELINE", keywords: "pipeline stages intent seal evidence", run: () => scrollToSelector("#sovereigntyPipeline") },
      { label: "Operator Sovereign Cockpit & Hardware Substrate", tag: "COCKPIT", keywords: "operator cockpit hardware desk", run: () => scrollToSelector("#operatorCockpit") },
      { label: "The Sovereign Runtime Film Theater", tag: "FILM", keywords: "product theater film video", run: () => scrollToSelector("#productTheater") },
      { label: "Act III \u2014 Project Benjamin (Decision Intelligence)", tag: "BENJAMIN", keywords: "benjamin decision clarity water drop", run: () => scrollToSelector("#actIIIDecision") },
      { label: "Act III \u2014 Adam: The First Move (Sovereign Execution)", tag: "ADAM", keywords: "adam execution first move", run: () => scrollToSelector("#actIIIAdam") },
      {
        label: "Toggle Procedural Soundscape Audio (ON / OFF)",
        tag: "AUDIO",
        keywords: "audio sound mute unmute tone",
        run: () => {
          document.getElementById("benni-sound-toggle")?.click();
        }
      },
      {
        label: "Switch Interface Language: Portugu\xEAs (PT-BR)",
        tag: "I18N",
        keywords: "portugues pt language idioma",
        run: () => {
          window.__BENNI_I18N__?.setLang("pt");
        }
      },
      {
        label: "Switch Interface Language: English (EN)",
        tag: "I18N",
        keywords: "english en language idioma",
        run: () => {
          window.__BENNI_I18N__?.setLang("en");
        }
      },
      {
        label: "Switch Interface Language: Espa\xF1ol (ES)",
        tag: "I18N",
        keywords: "espanol es spanish language idioma",
        run: () => {
          window.__BENNI_I18N__?.setLang("es");
        }
      }
    ];
    let filtered = [...items];
    let selectedIdx = 0;
    const closePalette = () => {
      backdrop.classList.remove("is-open");
    };
    const renderList = () => {
      list.innerHTML = "";
      filtered.forEach((item, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `benni-cmd-item${idx === selectedIdx ? " is-selected" : ""}`;
        btn.setAttribute("role", "option");
        btn.setAttribute("aria-selected", String(idx === selectedIdx));
        btn.innerHTML = `<span>${item.label}</span><span class="benni-cmd-item-tag">${item.tag}</span>`;
        btn.addEventListener("click", () => {
          closePalette();
          item.run();
        });
        list.appendChild(btn);
      });
    };
    const openPalette = () => {
      const diag = window.__BENNI_RUNTIME__?.diagnostics?.();
      if (diag) {
        diagSpan.textContent = `CLOCK: ${diag.clock_mode.toUpperCase()} \xB7 SUBS: ${diag.total_subscribers} \xB7 TICKS: ${diag.ticks}`;
      }
      backdrop.classList.add("is-open");
      input.value = "";
      filtered = [...items];
      selectedIdx = 0;
      renderList();
      setTimeout(() => input.focus(), 20);
    };
    triggerBtn.addEventListener("click", openPalette);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closePalette();
    });
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      filtered = q ? items.filter((it) => (it.label + " " + it.tag + " " + it.keywords).toLowerCase().includes(q)) : [...items];
      selectedIdx = 0;
      renderList();
    });
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (backdrop.classList.contains("is-open")) closePalette();
        else openPalette();
        return;
      }
      if (!backdrop.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        triggerBtn.focus();
      } else if (e.key === "ArrowDown" && filtered.length) {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % filtered.length;
        renderList();
      } else if (e.key === "ArrowUp" && filtered.length) {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + filtered.length) % filtered.length;
        renderList();
      } else if (e.key === "Enter" && filtered[selectedIdx]) {
        e.preventDefault();
        const chosen = filtered[selectedIdx];
        closePalette();
        chosen.run();
      }
    });
  }
};

// src/sovereign-ui/orchestrator.ts
var SovereignUIOrchestrator = class {
  halo = new HaloEngine();
  lumen = new LumenSpotlight();
  magnet = new MagnetField();
  liquid = new LiquidSurface();
  cera = new CeraHaptics();
  aura = new AuraAtmosphere();
  veu = new VeuCinematics();
  ritual = new RitualProgress();
  flux = new FluxParticles();
  sound = new ProceduralSoundscape();
  tilt = new TiltEngine();
  terminal = new QuantumTerminalStreamer();
  perf = new PerformanceWatchdog();
  drawer = new EcosystemDrawer();
  lethe = new LetheTypography();
  spectral = new SpectralAberration();
  audioViz = new AudioVisualizerEngine();
  genesis = new GenesisIdeController();
  orbital = new OrbitalGalleryEngine();
  boot() {
    console.log("\u{1F3DB}\uFE0F Initializing Sovereign UI Suite (30 Orchestrated Primitives)...");
    this.orbital.init();
    this.halo.init();
    this.lumen.init();
    this.magnet.init();
    this.liquid.init();
    this.cera.attachListeners();
    this.aura.init();
    this.veu.init();
    this.ritual.init();
    this.flux.init();
    this.sound.init();
    this.tilt.init();
    this.terminal.init();
    this.perf.init();
    this.drawer.init();
    this.lethe.init();
    this.spectral.init();
    this.audioViz.init();
    this.genesis.init();
    console.log("\u2728 Sovereign UI Suite Active: 60 FPS Target Locked");
  }
};

// src/sovereign-ui/index.ts
var sovereignUI = new SovereignUIOrchestrator();

// src/spatial-story-v2.ts
var clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
var smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
var SpatialStoryEngine = class {
  scenes = [];
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  dirty = true;
  lastScrollY = -1;
  init() {
    window.__BENNI_SPATIAL_STORY_V2__ = this;
    this.collectScenes();
    const { bus } = acquireExperienceBus(window);
    bus.onScroll(() => {
      this.dirty = true;
    });
    bus.onResize(() => {
      this.dirty = true;
    });
    this.reduced.addEventListener("change", () => {
      this.dirty = true;
    });
    bus.onFrame(() => {
      if (this.dirty || Math.abs(window.scrollY - this.lastScrollY) > 0.05) {
        this.render();
      }
    });
    this.render();
  }
  collectScenes() {
    const definitions = [
      {
        section: "#actIIDossier",
        media: ".dossier-frame-container",
        copy: ".dossier-opening",
        cards: ".ledger-row"
      },
      {
        section: "#actIICorridor .wall-01",
        media: ".wall-media",
        copy: ".wall-content"
      },
      {
        section: "#actIICorridor .wall-02",
        media: ".wall-media",
        copy: ".wall-content"
      },
      {
        section: "#actIICorridor .wall-03",
        media: ".wall-frame",
        copy: ".wall-overlay-content"
      },
      {
        section: "#actIIChamber .plate-1",
        media: ".plate-video",
        copy: ".plate-content"
      },
      {
        section: "#actIIChamber .plate-2",
        media: ".plate-video",
        copy: ".plate-content"
      },
      {
        section: "#actIIChamber .plate-3",
        media: ".plate-video",
        copy: ".plate-content"
      },
      {
        section: "#livingReels",
        media: ".reel-card:first-child .reel-video-wrap",
        copy: "#livingReels > div:first-child",
        cards: ".reel-card"
      },
      {
        section: "#sovereigntyPipeline",
        media: ".pipeline-card:first-child .pipeline-img-wrap",
        copy: "#sovereigntyPipeline > div:first-child",
        cards: ".pipeline-card"
      },
      {
        section: "#operatorCockpit",
        media: ".cockpit-visual",
        copy: ".cockpit-copy"
      },
      {
        section: "#productTheater",
        media: ".theater-wrap",
        copy: "#productTheater > div:first-child"
      },
      {
        section: ".exit-section",
        media: ".exit-bg",
        copy: ".exit-content"
      },
      {
        section: "#actIIIDecision",
        anchor: ".benjamin-canvas",
        media: ".benjamin-media-box",
        copy: ".benjamin-statement-wrap, .benjamin-marginalia, .benjamin-pullquote-wrap",
        cards: ".marginalia-item"
      },
      {
        section: "#actIIIHandoff",
        media: ".handoff-wipe-layer",
        copy: ".handoff-statement"
      },
      {
        section: "#actIIIAdam",
        media: ".adam-media-frame",
        copy: ".adam-copy-stage2, .adam-copy-stage3, .adam-conversion-stage"
      },
      {
        section: ".benni-footer",
        media: ".benni-footer-mark",
        copy: ".benni-footer-system, .benni-footer-statement, .benni-footer-links"
      }
    ];
    definitions.forEach((def, index) => {
      const section = document.querySelector(def.section);
      if (!section) return;
      const anchor = def.anchor ? section.querySelector(def.anchor) || section : section;
      const media = Array.from(section.querySelectorAll(def.media));
      const copy = Array.from(section.querySelectorAll(def.copy));
      const cards = def.cards ? Array.from(section.querySelectorAll(def.cards)) : [];
      section.classList.add("spatial-scene");
      anchor.classList.add("spatial-stage-anchor");
      media.forEach((el) => this.tag(el, "media"));
      copy.forEach((el) => this.tag(el, "copy"));
      cards.forEach((el) => this.tag(el, "card"));
      this.scenes.push({
        section,
        anchor,
        media,
        copy,
        cards,
        direction: index % 2 === 0 ? 1 : -1
      });
    });
  }
  tag(el, role) {
    el.classList.remove("canvas-reveal", "story-actor");
    el.classList.add("spatial-layer", `spatial-${role}-plane`);
    el.parentElement?.classList.add("spatial-chain");
  }
  render = () => {
    this.dirty = false;
    this.lastScrollY = window.scrollY;
    const vh = window.innerHeight || 1;
    const mobile = window.innerWidth < 768;
    const scaleAmount = mobile ? 0.36 : 1;
    this.renderHeroCopy(scaleAmount);
    for (const scene of this.scenes) {
      const rect = scene.anchor.getBoundingClientRect();
      if (rect.bottom < -vh * 0.45 || rect.top > vh * 1.45) continue;
      const progress = clamp((vh - rect.top) / Math.max(1, vh + rect.height));
      const enter = 1 - smooth(progress / 0.36);
      const exit = smooth((progress - 0.68) / 0.32);
      const focus = 1 - Math.min(1, enter + exit);
      scene.section.style.setProperty("--spatial-progress", progress.toFixed(4));
      scene.section.style.setProperty("--spatial-focus", focus.toFixed(4));
      scene.media.forEach((el, index) => {
        const dir = index % 2 === 0 ? scene.direction : -scene.direction;
        const x = dir * (enter * 210 - exit * 165) * scaleAmount;
        const y = (enter * 105 - exit * 115) * scaleAmount;
        const z = (-enter * 540 + focus * 55 - exit * 260) * scaleAmount;
        const rotY = dir * (enter * 24 - exit * 18) * scaleAmount;
        const rotX = (enter * 8 - exit * 6) * scaleAmount;
        const scale = 1 - enter * 0.06 + focus * 0.025;
        this.apply(el, x, y, z, rotX, rotY, scale, 0.32 + focus * 0.68);
      });
      scene.copy.forEach((el, index) => {
        const dir = index % 2 === 0 ? -scene.direction : scene.direction;
        const x = dir * (enter * 135 - exit * 150) * scaleAmount;
        const y = (enter * 64 - exit * 78) * scaleAmount;
        const z = (-enter * 180 + focus * 90 - exit * 120) * scaleAmount;
        const rotY = dir * (enter * 11 - exit * 9) * scaleAmount;
        this.apply(el, x, y, z, 0, rotY, 1, 0.25 + focus * 0.75);
      });
      scene.cards.forEach((el, index) => {
        if (el.classList.contains("is-expanded") || el.classList.contains("is-selected")) {
          this.reset(el);
          return;
        }
        const cardRect = el.getBoundingClientRect();
        const local = clamp((vh - cardRect.top) / Math.max(1, vh * 0.88 + cardRect.height));
        const cardEnter = 1 - smooth(local / 0.24);
        const cardExit = smooth((local - 0.82) / 0.18);
        const lane = index % 2 === 0 ? -1 : 1;
        const x = lane * (cardEnter * 24 - cardExit * 18) * scaleAmount;
        const y = (cardEnter * 22 - cardExit * 14) * scaleAmount;
        const z = (-cardEnter * 56 + (1 - cardEnter) * 12) * scaleAmount;
        const rotY = lane * (cardEnter * 2.5 - cardExit * 1.8) * scaleAmount;
        this.apply(el, x, y, z, cardEnter * 1.5 * scaleAmount, rotY, 1 - cardEnter * 0.015, 0.78 + (1 - cardEnter) * 0.22);
      });
    }
  };
  renderHeroCopy(scaleAmount) {
    const heroCopy = document.getElementById("heroCopy");
    const heroApi = window.__BENNI_HERO_3D__;
    if (!heroCopy || !heroApi) return;
    if (this.reduced.matches) {
      this.reset(heroCopy);
      return;
    }
    const p = heroApi.getProgress();
    const chapters = heroApi.chapters || [];
    const idx = Math.max(0, chapters.findIndex((c) => p >= c.start && p < c.end));
    const chapter = chapters[idx] || chapters[0];
    if (!chapter) return;
    const local = clamp((p - chapter.start) / Math.max(1e-3, chapter.end - chapter.start));
    const enter = idx === 0 ? 0 : 1 - smooth(local / 0.22);
    const exit = idx === chapters.length - 1 ? 0 : smooth((local - 0.72) / 0.28);
    const dir = idx % 2 === 0 ? 1 : -1;
    const x = dir * (enter * 165 - exit * 210) * scaleAmount;
    const y = (enter * 48 - exit * 72) * scaleAmount;
    const z = (-enter * 260 - exit * 220) * scaleAmount;
    const rotY = dir * (enter * 18 - exit * 16) * scaleAmount;
    this.apply(heroCopy, x, y, z, 0, rotY, 1 - exit * 0.05, 1 - Math.max(enter * 0.72, exit * 0.88));
  }
  apply(el, x, y, z, rotX, rotY, scale, opacity) {
    if (this.reduced.matches) {
      this.reset(el);
      return;
    }
    el.style.setProperty("translate", `${x.toFixed(1)}px ${y.toFixed(1)}px ${z.toFixed(1)}px`, "important");
    el.style.setProperty("rotate", `y ${rotY.toFixed(2)}deg`, "important");
    el.style.setProperty("scale", scale.toFixed(3), "important");
    el.style.setProperty("opacity", clamp(opacity, 0.18, 1).toFixed(3));
    el.dataset.spatialCamera = `${x.toFixed(0)},${y.toFixed(0)},${z.toFixed(0)},${rotX.toFixed(1)},${rotY.toFixed(1)}`;
  }
  reset(el) {
    el.style.setProperty("translate", "none", "important");
    el.style.setProperty("rotate", "none", "important");
    el.style.setProperty("scale", "1", "important");
    el.style.setProperty("opacity", "1", "important");
  }
};

// src/main.ts
window.__BENNI_SOVEREIGN_UI__ = sovereignUI;
var bootSovereignExperience = () => {
  acquireExperienceBus(window);
  sovereignUI.boot();
  new SpatialStoryEngine().init();
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootSovereignExperience);
} else {
  bootSovereignExperience();
}
console.log("\u{1F3DB}\uFE0F BENNI\xB7OS Sovereign UI Orchestrator & Shared Experience Bus Online");
