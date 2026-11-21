import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
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
  const dragStartY = useRef<number | null>(null);
  const dragStartTime = useRef(0);

  useEffect(() => soundEngine.subscribe(setAudioState), []);

  // Lock background scroll while bottom drawer or résumé viewer is open
  useEffect(() => {
    if (!selected && !resumeOpen) {
      setDragY(0);
      setIsDragging(false);
      setIsClosing(false);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selected, resumeOpen]);

  const dismissDrawerAnimated = () => {
    setIsClosing(true);
    setDragY(window.innerHeight * 0.9);
    window.setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      onClose();
    }, 260);
  };

  const handleDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragStartY.current = e.clientY;
    dragStartTime.current = performance.now();
    setIsDragging(true);

    const onMove = (moveEvent: PointerEvent) => {
      if (dragStartY.current === null) return;
      const dy = moveEvent.clientY - dragStartY.current;
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

      if (dy > 110 || (dy > 45 && velocity > 0.45)) {
        dismissDrawerAnimated();
      } else {
        setDragY(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const eyebrowCount =
    section === "projects" && category !== "all"
      ? `${String(items.length).padStart(2, "0")} OF 13 ARTIFACTS`
      : section === "projects"
        ? `${String(items.length).padStart(2, "0")} ARTIFACTS`
        : section === "library"
          ? `${String(items.length).padStart(2, "0")} VOLUMES`
          : section === "demos"
            ? `${String(items.length).padStart(2, "0")} LIVE APPS`
            : `${String(items.length).padStart(2, "0")} ITEMS`;

  const backdropAlpha = Math.max(0, 1 - dragY / 420);

  return (
    <div className="mobile-portfolio">
      <header className="mobile-header">
        <div className="mobile-header__top">
          <Link
            to="/"
            className="mobile-brand"
            onClick={(e) => {
              e.preventDefault();
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
              onClick={() => onSectionChange(s.id)}
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
          style={{ backgroundColor: "rgba(31, 23, 44, 0.3)" }}
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
            backgroundColor: `rgba(31, 23, 44, ${(0.28 * backdropAlpha).toFixed(3)})`,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismissDrawerAnimated();
          }}
        >
          <div
            className={`mobile-drawer-shell ${theaterOpen ? "is-theater" : ""} ${isDragging ? "is-dragging" : ""} ${isClosing ? "is-closing" : ""}`}
            style={{
              transform: `translate3d(0, ${dragY}px, 0)`,
            }}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
