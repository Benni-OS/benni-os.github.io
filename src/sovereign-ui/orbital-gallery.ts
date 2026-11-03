import { acquireExperienceBus } from './experience-bus';

interface StageSpec {
  step: string;
  name: string;
  title: string;
  desc: string;
  sla: string;
  protocol: string;
  verification: string;
  hash: string;
}

interface DossierSpec {
  num: string;
  kicker: string;
  desc: string;
  metrics: string[];
  code: string;
  videoSrc: string;
  posterSrc: string;
}

export class OrbitalGalleryEngine {
  init(): void {
    this.initHeroChapterStepper();
    this.initDossierBlueprints();
    this.initPipelineInspector();
    this.initCommandPalette();
  }

  private initHeroChapterStepper(): void {
    const hero = document.getElementById('hero');
    const stage = document.getElementById('heroStage');
    if (!hero || !stage || stage.querySelector('.hero-chapter-stepper')) return;

    const stepper = document.createElement('div');
    stepper.className = 'hero-chapter-stepper';
    stepper.setAttribute('aria-label', 'Navegação dos 11 capítulos do Hero');

    const meta = document.createElement('div');
    meta.className = 'hero-stepper-meta';
    meta.innerHTML = `<span>OPTICAL RIG</span><span class="hero-stepper-mode-badge" id="heroStepperMode">FOREGROUND-VIDEO</span>`;

    const pills = document.createElement('div');
    pills.className = 'hero-stepper-pills';
    pills.setAttribute('role', 'tablist');

    const chapterStarts = [0.0, 0.095, 0.175, 0.26, 0.34, 0.425, 0.535, 0.625, 0.715, 0.805, 0.9];
    const chapterModes = [
      'FOREGROUND-VIDEO',
      'RECESSED-VIDEO',
      'LATERAL-SPLIT',
      'RECESSED-VIDEO',
      'FOREGROUND-VIDEO',
      'LATERAL-SPLIT',
      'RECESSED-VIDEO',
      'FOREGROUND-VIDEO',
      'RECESSED-VIDEO',
      'MONOLITH-DECISION',
      'FOREGROUND-VIDEO',
    ];

    const buttons: HTMLButtonElement[] = [];

    for (let i = 0; i < 11; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `hero-stepper-btn${i === 0 ? ' is-active' : ''}`;
      const num = String(i + 1).padStart(2, '0');
      btn.textContent = num;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(i === 0));
      btn.setAttribute('aria-label', `Ir para o capítulo ${num}`);
      btn.addEventListener('click', () => {
        const total = Math.max(1, hero.offsetHeight - window.innerHeight);
        const targetProgress = chapterStarts[i] + 0.015;
        const targetY = hero.offsetTop + targetProgress * total;
        const lenis = (window as unknown as { __BENNI_LENIS__?: { scrollTo(y: number, opts?: object): void } }).__BENNI_LENIS__;
        if (lenis) {
          lenis.scrollTo(targetY, { duration: 1.35 });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      });
      buttons.push(btn);
      pills.appendChild(btn);
    }

    stepper.append(meta, pills);
    stage.appendChild(stepper);

    const modeBadge = meta.querySelector<HTMLElement>('#heroStepperMode');
    const syncStepper = () => {
      const currentChapter = stage.dataset.chapter || '01';
      const idx = Math.max(0, Math.min(10, parseInt(currentChapter, 10) - 1));
      buttons.forEach((b, i) => {
        const active = i === idx;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      if (modeBadge) {
        modeBadge.textContent = chapterModes[idx] || 'FOREGROUND-VIDEO';
      }
    };
    const { bus } = acquireExperienceBus(window);
    bus.onScroll(syncStepper);
    bus.onResize(syncStepper);
    bus.onFrame(syncStepper);
  }

  private initDossierBlueprints(): void {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('#actIIDossier .ledger-row'));
    const dossierVideo = document.querySelector<HTMLVideoElement>('#actIIDossier .dossier-video');
    if (!rows.length) return;

    const specs: DossierSpec[] = [
      {
        num: '01',
        kicker: 'CONTRACT // 00-MASTER-ORCHESTRATOR-BRAIN',
        desc: 'Governs macro-strategy, mission decomposition, budget envelopes, and deterministic multi-agent dispatch across the sovereign mesh.',
        metrics: ['SLA: < 8ms dispatch', 'QUORUM: 12 nodes', 'ROLLBACK: Atomic SHA'],
        code: `const mission = await MasterOS.compileMission({\n  intent: "sovereign_execution",\n  budgetCap: "strict",\n  evidenceRequired: true\n});`,
        videoSrc: 'card-orchestrate.mp4',
        posterSrc: 'card-orchestrate-still.png',
      },
      {
        num: '02',
        kicker: 'CONTRACT // 90-CONTROL-PLANE-AGENT-OS',
        desc: 'Maintains typed session graphs, immutable run ledgers, and cross-session state continuity without context drift.',
        metrics: ['STATE: Typed DAG', 'RETENTION: Verifiable', 'SYNC: Puter KV + Local'],
        code: `await ControlPlane.snapshot({\n  scope: "workspace_locked",\n  digest: "blake3_256",\n  rehydrateOnBoot: true\n});`,
        videoSrc: 'inside-memory.mp4',
        posterSrc: 'inside-memory-still.png',
      },
      {
        num: '03',
        kicker: 'CONTRACT // 97-NEMESIS-GATEWAY-OS',
        desc: 'Enforces default-deny policy gates, capability probes, and human-in-the-loop touch approval before any consequential external mutation.',
        metrics: ['GATE: Default-Deny', 'SIGNATURE: Ed25519', 'DRIFT: 0.00%'],
        code: `const permit = await Nemesis.verifyPolicy({\n  action: "external_mutation",\n  requireOperatorTouch: true\n});`,
        videoSrc: 'inside-policy.mp4',
        posterSrc: 'inside-policy-still.png',
      },
      {
        num: '04',
        kicker: 'CONTRACT // MCP-FORGE DECLARATIVE ENGINE',
        desc: 'Synthesizes zero-boilerplate MCP servers directly from strictly typed signatures with automatic STDIO, HTTP, and SSE transport bindings.',
        metrics: ['SCHEMA: Auto-Derived', 'TRANSPORT: STDIO · HTTP · SSE', 'LOCK-IN: Zero'],
        code: `@app.tool({ policy: "governed" })\nexport async function auditLedger(txId: string): Promise<Receipt> {\n  return Ledger.verify(txId);\n}`,
        videoSrc: 'card-execute.mp4',
        posterSrc: 'card-execute-still.png',
      },
      {
        num: '05',
        kicker: 'CONTRACT // 81-LOCAL-LLM-OS & INFERENCE',
        desc: 'Evaluates consequence, causal weight, and token unit economics before committing compute or external execution.',
        metrics: ['LATENCY p99: 14.2ms', 'ROUTING: Hybrid Local/Cloud', 'PRIVACY: Zero-Exfil'],
        code: `const decision = await Inference.weighConsequence({\n  hypothesis, \n  riskThreshold: 0.02\n});`,
        videoSrc: 'inside-inference.mp4',
        posterSrc: 'inside-inference-still.png',
      },
      {
        num: '06',
        kicker: 'CONTRACT // 01-OPERATOR-CORE-CONTRACT',
        desc: 'Unifies models, MCP tools, persistent memory, and human operators along a single cryptographically audited bridge.',
        metrics: ['BRIDGE: MCP ↔ HTTP', 'LEASE: Bounded TTL', 'AUDIT: 100% Traceable'],
        code: `const channel = OperatorGateway.openBridge({\n  protocol: "MCP_2026",\n  mutualTls: true\n});`,
        videoSrc: 'card-approve.mp4',
        posterSrc: 'card-orchestrate-still.png',
      },
      {
        num: '07',
        kicker: 'CONTRACT // BENNI NEXUS MESH ROUTER',
        desc: 'Routes intelligence across specialized model tiers and autonomous swarms while preserving end-to-end observability.',
        metrics: ['TOPOLOGY: 3D Mesh', 'FAILOVER: < 12ms', 'OBSERVABILITY: Full'],
        code: `const route = Nexus.routeIntelligence({\n  taskClass: "architectural_synthesis",\n  slaMs: 16\n});`,
        videoSrc: 'card-reason.mp4',
        posterSrc: 'card-reason-still.png',
      },
    ];

    rows.forEach((row, idx) => {
      const spec = specs[idx];
      if (!spec || row.querySelector('.ledger-blueprint')) return;

      const blueprint = document.createElement('div');
      blueprint.className = 'ledger-blueprint';
      blueprint.innerHTML = `
        <div class="ledger-blueprint-specs">
          <div class="ledger-blueprint-kicker">${spec.kicker}</div>
          <div class="ledger-blueprint-desc">${spec.desc}</div>
          <div class="ledger-blueprint-metrics">
            ${spec.metrics.map((m) => `<span class="ledger-metric-pill">${m}</span>`).join('')}
          </div>
        </div>
        <div class="ledger-blueprint-code">
          <button type="button" class="ledger-copy-btn" data-copy-code="${ idx }">COPY CONTRACT</button>
          <pre style="margin:0;font-family:inherit;white-space:pre-wrap;"><code>${spec.code}</code></pre>
        </div>
      `;
      row.appendChild(blueprint);

      const copyBtn = blueprint.querySelector<HTMLButtonElement>('.ledger-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(spec.code).catch(() => {});
          copyBtn.textContent = '✓ COPIED';
          setTimeout(() => {
            copyBtn.textContent = 'COPY CONTRACT';
          }, 1600);
        });
      }

      const activateRow = () => {
        const wasExpanded = row.classList.contains('is-expanded');
        rows.forEach((r) => r.classList.remove('is-expanded'));
        if (!wasExpanded) {
          row.classList.add('is-expanded');
          if (dossierVideo && dossierVideo.getAttribute('src') !== spec.videoSrc) {
            dossierVideo.poster = spec.posterSrc;
            dossierVideo.src = spec.videoSrc;
            dossierVideo.play().catch(() => {});
          }
        }
      };

      row.addEventListener('click', activateRow);
      if (idx === 0) {
        row.classList.add('is-expanded');
      }
    });
  }

  private initPipelineInspector(): void {
    const section = document.getElementById('sovereigntyPipeline');
    const grid = section?.querySelector<HTMLElement>('.pipeline-grid');
    const cards = Array.from(section?.querySelectorAll<HTMLElement>('.pipeline-card') || []);
    if (!section || !grid || !cards.length) return;

    const stages: StageSpec[] = [
      {
        step: 'STAGE 01 // INTENT CORE',
        name: 'Intent Core',
        title: '01 · Raw Operator Intent Compilation',
        desc: 'Captures natural operator intent and compiles it into a bounded, typed execution contract with explicit scope and rollback invariants.',
        sla: '1.8 ms',
        protocol: 'INTENT-AST / V3',
        verification: 'Schema + Scope Lock',
        hash: 'blake3::91a4...c08e',
      },
      {
        step: 'STAGE 02 // CONTROL PLANE',
        name: 'Control Plane',
        title: '02 · Persistent State & Context Hydration',
        desc: 'Hydrates the execution plan with historical decisions, project memory graph, and active workspace constraints before any agent is spawned.',
        sla: '3.2 ms',
        protocol: 'DAG-LEDGER / KV',
        verification: 'Zero Context Drift',
        hash: 'blake3::47f2...19b0',
      },
      {
        step: 'STAGE 03 // AGENT SWARM',
        name: 'Agent Swarm',
        title: '03 · Disjoint Ownership Swarm Formation',
        desc: 'Allocates specialized autonomous brains into typed slots with strict token budgets, isolated workspaces, and deterministic handoff contracts.',
        sla: '6.4 ms',
        protocol: 'SWARM-MESH / 12x',
        verification: 'Slot Budget Enforced',
        hash: 'blake3::c309...88d1',
      },
      {
        step: 'STAGE 04 // POLICY GATE',
        name: 'Policy Gate',
        title: '04 · Nemesis Default-Deny Policy Gate',
        desc: 'Intercepts every consequential tool call, validating risk tier, credentials, and operator touch approval before execution is permitted.',
        sla: '2.1 ms',
        protocol: 'NEMESIS-GATE / STRICT',
        verification: 'Ed25519 Signed Permit',
        hash: 'blake3::e820...54a9',
      },
      {
        step: 'STAGE 05 // EXECUTION SWIRL',
        name: 'Execution Swirl',
        title: '05 · High-Throughput Parallel Execution',
        desc: 'Executes verified mutations across local runtimes, MCP servers, and hybrid cloud workers with real-time telemetry and circuit breakers.',
        sla: '11.4 ms',
        protocol: 'MCP-FORGE / QUIC',
        verification: 'Idempotent Lease',
        hash: 'blake3::7b11...3f6c',
      },
      {
        step: 'STAGE 06 // NEMESIS SEAL',
        name: 'Nemesis Seal',
        title: '06 · Cryptographic Receipt & State Seal',
        desc: 'Seals the post-execution state digest, diff artifacts, and resource attribution into a tamper-evident cryptographic receipt.',
        sla: '4.1 ms',
        protocol: 'MERKLE-SEAL / V2',
        verification: 'SHA-256 + BLAKE3',
        hash: 'blake3::0d5e...a72f',
      },
      {
        step: 'STAGE 07 // EVIDENCE LEDGER',
        name: 'Evidence Ledger',
        title: '07 · Verifiable Evidence & Instant Rollback',
        desc: 'Publishes the final audit trail and visual/runtime evidence to the Operator Cockpit, keeping 1-click atomic rollback ready at any time.',
        sla: '2.5 ms',
        protocol: 'AUDIT-CHAIN / IMMUTABLE',
        verification: '100% Reconciled',
        hash: 'blake3::f94c...e21b',
      },
    ];

    let inspector = section.querySelector<HTMLElement>('.pipeline-inspector');
    if (!inspector) {
      inspector = document.createElement('div');
      inspector.className = 'pipeline-inspector';
      inspector.setAttribute('aria-live', 'polite');
      grid.after(inspector);
    }

    const selectStage = (idx: number) => {
      const spec = stages[idx] || stages[0];
      cards.forEach((c, i) => {
        const active = i === idx;
        c.classList.toggle('is-selected', active);
        c.setAttribute('aria-pressed', String(active));
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
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', () => selectStage(idx));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectStage(idx);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = (idx + 1) % cards.length;
          cards[next].focus();
          selectStage(next);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = (idx - 1 + cards.length) % cards.length;
          cards[prev].focus();
          selectStage(prev);
        }
      });
    });

    selectStage(0);
  }

  private initCommandPalette(): void {
    const statusGroup = document.querySelector<HTMLElement>('.site-nav .nav-status-group');
    if (!statusGroup || document.querySelector('.benni-cmd-backdrop')) return;

    const triggerBtn = document.createElement('button');
    triggerBtn.type = 'button';
    triggerBtn.className = 'nav-cmd-trigger';
    triggerBtn.setAttribute('aria-label', 'Abrir paleta de comandos (Ctrl+K)');
    triggerBtn.innerHTML = `<span class="cmd-label">COMMAND</span><kbd>⌘K</kbd>`;
    statusGroup.prepend(triggerBtn);

    const backdrop = document.createElement('div');
    backdrop.className = 'benni-cmd-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Paleta de Comandos Soberana BENNI·OS');
    backdrop.innerHTML = `
      <div class="benni-cmd-dialog">
        <div class="benni-cmd-header">
          <span style="color:#d4af37;font-family:'IBM Plex Mono',monospace;font-size:12px;">❯</span>
          <input type="search" class="benni-cmd-input" placeholder="Jump to section, chapter, architectural contract, or runtime action..." aria-label="Buscar comando ou seção" />
          <kbd style="font:500 10px 'IBM Plex Mono',monospace;color:#71717a;background:#050507;padding:3px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);">ESC</kbd>
        </div>
        <div class="benni-cmd-list" role="listbox"></div>
        <div class="benni-cmd-footer">
          <span>BENNI·OS SHARED BUS // v1 · 60 FPS</span>
          <span id="benniCmdDiagnostics">12 NODES · 0 DRIFT</span>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const input = backdrop.querySelector<HTMLInputElement>('.benni-cmd-input')!;
    const list = backdrop.querySelector<HTMLElement>('.benni-cmd-list')!;
    const diagSpan = backdrop.querySelector<HTMLElement>('#benniCmdDiagnostics')!;

    interface CmdItem {
      label: string;
      tag: string;
      keywords: string;
      run: () => void;
    }

    const scrollToSelector = (selector: string) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      const lenis = (window as unknown as { __BENNI_LENIS__?: { scrollTo(el: HTMLElement, opts?: object): void } }).__BENNI_LENIS__;
      if (lenis) {
        lenis.scrollTo(el, { offset: -76, duration: 1.5 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const items: CmdItem[] = [
      { label: 'Act I — Hero 3D Lab (11 Chapters)', tag: 'SECTION', keywords: 'hero arrival awakening origin', run: () => scrollToSelector('#hero') },
      { label: 'Act II — System Dossier (01–07 Blueprints)', tag: 'ARCHITECTURE', keywords: 'dossier master os control plane nemesis mcp forge', run: () => scrollToSelector('#actIIDossier') },
      { label: 'Act II — Memory, Policy & Inference Corridor', tag: 'CORRIDOR', keywords: 'corridor memory policy inference', run: () => scrollToSelector('#actIICorridor') },
      { label: 'Act II — Capability Chamber (Orchestrate · Reason · Execute)', tag: 'CHAMBER', keywords: 'chamber capability plates', run: () => scrollToSelector('#actIIChamber') },
      { label: 'Live Agent Mesh in Action (Action Reels)', tag: 'REELS', keywords: 'living reels dispatch approval ledger topology', run: () => scrollToSelector('#livingReels') },
      { label: 'BENNI OS Genesis IDE — Dual Desktop + Mobile Experience', tag: 'GENESIS IDE', keywords: 'genesis ide tauri expo code diff modes', run: () => scrollToSelector('#genesisIde') },
      { label: 'The 7 Stages of Sovereignty Pipeline', tag: 'PIPELINE', keywords: 'pipeline stages intent seal evidence', run: () => scrollToSelector('#sovereigntyPipeline') },
      { label: 'Operator Sovereign Cockpit & Hardware Substrate', tag: 'COCKPIT', keywords: 'operator cockpit hardware desk', run: () => scrollToSelector('#operatorCockpit') },
      { label: 'The Sovereign Runtime Film Theater', tag: 'FILM', keywords: 'product theater film video', run: () => scrollToSelector('#productTheater') },
      { label: 'Act III — Project Benjamin (Decision Intelligence)', tag: 'BENJAMIN', keywords: 'benjamin decision clarity water drop', run: () => scrollToSelector('#actIIIDecision') },
      { label: 'Act III — Adam: The First Move (Sovereign Execution)', tag: 'ADAM', keywords: 'adam execution first move', run: () => scrollToSelector('#actIIIAdam') },
      {
        label: 'Toggle Procedural Soundscape Audio (ON / OFF)',
        tag: 'AUDIO',
        keywords: 'audio sound mute unmute tone',
        run: () => {
          document.getElementById('benni-sound-toggle')?.click();
        },
      },
      {
        label: 'Switch Interface Language: Português (PT-BR)',
        tag: 'I18N',
        keywords: 'portugues pt language idioma',
        run: () => {
          (window as unknown as { __BENNI_I18N__?: { setLang(l: string): void } }).__BENNI_I18N__?.setLang('pt');
        },
      },
      {
        label: 'Switch Interface Language: English (EN)',
        tag: 'I18N',
        keywords: 'english en language idioma',
        run: () => {
          (window as unknown as { __BENNI_I18N__?: { setLang(l: string): void } }).__BENNI_I18N__?.setLang('en');
        },
      },
      {
        label: 'Switch Interface Language: Español (ES)',
        tag: 'I18N',
        keywords: 'espanol es spanish language idioma',
        run: () => {
          (window as unknown as { __BENNI_I18N__?: { setLang(l: string): void } }).__BENNI_I18N__?.setLang('es');
        },
      },
    ];

    let filtered = [...items];
    let selectedIdx = 0;

    const closePalette = () => {
      backdrop.classList.remove('is-open');
    };

    const renderList = () => {
      list.innerHTML = '';
      filtered.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `benni-cmd-item${idx === selectedIdx ? ' is-selected' : ''}`;
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', String(idx === selectedIdx));
        btn.innerHTML = `<span>${item.label}</span><span class="benni-cmd-item-tag">${item.tag}</span>`;
        btn.addEventListener('click', () => {
          closePalette();
          item.run();
        });
        list.appendChild(btn);
      });
    };

    const openPalette = () => {
      const diag = window.__BENNI_RUNTIME__?.diagnostics?.();
      if (diag) {
        diagSpan.textContent = `CLOCK: ${diag.clock_mode.toUpperCase()} · SUBS: ${diag.total_subscribers} · TICKS: ${diag.ticks}`;
      }
      backdrop.classList.add('is-open');
      input.value = '';
      filtered = [...items];
      selectedIdx = 0;
      renderList();
      setTimeout(() => input.focus(), 20);
    };

    triggerBtn.addEventListener('click', openPalette);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePalette();
    });

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      filtered = q
        ? items.filter((it) => (it.label + ' ' + it.tag + ' ' + it.keywords).toLowerCase().includes(q))
        : [...items];
      selectedIdx = 0;
      renderList();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (backdrop.classList.contains('is-open')) closePalette();
        else openPalette();
        return;
      }
      if (!backdrop.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
        triggerBtn.focus();
      } else if (e.key === 'ArrowDown' && filtered.length) {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % filtered.length;
        renderList();
      } else if (e.key === 'ArrowUp' && filtered.length) {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + filtered.length) % filtered.length;
        renderList();
      } else if (e.key === 'Enter' && filtered[selectedIdx]) {
        e.preventDefault();
        const chosen = filtered[selectedIdx];
        closePalette();
        chosen.run();
      }
    });
  }
}
