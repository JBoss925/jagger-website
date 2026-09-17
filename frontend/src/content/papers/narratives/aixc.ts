import { chapter, type NarrativePlan } from "./types";
export const aixcNarrative: NarrativePlan = {
  name: "AIXC",
  subtitle:
    "A lossless codec based on shared predictions, explicit residuals, and reproducible decoding.",
  abstract:
    "AIXC investigates lossless compression with a predictor shared by encoder and decoder. It stores hit-or-miss decisions and residuals, advancing both sides with reconstructed source units to preserve identical context. Residual representation and section coding are independent of prediction, while a manifest records the decoding configuration. Reported LogHub experiments show the self-contained LZP profile is slower and larger than the best native codecs; trained-byte models reduce archive-only ratios to roughly 1.2–2.2%, excluding required model sidecars. The results favor evaluating model reuse across related archives rather than treating a small archive alone as evidence of lower total storage cost.",
  sections: [
    chapter(
      "motivation",
      "A Small Archive and a Large Model",
      `
One recorded Shakespeare experiment produces a 3,760-byte archive and needs an 11.3 MB model to decode it. AIXC explores compression with a shared predictor, where archive size and the cost of that shared knowledge can differ substantially.

Byte and token modes encode hits plus residuals, with encoder and decoder sharing context and prediction rules. The model can accompany each archive, be preinstalled, or be reused across a collection. Those deployment choices change total storage even when the archive bytes are identical.

The deterministic toy backend isolates the codec from model dependencies. It provides a small reference path for testing reconstruction before comparing predictors with different training, runtime, and storage costs.
`,
    ),
    chapter(
      "reference-codec",
      "The Codec Loop",
      `
Stored seed material initializes shared context. Each subsequent unit produces a hit-or-miss decision and, on a miss, a residual. The decoder predicts locally and reconstructs the unit from the decision stream and residual stream.

Both sides observe the actual unit after reconstruction, including on misses. Advancing the decoder with its wrong guess would change subsequent context and invalidate later hits. The repeat-last-unit trace below makes that divergence explicit without introducing a model dependency.
`,
      ["codec-state-machine"],
    ),
    chapter(
      "correctness",
      "The Next Reconstructed Unit",
      `
The reconstruction invariant is prefix equality. Given the same decoded prefix and deterministic prediction order, a hit or residual recovers the next source unit; observing that unit preserves the invariant. Seed reconstruction establishes the base case.

The implementation must also preserve residual positions through section packing and accelerated prediction. Boundary cases such as truncated sections or inconsistent counts test that layer separately from the logical codec. Exact byte comparisons and incompatible-contract rejection are the relevant checks.
`,
    ),
    chapter(
      "compression-economics",
      "Compression Costs",
      `
For the simplest byte scheme, one decision bit plus an eight-bit literal on each miss gives approximately 1 + 8m bits per byte at miss rate m, excluding seed and metadata. Its raw-size break-even point is m < 7/8; that is only a baseline, not a comparison with mature codecs.

At 25% misses, the baseline costs about three bits per byte before overhead. Coding the decision stream and replacing literal misses with ranked residuals attack separate costs. Prediction latency and dependency bytes remain outside that archive-only calculation and can outweigh its savings.
`,
    ),
    chapter(
      "residual-coding",
      "Information in a Wrong Guess",
      `
Rank residuals store the actual unit’s position in the predictor’s candidate order. Top-k mode bounds that representation and falls back to a literal outside the candidate set. The miss remains lossless, but candidate ordering now becomes part of the decoding contract.

Section coding operates afterward on the decision and residual streams. Biased or clustered decisions need not stay as raw one-bit flags, and nonuniform residuals offer a separate coding opportunity. The reference Huffman path favors deterministic, inspectable decoding; zstd-style section compression provides a comparison with generic compression.

The manifest records the coding mode independently of the predictor and residual mode. Keeping these layers separate allows experiments to attribute savings to accuracy, residual representation, or section coding. It also makes a better predictor distinguishable from a better compressor applied to its output.
`,
      ["entropy-sections"],
    ),
    chapter(
      "determinism",
      "Deterministic Prediction",
      `
Reproducible candidate order depends on more than model version. Tokenizers, tie-break rules, quantization, resets, and runtime switches can change predictions. The manifest records the configuration and its fingerprint identifies it; the weights still need to be supplied separately.

Token mode also requires exact byte-to-token round trips. Normalizing or lossy tokenization needs rejection or raw passthrough, even if the decoded token sequence is correct. Byte mode avoids that particular failure but still depends on matching prediction and observation behavior.
`,
      ["predictor-interface"],
    ),
    chapter(
      "container",
      "The Archive Format",
      `
A fixed header and aligned sections store seed material, decisions, residuals, and optional metadata. Explicit offsets and unit counts separate stream parsing from prediction.

Mode compatibility, bounds, counts, integrity information, and predictor fingerprint are checked before reconstruction. Format validation therefore rejects malformed sections without conflating them with predictor mismatches or invalid residuals. A structurally valid archive can still lack its required model.
`,
      ["header-schema"],
    ),
    chapter(
      "implementation",
      "Predictors and the Workbench",
      `
The same archive rules allow different predictors to be compared without changing the reconstruction loop. The toy-byte backend keeps tests small. LZP learns byte contexts from the file without a large preinstalled model; trained-byte, neural-byte, and token-model paths bring external prior knowledge. Native C acceleration speeds hot work while retaining the codec rules.

The local web workbench manages corpora, jobs, metadata inspection, model training, and regenerated reports. Configuration and artifacts remain available alongside results, so an archive can be traced to the predictor and coding settings that produced it. This matters when comparing experiments whose dependencies differ.
`,
      ["predictor-families"],
    ),
    chapter(
      "results",
      "The Model Still Counts",
      `
The workbench’s recorded results put the opening dependency question into numbers. On five LogHub system-log datasets, the best native codec ratios are roughly 2.5% to 4.7% of input size. AIXC’s current full-log LZP profile ranges from 5.0% to 10.9% and takes longer.

Models trained on related logs produce smaller reported archives: the trained-byte runs reach approximately 1.2% to 2.2% of the selected inputs. That ratio excludes the required model sidecar. The Shakespeare run reports a 3,760-byte archive alongside an 11.3 MB sidecar. For one file, both count; across many files, a reusable model can be counted once.

The deployment comparison is the shared model plus all archives against the competing codec’s complete output. Reuse can amortize the model over related inputs; one standalone file cannot assume that benefit. The recorded results establish that distinction on their datasets rather than a general advantage for arbitrary files.
`,
    ),
  ],
};
