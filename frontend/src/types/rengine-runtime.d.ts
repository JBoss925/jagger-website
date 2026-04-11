declare module "@rengine/runtime/demoRuntime" {
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

  export type RuntimeTreeNode = {
    id: string;
    label: string;
    kind: "box" | "folder";
    color?: string;
    componentLabels: string[];
    local: TransformProps;
    world: TransformProps;
    children: RuntimeTreeNode[];
  };

  export type RuntimeScene = {
    demoId: string;
    engineState: unknown;
    elapsedMs: number;
    framesSinceStartup: number;
    metadata: {
      secondBoxAdded?: boolean;
    };
  };

  export type RuntimeSetupOptions = {
    wireframeColors?: Partial<{
      anchor: string;
      position: string;
      relationship: string;
    }>;
  };

  export type RuntimeDemoDefinition = {
    id: string;
    title: string;
    description: string;
    summary: string;
  };

  export const rengineDemos: RuntimeDemoDefinition[];

  export function createRuntimeScene(
    demoId: string,
    canvas?: HTMLCanvasElement,
    viewport?: Dimensions,
    options?: RuntimeSetupOptions
  ): RuntimeScene;

  export function getRuntimeTreeSnapshot(runtime: RuntimeScene): RuntimeTreeNode;

  export function advanceRuntimeScene(
    demoId: string,
    runtime: RuntimeScene,
    deltaMs: number
  ): void;

  export function renderRuntimeScene(
    ctx: CanvasRenderingContext2D,
    runtime: RuntimeScene,
    viewport: Dimensions,
    showWireframes: boolean
  ): void;
}
