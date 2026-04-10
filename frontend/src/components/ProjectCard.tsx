import type { ProjectEntry } from "../types/content";
import {
  DomesIcon,
  GeneticIcon,
  IdolIcon,
  JaggerScriptIcon,
  JolorIcon,
  JordleIcon,
  MaterializeIcon,
  RengineIcon,
  TsxLightIcon,
  TypingEffectIcon
} from "../features/games/GameIcons";

type ProjectCardProps = {
  project: ProjectEntry;
};

function ProjectCard({ project }: ProjectCardProps) {
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
      case "materialize":
        return <MaterializeIcon />;
      case "tsxlight":
        return <TsxLightIcon />;
      case "rengine":
        return <RengineIcon />;
      case "typing-effect":
        return <TypingEffectIcon />;
      case "idol":
        return <IdolIcon />;
      default:
        return null;
    }
  }

  return (
    <article className="project-card">
      {project.image ? (
        <img src={project.image} alt={`${project.title} preview`} className="project-card__image" />
      ) : (
        <div className={`project-card__image project-card__image--icon project-card__image--${project.icon ?? "default"}`} aria-hidden="true">
          <div className="project-card__icon-wrap">{renderProjectIcon()}</div>
        </div>
      )}
      <div className="project-card__content">
        <p className="project-card__slug">{project.slug}</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p className="project-card__impact">{project.impact}</p>
        <div className="chip-row">
          {project.stack.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
        <div className="project-card__links">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={isPrimaryLink(link.label, link.href) ? "project-card__link project-card__link--primary" : "project-card__link"}
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
