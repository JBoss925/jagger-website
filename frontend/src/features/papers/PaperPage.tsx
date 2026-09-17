import { renderSectionBlock } from "./PaperBlocks";
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { getPaperBySlug, sourceDocuments } from "../../content/papers";
import { docHref } from "../../content/papers/editorial";
import ImageViewer from "./ImageViewer";
import PapersHeader from "./PapersHeader";
import { usePapersTheme } from "./usePapersTheme";
import { usePapersScrollTop } from "./usePapersScrollTop";
function PaperPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [openImage, setOpenImage] = useState<null | {
    alt: string;
    caption: string;
    image: string;
  }>(null);
  const paper = getPaperBySlug(slug);
  const { theme, toggleTheme } = usePapersTheme();
  usePapersScrollTop();
  useEffect(() => {
    if (!paper || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    if (paper.sections.some((section) => section.id === id)) {
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView(),
      );
    } else if (
      sourceDocuments
        .find((source) => source.slug === slug)
        ?.sections.some((section) => section.id === id)
    ) {
      navigate(docHref(paper.slug, id), { replace: true });
    }
  }, [hash, paper, slug, navigate]);
  if (!paper) {
    return <Navigate to="/papers" replace />;
  }
  return (
    <div className={`papers-page papers-page--${theme}`}>
      <PapersHeader
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSearchSubmit={(query) => {
          const trimmedQuery = query.trim();
          navigate(
            trimmedQuery
              ? `/papers?q=${encodeURIComponent(trimmedQuery)}`
              : "/papers",
          );
        }}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="paper-main">
        <article className="paper-document">
          <header className="paper-title-block">
            <Link to="/papers" className="paper-back-link">
              Jagger Papers
            </Link>
            <p className="papers-kicker">{paper.categories.join(" / ")}</p>
            <h1>{paper.title}</h1>
            <p className="paper-subtitle">{paper.subtitle}</p>
            <div className="paper-byline">
              <span>{paper.authors.join(", ")}</span>
              <span>{paper.date}</span>
              <Link to={`/docs/${paper.slug}`}>Project documentation</Link>
              <a href={paper.repoUrl} target="_blank" rel="noreferrer">
                Source repository
              </a>
            </div>
            <div className="paper-tag-row paper-tag-row--title">
              {paper.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </header>

          <section
            className="paper-abstract"
            aria-labelledby="paper-abstract-title"
          >
            <h2 id="paper-abstract-title">Abstract</h2>
            <p>{paper.abstract}</p>
          </section>

          {paper.previewImage ? (
            <figure className="paper-device-figure">
              <button
                type="button"
                className="paper-device-figure__image-button"
                onClick={() => {
                  setOpenImage({
                    alt: paper.previewAlt ?? "Paper preview",
                    caption: paper.previewCaption ?? paper.title,
                    image: paper.previewImage ?? "",
                  });
                }}
              >
                <img src={paper.previewImage} alt={paper.previewAlt} />
              </button>
              <figcaption>
                {paper.previewCaption ?? paper.previewAlt}
              </figcaption>
            </figure>
          ) : null}

          <div className="paper-layout">
            <aside className="paper-toc" aria-label="Paper sections">
              <strong>Contents</strong>
              {paper.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.eyebrow ? `${section.eyebrow}. ` : null}
                  {section.title}
                </a>
              ))}
              {paper.actionLinks?.length ? (
                <div className="paper-action-links">
                  {paper.actionLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <strong>{link.label}</strong>
                      {link.description ? (
                        <span>{link.description}</span>
                      ) : null}
                    </a>
                  ))}
                </div>
              ) : null}
            </aside>

            <div className="paper-body">
              {paper.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="paper-section"
                >
                  {section.eyebrow ? (
                    <p className="paper-section__eyebrow">{section.eyebrow}</p>
                  ) : null}
                  <h2>{section.title}</h2>
                  {section.blocks.map((block, index) =>
                    renderSectionBlock(
                      block,
                      index,
                      paper.audioSamples,
                      setOpenImage,
                    ),
                  )}
                </section>
              ))}
            </div>
          </div>
        </article>
      </main>
      {openImage ? (
        <ImageViewer
          alt={openImage.alt}
          caption={openImage.caption}
          image={openImage.image}
          onClose={() => setOpenImage(null)}
        />
      ) : null}
    </div>
  );
}
export default PaperPage;
