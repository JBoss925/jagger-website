import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getPaperBySlug } from "../../content/papers";
import type { PaperAudioSample, PaperSectionBlock } from "../../content/papers/types";
import ImageViewer from "./ImageViewer";
import PaperGraphFigure from "./PaperGraphs";
import PaperMath from "./PaperMath";
import PapersHeader from "./PapersHeader";
import WetDryAudioPlayer from "./WetDryAudioPlayer";
import { usePapersTheme } from "./usePapersTheme";
import { usePapersScrollTop } from "./usePapersScrollTop";
function PaperPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [openImage, setOpenImage] = useState<null | {
        alt: string;
        caption: string;
        image: string;
    }>(null);
    const paper = getPaperBySlug(slug);
    const { theme, toggleTheme } = usePapersTheme();
    usePapersScrollTop();
    if (!paper) {
        return <Navigate to="/papers" replace/>;
    }
    return (<div className={`papers-page papers-page--${theme}`}>
      <PapersHeader query={searchQuery} onQueryChange={setSearchQuery} onSearchSubmit={(query) => {
            const trimmedQuery = query.trim();
            navigate(trimmedQuery ? `/papers?q=${encodeURIComponent(trimmedQuery)}` : "/papers");
        }} theme={theme} onThemeToggle={toggleTheme}/>

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
              {paper.tags.map((tag) => (<span key={tag}>{tag}</span>))}
            </div>
          </header>

          <section className="paper-abstract" aria-labelledby="paper-abstract-title">
            <h2 id="paper-abstract-title">Abstract</h2>
            <p>{paper.abstract}</p>
          </section>

          {paper.previewImage ? (<figure className="paper-device-figure">
              <button type="button" className="paper-device-figure__image-button" onClick={() => {
                setOpenImage({
                    alt: paper.previewAlt ?? "Paper preview",
                    caption: paper.previewCaption ?? paper.title,
                    image: paper.previewImage ?? ""
                });
            }}>
                <img src={paper.previewImage} alt={paper.previewAlt}/>
              </button>
              <figcaption>
                {paper.previewCaption ?? paper.previewAlt}
              </figcaption>
            </figure>) : null}

          <div className="paper-layout">
            <aside className="paper-toc" aria-label="Paper sections">
              <strong>Contents</strong>
              {paper.sections.map((section) => (<a key={section.id} href={`#${section.id}`}>
                  {section.eyebrow ? `${section.eyebrow}. ` : null}
                  {section.title}
                </a>))}
              {paper.actionLinks?.length ? (<div className="paper-action-links">
                  {paper.actionLinks.map((link) => (<a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      <strong>{link.label}</strong>
                      {link.description ? <span>{link.description}</span> : null}
                    </a>))}
                </div>) : null}
            </aside>

            <div className="paper-body">
              {paper.sections.map((section) => (<section key={section.id} id={section.id} className="paper-section">
                  {section.eyebrow ? <p className="paper-section__eyebrow">{section.eyebrow}</p> : null}
                  <h2>{section.title}</h2>
                  {section.blocks.map((block, index) => renderSectionBlock(block, index, paper.audioSamples, setOpenImage))}
                </section>))}
            </div>
          </div>
        </article>
      </main>
      {openImage ? (<ImageViewer alt={openImage.alt} caption={openImage.caption} image={openImage.image} onClose={() => setOpenImage(null)}/>) : null}
    </div>);
}
function renderSectionBlock(
    block: PaperSectionBlock,
    index: number,
    audioSamples: PaperAudioSample[],
    onOpenImage?: (image: { alt: string; caption: string; image: string }) => void
) {
    switch (block.kind) {
        case "paragraph":
            return <p key={`${block.kind}-${index}`}>{block.text}</p>;
        case "bullets":
            return (<ul key={`${block.kind}-${index}`}>
          {block.items.map((bullet) => (<li key={bullet}>{bullet}</li>))}
        </ul>);
        case "example":
            return (<figure key={`${block.kind}-${block.label}-${index}`} className="paper-code-example">
          <pre><code>{block.code}</code></pre>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>);
        case "diagram":
            return (<figure key={`${block.kind}-${block.label}-${index}`} className="paper-diagram">
          <pre>{block.body}</pre>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>);
        case "image":
            return (<figure key={`${block.kind}-${block.label}-${index}`} className="paper-device-figure paper-inline-image">
          <button type="button" className="paper-device-figure__image-button" onClick={() => {
                    onOpenImage?.({
                        alt: block.alt,
                        caption: `${block.label}. ${block.caption}`,
                        image: block.image
                    });
                }}>
            <img src={block.image} alt={block.alt}/>
          </button>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>);
        case "equation":
            return (<figure key={`${block.kind}-${block.label}-${index}`} className="paper-equation">
          <PaperMath tex={block.tex} block label={block.label}/>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>);
        case "graph":
            return <PaperGraphFigure key={`${block.kind}-${block.graph.kind}-${index}`} graph={block.graph}/>;
        case "audio-samples":
            return (<div key={`${block.kind}-${index}`} className="paper-audio-grid">
          {audioSamples.map((sample) => (<article key={sample.label} className="paper-audio-card">
              <div>
                <span>{sample.source}</span>
                <h3>{sample.label}</h3>
              </div>
              <WetDryAudioPlayer sample={sample}/>
            </article>))}
        </div>);
    }
}
export default PaperPage;
