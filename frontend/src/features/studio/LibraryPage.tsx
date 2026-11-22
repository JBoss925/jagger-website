import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { libraryCatalog } from "@jagger-ui/content/libraryCatalog";
import { SITE_URLS, docsUrl, papersUrl } from "@jagger-ui/urls";
import { StudioHeader, StudioFooter } from "./StudioShell";
import { clean, projects, summaries, views } from "./content";
import "./studio.css";
const filters = ["All work", "Papers", "Documentation", "Demos"] as const;
export default function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const filter = filters.find((f) => f === params.get("type")) ?? "All work";
  useEffect(() => {
    document.title = "Library — Jagger Brulato";
    window.scrollTo(0, 0);
  }, []);
  const shown = projects.filter((p) => {
    const hasPaper = libraryCatalog.some((paper) => paper.slug === p.slug);
    const hasDemo = p.links.some(
      (l) => !/source|paper|reference/i.test(l.label),
    );
    return (
      (filter === "All work" || (filter === "Demos" ? hasDemo : hasPaper)) &&
      `${p.title} ${clean(p.description)} ${p.stack.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  });
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <div className="studio-page">
      <StudioHeader />
      <main id="main-content" className="studio-library">
        <Link to="/" className="library-back">
          ← Back to the portfolio
        </Link>
        <p className="studio-eyebrow">THE WORK, OPENED UP</p>
        <h1>The library.</h1>
        <p className="library-intro">
          A closer look at how things work.
          <br />
          Projects, papers, documentation, and experiments — together.
        </p>
        <div className="library-toolbar">
          <div role="group" aria-label="Filter library">
            {filters.map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => update("type", f === "All work" ? "" : f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label>
            <span className="sr-only">Search library</span>
            <input
              type="search"
              placeholder="Search the collection…"
              value={query}
              onChange={(e) => update("q", e.target.value)}
            />
            <span aria-hidden="true">⌕</span>
          </label>
        </div>
        <p className="library-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? "project" : "projects"}
        </p>
        <div className="library-grid">
          {shown.map((p) => {
            const paper = libraryCatalog.find((paper) => paper.slug === p.slug);
            return (
              <article key={p.slug}>
                <span className="studio-eyebrow">
                  {p.stack.slice(0, 2).join(" / ")}
                </span>
                <h2>
                  {p.title === "Portfolio Site" ? "Portfolio Views" : p.title}
                </h2>
                <p>{summaries[p.slug] ?? clean(p.description)}</p>
                <div className="library-project-links">
                  {paper && (
                    <>
                      <a href={papersUrl(`/${p.slug}`)}>
                        Read paper <span>↗</span>
                      </a>
                      <a href={docsUrl(`/${p.slug}`)}>
                        Documentation <span>↗</span>
                      </a>
                    </>
                  )}
                  {p.slug === "portfolio-site" ? (
                    <>
                      {views.map((v) => (
                        <a href={v.href} key={v.href}>
                          {v.title} view <span>↗</span>
                        </a>
                      ))}
                      {p.links
                        .filter((l) => l.label === "Source")
                        .map((l) => (
                          <a href={l.href} key={l.href}>
                            Source <span>↗</span>
                          </a>
                        ))}
                    </>
                  ) : (
                    p.links
                      .filter(
                        (l) =>
                          !l.href.startsWith("/papers/") &&
                          !l.href.startsWith(SITE_URLS.papers),
                      )
                      .map((l) => (
                        <a href={l.href} key={l.href}>
                          {l.label.replace("Open ", "")} <span>↗</span>
                        </a>
                      ))
                  )}
                  {p.slug !== "portfolio-site" &&
                    p.relatedLinks?.map((l) => (
                      <a key={l.href} href={l.href}>
                        {l.label} <span>↗</span>
                      </a>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
        {shown.length === 0 && (
          <div className="library-empty">
            <h2>No projects found.</h2>
            <p>Try another search or browse all work.</p>
            <button onClick={() => setParams({})}>Clear filters ↗</button>
          </div>
        )}
      </main>
      <StudioFooter />
    </div>
  );
}
