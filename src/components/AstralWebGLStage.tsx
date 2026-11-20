import React, { useEffect, useId, useRef } from 'react';
import * as THREE from 'three';
import type { SignId } from '../../shared/types.ts';
import { ZODIAC_SIGNS } from '../../shared/zodiacCatalog.ts';
import { astralLoopManager } from '../three/loopManager.ts';
import {
  addStudioLightingAndEnv,
  build3DElementSculpture,
  build3DEnvelope,
  buildZodiacWheelGroup,
  createContactShadowMesh,
  detectSoftwareWebGL,
  disposeObject3D,
  isLowPowerDevice,
  type ElementKind,
  type SculptureHandle,
  type ZodiacWheelHandle,
} from '../three/sculptures.ts';

export interface AstralWebGLStageProps {
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
  onReady?: () => void;
  onWebGLError?: () => void;
  snapshotApiRef?: React.MutableRefObject<(() => HTMLCanvasElement | null) | null>;
}

const STATIC_POSE_SEC = 0.85;

export const AstralWebGLStage: React.FC<AstralWebGLStageProps> = ({
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
  onReady,
  onWebGLError,
  snapshotApiRef,
}) => {
  const stageId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedSignRef = useRef<SignId>(selectedSignId);
  selectedSignRef.current = selectedSignId;
  const onSelectSignRef = useRef(onSelectSign);
  onSelectSignRef.current = onSelectSign;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const externalRotRef = useRef(rotationOffsetY);
  externalRotRef.current = rotationOffsetY;

  const isVisibleRef = useRef(true);
  const dragRotYRef = useRef(0);
  const needsStaticRenderRef = useRef(true);
  const wheelTargetRotRef = useRef(0);

  const sceneStateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    holderA: THREE.Group;
    holderB: THREE.Group;
    sculptures: SculptureHandle[];
    wheelHandle: ZodiacWheelHandle | null;
    isSoftware: boolean;
    renderNow: (t: number) => void;
  } | null>(null);

  // Sync wheel selection target & node highlights smoothly when selectedSignId changes
  useEffect(() => {
    const idx = ZODIAC_SIGNS.findIndex((s) => s.id === selectedSignId);
    const safeIdx = idx >= 0 ? idx : 0;
    // Rotate wheel so selected node faces camera (+Z)
    wheelTargetRotRef.current = -(safeIdx / 12) * Math.PI * 2;

    const st = sceneStateRef.current;
    if (st?.wheelHandle) {
      st.wheelHandle.nodes.forEach((n) => {
        const active = n.id === selectedSignId;
        n.mesh.scale.setScalar(active ? 1.55 : 0.92);
        const mat = n.mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = active ? 0.92 : 0.25;
      });
      if (reducedMotionRef.current) {
        st.wheelHandle.wheel.rotation.y = wheelTargetRotRef.current;
        st.renderNow(STATIC_POSE_SEC);
      } else {
        needsStaticRenderRef.current = true;
      }
    }
  }, [selectedSignId]);

  // Trigger a crisp render whenever external rotation or paused state changes
  useEffect(() => {
    needsStaticRenderRef.current = true;
    const st = sceneStateRef.current;
    if (st && (reducedMotion || paused)) {
      st.renderNow(STATIC_POSE_SEC);
    }
    astralLoopManager.notifyStateChange();
  }, [rotationOffsetY, paused, reducedMotion]);

  // Initialize renderer, camera, lighting & visibility observer once
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer,
      });
    } catch {
      onWebGLError?.();
      return;
    }

    const gl = renderer.getContext();
    const isSoftware = detectSoftwareWebGL(gl);
    const lowPower = isSoftware || isLowPowerDevice();

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const maxDpr = isSoftware ? 1 : lowPower ? 1.5 : 2;
    const applySize = () => {
      const w = Math.max(container.clientWidth, 40);
      const h = Math.max(container.clientHeight, 40);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    if (mode === 'wheel') {
      camera.position.set(0, 2.05, 4.35);
      camera.lookAt(0, 0, 0);
    } else if (mode === 'alchemy') {
      camera.position.set(0, 0.28, 4.65);
      camera.lookAt(0, -0.04, 0);
    } else {
      camera.position.set(0, 0.24, 3.25);
      camera.lookAt(0, -0.05, 0);
    }

    const disposeEnv = addStudioLightingAndEnv(renderer, scene, true);

    const holderA = new THREE.Group();
    const holderB = new THREE.Group();
    scene.add(holderA, holderB);

    let shadowA: THREE.Mesh | null = null;
    let shadowB: THREE.Mesh | null = null;
    if (contactShadow && mode !== 'wheel') {
      if (mode === 'alchemy') {
        shadowA = createContactShadowMesh(-0.78, 1.8);
        shadowA.position.x = -1.16;
        shadowB = createContactShadowMesh(-0.78, 1.8);
        shadowB.position.x = 1.16;
        scene.add(shadowA, shadowB);
      } else {
        shadowA = createContactShadowMesh(mode === 'envelope' ? -0.76 : -0.84, 2.35);
        scene.add(shadowA);
      }
    }

    const renderNow = (t: number) => {
      const st = sceneStateRef.current;
      if (!st) return;

      st.sculptures.forEach((sc, idx) => {
        sc.update(t + idx * 1.15);
      });

      const totalRotY = dragRotYRef.current + externalRotRef.current;
      if (mode === 'alchemy') {
        holderA.rotation.y = totalRotY * 0.6;
        holderB.rotation.y = totalRotY * 0.6;
      } else if (mode === 'wheel' && st.wheelHandle) {
        if (reducedMotionRef.current) {
          st.wheelHandle.wheel.rotation.y = wheelTargetRotRef.current;
        } else {
          // Shortest-angle lerp toward selected sign
          const cur = st.wheelHandle.wheel.rotation.y;
          const diff =
            ((((wheelTargetRotRef.current - cur) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) -
            Math.PI;
          st.wheelHandle.wheel.rotation.y = cur + diff * 0.12;
        }
      } else {
        holderA.rotation.y = totalRotY;
      }

      renderer.render(scene, camera);
    };

    sceneStateRef.current = {
      renderer,
      scene,
      camera,
      holderA,
      holderB,
      sculptures: [],
      wheelHandle: null,
      isSoftware,
      renderNow,
    };

    applySize();

    if (snapshotApiRef) {
      snapshotApiRef.current = () => {
        const st = sceneStateRef.current;
        if (!st) return null;
        // Render at high resolution into an offscreen 2D copy so 1080x1920 PNG export is crisp
        const snapSize = 420;
        const prevAspect = st.camera.aspect;
        st.renderer.setPixelRatio(1);
        st.renderer.setSize(snapSize, snapSize, false);
        st.camera.aspect = 1;
        st.camera.updateProjectionMatrix();
        st.renderer.render(st.scene, st.camera);

        const copy = document.createElement('canvas');
        copy.width = snapSize;
        copy.height = snapSize;
        const copyCtx = copy.getContext('2d');
        if (copyCtx) {
          copyCtx.drawImage(canvas, 0, 0, snapSize, snapSize);
        }

        st.camera.aspect = prevAspect;
        applySize();
        st.renderer.render(st.scene, st.camera);
        return copyCtx ? copy : canvas;
      };
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      onWebGLError?.();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        applySize();
        renderNow(STATIC_POSE_SEC);
      });
      ro.observe(container);
    }

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisibleRef.current = Boolean(entry?.isIntersecting);
          astralLoopManager.notifyStateChange();
        },
        { threshold: 0.05 }
      );
      io.observe(container);
    }

    const unregisterLoop = astralLoopManager.register({
      id: `stage-${stageId}`,
      isActive: () =>
        isVisibleRef.current &&
        !pausedRef.current &&
        !reducedMotionRef.current,
      isSoftwareGl: () => isSoftware,
      tick: (elapsedSec) => {
        renderNow(elapsedSec);
      },
    });

    onReady?.();

    return () => {
      unregisterLoop();
      ro?.disconnect();
      io?.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (snapshotApiRef) snapshotApiRef.current = null;
      disposeObject3D(scene);
      disposeEnv();
      renderer.dispose();
      sceneStateRef.current = null;
    };
  }, [mode, contactShadow, preserveDrawingBuffer, stageId, onReady, onWebGLError, snapshotApiRef]);

  // Rebuild geometry cleanly when mode/element/pairElements change without recreating renderer
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;

    while (st.holderA.children.length) {
      const ch = st.holderA.children[0];
      st.holderA.remove(ch);
      disposeObject3D(ch);
    }
    while (st.holderB.children.length) {
      const ch = st.holderB.children[0];
      st.holderB.remove(ch);
      disposeObject3D(ch);
    }
    st.sculptures = [];
    st.wheelHandle = null;

    const lowPower = st.isSoftware || isLowPowerDevice();

    if (mode === 'envelope') {
      const env = build3DEnvelope();
      st.holderA.position.set(0, 0, 0);
      st.holderA.scale.setScalar(1.0);
      st.holderA.add(env.group);
      st.sculptures.push(env);
    } else if (mode === 'element') {
      const el = build3DElementSculpture(element, lowPower);
      st.holderA.position.set(0, 0, 0);
      st.holderA.scale.setScalar(0.95);
      st.holderA.add(el.group);
      st.sculptures.push(el);
    } else if (mode === 'alchemy') {
      const [elA, elB] = pairElements;
      const scA = build3DElementSculpture(elA, lowPower);
      const scB = build3DElementSculpture(elB, lowPower);
      st.holderA.position.set(-1.16, 0.02, 0);
      st.holderA.scale.setScalar(0.72);
      st.holderB.position.set(1.16, 0.02, 0);
      st.holderB.scale.setScalar(0.72);
      st.holderA.add(scA.group);
      st.holderB.add(scB.group);
      st.sculptures.push(scA, scB);
    } else if (mode === 'wheel') {
      const wh = buildZodiacWheelGroup();
      const idx = ZODIAC_SIGNS.findIndex((s) => s.id === selectedSignRef.current);
      const safeIdx = idx >= 0 ? idx : 0;
      wheelTargetRotRef.current = -(safeIdx / 12) * Math.PI * 2;
      wh.wheel.rotation.y = wheelTargetRotRef.current;
      wh.nodes.forEach((n) => {
        const active = n.id === selectedSignRef.current;
        n.mesh.scale.setScalar(active ? 1.55 : 0.92);
        (n.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = active ? 0.92 : 0.25;
      });
      st.holderA.position.set(0, 0, 0);
      st.holderA.scale.setScalar(1.0);
      st.holderA.add(wh.wheel);
      st.wheelHandle = wh;
    }

    st.renderNow(STATIC_POSE_SEC);
  }, [mode, element, pairElements[0], pairElements[1]]);

  // Pointer interactions: horizontal drag rotation (touch-action: pan-y preserves page vertical scroll)
  // and raycast node click for the Zodiac Wheel.
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const draggedEnough = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    draggedEnough.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableDragRotate || !pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      draggedEnough.current = true;
    }
    // Only rotate when horizontal intent dominates so vertical page scroll never traps
    if (Math.abs(dx) > Math.abs(dy)) {
      dragRotYRef.current += dx * 0.012;
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      const st = sceneStateRef.current;
      if (st && (pausedRef.current || reducedMotionRef.current)) {
        st.renderNow(STATIC_POSE_SEC);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerDownPos.current;
    pointerDownPos.current = null;
    if (!start) return;

    if (mode === 'wheel' && !draggedEnough.current && onSelectSignRef.current) {
      const st = sceneStateRef.current;
      const canvas = canvasRef.current;
      if (!st?.wheelHandle || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, st.camera);
      const targets = st.wheelHandle.nodes.map((n) => n.hitMesh);
      const hits = raycaster.intersectObjects(targets, false);
      if (hits.length > 0) {
        const hitSignId = hits[0].object.userData.signId as SignId | undefined;
        if (hitSignId) {
          onSelectSignRef.current(hitSignId);
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerDownPos.current = null;
      }}
      style={enableDragRotate ? { touchAction: 'pan-y' } : undefined}
      className={`w-full h-full relative ${enableDragRotate ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <canvas
        ref={canvasRef}
        style={enableDragRotate ? { touchAction: 'pan-y' } : undefined}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};

export default AstralWebGLStage;
