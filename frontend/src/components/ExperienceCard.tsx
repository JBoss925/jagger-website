import type { ExperienceEntry } from "../types/content";
import { renderInlineEmphasis } from "./renderInlineEmphasis";

type ExperienceCardProps = {
  entry: ExperienceEntry;
};

function getCompanyInitials(company: string) {
  const words = company
    .replace(/[^A-Za-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function ExperienceCard({ entry }: ExperienceCardProps) {
  return (
    <article className="experience-card">
      <div className="experience-card__header">
        <div className="experience-card__brand">
          <div className="experience-card__logo-shell" aria-hidden={entry.logo ? undefined : true}>
            {entry.logo ? (
              <img
                className="experience-card__logo"
                src={entry.logo}
                alt={entry.logoAlt ?? `${entry.company} logo`}
                loading="lazy"
              />
            ) : (
              <span className="experience-card__logo-fallback">{getCompanyInitials(entry.company)}</span>
            )}
          </div>
          <p className="experience-card__company">{entry.company}</p>
          <h3>{entry.role}</h3>
        </div>
        <p className="experience-card__meta">
          <span>{entry.timeframe}</span>
          {entry.location ? <span>{entry.location}</span> : null}
        </p>
      </div>
      <p className="experience-card__summary">{renderInlineEmphasis(entry.summary)}</p>
      <ul className="detail-list">
        {entry.highlights.map((highlight) => (
          <li key={highlight}>{renderInlineEmphasis(highlight)}</li>
        ))}
      </ul>
      <div className="chip-row">
        {entry.tags.map((tag) => (
          <span key={tag.label} className={`chip chip--${tag.tone}`}>
            {tag.label}
          </span>
        ))}
      </div>
    </article>
  );
}

export default ExperienceCard;
