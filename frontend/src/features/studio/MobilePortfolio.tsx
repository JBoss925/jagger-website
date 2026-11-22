import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Link } from "react-router-dom";
import { profileContent } from "../../content/profile";
import { clean } from "./content";
import {
  SECTIONS,
  categories,
  getSectionConfig,
  type CategoryId,
  type SectionId,
  type SpatialItem,
} from "./spatialModel";
import { soundEngine } from "./soundEngine";
import DetailSheet from "./DetailSheet";
import type { SkillEvidenceLink } from "../../types/content";

type MobilePortfolioProps = {
  section: SectionId;
  category: CategoryId;
  items: SpatialItem[];
  selected: SpatialItem | null;
  theaterOpen: boolean;
  resumeOpen: boolean;
  onSectionChange: (section: SectionId) => void;
  onCategoryChange: (category: CategoryId) => void;
  onSelect: (slug: string) => void;
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
  onTheaterChange: (open: boolean) => void;
  onOpenContact: () => void;
  onOpenResume: () => void;
  onCloseResume: () => void;
  onNavigateTarget: (target: SkillEvidenceLink["target"]) => void;
};

/**
 * Clean, calm, traditional editorial mobile experience with a full-width
 * native iOS-style swipe-down-to-dismiss bottom drawer.
 */
export default function MobilePortfolio({
  section,
  category,
  items,
  selected,
  theaterOpen,
  resumeOpen,
  onSectionChange,
  onCategoryChange,
  onSelect,
  onClose,
  onStep,
  onTheaterChange,
  onOpenContact,
  onOpenResume,
  onCloseResume,
  onNavigateTarget,
}: MobilePortfolioProps) {
  const cfg = getSectionConfig(section);
  const selectedIndex = selected
    ? items.findIndex((i) => i.slug === selected.slug)
    : -1;

  // Native swipe-down-to-dismiss drawer physics state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [audioState, setAudioState] = useState(() => soundEngine.getState());
  const [viewportRect, setViewportRect] = useState<{ top: number; height: number } | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartTime = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const tabSwipeRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    startTime: number;
    axis: "x" | "y" | null;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    axis: null,
  });
  const drawerSwipeRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    startTime: number;
    axis: "x" | "y" | null;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    axis: null,
  });

  useEffect(() => soundEngine.subscribe(setAudioState), []);

  // Reset drag state immediately whenever the open drawer item changes or closes,
  // and pin the drawer backdrop to window.visualViewport so iOS Safari fast-scroll
  // layout-viewport lag or toolbar collapse never stops the drawer short of the top.
  useLayoutEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    dragStartY.current = null;
    setDragY(0);
    setIsDragging(false);
    setIsClosing(false);

    if (!selected && !resumeOpen) {
      setViewportRect(null);
      return;
    }

    // Halt any ongoing iOS momentum scroll deceleration so layout & visual viewports lock cleanly
    window.scrollTo(0, window.scrollY);

    const syncViewport = () => {
      const vv = window.visualViewport;
      const nextTop = vv ? Math.max(0, Math.round(vv.offsetTop)) : 0;
      const nextHeight = vv ? Math.round(vv.height) : window.innerHeight;
      setViewportRect((prev) =>
        prev && prev.top === nextTop && prev.height === nextHeight
          ? prev
          : { top: nextTop, height: nextHeight },
      );
    };

    syncViewport();
    const raf1 = window.requestAnimationFrame(syncViewport);
    const timer1 = window.setTimeout(syncViewport, 60);
    const timer2 = window.setTimeout(syncViewport, 220);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncViewport);
    vv?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("scroll", syncViewport, { passive: true });

    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehaviorY;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehaviorY = "none";

    return () => {
      window.cancelAnimationFrame(raf1);
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      vv?.removeEventListener("resize", syncViewport);
      vv?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("scroll", syncViewport);
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehaviorY = prevOverscroll;
    };
  }, [selected?.uid, resumeOpen]);

  const dismissDrawerAnimated = () => {
    if (isClosing) return;
    setIsDragging(false);
    setIsClosing(true);
    const fullDrop = Math.max(window.innerHeight, viewportRect?.height ?? 0) + 40;
    setDragY(fullDrop);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    // Do NOT reset dragY to 0 inside the timeout before onClose() unmounts the drawer!
    // Resetting dragY to 0 while selected is still mounted for one render frame caused
    // the drawer to flash back at the top right before disappearing. useLayoutEffect
    // above resets dragY and isClosing cleanly once selected becomes null.
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 260);
  };

  const handleDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const startX = e.clientX;
    dragStartY.current = e.clientY;
    dragStartTime.current = performance.now();
    let draggingStarted = false;

    const onMove = (moveEvent: PointerEvent) => {
      if (dragStartY.current === null) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - dragStartY.current;
      if (!draggingStarted) {
        if (Math.abs(dx) > Math.abs(dy) * 1.15 && Math.abs(dx) > 6) {
          dragStartY.current = null;
          return;
        }
        if (Math.abs(dy) < 5) return;
        draggingStarted = true;
        setIsDragging(true);
      }
      // Allow downward pull freely; gentle rubber-band resistance upward
      setDragY(dy > 0 ? dy : dy * 0.14);
    };

    const onUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (dragStartY.current === null) return;

      const dy = upEvent.clientY - dragStartY.current;
      const dt = Math.max(1, performance.now() - dragStartTime.current);
      const velocity = dy / dt; // px/ms

      dragStartY.current = null;
      setIsDragging(false);

      if (draggingStarted && (dy > 110 || (dy > 45 && velocity > 0.45))) {
        dismissDrawerAnimated();
      } else {
        setDragY(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleBodyPullStart = () => {
    setIsDragging(true);
  };

  const handleBodyPullMove = (dy: number) => {
    setDragY(dy > 0 ? dy : 0);
  };

  const handleBodyPullEnd = (dy: number, velocity: number) => {
    setIsDragging(false);
    if (dy > 95 || (dy > 38 && velocity > 0.38)) {
      dismissDrawerAnimated();
    } else {
      setDragY(0);
    }
  };

  const handlePageTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (selected || resumeOpen || e.touches.length !== 1) {
      tabSwipeRef.current.active = false;
      return;
    }
    const target = e.target;
    if (target instanceof Element) {
      const scroller = target.closest(".mobile-filters, .mobile-nav");
      if (scroller && scroller.scrollWidth > scroller.clientWidth + 4) {
        tabSwipeRef.current.active = false;
        return;
      }
    }
    const t = e.touches[0];
    tabSwipeRef.current = {
      active: true,
      startX: t.clientX,
      startY: t.clientY,
      lastX: t.clientX,
      lastY: t.clientY,
      startTime: performance.now(),
      axis: null,
    };
  };

  const handlePageTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    const st = tabSwipeRef.current;
    if (!st.active || selected || resumeOpen || e.touches.length !== 1) return;
    const t = e.touches[0];
    st.lastX = t.clientX;
    st.lastY = t.clientY;
    const dx = t.clientX - st.startX;
    const dy = t.clientY - st.startY;
    if (st.axis === null) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx) * 0.85) {
        st.axis = "y";
      } else if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        st.axis = "x";
      }
    }
  };

  const handlePageTouchEnd = () => {
    const st = tabSwipeRef.current;
    if (!st.active || selected || resumeOpen) return;
    st.active = false;
    if (st.axis !== "x") return;

    const dx = st.lastX - st.startX;
    const dy = st.lastY - st.startY;
    const dt = Math.max(1, performance.now() - st.startTime);
    const vx = Math.abs(dx) / dt;

    if (
      Math.abs(dx) > Math.abs(dy) * 1.25 &&
      (Math.abs(dx) >= 44 || (Math.abs(dx) >= 26 && vx >= 0.3))
    ) {
      const direction = dx < 0 ? 1 : -1;
      const currIdx = SECTIONS.findIndex((s) => s.id === section);
      const next =
        SECTIONS[(currIdx + direction + SECTIONS.length) % SECTIONS.length];
      if (next && next.id !== section) {
        window.scrollTo({ top: 0, behavior: "instant" });
        onSectionChange(next.id);
      }
    }
  };

  const handlePageTouchCancel = () => {
    tabSwipeRef.current.active = false;
  };

  const handleDrawerTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (!selected || theaterOpen || isClosing || e.touches.length !== 1) {
      drawerSwipeRef.current.active = false;
      return;
    }
    const target = e.target;
    if (target instanceof Element) {
      const scroller = target.closest(".glass-sheet__tabs, .theater-mode-switch");
      if (scroller && scroller.scrollWidth > scroller.clientWidth + 4) {
        drawerSwipeRef.current.active = false;
        return;
      }
    }
    const t = e.touches[0];
    drawerSwipeRef.current = {
      active: true,
      startX: t.clientX,
      startY: t.clientY,
      lastX: t.clientX,
      lastY: t.clientY,
      startTime: performance.now(),
      axis: null,
    };
  };

  const handleDrawerTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    const st = drawerSwipeRef.current;
    if (!st.active || !selected || theaterOpen || isClosing || e.touches.length !== 1) {
      return;
    }
    const t = e.touches[0];
    st.lastX = t.clientX;
    st.lastY = t.clientY;
    const dx = t.clientX - st.startX;
    const dy = t.clientY - st.startY;
    if (st.axis === null) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx) * 0.85) {
        st.axis = "y";
      } else if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        st.axis = "x";
      }
    }
  };

  const handleDrawerTouchEnd = () => {
    const st = drawerSwipeRef.current;
    if (!st.active || !selected || theaterOpen || isClosing) return;
    st.active = false;
    if (st.axis !== "x") return;

    const dx = st.lastX - st.startX;
    const dy = st.lastY - st.startY;
    const dt = Math.max(1, performance.now() - st.startTime);
    const vx = Math.abs(dx) / dt;

    if (
      Math.abs(dx) > Math.abs(dy) * 1.25 &&
      (Math.abs(dx) >= 44 || (Math.abs(dx) >= 26 && vx >= 0.3))
    ) {
      // Swipe left (dx < 0) -> next item (+1); swipe right (dx > 0) -> previous item (-1)
      onStep(dx < 0 ? 1 : -1);
    }
  };

  const handleDrawerTouchCancel = () => {
    drawerSwipeRef.current.active = false;
  };

  const eyebrowCount =
    section === "projects" && category !== "all"
      ? `${String(items.length).padStart(2, "0")} OF ${profileContent.projects.length} ARTIFACTS`
      : section === "projects"
        ? `${String(items.length).padStart(2, "0")} ARTIFACTS`
        : section === "library"
          ? `${String(items.length).padStart(2, "0")} VOLUMES`
          : section === "demos"
            ? `${String(items.length).padStart(2, "0")} LIVE APPS`
            : `${String(items.length).padStart(2, "0")} ITEMS`;

  const fullDropHeight = Math.max(
    typeof window !== "undefined" ? window.innerHeight : 900,
    viewportRect?.height ?? 0,
  ) + 48;
  const renderedDragY = isClosing ? Math.max(dragY, fullDropHeight) : dragY;
  const backdropAlpha = isClosing ? 0 : Math.max(0, 1 - renderedDragY / 420);

  const backdropStyle = viewportRect
    ? {
        top: `${viewportRect.top}px`,
        height: `${viewportRect.height}px`,
        bottom: "auto",
      }
    : undefined;

  return (
    <div
      className="mobile-portfolio"
      onTouchStart={handlePageTouchStart}
      onTouchMove={handlePageTouchMove}
      onTouchEnd={handlePageTouchEnd}
      onTouchCancel={handlePageTouchCancel}
    >
      <header className="mobile-header">
        <div className="mobile-header__top">
          <Link
            to="/"
            className="mobile-brand"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "instant" });
              onSectionChange("experience");
            }}
          >
            <span className="mobile-brand__mark" aria-hidden="true">
              <img src="/favicon.svg" alt="" width={30} height={30} />
            </span>
            <span>Jagger Brulato</span>
          </Link>
          <button
            type="button"
            className="mobile-contact"
            onClick={onOpenContact}
          >
            Get in touch
          </button>
        </div>
        <nav className="mobile-nav" aria-label="Portfolio sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={section === s.id ? "page" : undefined}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "instant" });
                onSectionChange(s.id);
              }}
            >
              {s.id === "experience" ? "Work" : s.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mobile-main" id="explorer-content">
        <section className="mobile-hero">
          <p className="mobile-eyebrow">
            {cfg.eyebrowBase} · {eyebrowCount}
          </p>
          <h1>
            {cfg.headlineTop} <em>{cfg.headlineAccent}</em>
          </h1>
          <p className="mobile-intro">{cfg.mobileDescription}</p>
        </section>

        {section === "projects" && (
          <div
            className="mobile-filters"
            role="group"
            aria-label="Project categories"
          >
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => onCategoryChange(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="mobile-cards">
          {items.map((item) => {
            const img =
              item.payload.kind === "project" ||
              item.payload.kind === "demo" ||
              item.payload.kind === "library"
                ? item.payload.project.image
                : undefined;

            const logo =
              item.payload.kind === "experience"
                ? item.payload.experience.logo
                : undefined;

            return (
              <button
                key={item.uid}
                type="button"
                className="mobile-card"
                onClick={() => onSelect(item.slug)}
              >
                <div className="mobile-card__top">
                  <span
                    className="mobile-card__dot"
                    style={{ backgroundColor: item.palette.primary }}
                    aria-hidden="true"
                  />
                  <span className="mobile-card__eyebrow">{item.eyebrow}</span>
                  {item.badges?.slice(0, 2).map((badge) => (
                    <span key={badge} className="mobile-card__badge">
                      {badge}
                    </span>
                  ))}
                  <span className="mobile-card__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>

                {img && (
                  <div className="mobile-card__image">
                    <img src={img} alt="" loading="lazy" />
                  </div>
                )}

                <div className="mobile-card__heading">
                  {logo && (
                    <img
                      className="mobile-card__logo"
                      src={logo}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.subtitle}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <footer className="mobile-footer">
          <p>{clean(profileContent.title)}</p>
          <div>
            <button
              type="button"
              className="mobile-footer__btn"
              onClick={onOpenResume}
            >
              Résumé
            </button>
            <a href="https://github.com/JBoss925">GitHub</a>
            <a href="https://www.linkedin.com/in/jaggerbrulato/">LinkedIn</a>
            <Link to="/library">Full Library</Link>
          </div>
        </footer>
      </main>

      {!selected && !resumeOpen && (
        <div
          className="spatial-audio-controls spatial-audio-controls--mobile"
          role="group"
          aria-label="Audio controls"
        >
          <button
            type="button"
            data-audio-control="music"
            className={`spatial-audio-btn ${audioState.musicMuted ? "is-muted" : audioState.running ? "is-playing" : "is-ready"}`}
            aria-pressed={audioState.musicMuted}
            aria-label={audioState.musicMuted ? "Unmute music" : "Mute music"}
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
          </button>
          <span className="spatial-audio-divider" aria-hidden="true" />
          <button
            type="button"
            data-audio-control="sfx"
            className={`spatial-audio-btn ${audioState.sfxMuted ? "is-muted" : audioState.running ? "is-playing" : "is-ready"}`}
            aria-pressed={audioState.sfxMuted}
            aria-label={audioState.sfxMuted ? "Unmute sound effects" : "Mute sound effects"}
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
          </button>
        </div>
      )}

      {resumeOpen && (
        <div
          className="mobile-sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Résumé viewer"
          style={{
            ...backdropStyle,
            backgroundColor: "rgba(31, 23, 44, 0.3)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseResume();
          }}
        >
          <div className="mobile-drawer-shell is-theater">
            <aside className="glass-sheet is-theater is-mobile-drawer">
              <div className="theater-slim-bar">
                <div className="theater-slim-bar__left">
                  <button
                    type="button"
                    className="glass-sheet__pill-btn"
                    onClick={onCloseResume}
                  >
                    ← Back
                  </button>
                  <strong className="theater-slim-bar__title">Résumé</strong>
                </div>
                <div className="theater-slim-bar__right">
                  <a
                    className="theater-slim-bar__link"
                    href="/files/resume.pdf"
                    download="Jagger_Brulato_Resume.pdf"
                  >
                    Download ↓
                  </a>
                  <a
                    className="theater-slim-bar__link"
                    href="/files/resume.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Full page ↗
                  </a>
                </div>
              </div>
              <div className="theater-iframe-stage theater-iframe-stage--pdf">
                <iframe
                  src="/files/resume.pdf#view=FitH"
                  title="Jagger Brulato résumé PDF"
                />
              </div>
            </aside>
          </div>
        </div>
      )}

      {!resumeOpen && selected && (
        <div
          className="mobile-sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-drawer-title"
          style={{
            ...backdropStyle,
            backgroundColor: `rgba(31, 23, 44, ${(0.28 * backdropAlpha).toFixed(3)})`,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismissDrawerAnimated();
          }}
        >
          <div
            className={`mobile-drawer-shell ${theaterOpen ? "is-theater" : ""} ${isDragging ? "is-dragging" : ""} ${isClosing ? "is-closing" : ""}`}
            style={{
              transform: `translate3d(0, ${renderedDragY}px, 0)`,
            }}
            onTouchStart={handleDrawerTouchStart}
            onTouchMove={handleDrawerTouchMove}
            onTouchEnd={handleDrawerTouchEnd}
            onTouchCancel={handleDrawerTouchCancel}
          >
            <DetailSheet
              item={selected}
              index={Math.max(0, selectedIndex)}
              total={items.length}
              isMobile
              theaterOpen={theaterOpen}
              onTheaterChange={onTheaterChange}
              onClose={dismissDrawerAnimated}
              onStep={onStep}
              onOpenResume={onOpenResume}
              onNavigateTarget={onNavigateTarget}
              titleId="mobile-drawer-title"
              onDragHandlePointerDown={handleDragStart}
              onBodyPullStart={handleBodyPullStart}
              onBodyPullMove={handleBodyPullMove}
              onBodyPullEnd={handleBodyPullEnd}
            />
          </div>
        </div>
      )}
    </div>
  );
}
