import { chapter, type NarrativePlan } from "./types";
export const liveboardNarrative: NarrativePlan = {
  name: "LiveBoard",
  subtitle:
    "A collaborative whiteboard with shared undo, live previews, and durable edits.",
  abstract:
    "LiveBoard is a collaborative whiteboard designed to combine responsive editing with shared undo and durable recovery. It separates transient gesture previews from committed operations, which the backend serializes in PostgreSQL while deriving inverses from the affected state. Redis distributes room events, presence, and invalidation across backend replicas. Optimistic edits are reconciled using operation IDs, and revision gaps trigger snapshot recovery. This architecture supports live interaction without storing every pointer movement, while keeping history tied to committed state. Its centralized revision order provides shared undo but leaves offline merging and per-character collaborative text outside the current model.",
  sections: [
    chapter(
      "system-object",
      "A Shared Canvas",
      `
LiveBoard is a collaborative whiteboard with shared undo and durable history. A drag is visible to collaborators before its endpoint is saved; undo, refresh, and reconnect must still return everyone to a consistent document.

It separates transient motion from committed operations. React owns immediate interaction state, PostgreSQL holds the drawing and history, and the backend validates writes. Redis distributes room events and coordination across replicas. Previews keep a gesture responsive without filling revision history with pointer samples.
`,
    ),
    chapter(
      "canvas-state",
      "The Document Model",
      `
A canvas is an ordered JSON document with stable shape IDs, geometry, style, and optional background color. Array order determines stacking. Operations address IDs, so a shape can be patched or reordered without sending the entire drawing.

Keeping shapes in one document avoids per-kind relational schemas and lets the backend apply an operation against one state. Shape-specific validation still restricts supported fields and patches before mutation. The same validated operation feeds storage, undo history, and realtime delivery.
`,
    ),
    chapter(
      "editor-geometry",
      "Editor Geometry",
      `
The SVG viewBox defines the viewport’s document-space region. Pointer input is converted through its scale and origin before editing; zoom and pan remain view state rather than changes to saved geometry.

Group translation preserves relative placement, and group rotation uses the selection center. Handles, bounds, previews, and the committed transform share those calculations. Otherwise a gesture can look correct locally while publishing a different position or pivot to collaborators.

Drag, resize, and rotation publish intermediate previews and commit on completion. Text and color changes have their own commit points. Geometry determines the operation’s values, while the interaction lifecycle determines when they become durable.
`,
    ),
    chapter(
      "operation-algebra",
      "An Edit and Its Undo",
      `
The backend derives each inverse from the saved state it actually changes. A client’s view may omit an intervening edit, so a client-supplied inverse could restore the wrong value. Shared undo needs the prior committed state, not the sender’s private account of it.

PostgreSQL stores canvas state and revision alongside operation history; ownership, membership, sessions, and folders remain relational. A row lock serializes canvas writes. Validation, mutation, inverse computation, and history update occur in one transaction, keeping the revision and undo record aligned.

Undo and redo are shared mutations processed through that server state and broadcast to all editors. The stored document also provides the recovery snapshot for clients missing intervening events.

Batches preserve gesture-level undo. Their inverse reverses both the constituent operations and their order, so dependencies such as creation followed by modification are undone safely. A multi-object transform can remain one history step without discarding its internal ordering.
`,
      ["database"],
    ),
    chapter(
      "realtime-protocol",
      "Previews, Commits, and Recovery",
      `
Throttled previews cover drag, resize, and rotation; the final operation takes the durable transaction path. Color-picker exploration stays local until commit. Previews do not advance revision history and can be discarded during recovery.

The editor fetches state through HTTP, then receives an authoritative snapshot, revision, presence, and undo/redo availability over WebSocket. Previews affect the temporary display; committed events advance its document state.

The sender applies a final operation optimistically. Operation IDs identify its broadcast echo and prevent duplicate application. A rejected write or replacement snapshot clears the optimistic state.

Committed revision gaps trigger snapshot recovery instead of assuming the client can reconstruct missing edits. Reconnects and rate-limit interruptions use that path too. Because the snapshot restores durable state, it does not need to reproduce intermediate pointer motion.
`,
    ),
    chapter(
      "distributed-runtime",
      "Multiple Servers and Presence",
      `
With multiple backend replicas, committed state alone does not deliver an edit to every socket. Redis Pub/Sub distributes room events to the processes serving those connections, and each forwards locally. Presence, invalidation, and shared rate-limit counters use Redis too; PostgreSQL remains the source for recovering missed committed events.

Presence counts connections per user rather than treating each tab as a separate collaborator. Connection records expire by TTL. Join and leave events occur on the transitions between zero and nonzero connections, with a short leave delay to avoid refresh flicker. Expiration also repairs presence after a process exits without disconnect cleanup.

Durable-write rejection needs room-wide cleanup too. The writer receives a saved snapshot and resynchronizes; peers receive a preview reset so rejected motion does not remain visible. Shared write limits protect revision and history growth across replicas, while cursor and preview traffic have higher allowances. Recovery therefore handles failed commits as well as missed broadcasts.
`,
    ),
    chapter(
      "access-control",
      "Access Control",
      `
Ownership or current membership authorizes both HTTP requests and socket messages, using an httpOnly session cookie. Authorization is enforced on canvas access and edits, independently of what the dashboard displays.

Removing a member or deleting the canvas also invalidates established sockets. The backend persists the change and distributes invalidation to the replicas holding those connections. Handshake-time authorization alone would leave a removed collaborator in the live room.
`,
    ),
    chapter(
      "dashboard",
      "The Dashboard",
      `
The saved document also belongs to a workspace. Owners organize canvases in a folder tree; collaborators find them among shared canvases. Folder placement and membership are separate, so reorganizing the workspace does not change access.

Drag and drop persists both parent changes and sibling ordering, including mixed ordering of folders and canvases. Tree rails are derived from those sibling relationships. Deleting an owned subtree removes its resources, while removing a member leaves the document in place.
`,
    ),
    chapter(
      "design-lessons",
      "Validation and Tradeoffs",
      `
A group move followed by undo exercises geometry, previews, committed state, and history together. Repeating that sequence across replicas and interrupted connections checks whether recovery converges on the same saved revision, not only whether a gesture looks correct in one browser.

LiveBoard serializes operations on the server. That supplies one revision order and one shared history, at the cost of leaving offline merging outside the current model. Per-character collaborative text, richer roles, image storage, and exports are also outside its current scope.

Shared history is the central constraint on collaboration here. Preview delivery can be lossy; committed state and inverses cannot disagree. Snapshot recovery lets the live protocol remain lightweight while the transaction path supplies a definite state to return to.
`,
      ["tradeoffs", "feature-flow-catalog"],
    ),
  ],
};
