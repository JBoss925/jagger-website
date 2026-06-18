import compressorPreview from "../../assets/compressor-preview.svg";
import type { PaperDocument } from "./types";
export const aixcCompressorPaper: PaperDocument = {
    slug: "aixc-compressor",
    title: "AIXC: A Deterministic Predictor-Based Text Compression Format",
    subtitle: "A reference codec for storing predictor hits, miss residuals, manifests, and integrity metadata around a shared next-unit model.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "AIXC explores a simple compression question: if encoder and decoder share the same deterministic predictor, how much of the original text needs to be stored? The current reference implementation stores a seed, packs hit/miss decisions from a predictor, and records residual literals only when prediction fails. The repository includes a binary container, deterministic byte backends, optional Hugging Face model-token experiments, rank residual modes, entropy-coded sections, CRC/SHA integrity checks, a CLI, tests, benchmarks, and a local workbench. This paper summarizes the codec contract, the economics of the reference format, the binary container, and the engineering constraints that matter for reproducible decoding.",
    description: "A technical paper for a deterministic predictor-based text compression codec with manifests, residual coding, byte predictors, and benchmark tooling.",
    categories: ["Compression", "Systems", "Research Notes"],
    tags: [
        "Compression",
        "Python",
        "Codec Design",
        "Predictor Models",
        "Binary Formats",
        "Huffman Coding",
        "Benchmarking"
    ],
    repoUrl: "https://github.com/JBoss925/aixc-compressor",
    previewImage: compressorPreview,
    previewAlt: "AIXC compressor placeholder architecture preview",
    previewCaption: "AIXC reference-codec preview. The archive stores a seed, predictor hit/miss decisions, residual streams, and manifest-backed metadata in a deterministic container.",
    sections: [
        {
            id: "motivation",
            eyebrow: "I",
            title: "Motivation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "AIXC is based on a compact premise: if both sides can run the same predictor, the archive does not need to store every next unit. It can store enough seed material to initialize context, then a decision stream saying whether the predictor was correct. On misses, the encoder stores the actual residual unit so decoding remains exact."
                },
                {
                    kind: "paragraph",
                    text: "That premise turns compression into an explicit contract between a file and a predictor. The hard part is not packing bits. The hard part is making sure any conforming decoder can reproduce the same prediction sequence, tokenizer behavior, and residual interpretation without guessing."
                },
                {
                    kind: "bullets",
                    items: [
                        "Primary goal: exact round-trip text compression using a deterministic predictor contract.",
                        "Reference mode: seed units, packed hit/miss bits, and literal residuals.",
                        "Practical format property: entropy-coded decision streams and compact residual representations."
                    ]
                }
            ],
        },
        {
            id: "reference-codec",
            eyebrow: "II",
            title: "Reference Codec",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The v0 loop is intentionally direct. The encoder writes the seed, asks the predictor for each next unit, writes a hit bit when the argmax matches, and writes a miss bit plus the actual unit otherwise. The decoder reads the same seed, runs the same predictor, and reconstructs the stream by choosing either the predictor output or the stored literal."
                },
                {
                    kind: "equation",
                    label: "Reference decision",
                    tex: "d_i = \\mathbb{1}\\left[\\operatorname*{argmax}_u\\,p(u \\mid u_{<i}) = u_i\\right]",
                    caption: "Each coded position stores whether the deterministic top prediction matched the actual unit."
                },
                {
                    kind: "paragraph",
                    text: "A crucial implementation detail is that both encoder and decoder feed the actual decoded unit back into the predictor state. They do not let an incorrect prediction become the next context item. That keeps one miss from cascading into a permanently divergent decode."
                },
                {
                    kind: "equation",
                    label: "Decoder reconstruction",
                    tex: "\\hat{u}_i = d_i\\,\\operatorname*{argmax}_u p(u \\mid \\hat{u}_{<i}) + (1-d_i)\\,r_i",
                    caption: "A hit uses the predictor output; a miss consumes the next residual literal."
                }
            ],
        },
        {
            id: "compression-economics",
            eyebrow: "III",
            title: "Compression Economics",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The simplest byte-mode reference scheme spends one decision bit per byte and eight literal bits for each miss. That means it beats raw bytes only when the miss rate is below seven eighths, which is an easy bar but not a meaningful end state."
                },
                {
                    kind: "equation",
                    label: "Naive byte cost",
                    tex: "C_{\\mathrm{raw}} \\approx 1 + 8m \\quad \\mathrm{bits/byte}",
                    caption: "With miss rate m, the reference byte codec pays one decision bit plus one raw byte for every miss."
                },
                {
                    kind: "paragraph",
                    text: "The useful representation compresses the decision stream toward its binary entropy and avoids raw literals when the correct unit is still near the top of the predictor ranking. A rank residual, sparse top-k residual, Huffman section, or range/ANS-style section coder can use more of the predictor distribution than a single hit bit."
                },
                {
                    kind: "equation",
                    label: "Decision entropy",
                    tex: "H_2(p) = -p\\log_2(p) - (1-p)\\log_2(1-p)",
                    caption: "Clustered or biased hit/miss streams should code closer to binary entropy than to one full bit per unit."
                },
                {
                    kind: "bullets",
                    items: [
                        "Literal residual mode is easiest to audit and debug.",
                        "Top-k residual mode can store predictor rank when the correct unit is near the top.",
                        "Sparse top-k residual mode stores miss positions and compact residuals when hit rates are very high.",
                        "Huffman and zstd section coding reduce overhead for decision and residual streams."
                    ]
                }
            ],
        },
        {
            id: "codec-state-machine",
            eyebrow: "IV",
            title: "Codec State Machine",
            blocks: [
                {
                    kind: "paragraph",
                    text: "A conforming implementation can be reconstructed as two lockstep state machines. The encoder and decoder both maintain a context buffer, a predictor handle, a unit index, and stream cursors. The encoder additionally observes the source unit at each index; the decoder additionally observes the next decision bit and residual cursor."
                },
                {
                    kind: "diagram",
                    label: "Encoder state",
                    body: `state E = {
  context: unit[]
  index: number
  predictor: Predictor
  decisions: bit[]
  residuals: unit[]
}

for source[index]:
  prediction = predictor.argmax(context)
  if prediction == source[index]:
    decisions.push(1)
  else:
    decisions.push(0)
    residuals.push(source[index])
  context.push(source[index])
  index += 1`,
                    caption: "The encoder records only prediction failures as residuals; the context always advances with the true source unit."
                },
                {
                    kind: "diagram",
                    label: "Decoder state",
                    body: `state D = {
  context: seed
  index: number
  predictor: Predictor
  decisionCursor: number
  residualCursor: number
}

while output.length < originalLength:
  prediction = predictor.argmax(context)
  if decisions[decisionCursor] == 1:
    unit = prediction
  else:
    unit = residuals[residualCursor]
    residualCursor += 1
  output.push(unit)
  context.push(unit)
  decisionCursor += 1`,
                    caption: "The decoder consumes residuals exactly at miss positions and feeds reconstructed units back into predictor context."
                },
                {
                    kind: "equation",
                    label: "Cursor invariant",
                    tex: "0 \\le residualCursor_i \\le decisionCursor_i \\le unitIndex_i",
                    caption: "The residual cursor cannot advance except when a consumed decision bit is a miss."
                }
            ],
        },
        {
            id: "determinism",
            eyebrow: "V",
            title: "Deterministic Decoding Contract",
            blocks: [
                {
                    kind: "paragraph",
                    text: "AIXC treats the predictor as part of the format, not as an informal dependency. A decoder needs to know exactly which model, tokenizer, runtime family, quantization setting, special-token policy, and tie-break rule were used. Otherwise two machines can agree on the file bytes but disagree on the next predicted unit."
                },
                {
                    kind: "equation",
                    label: "Manifest fingerprint",
                    tex: "F = \\operatorname{SHA256}(\\operatorname{canonical\\_json}(M))",
                    caption: "A canonical predictor manifest can be hashed and recorded in the archive so decoders can reject mismatched runtimes."
                },
                {
                    kind: "paragraph",
                    text: "For model-token compression, the tokenizer must also round-trip the source text exactly. If the tokenizer normalizes or drops information, the codec either has to reject the input or store a raw passthrough block. Byte-mode predictors avoid that tokenizer problem but usually give up the native advantage of off-the-shelf language models."
                },
                {
                    kind: "equation",
                    label: "Round-trip condition",
                    tex: "\\operatorname{decode}(\\operatorname{encode}(x)) = x",
                    caption: "Model-token mode is only exact when tokenizer encode/decode preserves the original text."
                },
                {
                    kind: "bullets",
                    items: [
                        "Run predictors in evaluation mode with sampling disabled.",
                        "Select the next unit by argmax, with a fixed lowest-id tie break.",
                        "Pin tokenizer files, model weights, runtime versions, and quantization settings.",
                        "Feed actual decoded units back into predictor state after both hits and misses."
                    ]
                }
            ],
        },
        {
            id: "container",
            eyebrow: "VI",
            title: "Binary Container",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The repository implements an AIXC binary container with a fixed header and aligned sections for seed material, decision bits, residuals, and optional metadata. The header records archive mode, entropy codec, predictor backend, original byte length, unit counts, section offsets, and integrity flags."
                },
                {
                    kind: "paragraph",
                    text: "This shape keeps parsing predictable. A decoder can validate the header, locate each section without scanning the whole file, verify optional CRC32 or SHA-256 body metadata, and confirm the predictor fingerprint before attempting a decode."
                },
                {
                    kind: "bullets",
                    items: [
                        "Magic: AIXC.",
                        "Header: 96-byte fixed prefix with little-endian offsets and lengths.",
                        "Decision stream: LSB-first packed bits in the reference format.",
                        "Residual stream: raw literals, ULEB128 token ids, top-k ranks, or section-coded bytes depending on mode.",
                        "Optional section: TLV metadata for body integrity and predictor manifest fingerprints."
                    ]
                },
                {
                    kind: "diagram",
                    label: "Archive layout",
                    body: `+----------------------+ 0
| magic/version/header |
+----------------------+
| seed section         |
+----------------------+
| packed decisions     |
+----------------------+
| residual section     |
+----------------------+
| optional metadata    |
+----------------------+
| integrity trailer    |
+----------------------+`,
                    caption: "The archive is section-addressed so a decoder can validate offsets before running predictor-dependent decode."
                },
                {
                    kind: "equation",
                    label: "Container size",
                    tex: "|A| = |H| + |S| + |D| + |R| + |M|",
                    caption: "Archive size is the sum of fixed header, seed, decision, residual, and metadata sections."
                }
            ],
        },
        {
            id: "header-schema",
            eyebrow: "VII",
            title: "Header and Manifest Schema",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The fixed header is the decoder's first trust boundary. It must contain enough information to locate every section, reject incompatible modes, allocate decode buffers, and validate predictor compatibility before any predictor call is made."
                },
                {
                    kind: "example",
                    label: "Header fields",
                    language: "text",
                    code: `magic: 4 bytes = AIXC
version: u16
flags: u32
unitMode: enum(byte, token)
predictorKind: enum(toy, lzp, byte-model, hf-token)
entropyMode: enum(raw, huffman, zstd)
originalLength: u64
seedOffset, seedLength: u64, u64
decisionOffset, decisionLength: u64, u64
residualOffset, residualLength: u64, u64
metadataOffset, metadataLength: u64, u64
bodyCrc32: optional u32
manifestSha256: optional bytes32`,
                    caption: "A decoder can reconstruct section boundaries and compatibility requirements from the fixed prefix."
                },
                {
                    kind: "equation",
                    label: "Section bounds",
                    tex: "\\forall s,\\; 0 \\le offset_s < offset_s + length_s \\le |A|",
                    caption: "Every referenced section must lie inside the archive byte range."
                },
                {
                    kind: "paragraph",
                    text: "The manifest is canonical JSON or an equivalent canonical binary map. Required fields include predictor kind, version, tokenizer identity when applicable, tie-break rule, unit mode, residual mode, entropy mode, training corpus identity for sidecar models, and any quantization or runtime switches that affect argmax."
                }
            ],
        },
        {
            id: "residual-coding",
            eyebrow: "VIII",
            title: "Residual Coding Modes",
            blocks: [
                {
                    kind: "paragraph",
                    text: "AIXC separates prediction correctness from residual representation. The simplest residual is the literal unit, but a predictor distribution contains more information than a binary hit/miss flag. If the correct unit appears near the top of the ranked prediction list, the archive can store a rank or compact top-k code rather than a full literal."
                },
                {
                    kind: "equation",
                    label: "Rank residual",
                    tex: "r_i = \\operatorname{rank}_{p(\\cdot\\mid u_{<i})}(u_i)",
                    caption: "A rank residual records where the true unit appeared in the deterministic predictor ordering."
                },
                {
                    kind: "equation",
                    label: "Top-k admissibility",
                    tex: "u_i \\in \\operatorname{TopK}(p(\\cdot\\mid u_{<i})) \\Rightarrow C(r_i) \\le \\lceil\\log_2 k\\rceil",
                    caption: "When the true unit appears in the top-k set, its residual can be bounded by the rank code width."
                },
                {
                    kind: "paragraph",
                    text: "The format can still fall back to literal residuals. This fallback is essential because the archive must be exact even when the predictor is wrong in an unhelpful way. The residual mode therefore defines a total decode rule, not merely an optimization hint."
                },
                {
                    kind: "diagram",
                    label: "Residual decision tree",
                    body: `predict next unit
  |
  +-- exact top prediction -> decision hit, no residual
  |
  +-- true unit in top-k -> decision miss, rank residual
  |
  +-- otherwise -> decision miss, literal residual`,
                    caption: "Residual modes progressively exploit more predictor information while preserving a literal escape hatch."
                }
            ],
        },
        {
            id: "entropy-sections",
            eyebrow: "IX",
            title: "Entropy-Coded Sections",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Packed one-bit decisions are easy to inspect but not always economical. Decision streams are often biased and clustered; residual streams are often highly nonuniform. AIXC therefore treats section coding as an independent layer: after semantic streams are generated, each section can be encoded by a configured entropy backend."
                },
                {
                    kind: "equation",
                    label: "Section coding objective",
                    tex: "C(X) \\ge H(X),\\quad H(X) = -\\sum_x p(x)\\log_2 p(x)",
                    caption: "A practical section coder attempts to approach the entropy of the symbols in that section."
                },
                {
                    kind: "paragraph",
                    text: "Huffman coding is attractive in the reference implementation because it is deterministic, inspectable, and simple to decode. zstd-style section compression is useful for comparing predictor-specific savings against mature generic compression. The archive manifest records the selected coding mode so decoders do not infer it from bytes."
                },
                {
                    kind: "bullets",
                    items: [
                        "Decision bits can be packed raw or entropy-coded as a binary stream.",
                        "Residual units can be literal bytes, varint token IDs, rank codes, or compressed byte sections.",
                        "Metadata remains separately parseable so integrity and predictor checks run before decode.",
                        "The coding layer must be deterministic; adaptive decoders cannot depend on unstored model state."
                    ]
                }
            ],
        },
        {
            id: "predictor-interface",
            eyebrow: "X",
            title: "Predictor Interface",
            blocks: [
                {
                    kind: "paragraph",
                    text: "AIXC does not require a specific model class. It requires a deterministic predictor interface. The minimum interface accepts a context and returns an ordered candidate list or an argmax unit. More advanced residual modes require a stable top-k ordering."
                },
                {
                    kind: "example",
                    label: "Predictor contract",
                    language: "typescript",
                    code: `type Unit = number;

type Predictor = {
  manifest: CanonicalManifest;
  reset(seed: Unit[]): void;
  observe(unit: Unit): void;
  argmax(): Unit;
  topK?(k: number): Unit[];
};`,
                    caption: "The predictor state is advanced only through observed true or decoded units."
                },
                {
                    kind: "equation",
                    label: "Deterministic ordering",
                    tex: "score(a)=score(b) \\land a<b \\Rightarrow rank(a)<rank(b)",
                    caption: "Ties must resolve by a declared total ordering, such as lowest unit id first."
                },
                {
                    kind: "paragraph",
                    text: "The interface deliberately separates reset, prediction, and observation. This prevents an implementation from hiding state changes inside argmax calls and makes encoder/decoder equivalence easier to test."
                }
            ],
        },
        {
            id: "implementation",
            eyebrow: "XI",
            title: "Implementation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The compressor implementation is structured as a reference codec plus predictor backends. The dependency-free toy-byte backend is useful for tests and deterministic examples, while the LZP byte backend provides fast full-file runs. Additional modes cover trained byte models, neural byte predictors, Hugging Face causal language models, and native acceleration through a C extension."
                },
                {
                    kind: "paragraph",
                    text: "The implementation also includes a local web workbench. It can manage corpora, run compression jobs, inspect archive metadata, train byte or neural sidecar models, and regenerate benchmark reports. That makes AIXC a laboratory for testing predictor contracts rather than a single codec script."
                },
                {
                    kind: "bullets",
                    items: [
                        "aixc/: codec, predictors, entropy coding, CLI, UI server, and native C source.",
                        "tests/: round-trip integrity, varint, bit packing, and backend contract tests.",
                        "benchmarks/: repeatable benchmark scripts and generated report artifacts.",
                        "compression-research-report.md: design notes, model recommendations, and file-format rationale."
                    ]
                }
            ],
        },
        {
            id: "correctness",
            eyebrow: "XII",
            title: "Correctness Conditions",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Lossless decoding depends on three independent equalities: the seed must reconstruct the initial context, the predictor must produce the same ordered candidates, and the residual stream must be consumed in the same positions. If any equality fails, a decoder can still parse the archive but cannot guarantee the original text."
                },
                {
                    kind: "equation",
                    label: "Decode invariant",
                    tex: "\\forall i,\\; \\hat{u}_{<i}=u_{<i} \\Rightarrow \\operatorname{pred}(\\hat{u}_{<i})=\\operatorname{pred}(u_{<i})",
                    caption: "If the decoded prefix equals the original prefix and the predictor is deterministic, the next prediction is reproducible."
                },
                {
                    kind: "equation",
                    label: "Residual consumption",
                    tex: "j_i = \\sum_{t < i}(1-d_t)",
                    caption: "The residual pointer before position i equals the number of misses before i."
                },
                {
                    kind: "paragraph",
                    text: "By induction over positions, a hit reconstructs the original unit from the deterministic predictor, and a miss reconstructs it from the residual at pointer j. Feeding the reconstructed actual unit back into context preserves the induction hypothesis for the next position."
                }
            ],
        },
        {
            id: "results",
            eyebrow: "XIII",
            title: "Benchmark Results and Use Cases",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The benchmark workbook makes the tradeoff explicit. On the five selected LogHub datasets, native codecs remain the right answer for self-contained compression: the best native archive ratios range from about 0.025 on Zookeeper to about 0.047 on Linux and Proxifier, while the current full-log AIXC LZP profile lands between 0.050 and 0.109. It completes the lossless runs, but it is slower than native zstd/xz and usually larger when no shared model is allowed."
                },
                {
                    kind: "paragraph",
                    text: "AIXC becomes more interesting when the predictor is shared out of band. With corpus-specific max-context byte models, the order-64 archive-only ratios beat the best native archive ratio on all five selected logs: Linux reaches 0.012, Zookeeper 0.018, Apache 0.020, Mac 0.022, and Proxifier 0.022. Higher orders can drive some archive-only ratios below 0.001, but the model bytes dominate if each archive has to carry its own model."
                },
                {
                    kind: "paragraph",
                    text: "That makes the format useful in a specific class of systems: repeated, related text streams where the predictor can be installed once and amortized across many archives. Log families, telemetry exports, generated reports, protocol traces, or corpora distributed with a known sidecar model fit the design better than one-off files. For arbitrary standalone compression, a mature native codec is still the practical choice."
                },
                {
                    kind: "bullets",
                    items: [
                        "Self-contained logs: native zstd/xz remains smaller and much faster in the current benchmark set.",
                        "Shared-model logs: AIXC order-64 trained-byte archives reach roughly 1.2%-2.2% of original size on the selected LogHub files.",
                        "Shakespeare max-context experiments show the upper bound of the idea: an order-64 shared model produced a 3,760-byte archive, about 0.0007 of the original text, with an 11.3 MB sidecar model.",
                        "Best fit: many related archives decoded in an environment that can already provide the predictor manifest and sidecar model."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
