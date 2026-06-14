import tsxlightRendererPreview from "../../assets/tsxlight-renderer-preview.jpg";
import type { PaperDocument } from "./types";

export const tsxlightRendererPaper: PaperDocument = {
  slug: "tsxlight-renderer",
  title: "TSXLight Renderer: Server-Owned TSX Component Rendering",
  subtitle:
    "A proof-of-concept rendering framework where TSX components are rendered on the server, callbacks travel over sockets, and each user receives an isolated renderer instance.",
  authors: ["Jagger Brulato"],
  date: "2026",
  abstract:
    "TSXLight Renderer is a proof-of-concept React-style rendering engine for web and Electron targets. It defines a component model with a custom JSX factory, renders component trees to HTML shells, registers callback handlers on the server, and uses socket messages to route client events back into server-owned component instances. Each connected user receives an isolated renderer with its own state, callbacks, page context, and communication channel. The framework also includes a page manager, state save/load hooks, screen-size tracking, render-mode settings, and a placeholder Juice Messenger application that demonstrates callback-driven rerendering.",
  description:
    "A technical paper for a TSX rendering experiment built around server-owned components, socket callbacks, per-user renderer instances, and page/state managers.",
  categories: ["Engine Architecture", "Language Tooling", "Systems"],
  tags: ["TypeScript", "TSX", "SSR", "Sockets", "Electron", "Rendering Architecture"],
  repoUrl: "https://github.com/JBoss925/tsxlight-renderer",
  previewImage: tsxlightRendererPreview,
  previewAlt: "TSXLight Renderer preview",
  previewCaption:
    "TSXLight Renderer preview. The framework renders TSX-like component trees into user-specific HTML shells and routes callbacks back to server-owned component instances.",
  sections: [
    {
      id: "motivation",
      eyebrow: "I",
      title: "Motivation",
      paragraphs: [
        "TSXLight asks what a React-like programming model looks like if the server owns the component tree. The browser receives a rendered shell and a small callback bridge, while component instances, state, page transitions, and callbacks remain on the server.",
        "That is not a general replacement for React. It is an architectural experiment in rendering boundaries: what state can live server-side, how callbacks can be represented in generated markup, and how separate users can interact with the same application code without sharing renderer state."
      ],
      bullets: [
        "Primary goal: render TSX-style component trees outside the React runtime.",
        "Target surfaces: web and Electron shells.",
        "Demo target: a callback-driven placeholder messenger application."
      ]
    },
    {
      id: "renderer-instances",
      eyebrow: "II",
      title: "Per-User Renderer Instances",
      paragraphs: [
        "A TSXLight instance is created with a renderer ID and registered with the PageManager. It owns the current DOM template, root component, base app wrapper, renderer ID, and the user-specific output file path or socket channel.",
        "The per-user instance model is the central isolation boundary. Each user can have separate component state, callback registrations, page state, and communication, which prevents one user's rerender path from mutating another user's active page."
      ],
      equations: [
        {
          label: "Renderer isolation",
          tex: "R_u = (D_u, C_u, P_u, K_u)",
          caption:
            "Each user renderer owns its DOM shell, component tree, active page, and callback table."
        }
      ],
      bullets: [
        "UserManager maps users to renderer IDs.",
        "PageManager maps renderer IDs to active page IDs and per-page component instances.",
        "Each renderer can save states before page transitions and rerender independently.",
        "Settings can limit duplicate active connections per user."
      ]
    },
    {
      id: "jsx-rendering",
      eyebrow: "III",
      title: "TSX Rendering Pipeline",
      paragraphs: [
        "The renderer walks components and JSX elements recursively, turning the tree into an HTML string. Primitive children become text, component children render through their own rendered children, and JSX elements become DOM strings with serialized props.",
        "Callback props receive special handling. When a prop starts with an event-style name, the renderer registers the function with the CallbackManager, emits a stable callback ID into the markup, and generates client-side code that calls back over the socket when the user triggers the event."
      ],
      equations: [
        {
          label: "Render function",
          tex: "H = \\operatorname{render}(T, K)",
          caption:
            "The renderer transforms a component tree T and callback registry K into an HTML shell."
        },
        {
          label: "Callback identity",
          tex: "k = (userId, pageId, elementId, eventName)",
          caption:
            "A callback is addressed by user, page, generated element identity, and event name."
        }
      ],
      bullets: [
        "JSDOM provides the server-side DOM environment.",
        "Template files provide the initial web or Electron shell.",
        "Style props are converted from TSX-style objects into CSS text.",
        "Callback IDs are regenerated during render and stored server-side."
      ]
    },
    {
      id: "page-state",
      eyebrow: "IV",
      title: "Page and State Management",
      paragraphs: [
        "TSXLight builds a page system on top of the component tree. Pages are registered by ID with load and unload callbacks, and any renderer can transition to a page by ID. During transitions, the framework saves the outgoing component state, stores the per-renderer page component, and runs lifecycle callbacks.",
        "The state model is intentionally explicit. Components can save and load state between renders, force a rerender without saving, and use the page transition system to move between application surfaces."
      ],
      bullets: [
        "PageManager stores base components and per-renderer component instances.",
        "State save/load recursively walks component children.",
        "transitionToPage coordinates unload, state persistence, active-page assignment, render, and load.",
        "afterRender is the primary lifecycle hook for post-render behavior."
      ]
    },
    {
      id: "communication",
      eyebrow: "V",
      title: "Client Communication",
      paragraphs: [
        "The browser or Electron shell receives rendered markup plus a callback bridge. When the user interacts with an element, the shell sends the event identity back to the server. The server looks up the callback under the active user and page, invokes it with the recorded this-binding, and can rerender the component tree.",
        "This pattern makes the client very thin, but it also makes latency and connection management part of the rendering model. It works best for experiments, internal tools, or controlled desktop shells where server-owned state is a feature rather than an accident."
      ],
      bullets: [
        "ServerManager supplies the process port and communication settings.",
        "CallbackManager stores callbacks by user, page, and callback ID.",
        "ScreenSizeManager lets server components query user-specific viewport information.",
        "The proof-of-concept Juice Messenger app demonstrates state changes and callback-triggered rerendering."
      ]
    },
    {
      id: "takeaways",
      eyebrow: "VI",
      title: "Technical Takeaways",
      paragraphs: [
        "TSXLight is interesting because it reopens assumptions that modern frontend frameworks usually hide. It treats JSX syntax as a component authoring format, but moves rendering, state, and callbacks to a server-owned runtime.",
        "The project is most useful as a rendering architecture study. It makes identity, per-user isolation, callback serialization, page state, and rerender ownership concrete instead of relying on a browser-side framework to solve them implicitly."
      ],
      bullets: [
        "A JSX-like authoring model can be separated from React's runtime assumptions.",
        "Server-owned component trees need strong per-user isolation boundaries.",
        "Callback serialization is the core design problem once the client becomes a thin shell.",
        "The architecture fits experiments and controlled shells better than high-latency public interfaces."
      ]
    }
  ],
  audioSamples: []
};
