import { acquireExperienceBus } from './sovereign-ui/experience-bus';

type SpatialRole = 'media' | 'copy' | 'card' | 'portal' | 'mark';

interface SpatialScene {
  section: HTMLElement;
  anchor: HTMLElement;
  media: HTMLElement[];
  copy: HTMLElement[];
  cards: HTMLElement[];
  direction: 1 | -1;
}

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const smooth = (value: number): number => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export class SpatialStoryEngine {
  private scenes: SpatialScene[] = [];
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  private dirty = true;
  private lastScrollY = -1;

  init(): void {
    (window as unknown as { __BENNI_SPATIAL_STORY_V2__?: SpatialStoryEngine }).__BENNI_SPATIAL_STORY_V2__ = this;
    this.collectScenes();

    const { bus } = acquireExperienceBus(window);
    bus.onScroll(() => {
      this.dirty = true;
    });
    bus.onResize(() => {
      this.dirty = true;
    });
    this.reduced.addEventListener('change', () => {
      this.dirty = true;
    });
    bus.onFrame(() => {
      if (this.dirty || Math.abs(window.scrollY - this.lastScrollY) > 0.05) {
        this.render();
      }
    });
    this.render();
  }

  private collectScenes(): void {
    const definitions: Array<{
      section: string;
      anchor?: string;
      media: string;
      copy: string;
      cards?: string;
    }> = [
      {
        section: '#actIIDossier',
        media: '.dossier-frame-container',
        copy: '.dossier-opening',
        cards: '.ledger-row',
      },
      {
        section: '#actIICorridor .wall-01',
        media: '.wall-media',
        copy: '.wall-content',
      },
      {
        section: '#actIICorridor .wall-02',
        media: '.wall-media',
        copy: '.wall-content',
      },
      {
        section: '#actIICorridor .wall-03',
        media: '.wall-frame',
        copy: '.wall-overlay-content',
      },
      {
        section: '#actIIChamber .plate-1',
        media: '.plate-video',
        copy: '.plate-content',
      },
      {
        section: '#actIIChamber .plate-2',
        media: '.plate-video',
        copy: '.plate-content',
      },
      {
        section: '#actIIChamber .plate-3',
        media: '.plate-video',
        copy: '.plate-content',
      },
      {
        section: '#livingReels',
        media: '.reel-card:first-child .reel-video-wrap',
        copy: '#livingReels > div:first-child',
        cards: '.reel-card',
      },
      {
        section: '#sovereigntyPipeline',
        media: '.pipeline-card:first-child .pipeline-img-wrap',
        copy: '#sovereigntyPipeline > div:first-child',
        cards: '.pipeline-card',
      },
      {
        section: '#operatorCockpit',
        media: '.cockpit-visual',
        copy: '.cockpit-copy',
      },
      {
        section: '#productTheater',
        media: '.theater-wrap',
        copy: '#productTheater > div:first-child',
      },
      {
        section: '.exit-section',
        media: '.exit-bg',
        copy: '.exit-content',
      },
      {
        section: '#actIIIDecision',
        anchor: '.benjamin-canvas',
        media: '.benjamin-media-box',
        copy: '.benjamin-statement-wrap, .benjamin-marginalia, .benjamin-pullquote-wrap',
        cards: '.marginalia-item',
      },
      {
        section: '#actIIIHandoff',
        media: '.handoff-wipe-layer',
        copy: '.handoff-statement',
      },
      {
        section: '#actIIIAdam',
        media: '.adam-media-frame',
        copy: '.adam-copy-stage2, .adam-copy-stage3, .adam-conversion-stage',
      },
      {
        section: '.benni-footer',
        media: '.benni-footer-mark',
        copy: '.benni-footer-system, .benni-footer-statement, .benni-footer-links',
      },
    ];

    definitions.forEach((def, index) => {
      const section = document.querySelector<HTMLElement>(def.section);
      if (!section) return;
      const anchor = def.anchor ? section.querySelector<HTMLElement>(def.anchor) || section : section;
      const media = Array.from(section.querySelectorAll<HTMLElement>(def.media));
      const copy = Array.from(section.querySelectorAll<HTMLElement>(def.copy));
      const cards = def.cards ? Array.from(section.querySelectorAll<HTMLElement>(def.cards)) : [];
      section.classList.add('spatial-scene');
      anchor.classList.add('spatial-stage-anchor');
      media.forEach((el) => this.tag(el, 'media'));
      copy.forEach((el) => this.tag(el, 'copy'));
      cards.forEach((el) => this.tag(el, 'card'));
      this.scenes.push({
        section,
        anchor,
        media,
        copy,
        cards,
        direction: index % 2 === 0 ? 1 : -1,
      });
    });
  }

  private tag(el: HTMLElement, role: SpatialRole): void {
    el.classList.remove('canvas-reveal', 'story-actor');
    el.classList.add('spatial-layer', `spatial-${role}-plane`);
    el.parentElement?.classList.add('spatial-chain');
  }

  private render = (): void => {
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
      scene.section.style.setProperty('--spatial-progress', progress.toFixed(4));
      scene.section.style.setProperty('--spatial-focus', focus.toFixed(4));

      scene.media.forEach((el, index) => {
        const dir = index % 2 === 0 ? scene.direction : (-scene.direction as 1 | -1);
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
        if (el.classList.contains('is-expanded') || el.classList.contains('is-selected')) {
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

  private renderHeroCopy(scaleAmount: number): void {
    const heroCopy = document.getElementById('heroCopy');
    const heroApi = (window as unknown as {
      __BENNI_HERO_3D__?: {
        getProgress: () => number;
        chapters: Array<{ start: number; end: number }>;
      };
    }).__BENNI_HERO_3D__;
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
    const local = clamp((p - chapter.start) / Math.max(0.001, chapter.end - chapter.start));
    const enter = idx === 0 ? 0 : 1 - smooth(local / 0.22);
    const exit = idx === chapters.length - 1 ? 0 : smooth((local - 0.72) / 0.28);
    const dir = idx % 2 === 0 ? 1 : -1;
    const x = dir * (enter * 165 - exit * 210) * scaleAmount;
    const y = (enter * 48 - exit * 72) * scaleAmount;
    const z = (-enter * 260 - exit * 220) * scaleAmount;
    const rotY = dir * (enter * 18 - exit * 16) * scaleAmount;
    this.apply(heroCopy, x, y, z, 0, rotY, 1 - exit * 0.05, 1 - Math.max(enter * 0.72, exit * 0.88));
  }

  private apply(
    el: HTMLElement,
    x: number,
    y: number,
    z: number,
    rotX: number,
    rotY: number,
    scale: number,
    opacity: number
  ): void {
    if (this.reduced.matches) {
      this.reset(el);
      return;
    }
    el.style.setProperty('translate', `${x.toFixed(1)}px ${y.toFixed(1)}px ${z.toFixed(1)}px`, 'important');
    el.style.setProperty('rotate', `y ${rotY.toFixed(2)}deg`, 'important');
    el.style.setProperty('scale', scale.toFixed(3), 'important');
    el.style.setProperty('opacity', clamp(opacity, 0.18, 1).toFixed(3));
    el.dataset.spatialCamera = `${x.toFixed(0)},${y.toFixed(0)},${z.toFixed(0)},${rotX.toFixed(1)},${rotY.toFixed(1)}`;
  }

  private reset(el: HTMLElement): void {
    el.style.setProperty('translate', 'none', 'important');
    el.style.setProperty('rotate', 'none', 'important');
    el.style.setProperty('scale', '1', 'important');
    el.style.setProperty('opacity', '1', 'important');
  }
}
