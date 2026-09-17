# Reader review and revisions

The review follows the rendered essay sequence, including examples, equations,
diagrams, and links. The assumed reader knows general programming or the subject's
basic setting, but has no prior knowledge of these projects. Definitions stay with
their first use; exhaustive reference remains in docs.

## OJaml

- **Unclear opening:** “ML-style” and “real compiler” assume a language background. The opening now identifies an OCaml-inspired language and describes parsing, checking, and WebAssembly execution.
- **Missing running example:** Factorial was discussed for several sections before its code appeared. The existing runnable example now appears in The Surface Language, with its result, rec, match, underscore, and main explained.
- **Undefined compiler terms:** Source spans, binders, unification, and the type environment now have local definitions.
- **Opaque representation:** i32, boxed values, and heap addresses now have concrete meanings. The polymorphic signature example explains how a repeated type variable relates arguments and results.
- **Weak closure example:** The article now shows an executed captured-offset program returning 12 and explains the table index, environment pointer, and free-variable analysis.
- **Order and repetition:** Pattern Matching now follows memory layouts, before Closures. The repeated catch-all explanation is replaced by one coverage account. WAT, WABT, and Monaco are introduced by role.

## LiveBoard

- **Crowded introduction:** The product setting and durable/transient distinction now precede the backend details in separate paragraphs.
- **Abstract document terminology:** Shape identity, patching, and draw order now use the rectangle example explicitly.
- **Unexplained geometry:** SVG and viewBox are defined; a numerical zoom example shows why screen movement differs from document movement.
- **Unclear shared undo:** An inverse is explained with blue-to-red, row locking explains the committed order, and undo is explicitly shared across editors. The equation's symbols are identified.
- **Optimism and recovery without an example:** Local commit optimism and echo deduplication are now stated. A revision-12 client receiving revision 14 illustrates a missing commit and snapshot recovery.
- **Distributed jargon and repetition:** WebSockets, Pub/Sub, fanout, TTL, and presence are defined. Membership removal and invalidation are explained once, including changes after connection.

## Hearth

- **Undefined target:** Saturation, harmonics, warmth, and the Ableton/Max for Live setting now appear before the signal-path detail.
- **Undefined processing terms:** DC offset, transfer curve, asymmetry, pre/de-emphasis, aliasing, and ADAA have explanations tied to their effects.
- **Unclear flux claim:** Hysteresis is described as dependence on recent history; the lightweight approximation's scope remains explicit.
- **Bloom and controller conflation:** Transients, gating, and adaptive control distinguish the lane from the servo. The energy terms, epsilon, and sample-time notation explain the brightness equation.
- **Ambiguous plots:** Both chart captions identify the curves as conceptual illustrations rather than measured device responses.
- **Interface and listening context:** Macro, DSP, GenExpr, dry, and wet are defined. The samples' switching behavior is connected to what each source exposes.

## JaggerScript

- **Late example and missing entry:** The counter now appears in The Language Model as a complete program. The main-function convention is stated, and the 4 → 5 → 6 behavior is explicit.
- **Rejected syntax:** The original “func number next()” does not parse. The essay and linked reference use “func next()”; a migration erratum records the correction without weakening other preservation checks.
- **Parser terminology:** PEG and normalization are defined before their consequences are discussed.
- **Typing ambiguity:** Typed TypeScript node categories are distinguished from static checking of the user's program.
- **Runtime jargon:** Heap, frame, receiver/running instance, and the constructor's persistent field versus temporary argument are explained. The complete example has been executed with the actual parser and interpreter.

## AIXC

- **Undefined inputs:** Unit, token ID, seed, context, and residual are introduced before the codec mechanics.
- **No concrete reconstruction:** A schematic ABBA trace uses a previous-unit predictor. Its miss changes the next prediction, exposing why both sides must observe the recovered unit.
- **Abstract cost formula:** The 25% miss-rate example gives three bits per byte before overhead. Entropy coding and rank coding are tied to the streams they reduce.
- **Predictor/container confusion:** The manifest identifies reproducible settings; it does not supply model weights. Rank and top-k fallback are explained concretely.
- **Unclear comparison:** LZP and sidecar models are distinguished by their dependency costs. LogHub, the ratio's denominator, percentages, and model amortization explain what the reported results mean.

## GeneticTS

- **Undefined algorithm vocabulary:** Candidate/genome, population, generation, fitness, elite, rank-biased selection, crossover, and mutation have definitions at their first use.
- **Simulation/animation ambiguity:** Matter.js, the fixed step, rollout, and stored-path playback are distinguished.
- **Abstract variation:** A schematic pair of parent velocities shows blending and jitter; it makes no claim to be a recorded hit.
- **Overstated reproducibility:** Reproduction requires the same population and environment as well as the seeded random generator.
- **Unclear visual/status terms:** Ghost trajectories, hit rate, and consecutive-generation solved status are explained. The speculative claim about pause behavior is removed.

## Rengine

- **Missing product context:** The opening identifies a 2D engine and inspector, then defines entity and folder as scene concepts.
- **Unexplained coordinate composition:** Local/world spaces, matrices, operation order, and equation symbols are explained. A numeric parent/child rotation diagram fixes the example's anchors and scale.
- **Update ambiguity:** Ordered components are described through competing position writes; the unrelated ECS comparison is removed.
- **Timing ambiguity:** Delta time and both schedulers are defined. Milliseconds and the 32 ms cap are explicitly features of the portfolio integration.
- **Output/inspection ambiguity:** Canvas and DOM targets have distinct descriptions. The snapshot is an observation, not a second simulation, and each sample scene is connected to the relationship it exercises.

## TSXLight

- **Missing framework context:** TSX, JSX, Electron, and shell are introduced before the renderer mechanics; a small button expression illustrates the authoring syntax.
- **Object/markup confusion:** Intrinsic records, server components, rendered HTML, and lifecycle hooks have distinct roles.
- **Callback ambiguity:** The receiver and registration lifetime are explained, including a current view versus a replaced view. The renderer equation's symbols have a legend.
- **Missing interaction trace:** A schematic 4 → 5 counter event follows bridge, resolution, mutation, render, and delivery.
- **State/scope ambiguity:** Page and transition state are defined, full-view replacement is stated, and callback routing identity is distinguished from establishing the connection's user.

## Verification

- The full Counter program prints 5 and 6 using JaggerScript's parser and interpreter.
- OJaml's factorial and captured-offset examples compile to valid WebAssembly and return 120 and 12.
- The codec trace, numerical transform example, and variation example are schematic, not benchmark measurements.
- Existing preservation, documentation-link, voice, build, and browser checks cover the final drafts.
