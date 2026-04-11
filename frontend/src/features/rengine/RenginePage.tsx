import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import SiteNavigation from "../../components/SiteNavigation";
import { profileContent } from "../../content/profile";
import { usePageReveal } from "../../hooks/usePageReveal";
import {
  advanceRuntimeScene,
  createRuntimeScene,
  getRuntimeTreeSnapshot,
  renderRuntimeScene,
  rengineDemos,
  type RuntimeTreeNode,
  type Vector2
} from "@rengine/runtime/demoRuntime";

function formatVector(vector: Vector2) {
  return `(${vector.x.toFixed(1)}, ${vector.y.toFixed(1)})`;
}

function formatRotation(rotation: number) {
  return `${rotation.toFixed(2)} rad`;
}

function RuntimeTreeNodeView({
  node,
  nodeSpace,
  localSpaceNodeIds,
  collapsedNodeIds,
  onToggleNode,
  onToggleNodeSpace
}: {
  node: RuntimeTreeNode;
  nodeSpace: "local" | "world";
  localSpaceNodeIds: Set<string>;
  collapsedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onToggleNodeSpace: (nodeId: string) => void;
}) {
  const isCollapsible = node.children.length > 0;
  const isCollapsed = collapsedNodeIds.has(node.id);
  const transform = nodeSpace === "local" ? node.local : node.world;

  return (
    <li className="rengine-tree__item">
      <div className="rengine-tree__node">
        <div className="rengine-tree__node-header">
          <div className="rengine-tree__node-title">
            <div className="rengine-tree__node-heading">
              <strong>{node.label}</strong>
              {isCollapsible ? (
                <button
                  type="button"
                  className={isCollapsed ? "rengine-tree__toggle is-collapsed" : "rengine-tree__toggle"}
                  onClick={() => onToggleNode(node.id)}
                  aria-expanded={!isCollapsed}
                  aria-label={isCollapsed ? `Expand ${node.label}` : `Collapse ${node.label}`}
                >
                  <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                    <path
                      d="M5.5 3.5 10 8l-4.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
            <div className="rengine-tree__node-kind">
              <span>{node.kind === "folder" ? "Folder" : "Box"}</span>
            </div>
          </div>
          <div className="rengine-tree__node-meta">
            {isCollapsible ? (
              <span className="rengine-tree__node-children">
                {node.children.length} child{node.children.length === 1 ? "" : "ren"}
              </span>
            ) : null}
            <span className="rengine-tree__node-id">{node.id}</span>
          </div>
        </div>

        <div className="rengine-tree__summary">
          {node.componentLabels.length > 0 ? (
            <div className="chip-row rengine-tree__chips">
              {node.componentLabels.map((label) => (
                <span key={label} className="chip chip--muted">
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="rengine-tree__summary-empty">No runtime components</span>
          )}

          {node.color ? (
            <span
              className="rengine-tree__color"
              style={{ ["--tree-node-color" as string]: node.color }}
            >
              color
            </span>
          ) : null}
        </div>

        <div className="rengine-tree__metrics" aria-label={`${nodeSpace} transform values`}>
          <button
            type="button"
            className="rengine-tree__space-toggle"
            onClick={() => onToggleNodeSpace(node.id)}
            aria-pressed={nodeSpace === "world"}
            aria-label={`Switch ${node.label} to ${nodeSpace === "world" ? "local" : "world"} space`}
          >
            {nodeSpace === "world" ? "World" : "Local"}
          </button>
          <div className="rengine-tree__metric-strip">
            <span className="rengine-tree__metric-pill rengine-tree__metric-pill--position">
              <span>pos</span>
              <strong>{formatVector(transform.position)}</strong>
            </span>
            <span className="rengine-tree__metric-pill rengine-tree__metric-pill--anchor">
              <span>anchor</span>
              <strong>{formatVector(transform.anchor)}</strong>
            </span>
            <span className="rengine-tree__metric-pill rengine-tree__metric-pill--rotation">
              <span>rot</span>
              <strong>{formatRotation(transform.rotation)}</strong>
            </span>
            <span className="rengine-tree__metric-pill rengine-tree__metric-pill--scale">
              <span>scale</span>
              <strong>{formatVector(transform.scale)}</strong>
            </span>
          </div>
        </div>
      </div>

      {isCollapsible && !isCollapsed ? (
        <ul className="rengine-tree__branch">
          {node.children.map((child) => (
            <RuntimeTreeNodeView
              key={child.id}
              node={child}
              nodeSpace={localSpaceNodeIds.has(child.id) ? "local" : "world"}
              localSpaceNodeIds={localSpaceNodeIds}
              collapsedNodeIds={collapsedNodeIds}
              onToggleNode={onToggleNode}
              onToggleNodeSpace={onToggleNodeSpace}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function collectCollapsibleNodeIds(node: RuntimeTreeNode): string[] {
  return [
    ...(node.children.length > 0 ? [node.id] : []),
    ...node.children.flatMap((child) => collectCollapsibleNodeIds(child))
  ];
}

function collectNodeIds(node: RuntimeTreeNode): string[] {
  return [
    node.id,
    ...node.children.flatMap((child) => collectNodeIds(child))
  ];
}

function RenginePage() {
  const isPageReady = usePageReveal();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const sceneRef = useRef(createRuntimeScene(rengineDemos[0].id));
  const lastTreeSyncRef = useRef(0);
  const exampleRailRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedExampleRail = useRef(false);
  const [selectedDemoId, setSelectedDemoId] = useState(rengineDemos[0].id);
  const [showWireframes, setShowWireframes] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [treeSnapshot, setTreeSnapshot] = useState<RuntimeTreeNode>(() =>
    getRuntimeTreeSnapshot(sceneRef.current)
  );
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(() => new Set());
  const [localSpaceNodeIds, setLocalSpaceNodeIds] = useState<Set<string>>(() => new Set());

  const selectedDemo = useMemo(
    () => rengineDemos.find((demo) => demo.id === selectedDemoId) ?? rengineDemos[0],
    [selectedDemoId]
  );
  const selectedDemoIndex = rengineDemos.findIndex((demo) => demo.id === selectedDemoId);

  useLayoutEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  }, []);

  useEffect(() => {
    sceneRef.current = createRuntimeScene(selectedDemoId);
    previousTimestampRef.current = null;
    lastTreeSyncRef.current = 0;
    setTreeSnapshot(getRuntimeTreeSnapshot(sceneRef.current));
    setCollapsedNodeIds(new Set());
    setLocalSpaceNodeIds(new Set());
  }, [selectedDemoId]);

  useEffect(() => {
    setCollapsedNodeIds((current) => {
      const validIds = new Set(collectCollapsibleNodeIds(treeSnapshot));
      const next = new Set<string>();

      current.forEach((nodeId) => {
        if (validIds.has(nodeId)) {
          next.add(nodeId);
        }
      });

      return next;
    });
  }, [treeSnapshot]);

  const toggleNode = (nodeId: string) => {
    setCollapsedNodeIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  useEffect(() => {
    setLocalSpaceNodeIds((current) => {
      const validIds = new Set(collectNodeIds(treeSnapshot));
      const next = new Set<string>();

      current.forEach((nodeId) => {
        if (validIds.has(nodeId)) {
          next.add(nodeId);
        }
      });

      return next;
    });
  }, [treeSnapshot]);

  const toggleNodeSpace = (nodeId: string) => {
    setLocalSpaceNodeIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  const scrollSelectedDemoIntoView = (behavior: ScrollBehavior) => {
    const rail = exampleRailRef.current;

    if (!rail) {
      return;
    }

    const selectedCard = rail.querySelector<HTMLButtonElement>(
      `[data-demo-id="${selectedDemoId}"]`
    );

    if (!selectedCard) {
      return;
    }

    const fadeInset = 48;
    const railPadding = 18;
    const targetLeft = Math.max(0, selectedCard.offsetLeft - fadeInset - railPadding);

    if (typeof rail.scrollTo === "function") {
      rail.scrollTo({ left: targetLeft, behavior });
    } else {
      rail.scrollLeft = targetLeft;
    }
  };

  useEffect(() => {
    if (!hasInitializedExampleRail.current) {
      hasInitializedExampleRail.current = true;
      scrollSelectedDemoIntoView("auto");
      return;
    }

    scrollSelectedDemoIntoView("smooth");
  }, [selectedDemoId]);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const updateSize = () => {
      const rect = stage.getBoundingClientRect();
      setStageSize({
        width: Math.max(320, Math.round(rect.width)),
        height: Math.max(320, Math.round(rect.height))
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const handleSelectAdjacentDemo = (direction: "previous" | "next") => {
    if (selectedDemoIndex < 0) {
      return;
    }

    const nextIndex =
      direction === "previous"
        ? Math.max(0, selectedDemoIndex - 1)
        : Math.min(rengineDemos.length - 1, selectedDemoIndex + 1);

    if (nextIndex === selectedDemoIndex) {
      return;
    }

    setSelectedDemoId(rengineDemos[nextIndex].id);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || stageSize.width <= 0 || stageSize.height <= 0) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(stageSize.width * devicePixelRatio);
    canvas.height = Math.round(stageSize.height * devicePixelRatio);
    canvas.style.width = `${stageSize.width}px`;
    canvas.style.height = `${stageSize.height}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const frame = (timestamp: number) => {
      const previousTimestamp = previousTimestampRef.current ?? timestamp;
      const deltaMs = Math.min(32, timestamp - previousTimestamp || 1);
      previousTimestampRef.current = timestamp;

      advanceRuntimeScene(selectedDemoId, sceneRef.current, deltaMs);
      renderRuntimeScene(
        context,
        sceneRef.current,
        stageSize,
        showWireframes
      );

      if (timestamp - lastTreeSyncRef.current >= 120) {
        lastTreeSyncRef.current = timestamp;
        setTreeSnapshot(getRuntimeTreeSnapshot(sceneRef.current));
      }

      animationFrameRef.current = window.requestAnimationFrame(frame);
    };

    animationFrameRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      previousTimestampRef.current = null;
    };
  }, [selectedDemoId, showWireframes, stageSize]);

  return (
    <div
      className={
        isPageReady
          ? "page-shell page-shell--ready ide-page"
          : "page-shell page-shell--entering ide-page"
      }
    >
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>
      <SiteNavigation sections={profileContent.sceneSections} />

      <main className="content-shell ide-shell">
        <section className="glass-card ide-workspace">
          <header className="ide-workspace__header">
            <div>
              <h1 className="ide-workspace__title">Rengine</h1>
              <p>
                A browser-based rendering engine experiment focused on transform
                hierarchies, animation loops, and scene composition.
              </p>
            </div>
          </header>

          <div className="ide-workspace__example-meta">
            <span className="section-heading__eyebrow">Demo Scenes</span>
          </div>

          <div className="ide-example-rail">
            <button
              type="button"
              className="ide-example-rail__nav ide-example-rail__nav--previous"
              aria-label="Previous demo"
              onClick={() => handleSelectAdjacentDemo("previous")}
              disabled={selectedDemoIndex <= 0}
            >
              <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                <path d="M10.5 3.5 6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              ref={exampleRailRef}
              className="ide-example-rail__scroller"
              role="list"
              aria-label="Rengine demos"
            >
              {rengineDemos.map((demo) => (
                <button
                  key={demo.id}
                  data-demo-id={demo.id}
                  type="button"
                  className={demo.id === selectedDemoId ? "example-card is-active" : "example-card"}
                  onClick={() => setSelectedDemoId(demo.id)}
                >
                  <strong>{demo.title}</strong>
                  <span>{demo.description}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ide-example-rail__nav ide-example-rail__nav--next"
              aria-label="Next demo"
              onClick={() => handleSelectAdjacentDemo("next")}
              disabled={selectedDemoIndex >= rengineDemos.length - 1}
            >
              <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                <path d="M5.5 3.5 10 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="ide-workspace__body rengine-workspace__body">
            <article className="ide-panel">
              <header className="ide-panel__header">
                <div>
                  <h3>Canvas Demo</h3>
                  <span>Interactive scene.</span>
                </div>
                <div className="ide-panel__actions rengine-panel__actions">
                  <button
                    type="button"
                    className={showWireframes ? "ide-run-button" : "cta-button cta-button--secondary"}
                    onClick={() => setShowWireframes((current) => !current)}
                    aria-pressed={showWireframes}
                  >
                    Wireframes: {showWireframes ? "On" : "Off"}
                  </button>
                </div>
              </header>

              <div className="rengine-stage-shell">
                <div className="rengine-stage" ref={stageRef}>
                  <canvas
                    ref={canvasRef}
                    className="rengine-stage__canvas"
                    aria-label={`${selectedDemo.title} canvas`}
                  />
                </div>
              </div>
            </article>

            <article className="ide-panel ide-panel--console rengine-panel--details">
              <header className="ide-panel__header">
                <div>
                  <h3>What You’re Seeing</h3>
                  <span>Scene graph notes and debug legend</span>
                </div>
              </header>
              <div className="rengine-detail-shell">
                <div className="rengine-detail-copy">
                  <section className="rengine-detail-section">
                    <span className="rengine-detail-section__label">Scene focus</span>
                    <p>{selectedDemo.summary}</p>
                  </section>

                  <section className="rengine-detail-section rengine-detail-section--legend">
                    <span className="rengine-detail-section__label">Wireframe legend</span>
                    <div className="rengine-legend" aria-label="Wireframe legend">
                      <div className="rengine-legend__item">
                        <span className="rengine-legend__swatch rengine-legend__swatch--anchor" />
                        <strong>Anchor</strong>
                        <span>Red square marking the parent pivot.</span>
                      </div>
                      <div className="rengine-legend__item">
                        <span className="rengine-legend__swatch rengine-legend__swatch--position" />
                        <strong>Position</strong>
                        <span>Blue square showing the entity’s translated origin.</span>
                      </div>
                      <div className="rengine-legend__item">
                        <span className="rengine-legend__swatch rengine-legend__swatch--relationship" />
                        <strong>Relationship</strong>
                        <span>Dark line connecting anchor and position.</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </article>
          </div>

          <article className="ide-panel rengine-tree-panel">
            <header className="ide-panel__header">
              <div>
                <h3>Live Component Tree</h3>
                <span>
                  Swap individual nodes between local and world space to compare inherited transforms in context.
                </span>
              </div>
            </header>
            <div className="rengine-tree-shell">
              <ul className="rengine-tree" role="tree" aria-label="Live component tree">
                <RuntimeTreeNodeView
                  node={treeSnapshot}
                  nodeSpace={localSpaceNodeIds.has(treeSnapshot.id) ? "local" : "world"}
                  localSpaceNodeIds={localSpaceNodeIds}
                  collapsedNodeIds={collapsedNodeIds}
                  onToggleNode={toggleNode}
                  onToggleNodeSpace={toggleNodeSpace}
                />
              </ul>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default RenginePage;
