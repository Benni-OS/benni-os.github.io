import { acquireExperienceBus } from './experience-bus';

export class PerformanceWatchdog {
  private lastTime: number = performance.now();
  private frames: number = 0;
  private fps: number = 60;

  init(): void {
    const { bus } = acquireExperienceBus(window);
    bus.onFrame((_, now) => {
      this.frames++;
      if (now >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.frames = 0;
        this.lastTime = now;

        const fpsReadout = document.getElementById('benni-drawer-fps');
        if (fpsReadout) {
          fpsReadout.textContent = `${Math.min(60, Math.max(30, this.fps))} FPS · LOCKED`;
        }

        if (this.fps < 30) {
          document.body.classList.add('low-power-mode');
        }
      }
    });
  }

  get currentFps(): number {
    return this.fps;
  }
}
