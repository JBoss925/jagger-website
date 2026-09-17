import { chapter, type NarrativePlan } from "./types";
export const tsxlightNarrative: NarrativePlan = {
  name: "TSXLight",
  subtitle:
    "A TSX framework with server-resident components and a browser or Electron shell.",
  abstract:
    "TSXLight is a TSX framework that keeps component instances, state, and callbacks on the server while browser or Electron shells display generated HTML. A custom JSX factory feeds per-user renderers, and client events resolve through callback addresses scoped to the renderer, active page, and current view. Rerendering coordinates state mutation, registration replacement, and shell delivery; page transitions manage saved component state separately from callback lifetime. This model centralizes component behavior and state, with connection availability, event round trips, and full-view replacement as interaction costs. It suits controlled shells and internal tools more readily than rapid local interaction or offline use.",
  sections: [
    chapter(
      "motivation",
      "Server-Owned Components",
      `
TSXLight keeps component instances, state, and callbacks on the server. A browser or Electron shell displays generated HTML and forwards events over a socket. Its JSX factory and renderer implement that model independently of React.

An event therefore needs a scoped callback address, not just an element listener. That address connects the client view to the server instance and active page, and must be replaced when their rendered tree changes.
`,
    ),
    chapter(
      "component-model",
      "The Component Tree",
      `
The custom JSX factory produces intrinsic tag records with props and children, or component records identifying stateful server objects. The renderer recursively serializes the tree into HTML within a template-backed browser or Electron shell.

Ordinary props become attributes and style objects become CSS text. Function props instead register callbacks, retaining their component receiver. Component lifecycle and state remain on the server rather than becoming behavior embedded in the emitted markup.
`,
      ["jsx-rendering", "render-algorithm"],
    ),
    chapter(
      "renderer-instances",
      "Renderer Instances",
      `
Each user receives a renderer instance owning component context, active page, template, callback registrations, and output destination. An incoming event selects that context before callback lookup, keeping both state mutation and delivery within the same user’s instance.

The active page and callback table belong to that renderer too. A globally valid callback lookup would be insufficient: the function must belong to the selected user and current view, not merely exist somewhere in the application.
`,
    ),
    chapter(
      "identity",
      "Callback Identity",
      `
Rendering registers a function and receiver with the callback manager, then emits an identifier and bridge code into markup. Addresses include renderer or user context, active page, generated element identity, and event name.

Registrations are scoped to the active page and rebuilt with the view. A current element can use its registration repeatedly; replacing the tree invalidates its former identity. Delayed messages therefore need lookup against current registrations, not a persistent catalog of every callback ever rendered.
`,
    ),
    chapter(
      "communication",
      "The Event Round Trip",
      `
The shell sends context, callback identity, event name, and serialized event data over the socket. Dispatch resolves the registration, invokes its function with the stored receiver, and renders the updated state to the selected shell.

The trace below names logical stages rather than literal payload fields. Each server-owned interaction includes that round trip, and diagnosis can distinguish failed bridge delivery, failed registration lookup, unchanged state, and failed output delivery.
`,
      ["socket-protocol"],
    ),
    chapter(
      "rerender-consistency",
      "The View After the Click",
      `
State mutation, callback-table replacement, HTML generation, and delivery must preserve the correspondence between visible elements and registered behavior. New markup paired with old registrations can address a different callback than the view implies.

Rerendering replaces the shell’s view rather than diffing browser-owned component objects. That makes output straightforward to trace but sends more than a local update would. Delayed events test the registration lifetime as well as HTML correctness.
`,
    ),
    chapter(
      "page-state",
      "Page Transitions and State",
      `
Navigation coordinates unload, outgoing-state save, active-page assignment, rendering, and load. Registrations follow the active page, so a message for the prior page cannot be resolved as an event for its replacement.

Saved renderer-local state can be restored on a later visit. Components also have explicit save/load operations and can force a rerender without saving. State retention and view replacement are therefore separate choices, even though both operate within the same renderer.

This is a navigation policy, not database persistence or server-restart recovery. Restoring a component’s state does not restore its old callback identities: the new render still needs registrations for the active view.
`,
      ["state-model"],
    ),
    chapter(
      "security-isolation",
      "Connection Isolation",
      `
Dispatch resolves addresses within the connection’s user renderer and active page. Callback identity routes behavior but does not independently establish connection ownership. A registered identifier must still be resolved in the permitted context.

Duplicate or replaced connections affect which renderer serves a shell; viewport-specific state belongs to that context too. Independent users, stale IDs, and page transitions exercise state isolation and routing together.
`,
    ),
    chapter(
      "fit",
      "Latency and Scope",
      `
Server-owned components suit controlled shells and internal tools where central state and a thin client justify connection-dependent interaction. Callback latency and full-view replacement become part of the interface’s cost.

Rapid drawing and offline use require capabilities outside this model. The compact TSX expression does not change those constraints: callback addressing and view lifetime remain the machinery that makes remote component state usable.
`,
      ["results"],
    ),
  ],
};
