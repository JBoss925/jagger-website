import type { PaperSectionBlock } from "../types";

// Compact narrative views complement the full structural diagrams in reference.
export const narrativeIllustrations: Record<
  string,
  Record<string, PaperSectionBlock>
> = {
  ojaml: {
    closures: {
      kind: "flow",
      label: "Closure Calls",
      stages: [
        "Closure pointer",
        "Table index + captures",
        "Indirect call + environment",
        "Load captured values",
        "Evaluate function body",
      ],
      caption:
        "A closure supplies both a callable target and the stored environment that its body expects.",
    },
  },
  jaggerscript: {
    runtime: {
      kind: "flow",
      label: "Object Field Lookup",
      stages: [
        "Frame-local reference",
        "Instance on the heap",
        "Instance field scope",
        "Field's heap pointer",
        "Stored value",
      ],
      caption:
        "A local object reference and the field it reaches occupy different parts of interpreter state.",
    },
  },
  "aixc-compressor": {
    "reference-codec": {
      kind: "flow",
      label: "Predictor State",
      stages: [
        "Shared context",
        "Same next prediction",
        "Hit or recover residual",
        "Observe actual unit",
        "Advance both contexts",
      ],
      caption:
        "A miss changes what is stored, but both machines still advance with the same actual unit.",
    },
  },
  "genetic-ts": {
    evolution: {
      kind: "flow",
      label: "The Next Generation",
      stages: [
        "Rank evaluated shots",
        "Preserve elites + select parents",
        "Blend and mutate children",
        "Add random resets",
        "Evaluate new population",
      ],
      caption:
        "Preservation, local variation, and fresh exploration play distinct roles in the next population.",
    },
  },
  rengine: {
    "loop-scheduling": {
      kind: "flow",
      label: "The Frame Sequence",
      stages: [
        "Compute elapsed time",
        "Tick active scene",
        "Global update hook",
        "Render resulting state",
        "Retain next state",
      ],
      caption:
        "The scheduler chooses when to step; the engine keeps the update-and-render operation consistent.",
    },
  },
};
