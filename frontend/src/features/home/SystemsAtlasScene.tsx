import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneSection } from "../../types/content";

type SystemsAtlasSceneProps = {
  sections: SceneSection[];
  activeSectionId: string;
  reducedMotion: boolean;
};

const nodeVariants = [
  {
    scale: 1.22,
    ringScale: 1.18,
    ringWidth: 0.2,
    ringRotation: [Math.PI / 2.55, 0.18, -0.42] as [number, number, number],
    extraRings: []
  },
  {
    scale: 0.88,
    ringScale: 1.02,
    ringWidth: 0.16,
    ringRotation: [Math.PI / 2.1, 0.5, 0.28] as [number, number, number],
    extraRings: [
      {
        scale: 1.26,
        width: 0.08,
        rotation: [Math.PI / 2.24, -0.24, 0.52] as [number, number, number],
        opacity: 0.18
      }
    ]
  },
  {
    scale: 1.45,
    ringScale: 1.34,
    ringWidth: 0.24,
    ringRotation: [Math.PI / 2.78, -0.34, 0.16] as [number, number, number],
    extraRings: [
      {
        scale: 1.64,
        width: 0.1,
        rotation: [Math.PI / 2.36, 0.2, -0.58] as [number, number, number],
        opacity: 0.22
      }
    ]
  },
  {
    scale: 0.74,
    ringScale: 0.9,
    ringWidth: 0.12,
    ringRotation: [Math.PI / 2.02, 0.12, 0.68] as [number, number, number],
    extraRings: []
  },
  {
    scale: 1.08,
    ringScale: 1.08,
    ringWidth: 0.17,
    ringRotation: [Math.PI / 2.42, -0.46, -0.2] as [number, number, number],
    extraRings: [
      {
        scale: 1.3,
        width: 0.07,
        rotation: [Math.PI / 2.26, 0.38, 0.34] as [number, number, number],
        opacity: 0.16
      },
      {
        scale: 1.46,
        width: 0.05,
        rotation: [Math.PI / 2.12, -0.14, -0.72] as [number, number, number],
        opacity: 0.12
      }
    ]
  },
  {
    scale: 0.96,
    ringScale: 1.12,
    ringWidth: 0.18,
    ringRotation: [Math.PI / 2.64, 0.28, -0.12] as [number, number, number],
    extraRings: []
  }
];

function StaticStarfield({
  count,
  spread,
  height,
  size,
  opacity,
  color
}: {
  count: number;
  spread: number;
  height: [number, number];
  size: number;
  opacity: number;
  color: string;
}) {
  const sprite = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.68, "rgba(255,255,255,0.24)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  const positions = useMemo(() => {
    const values: number[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(
        THREE.MathUtils.randFloatSpread(spread),
        THREE.MathUtils.randFloat(height[0], height[1]),
        THREE.MathUtils.randFloatSpread(spread)
      );
    }

    return new Float32Array(values);
  }, [count, height, spread]);

  if (!sprite) {
    return null;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
        />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        alphaMap={sprite}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        alphaTest={0.08}
        depthWrite={false}
      />
    </points>
  );
}

function CircularParticles({
  count,
  bounds,
  color,
  size,
  opacity,
  speed = 0
}: {
  count: number;
  bounds: [number, number, number];
  color: string;
  size: number;
  opacity: number;
  speed?: number;
}) {
  const sprite = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.28)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values: number[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(
        THREE.MathUtils.randFloatSpread(bounds[0]),
        THREE.MathUtils.randFloatSpread(bounds[1]) + bounds[1] * 0.12,
        THREE.MathUtils.randFloatSpread(bounds[2])
      );
    }

    return new Float32Array(values);
  }, [bounds, count]);

  useFrame((state) => {
    if (!pointsRef.current || speed === 0) {
      return;
    }

    pointsRef.current.rotation.y = state.clock.elapsedTime * speed;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.08;
  });

  if (!sprite) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        alphaMap={sprite}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        alphaTest={0.08}
        depthWrite={false}
      />
    </points>
  );
}

function OrbitingDust({ sections }: { sections: SceneSection[] }) {
  const dustRefs = useRef<Array<THREE.Mesh | null>>([]);
  const dustSpecs = useMemo(
    () =>
      sections.flatMap((section, sectionIndex) => {
        const sectionVector = new THREE.Vector3(...section.position);
        const count = 12 + (sectionIndex % 3) * 4;
        const orbitDirection = sectionIndex % 2 === 0 ? 1 : -1;

        return Array.from({ length: count }, (_, particleIndex) => {
          const radius = 1.8 + (particleIndex % 5) * 0.22 + sectionIndex * 0.04;
          const speedJitter = THREE.MathUtils.randFloat(-0.02, 0.02);
          const speed = (0.12 + (particleIndex % 4) * 0.018 + speedJitter) * orbitDirection;
          const angleOffset = (particleIndex / count) * Math.PI * 2;
          const tilt = (sectionIndex - 2) * 0.12 + (particleIndex % 3) * 0.06;
          const verticalWave = 0.08 + (particleIndex % 4) * 0.03;
          const size = 0.022 + (particleIndex % 3) * 0.008;
          const planeTiltX = THREE.MathUtils.degToRad((sectionIndex - 2) * 4 + ((particleIndex % 4) - 1.5) * 2);
          const planeTiltZ = THREE.MathUtils.degToRad(((particleIndex % 5) - 2) * 2.5);
          const color = new THREE.Color(section.accent).offsetHSL(0.02, -0.08, 0.28);

          return {
            center: sectionVector,
            radius,
            speed,
            angleOffset,
            tilt,
            verticalWave,
            size,
            planeTiltX,
            planeTiltZ,
            color: `#${color.getHexString()}`
          };
        });
      }),
    [sections]
  );

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    dustRefs.current.forEach((particle, index) => {
      const spec = dustSpecs[index];
      if (!particle || !spec) {
        return;
      }

      const angle = elapsed * spec.speed + spec.angleOffset;
      const localPosition = new THREE.Vector3(
        Math.cos(angle) * spec.radius,
        Math.sin(angle * 1.7) * spec.verticalWave,
        Math.sin(angle + spec.tilt) * spec.radius
      );

      localPosition.applyEuler(new THREE.Euler(spec.planeTiltX, 0, spec.planeTiltZ));

      particle.position.set(
        spec.center.x + localPosition.x,
        spec.center.y + localPosition.y,
        spec.center.z + localPosition.z
      );
    });
  });

  return (
    <group>
      {dustSpecs.map((spec, index) => (
        <mesh
          key={index}
          ref={(node) => {
            dustRefs.current[index] = node;
          }}
        >
          <sphereGeometry args={[spec.size, 10, 10]} />
          <meshBasicMaterial
            color={spec.color}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function AtlasRig({ activeSection, reducedMotion }: { activeSection: SceneSection; reducedMotion: boolean }) {
  const targetPosition = useMemo(
    () => new THREE.Vector3(...activeSection.camera),
    [activeSection.camera]
  );
  const lookAtTarget = useMemo(
    () => new THREE.Vector3(...activeSection.target),
    [activeSection.target]
  );
  const workingTarget = useRef(new THREE.Vector3(...activeSection.target));

  useFrame((state, delta) => {
    const lerpFactor = 1 - Math.exp(-delta * 1.8);
    state.camera.position.lerp(targetPosition, lerpFactor);
    workingTarget.current.lerp(lookAtTarget, lerpFactor);
    state.camera.lookAt(workingTarget.current);

    if (!reducedMotion) {
      state.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
      state.scene.rotation.x = Math.cos(state.clock.elapsedTime * 0.05) * 0.015;
    }
  });

  return null;
}

function AtlasNode({
  section,
  active,
  variant
}: {
  section: SceneSection;
  active: boolean;
  variant: (typeof nodeVariants)[number];
}) {
  const baseRadius = 0.56 * variant.scale;
  const ringRadius = 0.95 * variant.ringScale;
  const nodeScale = active ? 1.38 : 1;
  const ringColor = useMemo(() => {
    const color = new THREE.Color(section.accent);
    color.offsetHSL(0.035, -0.12, 0.2);
    return `#${color.getHexString()}`;
  }, [section.accent]);
  const primaryRingRef = useRef<THREE.Mesh>(null);
  const extraRingRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (primaryRingRef.current) {
      primaryRingRef.current.rotation.x =
        variant.ringRotation[0] + Math.sin(elapsed * 0.18 + section.position[0]) * 0.1;
      primaryRingRef.current.rotation.y =
        variant.ringRotation[1] + Math.cos(elapsed * 0.14 + section.position[1]) * 0.12;
      primaryRingRef.current.rotation.z =
        variant.ringRotation[2] + Math.sin(elapsed * 0.12 + section.position[2]) * 0.08;
    }

    extraRingRefs.current.forEach((ring, index) => {
      const variantRing = variant.extraRings[index];
      if (!ring || !variantRing) {
        return;
      }

      ring.rotation.x =
        variantRing.rotation[0] + Math.sin(elapsed * (0.12 + index * 0.02) + section.position[2]) * 0.08;
      ring.rotation.y =
        variantRing.rotation[1] + Math.cos(elapsed * (0.1 + index * 0.03) + section.position[0]) * 0.1;
      ring.rotation.z =
        variantRing.rotation[2] + Math.sin(elapsed * (0.09 + index * 0.015) + section.position[1]) * 0.06;
    });
  });

  return (
    <group position={section.position} scale={nodeScale}>
      <mesh>
        <icosahedronGeometry args={[baseRadius, 4]} />
        <meshStandardMaterial
          color={active ? section.accent : "#90a4c7"}
          emissive={active ? section.accent : "#22334f"}
          emissiveIntensity={active ? 0.9 : 0.3}
          roughness={0.22}
          metalness={0.5}
        />
      </mesh>
      <mesh ref={primaryRingRef} rotation={variant.ringRotation}>
        <ringGeometry args={[ringRadius - variant.ringWidth / 2, ringRadius + variant.ringWidth / 2, 128]} />
        <meshBasicMaterial
          color={ringColor}
          side={THREE.DoubleSide}
          transparent
          opacity={active ? 0.92 : 0.42}
        />
      </mesh>
      {variant.extraRings.map((ring, index) => (
        <mesh
          key={index}
          ref={(node) => {
            extraRingRefs.current[index] = node;
          }}
          rotation={ring.rotation}
        >
          <ringGeometry
            args={[
              ringRadius * ring.scale - ring.width / 2,
              ringRadius * ring.scale + ring.width / 2,
              128
            ]}
          />
          <meshBasicMaterial
            color={ringColor}
            side={THREE.DoubleSide}
            transparent
            opacity={active ? Math.min(ring.opacity + 0.18, 0.42) : ring.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function SystemsAtlasScene({ sections, activeSectionId, reducedMotion }: SystemsAtlasSceneProps) {
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const linePoints = useMemo(
    () => sections.map((section) => new THREE.Vector3(...section.position)),
    [sections]
  );

  return (
    <>
      <color attach="background" args={["#040712"]} />
      <fog attach="fog" args={["#040712", 11, 26]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} color="#9dc4ff" />
      <pointLight position={[-6, 4, 8]} intensity={1.8} color="#57d0ff" />
      <pointLight position={[8, -1, 5]} intensity={1.2} color="#f7a95b" />
      <gridHelper args={[36, 36, "#14324a", "#09111f"]} position={[0, -4, 0]} />
      <StaticStarfield count={620} spread={34} height={[-6, 10]} size={0.08} opacity={0.94} color="#b7d6ff" />
      <StaticStarfield count={1840} spread={54} height={[-12, 18]} size={0.04} opacity={0.32} color="#88a8d6" />
      <CircularParticles count={220} bounds={[24, 14, 24]} size={0.2} opacity={0.72} color="#7bcfff" />
      <CircularParticles count={120} bounds={[20, 12, 20]} size={0.26} opacity={0.8} color="#c3dcff" speed={0.035} />
      <OrbitingDust sections={sections} />
      <Line points={linePoints} color="#4c7ab7" lineWidth={1.8} transparent opacity={0.45} />
      {sections.map((section, index) => (
        <AtlasNode
          key={section.id}
          section={section}
          active={section.id === activeSection.id}
          variant={nodeVariants[index % nodeVariants.length]}
        />
      ))}
      <AtlasRig activeSection={activeSection} reducedMotion={reducedMotion} />
    </>
  );
}

export default SystemsAtlasScene;
