import renginePreview from "../../assets/rengine-preview.jpg";
import type { PaperDocument } from "./types";
export const renginePaper: PaperDocument = {
    slug: "rengine",
    title: "Rengine: A Compact TypeScript Rendering and Game Engine Experiment",
    subtitle: "A scene/entity runtime for exploring transform hierarchies, update components, canvas rendering, React rendering, and live debug visualization.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "Rengine is a compact rendering and game-engine experiment built in TypeScript. It focuses on core engine boundaries: scenes, entities, folder-style transform hierarchies, components, update loops, renderer abstraction, and debug visualization. Entities hold transform properties, component lists, render functions, and optional shaders. Folder entities compose child transforms, scenes group entities, the loop advances component state, and renderer helpers can target canvas or React output. The browser surface exposes those mechanics with live scene selection, zoom controls, wireframe toggles, and an inspectable component tree.",
    description: "A technical paper for a small TypeScript rendering engine built around scenes, entities, transform composition, and renderer abstraction.",
    categories: ["Engine Architecture", "Systems", "Research Notes"],
    tags: ["TypeScript", "Canvas", "Game Loop", "Scene Graph", "Entity Systems", "Rendering"],
    repoUrl: "https://github.com/JBoss925/Rengine",
    previewImage: renginePreview,
    previewAlt: "Rengine demo preview",
    previewCaption: "Rengine demo preview. The interactive route renders a live scene and exposes the corresponding runtime tree and transform values.",
    actionLinks: [
        {
            label: "Open Demo",
            href: "/rengine",
            description: "Inspect the live Rengine scene demo"
        }
    ],
    sections: [
        {
            id: "motivation",
            eyebrow: "I",
            title: "Motivation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rengine isolates the parts of a game or rendering engine that sit below visible content: how entities are represented, how transforms compose through parents, how rendering can be swapped, and how update logic stays separate from drawing."
                },
                {
                    kind: "paragraph",
                    text: "The visual vocabulary is deliberately small. Boxes, folders, paths, rotations, and debug markers are enough to stress the runtime boundaries without burying the engine model under art assets."
                },
                {
                    kind: "bullets",
                    items: [
                        "Primary goal: make scene graph and transform behavior visible.",
                        "Implementation target: a small TypeScript engine with canvas and React render paths.",
                        "Demo target: live inspection of runtime scenes, transforms, and component labels."
                    ]
                }
            ],
        },
        {
            id: "entities",
            eyebrow: "II",
            title: "Entity Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "An entity is a bundle of transform properties, components, a renderer, and shaders. A folder entity is an entity-like grouping node that owns children and applies parent transforms to them. That gives the engine a compact scene graph without needing a separate hierarchy system."
                },
                {
                    kind: "equation",
                    label: "Entity transform",
                    tex: "T_e = (p_e, a_e, r_e, s_e)",
                    caption: "Each entity carries position, anchor, rotation, and scale."
                },
                {
                    kind: "paragraph",
                    text: "The folder model is the key idea. It lets a parent pivot, move, scale, or rotate a child group, while individual children still keep their own local transforms and update components."
                },
                {
                    kind: "equation",
                    label: "Composed rotation",
                    tex: "r_{\\mathrm{world}} = (r_{\\mathrm{parent}} + r_{\\mathrm{local}}) \\bmod 2\\pi",
                    caption: "Folder entities compose child rotation with parent rotation."
                },
                {
                    kind: "bullets",
                    items: [
                        "Entity construction flows through Rengine.Entity.MakeEntity.",
                        "Folder construction flows through Rengine.Entity.MakeFolderEntity.",
                        "Folder bounds can optionally place origin and anchor at the geometric center.",
                        "Debug visualization shows anchors, positions, and parent-child relationships."
                    ]
                }
            ],
        },
        {
            id: "engine-types",
            eyebrow: "III",
            title: "Engine Type Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The engine can be reconstructed from a small set of TypeScript types. Entity is the core drawable/updateable object. FolderEntity extends Entity with children. Scene groups entities and gives them a name. EngineState stores scenes, the active scene, global configuration, camera data, and renderer selection."
                },
                {
                    kind: "example",
                    label: "Core engine types",
                    language: "typescript",
                    code: `type Vector2 = { x: number; y: number };
type Component = {
  name: string;
  update: (delta: number, e: Entity, s: Scene, prev: EngineState) => [Entity, EngineState];
};
type Entity = {
  id: string;
  position: Vector2;
  anchor: Vector2;
  rotation: number;
  scale: Vector2;
  components: Component[];
  render: (state: EngineState) => (entity: Entity) => unknown;
};
type FolderEntity = Entity & { entities: Entity[] };
type Scene = { name: string; entities: Entity[] };`,
                    caption: "The model is deliberately small: transforms, components, render function, and optional children."
                },
                {
                    kind: "equation",
                    label: "Folder subtype",
                    tex: "FolderEntity = Entity \\cap \\{children: Entity^{*}\\}",
                    caption: "A folder is an entity with child ownership, not a separate scene-graph primitive."
                },
                {
                    kind: "paragraph",
                    text: "This choice keeps traversal uniform. Rendering and updating can visit an Entity, inspect whether it owns children, and recursively traverse without switching to a distinct transform-node API."
                }
            ],
        },
        {
            id: "scenes",
            eyebrow: "IV",
            title: "Scenes and Runtime Loop",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Scenes are named collections of entities, and the engine state tracks both the list of scenes and the active scene. Scene helpers create scenes, activate them, add entities, and remove entities."
                },
                {
                    kind: "equation",
                    label: "Component update",
                    tex: "(e_{t+1}, S_{t+1}) = c(\\Delta t, e_t, scene_t, S_t)",
                    caption: "A component advances an entity and may also return a changed engine state."
                },
                {
                    kind: "paragraph",
                    text: "The update model is component-oriented. Components receive delta time, the current entity, the scene, and previous engine state, then return an updated entity and state. That keeps movement and animation logic attached to entities without putting it inside the renderer."
                },
                {
                    kind: "bullets",
                    items: [
                        "Demo components include rotations, velocities, square paths, and star paths.",
                        "The active scene is recreated when the selected sample changes.",
                        "The runtime tree is periodically synchronized back into the React inspector."
                    ]
                }
            ],
        },
        {
            id: "loop-scheduling",
            eyebrow: "V",
            title: "Loop Scheduling",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The loop has two modes: interval-based stepping and animation-frame stepping. In both modes the frame operation is the same: compute delta time, tick the active scene, apply the global update hook, and render the new engine state. Delta time is passed into every component so animation speed is independent of frame count."
                },
                {
                    kind: "diagram",
                    label: "Frame operation",
                    body: `timestamp
  |
  v
delta = timestamp - previousTimestamp
  |
  v
TickActiveScene(delta, state)
  |
  v
Lifecycle.update(delta, state)
  |
  v
render(state)
  |
  v
store state for next frame`,
                    caption: "The frame path is stable regardless of whether scheduling comes from requestAnimationFrame or an interval."
                },
                {
                    kind: "equation",
                    label: "Delta-time update",
                    tex: "x_{t+\\Delta t}=x_t+v\\Delta t",
                    caption: "Velocity-style components update position from elapsed time rather than from an assumed frame rate."
                },
                {
                    kind: "paragraph",
                    text: "The portfolio route caps large deltas before rendering so a suspended tab or stutter does not produce a single enormous movement step in the visible inspection surface."
                }
            ],
        },
        {
            id: "transform-composition",
            eyebrow: "VI",
            title: "Transform Composition",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rengine's central mathematical object is the local-to-world transform. Entity position, anchor, rotation, and scale are stored locally. Folder entities compose those local values into world values for their children, which allows nested motion without copying absolute coordinates into every descendant."
                },
                {
                    kind: "equation",
                    label: "Local transform matrix",
                    tex: "M_e = T(p_e)\\,R(r_e)\\,S(s_e)\\,T(-a_e)",
                    caption: "An entity transform translates to position, rotates, scales, and offsets by anchor."
                },
                {
                    kind: "equation",
                    label: "World transform",
                    tex: "W_e = W_{parent}\\,M_e",
                    caption: "A child world transform is the parent world transform multiplied by the child's local transform."
                },
                {
                    kind: "diagram",
                    label: "Folder composition",
                    body: `Root folder W0
  |
  +-- Orbit folder M1 -> W1 = W0 M1
        |
        +-- Box M2 -> W2 = W1 M2
        |
        +-- Child folder M3 -> W3 = W1 M3`,
                    caption: "Folders are ordinary transform nodes that contribute a parent transform to every child."
                },
                {
                    kind: "paragraph",
                    text: "The runtime inspector exposes both local and world-space values because most transform bugs are mismatches between the two. A child that appears wrong on screen may have a correct local transform but an unexpected parent transform, or the inverse."
                }
            ],
        },
        {
            id: "rendering",
            eyebrow: "VII",
            title: "Renderer Abstraction",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rengine separates render functions from entity state. A box renderer can target canvas by drawing into a 2D context, or target React by returning absolutely positioned elements with computed transform styles."
                },
                {
                    kind: "paragraph",
                    text: "The canvas path also supports transformation-point rendering. Blue, red, and relationship markers expose the distinction between entity position, anchor, and anchor-to-position offset, which is essential when debugging nested transforms."
                },
                {
                    kind: "bullets",
                    items: [
                        "Canvas rendering uses translate, rotate, and fillRect against the current entity transform.",
                        "React rendering converts the same transform data into CSS position, scale, and rotation.",
                        "Texture rendering is implemented for the React path as an image renderer.",
                        "Wireframe/debug overlays expose the renderer's transform basis."
                    ]
                }
            ],
        },
        {
            id: "renderer-contract",
            eyebrow: "VIII",
            title: "Renderer Contract",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Renderers consume engine state and entities; they do not own simulation state. This creates a useful separation: the same scene graph can be stepped once and projected into different output targets. The canvas renderer uses imperative drawing commands, while the React renderer converts transforms into DOM/CSS output."
                },
                {
                    kind: "equation",
                    label: "Render signature",
                    tex: "\\operatorname{render}: EngineState \\rightarrow Entity \\rightarrow Output",
                    caption: "A renderer is a curried function from engine state and entity to a target-specific output."
                },
                {
                    kind: "example",
                    label: "Canvas transform order",
                    language: "text",
                    code: `save context
translate(entity.position)
rotate(entity.rotation)
scale(entity.scale)
translate(-entity.anchor)
draw entity body
restore context`,
                    caption: "The canvas path maps entity transform fields directly onto 2D context operations."
                },
                {
                    kind: "paragraph",
                    text: "The debug overlay is part of the renderer contract. Anchor markers, position markers, and relationship lines expose the transform basis used by the renderer, so visual output can be compared against the tree inspector without consulting source code."
                }
            ],
        },
        {
            id: "components",
            eyebrow: "IX",
            title: "Component Behaviors",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Components are small deterministic update functions attached to entities. A component may mutate transform fields such as position or rotation, but it returns the updated entity and engine state explicitly. Multiple components on one entity are applied in sequence."
                },
                {
                    kind: "equation",
                    label: "Component chain",
                    tex: "e' = c_n(\\Delta t, \\ldots c_2(\\Delta t, c_1(\\Delta t,e,S),S)\\ldots,S)",
                    caption: "An entity's component list acts as an ordered transform/update pipeline."
                },
                {
                    kind: "example",
                    label: "Component catalog",
                    language: "text",
                    code: `rotation component:
  rotation += angularVelocity * delta

velocity component:
  position += velocity * delta

square path component:
  select edge by phase
  move along edge at configured speed

star path component:
  interpolate along star vertices by phase`,
                    caption: "The sample components cover continuous rotation, linear motion, and scripted path following."
                },
                {
                    kind: "paragraph",
                    text: "Because component labels are exposed in the runtime tree, they also function as instrumentation. The inspector can explain why a node moves, not only where it currently is."
                }
            ],
        },
        {
            id: "browser-surface",
            eyebrow: "X",
            title: "Browser Inspection Surface",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The browser integration turns the engine sandbox into an inspection surface. It keeps the live canvas, adds scene selection, zoom controls, wireframe toggling, scene-focus copy, and a collapsible runtime tree."
                },
                {
                    kind: "paragraph",
                    text: "That tree is the important bridge between visual output and engine state. A reader can watch the scene move, then inspect the corresponding hierarchy, component labels, local/world transforms, anchors, rotations, scales, and node IDs."
                },
                {
                    kind: "bullets",
                    items: [
                        "Demo scenes include stacked orbits, counter drift, layered motion, diagonal sweep arrays, in-place arrays, square paths, and star paths.",
                        "The stage zooms from 0.1x to 2x.",
                        "The tree supports local/world-space toggling per node.",
                        "The browser route makes the runtime inspectable without opening the source."
                    ]
                }
            ],
        },
        {
            id: "inspector-snapshots",
            eyebrow: "XI",
            title: "Inspector Snapshot Semantics",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The runtime tree is a snapshot of the current engine graph, not the graph itself. Each node stores identity, kind, component labels, local transform, world transform, color, and child snapshots. This keeps React inspection state separate from the mutable engine state used by the canvas loop."
                },
                {
                    kind: "example",
                    label: "Runtime tree node",
                    language: "typescript",
                    code: `type RuntimeTreeNode = {
  id: string;
  label: string;
  kind: "entity" | "folder";
  componentLabels: string[];
  local: TransformSnapshot;
  world: TransformSnapshot;
  color?: string;
  children: RuntimeTreeNode[];
};`,
                    caption: "Snapshots contain the information needed by the inspector without giving React ownership of engine mutation."
                },
                {
                    kind: "equation",
                    label: "Snapshot function",
                    tex: "\\operatorname{snapshot}: EngineState \\rightarrow Tree",
                    caption: "The inspector is a pure projection of current engine state."
                },
                {
                    kind: "paragraph",
                    text: "Collapsed-node state and local/world display preferences live outside the snapshot. When the scene changes, those UI sets are filtered against the new node IDs so stale inspector state cannot refer to removed nodes."
                }
            ],
        },
        {
            id: "sample-suite",
            eyebrow: "XII",
            title: "Sample Scene Suite",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The sample scenes are not arbitrary; each stresses a different engine property. Stacked orbits stress parent rotation. Counter drift stresses competing component updates. Layered motion stresses folder nesting. Sweep and in-place arrays stress repeated entity construction. Square and star paths stress time-dependent component motion."
                },
                {
                    kind: "diagram",
                    label: "Scene coverage",
                    body: `stacked orbits      -> nested rotation composition
counter drift       -> opposing component fields
layered motion      -> multi-level folder transforms
diagonal sweep      -> repeated entity construction
in-place array      -> shared origin with varied transforms
square/star paths   -> scripted component trajectories`,
                    caption: "Each scene maps to a specific engine behavior rather than only a visual variation."
                },
                {
                    kind: "equation",
                    label: "Frame update",
                    tex: "S_{t+\\Delta t} = R\\left(U_{global}(\\Delta t, U_{scene}(\\Delta t, S_t))\\right)",
                    caption: "A frame advances the active scene, applies any global update, then renders the resulting state."
                },
                {
                    kind: "paragraph",
                    text: "The site integration adds a second verification surface. The canvas shows whether motion is visually correct; the runtime tree shows whether the underlying hierarchy and transforms explain that motion."
                }
            ],
        },
        {
            id: "results",
            eyebrow: "XIII",
            title: "Results and Design Properties",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rengine establishes a compact engine model with explicit scenes, entities, folder entities, component update functions, renderer abstraction, and live inspection. The result is a small but complete environment for validating hierarchical transforms and render-target boundaries in TypeScript."
                },
                {
                    kind: "paragraph",
                    text: "The strongest result is observability. The same running scene can be inspected as pixels, as a runtime tree, as local transforms, as world transforms, and as component labels. That makes the engine suitable for demonstrating transform and update semantics without relying on a large game layer."
                },
                {
                    kind: "bullets",
                    items: [
                        "Folder entities provide hierarchy without a separate transform-node type.",
                        "Components update entities through an explicit delta-time contract.",
                        "Canvas and React render paths share entity state while differing in projection target.",
                        "The runtime inspector makes transform composition auditable from the browser surface."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
