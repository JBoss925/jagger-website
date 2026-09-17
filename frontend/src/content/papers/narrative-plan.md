# Narrative plan for the technical papers

The papers explain each project’s design, implementation, results, and limits for readers already familiar with the subject. Concrete examples support that explanation without imposing one example on the entire article. Each section develops a question or consequence raised by the preceding explanation. Examples connect those topics without turning the article into a tutorial. Length follows the explanation; there is no fixed word count or percentage-reduction target.

## Editorial rules

- Open with the problem and the constraint that makes it interesting.
- Use examples where they clarify a specific design choice or implementation boundary. Assume familiarity with standard terms and mechanisms; retain explanations of project-specific behavior.
- Introduce mechanisms where their relationship to the previous topic is clear. Explain the choice, its effects, and its limits. Use declarative section titles.
- Keep enough implementation detail to explain data flow, state changes, representations, and correctness. Use compact code and equations where they clarify the example.
- Put diagrams, screenshots, and audio beside the mechanism they explain. Detailed structural diagrams can remain in docs when they are better read as reference.
- Deep-link full grammars, exhaustive schemas, parameter catalogs, setup details, and complete test inventories. Do not replace a necessary explanation with a documentation link.
- End with validation, tradeoffs, supported scope, and extension boundaries. Distinguish reported measurements from fresh tests or suggested verification scenarios.
- Follow the design dependencies without reader instructions or invented autobiographical history. The source supports design and implementation claims; it does not establish the author's personal chronology or unrecorded failed experiments.

## Plans by project

### OJaml

Reader outcome: A source program reaches real WebAssembly execution and produces coherent editor feedback.

Examples: A recursive function illustrates syntax; a typed map illustrates library relationships; a returned adder illustrates captured state. Each serves its own section rather than framing the whole article.

1. **A Language in the Browser.** OJaml is an OCaml-inspired language with a TypeScript compiler and browser playground. Source and documentation sections: `thesis`.
2. **The Surface Language.** OJaml keeps OCaml-style application, let bindings, recursion, and matching. Source and documentation sections: `surface-language`.
3. **The Syntax Tree and Source Spans.** The AST retains expression spans and separate binder spans. Source and documentation sections: `ast`.
4. **Type Inference.** OJaml’s inference uses fresh type variables and unification, with later references following the pruned representative. Source and documentation sections: `static-semantics`, `inference-proof`.
5. **The Standard Library.** Standard-library schemes instantiate fresh variables at each use while preserving repeated variables within that use. Source and documentation sections: `stdlib`.
6. **Runtime Values and Memory.** Every generated function boundary carries values in i32 slots. Source and documentation sections: `runtime-layout`.
7. **Pattern Matching.** Matching lowers against those same heap layouts. Source and documentation sections: `patterns`.
8. **Closures.** Known functions retain a direct-call path. Source and documentation sections: `closures`.
9. **The WebAssembly Backend.** Emission combines those decisions into a WAT module: direct definitions, closure wrappers, program-specific indirect-call types, runtime helpers, and static data. Source and documentation sections: `wasm-backend`.
10. **Compiler Feedback in the Editor.** Monaco consumes checked token metadata for inferred and instantiated types. Source and documentation sections: `tooling`.
11. **Validation and Limits.** Validation crosses both sides of the checker/backend boundary. Source and documentation sections: `validation`, `tradeoffs`, `implementation-correspondence`.

Visuals: editor preview and pipeline graph; compact function-value call flow; a small factorial program. Full AST and runtime layouts remain in the linked reference.

### LiveBoard

Reader outcome: One gesture agrees across geometry, authoritative storage, shared history, delivery, and recovery.

Running example: A rectangle dragged and recolored by two collaborators.

1. **A Shared Canvas.** LiveBoard is a collaborative whiteboard with shared undo and durable history. Source and documentation sections: `system-object`.
2. **The Document Model.** A canvas is an ordered JSON document with stable shape IDs, geometry, style, and optional background color. Source and documentation sections: `canvas-state`.
3. **Editor Geometry.** The SVG viewBox defines the viewport’s document-space region. Source and documentation sections: `editor-geometry`.
4. **An Edit and Its Undo.** The backend derives each inverse from the saved state it actually changes. Source and documentation sections: `operation-algebra`, `database`.
5. **Previews, Commits, and Recovery.** Throttled previews cover drag, resize, and rotation; the final operation takes the durable transaction path. Source and documentation sections: `realtime-protocol`.
6. **Multiple Servers and Presence.** With multiple backend replicas, committed state alone does not deliver an edit to every socket. Source and documentation sections: `distributed-runtime`.
7. **Access Control.** Ownership or current membership authorizes both HTTP requests and socket messages, using an httpOnly session cookie. Source and documentation sections: `access-control`.
8. **The Dashboard.** The saved document also belongs to a workspace. Source and documentation sections: `dashboard`.
9. **Validation and Tradeoffs.** A group move followed by undo exercises geometry, previews, committed state, and history together. Source and documentation sections: `design-lessons`, `tradeoffs`, `feature-flow-catalog`.

Visuals: editor, folder, and sharing screenshots; runtime boundary, cross-replica fanout, and recovery graphs. Position each beside the behavior it explains.

### Hearth

Reader outcome: The musical target determines the lanes, compensation, adaptive behavior, and interface.

Running example: A transient-rich source compared with brighter and denser material.

1. **Warmth Without Losing the Attack.** Turning up saturation can add body and dull an attack in the same gesture. Source and documentation sections: `motivation`.
2. **The Sound of the Device.** The wet/dry comparisons include the complete device, including compensation and output gain. Source and documentation sections: `audio-samples`.
3. **The Signal Path.** Input conditioning removes DC before a pre-emphasized audio path feeds the tube, flux, and bloom contributions. Source and documentation sections: `architecture`.
4. **The Tube Lane.** The tube lane uses smooth curvature with controllable asymmetry to produce even as well as odd harmonics. Source and documentation sections: `tube-lane`.
5. **Flux Memory.** The flux lane adds a direction-dependent approach rate to a small memory state. Source and documentation sections: `flux-memory`.
6. **Bloom and the Warmth Servo.** Bloom adds a transient-gated contribution alongside the tube and flux lanes. Source and documentation sections: `warmth-servo`.
7. **The Controls.** The main macro couples drive, tone, and character along a chosen mapping. Source and documentation sections: `controls`, `ui-controls`.
8. **The DSP Core and Device Wrapper.** The GenExpr source generates the Gen DSP core and Max for Live wrapper. Source and documentation sections: `implementation`.
9. **A Live Device’s Limits.** Local anti-aliasing and bounded flux state suit the device’s low-latency target. Source and documentation sections: `tradeoffs`.

Visuals: device preview, signal-flow graph, harmonic and servo illustrations, and matched wet/dry audio in the listening chapter.

### JaggerScript

Reader outcome: Trace source through normalized nodes, allocation, frames, field mutation, and diagnostics.

Example: Counter supplies a compact runtime trace; nested construction and reference access expose the implementation’s receiver and storage boundaries.

1. **An Explicit Object Runtime.** JaggerScript is a small object-oriented language implemented in TypeScript, with a PEG parser, interpreter, and browser playground. Source and documentation sections: `motivation`.
2. **The Class Model.** Programs consist of classes with fields, functions, and constructors, using primitive values and object references. Source and documentation sections: `language-model`.
3. **Parsing and Normalization.** PEG output includes both language constructs and grammar helper nodes. Source and documentation sections: `compiler`, `grammar`, `program-representation`.
4. **Frames, Heap, and Receiver State.** Function frames hold parameters and local bindings; heap-backed instance scopes hold fields. Source and documentation sections: `runtime`.
5. **Object Construction.** Construction allocates an instance, temporarily selects it for field initialization, restores the prior running instance, then invokes the constructor against the new object. Source and documentation sections: `allocation`.
6. **Calls and Control Flow.** Invocation evaluates arguments before binding them into a new frame, then executes normalized runtime nodes with the selected receiver. Source and documentation sections: `evaluation`, `expression-semantics`.
7. **Runtime Errors.** Member lookup rejects a primitive where an instance is required, and field assignment rejects incompatible values. Source and documentation sections: `runtime-errors`.
8. **The Playground.** Monaco displays parser failures as diagnostic ranges. Source and documentation sections: `playground`, `diagnostics`.
9. **Validation and Scope.** The Counter trace checks persistent field mutation, but nested references and construction are stronger tests of receiver handling. Source and documentation sections: `tradeoffs`, `results`.

Visuals: a complete counter program and the heap-reference flow. Full token and grammar inventories remain linked.

### AIXC

Reader outcome: Build an exact reconstruction contract before evaluating compression economics.

Running example: Encoder and decoder observing the same actual units after hits and misses.

1. **A Small Archive and a Large Model.** One recorded Shakespeare experiment produces a 3,760-byte archive and needs an 11.3 MB model to decode it. Source and documentation sections: `motivation`.
2. **The Codec Loop.** Stored seed material initializes shared context. Source and documentation sections: `reference-codec`, `codec-state-machine`.
3. **The Next Reconstructed Unit.** The reconstruction invariant is prefix equality. Source and documentation sections: `correctness`.
4. **Compression Costs.** For the simplest byte scheme, one decision bit plus an eight-bit literal on each miss gives approximately 1 + 8m bits per byte at miss rate m, excluding seed and metadata. Source and documentation sections: `compression-economics`.
5. **Information in a Wrong Guess.** Rank residuals store the actual unit’s position in the predictor’s candidate order. Source and documentation sections: `residual-coding`, `entropy-sections`.
6. **Deterministic Prediction.** Reproducible candidate order depends on more than model version. Source and documentation sections: `determinism`, `predictor-interface`.
7. **The Archive Format.** A fixed header and aligned sections store seed material, decisions, residuals, and optional metadata. Source and documentation sections: `container`, `header-schema`.
8. **Predictors and the Workbench.** The same archive rules allow different predictors to be compared without changing the reconstruction loop. Source and documentation sections: `implementation`, `predictor-families`.
9. **The Model Still Counts.** The workbench’s recorded results put the opening dependency question into numbers. Source and documentation sections: `results`.

Visuals: codec preview, lockstep prediction flow, archive-layout and residual diagrams, and the small byte-cost equation beside its interpretation.

### GeneticTS

Reader outcome: Explain evaluation, fitness, breeding, exploration, reproducibility, and sustained convergence.

Running example: One launch velocity becomes a population, then the target moves.

1. **A Population of Shots.** GeneticTS evolves a ball’s launch velocity in a Matter.js scene. Source and documentation sections: `motivation`.
2. **Physics Evaluation.** Each genome runs in a fresh Matter.js world with identical bounds, ball, target, and field settings. Source and documentation sections: `physics-model`.
3. **The Value of a Near Miss.** Misses rank by closest approach over the trajectory, with a small path-length tie breaker. Source and documentation sections: `fitness`.
4. **Velocities Passed Forward.** Elites are copied unchanged and parent selection is rank-biased within the leading portion of the evaluated population. Source and documentation sections: `evolution`, `algorithm`.
5. **The Paths on Screen.** Stored rollout paths are drawn as SVG polylines, and the best attempt is replayed at a fixed visual pace. Source and documentation sections: `rendering-replay`.
6. **A Moving Target.** Moving the target invalidates the scene under which the population was ranked. Source and documentation sections: `interaction`, `target-constraints`.
7. **The Same Run Again.** Evaluation and breeding run outside the React playback surface. Source and documentation sections: `implementation`, `state-schema`.
8. **A Hit and a Solved Scene.** Solved status requires the configured population hit-rate threshold for consecutive generations. Source and documentation sections: `convergence`, `tradeoffs`, `results`.

Visuals: simulation preview, genome representation, next-generation flow, and replay diagrams. Explain best paths and ghosts as observations of evaluated attempts.

### Rengine

Reader outcome: Explain the image through hierarchy, local/world transforms, timed components, renderers, and inspection.

Running example: A child box under a moving or rotating folder.

1. **An Inspectable Rendering Runtime.** Rengine is a small two-dimensional runtime with nested transforms, ordered updates, and a live state inspector. Source and documentation sections: `motivation`.
2. **Entities and Hierarchy.** Entities combine transform properties, an ordered component list, and a rendering function. Source and documentation sections: `entities`, `engine-types`.
3. **Local and World Transforms.** World matrices compose the parent’s world transform with the entity’s local translation, rotation, scale, and anchor offset. Source and documentation sections: `transform-composition`.
4. **Scenes and Components.** Components receive elapsed time, entity, scene, and engine state, then return the updated entity and state. Source and documentation sections: `scenes`, `components`.
5. **The Frame Loop.** Timer and animation-frame scheduling share the sequence of scene updates, global update hook, rendering, and next-state retention. Source and documentation sections: `loop-scheduling`.
6. **Canvas and React Rendering.** The canvas renderer issues 2D commands; the React path emits positioned DOM elements with transforms. Source and documentation sections: `renderer-contract`, `rendering`.
7. **The State Behind the Picture.** The inspector snapshots IDs, kinds, component labels, transforms, and children from the changing graph. Source and documentation sections: `inspector-snapshots`, `browser-surface`.
8. **Sample Scenes and Limits.** Nested scenes exercise transform composition together with component updates. Source and documentation sections: `sample-suite`, `tradeoffs`, `results`.

Visuals: engine preview, folder composition, world-transform relationship, frame-operation flow, renderer and inspector diagrams.

### TSXLight

Reader outcome: Follow a click through per-user identity, callback lifetime, page state, and delivery.

Running example: A counter button whose handler and state live on the server.

1. **Server-Owned Components.** TSXLight keeps component instances, state, and callbacks on the server. Source and documentation sections: `motivation`.
2. **The Component Tree.** The custom JSX factory produces intrinsic tag records with props and children, or component records identifying stateful server objects. Source and documentation sections: `component-model`, `jsx-rendering`, `render-algorithm`.
3. **Renderer Instances.** Each user receives a renderer instance owning component context, active page, template, callback registrations, and output destination. Source and documentation sections: `renderer-instances`.
4. **Callback Identity.** Rendering registers a function and receiver with the callback manager, then emits an identifier and bridge code into markup. Source and documentation sections: `identity`.
5. **The Event Round Trip.** The shell sends context, callback identity, event name, and serialized event data over the socket. Source and documentation sections: `communication`, `socket-protocol`.
6. **The View After the Click.** State mutation, callback-table replacement, HTML generation, and delivery must preserve the correspondence between visible elements and registered behavior. Source and documentation sections: `rerender-consistency`.
7. **Page Transitions and State.** Navigation coordinates unload, outgoing-state save, active-page assignment, rendering, and load. Source and documentation sections: `page-state`, `state-model`.
8. **Connection Isolation.** Dispatch resolves addresses within the connection’s user renderer and active page. Source and documentation sections: `security-isolation`.
9. **Latency and Scope.** Server-owned components suit controlled shells and internal tools where central state and a thin client justify connection-dependent interaction. Source and documentation sections: `fit`, `results`.

Visuals: renderer preview, isolation relationship, callback dispatch, page transition, and consistent-rerender diagrams.

## Completion criteria

All eight papers have a complete arc from problem to a working implementation and its validation. Every original documentation section is either a chapter source or a linked supporting source. Existing screenshots, graphs, and audio remain available in the docs and are woven into the papers where they support the narrative. No personal origin stories, implementation capabilities, or fresh benchmark outcomes are invented. The paper remains understandable without opening every documentation link.
