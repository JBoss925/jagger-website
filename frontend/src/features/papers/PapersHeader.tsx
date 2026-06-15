import { useId, useState } from "react";
import { Link } from "react-router-dom";

type PapersHeaderProps = {
  query?: string;
  onQueryChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
};

function PapersHeader({
  query,
  onQueryChange,
  onSearchSubmit,
  theme,
  onThemeToggle
}: PapersHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const controlsId = useId();

  return (
    <header className={`papers-header${isExpanded ? " papers-header--expanded" : ""}`}>
      <Link className="papers-header__brand" to="/papers" aria-label="Jagger Papers home">
        <span className="papers-header__mark" aria-hidden="true" />
        <span>
          <strong>Jagger Papers</strong>
          <small>Technical notes &amp; papers</small>
        </span>
      </Link>

      <button
        type="button"
        className="papers-header__menu"
        aria-expanded={isExpanded}
        aria-controls={controlsId}
        aria-label={isExpanded ? "Collapse papers controls" : "Expand papers controls"}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <div className="papers-header__tools" id={controlsId}>
        {onQueryChange ? (
          <form
            className="papers-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit?.(query ?? "");
            }}
          >
            <label htmlFor="papers-search-input">Search papers</label>
            <input
              id="papers-search-input"
              type="search"
              value={query ?? ""}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by title, tag, or category"
            />
          </form>
        ) : null}
        <button
          type="button"
          className="papers-theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span aria-hidden="true" />
          {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
    </header>
  );
}

export default PapersHeader;
