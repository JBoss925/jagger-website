import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { gameLinks } from "./gamesData";

function GamesNavigation() {
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
  }, [location.pathname]);

  return (
    <div className={isMobileMenuViewport && isMenuOpen ? "games-nav-shell is-mobile-open" : "games-nav-shell"}>
      <header className={isMobileMenuViewport ? "games-nav is-mobile-nav" : "games-nav"}>
        <div className="games-nav__topbar">
          <Link to="/games" className="games-nav__brand">
            <span className="games-nav__brand-mark" aria-hidden="true">
              <span className="games-nav__brand-shape games-nav__brand-shape--gold" />
              <span className="games-nav__brand-shape games-nav__brand-shape--teal" />
              <span className="games-nav__brand-shape games-nav__brand-shape--ink" />
            </span>
            <strong>Jagger Games</strong>
          </Link>

          {isMobileMenuViewport ? (
            <button
              type="button"
              className={isMenuOpen ? "games-nav__toggle is-open" : "games-nav__toggle"}
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={isMenuOpen ? "Close games menu" : "Open games menu"}
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
          className={isMobileMenuViewport ? (isMenuOpen ? "games-nav__menu is-open" : "games-nav__menu") : "games-nav__menu is-open"}
        >
          <nav className="games-nav__links" aria-label="Games navigation">
            {gameLinks.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (!!item.matchPrefix && location.pathname.startsWith(item.matchPrefix));

              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={isActive ? "games-nav__link is-active" : "games-nav__link"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </div>
  );
}

export default GamesNavigation;
