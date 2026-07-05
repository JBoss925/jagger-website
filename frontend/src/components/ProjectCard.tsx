import type { ProjectEntry } from "../types/content";
import { getLinkToneClass, inferChipTone, sortChipLabels } from "./pillTones";
import { renderInlineEmphasis } from "./renderInlineEmphasis";
import {
  DomesIcon,
  GeneticIcon,
  JaggerScriptIcon,
  JolorIcon,
  JordleIcon,
  MaterializeIcon,
  OJamlIcon,
  RengineIcon,
  TsxLightIcon,
  TypingEffectIcon
} from "../features/games/GameIcons";

type ProjectCardProps = {
  project: ProjectEntry;
  id?: string;
};

function ProjectCard({ project, id }: ProjectCardProps) {
  const className = [
    "glass-card",
    "project-card",
    project.slug === "jagger-games" ? "project-card--wide" : null
  ].filter(Boolean).join(" ");

  function getRelatedLinkClass(label: string) {
    return [
      "project-card__related-link",
      `project-card__related-link--${label.toLowerCase()}`
    ].join(" ");
  }

  function isPrimaryLink(label: string, href: string) {
    const normalized = label.toLowerCase();
    if (normalized.includes("npm")) {
      return true;
    }

    if (normalized.includes("source") || normalized.includes("reference")) {
      return false;
    }

    return (
      normalized.includes("open") ||
      normalized.includes("download") ||
      normalized.includes("play") ||
      normalized.includes("demo") ||
      normalized.includes("game") ||
      href.startsWith("/")
    );
  }

  function renderProjectIcon() {
    switch (project.icon) {
      case "domes":
        return <DomesIcon />;
      case "jordle":
        return <JordleIcon />;
      case "jolor":
        return <JolorIcon />;
      case "genetic":
        return <GeneticIcon />;
      case "jaggerscript":
        return <JaggerScriptIcon />;
      case "ojaml":
        return <OJamlIcon />;
      case "materialize":
        return <MaterializeIcon />;
      case "tsxlight":
        return <TsxLightIcon />;
      case "rengine":
        return <RengineIcon />;
      case "typing-effect":
        return <TypingEffectIcon />;
      default:
        return null;
    }
  }

  return (
    <article id={id} className={className}>
      {project.image ? (
        <img src={project.image} alt={`${project.title} preview`} className="project-card__image" />
      ) : (
        <div className={`project-card__image project-card__image--icon project-card__image--${project.icon ?? "default"}`} aria-hidden="true">
          <div className="project-card__icon-wrap">{renderProjectIcon()}</div>
        </div>
      )}
      <div className="project-card__content">
        <h3>{project.title}</h3>
        <p>{renderInlineEmphasis(project.description)}</p>
        <p className="project-card__impact">{renderInlineEmphasis(project.impact)}</p>
        {project.relatedLinks ? (
          <div className="project-card__related-links">
            {project.relatedLinks.map((link) => (
              <a key={link.href} href={link.href} className={getRelatedLinkClass(link.label)}>
                <strong>{link.label}</strong>
                <span>{link.description}</span>
              </a>
            ))}
          </div>
        ) : null}
        <div className="chip-row">
          {sortChipLabels(project.stack).map((item) => (
            <span key={item} className={`chip chip--${inferChipTone(item)}`}>
              {item}
            </span>
          ))}
        </div>
        <div className="project-card__links">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`project-card__link ${getLinkToneClass(
                link.label,
                link.href,
                isPrimaryLink(link.label, link.href)
              )}`}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
