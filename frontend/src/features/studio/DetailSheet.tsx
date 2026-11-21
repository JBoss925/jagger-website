import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { papers } from "../../content/papers";
import type { ProjectEntry } from "../../types/content";
import { clean, summaries, views } from "./content";
import {
  INTERNAL_DEMOS,
  displayProjectTitle,
  getDemoHref,
  type SpatialItem,
} from "./spatialModel";
import { soundEngine } from "./soundEngine";

type DetailSheetProps = {
  item: SpatialItem;
  index: number;
  total: number;
  isMobile?: boolean;
  theaterOpen: boolean;
  onTheaterChange: (open: boolean) => void;
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
  onOpenResume?: () => void;
  titleId?: string;
  onDragHandlePointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
};

type SheetTab = "overview" | "demo" | "writing";

export default function DetailSheet({
  item,
  index,
  total,
  isMobile = false,
  theaterOpen,
  onTheaterChange,
  onClose,
  onStep,
  onOpenResume,
  titleId,
  onDragHandlePointerDown,
}: DetailSheetProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inlineReader, setInlineReader] = useState<"paper" | "docs" | null>(
    null,
  );
  const [demoRunning, setDemoRunning] = useState(false);
  const [activeViewHref, setActiveViewHref] = useState<string | null>(null);
  const prevTheaterOpenRef = useRef(theaterOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const uid = useId();
  const resolvedTitleId = titleId ?? `${uid}-title`;

  const project: ProjectEntry | null =
    item.payload.kind === "project" ||
    item.payload.kind === "demo" ||
    item.payload.kind === "library"
      ? item.payload.project
      : null;

  const paper = project
    ? papers.find((p) => p.slug === project.slug) ?? null
    : null;
  const demoHref = project ? getDemoHref(project) : undefined;
  const isInternalDemo = demoHref ? INTERNAL_DEMOS.has(demoHref) : false;

  const defaultTab: SheetTab =
    item.section === "demos" && demoHref
      ? "demo"
      : item.section === "library" && paper
        ? "writing"
        : "overview";

  const paramTab = searchParams.get("tab") as SheetTab | null;

  const tabs: Array<{ id: SheetTab; label: string }> = project
    ? [
        { id: "overview", label: "Overview" },
        ...(demoHref
          ? [{ id: "demo" as const, label: isMobile ? "Demo" : "Live Demo" }]
          : []),
        ...(paper ? [{ id: "writing" as const, label: "Paper & Docs" }] : []),
      ]
    : [];

  const activeTab: SheetTab =
    tabs.some((t) => t.id === paramTab) && paramTab ? paramTab : defaultTab;

  const setTab = (nextTab: SheetTab) => {
    const next = new URLSearchParams(searchParams);
    if (nextTab === defaultTab) next.delete("tab");
    else next.set("tab", nextTab);
    setSearchParams(next, { replace: false });
    soundEngine.playCategoryFilter(tabs.findIndex((t) => t.id === nextTab));
  };

  useEffect(() => {
    setInlineReader(null);
    setDemoRunning(false);
    setActiveViewHref(null);
    onTheaterChange(false);
    panelRef.current?.scrollTo?.({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [item.uid]);

  useEffect(() => {
    // When theater is closed externally (e.g., via Escape key), reset inner states cleanly
    if (prevTheaterOpenRef.current && !theaterOpen) {
      setDemoRunning(false);
      setInlineReader(null);
      setActiveViewHref(null);
    }
    prevTheaterOpenRef.current = theaterOpen;
  }, [theaterOpen]);

  useEffect(() => {
    const shouldExpand =
      (activeTab === "demo" && demoRunning && isInternalDemo) ||
      (activeTab === "writing" && inlineReader !== null) ||
      activeViewHref !== null;
    onTheaterChange(shouldExpand);
  }, [activeTab, demoRunning, isInternalDemo, inlineReader, activeViewHref, onTheaterChange]);

  const handleTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  const launchDemo = () => {
    soundEngine.playOpenTheater();
    setDemoRunning(true);
    setTab("demo");
  };

  const openReader = (mode: "paper" | "docs") => {
    if (inlineReader === mode) {
      setInlineReader(null);
      soundEngine.playClose();
    } else {
      setInlineReader(mode);
      soundEngine.playOpenTheater();
    }
  };

  const openView = (href: string) => {
    setActiveViewHref(href);
    soundEngine.playOpenTheater();
  };

  const exitTheater = () => {
    setDemoRunning(false);
    setInlineReader(null);
    setActiveViewHref(null);
    onTheaterChange(false);
    soundEngine.playClose();
  };

  // Deduplicate lead text when summaries[slug] already appears in the sheet header subtitle
  const projectSummary = project ? summaries[project.slug] : undefined;
  const showSeparateLead = Boolean(
    projectSummary && projectSummary.trim() !== item.subtitle.trim(),
  );

  const embedUrl = (href: string) => {
    if (!href.startsWith("/")) return href;
    return href.includes("?") ? `${href}&embed=1` : `${href}?embed=1`;
  };

  // Ultra-clean Full-Viewport Theater Mode: collapses ALL redundant header/tab/button chrome
  // into ONE razor-slim 50px glass bar so the embedded demo / paper / docs / view gets ~95% of the screen!
  if (theaterOpen && (project || activeViewHref)) {
    const activeViewMeta = activeViewHref
      ? views.find((v) => v.href === activeViewHref) ?? null
      : null;
    const activeUrl = activeViewHref
      ? activeViewHref
      : activeTab === "demo" && demoHref
        ? demoHref
        : inlineReader === "docs" && paper
          ? `/docs/${paper.slug}`
          : paper
            ? `/papers/${paper.slug}`
            : demoHref ?? "/";
    const iframeTitle = activeViewMeta
      ? `${activeViewMeta.title} portfolio view`
      : activeTab === "demo" && project
        ? `${project.title} live demo`
        : project
          ? `${project.title} ${inlineReader === "docs" ? "documentation" : "paper"}`
          : `${item.title} preview`;

    return (
      <aside
        className={`glass-sheet is-theater ${isMobile ? "is-mobile-drawer" : ""}`}
        aria-label={`${item.title} theater`}
      >
        <div className="theater-slim-bar">
          <div className="theater-slim-bar__left">
            <button
              type="button"
              className="glass-sheet__pill-btn"
              onClick={exitTheater}
            >
              {isMobile ? "← Back" : "← Return to sculpture"}
            </button>
            {(!isMobile || (!activeViewMeta && activeTab !== "writing")) && (
              <strong className="theater-slim-bar__title">
                {activeViewMeta ? activeViewMeta.title : item.title}
              </strong>
            )}
            {activeViewMeta && (
              <div className="theater-mode-switch" role="group" aria-label="Switch portfolio view">
                {views.map((v) => (
                  <button
                    key={v.href}
                    type="button"
                    aria-pressed={activeViewHref === v.href}
                    onClick={() => {
                      if (activeViewHref !== v.href) openView(v.href);
                    }}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            )}
            {!activeViewMeta && activeTab === "writing" && paper && (
              <div className="theater-mode-switch" role="group" aria-label="Switch reading mode">
                <button
                  type="button"
                  aria-pressed={inlineReader === "paper"}
                  onClick={() => {
                    if (inlineReader !== "paper") {
                      setInlineReader("paper");
                      soundEngine.playCategoryFilter(0);
                    }
                  }}
                >
                  Paper
                </button>
                <button
                  type="button"
                  aria-pressed={inlineReader === "docs"}
                  onClick={() => {
                    if (inlineReader !== "docs") {
                      setInlineReader("docs");
                      soundEngine.playCategoryFilter(1);
                    }
                  }}
                >
                  Docs
                </button>
              </div>
            )}
          </div>

          <div className="theater-slim-bar__right">
            <a
              className="theater-slim-bar__link"
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
            >
              {isMobile ? "Full page" : "Open full page"}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="theater-iframe-stage">
          <iframe
            key={activeUrl}
            src={embedUrl(activeUrl)}
            title={iframeTitle}
            allow="fullscreen"
            allowFullScreen
          />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`glass-sheet ${isMobile ? "is-mobile-drawer" : ""}`}
      aria-label={`${item.title} inspector`}
    >
      {/* Mobile swipe-down drag handle */}
      {isMobile && (
        <div
          className="drawer-grab-zone"
          onPointerDown={onDragHandlePointerDown}
          aria-hidden="true"
        >
          <span className="drawer-grab-pill" />
        </div>
      )}

      {/* Top chrome: eyebrow + stepper + close */}
      <div
        className="glass-sheet__bar"
        onPointerDown={isMobile ? onDragHandlePointerDown : undefined}
      >
        <div className="glass-sheet__meta">
          <span
            className="glass-sheet__swatch"
            style={{ backgroundColor: item.palette.primary }}
            aria-hidden="true"
          />
          <span className="glass-sheet__eyebrow">{item.eyebrow}</span>
        </div>

        <div
          className="glass-sheet__controls"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {theaterOpen && (
            <button
              type="button"
              className="glass-sheet__pill-btn"
              onClick={() => {
                setDemoRunning(false);
                setInlineReader(null);
                soundEngine.playClose();
              }}
            >
              {isMobile ? "← Exit full view" : "← Return to sculpture"}
            </button>
          )}
          <span className="glass-sheet__counter" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="glass-sheet__stepper">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Previous item"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Next item"
            >
              →
            </button>
          </div>
          <button
            type="button"
            className="glass-sheet__close"
            onClick={onClose}
            aria-label="Close detail sheet"
          >
            ×
          </button>
        </div>
      </div>

      {/* Title & single-row tabs */}
      <header className="glass-sheet__header">
        <h2 ref={headingRef} id={resolvedTitleId} tabIndex={-1}>
          {item.title}
        </h2>
        <p className="glass-sheet__subtitle">{item.subtitle}</p>

        {tabs.length > 1 && (
          <div
            className="glass-sheet__tabs"
            role="tablist"
            aria-label="Artifact views"
          >
            {tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${t.id}`}
                aria-controls={`${uid}-panel-${t.id}`}
                aria-selected={activeTab === t.id}
                tabIndex={activeTab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => handleTabKey(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Scrollable body with smooth bottom feather mask */}
      <div className="glass-sheet__body" ref={panelRef}>
        {project && (
          <div
            key={`${item.uid}-${activeTab}`}
            className="glass-sheet__panel"
            role="tabpanel"
            id={`${uid}-panel-${activeTab}`}
            aria-labelledby={`${uid}-tab-${activeTab}`}
          >
            {activeTab === "overview" && (
              <>
                {project.image && (
                  <div className="sheet-media">
                    <img
                      src={project.image}
                      alt={`${displayProjectTitle(project)} preview`}
                    />
                  </div>
                )}

                {showSeparateLead && (
                  <p className="sheet-lead">{projectSummary}</p>
                )}
                <p className="sheet-copy">{clean(project.description)}</p>

                <div className="sheet-actions">
                  {isInternalDemo && (
                    <button
                      type="button"
                      className="sheet-btn sheet-btn--primary"
                      onClick={launchDemo}
                    >
                      Launch interactive demo <span aria-hidden="true">▶</span>
                    </button>
                  )}
                  {!isInternalDemo && demoHref && (
                    <a
                      className="sheet-btn sheet-btn--primary"
                      href={demoHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open live app <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {paper && (
                    <button
                      type="button"
                      className={
                        !demoHref ? "sheet-btn sheet-btn--primary" : "sheet-btn"
                      }
                      onClick={() => {
                        setTab("writing");
                        setInlineReader("paper");
                        soundEngine.playOpenTheater();
                      }}
                    >
                      Read paper <span aria-hidden="true">↗</span>
                    </button>
                  )}
                  {paper && (
                    <button
                      type="button"
                      className="sheet-btn"
                      onClick={() => {
                        setTab("writing");
                        setInlineReader("docs");
                        soundEngine.playOpenTheater();
                      }}
                    >
                      Docs <span aria-hidden="true">↗</span>
                    </button>
                  )}
                  {project.links
                    .filter(
                      (l) =>
                        l.href !== demoHref &&
                        !l.href.startsWith("/papers/"),
                    )
                    .map((link) => (
                      <a
                        key={link.href}
                        className="sheet-btn"
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {link.label.replace(/^Open /, "")}{" "}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                </div>

                <section className="sheet-block">
                  <h3>Engineering architecture</h3>
                  <p className="sheet-copy">{clean(project.impact)}</p>
                </section>

                {project.slug === "portfolio-site" && (
                  <section className="sheet-block">
                    <h3>One portfolio, four frontends</h3>
                    <div className="sheet-views-grid">
                      {views.map((v) => (
                        <div key={v.href} className="sheet-view-card">
                          <button
                            type="button"
                            className="sheet-view-card__main"
                            onClick={() => openView(v.href)}
                          >
                            <span className="sheet-view-card__mark" aria-hidden="true">
                              {v.mark}
                            </span>
                            <span>
                              <strong>{v.title}</strong>
                              <small>{v.detail}</small>
                            </span>
                          </button>
                          <a
                            href={v.href}
                            target="_blank"
                            rel="noreferrer"
                            className="sheet-view-card__ext"
                            aria-label={`Open ${v.title} in new tab`}
                            title={`Open ${v.title} in new tab`}
                          >
                            ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!project.relatedLinks?.length && (
                  <section className="sheet-block">
                    <h3>
                      {project.slug === "jagger-games"
                        ? "Six playable games"
                        : "Related destinations"}
                    </h3>
                    <div className="sheet-related-grid">
                      {project.relatedLinks.map((rl) => (
                        <a
                          key={rl.href}
                          href={rl.href}
                          className="sheet-related-card"
                        >
                          <strong>
                            {rl.label} <span aria-hidden="true">↗</span>
                          </strong>
                          <span>{rl.description}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                <section className="sheet-block">
                  <h3>Stack & techniques</h3>
                  <ul className="sheet-tags">
                    {project.stack.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {activeTab === "demo" && demoHref && (
              <div className="sheet-theater-wrap">
                {isInternalDemo ? (
                  <>
                    {demoRunning ? (
                      <>
                        <div className="sheet-actions sheet-actions--compact">
                          <button
                            type="button"
                            className="sheet-btn"
                            onClick={() => {
                              setDemoRunning(false);
                              soundEngine.playClose();
                            }}
                          >
                            Stop demo <span aria-hidden="true">□</span>
                          </button>
                          <a
                            className="sheet-btn"
                            href={demoHref}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open standalone <span aria-hidden="true">↗</span>
                          </a>
                        </div>
                        <div className="sheet-iframe-frame">
                          <iframe
                            src={demoHref}
                            title={`${project.title} live demo`}
                            allow="fullscreen"
                            allowFullScreen
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="sheet-launch-card"
                          onClick={() => {
                            setDemoRunning(true);
                            soundEngine.playOpenTheater();
                          }}
                        >
                          {project.image && <img src={project.image} alt="" />}
                          <span className="sheet-launch-card__cta">
                            <span className="sheet-launch-card__play">▶</span>
                            Launch {displayProjectTitle(project)} here
                          </span>
                        </button>
                        <div className="sheet-actions sheet-actions--compact">
                          <a
                            className="sheet-btn"
                            href={demoHref}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open standalone <span aria-hidden="true">↗</span>
                          </a>
                        </div>
                      </>
                    )}

                    {!!project.relatedLinks?.length && !demoRunning && (
                      <section className="sheet-block">
                        <h3>Or jump straight into a game</h3>
                        <div className="sheet-related-grid">
                          {project.relatedLinks.map((rl) => (
                            <a
                              key={rl.href}
                              href={rl.href}
                              className="sheet-related-card"
                            >
                              <strong>
                                {rl.label} <span aria-hidden="true">↗</span>
                              </strong>
                              <span>{rl.description}</span>
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="sheet-external-demo">
                    {project.image && (
                      <div className="sheet-media">
                        <img src={project.image} alt={`${project.title} preview`} />
                      </div>
                    )}
                    <p className="sheet-copy">{clean(project.description)}</p>
                    <a
                      className="sheet-btn sheet-btn--primary"
                      href={demoHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Launch {displayProjectTitle(project)}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "writing" && paper && (
              <div className="sheet-writing">
                <div className="sheet-paper-meta">
                  <span>{paper.authors.join(", ")}</span>
                  <span>·</span>
                  <span>{paper.date}</span>
                  <span>·</span>
                  <span>{paper.categories.join(" / ")}</span>
                </div>

                <h3 className="sheet-paper-title">{paper.title}</h3>

                <div className="sheet-actions">
                  <button
                    type="button"
                    className={`sheet-btn ${inlineReader !== "docs" ? "sheet-btn--primary" : ""}`}
                    onClick={() => openReader("paper")}
                  >
                    {inlineReader === "paper" ? "Close paper" : "Read paper here"}
                  </button>
                  <button
                    type="button"
                    className={`sheet-btn ${inlineReader === "docs" ? "sheet-btn--primary" : ""}`}
                    onClick={() => openReader("docs")}
                  >
                    {inlineReader === "docs" ? "Close docs" : "Browse docs"}
                  </button>
                  <Link
                    className="sheet-ghost-link"
                    to={`/${inlineReader === "docs" ? "docs" : "papers"}/${paper.slug}`}
                  >
                    Open full page ↗
                  </Link>
                </div>

                {inlineReader && (
                  <div className="sheet-iframe-frame">
                    <iframe
                      title={`${project.title} ${inlineReader === "paper" ? "paper" : "documentation"}`}
                      src={`/${inlineReader === "paper" ? "papers" : "docs"}/${paper.slug}`}
                    />
                  </div>
                )}

                {!inlineReader && (
                  <>
                    <section className="sheet-block">
                      <h3>Abstract</h3>
                      <p className="sheet-copy">{clean(paper.abstract)}</p>
                    </section>
                    <section className="sheet-block">
                      <h3>Topics</h3>
                      <ul className="sheet-tags">
                        {paper.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    </section>
                    <div className="sheet-reading-links">
                      <Link to={`/papers/${paper.slug}`}>Standalone paper ↗</Link>
                      <Link to={`/docs/${paper.slug}`}>Standalone docs ↗</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {item.payload.kind === "experience" && (
          <div key={item.uid} className="glass-sheet__panel">
            <div className="sheet-exp-hero">
              {item.payload.experience.logo && (
                <div className="sheet-exp-logo">
                  <img
                    src={item.payload.experience.logo}
                    alt={item.payload.experience.logoAlt ?? item.title}
                  />
                </div>
              )}
              <div>
                <strong className="sheet-exp-role">
                  {item.payload.experience.role}
                </strong>
                <span className="sheet-exp-meta">
                  {item.payload.experience.timeframe} ·{" "}
                  {item.payload.experience.location}
                </span>
              </div>
            </div>

            <p className="sheet-lead">{item.payload.experience.summary}</p>

            <section className="sheet-block">
              <h3>Key contributions</h3>
              <ul className="sheet-highlights">
                {item.payload.experience.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>

            <section className="sheet-block">
              <h3>Technologies & scope</h3>
              <ul className="sheet-tags">
                {item.payload.experience.tags.slice(0, 20).map((tag) => (
                  <li key={tag.label}>{tag.label}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {item.payload.kind === "about" && (
          <div key={item.uid} className="glass-sheet__panel">
            {item.payload.about.kind === "bio" && (
              <>
                <p className="sheet-lead">{item.payload.about.body[0]}</p>
                <div className="sheet-metrics">
                  {item.payload.about.metrics.map((m) => (
                    <div key={m.label} className="sheet-metric">
                      <span>{m.label}</span>
                      <strong>{m.value}</strong>
                    </div>
                  ))}
                </div>
                <ul className="sheet-highlights">
                  {item.payload.about.body.slice(1).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="sheet-actions">
                  {item.payload.about.links.map((l) =>
                    l.href === "/files/resume.pdf" && onOpenResume ? (
                      <button
                        key={l.href}
                        type="button"
                        className="sheet-btn"
                        onClick={onOpenResume}
                      >
                        {l.label} <span aria-hidden="true">↗</span>
                      </button>
                    ) : (
                      <a
                        key={l.href}
                        href={l.href}
                        className={`sheet-btn ${l.label === "Email" ? "sheet-btn--primary" : ""}`}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {l.label} <span aria-hidden="true">↗</span>
                      </a>
                    ),
                  )}
                </div>
              </>
            )}

            {item.payload.about.kind === "skill" && (
              <>
                <p className="sheet-lead">
                  {clean(item.payload.about.cluster.summary)}
                </p>
                <section className="sheet-block">
                  <h3>Core strengths</h3>
                  <ul className="sheet-tags">
                    {item.payload.about.cluster.items.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {item.payload.about.kind === "views" && (
              <>
                <p className="sheet-copy">{item.payload.about.body}</p>
                <div className="sheet-views-grid">
                  {item.payload.about.views.map((v) => (
                    <div key={v.href} className="sheet-view-card">
                      <button
                        type="button"
                        className="sheet-view-card__main"
                        onClick={() => openView(v.href)}
                      >
                        <span className="sheet-view-card__mark" aria-hidden="true">
                          {v.mark}
                        </span>
                        <span>
                          <strong>{v.title}</strong>
                          <small>{v.detail}</small>
                        </span>
                      </button>
                      <a
                        href={v.href}
                        target="_blank"
                        rel="noreferrer"
                        className="sheet-view-card__ext"
                        aria-label={`Open ${v.title} in new tab`}
                        title={`Open ${v.title} in new tab`}
                      >
                        ↗
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}

            {item.payload.about.kind === "contact" && (
              <>
                <p className="sheet-lead">{item.payload.about.body}</p>
                <div className="sheet-contact-list" role="list">
                  <a
                    href={`mailto:${item.payload.about.email}`}
                    className="sheet-contact-row sheet-contact-row--primary"
                    role="listitem"
                  >
                    <span className="sheet-contact-row__icon" aria-hidden="true">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="3" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <span className="sheet-contact-row__text">
                      <strong>Email</strong>
                      <small>{item.payload.about.email}</small>
                    </span>
                    <span className="sheet-contact-row__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>

                  {onOpenResume ? (
                    <button
                      type="button"
                      className="sheet-contact-row"
                      role="listitem"
                      onClick={onOpenResume}
                    >
                      <span className="sheet-contact-row__icon" aria-hidden="true">
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="9" y1="13" x2="15" y2="13" />
                          <line x1="9" y1="17" x2="13" y2="17" />
                        </svg>
                      </span>
                      <span className="sheet-contact-row__text">
                        <strong>Résumé</strong>
                        <small>PDF · View here or download</small>
                      </span>
                      <span className="sheet-contact-row__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                  ) : (
                    <a
                      href="/files/resume.pdf"
                      className="sheet-contact-row"
                      role="listitem"
                    >
                      <span className="sheet-contact-row__icon" aria-hidden="true">
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="9" y1="13" x2="15" y2="13" />
                          <line x1="9" y1="17" x2="13" y2="17" />
                        </svg>
                      </span>
                      <span className="sheet-contact-row__text">
                        <strong>Résumé</strong>
                        <small>PDF · View or download</small>
                      </span>
                      <span className="sheet-contact-row__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  )}

                  <a
                    href="https://github.com/JBoss925"
                    target="_blank"
                    rel="noreferrer"
                    className="sheet-contact-row"
                    role="listitem"
                  >
                    <span className="sheet-contact-row__icon" aria-hidden="true">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                      </svg>
                    </span>
                    <span className="sheet-contact-row__text">
                      <strong>GitHub</strong>
                      <small>github.com/JBoss925</small>
                    </span>
                    <span className="sheet-contact-row__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/jaggerbrulato/"
                    target="_blank"
                    rel="noreferrer"
                    className="sheet-contact-row"
                    role="listitem"
                  >
                    <span className="sheet-contact-row__icon" aria-hidden="true">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                      </svg>
                    </span>
                    <span className="sheet-contact-row__text">
                      <strong>LinkedIn</strong>
                      <small>linkedin.com/in/jaggerbrulato</small>
                    </span>
                    <span className="sheet-contact-row__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
