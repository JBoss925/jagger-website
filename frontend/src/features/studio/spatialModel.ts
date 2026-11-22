import {
  libraryCatalog,
  type LibraryEntry,
} from "@jagger-ui/content/libraryCatalog";
import { SITE_URLS, normalizeUrlKey } from "@jagger-ui/urls";
import { profileContent } from "../../content/profile";
import type {
  ExperienceEntry,
  ProjectEntry,
  SkillCluster,
} from "../../types/content";
import { clean, summaries, views } from "./content";
import {
  categories,
  categoryFor,
  filterProjects,
  getDemoHref,
  getProjectResources,
  type CategoryId,
} from "./explorerModel";

export type SectionId =
  | "projects"
  | "experience"
  | "demos"
  | "library"
  | "about";

export type FormationKind =
  // 14 bespoke content-driven project formations
  | "ojaml-compiler"
  | "risk-terminal"
  | "liveboard-canvas"
  | "hearth-tube"
  | "jaggerscript-heap"
  | "aixc-compress"
  | "genetic-trajectory"
  | "games-board"
  | "jetstream-weather"
  | "rengine-scenegraph"
  | "portfolio-viewports"
  | "tsxlight-layers"
  | "arena-clash"
  | "chains-monad"
  // 10 bespoke content-driven experience formations
  | "exp-h2-construction"
  | "exp-palmetto-solar"
  | "exp-redventures-cloud"
  | "exp-google-pipeline"
  | "exp-dti-constellation"
  | "exp-google-dance"
  | "exp-dti-events"
  | "exp-dti-fullstack"
  | "exp-lowes-retail"
  | "exp-incite-heartbeat"
  | "exp-velocitor-fleet"
  // About bespoke formations
  | "about-monogram"
  | "about-leadership"
  | "about-systems"
  | "about-range"
  | "about-beacon";

export type PaletteSpec = {
  /** Saturated jewel primary */
  primary: string;
  /** Deeper structural anchor shade */
  deep: string;
  /** Soft pastel highlight shade */
  light: string;
  /** Luminous emissive/pointLight glow */
  glow: string;
};

export type AboutCardPayload =
  | {
      kind: "bio";
      eyebrow: string;
      headline: string;
      body: string[];
      metrics: typeof profileContent.metrics;
      links: typeof profileContent.links;
    }
  | {
      kind: "skill";
      cluster: SkillCluster;
    }
  | {
      kind: "views";
      eyebrow: string;
      headline: string;
      body: string;
      views: typeof views;
    }
  | {
      kind: "contact";
      eyebrow: string;
      headline: string;
      body: string;
      email: string;
      links: typeof profileContent.links;
    };

export type SpatialItemPayload =
  | { kind: "project"; project: ProjectEntry }
  | { kind: "experience"; experience: ExperienceEntry }
  | { kind: "demo"; project: ProjectEntry; demoHref: string; isInternal: boolean }
  | { kind: "library"; project: ProjectEntry; paper: LibraryEntry }
  | { kind: "about"; about: AboutCardPayload };

export type SpatialItem = {
  uid: string;
  slug: string;
  section: SectionId;
  title: string;
  shortLabel: string;
  subtitle: string;
  hoverDescription?: string;
  eyebrow: string;
  formation: FormationKind;
  isLibraryVolume?: boolean;
  palette: PaletteSpec;
  badges?: string[];
  payload: SpatialItemPayload;
};

export type SectionConfig = {
  id: SectionId;
  label: string;
  eyebrowBase: string;
  headlineTop: string;
  headlineAccent: string;
  description: string;
  mobileDescription: string;
  cameraPosition: [number, number, number];
  ringScale: number;
};

const SECTION_STAGE_DEFAULTS: Record<
  SectionId,
  { label: string; cameraPosition: [number, number, number]; ringScale: number }
> = {
  experience: {
    label: "Experience",
    cameraPosition: [0, 0.35, 13.6],
    ringScale: 0.92,
  },
  projects: {
    label: "Projects",
    cameraPosition: [0, 0.1, 14.0],
    ringScale: 1,
  },
  demos: {
    label: "Demos",
    cameraPosition: [0, 0.15, 12.8],
    ringScale: 0.86,
  },
  library: {
    label: "Library",
    cameraPosition: [0, 0.25, 13.2],
    ringScale: 0.9,
  },
  about: {
    label: "About",
    cameraPosition: [0, 0.2, 12.4],
    ringScale: 0.82,
  },
};

export const SECTIONS: SectionConfig[] = profileContent.sectionCopy.map((copy) => {
  const stage = SECTION_STAGE_DEFAULTS[copy.id];
  return {
    id: copy.id,
    label: stage.label,
    eyebrowBase: copy.eyebrow,
    headlineTop: copy.headlineTop,
    headlineAccent: copy.headlineAccent,
    description: copy.description,
    mobileDescription: copy.mobileDescription,
    cameraPosition: stage.cameraPosition,
    ringScale: stage.ringScale,
  };
});

export const INTERNAL_DEMOS = new Set([
  "/ojaml",
  "/jaggerscript",
  "/genetic-ts",
  "/rengine",
]);

export const EMBEDDABLE_DEMOS = new Set([
  ...INTERNAL_DEMOS,
  SITE_URLS.games,
  `${SITE_URLS.games}/`,
  SITE_URLS.risk,
  `${SITE_URLS.risk}/`,
  SITE_URLS.arena,
  `${SITE_URLS.arena}/`,
  SITE_URLS.jetstream,
  `${SITE_URLS.jetstream}/`,
]);

export function isEmbeddableDemo(href: string | undefined): boolean {
  if (!href) return false;
  return (
    EMBEDDABLE_DEMOS.has(href) || EMBEDDABLE_DEMOS.has(normalizeUrlKey(href))
  );
}

const PROJECT_FORMATION: Record<string, FormationKind> = {
  ojaml: "ojaml-compiler",
  risk: "risk-terminal",
  liveboard: "liveboard-canvas",
  hearth: "hearth-tube",
  jaggerscript: "jaggerscript-heap",
  "aixc-compressor": "aixc-compress",
  "genetic-ts": "genetic-trajectory",
  "jagger-games": "games-board",
  jetstream: "jetstream-weather",
  rengine: "rengine-scenegraph",
  "portfolio-site": "portfolio-viewports",
  "tsxlight-renderer": "tsxlight-layers",
  "random-arena": "arena-clash",
  chains: "chains-monad",
};

const EXPERIENCE_FORMATION: Record<string, FormationKind> = {
  "h2-corporation-staff-forward-deployed-engineer": "exp-h2-construction",
  "palmetto-software-development-engineer-iii": "exp-palmetto-solar",
  "red-ventures-platform-engineer": "exp-redventures-cloud",
  "google-software-engineer": "exp-google-pipeline",
  "cornell-dti-developer-lead": "exp-dti-constellation",
  "google-swe-intern": "exp-google-dance",
  "cornell-dti-technical-project-manager": "exp-dti-events",
  "cornell-dti-full-stack-developer": "exp-dti-fullstack",
  "lowes-software-engineering-intern": "exp-lowes-retail",
  "incite-analytics-full-stack-developer": "exp-incite-heartbeat",
  "velocitor-software-engineer-intern": "exp-velocitor-fleet",
};

// Richer jewel-pastel triads (deep structural anchor + saturated primary + pearl-tinted light)
const PASTEL_PALETTES: Record<string, PaletteSpec> = {
  ojaml: {
    primary: "#8a66e0",
    deep: "#5b3ab5",
    light: "#dcd0fc",
    glow: "#a887f7",
  },
  risk: {
    primary: "#22b88c",
    deep: "#137a5e",
    light: "#c8f2e4",
    glow: "#4be0b4",
  },
  liveboard: {
    primary: "#7294e3",
    deep: "#4668bd",
    light: "#d2e0fc",
    glow: "#96b4f6",
  },
  hearth: {
    primary: "#cc7ea8",
    deep: "#974b75",
    light: "#f6d3e7",
    glow: "#e69ec5",
  },
  jaggerscript: {
    primary: "#7b68d6",
    deep: "#4e3ca8",
    light: "#d7cffb",
    glow: "#9e8cf0",
  },
  "aixc-compressor": {
    primary: "#6f94c4",
    deep: "#436899",
    light: "#d1e3f7",
    glow: "#94b7e3",
  },
  "genetic-ts": {
    primary: "#63ab9e",
    deep: "#387c70",
    light: "#cdeee7",
    glow: "#88ccc0",
  },
  "jagger-games": {
    primary: "#a975d9",
    deep: "#7844ad",
    light: "#e8d2fa",
    glow: "#c594f0",
  },
  jetstream: {
    primary: "#649ec2",
    deep: "#397296",
    light: "#cfe7f6",
    glow: "#8bc0e0",
  },
  rengine: {
    primary: "#966fcf",
    deep: "#6640a3",
    light: "#e2d0fa",
    glow: "#b48fed",
  },
  "portfolio-site": {
    primary: "#8769d9",
    deep: "#583bad",
    light: "#dfd3fc",
    glow: "#a98cf2",
  },
  "tsxlight-renderer": {
    primary: "#817bd1",
    deep: "#534ca6",
    light: "#dad7fa",
    glow: "#a39deb",
  },
  "random-arena": {
    primary: "#c47d9c",
    deep: "#8f4969",
    light: "#f4d3e2",
    glow: "#de9eb9",
  },
  chains: {
    primary: "#7f92c9",
    deep: "#52659e",
    light: "#d9e2fa",
    glow: "#a1b3e6",
  },
};

const EXPERIENCE_PALETTES: PaletteSpec[] = [
  { primary: "#8461db", deep: "#5434ad", light: "#ddd2fc", glow: "#a585f2" },
  { primary: "#62ab9c", deep: "#377d6e", light: "#cdeee6", glow: "#87ccc0" },
  { primary: "#aa74d4", deep: "#7944a6", light: "#e8d3fa", glow: "#c694ed" },
  { primary: "#708ee0", deep: "#4361b5", light: "#d3e0fc", glow: "#96b0f5" },
  { primary: "#c27da8", deep: "#8d4b75", light: "#f4d4e8", glow: "#dc9ec5" },
  { primary: "#6d93c4", deep: "#416699", light: "#d2e3f8", glow: "#92b5e3" },
  { primary: "#8e73d4", deep: "#5f44a8", light: "#e0d5fa", glow: "#ae95ed" },
  { primary: "#7f8ac9", deep: "#515c9e", light: "#dadef8", glow: "#a2ace6" },
  { primary: "#a57fc7", deep: "#754f99", light: "#e8daf6", glow: "#c29fe0" },
  { primary: "#cf7d98", deep: "#994965", light: "#f6d4e0", glow: "#e69fb7" },
  { primary: "#6e9cb8", deep: "#426f8c", light: "#d3e7f3", glow: "#93bed9" },
];

export function displayProjectTitle(project: ProjectEntry): string {
  if (project.slug === "portfolio-site") return "Portfolio Views";
  if (project.title === "Genetic Algorithms in TypeScript") return "GeneticTS";
  return project.title;
}

export function getSectionConfig(section: SectionId): SectionConfig {
  return SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];
}

export function getItemsForSection(
  section: SectionId,
  category: CategoryId = "all",
  query = "",
): SpatialItem[] {
  if (section === "projects") {
    const filtered = filterProjects(query, category);
    return filtered.map((project) => {
      const hasDemo = Boolean(getDemoHref(project));
      const hasPaper = libraryCatalog.some((p) => p.slug === project.slug);
      const badges: string[] = [];
      if (hasDemo) badges.push("Live Demo");
      if (hasPaper) badges.push("Paper + Docs");
      return {
        uid: `projects:${project.slug}`,
        slug: project.slug,
        section: "projects",
        title: displayProjectTitle(project),
        shortLabel: displayProjectTitle(project),
        subtitle: summaries[project.slug] ?? clean(project.description),
        eyebrow: categoryFor(project).toUpperCase(),
        formation: PROJECT_FORMATION[project.slug] ?? "rengine-scenegraph",
        palette: PASTEL_PALETTES[project.slug] ?? PASTEL_PALETTES.ojaml,
        badges,
        payload: { kind: "project", project },
      };
    });
  }

  if (section === "experience") {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return profileContent.experience
      .filter((exp) => {
        if (!terms.length) return true;
        const hay = `${exp.company} ${exp.role} ${exp.timeframe} ${exp.summary} ${exp.tags.map((t) => t.label).join(" ")}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .map((exp, index) => {
        const duplicateCompany =
          profileContent.experience.filter((e) => e.company === exp.company)
            .length > 1;
        const shortRole = exp.role
          .replace("Software Development Engineer III", "SDE III")
          .replace("Staff Forward-Deployed Engineer", "Staff FDE")
          .replace("Technical Project Manager", "TPM")
          .replace("Full Stack Developer", "Full Stack")
          .replace("Developer Lead", "Lead")
          .replace("Software Engineering Intern", "Intern")
          .replace("Software Engineer Intern", "Intern")
          .replace("SWE Intern", "Intern")
          .replace("L4 Software Engineer", "L4");
        return {
          uid: `experience:${exp.slug}`,
          slug: exp.slug,
          section: "experience",
          title: exp.company,
          shortLabel: duplicateCompany
            ? `${exp.company.replace("Cornell Design & Tech Initiative", "Cornell DTI")} · ${shortRole}`
            : exp.company,
          subtitle: `${exp.role} · ${exp.timeframe}`,
          hoverDescription: clean(exp.summary),
          eyebrow: `${exp.timeframe} · ${exp.location.toUpperCase()}`,
          formation: EXPERIENCE_FORMATION[exp.slug] ?? "exp-h2-construction",
          palette: EXPERIENCE_PALETTES[index % EXPERIENCE_PALETTES.length],
          badges: [exp.timeframe],
          payload: { kind: "experience", experience: exp },
        };
      });
  }

  if (section === "demos") {
    return filterProjects(query, "all")
      .map((project) => {
        const demoHref = getDemoHref(project);
        if (!demoHref) return null;
        const isInternal = isEmbeddableDemo(demoHref);
        return {
          uid: `demos:${project.slug}`,
          slug: project.slug,
          section: "demos" as const,
          title: displayProjectTitle(project),
          shortLabel: displayProjectTitle(project),
          subtitle: summaries[project.slug] ?? clean(project.description),
          eyebrow: isInternal ? "RUN IN WORKSPACE" : "LIVE WEB APP",
          formation: PROJECT_FORMATION[project.slug] ?? "games-board",
          palette: PASTEL_PALETTES[project.slug] ?? PASTEL_PALETTES.ojaml,
          badges: [isInternal ? "Interactive" : "Web App"],
          payload: {
            kind: "demo" as const,
            project,
            demoHref,
            isInternal,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  if (section === "library") {
    return filterProjects(query, "all")
      .map((project) => {
        const paper = libraryCatalog.find((p) => p.slug === project.slug);
        if (!paper) return null;
        return {
          uid: `library:${project.slug}`,
          slug: project.slug,
          section: "library" as const,
          title: displayProjectTitle(project),
          shortLabel: displayProjectTitle(project),
          subtitle: paper.subtitle,
          eyebrow: `PAPER + DOCS · ${paper.categories[0]?.toUpperCase() ?? "SYSTEMS"}`,
          // Each library volume shares the exact same signature sculpture as its Project / Demo!
          formation: PROJECT_FORMATION[project.slug] ?? "rengine-scenegraph",
          palette: PASTEL_PALETTES[project.slug] ?? PASTEL_PALETTES.ojaml,
          badges: ["Paper", "Docs"],
          payload: {
            kind: "library" as const,
            project,
            paper,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  const aboutItems: SpatialItem[] = [
    {
      uid: "about:jagger",
      slug: "jagger",
      section: "about",
      title: "Jagger Brulato",
      shortLabel: "About Jagger",
      subtitle:
        "Staff engineer at H2 Corporation building across product, systems & infrastructure.",
      eyebrow: "PROFILE · STAFF ENGINEER",
      formation: "about-monogram",
      palette: {
        primary: "#8461db",
        deep: "#5535ab",
        light: "#dfd3fc",
        glow: "#a585f2",
      },
      payload: {
        kind: "about",
        about: {
          kind: "bio",
          eyebrow: "ABOUT ME",
          headline: "A little bit about how I work.",
          body: [
            clean(profileContent.heroSummary),
            ...profileContent.heroBullets.map(clean),
          ],
          metrics: profileContent.metrics,
          links: profileContent.links,
        },
      },
    },
    {
      uid: "about:portfolio-views",
      slug: "portfolio-views",
      section: "about",
      title: "Portfolio Views",
      shortLabel: "Portfolio Views",
      subtitle: "Five different portfolio frontends — including this one — built on one shared data model.",
      eyebrow: "INTERFACES",
      formation: "portfolio-viewports",
      palette: {
        primary: "#9a72dd",
        deep: "#6a42b0",
        light: "#e6d6fb",
        glow: "#b994f2",
      },
      badges: ["5 Frontends"],
      payload: {
        kind: "about",
        about: {
          kind: "views",
          eyebrow: "SAME DATA · FIVE DIFFERENT APPS",
          headline: "Five ways to browse this site.",
          body: "I kept wondering what the exact same portfolio data would feel like as completely different apps. Alongside this main 120-cube spatial view, the same shared data model powers four other standalone frontends: Interactive 3D, Design, Editor, and Finance.",
          views,
        },
      },
    },
    {
      uid: "about:team",
      slug: "team",
      title: profileContent.skillClusters[0].title,
      section: "about",
      shortLabel: "Leadership",
      subtitle: clean(profileContent.skillClusters[0].summary),
      eyebrow: "CRAFT · LEADERSHIP",
      formation: "about-leadership",
      palette: {
        primary: "#7492e0",
        deep: "#4665b5",
        light: "#d4e1fc",
        glow: "#97b3f5",
      },
      payload: {
        kind: "about",
        about: {
          kind: "skill",
          cluster: profileContent.skillClusters[0],
        },
      },
    },
    {
      uid: "about:systems",
      slug: "systems",
      section: "about",
      title: profileContent.skillClusters[1].title,
      shortLabel: "Systems & Platform",
      subtitle: clean(profileContent.skillClusters[1].summary),
      eyebrow: "CRAFT · INFRASTRUCTURE",
      formation: "about-systems",
      palette: {
        primary: "#63ab9e",
        deep: "#387d70",
        light: "#cdeee7",
        glow: "#88ccc0",
      },
      payload: {
        kind: "about",
        about: {
          kind: "skill",
          cluster: profileContent.skillClusters[1],
        },
      },
    },
    {
      uid: "about:range",
      slug: "range",
      section: "about",
      title: profileContent.skillClusters[2].title,
      shortLabel: "Full-Stack Range",
      subtitle: clean(profileContent.skillClusters[2].summary),
      eyebrow: "CRAFT · BREADTH",
      formation: "about-range",
      palette: {
        primary: "#c47da6",
        deep: "#8f4b74",
        light: "#f4d4e7",
        glow: "#de9ec3",
      },
      payload: {
        kind: "about",
        about: {
          kind: "skill",
          cluster: profileContent.skillClusters[2],
        },
      },
    },
    {
      uid: "about:contact",
      slug: "contact",
      section: "about",
      title: "Get in Touch",
      shortLabel: "Contact & Résumé",
      subtitle: "Email, résumé, GitHub, and LinkedIn.",
      eyebrow: "CONNECT · DIRECT",
      formation: "about-beacon",
      palette: {
        primary: "#a675db",
        deep: "#7444ad",
        light: "#e7d4fa",
        glow: "#c496f2",
      },
      payload: {
        kind: "about",
        about: {
          kind: "contact",
          eyebrow: "SAY HELLO",
          headline: "Reach out directly.",
          body: "Email is usually the fastest way to reach me. If you’re looking for a staff engineer who still wants to stay in the code—or just want to talk about compilers, platforms, or product work—send a note.",
          email: profileContent.email,
          links: profileContent.links,
        },
      },
    },
  ];

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return aboutItems;
  return aboutItems.filter((item) => {
    const hay = `${item.title} ${item.subtitle} ${item.eyebrow}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export { categories, categoryFor, getDemoHref, getProjectResources, type CategoryId };
