import type { ProjectEntry } from "../types/content";

type ProjectCardProps = {
  project: ProjectEntry;
};

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
      <img src={project.image} alt={`${project.title} preview`} className="project-card__image" />
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
            <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
