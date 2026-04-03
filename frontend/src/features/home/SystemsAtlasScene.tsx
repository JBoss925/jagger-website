import { Line, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneSection } from "../../types/content";

type SystemsAtlasSceneProps = {
  sections: SceneSection[];
  activeSectionId: string;
  reducedMotion: boolean;
};

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

function AtlasNode({ section, active }: { section: SceneSection; active: boolean }) {
  return (
    <group position={section.position}>
      <mesh>
        <icosahedronGeometry args={[active ? 0.78 : 0.56, 1]} />
        <meshStandardMaterial
          color={active ? section.accent : "#90a4c7"}
          emissive={active ? section.accent : "#22334f"}
          emissiveIntensity={active ? 0.9 : 0.3}
          roughness={0.22}
          metalness={0.5}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[active ? 1.2 : 0.95, 0.03, 16, 96]} />
        <meshBasicMaterial color={section.accent} transparent opacity={active ? 0.9 : 0.35} />
      </mesh>
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
      <Sparkles count={40} speed={0.3} scale={[18, 10, 18]} size={2.2} color="#7bcfff" />
      <Line points={linePoints} color="#4c7ab7" lineWidth={1.8} transparent opacity={0.45} />
      {sections.map((section) => (
        <AtlasNode key={section.id} section={section} active={section.id === activeSection.id} />
      ))}
      <AtlasRig activeSection={activeSection} reducedMotion={reducedMotion} />
    </>
  );
}

export default SystemsAtlasScene;
