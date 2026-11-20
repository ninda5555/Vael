/**
 * Single centralized requestAnimationFrame coordinator for all visible 3D scenes.
 * Ensures only one active loop runs across the app, pauses automatically when
 * the document is hidden, and yields cleanly on software WebGL (SwiftShader/llvmpipe).
 */

export interface LoopSubscriber {
  id: string;
  isActive: () => boolean;
  isSoftwareGl: () => boolean;
  tick: (elapsedSec: number, dtSec: number) => void;
}

class AstralLoopManager {
  private subscribers = new Map<string, LoopSubscriber>();
  private rafId: number | null = null;
  private timeoutId: number | null = null;
  private lastTimestamp = 0;
  private elapsedSec = 0;
  private listenerAttached = false;

  private onVisibilityChange = () => {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      this.stopTimer();
    } else if (this.hasActiveSubscribers()) {
      this.lastTimestamp = 0;
      this.scheduleNext();
    }
  };

  private attachListeners() {
    if (this.listenerAttached || typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.listenerAttached = true;
  }

  private detachListenersIfEmpty() {
    if (!this.listenerAttached || this.subscribers.size > 0 || typeof document === 'undefined') return;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.listenerAttached = false;
  }

  private hasActiveSubscribers(): boolean {
    for (const sub of this.subscribers.values()) {
      if (sub.isActive()) return true;
    }
    return false;
  }

  private stopTimer() {
    if (this.rafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private scheduleNext() {
    if (this.rafId !== null || this.timeoutId !== null) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (!this.hasActiveSubscribers()) return;

    let anySoftwareGl = false;
    for (const sub of this.subscribers.values()) {
      if (sub.isActive() && sub.isSoftwareGl()) {
        anySoftwareGl = true;
        break;
      }
    }

    const runStep = (ts: number) => {
      this.rafId = null;
      this.timeoutId = null;
      if (typeof document !== 'undefined' && document.hidden) return;

      const dt = this.lastTimestamp ? Math.min((ts - this.lastTimestamp) / 1000, 0.05) : 0.016;
      this.lastTimestamp = ts;
      this.elapsedSec += dt;

      let stillActive = false;
      for (const sub of this.subscribers.values()) {
        if (sub.isActive()) {
          stillActive = true;
          sub.tick(this.elapsedSec, dt);
        }
      }

      if (stillActive) {
        this.scheduleNext();
      }
    };

    if (anySoftwareGl) {
      // Software rasterizer pacing keeps Chromium responsive for interactive input & screenshots
      this.timeoutId = window.setTimeout(() => {
        this.timeoutId = null;
        this.rafId = requestAnimationFrame(runStep);
      }, 48);
    } else {
      this.rafId = requestAnimationFrame(runStep);
    }
  }

  register(sub: LoopSubscriber): () => void {
    this.subscribers.set(sub.id, sub);
    this.attachListeners();
    this.scheduleNext();
    return () => {
      this.subscribers.delete(sub.id);
      if (!this.hasActiveSubscribers()) {
        this.stopTimer();
      }
      this.detachListenersIfEmpty();
    };
  }

  notifyStateChange() {
    if (this.hasActiveSubscribers()) {
      this.scheduleNext();
    } else {
      this.stopTimer();
    }
  }
}

export const astralLoopManager = new AstralLoopManager();
