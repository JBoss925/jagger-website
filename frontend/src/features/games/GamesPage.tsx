import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePageReveal } from "../../hooks/usePageReveal";
import type { NavLinkItem } from "../../types/content";

const gameLinks: NavLinkItem[] = [
  { id: "domes", label: "Domes", href: "/games/domes", matchPrefix: "/games/domes" },
  { id: "jordle", label: "Jordle", href: "/games/jordle", matchPrefix: "/games/jordle" },
  { id: "jeardle", label: "Jeardle", href: "/games/jeardle", matchPrefix: "/games/jeardle" }
];

const gameContent = {
  "/games": {
    title: "Small games, daily puzzles, and things I want people to actually play.",
    summary:
      "This is where the games side of the site is going to live. Some will reset every day, some will just be small self-contained projects.",
    cards: [
      {
        title: "Domes",
        text: "A head-to-head strategy game inspired by Santorini. This one already exists and needs a cleaner home."
      },
      {
        title: "Jordle",
        text: "A six-letter daily word game. Same basic intuition as Wordle, just with a slightly different space."
      },
      {
        title: "Jeardle",
        text: "A Heardle-style music game curated by me instead of generated from some generic catalog."
      }
    ]
  },
  "/games/domes": {
    title: "Domes",
    summary:
      "This route will become the cleaned-up home for Domes instead of sending people to the legacy site.",
    cards: [
      {
        title: "Status",
        text: "Placeholder for now. The plan is to bring the board game experience into this site in a way that feels more polished than the old demo."
      }
    ]
  },
  "/games/jordle": {
    title: "Jordle",
    summary:
      "A six-letter daily word game. Same broad family as Wordle, but with a longer guess space and a slightly different feel.",
    cards: [
      {
        title: "Status",
        text: "Placeholder for now. This is where the daily game will go."
      }
    ]
  },
  "/games/jeardle": {
    title: "Jeardle",
    summary:
      "A Heardle-style daily game with songs I choose myself instead of a generic feed.",
    cards: [
      {
        title: "Status",
        text: "Placeholder for now. This route will eventually hold the actual playable version."
      }
    ]
  }
} as const;

function GamesPage() {
  const location = useLocation();
  const isPageReady = usePageReveal();

  const currentContent = useMemo(() => {
    return gameContent[location.pathname as keyof typeof gameContent] ?? gameContent["/games"];
  }, [location.pathname]);

  return (
    <div className={isPageReady ? "page-shell page-shell--ready games-page" : "page-shell page-shell--entering games-page"}>
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>

      <div className="games-nav-shell">
        <header className="games-nav">
          <Link to="/games" className="games-nav__brand">
            <strong>Jagger Games</strong>
          </Link>

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
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
      </div>

      <main className="content-shell games-shell">
        <section className="games-hero">
          <span className="section-heading__eyebrow">Games</span>
          <h1>{currentContent.title}</h1>
          <p>{currentContent.summary}</p>
        </section>

        <section className="games-grid">
          {currentContent.cards.map((card) => (
            <article key={card.title} className="glass-card games-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default GamesPage;
