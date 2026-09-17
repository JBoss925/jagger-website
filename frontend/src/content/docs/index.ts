import { sourceDocuments } from "../papers";
import {
  docHref,
  editorialPlans,
  explanationIds,
  projectFlows,
} from "../papers/editorial";
import type {
  PaperDocument,
  PaperSection,
  PaperSectionBlock,
} from "../papers/types";
import { projectGuides } from "./guides";

export const modes = [
  "tutorials",
  "how-to",
  "reference",
  "explanation",
] as const;
export type DocMode = (typeof modes)[number];
export const modeInfo: Record<DocMode, { title: string; description: string }> =
  {
    tutorials: {
      title: "Tutorials",
      description:
        "Learn through a guided exercise with a concrete checkpoint.",
    },
    "how-to": {
      title: "How-to guides",
      description: "Complete a task or diagnose a specific problem.",
    },
    reference: {
      title: "Reference",
      description:
        "Look up syntax, contracts, layouts, algorithms, and exact behavior.",
    },
    explanation: {
      title: "Explanation",
      description: "Understand the design decisions, alternatives, and limits.",
    },
  };
export type DocPage = PaperSection & { mode: DocMode; related?: string[] };
export type DocProject = {
  source: PaperDocument;
  name: string;
  pages: DocPage[];
};
const paragraphs = (texts: string[]): PaperSectionBlock[] =>
  texts.map((text) => ({ kind: "paragraph", text }));
const taskReferences: Record<string, string[][]> = {
  ojaml: [
    ["runtime-layout", "validation"],
    ["stdlib", "implementation-correspondence"],
  ],
  liveboard: [
    ["realtime-protocol", "operation-algebra"],
    ["distributed-runtime", "access-control"],
  ],
  hearth: [
    ["implementation", "ui-controls"],
    ["controls", "warmth-servo"],
  ],
  jaggerscript: [
    ["runtime-errors", "runtime"],
    ["grammar", "program-representation"],
  ],
  "aixc-compressor": [
    ["header-schema", "correctness"],
    ["results", "predictor-families"],
  ],
  "genetic-ts": [
    ["implementation", "convergence"],
    ["algorithm", "physics-model"],
  ],
  rengine: [
    ["transform-composition", "inspector-snapshots"],
    ["components", "renderer-contract"],
  ],
  "tsxlight-renderer": [
    ["identity", "rerender-consistency"],
    ["fit", "security-isolation"],
  ],
};
export const docProjects: DocProject[] = sourceDocuments.map((source) => {
  const key = source.slug as keyof typeof projectGuides;
  const guide = projectGuides[key];
  const tutorial: DocPage = {
    id: "first-steps",
    mode: "tutorials",
    title: `Explore ${editorialPlans[key].name}`,
    blocks: [
      ...paragraphs([
        "Work through this exercise in order. The checkpoint tells you what to observe before you move to the detailed reference.",
      ]),
      ...guide.steps.flatMap((text, index) =>
        paragraphs([`${index + 1}. ${text}`]),
      ),
      ...(guide.code
        ? [
            {
              kind: "example" as const,
              label: "Exercise source",
              code: guide.code,
              caption:
                source.slug === "jaggerscript"
                  ? "A class definition to inspect alongside the runnable examples."
                  : "Run this program, then change one argument.",
            },
          ]
        : []),
      {
        kind: "doc-link",
        label: "Open the project source and setup instructions",
        href: source.repoUrl,
      },
    ],
  };
  const tasks: DocPage[] = guide.tasks.map((task, index) => ({
    id: task.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/g, ""),
    mode: "how-to",
    title: task.title,
    blocks: [
      ...paragraphs(task.steps.map((text, i) => `${i + 1}. ${text}`)),
      ...taskReferences[key][index].map((id) => ({
        kind: "doc-link" as const,
        label: source.sections.find((section) => section.id === id)!.title,
        href: docHref(source.slug, id),
      })),
    ],
  }));
  const detail: DocPage[] = source.sections.map((section) => ({
    ...section,
    eyebrow: undefined,
    mode: explanationIds.has(section.id) ? "explanation" : "reference",
  }));
  // Preserve metadata and links that used to live in the manuscript header as well as every section block.
  const overview: DocPage = {
    id: "project-context",
    mode: "explanation",
    title: "Project context and scope",
    blocks: [
      {
        kind: "flow",
        label: `${editorialPlans[key].name} at a glance`,
        stages: projectFlows[source.slug],
        caption:
          "Follow the responsibilities across the system; use the reference pages for precise contracts.",
      },
      ...paragraphs([source.subtitle, source.abstract]),
      { kind: "doc-link", label: "Source repository", href: source.repoUrl },
      ...(source.actionLinks ?? []).map((link) => ({
        kind: "doc-link" as const,
        label: link.label,
        href: link.href,
      })),
    ],
  };
  return {
    source,
    name: editorialPlans[key].name,
    pages: [tutorial, ...tasks, ...detail, overview],
  };
});
export function getDocProject(slug: string | undefined) {
  return docProjects.find((p) => p.source.slug === slug);
}
export { docHref };
