import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { subscribeScaleUnit } from "../../utils/scaleUnit";
import { computeCanvasPixelRatio, installBoundedCanvasSizing } from "../../utils/canvasResolution";
import {
  CUBE_COUNT,
  computeAllCubeTargets,
  getOverviewAnchor,
} from "./CubeFormations";
import { getSectionConfig, type SectionId, type SpatialItem } from "./spatialModel";

export type ProjectedLabelMap = Record<string, HTMLButtonElement | null>;

type SpatialStageProps = {
  items: SpatialItem[];
  section: SectionId;
  selected: SpatialItem | null;
  hoveredSlug: string | null;
  transitionKey: string;
  bootHolding?: boolean;
  bootHovering?: boolean;
  suspended?: boolean;
  labelRefs: React.MutableRefObject<ProjectedLabelMap>;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
  onBootEnter?: () => void;
  onBootHover?: (hovering: boolean) => void;
};

type BootCubeCell = {
  gx: number;
  gy: number;
  gz: number;
  burstX: number;
  burstY: number;
  burstZ: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  color: string;
  microDelay: number;
};

// Exact 120 mini-cubes arranged as a solid 5×5×5 GameCube jewel (all 98 outer surface faces
// 100% solid + 22 inner shell cells; only the 5 deepest occluded center voxels are omitted).
const BOOT_HERO_CUBE: BootCubeCell[] = (() => {
  const hiddenCore = new Set([
    "0,0,0",
    "1,0,0",
    "-1,0,0",
    "0,1,0",
    "0,-1,0",
  ]);
  const cells: BootCubeCell[] = [];
  let idx = 0;

  for (let gx = -2; gx <= 2; gx++) {
    for (let gy = -2; gy <= 2; gy++) {
      for (let gz = -2; gz <= 2; gz++) {
        if (hiddenCore.has(`${gx},${gy},${gz}`)) continue;
        const dist = Math.hypot(gx, gy, gz) || 1;
        const nx = gx / dist;
        const ny = gy / dist;
        const nz = gz / dist;
        const isOuter = Math.abs(gx) === 2 || Math.abs(gy) === 2 || Math.abs(gz) === 2;

        // Deterministic organic radial burst spread so the cube cracks apart into 120 distinct mini-cubes
        const seed = Math.sin(idx * 12.9898 + 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        const seed2 = Math.sin(idx * 93.9898 + 19.133) * 24634.6345;
        const rand2 = seed2 - Math.floor(seed2);

        const burstRadius = (isOuter ? 2.55 : 1.75) + rand * 1.95;
        const swirlAngle = (rand2 - 0.5) * 0.55;
        const cosA = Math.cos(swirlAngle);
        const sinA = Math.sin(swirlAngle);
        const bx = (nx * cosA - nz * sinA) * burstRadius;
        const by = ny * burstRadius * 0.92 + (rand - 0.35) * 0.75;
        const bz = (nx * sinA + nz * cosA) * burstRadius * 0.82;

        // Luminous amethyst-lavender crystal palette across the segmented 5×5×5 cube
        const cornerScore = Math.abs(gx) + Math.abs(gy) + Math.abs(gz);
        const color = !isOuter
          ? "#5c39b0"
          : cornerScore >= 5
            ? "#9a76e8"
            : cornerScore === 4
              ? "#8461db"
              : (gx + gy + gz) % 2 === 0
                ? "#744fcb"
                : "#8f6ce2";

        cells.push({
          gx,
          gy,
          gz,
          burstX: bx,
          burstY: by,
          burstZ: bz,
          spinX: (rand - 0.5) * 4.4 + (nx >= 0 ? 1.4 : -1.4),
          spinY: (rand2 - 0.5) * 4.8 + (ny >= 0 ? 1.5 : -1.5),
          spinZ: (rand - 0.5) * 3.4,
          color,
          // Outer shell bursts first (0ms), inner core follows right behind (~55ms)
          microDelay: (isOuter ? 0 : 0.045) + rand * 0.035,
        });
        idx++;
      }
    }
  }
  return cells;
})();

const BOOT_CUBE_CENTER_Y = 0.54;

type CubeState = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  color: Color;
  // Parametric transition start snapshots (true GameCube staggered wave!)
  startX: number;
  startY: number;
  startZ: number;
  startRx: number;
  startRy: number;
  startRz: number;
  startScale: number;
  // Optional radial burst waypoint for the cohesive intro cube split-apart transition
  burstX: number;
  burstY: number;
  burstZ: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  delay: number;
  flipAxis: number;
};

function easeOutBack(t: number, overshoot = 1.12): number {
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function StageArchitecture({
  section,
  hasSelection,
  heroCenterX,
  reduced,
}: {
  section: SectionId;
  hasSelection: boolean;
  heroCenterX: number;
  reduced: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const outerRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);
  const cfg = getSectionConfig(section);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.065);
    const t = reduced ? 0 : clock.getElapsedTime();

    // Morph gracefully between a subtle museum turntable plinth in Hero mode
    // and a dead-center architectural halo behind Overview clusters
    const targetScale = hasSelection ? 0.66 : cfg.ringScale * 0.88;
    const targetX = hasSelection ? heroCenterX : 0;
    const targetY = hasSelection ? -2.25 : -0.36;
    const targetZ = hasSelection ? 0.45 : -2.6;
    const targetRotX = hasSelection ? -Math.PI * 0.44 : 0;

    if (groupRef.current) {
      groupRef.current.position.x = MathUtils.damp(groupRef.current.position.x, targetX, 4.5, delta);
      groupRef.current.position.y = MathUtils.damp(groupRef.current.position.y, targetY, 4.5, delta);
      groupRef.current.position.z = MathUtils.damp(groupRef.current.position.z, targetZ, 4.5, delta);
      groupRef.current.rotation.x = MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4.5, delta);
      groupRef.current.scale.setScalar(
        MathUtils.damp(groupRef.current.scale.x, targetScale, 4.5, delta),
      );
    }
    if (outerRef.current) outerRef.current.rotation.z = t * 0.035;
    if (innerRef.current) innerRef.current.rotation.z = -t * 0.05;
  });

  // Hide concentric rings in Experience/Library row layouts unless in Hero plinth mode
  const ringOpacity = hasSelection
    ? 0.42
    : section === "experience" || section === "library"
      ? 0.14
      : 0.28;

  return (
    <group ref={groupRef} position={[0, -0.36, -2.6]}>
      <mesh ref={outerRef}>
        <ringGeometry args={[4.45, 4.48, 128]} />
        <meshBasicMaterial color="#b9a1e3" transparent opacity={ringOpacity} />
      </mesh>
      <mesh ref={innerRef}>
        <ringGeometry args={[2.85, 2.875, 96]} />
        <meshBasicMaterial color="#cbb9ec" transparent opacity={ringOpacity * 0.8} />
      </mesh>
    </group>
  );
}

function LivingCubeSwarm({
  items,
  section,
  selected,
  hoveredSlug,
  transitionKey,
  bootHolding = false,
  bootHovering = false,
  reduced,
  labelRefs,
  onSelect,
  onHover,
  onBootEnter,
  onBootHover,
}: Omit<SpatialStageProps, "suspended"> & { reduced: boolean }) {
  const { camera, size } = useThree();
  const meshRef = useRef<InstancedMesh>(null);
  const rigRef = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const bootPivot = useMemo(() => new Object3D(), []);
  const localVec = useMemo(() => new Vector3(), []);
  const targetColor = useMemo(() => new Color(), []);
  const projVec = useMemo(() => new Vector3(), []);

  // Crisp precision-milled beveled cube geometry (12.5% bevel radius for Apple/GameCube specular catchlights)
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 5, 0.125), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const timelineRef = useRef(0);
  const transitionStartWallRef = useRef(performance.now());
  const lastTransitionKeyRef = useRef("");
  const wasBootHoldingRef = useRef(bootHolding);
  const bootSplitActiveRef = useRef(false);
  const bootHoverMixRef = useRef(0);
  const lastSizeRef = useRef({ w: size.width, h: size.height });
  const cameraTargetPos = useMemo(() => new Vector3(0, 0.2, 13.6), []);

  // Initialize cubes: if bootHolding is active, start poised cleanly in the floating 5×5×5 hero cube!
  const cubesRef = useRef<CubeState[] | null>(null);
  if (!cubesRef.current) {
    const initPivot = new Object3D();
    initPivot.position.set(0, BOOT_CUBE_CENTER_Y, 0);
    initPivot.rotation.set(0.48, 0.68, 0);
    initPivot.updateMatrix();
    const v = new Vector3();

    cubesRef.current = Array.from({ length: CUBE_COUNT }, (_, i) => {
      const cell = BOOT_HERO_CUBE[i];
      if (bootHolding && cell) {
        v.set(cell.gx * 0.436, cell.gy * 0.436, cell.gz * 0.436).applyMatrix4(
          initPivot.matrix,
        );
        return {
          x: v.x,
          y: v.y,
          z: v.z,
          rx: 0.48,
          ry: 0.68,
          rz: 0,
          scale: 0.424,
          color: new Color(cell.color),
          startX: v.x,
          startY: v.y,
          startZ: v.z,
          startRx: 0.48,
          startRy: 0.68,
          startRz: 0,
          startScale: 0.424,
          burstX: v.x,
          burstY: v.y,
          burstZ: v.z,
          spinX: cell.spinX,
          spinY: cell.spinY,
          spinZ: cell.spinZ,
          delay: cell.microDelay,
          flipAxis: i % 3,
        };
      }
      const a = (i / CUBE_COUNT) * Math.PI * 2;
      const sx = 0.8 + Math.cos(a) * 3.4;
      const sy = 2.8 + (i % 6) * 0.22;
      const sz = -1.2 + Math.sin(a) * 1.1;
      return {
        x: sx,
        y: sy,
        z: sz,
        rx: (i % 4) * (Math.PI / 2),
        ry: (i % 3) * (Math.PI / 2),
        rz: 0,
        scale: 0.08,
        color: new Color("#9f82e6"),
        startX: sx,
        startY: sy,
        startZ: sz,
        startRx: 0,
        startRy: 0,
        startRz: 0,
        startScale: 0.08,
        burstX: sx,
        burstY: sy,
        burstZ: sz,
        spinX: 1,
        spinY: 1,
        spinZ: 0.5,
        delay: (i / CUBE_COUNT) * 0.16,
        flipAxis: i % 3,
      };
    });
  }

  // Snapshot full pose on every state transition; if leaving bootHolding, arm the cohesive
  // 2-stage split-apart-into-mini-cubes -> main-page sculpture transition!
  useEffect(() => {
    if (lastTransitionKeyRef.current === transitionKey) return;
    const leavingBoot = wasBootHoldingRef.current && !bootHolding;
    wasBootHoldingRef.current = bootHolding;
    lastTransitionKeyRef.current = transitionKey;
    transitionStartWallRef.current = performance.now();

    const states = cubesRef.current;
    if (!states) return;

    if (leavingBoot && !reduced) {
      bootSplitActiveRef.current = true;
      const rotVec = new Vector3();
      const rotObj = new Object3D();
      // Rotate each cell's burst vector by the cube's live orientation so mini-cubes fly cleanly off its faces!
      rotObj.rotation.set(states[0].rx, states[0].ry, states[0].rz);
      rotObj.updateMatrix();

      for (let i = 0; i < states.length; i++) {
        const st = states[i];
        const cell = BOOT_HERO_CUBE[i];
        st.startX = st.x;
        st.startY = st.y;
        st.startZ = st.z;
        st.startRx = st.rx;
        st.startRy = st.ry;
        st.startRz = st.rz;
        st.startScale = st.scale;

        if (cell) {
          rotVec.set(cell.burstX, cell.burstY, cell.burstZ).applyMatrix4(rotObj.matrix);
          st.burstX = st.x + rotVec.x;
          st.burstY = st.y + rotVec.y;
          st.burstZ = st.z + rotVec.z;
          st.spinX = cell.spinX;
          st.spinY = cell.spinY;
          st.spinZ = cell.spinZ;
          st.delay = cell.microDelay;
        }
      }
      return;
    }

    bootSplitActiveRef.current = false;
    for (let i = 0; i < states.length; i++) {
      const st = states[i];
      st.startX = st.x;
      st.startY = st.y;
      st.startZ = st.z;
      st.startRx = st.rx;
      st.startRy = st.ry;
      st.startRz = st.rz;
      st.startScale = st.scale;
      // Spatial wave sweeps cleanly left-to-right across the stage
      const normX = MathUtils.clamp((st.x + 5.5) / 11, 0, 1);
      st.delay = normX * 0.18 + (i % 5) * 0.008;
    }
  }, [transitionKey, bootHolding, reduced]);

  const stageAspect = size.width / Math.max(1, size.height);
  const heroCenterX =
    stageAspect >= 1.48 ? -2.05 : stageAspect >= 1.18 ? -1.72 : -1.3;
  const sectionConfig = getSectionConfig(section);

  useFrame(({ pointer }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    if (!reduced) {
      timelineRef.current += delta;
    }
    const t = timelineRef.current;
    // Use real wall-clock elapsed time so wave choreography & labels stay crisp at any framerate
    const elapsed = Math.max(0, (performance.now() - transitionStartWallRef.current) / 1000);

    // Smooth, resolution-independent aspect-aware camera choreography (identical framing at 720p / 1080p / 1440p / 4K)
    const [cx, cy, cz] = sectionConfig.cameraPosition;
    const aspect = size.width / Math.max(1, size.height);
    const isCompactDesktop = aspect < 1.28;
    const minOverviewZ =
      5.65 / (Math.tan((40 * Math.PI) / 360) * Math.max(0.75, aspect));
    const targetZ = bootHolding
      ? 13.2
      : selected
        ? 11.4
        : Math.max(cz, Math.min(20.5, minOverviewZ));
    const resizedThisFrame =
      lastSizeRef.current.w !== size.width || lastSizeRef.current.h !== size.height;
    if (resizedThisFrame) {
      lastSizeRef.current.w = size.width;
      lastSizeRef.current.h = size.height;
    }

    cameraTargetPos.set(
      (bootHolding ? 0 : selected ? cx : 0) + (reduced ? 0 : pointer.x * 0.36),
      (bootHolding ? 0.16 : cy + (selected ? 0 : isCompactDesktop ? 0.42 : 0)) +
        (reduced ? 0 : pointer.y * 0.2),
      targetZ,
    );
    if (reduced || resizedThisFrame) {
      camera.position.copy(cameraTargetPos);
    } else {
      camera.position.lerp(cameraTargetPos, 1 - Math.exp(-delta * 4.2));
    }
    camera.lookAt(
      bootHolding ? 0 : selected ? heroCenterX * 0.1 : 0,
      bootHolding ? 0.12 : selected ? 0.02 : isCompactDesktop ? 0.36 : -0.12,
      0,
    );

    // Subtle whole-stage tilt following pointer
    if (rigRef.current) {
      rigRef.current.rotation.y = MathUtils.damp(
        rigRef.current.rotation.y,
        reduced ? 0 : pointer.x * (bootHolding ? 0.12 : selected ? 0.16 : 0.055),
        4.2,
        delta,
      );
      rigRef.current.rotation.x = MathUtils.damp(
        rigRef.current.rotation.x,
        reduced ? 0 : -pointer.y * (bootHolding ? 0.08 : selected ? 0.09 : 0.03),
        4.2,
        delta,
      );
    }

    const mesh = meshRef.current;
    const states = cubesRef.current;
    if (!mesh || !states) return;

    // Intro void: all 120 mini-cubes tightly locked into ONE segmented floating purple crystal cube!
    if (bootHolding && !reduced) {
      bootHoverMixRef.current = MathUtils.damp(
        bootHoverMixRef.current,
        bootHovering ? 1 : 0,
        7.5,
        delta,
      );
      const hoverMix = bootHoverMixRef.current;

      const bobY = Math.sin(t * 1.45) * 0.14;
      const rotX = 0.48 + Math.sin(t * 0.65) * 0.13;
      const rotY = t * 0.52 + 0.68;
      const rotZ = Math.sin(t * 0.42) * 0.08;

      bootPivot.position.set(0, BOOT_CUBE_CENTER_Y + bobY, 0);
      bootPivot.rotation.set(rotX, rotY, rotZ);
      bootPivot.updateMatrix();

      // Hovering "Enter" or the cube gently opens micro-seams & swells it with eager anticipation!
      const spacing = 0.436 + hoverMix * 0.036;
      const subScale = 0.424 + hoverMix * 0.01;

      for (let i = 0; i < CUBE_COUNT; i++) {
        const st = states[i];
        const cell = BOOT_HERO_CUBE[i];
        if (!cell) continue;

        localVec
          .set(cell.gx * spacing, cell.gy * spacing, cell.gz * spacing)
          .applyMatrix4(bootPivot.matrix);

        st.x = localVec.x;
        st.y = localVec.y;
        st.z = localVec.z;
        st.rx = rotX;
        st.ry = rotY;
        st.rz = rotZ;
        st.scale = MathUtils.damp(st.scale, subScale, 9, delta);

        dummy.position.set(st.x, st.y, st.z);
        dummy.rotation.set(st.rx, st.ry, st.rz);
        dummy.scale.setScalar(st.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        targetColor.set(cell.color);
        st.color.lerp(targetColor, 1 - Math.exp(-delta * 8));
        mesh.setColorAt(i, st.color);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      return;
    }

    const targets = computeAllCubeTargets(
      items,
      section,
      selected,
      hoveredSlug,
      t,
      heroCenterX,
    );

    const isBootSplit = bootSplitActiveRef.current && !reduced;
    const duration = isBootSplit ? 1.32 : 0.54;

    if (isBootSplit && elapsed > duration + 0.14) {
      bootSplitActiveRef.current = false;
    }

    for (let i = 0; i < CUBE_COUNT; i++) {
      const st = states[i];
      const tgt = targets[i];

      if (reduced) {
        st.x = tgt.x;
        st.y = tgt.y;
        st.z = tgt.z;
        st.rx = tgt.rx;
        st.ry = tgt.ry;
        st.rz = tgt.rz;
        st.scale = tgt.scale;
      } else if (isBootSplit) {
        // Cohesive 2-stage intro: Stage 1 fractures the solid cube radially into 120 tumbling
        // mini-cubes; Stage 2 smoothly curves those exact mini-cubes into the main page sculptures!
        const u = MathUtils.clamp((elapsed - st.delay) / duration, 0, 1);
        if (u < 1) {
          const splitP = MathUtils.clamp(u / 0.42, 0, 1);
          const burstAmt = 1 - Math.pow(1 - splitP, 3);
          const arriveP = MathUtils.clamp((u - 0.34) / 0.66, 0, 1);
          const arriveAmt = arriveP > 0 ? easeOutBack(arriveP, 1.06) : 0;
          const arc = Math.sin(arriveP * Math.PI);

          const bx = MathUtils.lerp(st.startX, st.burstX, burstAmt);
          const by = MathUtils.lerp(st.startY, st.burstY, burstAmt);
          const bz = MathUtils.lerp(st.startZ, st.burstZ, burstAmt);

          st.x = MathUtils.lerp(bx, tgt.x, arriveAmt);
          st.y = MathUtils.lerp(by, tgt.y, arriveAmt) + arc * 0.42;
          st.z = MathUtils.lerp(bz, tgt.z, arriveAmt) + arc * 0.62;

          const burstScale = MathUtils.lerp(st.startScale, 0.23, burstAmt);
          st.scale =
            MathUtils.lerp(burstScale, tgt.scale, Math.min(1, arriveP * 1.28)) *
            (1 + arc * 0.12);

          const burstRx = st.startRx + st.spinX * burstAmt * 1.65;
          const burstRy = st.startRy + st.spinY * burstAmt * 1.65;
          const burstRz = st.startRz + st.spinZ * burstAmt * 1.3;
          const flip = arriveAmt * Math.PI;
          st.rx =
            MathUtils.lerp(burstRx, tgt.rx, arriveAmt) +
            (st.flipAxis === 0 ? flip : 0);
          st.ry =
            MathUtils.lerp(burstRy, tgt.ry, arriveAmt) +
            (st.flipAxis === 1 ? flip : 0);
          st.rz =
            MathUtils.lerp(burstRz, tgt.rz, arriveAmt) +
            (st.flipAxis === 2 ? flip : 0);
        } else {
          const dampRate = 13;
          st.scale = MathUtils.damp(st.scale, tgt.scale, dampRate, delta);
          if (tgt.scale <= 0.001 && st.scale <= 0.012) {
            st.x = tgt.x;
            st.y = tgt.y;
            st.z = tgt.z;
            st.rx = tgt.rx;
            st.ry = tgt.ry;
            st.rz = tgt.rz;
            st.scale = 0.0001;
          } else {
            st.x = MathUtils.damp(st.x, tgt.x, dampRate, delta);
            st.y = MathUtils.damp(st.y, tgt.y, dampRate, delta);
            st.z = MathUtils.damp(st.z, tgt.z, dampRate, delta);
            st.rx = MathUtils.damp(st.rx, tgt.rx, dampRate, delta);
            st.ry = MathUtils.damp(st.ry, tgt.ry, dampRate, delta);
            st.rz = MathUtils.damp(st.rz, tgt.rz, dampRate, delta);
          }
        }
      } else if (elapsed < st.delay) {
        // Anticipation beat: hold cleanly at start pose with subtle 6% pre-launch squeeze
        const antic = MathUtils.clamp(elapsed / Math.max(st.delay, 0.01), 0, 1);
        st.x = st.startX;
        st.y = st.startY;
        st.z = st.startZ;
        st.scale = st.startScale * (1 - Math.sin(antic * Math.PI) * 0.07);
      } else {
        const rawP = MathUtils.clamp((elapsed - st.delay) / duration, 0, 1);
        if (rawP < 1) {
          // Parametric GameCube wave: crisp easeOutBack lock-in + monotonic 180° flip + parabolic arc
          const eased = easeOutBack(rawP, 1.08);
          const arc = Math.sin(rawP * Math.PI);

          st.x = MathUtils.lerp(st.startX, tgt.x, eased);
          st.y = MathUtils.lerp(st.startY, tgt.y, eased) + arc * 0.36;
          st.z = MathUtils.lerp(st.startZ, tgt.z, eased) + arc * 0.56;
          st.scale = MathUtils.lerp(st.startScale, tgt.scale, Math.min(1, rawP * 1.35)) * (1 + arc * 0.14);

          // Monotonic 180-degree forward flip into target orientation (never flips backward!)
          const flip = eased * Math.PI;
          st.rx = MathUtils.lerp(st.startRx, tgt.rx, eased) + (st.flipAxis === 0 ? flip : 0);
          st.ry = MathUtils.lerp(st.startRy, tgt.ry, eased) + (st.flipAxis === 1 ? flip : 0);
          st.rz = MathUtils.lerp(st.startRz, tgt.rz, eased) + (st.flipAxis === 2 ? flip : 0);
        } else {
          // Settled: smoothly track continuous per-object live animation
          const dampRate = 13;
          st.x = MathUtils.damp(st.x, tgt.x, dampRate, delta);
          st.y = MathUtils.damp(st.y, tgt.y, dampRate, delta);
          st.z = MathUtils.damp(st.z, tgt.z, dampRate, delta);
          st.rx = MathUtils.damp(st.rx, tgt.rx, dampRate, delta);
          st.ry = MathUtils.damp(st.ry, tgt.ry, dampRate, delta);
          st.rz = MathUtils.damp(st.rz, tgt.rz, dampRate, delta);
          st.scale = MathUtils.damp(st.scale, tgt.scale, dampRate, delta);
        }
      }

      dummy.position.set(st.x, st.y, st.z);
      dummy.rotation.set(st.rx, st.ry, st.rz);
      dummy.scale.setScalar(st.scale <= 0.003 ? 0.00001 : st.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      targetColor.set(tgt.color);
      const colorRate = isBootSplit ? 4.2 : 8;
      st.color.lerp(targetColor, reduced ? 1 : 1 - Math.exp(-delta * colorRate));
      mesh.setColorAt(i, st.color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Project 100% of Overview cluster anchors directly to zoom-invariant viewport percentages!
    // Because NDC [-1, 1] -> [0%, 100%] does not depend on R3F's async resize size.width/height,
    // floating pills stay locked to their 3D sculptures with ZERO multi-frame jump on browser zoom.
    if (!selected && rigRef.current) {
      rigRef.current.updateMatrixWorld();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const el = labelRefs.current[item.uid];
        if (!el) continue;

        const [ax, ay, az] = getOverviewAnchor(section, i, items.length);
        projVec.set(ax, ay - 0.62, az);
        projVec.applyMatrix4(rigRef.current.matrixWorld);
        projVec.project(camera);

        const pctX = (projVec.x * 0.5 + 0.5) * 100;
        const pctY = (-projVec.y * 0.5 + 0.5) * 100;
        const prevX = Number(el.dataset.px ?? -999);
        const prevY = Number(el.dataset.py ?? -999);
        if (Math.abs(pctX - prevX) > 0.015 || Math.abs(pctY - prevY) > 0.015) {
          el.dataset.px = pctX.toFixed(3);
          el.dataset.py = pctY.toFixed(3);
          el.style.left = `${pctX.toFixed(3)}%`;
          el.style.top = `${pctY.toFixed(3)}%`;
        }
        if (el.style.visibility !== "visible") {
          el.style.visibility = "visible";
        }
      }
    }
  });

  return (
    <group ref={rigRef}>
      {!bootHolding && (
        <StageArchitecture
          section={section}
          hasSelection={Boolean(selected)}
          heroCenterX={heroCenterX}
          reduced={reduced}
        />
      )}

      {/* Subtle violet levitation glow, soft shadow & click hitbox for the segmented 5×5×5 floating intro cube */}
      {bootHolding && !reduced && (
        <>
          <pointLight
            position={[0, BOOT_CUBE_CENTER_Y, 1.8]}
            color="#a986f7"
            intensity={2.4}
            distance={6.5}
            decay={2}
          />
          <ContactShadows
            position={[0, -1.7, 0]}
            opacity={0.18}
            scale={7.2}
            blur={2.8}
            far={4.6}
            resolution={256}
            frames={1}
            color="#5837a6"
          />
          <mesh
            position={[0, BOOT_CUBE_CENTER_Y, 0]}
            visible={false}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onBootHover?.(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              onBootHover?.(false);
              document.body.style.cursor = "";
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              document.body.style.cursor = "";
              onBootEnter?.();
            }}
          >
            <boxGeometry args={[2.6, 2.6, 2.6]} />
            <meshBasicMaterial />
          </mesh>
        </>
      )}

      {/* Internal jewel glow light & soft museum floor shadow ONLY when inspecting a hero monument */}
      {!bootHolding && selected && (
        <>
          <pointLight
            position={[heroCenterX, -0.05, 0.85]}
            color={selected.palette.glow}
            intensity={3.0}
            distance={5.5}
            decay={2}
          />
          <ContactShadows
            position={[heroCenterX, -2.2, 0.1]}
            opacity={0.28}
            scale={6.4}
            blur={2.6}
            far={5.2}
            resolution={256}
            frames={1}
            color="#472b8f"
          />
        </>
      )}

      {/* Single GPU-instanced swarm of 120 precision-milled optical crystal cubes */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, CUBE_COUNT]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.09}
          metalness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.52}
          reflectivity={1}
          iridescence={0.48}
          iridescenceIOR={1.36}
          envMapIntensity={1.45}
        />
      </instancedMesh>

      {/* Direct 3D raycast hit spheres so clicking or hovering the cubes themselves works seamlessly */}
      {!bootHolding &&
        !selected &&
        items.map((item, idx) => {
          const [ax, ay, az] = getOverviewAnchor(section, idx, items.length);
          return (
            <mesh
              key={item.uid}
              position={[ax, ay, az]}
              visible={false}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                onHover(item.slug);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                onHover(null);
                document.body.style.cursor = "";
              }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelect(item.slug);
              }}
            >
              <sphereGeometry args={[0.72, 12, 12]} />
              <meshBasicMaterial />
            </mesh>
          );
        })}
    </group>
  );
}

class StageErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="spatial-fallback">
          <p>Browse every item using the dock below.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function computeCanvasDpr(): number {
  if (typeof window === "undefined") return 1.5;
  return computeCanvasPixelRatio(
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio || 1,
  );
}

export default function SpatialStage({
  items,
  section,
  selected,
  hoveredSlug,
  transitionKey,
  bootHolding = false,
  bootHovering = false,
  suspended = false,
  labelRefs,
  onSelect,
  onHover,
  onBootEnter,
  onBootHover,
}: SpatialStageProps) {
  const prefersReduced = usePrefersReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);
  const [canvasDpr, setCanvasDpr] = useState<number>(() => computeCanvasDpr());

  useEffect(() => {
    const syncDpr = () => {
      const next = computeCanvasDpr();
      setCanvasDpr((prev) => (Math.abs(prev - next) > 0.000001 ? next : prev));
    };
    const unsub = subscribeScaleUnit(syncDpr);
    window.addEventListener("resize", syncDpr);
    return () => {
      unsub();
      window.removeEventListener("resize", syncDpr);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <StageErrorBoundary>
      <Canvas
        dpr={canvasDpr}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        camera={{ position: [0, 0.2, 13.6], fov: 40 }}
        gl={(defaults) => {
          const renderer = new WebGLRenderer({
            ...defaults,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          });
          installBoundedCanvasSizing(renderer);
          renderer.toneMapping = ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.04;
          return renderer;
        }}
        frameloop={pageVisible && !suspended ? "always" : "never"}
      >
        {/* High-craft 3-value studio lighting with violet hemisphere bounce (NO flat washed-out ambient!) */}
        <ambientLight intensity={0.34} color="#f5efff" />
        <hemisphereLight args={["#ffffff", "#5a3fa3", 0.58]} />
        <directionalLight
          position={[6, 9, 8]}
          intensity={2.15}
          color="#ffffff"
        />
        <directionalLight
          position={[-7, 3, -4]}
          intensity={1.35}
          color="#c0a3ff"
        />
        <directionalLight
          position={[2, -6, 3]}
          intensity={0.48}
          color="#f4c7e4"
        />

        {/* High-contrast studio HDRI with bright softbox strips AND dark deep-violet negative-fill cards */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={3.2}
            color="#ffffff"
            scale={[11, 5, 1]}
            position={[0, 7, 5]}
            rotation={[Math.PI / 3, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#d6bfff"
            scale={[6, 10, 1]}
            position={[-8, 2, 3]}
            rotation={[0, Math.PI / 2.6, 0]}
          />
          <Lightformer
            form="circle"
            intensity={1.6}
            color="#f7d2eb"
            scale={5}
            position={[6, 3, 6]}
            rotation={[0, -Math.PI / 3, 0]}
          />
          {/* Negative-fill reflection cards so clearcoat bevels gleam with real crystal contrast */}
          <Lightformer
            form="rect"
            intensity={0.35}
            color="#1e1240"
            scale={[14, 10, 1]}
            position={[8, -1, -2]}
            rotation={[0, -Math.PI / 2.2, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.35}
            color="#261852"
            scale={[14, 8, 1]}
            position={[-4, -7, -3]}
            rotation={[-Math.PI / 2.4, 0, 0]}
          />
        </Environment>

        <LivingCubeSwarm
          items={items}
          section={section}
          selected={selected}
          hoveredSlug={hoveredSlug}
          transitionKey={transitionKey}
          bootHolding={bootHolding}
          bootHovering={bootHovering}
          reduced={prefersReduced}
          labelRefs={labelRefs}
          onSelect={onSelect}
          onHover={onHover}
          onBootEnter={onBootEnter}
          onBootHover={onBootHover}
        />
      </Canvas>
    </StageErrorBoundary>
  );
}
