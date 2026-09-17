# Paper-to-documentation migration

All eight original manuscripts are preserved in `src/content/docs/`. The narrative papers are authored in `src/content/papers/editorial.ts`. Detailed pages retain the original section IDs; `docHref` provides their canonical addresses. Original titles, abstracts, subtitles, action links, previews, and audio assets remain in the project sources and context pages.

## AIXC: A Deterministic Predictor-Based Text Compression Format

14 original sections; 59 original blocks. Source: `src/content/docs/aixcCompressor.ts`.

- `motivation`: Motivation
- `reference-codec`: Reference Codec
- `compression-economics`: Compression Economics
- `codec-state-machine`: Codec State Machine
- `determinism`: Deterministic Decoding Contract
- `container`: Binary Container
- `header-schema`: Header and Manifest Schema
- `residual-coding`: Residual Coding Modes
- `entropy-sections`: Entropy-Coded Sections
- `predictor-interface`: Predictor Interface
- `predictor-families`: Predictor Families and Practical Meaning
- `implementation`: Implementation
- `correctness`: Correctness Conditions
- `results`: Benchmark Results and Use Cases

## Genetic Algorithms in TypeScript: An Interactive Launch Optimizer

13 original sections; 54 original blocks. Source: `src/content/docs/geneticTs.ts`.

- `motivation`: Motivation
- `fitness`: Genome Evaluation and Fitness
- `physics-model`: Physics Model and Termination
- `state-schema`: State and Configuration Schema
- `evolution`: Selection, Crossover, and Mutation
- `algorithm`: Evolution Algorithm
- `target-constraints`: Target Constraints and Reconfiguration
- `interaction`: Interactive Controls
- `convergence`: Convergence Criteria and Observability
- `implementation`: Implementation Shape
- `rendering-replay`: Rendering and Replay Mechanics
- `tradeoffs`: Tradeoffs and Limits
- `results`: Results and Design Properties

## Hearth: A Pleasantness-Constrained Saturation Device for Max for Live

10 original sections; 37 original blocks. Source: `src/content/docs/hearth.ts`.

- `motivation`: Motivation
- `architecture`: Signal Architecture
- `tube-lane`: Anti-Aliased Tube Lane
- `flux-memory`: Flux Memory Lane
- `warmth-servo`: Warmth Servo
- `controls`: Macro-First Interface
- `implementation`: Max for Live Implementation
- `ui-controls`: Interface Controls
- `tradeoffs`: Tradeoffs and Listening Context
- `audio-samples`: Audio Samples

## JaggerScript: A Browser-Runnable Typed Scripting Language

14 original sections; 58 original blocks. Source: `src/content/docs/jaggerscript.ts`.

- `motivation`: Motivation
- `language-model`: Language Model
- `compiler`: Parser and Compiler Pass
- `grammar`: Grammar and Surface Semantics
- `program-representation`: Typed Program Representation
- `runtime`: Interpreter Runtime
- `allocation`: Allocation and Object Identity
- `evaluation`: Evaluation Semantics
- `expression-semantics`: Expression Semantics
- `playground`: Browser Playground
- `diagnostics`: Diagnostics and Editor Tooling
- `runtime-errors`: Runtime Errors and Safety Checks
- `tradeoffs`: Tradeoffs and Missing Pieces
- `results`: Results and Design Properties

## LiveBoard: A Distributed Realtime Whiteboard With Durable Collaboration State

12 original sections; 111 original blocks. Source: `src/content/docs/liveboard.ts`.

- `system-object`: System Object
- `dashboard`: Dashboard and Folder Tree
- `canvas-state`: Canvas State and Shape Objects
- `operation-algebra`: Operation Algebra and Shared History
- `realtime-protocol`: Realtime Protocol
- `distributed-runtime`: Distributed Runtime
- `editor-geometry`: Editor Geometry and Interaction Model
- `tradeoffs`: Product and Architecture Tradeoffs
- `access-control`: Access Control, Sessions, and Removal
- `database`: Durable Data Layout
- `feature-flow-catalog`: Feature Flow Catalog
- `design-lessons`: Design Choices and Tradeoffs

## OJaml: An OCaml-Inspired Language Compiled to WebAssembly

14 original sections; 108 original blocks. Source: `src/content/docs/ojaml.ts`.

- `thesis`: Thesis and Design Contract
- `surface-language`: Surface Language
- `ast`: AST and Source Spans
- `static-semantics`: Static Semantics and Type Representation
- `stdlib`: Typed Standard Library
- `inference-proof`: Inference Proof Sketch
- `closures`: First-Class Functions and Closures
- `runtime-layout`: Runtime Value Representation
- `wasm-backend`: WebAssembly Backend
- `patterns`: Pattern Matching
- `tradeoffs`: Tradeoffs and Current Boundaries
- `tooling`: Monaco Tooling and Language Service
- `validation`: Validation Strategy
- `implementation-correspondence`: Implementation Correspondence

## Rengine: A Compact TypeScript Rendering and Game Engine Experiment

14 original sections; 56 original blocks. Source: `src/content/docs/rengine.ts`.

- `motivation`: Motivation
- `entities`: Entity Model
- `engine-types`: Engine Type Model
- `scenes`: Scenes and Runtime Loop
- `loop-scheduling`: Loop Scheduling
- `transform-composition`: Transform Composition
- `rendering`: Renderer Abstraction
- `renderer-contract`: Renderer Contract
- `components`: Component Behaviors
- `browser-surface`: Browser Inspection Surface
- `inspector-snapshots`: Inspector Snapshot Semantics
- `sample-suite`: Sample Scene Suite
- `tradeoffs`: Tradeoffs and Scope
- `results`: Results and Design Properties

## TSXLight Renderer: Server-Owned TSX Component Rendering

14 original sections; 55 original blocks. Source: `src/content/docs/tsxlightRenderer.ts`.

- `motivation`: Motivation
- `renderer-instances`: Per-User Renderer Instances
- `jsx-rendering`: TSX Rendering Pipeline
- `component-model`: Component Model
- `identity`: Identity and Callback Addressing
- `page-state`: Page and State Management
- `state-model`: State Persistence Model
- `render-algorithm`: Render Algorithm
- `communication`: Client Communication
- `socket-protocol`: Socket Event Protocol
- `security-isolation`: Isolation and Failure Boundaries
- `fit`: Where This Model Fits
- `rerender-consistency`: Rerender Consistency
- `results`: Results and Design Properties

## Authoring boundaries

Tutorials have prerequisites, ordered exercises, checkpoints, and variations. How-to guides address particular tasks. Reference retains exact implementation contracts and full examples; explanation retains design rationale and limits. Added guides distinguish browser demos from projects requiring their own running environments. No new command-line flags, benchmark outcomes, or implementation capabilities are inferred.

## Validation

The migration regression test compares original section hashes against pre-edit HEAD and checks that every section is represented in documentation. It validates narrative and task-guide deep links. Browser coverage checks all eight project sites, search results and empty states, invalid pages, legacy paper bookmarks, mobile overflow, theme persistence, and image viewing. Production browser checks use Vite preview so validation covers the built site.

To repeat the production browser checks, run `npm run build` followed by `PLAYWRIGHT_PREVIEW=1 npm run test:e2e` from `frontend/`.

## Counter syntax erratum

The later reader review found that JaggerScript's original representative Counter
used `func number next()`. The project's PEG grammar accepts `func next()`:
field and parameter declarations have types, but function declarations do not
have that return-type position. The reference example now uses the accepted
syntax. The method still returns the numeric field after incrementing it.
The essay includes a complete entry class and has been executed against the parser
and interpreter, producing 5 and 6.

The preservation check reconstructs this one historical signature for its original
hash comparison. All other original section content retains its baseline checks.
