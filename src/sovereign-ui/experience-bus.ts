export interface ExperienceBusDiagnostics {
  lease_refs: number;
  clock_mode: 'existing_gsap_ticker' | 'shared_native_raf';
  active_frame_subscribers: number;
  pending_native_raf: number;
  ticks: number;
  callback_errors: string[];
  total_subscribers: number;
}

export interface ExperienceBus {
  version: 'benni.shared-bus/v1';
  frame_unit: 'seconds';
  readonly scrollY: number;
  readonly scrollProgress: number;
  readonly width: number;
  readonly height: number;
  onFrame(callback: (delta: number, timestamp: number) => void): () => void;
  onScroll(callback: (progress: number, scrollY: number, velocity: number) => void): () => void;
  onResize(callback: (width: number, height: number, dpr: number) => void): () => void;
  onPointerMove(callback: (clientX: number, clientY: number, normX: number, normY: number) => void): () => void;
  diagnostics(): ExperienceBusDiagnostics;
  acquireLease(): ExperienceBusLease;
  destroy(): void;
}

export interface ExperienceBusLease {
  bus: ExperienceBus;
  ownership: 'shared_owned_bus' | 'existing_host_bus';
  release(): void;
}

declare global {
  interface Window {
    __BENNI_RUNTIME__?: ExperienceBus;
    gsap?: {
      ticker?: {
        add(fn: (time: number) => void): void;
        remove(fn: (time: number) => void): void;
      };
    };
  }
}

const owned = new WeakMap<Window, { bus: ExperienceBus; refs: number }>();

export function acquireExperienceBus(view: Window = window): ExperienceBusLease {
  if (!view?.document || !view.requestAnimationFrame || !view.cancelAnimationFrame) {
    throw new Error('BROWSER_FRAME_CAPABILITY_REQUIRED');
  }
  if (view.__BENNI_RUNTIME__ && !owned.has(view)) {
    const bus = view.__BENNI_RUNTIME__;
    if (typeof bus.onFrame !== 'function' || typeof bus.onScroll !== 'function') {
      throw new Error('EXISTING_RUNTIME_REQUIRES_ONFRAME_ADAPTER');
    }
    if (bus.version === 'benni.shared-bus/v1' && typeof bus.acquireLease === 'function') {
      return bus.acquireLease();
    }
    return { bus, release() {}, ownership: 'existing_host_bus' };
  }

  let record = owned.get(view);
  if (!record) {
    const frames = new Set<(delta: number, timestamp: number) => void>();
    const scroll = new Set<(progress: number, scrollY: number, velocity: number) => void>();
    const resize = new Set<(width: number, height: number, dpr: number) => void>();
    const pointer = new Set<(clientX: number, clientY: number, normX: number, normY: number) => void>();
    const removals: Array<() => void> = [];
    let raf: number | null = null;
    let tickerAttached = false;
    let previous: number | null = null;
    let ticks = 0;
    let errors: string[] = [];

    const ticker = view.gsap?.ticker;
    const clockMode = ticker?.add && ticker?.remove ? 'existing_gsap_ticker' : 'shared_native_raf';

    const report = (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(msg);
      errors = errors.slice(-20);
    };

    const publish = <T extends unknown[]>(subscribers: Set<(...args: T) => void>, ...args: T) => {
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
      if (clockMode === 'existing_gsap_ticker' && ticker) {
        if (!tickerAttached) {
          tickerAttached = true;
          ticker.add(tickerCallback);
        }
      } else if (raf === null) {
        raf = view.requestAnimationFrame(tick);
      }
    };

    const tick = (timestamp: number) => {
      raf = null;
      const delta = previous === null ? 0 : Math.min(0.1, Math.max(0, (timestamp - previous) / 1000));
      previous = timestamp;
      ticks++;
      publish(frames, delta, timestamp);
      schedule();
    };

    const tickerCallback = (seconds: number) => tick(seconds * 1000);

    const listen = <K extends keyof WindowEventMap>(
      target: Window | Document,
      event: K | 'visibilitychange',
      callback: EventListener
    ) => {
      target.addEventListener(event, callback, { passive: true });
      removals.push(() => target.removeEventListener(event, callback));
    };

    const state = {
      scrollY: 0,
      scrollProgress: 0,
      width: view.innerWidth,
      height: view.innerHeight,
    };

    const measure = () => {
      const element = view.document.scrollingElement;
      state.scrollY = element?.scrollTop || view.scrollY || 0;
      state.scrollProgress =
        state.scrollY /
        Math.max(1, (element?.scrollHeight || 0) - (element?.clientHeight || view.innerHeight || 0));
    };

    listen(view, 'scroll', () => {
      measure();
      publish(scroll, state.scrollProgress, state.scrollY, 0);
    });

    listen(view, 'resize', () => {
      state.width = view.innerWidth;
      state.height = view.innerHeight;
      measure();
      publish(resize, state.width, state.height, Math.min(view.devicePixelRatio || 1, 2));
    });

    listen(view, 'pointermove', ((event: PointerEvent) => {
      publish(
        pointer,
        event.clientX,
        event.clientY,
        (event.clientX / Math.max(1, view.innerWidth)) * 2 - 1,
        (event.clientY / Math.max(1, view.innerHeight)) * 2 - 1
      );
    }) as EventListener);

    listen(view.document, 'visibilitychange', schedule as EventListener);
    measure();

    const collect = () => {
      if (record?.refs === 0 && frames.size + scroll.size + resize.size + pointer.size === 0) {
        bus.destroy();
        if (view.__BENNI_RUNTIME__ === bus) delete view.__BENNI_RUNTIME__;
        owned.delete(view);
      }
    };

    const subscribe = <T extends (...args: never[]) => void>(
      set: Set<T>,
      callback: T,
      clock = false
    ) => {
      if (typeof callback !== 'function') throw new Error('BUS_CALLBACK_REQUIRED');
      set.add(callback);
      if (clock) schedule();
      return () => {
        set.delete(callback);
        if (clock) schedule();
        collect();
      };
    };

    const bus: ExperienceBus = {
      version: 'benni.shared-bus/v1',
      frame_unit: 'seconds',
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
        total_subscribers: frames.size + scroll.size + resize.size + pointer.size,
      }),
      acquireLease: () => {
        if (!record) throw new Error('BUS_NOT_INITIALIZED');
        record.refs++;
        let released = false;
        return {
          bus,
          ownership: 'shared_owned_bus',
          release() {
            if (released || !record) return;
            released = true;
            record.refs--;
            if (record.refs === 0 && bus.diagnostics().total_subscribers === 0) {
              bus.destroy();
              if (view.__BENNI_RUNTIME__ === bus) delete view.__BENNI_RUNTIME__;
              owned.delete(view);
            }
          },
        };
      },
      destroy() {
        frames.clear();
        scroll.clear();
        resize.clear();
        pointer.clear();
        schedule();
        removals.splice(0).forEach((remove) => remove());
      },
    };

    record = { bus, refs: 0 };
    owned.set(view, record);
    view.__BENNI_RUNTIME__ = bus;
  }

  return record.bus.acquireLease();
}
