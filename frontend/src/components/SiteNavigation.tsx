import { Link, useLocation } from "react-router-dom";
import type { SceneSection } from "../types/content";

type SiteNavigationProps = {
  sections: SceneSection[];
  activeSectionId?: string;
};

function sectionHref(pathname: string, sectionId: string) {
  return pathname === "/" ? `#${sectionId}` : `/#${sectionId}`;
}

function SiteNavigation({ sections, activeSectionId }: SiteNavigationProps) {
  const location = useLocation();

  return (
    <header className="site-nav">
      <div className="site-nav__brand">
        <Link to="/" className="site-nav__brand-link">
          <span className="site-nav__brand-mark">JB</span>
          <span>
            <strong>Jagger Brulato</strong>
            <small>full-stack systems builder</small>
          </span>
        </Link>
      </div>

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
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="site-nav__actions">
        <a className="site-nav__button site-nav__button--ghost" href="/files/resume.pdf">
          Resume
        </a>
        <Link className="site-nav__button" to="/jaggerscript">
          Open JaggerScript Playground
        </Link>
      </div>
    </header>
  );
}

export default SiteNavigation;
