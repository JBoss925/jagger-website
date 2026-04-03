import type { ExperienceEntry } from "../types/content";

type ExperienceCardProps = {
  entry: ExperienceEntry;
};

function ExperienceCard({ entry }: ExperienceCardProps) {
  return (
    <article className="experience-card">
      <div className="experience-card__header">
        <div>
          <p className="experience-card__company">{entry.company}</p>
          <h3>{entry.role}</h3>
        </div>
        <p className="experience-card__meta">
          <span>{entry.timeframe}</span>
          {entry.location ? <span>{entry.location}</span> : null}
        </p>
      </div>
      <p className="experience-card__summary">{entry.summary}</p>
      <ul className="detail-list">
        {entry.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className="chip-row">
        {entry.tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default ExperienceCard;
