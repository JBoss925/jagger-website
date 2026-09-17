export const projectGuides = {
  ojaml: {
    steps: [
      "Open the browser editor at /ojaml. You need a browser with WebAssembly support; the compiler executes locally.",
      "Replace the source with the small program below and run it. Read the captured output before changing the program.",
      "Hover over n and square to inspect the inferred types. Change square 9 to square 2.5 and run again. This exercises the distinction between integer and floating-point representations.",
      "Checkpoint: the first program prints 81. Now replace the argument with a string. The checker should report a type conflict before the program reaches WebAssembly execution.",
    ],
    code: "let square n = n * n\nlet main = println (square 9)",
    tasks: [
      {
        title: "Separate editor diagnostics from runtime traps",
        steps: [
          "If a program does not run, first inspect its parse or type markers. Fix names, incompatible branches, and argument relationships before inspecting generated WebAssembly.",
          "If checking succeeds but execution traps, inspect collection accesses: negative array lengths, out-of-bounds indices, empty-list head/tail, and absent map keys are guarded runtime failures. They are not recoverable OJaml exceptions.",
          "Reduce the input to one failing operation, rerun it in a fresh module instance, and compare the result with the runtime-layout and validation reference. A fresh instance also avoids confusing module-lifetime allocation with persistent editor state.",
        ],
      },
      {
        title: "Add a builtin consistently",
        steps: [
          "Start with its signature and type factory in check.ts. Repeated variables in a polymorphic signature must share the intended relationships, while separate call sites receive fresh variables.",
          "Add its arity, emitted safe name, and runtime helper in compiler.ts. Select its value interpretation from checked types rather than guessing from an i32.",
          "Expose the shared signature to Monaco. Validate accepted execution and rejected type mismatches; a completion entry alone does not implement a builtin.",
        ],
      },
    ],
  },
  liveboard: {
    steps: [
      "Open the deployed LiveBoard application linked from its repository and sign in with two separate accounts. This exercise requires a running backend, PostgreSQL, and a collaboration session; it is not a standalone browser demo.",
      "Create a canvas as its owner and add the second account as a member. Open the same canvas in separate browser sessions.",
      "Create a rectangle and drag it while watching the second session. Stop dragging to commit the edit. Then change its color and invoke undo.",
      "Checkpoint: both sessions should settle on the same shape state after the commit and shared undo. Refresh the second session to check that the saved state agrees with what collaboration displayed.",
    ],
    code: null,
    tasks: [
      {
        title: "Recover after a missed collaboration update",
        steps: [
          "Treat the saved revision as the ordering signal. A preview is not a durable revision and should not be used to reconstruct saved state.",
          "On a gap, reconnect, or rate-limit recovery, follow the snapshot/resynchronization contract in the realtime protocol. Replace stale assumptions with authoritative state rather than replaying arbitrary transient previews.",
          "Verify the canvas state and undo/redo availability after synchronization. Redis fanout delivers events; PostgreSQL supplies the recovery truth.",
        ],
      },
      {
        title: "Diagnose cross-replica collaboration",
        steps: [
          "Connect collaborators through different backend replicas. Confirm that each process owns its local sockets and that Redis room fanout reaches the other process.",
          "Check presence TTLs and connection identities when a user has multiple tabs. A disconnected tab is not necessarily a departed user.",
          "If durable edits exist but remote clients miss notifications, inspect Redis coordination and revision recovery separately. Do not fix notification loss by promoting an ephemeral cache to canvas authority.",
        ],
      },
    ],
  },
  hearth: {
    steps: [
      "Use Max 10 or newer with Ableton Live and the Hearth repository files. Keep Hearth.maxpat and Hearth-Core.gendsp together.",
      "Open Hearth.maxpat in Max, save it as a Max Audio Effect, and place the resulting device on an audio track in Live.",
      "Loop a familiar clip. Begin with a conservative setting of the main Hearth macro, then increase it gradually while comparing bypassed and processed audio. Match output level so louder audio does not become the sole reason for preferring a setting.",
      "Checkpoint: you should hear added body or character. Compare a bright source with a duller source and listen for how the bounded Warmth Servo changes the operating region. Use the paper\u2019s matched wet/dry samples as listening context, not a universal preset.",
    ],
    code: null,
    tasks: [
      {
        title: "Load the device and resolve a missing core",
        steps: [
          "Confirm that the generated wrapper and Gen DSP core are in the same directory before opening the patch. The wrapper alone is not the full signal implementation.",
          "Open with the supported Max version, save as a Max Audio Effect, and load the resulting device into an audio track. Verify that the audio path works before diagnosing individual macro settings.",
          "For source changes, use the repository build script to regenerate Max files from GenExpr. Keep generated artifacts aligned with the source core.",
        ],
      },
      {
        title: "Compare warmth without mistaking level for quality",
        steps: [
          "Loop the same passage and match output level between bypass and processed playback. Adjust the primary macro first, then refine source preparation, density lanes, adaptive control, and blend/output in signal order.",
          "Listen separately for attack rounding, upper-band glare, DC or stereo drift, and denser low mids. A full bus and a transient-heavy instrument need not benefit from the same emphasis.",
          "If brightness becomes abrasive, reduce the risky contributions and inspect adaptive control before increasing more drive. The servo is bounded assistance, not a mastering guarantee.",
        ],
      },
    ],
  },
  jaggerscript: {
    steps: [
      "Open /jaggerscript and select a built-in example that constructs an object and calls a method. Using an existing runnable example avoids guessing an entry-point convention.",
      "Run the example unchanged and record its output. Locate the class fields, constructor arguments, and method that changes a field.",
      "Change one numeric constructor argument, rerun, and compare the output. Then change a declared type name to an unknown name and inspect the editor marker. Restore it before continuing.",
      "Checkpoint: valid source reaches execution; malformed source or an unknown declared type is marked by tooling. Next inspect the Counter fragment below and identify the frame-local argument and the heap-backed field. The fragment defines a class; it is not a complete runnable entry program.",
    ],
    code: "class Counter {\n  number value = 0;\n  constructor(number start) { value = start; }\n  func number next() {\n    value = value + 1;\n    return value;\n  }\n}",
    tasks: [
      {
        title: "Trace an invalid member access",
        steps: [
          "First confirm parsing succeeds. Editor checks are lightweight and do not establish full expression-type safety.",
          "Follow the scoped variable path one instance at a time. Each intermediate reference must be an instance and each requested field must exist in its global scope.",
          "For an assignment failure, compare the stored field type with the assigned value type. For a missing local, inspect the current function frame rather than a previous invocation\u2019s frame.",
        ],
      },
      {
        title: "Extend syntax without leaking parser helpers",
        steps: [
          "Add the syntax production to the PEG grammar, then normalize it into an explicit runtime token. Keep whitespace and parser helper nodes out of the interpreter contract.",
          "Implement the token\u2019s state transition with explicit handling of frames, heap references, return, and break where relevant.",
          "Exercise a valid program and a malformed or invalid-state case. Update diagnostics and tokenizer rules where the new syntax affects the editor.",
        ],
      },
    ],
  },
  "aixc-compressor": {
    steps: [
      "Use the AIXC repository\u2019s reference codec and test fixtures. You need its Python/C build environment; a predictor must be available to both encoder and decoder. Start with the toy backend rather than provisioning a large model.",
      "Select a short fixture with repeated text. Encode and decode it with the same predictor configuration and compare the reconstructed bytes to the source byte for byte.",
      "Inspect the seed, hit decisions, and miss residuals in the reference loop. For a miss, confirm that the actual source unit\u2014not the prediction\u2014becomes the next context unit on both sides.",
      "Checkpoint: reconstructed bytes equal the input. Deliberately change predictor identity or a determinism setting and confirm compatibility validation rejects the mismatch. Exact command flags depend on the repository version; use its current entry-point help rather than inferred flags.",
    ],
    code: null,
    tasks: [
      {
        title: "Validate an archive before decoding",
        steps: [
          "Check magic, compatible modes, section offsets and lengths, and integrity metadata before making predictor calls or allocating from untrusted counts.",
          "Compare the predictor fingerprint and manifest, including tokenizer identity, tie-break rules, unit mode, and runtime switches that can affect predictions.",
          "Decode only under a compatible contract. Confirm residual consumption and output size, then compare reconstructed bytes or the recorded integrity value. A plausible-looking text result is not a correctness check.",
        ],
      },
      {
        title: "Report compression costs honestly",
        steps: [
          "Use identical input bytes and document predictor, residual, and entropy modes for every comparison. Record archive size, runtime, and any model or sidecar bytes required by the decoder.",
          "Report archive-only cost and complete deployment cost separately. State when a model is already shared across many archives and what assumption makes that amortization appropriate.",
          "Do not generalize selected corpus-specific results to arbitrary files. Compare against self-contained baselines under the same accounting boundary.",
        ],
      },
    ],
  },
  "genetic-ts": {
    steps: [
      "Open /genetic-ts and let the default scene evolve. Identify the best trajectory, ghost paths, generation count, and hit rate.",
      "Wait for at least one successful shot. Compare a single hit with the sustained solved indicator; these are different conditions.",
      "Move the target, then change wind while keeping the other settings stable. Watch previously successful trajectories stop fitting the environment and new attempts begin to recover.",
      "Checkpoint: you can explain why the best shot alone does not describe the population. Repeat with a higher mutation rate and compare diversity and recovery, changing one variable at a time.",
    ],
    code: null,
    tasks: [
      {
        title: "Compare search settings reproducibly",
        steps: [
          "Keep seed, target, gravity, wind, and sizes fixed while varying a single search parameter. Reproducing a generation requires the same environment as well as seeded randomness.",
          "Compare hit rate, best minimum distance, solved streak, and ghost paths. Increasing population size also increases rollout work, so compare cost alongside convergence.",
          "After moving the target, interpret old genomes as starting material rather than evidence that the new scene is solved. Distinguish animation replay controls from optimizer state.",
        ],
      },
      {
        title: "Investigate a population that stops improving",
        steps: [
          "Check whether the target and field changed, whether the best candidate is a near miss or an actual hit, and whether trajectories have collapsed into a narrow family.",
          "Review mutation, elite share, and the random reset tail. Elitism preserves successful knowledge; mutation and resets address different exploration scales.",
          "Inspect rollout termination and frame budget before blaming selection. Floor settling and repeated bounces can end attempts, and the two-number genome cannot learn mid-flight control.",
        ],
      },
    ],
  },
  rengine: {
    steps: [
      "Open /rengine and choose a scene with nested motion. Expand the runtime tree while watching its canvas.",
      "Locate a child and its parent folder. Compare the child\u2019s local and world transform values, then enable wireframe or transform markers.",
      "Switch to another sample scene. Identify which component labels explain the changed movement and how parent motion contributes to the final position.",
      "Checkpoint: explain one visible orbit using hierarchy and local/world values. Zoom changes your inspection view; it should not be mistaken for a new entity transform.",
    ],
    code: null,
    tasks: [
      {
        title: "Debug a child that renders in the wrong position",
        steps: [
          "Identify the entity and its parent chain in the runtime tree. Compare local position, anchor, scale, and rotation with the resulting world transform.",
          "Enable debug markers and compare the renderer\u2019s anchor and position basis with the inspector. If local values are correct, inspect folder composition before rewriting the child\u2019s position.",
          "Check ordered component updates and elapsed time when the error appears only during motion. A snapshot is an inspection view, not the mutable engine graph itself.",
        ],
      },
      {
        title: "Add an update behavior without moving it into rendering",
        steps: [
          "Attach a component to the entity and use delta time for time-dependent motion. Return updated entity and engine state under the component contract.",
          "Give the component an inspectable label and account for its order relative to other components on the entity.",
          "Project the same updated state through the chosen renderer. Keep simulation decisions out of drawing so canvas and React remain alternative views of the engine state.",
        ],
      },
    ],
  },
  "tsxlight-renderer": {
    steps: [
      "Use the TSXLight repository\u2019s example shell and server with two isolated user contexts. This project requires a connected server; it is not a client-only TSX playground.",
      "Render the same example page in both contexts and invoke an existing callback in one shell. Observe the server-owned state change and resulting markup delivery.",
      "Confirm the second renderer\u2019s page state remains independent. In the first shell, navigate or rerender and inspect the replacement callback registrations.",
      "Checkpoint: trace an interaction from shell event to renderer, active page, callback invocation, state change, and delivered markup. Confirm an old callback identity no longer addresses a removed tree entry.",
    ],
    code: null,
    tasks: [
      {
        title: "Investigate a stale callback after rerender",
        steps: [
          "Check the user/renderer and active-page identity before resolving the callback. A callback ID without its ownership context is insufficient.",
          "Inspect callback-table replacement and markup delivery order. The shell must not keep addressing registrations from an old component tree.",
          "Reproduce across a page transition and a duplicate connection. Apply the isolation contract before adding retries that might invoke a callback twice.",
        ],
      },
      {
        title: "Evaluate whether server ownership fits an interface",
        steps: [
          "Measure the event round trip in the target shell and network conditions. Every meaningful server-owned interaction includes connection delay.",
          "Decide whether centralized state and thin clients help the intended workflow. Controlled shells and internal tools are the demonstrated fit; rich browser-local drawing and offline interaction require additional architecture.",
          "Review per-user state, persistence assumptions, and connection lifecycle explicitly. Do not interpret TSX authoring as evidence of React-style client ownership.",
        ],
      },
    ],
  },
};
