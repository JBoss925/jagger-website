import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { usePageReveal } from "../../hooks/usePageReveal";
import GamesNavigation from "./GamesNavigation";
import { DomesIcon, JeardleIcon, JordleIcon } from "./GameIcons";
import { gamesPlaceholderContent } from "./gamesData";

function GameCardIcon({ icon }: { icon: "domes" | "jordle" | "jeardle" }) {
  if (icon === "domes") {
    return <DomesIcon />;
  }

  if (icon === "jordle") {
    return <JordleIcon />;
  }

  return <JeardleIcon />;
}

function GamesPage() {
  const location = useLocation();
  const isPageReady = usePageReveal();
  const isGamesHub = location.pathname === "/games";

  const currentContent = useMemo(() => {
    return (
      gamesPlaceholderContent[location.pathname as keyof typeof gamesPlaceholderContent] ??
      gamesPlaceholderContent["/games"]
    );
  }, [location.pathname]);
  const hasSectionIntro = !isGamesHub && "title" in currentContent;

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
        {isGamesHub ? (
          <section className="games-hero" aria-labelledby="games-hero-title">
            <div className="games-hero__copy">
              <h1 id="games-hero-title">Small games and daily puzzles.</h1>
              <p>
                This is where I put the game-sized projects: daily rituals, strategy ideas, and things people can actually play.
              </p>
            </div>

            <div className="games-hero__art" aria-hidden="true">
              <div className="games-hero__orb games-hero__orb--large" />
              <div className="games-hero__orb games-hero__orb--small" />
              <div className="games-hero__chip games-hero__chip--jordle">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="games-hero__chip games-hero__chip--domes">
                <span />
                <span />
                <span />
              </div>
              <div className="games-hero__chip games-hero__chip--jeardle">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>
        ) : hasSectionIntro ? (
          <section className="games-section-intro" aria-labelledby="games-section-title">
            <span className="section-heading__eyebrow">Game</span>
            <h1 id="games-section-title">{currentContent.title}</h1>
            {currentContent.summary ? <p>{currentContent.summary}</p> : null}
          </section>
        ) : null}

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
