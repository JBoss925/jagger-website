export type Vector2 = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type TransformProps = {
  position: Vector2;
  anchor: Vector2;
  rotation: number;
  scale: Vector2;
  size: Dimensions;
};

type RuntimeComponent = {
  label: string;
  update: (deltaMs: number, node: RuntimeNode, scene: RuntimeScene) => void;
};

type RuntimeNodeBase = {
  id: string;
  label: string;
  properties: TransformProps;
  components: RuntimeComponent[];
};

type BoxNode = RuntimeNodeBase & {
  kind: "box";
  color: string;
};

type FolderNode = RuntimeNodeBase & {
  kind: "folder";
  children: RuntimeNode[];
};

type RuntimeNode = BoxNode | FolderNode;

type RuntimeDemoDefinition = {
  id: string;
  title: string;
  description: string;
  summary: string;
  createScene: () => RuntimeScene;
  tick?: (deltaMs: number, scene: RuntimeScene) => void;
};

export type RuntimeScene = {
  root: FolderNode;
  elapsedMs: number;
  framesSinceStartup: number;
  metadata: {
    secondBoxAdded?: boolean;
  };
};

export type RuntimeTreeNode = {
  id: string;
  label: string;
  kind: RuntimeNode["kind"];
  color?: string;
  componentLabels: string[];
  local: TransformProps;
  world: TransformProps;
  children: RuntimeTreeNode[];
};

const MAGENTA = "rgba(255, 0, 255, 1)";
const BLUE = "rgba(0, 0, 255, 1)";

let nodeIdCounter = 0;

function resetRuntimeCounters() {
  nodeIdCounter = 0;
}

function nextNodeId(prefix: string) {
  nodeIdCounter += 1;
  return `${prefix}-${nodeIdCounter}`;
}

function cloneVector(vector: Vector2): Vector2 {
  return { x: vector.x, y: vector.y };
}

function cloneDimensions(dimensions: Dimensions): Dimensions {
  return { width: dimensions.width, height: dimensions.height };
}

function cloneTransform(properties: TransformProps): TransformProps {
  return {
    position: cloneVector(properties.position),
    anchor: cloneVector(properties.anchor),
    rotation: properties.rotation,
    scale: cloneVector(properties.scale),
    size: cloneDimensions(properties.size)
  };
}

function rotatePositionAboutPoint(rotation: number, about: Vector2, position: Vector2): Vector2 {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const run = position.x - about.x;
  const rise = position.y - about.y;

  return {
    x: cos * run + sin * rise + about.x,
    y: cos * rise - sin * run + about.y
  };
}

function add(v1: Vector2, v2: Vector2): Vector2 {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function multiply(v1: Vector2, v2: Vector2): Vector2 {
  return { x: v1.x * v2.x, y: v1.y * v2.y };
}

function createComponent(
  label: string,
  update: RuntimeComponent["update"]
): RuntimeComponent {
  return { label, update };
}

function createBox(
  properties: Partial<TransformProps>,
  components: RuntimeComponent[],
  color = MAGENTA,
  label = "Box"
): BoxNode {
  return {
    id: nextNodeId("box"),
    kind: "box",
    label,
    color,
    components,
    properties: {
      position: { x: 0, y: 0 },
      anchor: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      size: { width: 50, height: 50 },
      ...properties
    }
  };
}

function createFolder(
  children: RuntimeNode[],
  properties: Partial<TransformProps> = {},
  components: RuntimeComponent[] = [],
  label = "Folder"
): FolderNode {
  return {
    id: nextNodeId("folder"),
    kind: "folder",
    label,
    children,
    components,
    properties: {
      position: { x: 0, y: 0 },
      anchor: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      size: { width: 0, height: 0 },
      ...properties
    }
  };
}

function createRoot(children: RuntimeNode[]): FolderNode {
  return createFolder(
    children,
    {
      position: { x: 0, y: 0 },
      anchor: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 }
    },
    [],
    "Root"
  );
}

function rotationComponent(direction: 1 | -1, turnsPerSecond: number): RuntimeComponent {
  const label = `rotate ${direction > 0 ? "+" : "-"}${turnsPerSecond.toFixed(1)}pi/s`;

  return createComponent(label, (deltaMs, node) => {
    node.properties.rotation += direction * turnsPerSecond * (deltaMs / 1000) * Math.PI;
  });
}

function velocityComponent(xPerSecond: number, yPerSecond: number): RuntimeComponent {
  const label = `velocity (${xPerSecond}, ${yPerSecond})`;

  return createComponent(label, (deltaMs, node) => {
    node.properties.position = {
      x: node.properties.position.x + (xPerSecond * deltaMs) / 1000,
      y: node.properties.position.y + (yPerSecond * deltaMs) / 1000
    };
  });
}

function createPurpleCube1Scene(): RuntimeScene {
  const box = createBox(
    {
      position: { x: 50, y: 50 },
      anchor: { x: 0, y: 0 }
    },
    [rotationComponent(1, 0.4)],
    MAGENTA,
    "Cube"
  );
  const folder = createFolder([box], { position: { x: 100, y: 100 } }, [rotationComponent(1, 0.4)], "Inner Pivot");
  const folder2 = createFolder([folder], { position: { x: 100, y: 100 } }, [rotationComponent(1, 0.4)], "Middle Pivot");
  const folder3 = createFolder([folder2], { position: { x: 100, y: 100 } }, [rotationComponent(1, 0.4)], "Outer Pivot");

  return {
    root: createRoot([folder3]),
    elapsedMs: 0,
    framesSinceStartup: 0,
    metadata: {}
  };
}

function createPurpleCube2Scene(): RuntimeScene {
  const box = createBox(
    {
      position: { x: 50, y: 50 },
      anchor: { x: 0, y: 0 }
    },
    [rotationComponent(-1, 1), velocityComponent(10, 10)],
    MAGENTA,
    "Counter-Rotating Cube"
  );
  const folder = createFolder([box], { position: { x: 100, y: 100 } }, [], "Parent Pivot");
  const folder2 = createFolder(
    [folder],
    { position: { x: 100, y: 100 } },
    [rotationComponent(1, 1), velocityComponent(-25, -25)],
    "Moving Pivot"
  );

  return {
    root: createRoot([folder2]),
    elapsedMs: 0,
    framesSinceStartup: 0,
    metadata: {}
  };
}

function createPurpleCube3Scene(): RuntimeScene {
  const box = createBox(
    {
      position: { x: 50, y: 50 },
      anchor: { x: 0, y: 0 }
    },
    [rotationComponent(-1, 3)],
    MAGENTA,
    "Fast Cube"
  );
  const folder = createFolder(
    [box],
    { position: { x: 100, y: 100 } },
    [rotationComponent(1, 1), velocityComponent(-25, -25)],
    "Inner Moving Pivot"
  );
  const folder2 = createFolder(
    [folder],
    { position: { x: 100, y: 100 } },
    [rotationComponent(1, 1), velocityComponent(-25, -25)],
    "Outer Moving Pivot"
  );

  return {
    root: createRoot([folder2]),
    elapsedMs: 0,
    framesSinceStartup: 0,
    metadata: {}
  };
}

function createMultiCubeInLineScene(amount = 20): RuntimeScene {
  const boxes = Array.from({ length: amount }, (_, index) =>
    createBox(
      {
        position: { x: index * 25, y: index * 25 },
        anchor: { x: 0, y: 0 }
      },
      [rotationComponent(1, 0.3)],
      MAGENTA,
      `Cube ${index + 1}`
    )
  );

  return {
    root: createRoot(boxes),
    elapsedMs: 0,
    framesSinceStartup: 0,
    metadata: {}
  };
}

function createMultiCubeInPlaceScene(amount = 20): RuntimeScene {
  const boxes = Array.from({ length: amount }, (_, index) =>
    createBox(
      {
        position: { x: index * 25, y: index * 25 },
        anchor: { x: index * 25, y: index * 25 }
      },
      [rotationComponent(1, 1)],
      MAGENTA,
      `Local Pivot Cube ${index + 1}`
    )
  );

  return {
    root: createRoot(boxes),
    elapsedMs: 0,
    framesSinceStartup: 0,
    metadata: {}
  };
}

function createTimeDifScene(): RuntimeScene {
  return {
    root: createRoot([
      createBox(
        {
          position: { x: 100, y: 100 },
          anchor: { x: 0, y: 0 }
        },
        [rotationComponent(1, 1)],
        MAGENTA,
        "Primary Box"
      )
    ]),
    elapsedMs: 0,
    framesSinceStartup: 0,
    metadata: { secondBoxAdded: false }
  };
}

function addSecondBox(scene: RuntimeScene) {
  scene.root.children.push(
    createBox(
      {
        position: { x: -100, y: -100 },
        anchor: { x: 0, y: 0 }
      },
      [rotationComponent(1, 1)],
      BLUE,
      "Late Box"
    )
  );
}

export const rengineDemos: RuntimeDemoDefinition[] = [
  {
    id: "demoPurpleCube1",
    title: "Purple Cube 1",
    description: "Nested rotating parents spin a single cube through a stacked transform chain.",
    summary: "Shows how position and rotation compound when one entity inherits motion from several parents.",
    createScene: createPurpleCube1Scene
  },
  {
    id: "demoPurpleCube2",
    title: "Purple Cube 2",
    description: "A child counter-rotates while its parent drifts, keeping the shape visually steadier than expected.",
    summary: "Highlights how local motion can cancel inherited movement when update rules are composed carefully.",
    createScene: createPurpleCube2Scene
  },
  {
    id: "demoPurpleCube3",
    title: "Purple Cube 3",
    description: "Two animated folders and a fast-spinning child produce the most layered transform stack in the set.",
    summary: "This is the densest hierarchy demo and gives the clearest feel for scene-graph style composition.",
    createScene: createPurpleCube3Scene
  },
  {
    id: "demoMultiCubeInLine",
    title: "Multi Cube In Line",
    description: "A line of cubes rotates independently while stepping diagonally across the scene.",
    summary: "Useful for seeing how repeated entities behave when they share the same renderer but not the same transform state.",
    createScene: () => createMultiCubeInLineScene(20)
  },
  {
    id: "demoMultiCubeInPlace",
    title: "Multi Cube In Place",
    description: "Each cube rotates around its own origin instead of the scene center.",
    summary: "Makes the anchor setting easy to understand because every box spins around its own local pivot.",
    createScene: () => createMultiCubeInPlaceScene(20)
  },
  {
    id: "demoTimeDif",
    title: "Time Dif",
    description: "A timing-focused scene starts with one box, then introduces a second box after the loop has been running.",
    summary: "This illustrates frame-based updates and shows how the scene changes once enough ticks have elapsed.",
    createScene: createTimeDifScene,
    tick: (_deltaMs, scene) => {
      if (!scene.metadata.secondBoxAdded && scene.framesSinceStartup > 120) {
        scene.metadata.secondBoxAdded = true;
        addSecondBox(scene);
      }
    }
  }
];

function tickNode(node: RuntimeNode, deltaMs: number, scene: RuntimeScene) {
  node.components.forEach((component) => component.update(deltaMs, node, scene));

  if (node.kind === "folder") {
    node.children.forEach((child) => tickNode(child, deltaMs, scene));
  }
}

function deriveWorldTransform(node: RuntimeNode, parent?: TransformProps): TransformProps {
  if (!parent) {
    return cloneTransform(node.properties);
  }

  const offset = rotatePositionAboutPoint(
    -parent.rotation,
    parent.anchor,
    parent.position
  );

  return {
    position: add(node.properties.position, offset),
    anchor: add(node.properties.anchor, offset),
    rotation: node.properties.rotation + parent.rotation,
    scale: multiply(node.properties.scale, parent.scale),
    size: cloneDimensions(node.properties.size)
  };
}

function createTreeSnapshot(node: RuntimeNode, parentWorld?: TransformProps): RuntimeTreeNode {
  const world = deriveWorldTransform(node, parentWorld);

  return {
    id: node.id,
    label: node.label,
    kind: node.kind,
    color: node.kind === "box" ? node.color : undefined,
    componentLabels: node.components.map((component) => component.label),
    local: cloneTransform(node.properties),
    world,
    children: node.kind === "folder"
      ? node.children.map((child) => createTreeSnapshot(child, world))
      : []
  };
}

function drawDebugMarkers(
  ctx: CanvasRenderingContext2D,
  properties: TransformProps,
  viewport: Dimensions
) {
  const finalPosition = rotatePositionAboutPoint(
    -properties.rotation,
    properties.anchor,
    properties.position
  );
  const anchorX = viewport.width / 2 + properties.anchor.x;
  const anchorY = viewport.height / 2 + properties.anchor.y;
  const translatedX = anchorX + (finalPosition.x - properties.anchor.x);
  const translatedY = anchorY + (finalPosition.y - properties.anchor.y);

  ctx.save();
  ctx.fillStyle = "#ff5b6f";
  ctx.translate(anchorX, anchorY);
  ctx.fillRect(-10, -10, 20, 20);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#3f9dff";
  ctx.translate(translatedX, translatedY);
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2;
  ctx.translate(translatedX, translatedY);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-(translatedX - anchorX), -(translatedY - anchorY));
  ctx.stroke();
  ctx.restore();
}

function drawTreeNode(
  ctx: CanvasRenderingContext2D,
  node: RuntimeTreeNode,
  viewport: Dimensions,
  showWireframes: boolean
) {
  if (node.kind === "box") {
    const { world } = node;
    const finalPosition = rotatePositionAboutPoint(
      -world.rotation,
      world.anchor,
      world.position
    );
    const translation = {
      x: finalPosition.x - world.anchor.x,
      y: finalPosition.y - world.anchor.y
    };
    const anchor = {
      x: viewport.width / 2 + world.anchor.x,
      y: viewport.height / 2 + world.anchor.y
    };

    ctx.save();
    ctx.fillStyle = node.color ?? MAGENTA;
    ctx.translate(anchor.x, anchor.y);
    ctx.translate(translation.x, translation.y);
    ctx.rotate(world.rotation);
    ctx.fillRect(
      -(world.size.width * world.scale.x) / 2,
      -(world.size.height * world.scale.y) / 2,
      world.size.width * world.scale.x,
      world.size.height * world.scale.y
    );
    ctx.restore();

    if (showWireframes) {
      drawDebugMarkers(ctx, world, viewport);
    }

    return;
  }

  if (showWireframes) {
    drawDebugMarkers(ctx, node.world, viewport);
  }

  node.children.forEach((child) => drawTreeNode(ctx, child, viewport, showWireframes));
}

export function createRuntimeScene(demoId: string): RuntimeScene {
  resetRuntimeCounters();
  const demo = rengineDemos.find((entry) => entry.id === demoId) ?? rengineDemos[0];
  return demo.createScene();
}

export function getRuntimeTreeSnapshot(scene: RuntimeScene): RuntimeTreeNode {
  return createTreeSnapshot(scene.root);
}

export function advanceRuntimeScene(demoId: string, scene: RuntimeScene, deltaMs: number) {
  scene.elapsedMs += deltaMs;
  scene.framesSinceStartup += 1;
  tickNode(scene.root, deltaMs, scene);
  const demo = rengineDemos.find((entry) => entry.id === demoId);
  demo?.tick?.(deltaMs, scene);
}

export function renderRuntimeScene(
  ctx: CanvasRenderingContext2D,
  scene: RuntimeScene,
  viewport: Dimensions,
  showWireframes: boolean
) {
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  ctx.fillStyle = "#f8fbff";
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  const treeSnapshot = getRuntimeTreeSnapshot(scene);
  treeSnapshot.children.forEach((child) =>
    drawTreeNode(ctx, child, viewport, showWireframes)
  );
}
