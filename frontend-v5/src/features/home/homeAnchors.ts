import type { ExperienceEntry, ProjectEntry } from "../../types/content";

export function getExperienceCardElementId(entry: ExperienceEntry) {
  return `experience-card-${entry.slug}`;
}

export function getProjectCardElementId(project: ProjectEntry) {
  return `project-card-${project.slug}`;
}

export function parseHomeHash(hash: string) {
  const normalized = hash.replace(/^#/, "").trim();

  if (!normalized) {
    return null;
  }

  const [sectionId, ...rest] = normalized.split("/");
  const cardSlug = rest.join("/").trim();

  if (!cardSlug) {
    return {
      sectionId,
      targetElementId: sectionId
    };
  }

  if (sectionId === "experience") {
    return {
      sectionId,
      cardSlug,
      targetElementId: `experience-card-${cardSlug}`
    };
  }

  if (sectionId === "projects") {
    return {
      sectionId,
      cardSlug,
      targetElementId: `project-card-${cardSlug}`
    };
  }

  return {
    sectionId,
    targetElementId: sectionId
  };
}
