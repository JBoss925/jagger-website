import renginePreview from "../../assets/rengine-preview.jpg";
import type { PaperDocument } from "./types";
export const renginePaper: PaperDocument = {
    slug: "rengine",
    title: "Rengine: A Compact TypeScript Rendering and Game Engine Experiment",
    subtitle: "A scene/entity runtime for exploring transform hierarchies, update components, canvas rendering, React rendering, and live debug visualization.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "Rengine is a compact rendering and game-engine experiment built in TypeScript. It focuses on the engine boundaries behind a demo rather than a finished game: scenes, entities, folder-style transform hierarchies, components, update loops, renderer abstraction, and debug visualization. Entities hold transform properties, component lists, render functions, and optional shaders. Folder entities compose child transforms, scenes group entities, the loop advances component state, and renderer helpers can target canvas or React output. The portfolio demo exposes those mechanics with live scene selection, zoom controls, wireframe toggles, and an inspectable component tree.",
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
                    text: "Rengine exists to explore the parts of a game or rendering engine that are usually hidden below the demo: how entities are represented, how transforms compose through parents, how rendering can be swapped, and how update logic stays separate from drawing."
                },
                {
                    kind: "paragraph",
                    text: "The project deliberately keeps the visual vocabulary small. Boxes, folders, paths, rotations, and debug markers are enough to stress the runtime boundaries without burying the engine ideas under art assets."
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
            id: "scenes",
            eyebrow: "III",
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
                        "The active demo scene is recreated when the selected demo changes.",
                        "The runtime tree is periodically synchronized back into the React inspector."
                    ]
                }
            ],
        },
        {
            id: "rendering",
            eyebrow: "IV",
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
                        "Wireframe/debug overlays are intentionally part of the learning surface."
                    ]
                }
            ],
        },
        {
            id: "portfolio-demo",
            eyebrow: "V",
            title: "Portfolio Demo Surface",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The portfolio integration upgrades the engine sandbox into a reader-facing demo. It keeps the live canvas, adds demo selection, zoom controls, wireframe toggling, scene-focus copy, and a collapsible runtime tree."
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
                        "The demo route makes the runtime inspectable without opening the source."
                    ]
                }
            ],
        },
        {
            id: "takeaways",
            eyebrow: "VI",
            title: "Technical Takeaways",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rengine is valuable because it treats engine concepts as the product. The demo does not need complex gameplay to show whether transform composition, component updates, scene activation, and renderer boundaries make sense."
                },
                {
                    kind: "paragraph",
                    text: "The project also shows why inspectors matter. A visual bug in a scene graph is much easier to reason about when the tree, local transforms, world transforms, and debug markers are visible at the same time."
                },
                {
                    kind: "bullets",
                    items: [
                        "Small engine experiments benefit from explicit scene, entity, renderer, and loop boundaries.",
                        "Folder entities are a compact way to explore hierarchical transforms.",
                        "Debug visualization makes transform math much easier to evaluate."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
