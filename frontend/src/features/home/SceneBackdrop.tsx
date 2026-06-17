import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import SystemsAtlasScene from "./SystemsAtlasScene";
import type { SceneSection } from "../../types/content";

type SceneBackdropProps = {
  sections: SceneSection[];
  activeSectionId: string;
  useStaticScene: boolean;
};

function SceneBackdrop({ sections, activeSectionId, useStaticScene }: SceneBackdropProps) {
  if (useStaticScene) {
    return (
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
        <div className="scene-static__glow scene-static__glow--left" />
        <div className="scene-static__glow scene-static__glow--right" />
      </div>
    );
  }

  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [-1, 1.8, 14], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor("#000000", 1);
          gl.autoClear = true;
          gl.autoClearColor = true;
          scene.background = new THREE.Color("#000000");
        }}
        style={{ background: "#000000" }}
      >
        <SystemsAtlasScene
          sections={sections}
          activeSectionId={activeSectionId}
          reducedMotion={false}
        />
      </Canvas>
    </div>
  );
}

export default SceneBackdrop;
