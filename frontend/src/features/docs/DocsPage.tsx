import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  docProjects,
  getDocProject,
  modes,
  modeInfo,
  type DocMode,
} from "../../content/docs";
import { renderSectionBlock } from "../papers/PaperBlocks";
import ImageViewer from "../papers/ImageViewer";
import DocsHeader from "./DocsHeader";
import DocsSidebar from "./DocsSidebar";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { findDocMatch } from "./docSearch";
import SearchHighlight from "./SearchHighlight";
import { usePapersTheme } from "../papers/usePapersTheme";

export default function DocsPage() {
  const { slug, mode, pageId } = useParams();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const { pathname, hash } = useLocation();
  const project = getDocProject(slug);
  const active = project?.pages.find((p) => p.mode === mode && p.id === pageId);
  const validMode = modes.includes(mode as DocMode);
  const missing =
    !!slug && (!project || (!!mode && !validMode) || (!!pageId && !active));
  const [query, setQuery] = useState("");
  const [openImage, setOpenImage] = useState<null | {
    image: string;
    alt: string;
    caption: string;
  }>(null);
  const { theme, toggleTheme } = usePapersTheme();
  useEffect(() => {
    document.title = `${active?.title ?? project?.name ?? "Project documentation"} · Jagger Docs`;
    setQuery("");
    setOpenImage(null);
    if (hash)
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView(),
      );
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, active?.title, project?.name]);
  const scope = project ? [project] : docProjects;
  const results = scope.flatMap((p) =>
    p.pages.flatMap((page) => {
      const match = findDocMatch(page, query, p.name);
      return match ? [{ project: p, page, ...match }] : [];
    }),
  );
  const pageIndex = active ? project!.pages.indexOf(active) : -1;
  return (
    <div className={`papers-page papers-page--${theme} docs-page`}>
      <DocsHeader
        projectName={project?.name}
        projectSlug={project?.source.slug}
        theme={theme}
        onThemeToggle={toggleTheme}
        sidebar={
          isMobile && project ? (
            <DocsSidebar project={project} active={active} />
          ) : undefined
        }
      />
      <main className="docs-main" id="docs-main">
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <Link to="/docs">Jagger Docs</Link>
          {project && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/docs/${slug}`}>{project.name}</Link>
            </>
          )}
          {validMode && project && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/docs/${slug}/${mode}`}>
                {modeInfo[mode as DocMode].title}
              </Link>
            </>
          )}
          {active && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{active.title}</span>
            </>
          )}
        </nav>
        <div className={project ? "docs-layout" : ""}>
          {project && !isMobile && (
            <DocsSidebar project={project} active={active} />
          )}
          <div className="docs-content">
            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="docs-search"
            >
              <label htmlFor="docs-search">
                {project
                  ? `Search ${project.name} documentation`
                  : "Search all documentation"}
              </label>
              <input
                id="docs-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search syntax, controls, errors, or a task…"
              />
            </form>
            {missing ? (
              <>
                <h1>Documentation page not found</h1>
                <p>This documentation address does not exist.</p>
                <Link to={project ? `/docs/${slug}` : "/docs"}>
                  Browse available documentation →
                </Link>
              </>
            ) : query.trim() ? (
              <>
                <h1>Search results</h1>
                <p role="status">{results.length} matching pages</p>
                <div className="docs-results">
                  {results.map(({ project: p, page, excerpt, blockIndex }) => (
                    <Link
                      key={`${p.source.slug}/${page.mode}/${page.id}`}
                      to={`/docs/${p.source.slug}/${page.mode}/${page.id}${blockIndex >= 0 ? `#block-${blockIndex + 1}` : ""}`}
                    >
                      <small>
                        <SearchHighlight
                          text={`${p.name} · ${modeInfo[page.mode].title}`}
                          query={query}
                        />
                      </small>
                      <strong>
                        <SearchHighlight text={page.title} query={query} />
                      </strong>
                      {excerpt && (
                        <p className="docs-result-excerpt">
                          “<SearchHighlight text={excerpt} query={query} />”
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            ) : active ? (
              <article className="paper-body docs-article">
                <p className="papers-kicker">{modeInfo[active.mode].title}</p>
                <h1>{active.title}</h1>
                <p className="docs-purpose">
                  {modeInfo[active.mode].description}
                </p>
                <nav className="docs-on-page" aria-label="On this page">
                  {active.blocks.map((block, index) =>
                    "label" in block && block.kind !== "doc-link" ? (
                      <a key={index} href={`#block-${index + 1}`}>
                        {block.label}
                      </a>
                    ) : block.kind === "graph" ? (
                      <a key={index} href={`#block-${index + 1}`}>
                        {block.graph.title}
                      </a>
                    ) : null,
                  )}
                </nav>
                <section id={active.id} className="paper-section">
                  {active.blocks.map((block, index) => (
                    <div
                      key={index}
                      id={`block-${index + 1}`}
                      className="docs-block"
                    >
                      {renderSectionBlock(
                        block,
                        index,
                        project!.source.audioSamples,
                        setOpenImage,
                      )}
                    </div>
                  ))}
                </section>
                <nav
                  className="docs-pagination"
                  aria-label="Adjacent documentation"
                >
                  {project!.pages
                    .slice(Math.max(0, pageIndex - 1), pageIndex)
                    .map((p) => (
                      <Link key={p.id} to={`/docs/${slug}/${p.mode}/${p.id}`}>
                        ← {p.title}
                      </Link>
                    ))}
                  {project!.pages
                    .slice(pageIndex + 1, pageIndex + 2)
                    .map((p) => (
                      <Link key={p.id} to={`/docs/${slug}/${p.mode}/${p.id}`}>
                        {p.title} →
                      </Link>
                    ))}
                </nav>
                <div className="docs-related">
                  <h2>Continue exploring</h2>
                  {modes
                    .filter((m) => m !== active.mode)
                    .map((m) => (
                      <Link key={m} to={`/docs/${slug}/${m}`}>
                        {modeInfo[m].title} →
                      </Link>
                    ))}
                  <a
                    href={project!.source.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Source repository →
                  </a>
                </div>
              </article>
            ) : project ? (
              <>
                <p className="papers-kicker">
                  {mode
                    ? modeInfo[mode as DocMode].title
                    : "Project documentation"}
                </p>
                <h1>{project.name}</h1>
                <p className="docs-intro">
                  {mode
                    ? modeInfo[mode as DocMode].description
                    : "Start with a guided exercise, solve a specific task, look up an exact contract, or explore the design."}
                </p>
                {!mode && project.source.previewImage && (
                  <figure className="paper-device-figure">
                    <button
                      className="paper-device-figure__image-button"
                      onClick={() =>
                        setOpenImage({
                          image: project.source.previewImage!,
                          alt: project.source.previewAlt,
                          caption:
                            project.source.previewCaption ?? project.name,
                        })
                      }
                    >
                      <img
                        src={project.source.previewImage}
                        alt={project.source.previewAlt}
                      />
                    </button>
                    <figcaption>{project.source.previewCaption}</figcaption>
                  </figure>
                )}
                <div className="docs-mode-grid">
                  {modes
                    .filter((m) => !mode || m === mode)
                    .map((m) => (
                      <section className="docs-mode-card" key={m}>
                        <h2>
                          <Link to={`/docs/${slug}/${m}`}>
                            {modeInfo[m].title}
                          </Link>
                        </h2>
                        <p>{modeInfo[m].description}</p>
                        {project.pages
                          .filter((p) => p.mode === m)
                          .map((p) => (
                            <Link key={p.id} to={`/docs/${slug}/${m}/${p.id}`}>
                              {p.title} →
                            </Link>
                          ))}
                      </section>
                    ))}
                </div>
              </>
            ) : (
              <>
                <p className="papers-kicker">Implementation &amp; use</p>
                <h1>Jagger Docs</h1>
                <p className="docs-intro">
                  The details behind the projects. Each documentation site
                  separates learning, doing, looking things up, and
                  understanding why.
                </p>
                <div className="docs-orientation">
                  {modes.map((m) => (
                    <div key={m}>
                      <strong>{modeInfo[m].title}</strong>
                      <p>{modeInfo[m].description}</p>
                    </div>
                  ))}
                </div>
                <div className="docs-project-grid">
                  {docProjects.map((p) => (
                    <Link
                      className="docs-project-card"
                      key={p.source.slug}
                      to={`/docs/${p.source.slug}`}
                    >
                      {p.source.previewImage && (
                        <img
                          loading="lazy"
                          src={p.source.previewImage}
                          alt={p.source.previewAlt}
                        />
                      )}
                      <div>
                        <small>{p.source.categories[0]}</small>
                        <h2>{p.name}</h2>
                        <p>{p.source.previewCaption ?? p.source.subtitle}</p>
                        <span>Explore documentation →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      {openImage && (
        <ImageViewer {...openImage} onClose={() => setOpenImage(null)} />
      )}
    </div>
  );
}
