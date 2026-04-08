import { useEffect, useId, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import type { SceneSection } from "../types/content";
import { useMediaQuery } from "../hooks/useMediaQuery";

type SiteNavigationProps = {
  sections: SceneSection[];
  activeSectionId?: string;
  onSectionNavigate?: (sectionId: string) => void;
};

function sectionHref(pathname: string, sectionId: string) {
  return pathname === "/" ? `#${sectionId}` : `/#${sectionId}`;
}

function SiteNavigation({ sections, activeSectionId, onSectionNavigate }: SiteNavigationProps) {
  const location = useLocation();
  const isMobileMenuViewport = useMediaQuery("(max-width: 768px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!isMobileMenuViewport) {
      setIsMenuOpen(false);
    }
  }, [isMobileMenuViewport]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  const isMenuExpanded = !isMobileMenuViewport || isMenuOpen;

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    if (!onSectionNavigate || location.pathname !== "/") {
      return;
    }

    event.preventDefault();

    if (isMobileMenuViewport && isMenuOpen) {
      setIsMenuOpen(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onSectionNavigate(sectionId);
        });
      });
      return;
    }

    onSectionNavigate(sectionId);
  };

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);

    if (location.pathname !== "/") {
      return;
    }

    event.preventDefault();
    window.history.replaceState(null, "", "/#hero");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div
      className={
        isMobileMenuViewport
          ? isMenuOpen
            ? "site-nav-shell is-mobile-open"
            : "site-nav-shell"
          : "site-nav-shell"
      }
    >
      <header
        className={
          isMobileMenuViewport
            ? isMenuOpen
              ? "site-nav is-mobile-nav is-mobile-open"
              : "site-nav is-mobile-nav"
            : "site-nav"
        }
      >
        <div className="site-nav__topbar">
          <Link to="/" className="site-nav__brand-link" onClick={handleBrandClick}>
            <span className="site-nav__brand-mark">JB</span>
            <span>
              <strong>Jagger Brulato</strong>
              <small>full-stack systems builder</small>
            </span>
          </Link>

          {isMobileMenuViewport ? (
            <button
              type="button"
              className={isMenuOpen ? "site-nav__toggle is-open" : "site-nav__toggle"}
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>
          ) : null}
        </div>

        <div
          id={menuId}
          className={isMenuExpanded ? "site-nav__menu is-open" : "site-nav__menu"}
        >
          <nav className="site-nav__links" aria-label="Primary">
            {sections.map((section) => (
              <a
                key={section.id}
                className={
                  activeSectionId === section.id && location.pathname === "/"
                    ? "site-nav__link is-active"
                    : "site-nav__link"
                }
                href={sectionHref(location.pathname, section.id)}
                onClick={(event) => handleSectionClick(event, section.id)}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="site-nav__actions">
            <a
              className="site-nav__button site-nav__button--ghost"
              href="/files/resume.pdf"
              onClick={() => setIsMenuOpen(false)}
            >
              Resume
            </a>
            <Link className="site-nav__button" to="/jaggerscript" onClick={() => setIsMenuOpen(false)}>
              Open JaggerScript Playground
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

export default SiteNavigation;
