import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { profileContent } from "../../content/profile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import DetailSheet from "./DetailSheet";
import MobilePortfolio from "./MobilePortfolio";
import SpatialStage, { type ProjectedLabelMap } from "./SpatialStage";
import { soundEngine } from "./soundEngine";
import {
  SECTIONS,
  categories,
  getItemsForSection,
  getSectionConfig,
  type CategoryId,
  type SectionId,
} from "./spatialModel";
import "./explorer.css";

function resolveSection(params: URLSearchParams): SectionId {
  const sec = params.get("section");
  if (SECTIONS.some((s) => s.id === sec)) return sec as SectionId;

  const legacy = params.get("view");
  if (legacy === "play") return "demos";
  if (legacy === "research") return "library";
  if (legacy === "about") return "about";
  if (legacy === "work") return "projects";

  // Direct project or category deep links still route cleanly into Projects
  if (params.get("project") || params.get("category")) return "projects";
  return "experience";
}

export default function StudioPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 820px)");
  const prefersReducedMotion = usePrefersReducedMotion();

  const section = resolveSection(params);
  const category = (
    categories.some((c) => c.id === params.get("category"))
      ? params.get("category")
      : "all"
  ) as CategoryId;

  const itemSlug = params.get("item") ?? params.get("project");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [theaterOpen, setTheaterOpen] = useState(false);
  const [audioState, setAudioState] = useState(() => soundEngine.getState());

  // Sleek 1-click GameCube-style boot veil on fresh desktop `/` entry so clicking "Enter"
  // synchronously unlocks Web Audio (hover blips + Wii/GameCube music + boot swell) and triggers
  // the 120-cube drop-in wave together! Skips automatically on deep links or reduced motion.
  const [hasEntered, setHasEntered] = useState(() => {
    const hasDeepLink = Boolean(
      params.get("section") ||
        params.get("item") ||
        params.get("project") ||
        params.get("category") ||
        params.get("view") ||
        location.hash,
    );
    const reduced =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const narrowMobile =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(max-width: 820px)").matches);
    return hasDeepLink || reduced || narrowMobile;
  });
  const [bootExiting, setBootExiting] = useState(false);
  const showBootOverlay = !hasEntered && !isMobile && !prefersReducedMotion;

  const handleEnterStudio = useCallback((muted: boolean) => {
    if (bootExiting || hasEntered) return;
    if (muted) {
      soundEngine.setMuted(true);
    } else {
      soundEngine.enterWithSound();
    }
    setBootExiting(true);
    setHasEntered(true);
    window.setTimeout(() => setBootExiting(false), 520);
  }, [bootExiting, hasEntered]);

  const items = useMemo(
    () => getItemsForSection(section, section === "projects" ? category : "all"),
    [section, category],
  );

  const selected = useMemo(
    () => items.find((i) => i.slug === itemSlug) ?? null,
    [items, itemSlug],
  );

  const hoveredItem = useMemo(
    () => items.find((i) => i.slug === hoveredSlug) ?? null,
    [items, hoveredSlug],
  );

  const sectionConfig = getSectionConfig(section);

  // Refs for 2D-projected 3D floating glass labels (100% reliable, zero dropouts!)
  const labelRefs = useRef<ProjectedLabelMap>({});
  const lastFocusedTriggerRef = useRef<HTMLElement | null>(null);

  // Sliding Liquid Glass pill indicator measurement for top navigation bar
  const navRef = useRef<HTMLElement>(null);
  const navBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // Bottom dock scroll overflow detection & smooth navigation
  const dockScrollRef = useRef<HTMLUListElement>(null);
  const [dockScroll, setDockScroll] = useState({ left: false, right: false });

  const measureNavPill = useCallback(() => {
    const btn = navBtnRefs.current[section];
    const nav = navRef.current;
    if (!btn || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
    });
  }, [section]);

  const measureDockOverflow = useCallback(() => {
    const el = dockScrollRef.current;
    if (!el) return;
    setDockScroll({
      left: el.scrollLeft > 6,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 6,
    });
  }, []);

  useLayoutEffect(() => {
    measureNavPill();
    measureDockOverflow();
  }, [measureNavPill, measureDockOverflow, isMobile, items.length]);

  useEffect(() => {
    const onResize = () => {
      measureNavPill();
      measureDockOverflow();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureNavPill, measureDockOverflow]);

  // Reset dock scroll to the start when switching sections/categories (so item #1 is always visible first!)
  useEffect(() => {
    if (dockScrollRef.current) {
      dockScrollRef.current.scrollLeft = 0;
    }
    measureDockOverflow();
  }, [section, category, measureDockOverflow]);

  // Auto-scroll selected dock item smoothly into view
  useEffect(() => {
    if (!selected || !dockScrollRef.current) return;
    const btn = dockScrollRef.current.querySelector<HTMLButtonElement>(
      `button[data-dock-item="${selected.slug}"]`,
    );
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected?.slug]);

  // Subscribe to global soundEngine state + auto-start on deep links (boot overlay handles fresh `/`)
  useEffect(() => {
    const unsub = soundEngine.subscribe(setAudioState);
    if (!showBootOverlay) {
      soundEngine.startExperience(!isMobile);
    }

    const unlock = (ev: Event) => {
      if (showBootOverlay) return;
      if (
        ev.target instanceof Element &&
        ev.target.closest(".spatial-audio-controls")
      ) {
        return;
      }
      const clickedInteractiveSfx =
        ev.target instanceof Element &&
        Boolean(
          ev.target.closest(
            ".spatial-nav, .spatial-pill, .spatial-dock__item, .spatial-categories",
          ),
        );
      soundEngine.unlock(!isMobile && !clickedInteractiveSfx);
    };
    window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
    window.addEventListener("keydown", unlock, { capture: true });
    return () => {
      unsub();
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
    };
  }, [isMobile, showBootOverlay]);

  // Allow pressing Enter or Space directly on the boot overlay to enter with sound
  useEffect(() => {
    if (!showBootOverlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEnterStudio(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showBootOverlay, handleEnterStudio]);

  // Gently duck ambient soundscape while an interactive demo/reader theater is open
  useEffect(() => {
    soundEngine.setTheaterActive(theaterOpen);
    return () => soundEngine.setTheaterActive(false);
  }, [theaterOpen]);

  const updateParams = useCallback(
    (values: Record<string, string | null>, replace = false) => {
      const next = new URLSearchParams(params);
      next.delete("view");
      next.delete("project");
      next.delete("focus");
      Object.entries(values).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      setParams(next, { replace });
    },
    [params, setParams],
  );

  // Migrate legacy deep-link hashes
  useEffect(() => {
    if (!location.hash) return;
    const hash = location.hash.slice(1);
    if (hash.startsWith("projects/")) {
      updateParams({ section: "projects", item: hash.split("/")[1] ?? null }, true);
    } else if (hash.startsWith("experience/")) {
      updateParams(
        { section: null, item: hash.split("/")[1] ?? null },
        true,
      );
    } else if (hash === "experience") {
      updateParams({ section: null, item: null }, true);
    } else if (hash === "about") {
      updateParams({ section: "about", item: "jagger" }, true);
    } else if (hash === "contact") {
      updateParams({ section: "about", item: "contact" }, true);
    }
  }, [location.hash, updateParams]);

  useEffect(() => {
    document.title = selected
      ? `${selected.title} — Jagger Brulato`
      : section === "experience"
        ? "Jagger Brulato — Spatial Portfolio"
        : `${sectionConfig.label} — Jagger Brulato`;
  }, [selected, section, sectionConfig.label]);

  const handleSectionChange = useCallback(
    (nextSection: SectionId) => {
      if (nextSection === section && !selected) return;
      const idx = SECTIONS.findIndex((s) => s.id === nextSection);
      soundEngine.playSectionTransition(idx);
      setHoveredSlug(null);
      setTheaterOpen(false);
      updateParams({
        section: nextSection === "experience" ? null : nextSection,
        category: null,
        item: null,
        tab: null,
      });
    },
    [section, selected, updateParams],
  );

  const handleCategoryChange = useCallback(
    (nextCategory: CategoryId) => {
      if (nextCategory === category && !selected) return;
      const idx = categories.findIndex((c) => c.id === nextCategory);
      soundEngine.playCategoryFilter(idx);
      setHoveredSlug(null);
      updateParams({
        section: "projects",
        category: nextCategory === "all" ? null : nextCategory,
        item: null,
        tab: null,
      });
    },
    [category, selected, updateParams],
  );

  const handleSelect = useCallback(
    (slug: string) => {
      if (document.activeElement instanceof HTMLElement) {
        lastFocusedTriggerRef.current = document.activeElement;
      }
      const idx = items.findIndex((i) => i.slug === slug);
      soundEngine.playSelect(Math.max(0, idx));
      setHoveredSlug(null);
      updateParams({
        section: section === "experience" ? null : section,
        item: slug,
        tab: null,
      });
    },
    [items, section, updateParams],
  );

  const handleHover = useCallback(
    (slug: string | null) => {
      setHoveredSlug((prev) => {
        if (slug && slug !== prev) {
          const idx = items.findIndex((i) => i.slug === slug);
          soundEngine.playHover(Math.max(0, idx));
        }
        return slug;
      });
    },
    [items],
  );

  const handleClose = useCallback(() => {
    soundEngine.playClose();
    setTheaterOpen(false);
    updateParams({
      section: section === "experience" ? null : section,
      item: null,
      tab: null,
    });
    window.setTimeout(() => {
      lastFocusedTriggerRef.current?.focus({ preventScroll: true });
    }, 30);
  }, [section, updateParams]);

  const handleStep = useCallback(
    (direction: -1 | 1) => {
      if (!selected || items.length === 0) return;
      const curr = items.findIndex((i) => i.slug === selected.slug);
      const next = items[(curr + direction + items.length) % items.length];
      if (next) handleSelect(next.slug);
    },
    [items, selected, handleSelect],
  );

  // Two-stage Escape (exit theater first -> close sheet second) + Arrow stepping
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (theaterOpen) {
          setTheaterOpen(false);
          soundEngine.playClose();
        } else if (selected) {
          handleClose();
        }
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      const isEditable =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "SELECT" ||
        active?.isContentEditable ||
        active?.getAttribute("role") === "tab";

      if (selected && !theaterOpen && !isEditable) {
        if (e.key === "ArrowRight") handleStep(1);
        else if (e.key === "ArrowLeft") handleStep(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, theaterOpen, handleClose, handleStep]);

  if (isMobile) {
    return (
      <MobilePortfolio
        section={section}
        category={category}
        items={items}
        selected={selected}
        theaterOpen={theaterOpen}
        onSectionChange={handleSectionChange}
        onCategoryChange={handleCategoryChange}
        onSelect={handleSelect}
        onClose={handleClose}
        onStep={handleStep}
        onTheaterChange={setTheaterOpen}
      />
    );
  }

  const transitionKey = showBootOverlay
    ? "boot-hold"
    : `${section}:${category}:${selected?.slug ?? "overview"}`;
  const selectedIndex = selected
    ? items.findIndex((i) => i.slug === selected.slug)
    : -1;

  const dynamicEyebrow =
    section === "projects" && category !== "all"
      ? `${sectionConfig.eyebrowBase} · ${String(items.length).padStart(2, "0")} OF 13`
      : section === "projects"
        ? `${sectionConfig.eyebrowBase} · ${String(items.length).padStart(2, "0")} ARTIFACTS`
        : section === "library"
          ? `${sectionConfig.eyebrowBase} · ${String(items.length).padStart(2, "0")} VOLUMES`
          : section === "demos"
            ? `${sectionConfig.eyebrowBase} · ${String(items.length).padStart(2, "0")} LIVE APPS`
            : sectionConfig.eyebrowBase;

  return (
    <div
      className={`spatial-app section-${section} ${selected ? "has-selection" : ""} ${theaterOpen ? "is-theater" : ""}`}
    >
      <a className="spatial-skip" href="#explorer-content">
        Skip to content
      </a>

      {/* Luminous pastel lavender aurora atmosphere + ultra-fine film grain */}
      <div className="spatial-atmosphere" aria-hidden="true">
        <div className="spatial-orb spatial-orb--a" />
        <div className="spatial-orb spatial-orb--b" />
        <div className="spatial-orb spatial-orb--c" />
      </div>

      {/* Full-viewport shared living 120-cube choreography canvas */}
      <div className="spatial-canvas-layer">
        <SpatialStage
          items={items}
          section={section}
          selected={selected}
          hoveredSlug={hoveredSlug}
          transitionKey={transitionKey}
          bootHolding={showBootOverlay}
          suspended={theaterOpen}
          labelRefs={labelRefs}
          onSelect={handleSelect}
          onHover={handleHover}
        />
      </div>

      {/* 2D-projected 3D floating frosted glass pills (100% reliable, zero dropouts!) */}
      {!selected && !showBootOverlay && (
        <div className="spatial-labels-layer" aria-hidden="false">
          {items.map((item) => {
            const isHovered = hoveredSlug === item.slug;
            return (
              <button
                key={item.uid}
                ref={(el) => {
                  labelRefs.current[item.uid] = el;
                }}
                type="button"
                tabIndex={-1}
                data-spatial-item={item.slug}
                className={`spatial-pill ${isHovered ? "is-hovered" : ""}`}
                onMouseEnter={() => handleHover(item.slug)}
                onMouseLeave={() => handleHover(null)}
                onClick={() => handleSelect(item.slug)}
              >
                <span
                  className="spatial-pill__dot"
                  style={{ backgroundColor: item.palette.primary }}
                  aria-hidden="true"
                />
                <span className="spatial-pill__label">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sleek 1-click GameCube-inspired Boot Entry Veil (unlocks audio + launches 120-cube drop-in) */}
      {(showBootOverlay || bootExiting) && (
        <div
          className={`spatial-boot-veil ${bootExiting ? "is-exiting" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Enter Jagger Brulato's spatial portfolio"
        >
          <div className="spatial-boot-card">
            <div className="spatial-boot-mark" aria-hidden="true">
              <img src="/favicon.svg" alt="" width={58} height={58} />
            </div>
            <p className="spatial-boot-eyebrow">JAGGER BRULATO · STAFF ENGINEER</p>
            <h2 className="spatial-boot-title">
              Spatial <em>Portfolio.</em>
            </h2>
            <p className="spatial-boot-desc">
              Interactive 3D work, live demos, and ambient spatial audio.
            </p>
            <div className="spatial-boot-actions">
              <button
                type="button"
                className="spatial-boot-enter"
                autoFocus
                onClick={() => handleEnterStudio(false)}
              >
                <span className="spatial-audio-bars spatial-boot-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>Enter with sound</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="spatial-boot-muted"
                onClick={() => handleEnterStudio(true)}
              >
                Enter muted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Apple Liquid Glass top bar */}
      <header
        className="spatial-header"
        aria-hidden={theaterOpen || showBootOverlay || undefined}
        inert={theaterOpen || showBootOverlay}
      >
        <Link
          to="/"
          className="spatial-brand"
          onClick={(e) => {
            e.preventDefault();
            handleSectionChange("experience");
          }}
        >
          <span className="spatial-brand__mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" width={34} height={34} />
          </span>
          <span className="spatial-brand__text">
            <strong>Jagger Brulato</strong>
            <small>Staff Engineer</small>
          </span>
        </Link>

        <nav
          ref={navRef}
          className="spatial-nav"
          aria-label="Portfolio sections"
        >
          <span
            className="spatial-nav__indicator"
            style={{
              transform: `translateX(${pillStyle.left}px)`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.width > 0 ? 1 : 0,
            }}
            aria-hidden="true"
          />
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              ref={(el) => {
                navBtnRefs.current[s.id] = el;
              }}
              type="button"
              aria-current={section === s.id ? "page" : undefined}
              onClick={() => handleSectionChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="spatial-header__right">
          <a className="spatial-header__link" href="/files/resume.pdf">
            Résumé
          </a>
          <a
            className="spatial-header__cta"
            href={`mailto:${profileContent.email}`}
          >
            Get in touch <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      {/* Foreground HUD */}
      <main id="explorer-content" className="spatial-hud">
        {/* Contextual editorial hero — completely clears out when an item is selected */}
        <section
          key={section}
          className={`spatial-hero ${selected ? "is-retracted" : ""}`}
          aria-hidden={Boolean(selected)}
          aria-live="polite"
        >
          <p className="spatial-hero__eyebrow">{dynamicEyebrow}</p>
          <h1 className="spatial-hero__title">
            {sectionConfig.headlineTop}
            <br />
            <em>{sectionConfig.headlineAccent}</em>
          </h1>

          {section === "projects" && (
            <div
              className="spatial-categories"
              role="group"
              aria-label="Project categories"
            >
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => handleCategoryChange(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <p className="spatial-hero__desc">
            {hoveredItem ? hoveredItem.subtitle : sectionConfig.description}
          </p>
        </section>

        {/* Focused hero breadcrumb — replaces hero cleanly when inspecting a 120-cube monument */}
        {selected && !theaterOpen && (
          <div className="spatial-focus-badge">
            <button
              type="button"
              className="spatial-back-pill"
              onClick={handleClose}
            >
              ← All {sectionConfig.label.toLowerCase()}
            </button>
            <div className="spatial-focus-caption">
              <span>{selected.eyebrow}</span>
              <strong>{selected.title}</strong>
            </div>
          </div>
        )}

        {/* Sliding Apple Liquid Glass Detail Sheet */}
        {selected && (
          <div className="spatial-sheet-slot">
            <DetailSheet
              item={selected}
              index={Math.max(0, selectedIndex)}
              total={items.length}
              theaterOpen={theaterOpen}
              onTheaterChange={setTheaterOpen}
              onClose={handleClose}
              onStep={handleStep}
            />
          </div>
        )}

        {/* Bottom-left Liquid Glass Music & Sound (SFX) mute controls */}
        {!theaterOpen && (
          <div
            className="spatial-audio-controls"
            role="group"
            aria-label="Audio controls"
          >
            <button
              type="button"
              data-audio-control="music"
              className={`spatial-audio-btn ${audioState.musicMuted ? "is-muted" : audioState.running ? "is-playing" : "is-ready"}`}
              aria-pressed={audioState.musicMuted}
              aria-label={audioState.musicMuted ? "Unmute music" : "Mute music"}
              title={
                audioState.musicMuted
                  ? "Unmute ambient music"
                  : "Mute ambient music"
              }
              onClick={() => soundEngine.toggleMusicMute()}
            >
              <span className="spatial-audio-btn__icon" aria-hidden="true">
                {audioState.musicMuted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <span className="spatial-audio-bars">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </span>
              <span className="spatial-audio-btn__label">Music</span>
            </button>

            <span className="spatial-audio-divider" aria-hidden="true" />

            <button
              type="button"
              data-audio-control="sfx"
              className={`spatial-audio-btn ${audioState.sfxMuted ? "is-muted" : audioState.running ? "is-playing" : "is-ready"}`}
              aria-pressed={audioState.sfxMuted}
              aria-label={audioState.sfxMuted ? "Unmute sound effects" : "Mute sound effects"}
              title={
                audioState.sfxMuted
                  ? "Unmute interface sound effects"
                  : "Mute interface sound effects"
              }
              onClick={() => soundEngine.toggleSfxMute()}
            >
              <span className="spatial-audio-btn__icon" aria-hidden="true">
                {audioState.sfxMuted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="22" y1="9" x2="16" y2="15" />
                    <line x1="16" y1="9" x2="22" y2="15" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </span>
              <span className="spatial-audio-btn__label">Sound</span>
            </button>
          </div>
        )}

        {/* Floating Liquid Glass Bottom Dock with smooth feather masks & wheel scroll */}
        {!theaterOpen && (
          <div className="spatial-dock-wrap">
            <div
              className={`spatial-dock-shell ${dockScroll.left ? "can-left" : ""} ${dockScroll.right ? "can-right" : ""}`}
            >
              {dockScroll.left && (
                <button
                  type="button"
                  className="spatial-dock__chevron spatial-dock__chevron--left"
                  aria-label="Scroll items left"
                  onClick={() =>
                    dockScrollRef.current?.scrollBy({
                      left: -260,
                      behavior: "smooth",
                    })
                  }
                >
                  ‹
                </button>
              )}
              <ul
                ref={dockScrollRef}
                className="spatial-dock"
                aria-label={`${sectionConfig.label} items`}
                onScroll={measureDockOverflow}
                onWheel={(e) => {
                  if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && dockScrollRef.current) {
                    dockScrollRef.current.scrollLeft += e.deltaY;
                  }
                }}
              >
                {items.map((item) => {
                  const isSelected = selected?.slug === item.slug;
                  const isHovered = hoveredSlug === item.slug;
                  return (
                    <li key={item.uid}>
                      <button
                        type="button"
                        data-dock-item={item.slug}
                        className={`spatial-dock__item ${isSelected ? "is-selected" : ""} ${isHovered ? "is-hovered" : ""}`}
                        aria-pressed={isSelected}
                        onMouseEnter={() => handleHover(item.slug)}
                        onMouseLeave={() => handleHover(null)}
                        onFocus={() => handleHover(item.slug)}
                        onBlur={() => handleHover(null)}
                        onClick={() => handleSelect(item.slug)}
                      >
                        <span
                          className="spatial-dock__dot"
                          style={{ backgroundColor: item.palette.primary }}
                          aria-hidden="true"
                        />
                        <span>{item.shortLabel}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {dockScroll.right && (
                <button
                  type="button"
                  className="spatial-dock__chevron spatial-dock__chevron--right"
                  aria-label="Scroll items right"
                  onClick={() =>
                    dockScrollRef.current?.scrollBy({
                      left: 260,
                      behavior: "smooth",
                    })
                  }
                >
                  ›
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
