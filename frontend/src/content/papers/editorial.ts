import type { PaperDocument, PaperSectionBlock } from "./types";
import {
  readerExamples,
  storyOverrides,
  detailCaptions,
} from "./narratives/readerExamples";
import { narrativeIllustrations } from "./narratives/illustrations";
import { ojamlNarrative } from "./narratives/ojaml";
import { liveboardNarrative } from "./narratives/liveboard";
import { hearthNarrative } from "./narratives/hearth";
import { jaggerscriptNarrative } from "./narratives/jaggerscript";
import { aixcNarrative } from "./narratives/aixc";
import { geneticTsNarrative } from "./narratives/geneticTs";
import { rengineNarrative } from "./narratives/rengine";
import { tsxlightNarrative } from "./narratives/tsxlight";

export const editorialPlans = {
  ojaml: ojamlNarrative,
  liveboard: liveboardNarrative,
  hearth: hearthNarrative,
  jaggerscript: jaggerscriptNarrative,
  "aixc-compressor": aixcNarrative,
  "genetic-ts": geneticTsNarrative,
  rengine: rengineNarrative,
  "tsxlight-renderer": tsxlightNarrative,
};
const projectCaptions: Record<string, string> = {
  ojaml:
    "Source is parsed, checked, and emitted as WebAssembly before local execution.",
  liveboard:
    "Validated operations connect client interaction to committed state and collaboration.",
  hearth:
    "Input conditioning surrounds three nonlinear contributions and output protection.",
  jaggerscript:
    "The parser and normalization pass produce the nodes executed by the interpreter.",
  "aixc-compressor":
    "Shared predictions and stored residuals reconstruct the same sequence of units.",
  "genetic-ts":
    "Evaluated velocities are ranked and varied to produce the next population.",
  rengine:
    "Components update scene state before the selected renderer displays it.",
  "tsxlight-renderer":
    "The shell forwards an event to a server callback and receives the resulting view.",
};

function isNarrativeVisual(block: PaperSectionBlock) {
  return (
    ["graph", "image", "audio-samples", "flow"].includes(block.kind) ||
    (block.kind === "diagram" && block.body.split("\n").length <= 16)
  );
}

function essayVisual(block: PaperSectionBlock): PaperSectionBlock {
  if (block.kind !== "graph") return block;
  const descriptions: Partial<Record<typeof block.graph.kind, string>> = {
    "harmonic-profile":
      "A conceptual low-order harmonic profile showing the intended tube character. Bar heights are illustrative, not device measurements.",
    "servo-response":
      "A conceptual response showing upper-band drive decreasing as brightness rises. The curve is illustrative, not a calibrated device measurement.",
  };
  const description = descriptions[block.graph.kind];
  return description
    ? { ...block, graph: { ...block.graph, description } }
    : block;
}

export function makeEssay(source: PaperDocument): PaperDocument {
  const plan = editorialPlans[source.slug as keyof typeof editorialPlans];
  const used = new Set<string>();
  const sections = plan.sections.map((part) => {
    const original = source.sections.find((s) => s.id === part.sourceId)!;
    const supporting = (part.relatedSourceIds ?? []).map((id) =>
      source.sections.find((section) => section.id === id)!,
    );
    const chapterSources = [original, ...supporting];
    const visuals = chapterSources.flatMap((section) =>
      section.blocks.filter(isNarrativeVisual).map(essayVisual),
    );
    chapterSources.forEach((section) => used.add(section.id));
    const blocks: PaperSectionBlock[] = part.paragraphs.map((text) => ({
      kind: "paragraph",
      text,
    }));
    blocks.splice(1, 0, ...visuals);
    const illustration = narrativeIllustrations[source.slug]?.[original.id];
    if (illustration && !visuals.length) blocks.splice(1, 0, illustration);
    const detail = storyDetails[source.slug];
    if (detail && part.sourceId === detail.attachTo) {
      const section = source.sections.find((s) => s.id === detail.sectionId)!;
      const example = section.blocks.find(
        (b) => "label" in b && b.label === detail.label,
      );
      if (example) {
        const originalDetail = storyOverrides[source.slug] ?? example;
        const selected =
          "caption" in originalDetail && detailCaptions[source.slug]
            ? { ...originalDetail, caption: detailCaptions[source.slug] }
            : originalDetail;
        if (selected.kind === "example") blocks.splice(1, 0, selected);
        else blocks.push(selected);
        blocks.push({
          kind: "doc-link",
          label: "Full contract and examples",
          href: docHref(source.slug, section.id),
        });
      }
    }
    if (part === plan.sections[0])
      blocks.splice(1, 0, {
        kind: "flow",
        label: `${plan.name} at a glance`,
        stages: projectFlows[source.slug],
        caption: projectCaptions[source.slug],
      });
    blocks.push(...(readerExamples[source.slug]?.[original.id] ?? []));
    blocks.push({
      kind: "doc-link",
      label: `Documentation: ${original.title}`,
      href: docHref(source.slug, original.id),
    });
    supporting.forEach((section) =>
      blocks.push({
        kind: "doc-link",
        label: section.title,
        href: docHref(source.slug, section.id),
      }),
    );
    return { id: original.id, title: part.title, blocks };
  });
  // Retain every existing visual, including ones outside the planned chapters.
  const gallery = source.sections
    .filter((s) => !used.has(s.id))
    .flatMap((s) => {
      const visuals = s.blocks.filter(isNarrativeVisual);
      return visuals.length
        ? [
            ...visuals,
            {
              kind: "doc-link" as const,
              label: s.title,
              href: docHref(source.slug, s.id),
            },
          ]
        : [];
    });
  if (gallery.length)
    sections.push({
      id: "visual-notes",
      title: "Additional Diagrams",
      blocks: gallery,
    });
  return {
    ...source,
    subtitle: plan.subtitle,
    abstract: plan.abstract,
    description: plan.abstract,
    sections,
  };
}
export function docHref(slug: string, id: string) {
  return `/docs/${slug}/${explanationIds.has(id) ? "explanation" : "reference"}/${id}`;
}
export const explanationIds = new Set([
  "thesis",
  "motivation",
  "system-object",
  "tradeoffs",
  "design-lessons",
  "design-lessons",
  "results",
  "fit",
  "inference-proof",
  "compression-economics",
  "design-lessons",
]);

export const projectFlows: Record<string, string[]> = {
  ojaml: ["Source", "Parse", "Infer types", "Emit WASM", "Execute"],
  liveboard: [
    "Local gesture",
    "Preview / commit",
    "Validate & lock",
    "Save revision",
    "Fan out / recover",
  ],
  hearth: [
    "Condition input",
    "Tube / flux / bloom",
    "Adaptive control",
    "De-emphasis",
    "Blend & output",
  ],
  jaggerscript: ["Source", "PEG parse", "Normalize", "Frames & heap", "Result"],
  "aixc-compressor": [
    "Shared context",
    "Predict",
    "Hit / miss",
    "Decision + residual",
    "Exact reconstruction",
  ],
  "genetic-ts": [
    "Velocities",
    "Physics rollouts",
    "Rank fitness",
    "Breed & mutate",
    "Next generation",
  ],
  rengine: [
    "Scene hierarchy",
    "Component updates",
    "Compose transforms",
    "Render",
    "Inspect",
  ],
  "tsxlight-renderer": [
    "Shell event",
    "Resolve identity",
    "Server callback",
    "State & tree",
    "Deliver markup",
  ],
};

// One concrete technical example per story; exhaustive definitions stay in reference.
const storyDetails: Record<
  string,
  { attachTo: string; sectionId: string; label: string }
> = {
  ojaml: {
    attachTo: "surface-language",
    sectionId: "surface-language",
    label: "Core expression tour",
  },
  liveboard: {
    attachTo: "operation-algebra",
    sectionId: "operation-algebra",
    label: "Inverse derivation",
  },
  hearth: {
    attachTo: "warmth-servo",
    sectionId: "warmth-servo",
    label: "Brightness proxy",
  },
  jaggerscript: {
    attachTo: "language-model",
    sectionId: "grammar",
    label: "Representative program",
  },
  "aixc-compressor": {
    attachTo: "compression-economics",
    sectionId: "compression-economics",
    label: "Naive byte cost",
  },
  "genetic-ts": {
    attachTo: "motivation",
    sectionId: "fitness",
    label: "Genome",
  },
  rengine: {
    attachTo: "transform-composition",
    sectionId: "transform-composition",
    label: "World transform",
  },
  "tsxlight-renderer": {
    attachTo: "renderer-instances",
    sectionId: "renderer-instances",
    label: "Renderer isolation",
  },
};
