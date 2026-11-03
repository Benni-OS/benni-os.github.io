export class GenesisIdeController {
  private manualApproved: boolean = false;
  private manualModeIndex: number | null = null;

  init(): void {
    const track = document.querySelector<HTMLElement>('.genesis-scroll-track');
    const desktop = document.querySelector<HTMLElement>('.genesis-desktop-frame');
    const mobile = document.querySelector<HTMLElement>('.genesis-mobile-frame');
    const modesOverlay = document.querySelector<HTMLElement>('.genesis-modes-overlay');
    const modePills = document.querySelectorAll<HTMLElement>('.genesis-mode-pill');
    const founderPanel = document.querySelector<HTMLElement>('.genesis-founder-panel');
    const phaseFill = document.querySelector<HTMLElement>('.genesis-phase-fill');
    const phaseNum = document.getElementById('genesisPhaseNum');
    const phaseTitle = document.getElementById('genesisPhaseTitle');
    const approveBtn = document.querySelector<HTMLElement>('.mobile-touch-approve');
    const headerHud = document.querySelector<HTMLElement>('.genesis-header-hud');
    const tabs = document.querySelectorAll<HTMLElement>('.genesis-tab');
    const editorBody = document.querySelector<HTMLElement>('.genesis-editor-body');
    const terminalBar = document.querySelector<HTMLElement>('.genesis-terminal-bar');
    const mobileDiffBox = document.querySelector<HTMLElement>('.mobile-diff-box');

    if (!track || !desktop || !mobile) return;

    const tabContents: Array<{
      lines: string[];
      terminalLeft: string;
      terminalRight: string;
      mobileDiff: string;
    }> = [
      {
        lines: [
          `<div class="code-line"><span class="code-num">01</span><span style="color:#71717a;">// BENNI OS Genesis Action Protocol v1.0 — Shared Core</span></div>`,
          `<div class="code-line"><span class="code-num">02</span><span style="color:#ff79c6;">import</span> { <span style="color:#8be9fd;">SovereignEngine</span>, <span style="color:#8be9fd;">PolicyGate</span> } <span style="color:#ff79c6;">from</span> <span style="color:#f1fa8c;">'@benni-os/core'</span>;</div>`,
          `<div class="code-line"><span class="code-num">03</span></div>`,
          `<div class="code-line"><span class="code-num">04</span><span style="color:#ff79c6;">export async function</span> <span style="color:#50fa7b;">deployAutonomousPatch</span>(intent: <span style="color:#8be9fd;">string</span>) {</div>`,
          `<div class="code-line code-diff-del"><span class="code-num">05</span>-  const patch = await legacyCloudAi.generateWithoutProof(intent);</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">06</span>+  const plan = await SovereignEngine.compileIntent({ intent, bounds: STRICT });</div>`,
          `<div class="code-line code-diff-add"><span class="code-num">07</span>+  const approval = await PolicyGate.requestMobileTouch('GENESIS_MOBILE_OP');</div>`,
          `<div class="code-line"><span class="code-num">08</span>   return approval.status === 'VERIFIED' ? plan.execute() : plan.rollback();</div>`,
          `<div class="code-line"><span class="code-num">09</span>}</div>`,
        ],
        terminalLeft: 'genesis-terminal: tauri-rust allowlist [23 cmds active]',
        terminalRight: '✓ 0 drift · p99 latency 11.4ms',
        mobileDiff: `<span style="color:#ff6b8b;">- 12 legacy cloud calls</span><br><span style="color:#50fa7b;">+ 1 local sovereign loop</span><br><span style="color:#71717a;">Target: SovereignLoop.ts</span>`,
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
          `<div class="code-line"><span class="code-num">09</span>}</div>`,
        ],
        terminalLeft: 'cargo-check: nemesis-audit-chain [ed25519 + blake3]',
        terminalRight: '✓ Merkle root sealed · 4.1ms',
        mobileDiff: `<span style="color:#ff6b8b;">- unverified log write</span><br><span style="color:#50fa7b;">+ Ed25519 + BLAKE3 seal</span><br><span style="color:#71717a;">Target: AuditChain.rs</span>`,
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
          `<div class="code-line"><span class="code-num">09</span>}</div>`,
        ],
        terminalLeft: 'genesis.config.json: zero-exfiltration policy verified',
        terminalRight: '✓ QUIC mTLS paired · 12 nodes',
        mobileDiff: `<span style="color:#ff6b8b;">- cloud telemetry leak</span><br><span style="color:#50fa7b;">+ QUIC mTLS zero-exfil</span><br><span style="color:#71717a;">Target: genesis.config.json</span>`,
      },
    ];

    tabs.forEach((tab, idx) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      const activateTab = () => {
        tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
        const data = tabContents[idx] || tabContents[0];
        if (editorBody) editorBody.innerHTML = data.lines.join('');
        if (terminalBar) {
          terminalBar.innerHTML = `<span>${data.terminalLeft}</span><span style="color:#50fa7b;">${data.terminalRight}</span>`;
        }
        if (mobileDiffBox) mobileDiffBox.innerHTML = data.mobileDiff;
      };
      tab.addEventListener('click', activateTab);
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateTab();
        }
      });
    });

    const modeStatus: string[] = [
      'MODE 01 · THINK // Step ledger & causal graph active',
      'MODE 02 · BUILD // Streaming AST & Monaco diff synthesis',
      'MODE 03 · OPERATE // 12-node Nemesis agent mesh dispatched',
      'MODE 04 · RESEARCH // Citation-grounded primary source index',
      'MODE 05 · WITNESS // Cryptographic AuditChain & 1-click rollback',
    ];

    modePills.forEach((pill, idx) => {
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      const selectMode = () => {
        this.manualModeIndex = idx;
        modePills.forEach((p, i) => p.classList.toggle('active', i === idx));
        if (terminalBar && terminalBar.firstElementChild) {
          terminalBar.firstElementChild.textContent = modeStatus[idx] || modeStatus[0];
        }
      };
      pill.addEventListener('click', selectMode);
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectMode();
        }
      });
    });

    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.manualApproved = !this.manualApproved;
        approveBtn.classList.toggle('approved', this.manualApproved);
        approveBtn.textContent = this.manualApproved
          ? '✓ SIGNED & AUDITED'
          : 'TOUCH TO APPROVE';
      });
    }

    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const totalScroll = track.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const rawProgress = -rect.top / totalScroll;
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (phaseFill) phaseFill.style.width = `${(progress * 100).toFixed(1)}%`;

      const diffDelLines = document.querySelectorAll<HTMLElement>('.code-diff-del');
      const diffAddLines = document.querySelectorAll<HTMLElement>('.code-diff-add');

      // PHASE 1: 0.00 -> 0.22 (Desktop IDE Awakening)
      if (progress < 0.22) {
        const p1 = progress / 0.22;
        if (phaseNum) phaseNum.textContent = '01';
        if (phaseTitle) phaseTitle.textContent = 'CORE AWAKENING';

        const rx = 14 * (1 - p1);
        const ry = -10 * (1 - p1);
        const tz = -80 * (1 - p1);
        desktop.style.transform = `translate3d(0px, 24px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
        desktop.style.opacity = `${Math.min(1, 0.55 + p1 * 0.45)}`;

        mobile.style.transform = `translate3d(140px, 60px, -100px) rotateY(-22deg) scale(0.86)`;
        mobile.style.opacity = '0.15';

        if (modesOverlay) modesOverlay.style.opacity = '0.5';
        if (founderPanel) founderPanel.classList.remove('visible');
        if (headerHud) headerHud.style.opacity = '1';
      }
      // PHASE 2: 0.22 -> 0.48 (Mobile Companion Dock & Sync)
      else if (progress >= 0.22 && progress < 0.48) {
        const p2 = (progress - 0.22) / 0.26;
        if (phaseNum) phaseNum.textContent = '02';
        if (phaseTitle) phaseTitle.textContent = 'DUAL SURFACE SYNC';

        const deskX = -110 * p2;
        desktop.style.transform = `translate3d(${deskX.toFixed(1)}px, 20px, 0px) rotateX(2deg) rotateY(${(-6 * p2).toFixed(1)}deg) scale(${(1 - 0.06 * p2).toFixed(3)})`;
        desktop.style.opacity = '1';

        const mobX = 140 * (1 - p2);
        const mobY = 60 * (1 - p2);
        mobile.style.transform = `translate3d(${mobX.toFixed(1)}px, ${mobY.toFixed(1)}px, 30px) rotateY(${(-18 + 8 * p2).toFixed(1)}deg) scale(${(0.86 + 0.14 * p2).toFixed(3)})`;
        mobile.style.opacity = `${Math.min(1, 0.25 + p2 * 0.95)}`;

        if (modesOverlay) modesOverlay.style.opacity = '0.75';
        if (founderPanel) founderPanel.classList.remove('visible');
        if (headerHud) headerHud.style.opacity = `${Math.max(0.15, 1 - p2 * 0.85)}`;
      }
      // PHASE 3: 0.48 -> 0.70 (Live Code Diff + Mobile Touch Approval)
      else if (progress >= 0.48 && progress < 0.7) {
        const p3 = (progress - 0.48) / 0.22;
        if (phaseNum) phaseNum.textContent = '03';
        if (phaseTitle) phaseTitle.textContent = 'SOVEREIGN APPROVAL';

        desktop.style.transform = `translate3d(-110px, 16px, 0px) rotateX(0deg) rotateY(-6deg) scale(0.94)`;
        desktop.style.opacity = '1';
        mobile.style.transform = `translate3d(0px, 6px, 60px) rotateY(-6deg) scale(1.02)`;
        mobile.style.opacity = '1';

        if (p3 > 0.35) {
          diffDelLines.forEach((l) => (l.style.opacity = '0.4'));
          diffAddLines.forEach((l) => (l.style.opacity = '1'));
        } else {
          diffDelLines.forEach((l) => (l.style.opacity = '1'));
          diffAddLines.forEach((l) => (l.style.opacity = '0.35'));
        }

        const isApproved = this.manualApproved || p3 > 0.55;
        if (approveBtn) {
          approveBtn.classList.toggle('approved', isApproved);
          approveBtn.textContent = isApproved ? '✓ SIGNED & AUDITED' : 'TOUCH TO APPROVE';
        }
        if (modesOverlay) modesOverlay.style.opacity = '0.9';
        if (founderPanel) founderPanel.classList.remove('visible');
        if (headerHud) headerHud.style.opacity = '0';
      }
      // PHASE 4: 0.70 -> 0.90 (5 Sovereign Modes Carousel Sweep)
      else if (progress >= 0.7 && progress < 0.9) {
        const p4 = (progress - 0.7) / 0.2;
        if (phaseNum) phaseNum.textContent = '04';
        if (phaseTitle) phaseTitle.textContent = '5 SOVEREIGN MODES';

        desktop.style.transform = `translate3d(-125px, 10px, -20px) rotateY(-8deg) scale(0.9)`;
        desktop.style.opacity = '1';
        mobile.style.transform = `translate3d(15px, 12px, 40px) rotateY(-4deg) scale(0.95)`;
        mobile.style.opacity = '1';

        const activeModeIndex =
          this.manualModeIndex !== null ? this.manualModeIndex : Math.min(Math.floor(p4 * 5), 4);
        modePills.forEach((pill, idx) => {
          pill.classList.toggle('active', idx === activeModeIndex);
        });
        if (modesOverlay) modesOverlay.style.opacity = '1';
        if (founderPanel) founderPanel.classList.remove('visible');
        if (headerHud) headerHud.style.opacity = '0';
      }
      // PHASE 5: 0.90 -> 1.00 (Founder Alpha Climax)
      else {
        if (phaseNum) phaseNum.textContent = '05';
        if (phaseTitle) phaseTitle.textContent = 'FOUNDER ALPHA';

        desktop.style.transform = `translate3d(0, 0, -200px) scale(0.75)`;
        desktop.style.opacity = '0.2';
        mobile.style.transform = `translate3d(0, 0, -100px) scale(0.75)`;
        mobile.style.opacity = '0.2';

        if (modesOverlay) modesOverlay.style.opacity = '0.25';
        if (founderPanel) founderPanel.classList.add('visible');
        if (headerHud) headerHud.style.opacity = '0';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }
}
