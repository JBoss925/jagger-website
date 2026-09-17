import { Link } from "react-router-dom";
import type {
  PaperAudioSample,
  PaperSectionBlock,
} from "../../content/papers/types";
import PaperGraphFigure from "./PaperGraphs";
import PaperMath from "./PaperMath";
import WetDryAudioPlayer from "./WetDryAudioPlayer";

export function renderSectionBlock(
  block: PaperSectionBlock,
  index: number,
  audioSamples: PaperAudioSample[],
  onOpenImage?: (image: {
    alt: string;
    caption: string;
    image: string;
  }) => void,
) {
  switch (block.kind) {
    case "flow":
      return (
        <figure key={`flow-${index}`} className="project-flow">
          <ol aria-label={block.label}>
            {block.stages.map((stage, i) => (
              <li key={stage}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{stage}</strong>
              </li>
            ))}
          </ol>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>
      );
    case "doc-link":
      return (
        <p key={`${block.kind}-${index}`} className="paper-detail-link">
          {block.href.startsWith("/") ? (
            <Link to={block.href}><span>{block.label} →</span></Link>
          ) : (
            <a href={block.href} target="_blank" rel="noreferrer">
              <span>{block.label} →</span>
            </a>
          )}
        </p>
      );
    case "paragraph":
      return <p key={`${block.kind}-${index}`}>{block.text}</p>;
    case "bullets":
      return (
        <ul key={`${block.kind}-${index}`}>
          {block.items.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      );
    case "example":
      return (
        <figure
          key={`${block.kind}-${block.label}-${index}`}
          className="paper-code-example"
        >
          <pre>
            <code>{block.code}</code>
          </pre>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>
      );
    case "diagram":
      return (
        <figure
          key={`${block.kind}-${block.label}-${index}`}
          className="paper-diagram"
        >
          <pre>{block.body}</pre>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>
      );
    case "image":
      return (
        <figure
          key={`${block.kind}-${block.label}-${index}`}
          className="paper-device-figure paper-inline-image"
        >
          <button
            type="button"
            className="paper-device-figure__image-button"
            onClick={() => {
              onOpenImage?.({
                alt: block.alt,
                caption: `${block.label}. ${block.caption}`,
                image: block.image,
              });
            }}
          >
            <img src={block.image} alt={block.alt} />
          </button>
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>
      );
    case "equation":
      return (
        <figure
          key={`${block.kind}-${block.label}-${index}`}
          className="paper-equation"
        >
          <PaperMath tex={block.tex} block label={block.label} />
          <figcaption>
            <strong>{block.label}.</strong> {block.caption}
          </figcaption>
        </figure>
      );
    case "graph":
      return (
        <PaperGraphFigure
          key={`${block.kind}-${block.graph.kind}-${index}`}
          graph={block.graph}
        />
      );
    case "audio-samples":
      return (
        <div key={`${block.kind}-${index}`} className="paper-audio-grid">
          {audioSamples.map((sample) => (
            <article key={sample.label} className="paper-audio-card">
              <div>
                <span>{sample.source}</span>
                <h3>{sample.label}</h3>
              </div>
              <WetDryAudioPlayer sample={sample} />
            </article>
          ))}
        </div>
      );
  }
}
