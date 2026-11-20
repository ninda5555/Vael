import React, { Suspense, useCallback, useMemo, useState } from 'react';
import type { SignId } from '../../shared/types.ts';
import { isWebGLAvailable, type ElementKind } from '../three/sculptures.ts';
import { BundledSculptureStill, type StillKind } from './BundledSculptureStills.tsx';

const LazyWebGLStage = React.lazy(() => import('./AstralWebGLStage.tsx'));

export interface AstralCanvas3DProps {
  mode: 'envelope' | 'element' | 'wheel' | 'alchemy';
  element?: ElementKind;
  pairElements?: [ElementKind, ElementKind];
  selectedSignId?: SignId;
  onSelectSign?: (signId: SignId) => void;
  enableDragRotate?: boolean;
  rotationOffsetY?: number;
  paused?: boolean;
  reducedMotion?: boolean;
  preserveDrawingBuffer?: boolean;
  contactShadow?: boolean;
  className?: string;
  ariaLabel?: string;
  snapshotApiRef?: React.MutableRefObject<(() => HTMLCanvasElement | null) | null>;
}

/**
 * Public 3D artwork wrapper:
 * - Renders a lightweight bundled local still on frame 1 with zero layout shift
 * - Lazy-loads the Three.js WebGL stage and crossfades in cleanly over 140ms
 * - Automatically stays on the bundled still if WebGL is unavailable or context is lost
 */
export const AstralCanvas3D: React.FC<AstralCanvas3DProps> = ({
  mode,
  element = 'Water',
  pairElements = ['Air', 'Water'],
  selectedSignId = 'pisces',
  onSelectSign,
  enableDragRotate = false,
  rotationOffsetY = 0,
  paused = false,
  reducedMotion = false,
  preserveDrawingBuffer = false,
  contactShadow = true,
  className = '',
  ariaLabel,
  snapshotApiRef,
}) => {
  const [webGLReady, setWebGLReady] = useState(false);
  const [webGLFailed, setWebGLFailed] = useState(false);

  const webGLSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return isWebGLAvailable();
  }, []);

  const handleReady = useCallback(() => {
    setWebGLReady(true);
  }, []);

  const handleError = useCallback(() => {
    setWebGLFailed(true);
    setWebGLReady(false);
  }, []);

  const stillKind: StillKind =
    mode === 'envelope' ? 'envelope' : mode === 'wheel' ? 'wheel' : element;

  const showFallback = !webGLSupported || webGLFailed;

  return (
    <div
      className={`relative select-none ${className}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {/* Lightweight local still (visible immediately while 3D loads, or permanently as WebGL fallback) */}
      {mode === 'alchemy' ? (
        <div
          className={`absolute inset-0 flex items-center justify-around px-4 transition-opacity duration-150 pointer-events-none ${
            webGLReady && !showFallback ? 'opacity-0' : 'opacity-100'
          }`}
          data-fallback-visible={showFallback ? 'true' : 'false'}
        >
          <BundledSculptureStill kind={pairElements[0]} className="w-24 h-24 sm:w-28 sm:h-28" />
          <BundledSculptureStill kind={pairElements[1]} className="w-24 h-24 sm:w-28 sm:h-28" />
        </div>
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 pointer-events-none ${
            webGLReady && !showFallback ? 'opacity-0' : 'opacity-100'
          }`}
          data-fallback-visible={showFallback ? 'true' : 'false'}
        >
          <BundledSculptureStill kind={stillKind} className="w-full h-full max-w-full max-h-full" />
        </div>
      )}

      {!showFallback && (
        <Suspense fallback={null}>
          <div
            className={`w-full h-full transition-opacity duration-150 ${
              webGLReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <LazyWebGLStage
              mode={mode}
              element={element}
              pairElements={pairElements}
              selectedSignId={selectedSignId}
              onSelectSign={onSelectSign}
              enableDragRotate={enableDragRotate}
              rotationOffsetY={rotationOffsetY}
              paused={paused}
              reducedMotion={reducedMotion}
              preserveDrawingBuffer={preserveDrawingBuffer}
              contactShadow={contactShadow}
              onReady={handleReady}
              onWebGLError={handleError}
              snapshotApiRef={snapshotApiRef}
            />
          </div>
        </Suspense>
      )}
    </div>
  );
};
