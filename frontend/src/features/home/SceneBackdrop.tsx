import { Canvas } from "@react-three/fiber";
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
      <Canvas camera={{ position: [-1, 1.8, 14], fov: 42 }} dpr={[1, 1.5]}>
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
