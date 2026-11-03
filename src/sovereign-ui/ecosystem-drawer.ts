export class EcosystemDrawer {
  init(): void {
    const trigger = document.querySelector<HTMLElement>('[data-drawer-trigger]');
    const drawer = document.getElementById('benni-ecosystem-drawer');
    if (!trigger || !drawer) return;

    // Ensure drawer contains quick jump navigation and live bus status
    if (!drawer.querySelector('.drawer-quick-links')) {
      const fpsRow = drawer.querySelector('div > div:last-child span:last-child');
      if (fpsRow) fpsRow.id = 'benni-drawer-fps';

      const navWrap = document.createElement('div');
      navWrap.className = 'drawer-quick-links';
      navWrap.style.cssText = 'margin-top:16px;padding-top:14px;border-top:1px solid rgba(212,175,55,0.2);display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:"IBM Plex Mono",monospace;font-size:10px;';
      const links: Array<[string, string]> = [
        ['#hero', '01 · HERO LAB'],
        ['#actIIDossier', '02 · DOSSIER'],
        ['#genesisIde', '03 · GENESIS IDE'],
        ['#sovereigntyPipeline', '04 · 7 STAGES'],
        ['#actIIIDecision', '05 · BENJAMIN'],
        ['#actIIIAdam', '06 · ADAM'],
      ];
      links.forEach(([href, label]) => {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        a.style.cssText = 'color:#e8e1d5;text-decoration:none;padding:7px 10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);transition:border-color 0.2s,color 0.2s;';
        a.addEventListener('mouseenter', () => {
          a.style.borderColor = 'rgba(212,175,55,0.5)';
          a.style.color = '#d4af37';
        });
        a.addEventListener('mouseleave', () => {
          a.style.borderColor = 'rgba(255,255,255,0.08)';
          a.style.color = '#e8e1d5';
        });
        a.addEventListener('click', () => {
          drawer.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
        navWrap.appendChild(a);
      });
      drawer.appendChild(navWrap);
    }

    const setOpen = (open: boolean) => {
      drawer.classList.toggle('open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !drawer.classList.contains('open');
      setOpen(isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!drawer.classList.contains('open')) return;
      const target = e.target as Node | null;
      if (target && !drawer.contains(target) && !trigger.contains(target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        setOpen(false);
        trigger.focus();
      }
    });
  }
}
