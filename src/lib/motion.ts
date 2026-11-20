export const MOTION_TIMINGS = {
  pressMs: 120,
  sheetMs: 220,
  stampMs: 220,
  releaseMs: 480,
  unfoldTotalMs: 720,
} as const;

export function prefersReducedMotion(inAppReduced: boolean): boolean {
  if (inAppReduced) return true;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

export function triggerHaptic(kind: 'selection' | 'success', enabled: boolean): void {
  if (!enabled) return;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(kind === 'success' ? [12, 24, 16] : 8);
    } catch {
      // Ignore platforms restricting vibration
    }
  }
}
