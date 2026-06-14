import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getPaperBySlug } from "../../content/papers";
import PaperGraphFigure from "./PaperGraphs";
import PaperMath from "./PaperMath";
import PapersHeader from "./PapersHeader";
import WetDryAudioPlayer from "./WetDryAudioPlayer";
import { usePapersTheme } from "./usePapersTheme";

function PaperPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const paper = getPaperBySlug(slug);
  const { theme, toggleTheme } = usePapersTheme();

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
          navigate(trimmedQuery ? `/papers?q=${encodeURIComponent(trimmedQuery)}` : "/papers");
        }}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="paper-main">
        <article className="paper-document">
          <header className="paper-title-block">
            <Link to="/papers" className="paper-back-link">Jagger Papers</Link>
            <p className="papers-kicker">{paper.categories.join(" / ")}</p>
            <h1>{paper.title}</h1>
            <p className="paper-subtitle">{paper.subtitle}</p>
            <div className="paper-byline">
              <span>{paper.authors.join(", ")}</span>
              <span>{paper.date}</span>
              <a href={paper.repoUrl} target="_blank" rel="noreferrer">Source repository</a>
            </div>
            <div className="paper-tag-row paper-tag-row--title">
              {paper.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </header>

          <section className="paper-abstract" aria-labelledby="paper-abstract-title">
            <h2 id="paper-abstract-title">Abstract</h2>
            <p>{paper.abstract}</p>
          </section>

          {paper.previewImage ? (
            <figure className="paper-device-figure">
              <img src={paper.previewImage} alt={paper.previewAlt} />
              <figcaption>
                <strong>Hearth 1.0 interface.</strong> The current Max for Live device surface used for
                the release preview and paper card.
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
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      <strong>{link.label}</strong>
                      {link.description ? <span>{link.description}</span> : null}
                    </a>
                  ))}
                </div>
              ) : null}
            </aside>

            <div className="paper-body">
              {paper.sections.map((section) => (
                <section key={section.id} id={section.id} className="paper-section">
                  {section.eyebrow ? <p className="paper-section__eyebrow">{section.eyebrow}</p> : null}
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.equations?.map((equation) => (
                    <figure key={equation.label} className="paper-equation">
                      <PaperMath tex={equation.tex} block label={equation.label} />
                      <figcaption>
                        <strong>{equation.label}.</strong> {equation.caption}
                      </figcaption>
                    </figure>
                  ))}
                  {section.graph ? <PaperGraphFigure graph={section.graph} /> : null}
                  {section.kind === "audio-samples" ? (
                    <div className="paper-audio-grid">
                      {paper.audioSamples.map((sample) => (
                        <article key={sample.label} className="paper-audio-card">
                          <div>
                            <span>{sample.source}</span>
                            <h3>{sample.label}</h3>
                          </div>
                          <WetDryAudioPlayer sample={sample} />
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default PaperPage;
