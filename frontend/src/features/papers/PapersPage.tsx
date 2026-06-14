import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { papers } from "../../content/papers";
import PaperPreview from "./PaperPreview";
import PapersHeader from "./PapersHeader";
import { usePapersTheme } from "./usePapersTheme";

function PapersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { theme, toggleTheme } = usePapersTheme();

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return papers;
    }

    return papers.filter((paper) => {
      const searchable = [
        paper.title,
        paper.subtitle,
        paper.description,
        paper.abstract,
        ...paper.categories,
        ...paper.tags
      ].join(" ").toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  function updateQuery(nextQuery: string) {
    const trimmedQuery = nextQuery.trim();
    setSearchParams(trimmedQuery ? { q: trimmedQuery } : {});
  }

  return (
    <div className={`papers-page papers-page--${theme}`}>
      <PapersHeader
        query={query}
        onQueryChange={updateQuery}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="papers-main">
        <section className="papers-index-intro">
          <p className="papers-kicker">Technical works</p>
          <h1>Jagger Papers</h1>
          <p>
            Project papers, implementation notes, and technical writeups rendered as first-class web pages
            with equations, native figures, tags, and future media samples.
          </p>
        </section>

        <section className="papers-grid" aria-label="Papers">
          {filteredPapers.map((paper) => (
            <Link key={paper.slug} to={`/papers/${paper.slug}`} className="paper-card">
              <PaperPreview />
              <div className="paper-card__body">
                <div className="paper-card__meta">
                  <span>{paper.date}</span>
                  <span>{paper.categories[0]}</span>
                </div>
                <h2>{paper.title}</h2>
                <p>{paper.description}</p>
                <div className="paper-tag-row">
                  {paper.tags.slice(0, 5).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </section>

        {filteredPapers.length === 0 ? (
          <p className="papers-empty">No papers match that search.</p>
        ) : null}
      </main>
    </div>
  );
}

export default PapersPage;
