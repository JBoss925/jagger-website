import { SITE_URLS, docsUrl, papersUrl } from "@jagger-ui/urls";
import type { ProjectEntry } from "../../types/content";
import { clean, projects, views } from "./content";

export const categories = [
  { id: "all", label: "All work" },
  { id: "languages", label: "Languages" },
  { id: "systems", label: "Systems" },
  { id: "play", label: "Play" },
  { id: "interfaces", label: "Interfaces" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type ProjectCategory = Exclude<CategoryId, "all">;
export type ProjectResource = {
  kind:
    | "demo"
    | "paper"
    | "docs"
    | "source"
    | "download"
    | "reference"
    | "view"
    | "game";
  label: string;
  href: string;
};

const projectCategories: Record<string, ProjectCategory> = {
  ojaml: "languages",
  jaggerscript: "languages",
  chains: "languages",
  "aixc-compressor": "systems",
  risk: "systems",
  rengine: "systems",
  "tsxlight-renderer": "systems",
  hearth: "systems",
  "genetic-ts": "play",
  "jagger-games": "play",
  "random-arena": "play",
  liveboard: "interfaces",
  jetstream: "interfaces",
  "portfolio-site": "interfaces",
};

export function categoryFor(project: ProjectEntry): ProjectCategory {
  return projectCategories[project.slug] ?? "systems";
}

function extractPaperSlug(href: string): string | null {
  const prefixes = [`${SITE_URLS.papers}/`, "https://papers.jaggerbrulato.com/", "/papers/"];
  for (const prefix of prefixes) {
    if (href.startsWith(prefix)) {
      const rest = href.slice(prefix.length).replace(/\/+$/, "");
      if (rest && !rest.includes("/") && !rest.includes("?") && !rest.includes("#")) {
        return rest;
      }
    }
  }
  return null;
}

// Read paper slugs from the lightweight shared project metadata. Importing the
// full manuscripts here would put every essay in the explorer's initial bundle.
const paperSlugs = new Set(
  projects.flatMap((project) =>
    project.links.flatMap((link) => {
      const slug = extractPaperSlug(link.href);
      return slug ? [slug] : [];
    }),
  ),
);

const browserRoutes = new Set([
  "/ojaml",
  "/jaggerscript",
  "/genetic-ts",
  "/rengine",
]);
const browserAction = /^Open (?:Editor|Demo|Games|App|Arena)$/i;

/** Return only an interactive browser destination, never a paper or download. */
export function getDemoHref(project: ProjectEntry): string | undefined {
  return project.links.find((link) => {
    if (!browserAction.test(link.label)) return false;
    if (browserRoutes.has(link.href)) return true;
    try {
      const url = new URL(link.href);
      const isLocalDev =
        (url.protocol === "http:" || url.protocol === "https:") &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1");
      const isProdSubdomain =
        url.protocol === "https:" &&
        (url.hostname === "jaggerbrulato.com" ||
          url.hostname.endsWith(".jaggerbrulato.com"));
      return (isProdSubdomain || isLocalDev) && !/\.[a-z0-9]{2,5}$/i.test(url.pathname);
    } catch {
      return false;
    }
  })?.href;
}

/** A complete, deduplicated set of useful destinations for an inspector. */
export function getProjectResources(project: ProjectEntry): ProjectResource[] {
  const resources: ProjectResource[] = [];
  const demoHref = getDemoHref(project);
  if (demoHref) {
    const action = project.links.find((link) => link.href === demoHref)!;
    resources.push({ kind: "demo", label: action.label, href: demoHref });
  }
  if (paperSlugs.has(project.slug)) {
    resources.push(
      { kind: "paper", label: "Read paper", href: papersUrl(`/${project.slug}`) },
      { kind: "docs", label: "Documentation", href: docsUrl(`/${project.slug}`) },
    );
  }
  for (const link of project.links) {
    if (link.href === demoHref || extractPaperSlug(link.href) !== null) continue;
    const kind: ProjectResource["kind"] = /^source$/i.test(link.label)
      ? "source"
      : /^download\b/i.test(link.label)
        ? "download"
        : "reference";
    resources.push({ kind, ...link });
  }
  if (project.slug === "portfolio-site") {
    resources.push(
      ...views.map((view) => ({
        kind: "view" as const,
        label: `${view.title} view`,
        href: view.href,
      })),
    );
  }
  resources.push(
    ...(project.relatedLinks ?? []).map((link) => ({
      kind: (project.slug === "portfolio-site" ? "view" : "game") as
        | "view"
        | "game",
      label: link.label,
      href: link.href,
    })),
  );
  return resources.filter(
    (resource, index) =>
      resources.findIndex((item) => item.href === resource.href) === index,
  );
}

/** Search the complete shared inventory and combine it with a category. */
export function filterProjects(
  query: string,
  category: CategoryId = "all",
): ProjectEntry[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    if (category !== "all" && categoryFor(project) !== category) return false;
    const searchable = clean(
      [
        project.title,
        project.slug,
        project.description,
        project.impact,
        ...project.stack,
        ...project.links.map((link) => link.label),
        ...(project.relatedLinks ?? []).map(
          (link) => `${link.label} ${link.description}`,
        ),
      ].join(" "),
    ).toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}
