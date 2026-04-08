import { useEffect, useId, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import type { NavLinkItem, SceneSection } from "../types/content";
import { useMediaQuery } from "../hooks/useMediaQuery";

type SiteNavigationProps = {
  sections?: SceneSection[];
  navLinks?: NavLinkItem[];
  activeSectionId?: string;
  onSectionNavigate?: (sectionId: string) => void;
  brandTitle?: string;
  brandSubtitle?: string;
  brandHref?: string;
  showActions?: boolean;
};

function sectionHref(pathname: string, sectionId: string) {
  return pathname === "/" ? `#${sectionId}` : `/#${sectionId}`;
}

function SiteNavigation({
  sections = [],
  navLinks,
  activeSectionId,
  onSectionNavigate,
  brandTitle = "Jagger Brulato",
  brandSubtitle = "full-stack systems builder",
  brandHref = "/",
  showActions = true
}: SiteNavigationProps) {
  const location = useLocation();
  const isMobileMenuViewport = useMediaQuery("(max-width: 768px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const resolvedNavLinks: NavLinkItem[] =
    navLinks ??
    sections.map((section) => ({
      id: section.id,
      label: section.label,
      href: sectionHref(location.pathname, section.id)
    }));

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

    if (location.pathname !== brandHref || brandHref !== "/") {
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
        className={[
          "site-nav",
          isMobileMenuViewport ? "is-mobile-nav" : "",
          isMobileMenuViewport && isMenuOpen ? "is-mobile-open" : "",
          showActions ? "" : "site-nav--links-only"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="site-nav__topbar">
          <Link to={brandHref} className="site-nav__brand-link" onClick={handleBrandClick}>
            <span className="site-nav__brand-mark">JB</span>
            <span>
              <strong>{brandTitle}</strong>
              <small>{brandSubtitle}</small>
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
            {resolvedNavLinks.map((item) => {
              const isSectionLink = !navLinks;
              const isActive = isSectionLink
                ? activeSectionId === item.id && location.pathname === "/"
                : location.pathname === item.href ||
                  (!!item.matchPrefix && location.pathname.startsWith(item.matchPrefix));

              return (
                <a
                  key={item.id}
                  className={isActive ? "site-nav__link is-active" : "site-nav__link"}
                  href={item.href}
                  onClick={(event) => {
                    if (isSectionLink) {
                      handleSectionClick(event, item.id);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {showActions ? (
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
          ) : null}
        </div>
      </header>
    </div>
  );
}

export default SiteNavigation;
