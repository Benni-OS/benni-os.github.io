import { acquireExperienceBus } from './experience-bus';

export class LumenSpotlight {
  private mouseX: number = window.innerWidth / 2;
  private mouseY: number = window.innerHeight / 2;
  private targetX: number = window.innerWidth / 2;
  private targetY: number = window.innerHeight / 2;
  private spotlightEl: HTMLElement | null = null;

  init(): void {
    let el = document.getElementById('benni-lumen-spotlight');
    if (!el) {
      el = document.createElement('div');
      el.id = 'benni-lumen-spotlight';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;top:0;left:0;width:400px;height:400px;border-radius:50%;pointer-events:none;z-index:2;transform:translate(-50%, -50%);background:radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 45%, transparent 70%);mix-blend-mode:screen;transition:opacity 0.3s ease;';
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

  private loop = (): void => {
    this.mouseX += (this.targetX - this.mouseX) * 0.12;
    this.mouseY += (this.targetY - this.mouseY) * 0.12;

    if (this.spotlightEl) {
      this.spotlightEl.style.transform = `translate3d(${(this.mouseX - 200).toFixed(1)}px, ${(this.mouseY - 200).toFixed(1)}px, 0)`;
    }
  };
}
