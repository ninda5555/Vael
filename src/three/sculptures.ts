import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { SignId } from '../../shared/types.ts';
import { ZODIAC_SIGNS } from '../../shared/zodiacCatalog.ts';

export type ElementKind = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface SculptureHandle {
  group: THREE.Group;
  update: (elapsedSec: number) => void;
}

export interface WheelNodeRef {
  id: SignId;
  mesh: THREE.Mesh;
  hitMesh: THREE.Mesh;
  angle: number;
}

export interface ZodiacWheelHandle {
  wheel: THREE.Group;
  nodes: WheelNodeRef[];
  sun: THREE.Mesh;
}

const FIRE_SIGNS = new Set<SignId>(['aries', 'leo', 'sagittarius']);
const EARTH_SIGNS = new Set<SignId>(['taurus', 'virgo', 'capricorn']);
const AIR_SIGNS = new Set<SignId>(['gemini', 'libra', 'aquarius']);

export function getElementForSign(signId: SignId): ElementKind {
  if (FIRE_SIGNS.has(signId)) return 'Fire';
  if (EARTH_SIGNS.has(signId)) return 'Earth';
  if (AIR_SIGNS.has(signId)) return 'Air';
  return 'Water';
}

let cachedWebGLSupported: boolean | null = null;

export function isWebGLAvailable(): boolean {
  if (cachedWebGLSupported !== null) return cachedWebGLSupported;
  if (typeof document === 'undefined') {
    cachedWebGLSupported = false;
    return false;
  }
  try {
    const testCanvas = document.createElement('canvas');
    const gl =
      testCanvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      testCanvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      testCanvas.getContext('experimental-webgl');
    cachedWebGLSupported = Boolean(gl);
  } catch {
    cachedWebGLSupported = false;
  }
  return cachedWebGLSupported;
}

export function resetWebGLAvailabilityCache(): void {
  cachedWebGLSupported = null;
}

export function detectSoftwareWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const rendererStr = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
      if (/swiftshader|llvmpipe|software|mesa offscreen/.test(rendererStr)) {
        return true;
      }
    }
    const baseRenderer = String(gl.getParameter(gl.RENDERER) || '').toLowerCase();
    return /swiftshader|llvmpipe|software/.test(baseRenderer);
  } catch {
    return false;
  }
}

export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  return cores <= 4 || mem <= 2;
}

export function createSoftShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.5);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.52)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.22)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function addStudioLightingAndEnv(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  withEnvironment = true
): () => void {
  const disposables: Array<{ dispose: () => void }> = [];

  if (withEnvironment) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();
    disposables.push(envTarget);
  }

  const hemi = new THREE.HemisphereLight(0xf6f3ec, 0x1b1c1f, 0.72);
  const key = new THREE.DirectionalLight(0xfff2dc, 1.85);
  key.position.set(2.4, 3.0, 2.8);
  const fill = new THREE.DirectionalLight(0xd9e4f5, 0.58);
  fill.position.set(-2.6, 1.2, 1.8);
  const rim = new THREE.DirectionalLight(0xf3ece0, 0.65);
  rim.position.set(0.4, 2.2, -3.0);

  scene.add(hemi, key, fill, rim);

  return () => {
    disposables.forEach((d) => d.dispose());
    scene.environment = null;
  };
}

export function createContactShadowMesh(y = -0.88, scale = 2.4): THREE.Mesh {
  const tex = createSoftShadowTexture();
  const geo = new THREE.PlaneGeometry(scale, scale);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.name = 'contact-shadow';
  return mesh;
}

/**
 * Signature folded ivory envelope resting on dark charcoal paper surface.
 */
export function build3DEnvelope(): SculptureHandle {
  const root = new THREE.Group();
  root.name = 'unsent-envelope-3d';

  const envelope = new THREE.Group();
  envelope.rotation.set(0.18, -0.26, 0.04);

  const ivoryMat = new THREE.MeshStandardMaterial({
    color: 0xf1ede4,
    roughness: 0.78,
    metalness: 0.04,
  });
  const foldShadeMat = new THREE.MeshStandardMaterial({
    color: 0xe3ddd1,
    roughness: 0.84,
    metalness: 0.03,
  });
  const innerSheetMat = new THREE.MeshStandardMaterial({
    color: 0xfaf8f2,
    roughness: 0.72,
    metalness: 0.02,
  });
  const waxMat = new THREE.MeshStandardMaterial({
    color: 0xa63a32,
    roughness: 0.36,
    metalness: 0.08,
  });

  // Main folded paper body (rounded box proportions with crisp thickness)
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.74, 1.12, 0.075), ivoryMat);
  envelope.add(body);

  // Subtle inner letter sheet peeking along top seam
  const innerSheet = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.18, 0.045), innerSheetMat);
  innerSheet.position.set(0, 0.49, 0.012);
  envelope.add(innerSheet);

  // Front diagonal pocket flaps (left, right, bottom overlapping planes for unmistakable envelope creases)
  const pocketShape = new THREE.Shape();
  pocketShape.moveTo(-0.86, -0.55);
  pocketShape.lineTo(0.86, -0.55);
  pocketShape.lineTo(0.86, 0.14);
  pocketShape.lineTo(0, -0.18);
  pocketShape.lineTo(-0.86, 0.14);
  pocketShape.closePath();

  const pocketGeo = new THREE.ExtrudeGeometry(pocketShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
  const pocketMesh = new THREE.Mesh(pocketGeo, foldShadeMat);
  pocketMesh.position.z = 0.038;
  envelope.add(pocketMesh);

  // Top folded triangular flap, slightly lifted from its crease
  const flapGroup = new THREE.Group();
  flapGroup.position.set(0, 0.55, 0.056);

  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.85, 0);
  flapShape.lineTo(0.85, 0);
  flapShape.lineTo(0, -0.62);
  flapShape.closePath();

  const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
  const flapMesh = new THREE.Mesh(flapGeo, ivoryMat);
  flapGroup.add(flapMesh);

  // Subtle clay-red wax seal on the flap tip
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.028, 28), waxMat);
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, -0.55, 0.03);
  flapGroup.add(seal);

  // Lift flap gently so shadow separates flap from pocket
  flapGroup.rotation.x = -0.18;
  envelope.add(flapGroup);

  root.add(envelope);

  const update = (t: number) => {
    envelope.position.y = Math.sin(t * 1.15) * 0.035;
    envelope.rotation.y = -0.26 + Math.sin(t * 0.65) * 0.1;
    flapGroup.rotation.x = -0.18 - Math.sin(t * 1.15) * 0.03;
  };

  return { group: root, update };
}

/**
 * Restored ASTRAL 3D Element Sculptures (Fire, Earth, Air, Water)
 * preserving the original composite geometry, mineral/elemental palette,
 * and subtle brass accents while keeping reading brightness steady and gentle.
 */
export function build3DElementSculpture(
  elementName: ElementKind,
  lowPower = false
): SculptureHandle {
  const group = new THREE.Group();
  group.userData.element = elementName;

  if (elementName === 'Fire') {
    const makeFlame = (
      sx: number,
      sy: number,
      sz: number,
      colorHex: number,
      opacity: number,
      yOff: number
    ) => {
      const geo = new THREE.ConeGeometry(0.62, 1.55, lowPower ? 20 : 28, lowPower ? 12 : 16, true);
      geo.userData.base = Float32Array.from(geo.attributes.position.array);
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.7,
          roughness: 0.35,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
        })
      );
      mesh.scale.set(sx, sy, sz);
      mesh.position.y = yOff;
      return mesh;
    };

    // Vermilion outer edge, amber middle, pale hot core
    const outer = makeFlame(1.04, 1.04, 1.04, 0xe85334, 0.72, 0.05);
    const mid = makeFlame(0.75, 0.92, 0.75, 0xf59d42, 0.86, -0.05);
    const core = makeFlame(0.45, 0.72, 0.45, 0xfff2b2, 0.95, -0.18);

    const baseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.03, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0xd9b26f, metalness: 0.65, roughness: 0.28 })
    );
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -0.75;

    const emberN = lowPower ? 48 : 96;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberN * 3);
    for (let i = 0; i < emberN; i++) {
      const a = (i * 2.39996) % (Math.PI * 2);
      const r = 0.22 + ((i * 17) % 10) * 0.078;
      emberPos[i * 3] = Math.cos(a) * r;
      emberPos[i * 3 + 1] = -0.75 + ((i * 13) % 20) * 0.1;
      emberPos[i * 3 + 2] = Math.sin(a) * r;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const embers = new THREE.Points(
      emberGeo,
      new THREE.PointsMaterial({ color: 0xffc56d, size: 0.052, transparent: true, opacity: 0.88 })
    );

    const glow = new THREE.PointLight(0xff7b3d, 2.8, 7);
    glow.position.set(0, 0.2, 0.75);

    group.add(outer, mid, core, baseRing, embers, glow);

    const flames = [outer, mid, core];
    const speeds = [2.6, 3.4, 4.15];
    const update = (t: number) => {
      flames.forEach((m, idx) => {
        const pos = m.geometry.attributes.position as THREE.BufferAttribute;
        const base = m.geometry.userData.base as Float32Array;
        const spd = speeds[idx];
        for (let i = 0; i < pos.count; i++) {
          const bx = base[i * 3];
          const by = base[i * 3 + 1];
          const bz = base[i * 3 + 2];
          const hNorm = Math.max(0, (by + 0.77) / 1.55);
          const bendX = Math.sin(t * spd + by * 3.4 + bx * 1.8) * 0.13 * hNorm;
          const bendZ = Math.cos(t * (spd * 0.82) + by * 2.7) * 0.1 * hNorm;
          pos.setXYZ(i, bx + bendX, by, bz + bendZ);
        }
        pos.needsUpdate = true;
      });

      const ep = embers.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < emberN; i++) {
        let y = ep.getY(i) + 0.012;
        if (y > 1.32) y = -0.74;
        ep.setY(i, y);
        ep.setX(i, ep.getX(i) + Math.sin(t * 0.9 + i) * 0.0025);
      }
      ep.needsUpdate = true;
      group.rotation.y = Math.sin(t * 0.35) * 0.25 + t * 0.14;
    };

    return { group, update };
  }

  if (elementName === 'Earth') {
    const makePeak = (r: number, h: number, seg: number, col: number, x: number, y: number, z: number) => {
      const geo = new THREE.ConeGeometry(r, h, seg, 2);
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        if (pos.getY(i) < h * 0.4) {
          pos.setX(i, pos.getX(i) * (0.86 + ((i * 19) % 10) * 0.028));
          pos.setZ(i, pos.getZ(i) * (0.86 + ((i * 23) % 10) * 0.028));
        }
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.7,
          metalness: 0.15,
          flatShading: true,
        })
      );
      mesh.position.set(x, y, z);
      return mesh;
    };

    const mainPeak = makePeak(0.75, 1.36, 7, 0x528865, 0, -0.05, 0.1);
    const leftPeak = makePeak(0.55, 0.96, 6, 0x39634b, -0.56, -0.25, -0.08);
    const rightPeak = makePeak(0.52, 0.88, 6, 0x6aa37a, 0.54, -0.28, -0.06);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 28, 28),
      new THREE.MeshStandardMaterial({
        color: 0xf5ead6,
        emissive: 0xd9b26f,
        emissiveIntensity: 0.38,
        roughness: 0.52,
      })
    );
    moon.position.set(0, 0.5, -0.6);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.06, 0.026, 10, 64),
      new THREE.MeshStandardMaterial({ color: 0xd9b26f, metalness: 0.68, roughness: 0.32 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.72;

    const shards = new THREE.Group();
    const shardCount = lowPower ? 6 : 8;
    for (let i = 0; i < shardCount; i++) {
      const a = (i / shardCount) * Math.PI * 2;
      const sh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.085, 0),
        new THREE.MeshStandardMaterial({
          color: 0x8fd19e,
          emissive: 0x366b48,
          emissiveIntensity: 0.32,
          roughness: 0.22,
          metalness: 0.28,
        })
      );
      sh.position.set(Math.cos(a) * 1.12, -0.3 + (i % 3) * 0.24, Math.sin(a) * 1.12);
      shards.add(sh);
    }

    const sweepLight = new THREE.PointLight(0xf6ecd8, 2.2, 6);
    sweepLight.position.set(1.5, 1.1, 1.5);

    group.add(mainPeak, leftPeak, rightPeak, moon, ring, shards, sweepLight);

    const update = (t: number) => {
      // Mountains remain heavy & grounded; light moves subtly across facets while shards orbit slowly
      group.rotation.y = Math.sin(t * 0.18) * 0.18;
      sweepLight.position.x = Math.cos(t * 0.55) * 1.9;
      sweepLight.position.z = Math.sin(t * 0.55) * 1.9;
      shards.rotation.y = t * 0.38;
      shards.children.forEach((c, idx) => {
        c.rotation.x = t * 0.7 + idx;
        c.rotation.y = t * 0.6;
      });
    };

    return { group, update };
  }

  if (elementName === 'Air') {
    const ribbons = new THREE.Group();
    const tubeSegs = lowPower ? 44 : 64;
    [0, 1, 2].forEach((idx) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 42; i++) {
        const u = i / 42;
        const angle = u * Math.PI * 3.2 + idx * ((Math.PI * 2) / 3);
        const radius = 0.28 + Math.sin(u * Math.PI) * 0.76;
        pts.push(new THREE.Vector3(Math.cos(angle) * radius, (u - 0.5) * 1.52, Math.sin(angle) * radius));
      }
      ribbons.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), tubeSegs, 0.03 - idx * 0.004, 8, false),
          new THREE.MeshStandardMaterial({
            color: idx === 0 ? 0x9bd2f5 : idx === 1 ? 0xd8eefc : 0x6eaee0,
            emissive: 0x4e8fc7,
            emissiveIntensity: 0.4,
            roughness: 0.25,
            metalness: 0.2,
            transparent: true,
            opacity: 0.88,
          })
        )
      );
    });

    const clouds = new THREE.Group();
    [
      [-0.56, 0.34, 0.22, 0.2],
      [0.52, -0.24, 0.24, 0.18],
      [0.08, 0.62, -0.24, 0.16],
    ].forEach(([x, y, z, r]) => {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(r, 18, 18),
        new THREE.MeshStandardMaterial({
          color: 0xebf5fd,
          roughness: 0.82,
          transparent: true,
          opacity: 0.7,
        })
      );
      puff.scale.set(1.42, 0.72, 1.0);
      puff.position.set(x, y, z);
      puff.userData.baseY = y;
      clouds.add(puff);
    });

    const dustCount = lowPower ? 36 : 84;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const u = ((i * 37) % 100) / 100 - 0.5;
      const v = ((i * 53) % 100) / 100 - 0.5;
      const w = ((i * 71) % 100) / 100 - 0.5;
      dustPos[i * 3] = u * 2.2;
      dustPos[i * 3 + 1] = v * 2.1;
      dustPos[i * 3 + 2] = w * 2.2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xc6e6fb, size: 0.044, transparent: true, opacity: 0.68 })
    );

    group.add(ribbons, clouds, dust);

    const update = (t: number) => {
      ribbons.rotation.y = t * 0.62;
      clouds.rotation.y = -t * 0.24;
      clouds.children.forEach((c, idx) => {
        const baseY = (c.userData.baseY as number) ?? 0;
        c.position.y = baseY + Math.sin(t * 1.2 + idx * 1.4) * 0.045;
      });
      dust.rotation.y = t * 0.34;
    };

    return { group, update };
  }

  // Water: shallow sapphire pool inside brass rim, hovering crescent, restrained droplets
  const radialSegs = lowPower ? 18 : 26;
  const angSegs = lowPower ? 36 : 48;
  const radius = 1.09;
  const positions: number[] = [];
  const indices: number[] = [];

  // Center vertex
  positions.push(0, 0, 0);
  for (let r = 1; r <= radialSegs; r++) {
    const rad = (r / radialSegs) * radius;
    for (let a = 0; a < angSegs; a++) {
      const theta = (a / angSegs) * Math.PI * 2;
      positions.push(Math.cos(theta) * rad, 0, Math.sin(theta) * rad);
    }
  }
  for (let a = 0; a < angSegs; a++) {
    const next = (a + 1) % angSegs;
    indices.push(0, 1 + next, 1 + a);
  }
  for (let r = 1; r < radialSegs; r++) {
    const rowStart = 1 + (r - 1) * angSegs;
    const nextRowStart = 1 + r * angSegs;
    for (let a = 0; a < angSegs; a++) {
      const next = (a + 1) % angSegs;
      const a0 = rowStart + a;
      const a1 = rowStart + next;
      const b0 = nextRowStart + a;
      const b1 = nextRowStart + next;
      indices.push(a0, a1, b0);
      indices.push(a1, b1, b0);
    }
  }

  const poolGeo = new THREE.BufferGeometry();
  poolGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  poolGeo.setIndex(indices);
  poolGeo.computeVertexNormals();
  poolGeo.userData.base = Float32Array.from(positions);

  const poolMat = new THREE.MeshPhysicalMaterial({
    color: 0x2456a8,
    emissive: 0x102854,
    emissiveIntensity: 0.48,
    roughness: 0.14,
    metalness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
  });
  const pool = new THREE.Mesh(poolGeo, poolMat);
  pool.position.y = -0.36;

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.11, 0.028, 12, 64),
    new THREE.MeshStandardMaterial({ color: 0xd9b26f, metalness: 0.68, roughness: 0.28 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.36;

  const crescent = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.09, 16, 48, Math.PI * 1.25),
    new THREE.MeshStandardMaterial({
      color: 0xf5ead6,
      emissive: 0xd9b26f,
      emissiveIntensity: 0.46,
      roughness: 0.3,
    })
  );
  crescent.position.set(0.08, 0.58, -0.34);
  crescent.rotation.z = Math.PI * 0.62;

  const dropletN = lowPower ? 24 : 52;
  const dropletGeo = new THREE.BufferGeometry();
  const dropletPos = new Float32Array(dropletN * 3);
  for (let i = 0; i < dropletN; i++) {
    const a = (i * 2.39996) % (Math.PI * 2);
    const r = 0.25 + ((i * 19) % 12) * 0.072;
    dropletPos[i * 3] = Math.cos(a) * r;
    dropletPos[i * 3 + 1] = -0.15 + ((i * 11) % 14) * 0.085;
    dropletPos[i * 3 + 2] = Math.sin(a) * r;
  }
  dropletGeo.setAttribute('position', new THREE.BufferAttribute(dropletPos, 3));
  const droplets = new THREE.Points(
    dropletGeo,
    new THREE.PointsMaterial({ color: 0x9bc3f7, size: 0.042, transparent: true, opacity: 0.68 })
  );

  const moonLight = new THREE.PointLight(0x88b8ff, 2.8, 7);
  moonLight.position.set(0.15, 0.95, 0.7);

  group.add(pool, rim, crescent, droplets, moonLight);

  const update = (t: number) => {
    const pos = pool.geometry.attributes.position as THREE.BufferAttribute;
    const base = pool.geometry.userData.base as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const bz = base[i * 3 + 2];
      const dist = Math.hypot(bx, bz);
      const atten = Math.max(0, 1 - dist / 1.14);
      const ripple =
        (Math.sin(dist * 7.5 - t * 2.1) * 0.042 +
          Math.sin(bx * 3.1 + t * 1.7) * 0.034 +
          Math.cos(bz * 3.4 - t * 1.4) * 0.03) *
        atten;
      pos.setY(i, ripple);
    }
    pos.needsUpdate = true;
    pool.geometry.computeVertexNormals();

    crescent.position.y = 0.58 + Math.sin(t * 0.85) * 0.022;
    droplets.rotation.y = t * 0.18;
    group.rotation.y = Math.sin(t * 0.22) * 0.24;
  };

  return { group, update };
}

/**
 * Restored 3D Zodiac Wheel with radiant central sun, three fine brass orbital rings,
 * and 12 selectable sign nodes.
 */
export function buildZodiacWheelGroup(): ZodiacWheelHandle {
  const wheel = new THREE.Group();

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xffe6a3,
      emissive: 0xd99b38,
      emissiveIntensity: 0.85,
      roughness: 0.3,
    })
  );
  wheel.add(sun);

  const rayMat = new THREE.MeshStandardMaterial({
    color: 0xd9b26f,
    emissive: 0xd9b26f,
    emissiveIntensity: 0.42,
    roughness: 0.32,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.32, 4), rayMat);
    ray.position.set(Math.sin(a) * 0.44, 0, Math.cos(a) * 0.44);
    ray.rotation.z = -Math.sin(a) * (Math.PI / 2);
    ray.rotation.x = Math.cos(a) * (Math.PI / 2);
    wheel.add(ray);
  }

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd9b26f,
    metalness: 0.72,
    roughness: 0.26,
  });
  [1.05, 1.65, 1.92].forEach((r, idx) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, idx === 1 ? 0.026 : 0.013, 10, 96), ringMat);
    ring.rotation.x = Math.PI / 2;
    wheel.add(ring);
  });

  const nodes: WheelNodeRef[] = [];
  const spokeMat = new THREE.LineBasicMaterial({
    color: 0xd9b26f,
    transparent: true,
    opacity: 0.36,
  });
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  ZODIAC_SIGNS.forEach((s, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const colorNum = new THREE.Color(s.accentColor);
    const node = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshStandardMaterial({
        color: colorNum,
        emissive: colorNum,
        emissiveIntensity: 0.35,
        roughness: 0.24,
        metalness: 0.28,
      })
    );
    node.position.set(Math.sin(angle) * 1.65, 0.07, Math.cos(angle) * 1.65);
    node.userData.signId = s.id;
    wheel.add(node);

    const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 10), hitMat);
    hitMesh.position.copy(node.position);
    hitMesh.userData.signId = s.id;
    wheel.add(hitMesh);

    const spokeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.sin(angle) * 1.05, 0, Math.cos(angle) * 1.05),
      new THREE.Vector3(Math.sin(angle) * 1.92, 0, Math.cos(angle) * 1.92),
    ]);
    wheel.add(new THREE.Line(spokeGeo, spokeMat));

    nodes.push({ id: s.id, mesh: node, hitMesh, angle });
  });

  return { wheel, nodes, sun };
}

/**
 * Recursively disposes Three.js geometries, materials, and textures attached to an Object3D.
 */
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const anyObj = obj as unknown as {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };
    if (anyObj.geometry) {
      anyObj.geometry.dispose();
    }
    if (anyObj.material) {
      const mats = Array.isArray(anyObj.material) ? anyObj.material : [anyObj.material];
      for (const m of mats) {
        const rec = m as unknown as Record<string, unknown>;
        for (const val of Object.values(rec)) {
          if (val && typeof val === 'object' && 'isTexture' in val && typeof (val as THREE.Texture).dispose === 'function') {
            (val as THREE.Texture).dispose();
          }
        }
        m.dispose();
      }
    }
  });
}
