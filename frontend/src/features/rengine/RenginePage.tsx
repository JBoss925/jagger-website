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
  renderRuntimeScene,
  rengineDemos
} from "./rengineRuntime";

function RenginePage() {
  const isPageReady = usePageReveal();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const sceneRef = useRef(createRuntimeScene(rengineDemos[0].id));
  const exampleRailRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedExampleRail = useRef(false);
  const [selectedDemoId, setSelectedDemoId] = useState(rengineDemos[0].id);
  const [showWireframes, setShowWireframes] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

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
  }, [selectedDemoId]);

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
                  <span>Interactive scene output with optional transform markers.</span>
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
        </section>
      </main>
    </div>
  );
}

export default RenginePage;
