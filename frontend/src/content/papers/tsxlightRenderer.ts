import tsxlightRendererPreview from "../../assets/tsxlight-renderer-preview.jpg";
import type { PaperDocument } from "./types";
export const tsxlightRendererPaper: PaperDocument = {
    slug: "tsxlight-renderer",
    title: "TSXLight Renderer: Server-Owned TSX Component Rendering",
    subtitle: "A server-owned rendering framework where TSX components render into user-specific shells, callbacks travel over sockets, and each user receives an isolated renderer instance.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "TSXLight Renderer is a React-style rendering engine for web and Electron targets with server-owned component state. It defines a component model with a custom JSX factory, renders component trees to HTML shells, registers callback handlers on the server, and uses socket messages to route client events back into server-owned component instances. Each connected user receives an isolated renderer with its own state, callbacks, page context, and communication channel. The framework also includes a page manager, state save/load hooks, screen-size tracking, render-mode settings, and a Juice Messenger application surface that demonstrates callback-driven rerendering.",
    description: "A technical paper for a TSX rendering experiment built around server-owned components, socket callbacks, per-user renderer instances, and page/state managers.",
    categories: ["Engine Architecture", "Language Tooling", "Systems"],
    tags: [
        "TypeScript",
        "TSX",
        "Custom JSX Factory",
        "SSR",
        "Socket.io",
        "Electron",
        "Express",
        "WebSocket",
        "JSDOM",
        "Firebase Admin",
        "Material UI",
        "State Management",
        "Rendering Architecture"
    ],
    repoUrl: "https://github.com/JBoss925/tsxlight-renderer",
    previewImage: tsxlightRendererPreview,
    previewAlt: "TSXLight Renderer preview",
    previewCaption: "TSXLight Renderer preview. The framework renders TSX-like component trees into user-specific HTML shells and routes callbacks back to server-owned component instances.",
    sections: [
        {
            id: "motivation",
            eyebrow: "I",
            title: "Motivation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "TSXLight asks what a React-like programming model looks like if the server owns the component tree. The browser receives a rendered shell and a small callback bridge, while component instances, state, page transitions, and callbacks remain on the server."
                },
                {
                    kind: "paragraph",
                    text: "The system defines a distinct rendering boundary from browser-owned React: state can live server-side, callbacks can be represented in generated markup, and separate users can interact with the same application code without sharing renderer state."
                },
                {
                    kind: "paragraph",
                    text: "The motivation is easiest to understand by contrast. In React, the browser owns component instances and event handlers are client-side closures. In TSXLight, the browser is closer to a terminal: it displays generated markup and reports events, while the server decides which component object receives the event and what the next view should be. That inversion is unusual, but it makes identity, callback serialization, and per-user state isolation the central design problems."
                },
                {
                    kind: "bullets",
                    items: [
                        "Primary goal: render TSX-style component trees outside the React runtime.",
                        "Target surfaces: web and Electron shells.",
                        "Demo target: a callback-driven placeholder messenger application."
                    ]
                }
            ],
        },
        {
            id: "renderer-instances",
            eyebrow: "II",
            title: "Per-User Renderer Instances",
            blocks: [
                {
                    kind: "paragraph",
                    text: "A TSXLight instance is created with a renderer ID and registered with the PageManager. It owns the current DOM template, root component, base app wrapper, renderer ID, and the user-specific output file path or socket channel."
                },
                {
                    kind: "equation",
                    label: "Renderer isolation",
                    tex: "R_u = (D_u, C_u, P_u, K_u)",
                    caption: "Each user renderer owns its DOM shell, component tree, active page, and callback table."
                },
                {
                    kind: "paragraph",
                    text: "The per-user instance model is the central isolation boundary. Each user can have separate component state, callback registrations, page state, and communication, which prevents one user's rerender path from mutating another user's active page."
                },
                {
                    kind: "paragraph",
                    text: "Server-owned components create an immediate isolation problem: a single global component tree would make every connected user share clicks and state. TSXLight routes user identity to a renderer ID, renderer ID to active page, and active page to component instance and callback table."
                },
                {
                    kind: "bullets",
                    items: [
                        "UserManager maps users to renderer IDs.",
                        "PageManager maps renderer IDs to active page IDs and per-page component instances.",
                        "Each renderer can save states before page transitions and rerender independently.",
                        "Settings can limit duplicate active connections per user."
                    ]
                }
            ],
        },
        {
            id: "jsx-rendering",
            eyebrow: "III",
            title: "TSX Rendering Pipeline",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The renderer walks components and JSX elements recursively, turning the tree into an HTML string. Primitive children become text, component children render through their own rendered children, and JSX elements become DOM strings with serialized props."
                },
                {
                    kind: "equation",
                    label: "Render function",
                    tex: "H = \\operatorname{render}(T, K)",
                    caption: "The renderer transforms a component tree T and callback registry K into an HTML shell."
                },
                {
                    kind: "paragraph",
                    text: "Callback props receive special handling. When a prop starts with an event-style name, the renderer registers the function with the CallbackManager, emits a stable callback ID into the markup, and generates client-side code that calls back over the socket when the user triggers the event."
                },
                {
                    kind: "equation",
                    label: "Callback identity",
                    tex: "k = (userId, pageId, elementId, eventName)",
                    caption: "A callback is addressed by user, page, generated element identity, and event name."
                },
                {
                    kind: "bullets",
                    items: [
                        "JSDOM provides the server-side DOM environment.",
                        "Template files provide the initial web or Electron shell.",
                        "Style props are converted from TSX-style objects into CSS text.",
                        "Callback IDs are regenerated during render and stored server-side."
                    ]
                }
            ],
        },
        {
            id: "component-model",
            eyebrow: "IV",
            title: "Component Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "A TSXLight component is a server-resident object that can render a JSX-like subtree, hold mutable state, expose lifecycle hooks, and register callbacks. The rendered client output is a projection of that object, not the owner of the object."
                },
                {
                    kind: "example",
                    label: "Component shape",
                    language: "typescript",
                    code: `type Component = {
  props: Record<string, unknown>;
  state?: Record<string, unknown>;
  render(): TsxNode;
  saveState?(): unknown;
  loadState?(state: unknown): void;
  afterRender?(): void;
};`,
                    caption: "The renderer needs render, optional state persistence hooks, and optional post-render behavior."
                },
                {
                    kind: "equation",
                    label: "Component projection",
                    tex: "view_t = render(component_t)",
                    caption: "At any time, the visible shell is a projection of server component state."
                },
                {
                    kind: "paragraph",
                    text: "The custom JSX factory creates plain element records rather than React elements. Intrinsic elements become tag records; component constructors become component records; children are stored explicitly so the server renderer can walk the whole tree."
                }
            ],
        },
        {
            id: "identity",
            eyebrow: "V",
            title: "Identity and Callback Addressing",
            blocks: [
                {
                    kind: "paragraph",
                    text: "A server-owned component tree needs a stable identity model because the client cannot close over JavaScript functions directly. TSXLight solves this by converting event props into callback registrations. The generated markup carries callback identifiers, while the server stores the executable function and its receiver context."
                },
                {
                    kind: "equation",
                    label: "Callback table",
                    tex: "K_u : (pageId, elementId, eventName) \\mapsto (this, f)",
                    caption: "For a given user, the callback table maps a rendered event identity to a server-side function and binding."
                },
                {
                    kind: "diagram",
                    label: "Callback dispatch",
                    body: `client event
  |
  v
socket message(user, page, element, event, payload)
  |
  v
CallbackManager lookup
  |
  v
invoke server function with stored binding
  |
  v
mutate component state
  |
  v
rerender shell for that user`,
                    caption: "The browser does not own the callback; it owns only the event signal that selects a server callback."
                },
                {
                    kind: "paragraph",
                    text: "Browser-owned React keeps event handlers as closures already resident in the client runtime. TSXLight handlers are serialized as identities and resolved through server state, so callback routing becomes part of the framework's correctness model."
                },
                {
                    kind: "paragraph",
                    text: "The implementation regenerates callback IDs during render and clears the active page's callback table during rerender. Old DOM events cannot call handlers for elements that no longer exist. It is a blunt consistency strategy, but the invariant is clear: after a render, only callbacks emitted by that render should be callable."
                }
            ],
        },
        {
            id: "page-state",
            eyebrow: "VI",
            title: "Page and State Management",
            blocks: [
                {
                    kind: "paragraph",
                    text: "TSXLight builds a page system on top of the component tree. Pages are registered by ID with load and unload callbacks, and any renderer can transition to a page by ID. During transitions, the framework saves the outgoing component state, stores the per-renderer page component, and runs lifecycle callbacks."
                },
                {
                    kind: "paragraph",
                    text: "The state model is intentionally explicit. Components can save and load state between renders, force a rerender without saving, and use the page transition system to move between application surfaces."
                },
                {
                    kind: "bullets",
                    items: [
                        "PageManager stores base components and per-renderer component instances.",
                        "State save/load recursively walks component children.",
                        "transitionToPage coordinates unload, state persistence, active-page assignment, render, and load.",
                        "afterRender is the primary lifecycle hook for post-render behavior."
                    ]
                }
            ],
        },
        {
            id: "state-model",
            eyebrow: "VII",
            title: "State Persistence Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The state model is page-scoped and renderer-scoped. A base page definition supplies the component class or component tree, but active component instances belong to a renderer. Before a transition, the outgoing tree can serialize state; after a transition, the incoming page receives either its prior renderer-local state or a fresh instance."
                },
                {
                    kind: "equation",
                    label: "Per-renderer page state",
                    tex: "State = \\{(rendererId, pageId) \\mapsto componentInstance\\}",
                    caption: "The same page definition can have distinct live component instances for different users."
                },
                {
                    kind: "example",
                    label: "Page transition",
                    language: "text",
                    code: `save outgoing page state
run outgoing unload hook
select next page for renderer
load or create renderer-local component instance
render next page shell
run incoming load/afterRender hooks`,
                    caption: "Transitions coordinate lifecycle hooks, state persistence, active-page selection, and rendering."
                },
                {
                    kind: "paragraph",
                    text: "This model favors explicit ownership over implicit reconciliation. The server can decide when state is saved, when it is discarded, and which renderer receives which page instance."
                }
            ],
        },
        {
            id: "render-algorithm",
            eyebrow: "VIII",
            title: "Render Algorithm",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rendering is a recursive tree walk with special cases for primitives, arrays, intrinsic tags, and component nodes. The renderer emits escaped text for primitive children, serializes safe HTML attributes for ordinary props, converts style objects into CSS declarations, and diverts event props into the callback registry."
                },
                {
                    kind: "example",
                    label: "Render walk",
                    language: "text",
                    code: `render(node):
  if node is null/false: return ""
  if node is string/number: return escape(node)
  if node is array: return concat(render(child))
  if node is component:
    instance = resolve or create component instance
    return render(instance.render())
  if node is intrinsic element:
    id = allocate element id
    attrs = serialize props except events
    callbacks = register event props under id
    return "<tag attrs callbacks>" + render(children) + "</tag>"`,
                    caption: "The renderer is deterministic when element identity allocation and callback registration order are deterministic."
                },
                {
                    kind: "equation",
                    label: "Render determinism",
                    tex: "T_1=T_2 \\land K_0=\\varnothing \\Rightarrow render(T_1)=render(T_2)",
                    caption: "The same component tree and empty callback registry produce the same HTML shell."
                },
                {
                    kind: "paragraph",
                    text: "A rerender clears or replaces the callback table for the active page before walking the tree again. That prevents stale event identities from surviving after the DOM shape changes."
                }
            ],
        },
        {
            id: "communication",
            eyebrow: "IX",
            title: "Client Communication",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The browser or Electron shell receives rendered markup plus a callback bridge. When the user interacts with an element, the shell sends the event identity back to the server. The server looks up the callback under the active user and page, invokes it with the recorded this-binding, and can rerender the component tree."
                },
                {
                    kind: "paragraph",
                    text: "This pattern makes the client very thin, but it also makes latency and connection management part of the rendering model. It works best for experiments, internal tools, or controlled desktop shells where server-owned state is a feature rather than an accident."
                },
                {
                    kind: "bullets",
                    items: [
                        "ServerManager supplies the process port and communication settings.",
                        "CallbackManager stores callbacks by user, page, and callback ID.",
                        "ScreenSizeManager lets server components query user-specific viewport information.",
                        "The Juice Messenger application surface demonstrates state changes and callback-triggered rerendering."
                    ]
                }
            ],
        },
        {
            id: "socket-protocol",
            eyebrow: "X",
            title: "Socket Event Protocol",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The callback bridge can be reconstructed as a small message protocol. The client sends renderer identity, active page identity, callback identity, event name, and a serialized event payload. The server validates the renderer/page pair, looks up the callback, invokes it, and decides whether to rerender."
                },
                {
                    kind: "example",
                    label: "Client event message",
                    language: "json",
                    code: `{
  "type": "callback",
  "rendererId": "renderer-7",
  "pageId": "inbox",
  "callbackId": "cb-42",
  "eventName": "click",
  "payload": {
    "value": "Send",
    "clientX": 144,
    "clientY": 220
  }
}`,
                    caption: "The payload carries event data, but the executable function remains on the server."
                },
                {
                    kind: "diagram",
                    label: "Server callback handling",
                    body: `receive message
  |
  v
validate rendererId -> user/session
  |
  v
validate pageId == active page
  |
  v
lookup callbackId in page callback table
  |
  v
invoke callback with payload
  |
  +-- state changed -> rerender and emit shell patch/full shell
  +-- no change -> acknowledge`,
                    caption: "Validation precedes callback invocation so stale or cross-page events are rejected."
                },
                {
                    kind: "equation",
                    label: "Active-page guard",
                    tex: "message.pageId \\ne activePage(rendererId) \\Rightarrow reject(message)",
                    caption: "A callback is valid only for the renderer's active page."
                }
            ],
        },
        {
            id: "security-isolation",
            eyebrow: "XI",
            title: "Isolation and Failure Boundaries",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Per-user renderers are the primary isolation boundary. User identity selects a renderer, the renderer selects an active page, and the active page selects the callback table. A callback message that does not match the current user and page should not be able to invoke another user's component function."
                },
                {
                    kind: "equation",
                    label: "Isolation condition",
                    tex: "u_1 \\ne u_2 \\Rightarrow R_{u_1} \\cap R_{u_2} = \\varnothing",
                    caption: "Renderer-owned component state and callbacks are disjoint across users."
                },
                {
                    kind: "paragraph",
                    text: "The architecture therefore treats duplicate connections, stale callback IDs, page transitions, and viewport-specific state as renderer-management problems rather than client-rendering problems. The tradeoff fits controlled shells and internal tools where the server is meant to remain the source of truth."
                },
                {
                    kind: "bullets",
                    items: [
                        "Callback IDs are scoped by renderer and page, not treated as global capabilities.",
                        "Page transitions clear or replace the active callback surface.",
                        "Screen-size tracking is user-specific, which prevents one viewport from driving another user's layout decisions.",
                        "Connection policy belongs to the server manager rather than to generated markup."
                    ]
                }
            ],
        },
        {
            id: "fit",
            eyebrow: "XII",
            title: "Where This Model Fits",
            blocks: [
                {
                    kind: "paragraph",
                    text: "TSXLight is not presented as a replacement for modern client React. It is an experiment in a different ownership model. The design fits best when the server is already the trusted authority, when the UI is controlled, and when a full browser-side state machine would be more liability than benefit: internal tools, desktop shells, demos, admin consoles, or teaching environments."
                },
                {
                    kind: "paragraph",
                    text: "The same ownership model is a poor fit for latency-sensitive drawing tools, offline-first applications, public high-scale frontends, or interfaces that need rich browser-local interaction between server turns. Every meaningful event has to cross the socket boundary, so network latency and connection lifecycle become part of the rendering contract."
                },
                {
                    kind: "bullets",
                    items: [
                        "Server ownership simplifies authority and persistence for controlled shells.",
                        "Callback serialization makes event identity explicit but adds protocol and lifecycle complexity.",
                        "Per-user renderers prevent accidental shared state but require careful cleanup for duplicate connections.",
                        "Full-shell rerendering is understandable, but it lacks the efficiency of browser-side reconciliation."
                    ]
                }
            ],
        },
        {
            id: "rerender-consistency",
            eyebrow: "XIII",
            title: "Rerender Consistency",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Because the server owns the component tree, rerender consistency depends on sequencing. Callback invocation, state mutation, callback-table replacement, HTML generation, and shell delivery must occur as one ordered transaction for a renderer."
                },
                {
                    kind: "equation",
                    label: "Renderer transaction",
                    tex: "R_u^{t+1}=deliver(render(mutate(R_u^t, callback)))",
                    caption: "A renderer advances by applying one callback mutation, rendering the new state, and delivering the resulting shell."
                },
                {
                    kind: "bullets",
                    items: [
                        "Only the addressed renderer is mutated by a callback transaction.",
                        "The active callback table is regenerated from the rendered tree.",
                        "Page transitions persist outgoing state before replacing the active page.",
                        "Viewport updates are stored per renderer and consumed during subsequent renders.",
                        "Duplicate or stale callbacks are rejected by renderer/page/callback identity checks."
                    ]
                },
                {
                    kind: "paragraph",
                    text: "This transaction model is the server-side equivalent of UI reconciliation. Instead of diffing fibers in the browser, TSXLight rebuilds the renderer-owned shell from authoritative server state."
                }
            ],
        },
        {
            id: "results",
            eyebrow: "XIV",
            title: "Results and Design Properties",
            blocks: [
                {
                    kind: "paragraph",
                    text: "TSXLight Renderer establishes a complete architecture for TSX-authored, server-owned UI. It separates authoring syntax from React's runtime, renders component trees into user-specific HTML shells, routes event callbacks through sockets, and keeps page state inside renderer instances."
                },
                {
                    kind: "paragraph",
                    text: "The technical result is an explicit rendering ownership model. The server owns state, callbacks, page transitions, component instances, and rerender decisions; the client owns display and event forwarding. That split makes identity and isolation visible, which is the core contribution of the experiment."
                },
                {
                    kind: "bullets",
                    items: [
                        "A JSX-like authoring model can be separated from React's browser runtime assumptions.",
                        "Server-owned component trees require renderer-local callback tables and page-local state.",
                        "Callback serialization is the core design problem once the client becomes an event bridge.",
                        "The architecture fits controlled web/Electron shells where server-owned state is an intentional property."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
