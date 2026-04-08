import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { usePageReveal } from "../../hooks/usePageReveal";
import GamesNavigation from "./GamesNavigation";
import { gamesPlaceholderContent } from "./gamesData";

function GameCardIcon({ icon }: { icon: "domes" | "jordle" | "jeardle" }) {
  if (icon === "domes") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M9 31 24 12l15 19" />
        <path d="M15 31v6h18v-6" />
        <path d="M20 24h8" />
      </svg>
    );
  }

  if (icon === "jordle") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="8" width="12" height="12" rx="3" />
        <rect x="28" y="8" width="12" height="12" rx="3" />
        <rect x="8" y="28" width="12" height="12" rx="3" />
        <path d="M30 30h8v8h-8z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 30a12 12 0 1 1 24 0" />
      <path d="M16 30h16" />
      <path d="M18 18v4M24 16v6M30 18v4" />
    </svg>
  );
}

function GamesPage() {
  const location = useLocation();
  const isPageReady = usePageReveal();

  const currentContent = useMemo(() => {
    return (
      gamesPlaceholderContent[location.pathname as keyof typeof gamesPlaceholderContent] ??
      gamesPlaceholderContent["/games"]
    );
  }, [location.pathname]);

  return (
    <div
      className={
        isPageReady
          ? "page-shell page-shell--ready games-page"
          : "page-shell page-shell--entering games-page"
      }
    >
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>

      <GamesNavigation />

      <main className="content-shell games-shell">
        <section className="games-grid">
          {currentContent.cards.map((card) => (
            <Link key={card.title} to={card.href} className="glass-card games-card games-card--link">
              <div className={`games-card__icon games-card__icon--${card.icon}`}>
                <GameCardIcon icon={card.icon} />
              </div>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
              <span className="games-card__meta">Open game</span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

export default GamesPage;
