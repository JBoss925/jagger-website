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
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
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
  suspended?: boolean;
  labelRefs: React.MutableRefObject<ProjectedLabelMap>;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
};

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
  reduced,
  labelRefs,
  onSelect,
  onHover,
}: Omit<SpatialStageProps, "suspended"> & { reduced: boolean }) {
  const { camera, size } = useThree();
  const meshRef = useRef<InstancedMesh>(null);
  const rigRef = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const targetColor = useMemo(() => new Color(), []);
  const projVec = useMemo(() => new Vector3(), []);

  // Crisp precision-milled beveled cube geometry (12.5% bevel radius for Apple/GameCube specular catchlights)
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 5, 0.125), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const timelineRef = useRef(0);
  const transitionStartWallRef = useRef(performance.now());
  const lastTransitionKeyRef = useRef("");
  const cameraTargetPos = useMemo(() => new Vector3(0, 0.2, 13.6), []);

  // Initialize cubes elevated above the stage for a snappy GameCube drop-in intro
  const cubesRef = useRef<CubeState[] | null>(null);
  if (!cubesRef.current) {
    cubesRef.current = Array.from({ length: CUBE_COUNT }, (_, i) => {
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
        delay: (i / CUBE_COUNT) * 0.16,
        flipAxis: i % 3,
      };
    });
  }

  // Snapshot full pose + compute spatial left-to-right stagger wave on every state transition!
  useEffect(() => {
    if (lastTransitionKeyRef.current === transitionKey) return;
    lastTransitionKeyRef.current = transitionKey;
    transitionStartWallRef.current = performance.now();

    const states = cubesRef.current;
    if (states) {
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
    }
  }, [transitionKey]);

  const heroCenterX =
    size.width > 1280 ? -2.05 : size.width > 1024 ? -1.72 : -1.3;
  const sectionConfig = getSectionConfig(section);

  useFrame(({ pointer }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    if (!reduced) {
      timelineRef.current += delta;
    }
    const t = timelineRef.current;
    // Use real wall-clock elapsed time so wave choreography & labels stay crisp at any framerate
    const elapsed = Math.max(0, (performance.now() - transitionStartWallRef.current) / 1000);

    // Smooth, aspect-aware camera choreography so overview stays centered & unclipped at every desktop width
    const [cx, cy, cz] = sectionConfig.cameraPosition;
    const aspect = size.width / Math.max(1, size.height);
    const isCompactDesktop = size.width < 1180;
    const minOverviewZ =
      5.65 / (Math.tan((40 * Math.PI) / 360) * Math.max(0.75, aspect));
    const targetZ = selected ? 11.4 : Math.max(cz, Math.min(20.5, minOverviewZ));
    cameraTargetPos.set(
      (selected ? cx : 0) + (reduced ? 0 : pointer.x * 0.36),
      cy + (selected ? 0 : isCompactDesktop ? 0.42 : 0) + (reduced ? 0 : pointer.y * 0.2),
      targetZ,
    );
    camera.position.lerp(cameraTargetPos, reduced ? 1 : 1 - Math.exp(-delta * 4.2));
    camera.lookAt(
      selected ? heroCenterX * 0.1 : 0,
      selected ? 0.02 : isCompactDesktop ? 0.36 : -0.12,
      0,
    );

    // Subtle whole-stage tilt following pointer
    if (rigRef.current) {
      rigRef.current.rotation.y = MathUtils.damp(
        rigRef.current.rotation.y,
        reduced ? 0 : pointer.x * (selected ? 0.16 : 0.055),
        4.2,
        delta,
      );
      rigRef.current.rotation.x = MathUtils.damp(
        rigRef.current.rotation.x,
        reduced ? 0 : -pointer.y * (selected ? 0.09 : 0.03),
        4.2,
        delta,
      );
    }

    const mesh = meshRef.current;
    const states = cubesRef.current;
    if (!mesh || !states) return;

    // While the 1-click GameCube boot overlay is active, orbit all 120 crystal cubes in a serene
    // elevated lavender halo so clicking "Enter" unleashes the synchronized drop-in wave!
    if (bootHolding && !reduced) {
      for (let i = 0; i < CUBE_COUNT; i++) {
        const st = states[i];
        const ring = i % 3;
        const a = (i / CUBE_COUNT) * Math.PI * 2 + t * (0.24 - ring * 0.05);
        const rad = 2.6 + ring * 0.72 + Math.sin(t * 1.1 + i * 0.35) * 0.14;
        const tx = Math.cos(a) * rad;
        const ty = 0.25 + Math.sin(t * 0.9 + i * 0.45) * 0.55 + (ring - 1) * 0.48;
        const tz = Math.sin(a) * 1.4 - 0.8;
        st.x = MathUtils.damp(st.x, tx, 5, delta);
        st.y = MathUtils.damp(st.y, ty, 5, delta);
        st.z = MathUtils.damp(st.z, tz, 5, delta);
        st.rx = t * 0.45 + i * 0.18;
        st.ry = t * 0.38 + i * 0.14;
        st.rz = 0;
        st.scale = MathUtils.damp(st.scale, 0.21, 5, delta);

        dummy.position.set(st.x, st.y, st.z);
        dummy.rotation.set(st.rx, st.ry, st.rz);
        dummy.scale.setScalar(st.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        targetColor.set(ring === 0 ? "#805ad4" : ring === 1 ? "#a888eb" : "#5d39ad");
        st.color.lerp(targetColor, 1 - Math.exp(-delta * 6));
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

    const duration = 0.54;

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
      dummy.scale.setScalar(Math.max(0.001, st.scale));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      targetColor.set(tgt.color);
      st.color.lerp(targetColor, reduced ? 1 : 1 - Math.exp(-delta * 8));
      mesh.setColorAt(i, st.color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Project 100% of Overview cluster anchors directly to crisp 2D screen-space HUD pills!
    // Zero label dropouts, zero z-index bugs, zero low-opacity ghosting.
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

        const px = (projVec.x * 0.5 + 0.5) * size.width;
        const py = (-projVec.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.visibility = "visible";
      }
    }
  });

  return (
    <group ref={rigRef}>
      <StageArchitecture
        section={section}
        hasSelection={Boolean(selected)}
        heroCenterX={heroCenterX}
        reduced={reduced}
      />

      {/* Internal jewel glow light & soft museum floor shadow ONLY when inspecting a hero monument */}
      {selected && (
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
      {!selected &&
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

export default function SpatialStage({
  items,
  section,
  selected,
  hoveredSlug,
  transitionKey,
  bootHolding = false,
  suspended = false,
  labelRefs,
  onSelect,
  onHover,
}: SpatialStageProps) {
  const prefersReduced = usePrefersReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);

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
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 13.6], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.04,
          powerPreference: "high-performance",
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
          reduced={prefersReduced}
          labelRefs={labelRefs}
          onSelect={onSelect}
          onHover={onHover}
        />
      </Canvas>
    </StageErrorBoundary>
  );
}
