import { chapter, type NarrativePlan } from "./types";
export const rengineNarrative: NarrativePlan = {
  name: "Rengine",
  subtitle:
    "A rendering runtime with nested transforms, ordered updates, and a live state inspector.",
  abstract:
    "Rengine is a two-dimensional rendering runtime built to make the relationship between scene state and rendered motion inspectable. Hierarchical transforms and ordered component updates produce engine state consumed by canvas and React renderers. A separate runtime snapshot exposes local and world transforms, component labels, and parent-child relationships without transferring ownership of live engine objects to the inspection UI. Sample scenes exercise nested motion, update ordering, and scheduling, with transform markers connecting rendered output to the state tree. The implementation provides an instrumented update-to-render path rather than a complete game engine, leaving assets, physics, collision, audio, and a retained editor format outside its scope.",
  sections: [
    chapter(
      "motivation",
      "An Inspectable Rendering Runtime",
      `
Rengine is a small two-dimensional runtime with nested transforms, ordered updates, and a live state inspector. Simple animated scenes keep rendered motion easy to compare with the hierarchy and components producing it.

The inspector exposes local and world transforms beside component labels. That makes parent motion, update order, and anchor placement observable without requiring a larger game to demonstrate them. Canvas and React renderers consume the same engine state.
`,
    ),
    chapter(
      "entities",
      "Entities and Hierarchy",
      `
Entities combine transform properties, an ordered component list, and a rendering function. Folder nodes apply a shared transform to children. The inspector traverses the same graph, retaining both grouping nodes and drawable entities.

Engine state owns scenes, active-scene selection, camera data, configuration, and renderer choice. The graph retains local transforms rather than flattening parent motion into child coordinates, preserving the hierarchy the renderer and inspector need to agree on.
`,
      ["engine-types"],
    ),
    chapter(
      "transform-composition",
      "Local and World Transforms",
      `
World matrices compose the parent’s world transform with the entity’s local translation, rotation, scale, and anchor offset. The numeric example below fixes zero anchors and unit scale to isolate parent rotation.

Anchor and position markers expose a separate source of apparent displacement. Comparing both with the parent basis distinguishes an anchor offset from an incorrect local value or composition order. That visibility is useful when nested motion produces a plausible image from an unexpected transform.
`,
    ),
    chapter(
      "scenes",
      "Scenes and Components",
      `
Components receive elapsed time, entity, scene, and engine state, then return the updated entity and state. Each entity’s component list is ordered: a later component receives earlier results, so conflicting writes have an observable precedence.

The inspector includes component labels alongside the resulting transform. Renderers consume the post-update state without implementing movement themselves, allowing the same behavior to run through either drawing surface.
`,
      ["components"],
    ),
    chapter(
      "loop-scheduling",
      "The Frame Loop",
      `
Timer and animation-frame scheduling share the sequence of scene updates, global update hook, rendering, and next-state retention. Components receive delta time from that loop.

The portfolio integration uses milliseconds and caps a large delta at 32 ms. That limits the jump after a suspended tab, but intentionally drops elapsed time rather than providing a fixed-step simulation guarantee. The cap belongs to the integration’s presentation policy.
`,
    ),
    chapter(
      "renderer-contract",
      "Canvas and React Rendering",
      `
The canvas renderer issues 2D commands; the React path emits positioned DOM elements with transforms. They consume the same entity and engine state without promising identical drawing or debugging features.

Canvas wireframes, blue and red transform markers, and relationship lines expose projection against the inspector’s values. Comparing those views helps separate a component’s state update from the renderer’s interpretation of it.
`,
      ["rendering"],
    ),
    chapter(
      "inspector-snapshots",
      "The State Behind the Picture",
      `
The inspector snapshots IDs, kinds, component labels, transforms, and children from the changing graph. React displays those observations without taking ownership of the canvas loop’s live objects.

The snapshot carries both local and composed world values. Inspecting only the final image could conceal an incorrect hierarchy; inspecting only local values could misattribute inherited motion to a component. Keeping both in the observation makes the state-to-image comparison useful.

Expansion state and display preferences stay in the inspection UI. Scene changes filter those preferences against the new IDs, preventing stale references without mutating the engine graph. Camera controls, scene selection, and tree preferences therefore have distinct state owners.
`,
      ["browser-surface"],
    ),
    chapter(
      "sample-suite",
      "Sample Scenes and Limits",
      `
Nested scenes exercise transform composition together with component updates. Stacked orbits rotate children under parents, layered motion nests folders, and counter drift combines updates. Square and star paths exercise timing, while repeated arrays exercise construction and grouping. Each scene gives the image a state tree to compare against.

The canvas and tree provide two views of the same scene. Expected motion should correspond to the hierarchy and world transforms, and a scene switch should remove inspector references to the old graph. A plausible image alone can conceal incorrect state or stale inspection data.

Rengine stops short of assets, physics, collision, audio, and a retained editor format. Its scope keeps the update-to-render path inspectable: the hierarchy, component labels, and transform markers provide an account of motion that can be checked against the live state.
`,
      ["tradeoffs", "results"],
    ),
  ],
};
