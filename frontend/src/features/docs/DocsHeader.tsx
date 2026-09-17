import { useEffect, useId, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

type DocsHeaderProps = {
  sidebar?: ReactNode;
  projectName?: string;
  projectSlug?: string;
  theme: "dark" | "light";
  onThemeToggle: () => void;
};

export default function DocsHeader({
  projectName,
  projectSlug,
  theme,
  onThemeToggle,
  sidebar,
}: DocsHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const controlsId = useId();
  const { pathname } = useLocation();
  useEffect(() => setExpanded(false), [pathname]);

  return (
    <header
      className={`docs-header${expanded ? " docs-header--expanded" : ""}`}
    >
      <Link
        className="docs-header__brand"
        to={projectSlug ? `/docs/${projectSlug}` : "/docs"}
        aria-label={
          projectName ? `${projectName} documentation home` : "Jagger Docs home"
        }
      >
        <span className="docs-header__mark" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />
          </svg>
        </span>
        <span className="docs-header__identity">
          <strong>
            {projectName ?? "Jagger"}
            <span> / docs</span>
          </strong>
          <small>
            {projectName
              ? "Project documentation"
              : "Engineering documentation"}
          </small>
        </span>
      </Link>
      <button
        className="docs-header__menu"
        type="button"
        aria-expanded={expanded}
        aria-controls={controlsId}
        aria-label={
          expanded ? "Collapse docs controls" : "Expand docs controls"
        }
        onClick={() => setExpanded((current) => !current)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d={expanded ? "m6 6 12 12M6 18 18 6" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
      <div className="docs-header__controls" id={controlsId}>
        <nav aria-label="Documentation navigation">
          <NavLink to="/docs">All docs</NavLink>
          <NavLink to="/papers">Papers</NavLink>
          <NavLink to="/" end>
            Home
          </NavLink>
        </nav>
        <button
          className="docs-header__theme"
          type="button"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {theme === "dark" ? (
              <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
              </>
            )}
          </svg>
          <span>{theme === "dark" ? "Dark" : "Light"}</span>
        </button>
        {expanded && sidebar}
      </div>
    </header>
  );
}
