import canvasEditorImage from "../../assets/liveboard-canvas-editor.jpg";
import folderStructureImage from "../../assets/liveboard-folder-structure.jpg";
import sharingModalImage from "../../assets/liveboard-sharing-modal.jpg";
import type { PaperDocument } from "./types";

export const liveboardPaper: PaperDocument = {
    slug: "liveboard",
    title: "LiveBoard: A Distributed Realtime Whiteboard With Durable Collaboration State",
    subtitle: "A full-stack collaborative canvas system with Redis-coordinated backend replicas, PostgreSQL-owned revisions, transient previews, shared undo/redo, access control, presence, and Drive-style organization.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "LiveBoard is a collaborative whiteboard application built around a React/SVG editor, horizontally scalable FastAPI backend replicas, PostgreSQL-owned durable state, Redis-coordinated ephemeral state, and WebSocket collaboration rooms. The application supports account sessions, owned and shared canvases, nested drag-and-drop folders, arbitrary sibling reordering, search and owner filtering for shared boards, invite and removal flows, realtime shape editing, presence cursors, infinite-canvas navigation, grouping, nested grouping, z-ordering, text editing with whole-object style and alignment controls, opacity, stroke width, rotation, multi-selection transforms, rate-limit recovery, and shared undo/redo. The central architectural choice is that durable canvas state, revision ordering, and undo/redo history remain owned by PostgreSQL and the backend, while Redis is used only for cross-server fanout, presence, invalidation, and counters. User actions are represented as typed operations, applied under an authoritative canvas revision, inverted against locked state, and broadcast to connected editors. This paper describes the product feature set, data model, operation algebra, collaboration protocol, distributed runtime, access lifecycle, frontend interaction model, and operational tradeoffs in sufficient detail to reconstruct the system.",
    description: "A technical paper for LiveBoard: Redis-backed distributed realtime collaboration, PostgreSQL durable state, WebSocket rooms, server-side history, rate-limit recovery, access control, Drive-style folders, and SVG editor transforms.",
    categories: ["Systems", "Research Notes"],
    tags: [
        "TypeScript",
        "React",
        "FastAPI",
        "PostgreSQL",
        "Redis",
        "WebSockets",
        "Docker",
        "Distributed",
        "Realtime Collaboration",
        "Undo Redo",
        "SVG Editing",
        "Access Control",
        "Rate Limiting",
        "Transient Operations",
        "Operational State"
    ],
    repoUrl: "https://github.com/JBoss925/LiveBoard",
    previewImage: canvasEditorImage,
    previewAlt: "LiveBoard canvas editor showing a collaborative SVG whiteboard with toolbar controls and selected shapes",
    previewCaption: "LiveBoard editor surface. The canvas viewport, toolbar state, shape transforms, presence cursors, and server-backed revision stream all meet in this view.",
    actionLinks: [
        {
            label: "Source Repository",
            href: "https://github.com/JBoss925/LiveBoard",
            description: "Open the LiveBoard source on GitHub"
        }
    ],
    audioSamples: [],
    sections: [
        {
            id: "system-object",
            eyebrow: "I",
            title: "System Object",
            blocks: [
                {
                    kind: "paragraph",
                    text: "LiveBoard is best understood as a product surface wrapped around an operation-processing core. The visible application has two major user spaces: the dashboard, where canvases and folders are managed, and the editor, where one canvas is edited collaboratively. The backend owns identities, sessions, access, canvas state, history, revision numbers, folder structure, and validation. Redis owns only ephemeral coordination for scaled backend replicas."
                },
                {
                    kind: "paragraph",
                    text: "That division is the through-line for the system. The application has to feel immediate while people drag objects, move cursors, and change styles, but it also has to converge to one saved canvas after reconnects, rate limits, missed messages, and multiple backend servers. LiveBoard handles that by treating every user-visible edit as either a temporary preview or a durable operation. Temporary state can be fast and disposable; durable state has to pass through one ordered backend path."
                },
                {
                    kind: "equation",
                    label: "LiveBoard state",
                    tex: "\\mathcal{L} = (U, S, C, F, A, H, O, P, W)",
                    caption: "The system is composed of users U, sessions S, canvases C, folders F, access edges A, history H, durable operations O, presence P, and WebSocket streams W."
                },
                {
                    kind: "paragraph",
                    text: "The important separation is durable versus transient state. PostgreSQL stores users, session tokens, canvases, folder rows, membership rows, operation logs, and undo/redo history. Redis stores cross-process Pub/Sub messages, presence TTL records, invalidation messages, and fixed-window rate-limit counters. React state stores the current view, selected ids, toolbar defaults, temporary drag and color previews, modal state, and local viewport."
                },
                {
                    kind: "paragraph",
                    text: "A useful way to read the runtime diagram is to ask what happens if any one layer disappears. If a browser refreshes, the canvas returns from PostgreSQL. If a Redis Pub/Sub event is missed, the next revision gap causes the client to refresh from PostgreSQL. If one backend replica dies, sockets reconnect through the proxy to another replica that shares the same database and Redis coordination layer. The architecture is designed so the fastest paths are not the only correctness paths."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "liveboard-runtime",
                        title: "Runtime boundary",
                        description: "HTTP and WebSocket traffic can land on any backend replica. PostgreSQL remains authoritative for durable state; Redis coordinates events that must cross process boundaries."
                    }
                }
            ]
        },
        {
            id: "dashboard",
            eyebrow: "II",
            title: "Dashboard and Folder Tree",
            blocks: [
                {
                    kind: "image",
                    label: "Dashboard file structure",
                    image: folderStructureImage,
                    alt: "LiveBoard dashboard showing nested folders, canvases, selection, and drag-and-drop file organization",
                    caption: "The dashboard presents owned canvases as a mixed folder/canvas tree and shared canvases as a separate searchable section."
                },
                {
                    kind: "paragraph",
                    text: "The dashboard model intentionally resembles a small Drive-like file manager. Owned canvases and folders are siblings inside an implicit root or a parent folder. Shared canvases are not allowed to appear inside the owner's folder tree because folders are an owner-local organization primitive, not an access-control primitive."
                },
                {
                    kind: "bullets",
                    items: [
                        "Owned canvases and folders render under Your canvases as one mixed, nested tree.",
                        "Shared canvases render separately under Shared with You and can be searched by canvas name or owner username.",
                        "Shared canvases can also be filtered by owner, which matters once a user has boards from several collaborators.",
                        "Folders can be created at the root, from empty list space, or from an existing folder row to create a nested folder.",
                        "Folders and canvases can be selected together, including single-click, Ctrl/Cmd toggle selection, Shift range selection, and Ctrl/Cmd+A across the owned list.",
                        "Owned canvases and folders support context-menu open, share, rename, create nested folder, delete, and destructive confirmation flows where applicable."
                    ]
                },
                {
                    kind: "paragraph",
                    text: "This distinction matters because it prevents the folder system from becoming a second permissions system. A folder answers the question, \"Where did the owner put this canvas?\" Membership answers the question, \"Who can open this canvas?\" Keeping those questions separate makes deletion, moving, sharing, and rendering easier to reason about. Deleting a folder can delete an owned subtree, while removing a member only removes an access edge."
                },
                {
                    kind: "equation",
                    label: "Folder tree",
                    tex: "F_o = (V_F \\cup V_C, E_{parent}, order)",
                    caption: "For owner o, the dashboard tree contains folder vertices, canvas vertices, parent edges, and a sibling order relation."
                },
                {
                    kind: "example",
                    label: "Dashboard item model",
                    language: "typescript",
                    code: `type CanvasFolder = {
  id: string;
  name: string;
  parentId?: string | null;
  sortOrder: number;
  updatedAt: string;
};

type CanvasSummary = {
  id: string;
  name: string;
  ownerId: string;
  folderId?: string | null;
  sortOrder: number;
  revision: number;
};`,
                    caption: "Folders and canvases share enough ordering shape to be rendered, selected, dragged, and reordered as one mixed sibling list."
                },
                {
                    kind: "paragraph",
                    text: "Drag and drop is not just a visual affordance. Dropping an owned canvas onto the center of a folder row changes its parent folder through PATCH /api/canvases/{canvas_id}/folder. Dropping a folder onto another folder changes the folder's parent through PATCH /api/folders/{folder_id}/parent, with the backend rejecting moves into itself or one of its descendants. Dropping a canvas or folder into an insertion zone before, between, or after siblings sends the complete desired sibling order to PATCH /api/dashboard/order."
                },
                {
                    kind: "diagram",
                    label: "Dashboard drag/drop flow",
                    body: `drag owned item
  -> hover center of folder row
     -> PATCH canvas folder or folder parent
     -> backend verifies ownership and cycle rules
     -> frontend refreshes owned tree placement

drag owned item
  -> hover insertion zone before/between/after siblings
     -> PATCH /api/dashboard/order with full mixed order
     -> backend rewrites sort_order for that parent
     -> frontend renders arbitrary sibling order`,
                    caption: "The dashboard supports both parent changes and arbitrary sibling reordering. The backend stores order explicitly instead of inferring it from names or creation time."
                },
                {
                    kind: "paragraph",
                    text: "The frontend computes tree rail segments statically from the sibling relationship at each level. A row receives one rail segment per indent: a straight rail when an ancestor has a following sibling, a T rail when the row itself has following siblings, and an L rail when it is the last child for its parent. This avoids CSS guessing and makes nested folder drawings deterministic from the tree data."
                },
                {
                    kind: "equation",
                    label: "Rail classifier",
                    tex: "rail(d, i) \\in \\{none, straight, tee, elbow\\}",
                    caption: "Each row computes a rail token for depth d and sibling index i, then renders static segments rather than relying on cascading pseudo-element state."
                },
                {
                    kind: "paragraph",
                    text: "Deletion is also folder-aware. Deleting a canvas removes that canvas and cascades its membership, operations, and history rows. Deleting a folder removes the entire owned folder subtree, including nested folders and owned canvases inside it. The frontend routes destructive actions through the shared confirmation modal, and the backend closes live sockets for any deleted canvases so open editors do not keep editing a resource that no longer exists."
                }
            ]
        },
        {
            id: "canvas-state",
            eyebrow: "III",
            title: "Canvas State and Shape Objects",
            blocks: [
                {
                    kind: "paragraph",
                    text: "A canvas stores a JSON state object with an optional background color and ordered shape list. Shape ordering is the z-order: later shapes draw above earlier shapes. Every durable shape mutation is expressed as create, update, delete, reorder, update_canvas, or batch. The backend validates the operation surface before any mutation is written or broadcast."
                },
                {
                    kind: "bullets",
                    items: [
                        "Rectangles and ellipses store x/y/width/height, stroke, fill, opacity, stroke width, rotation, and grouping metadata.",
                        "Lines store endpoint coordinates, stroke styling, opacity, stroke width, and grouping metadata; rotation is represented by endpoint updates rather than a separate angle.",
                        "Text shapes store a rectangular text box, text content, text color, text opacity, font size, alignment, wrapping behavior, and ordinary shape styling.",
                        "The canvas itself can store backgroundColor, which is updated by the paint bucket when the user clicks the background.",
                        "The ordered shapes array doubles as z-order, so bring-forward/send-back operations are durable reorder_shape operations."
                    ]
                },
                {
                    kind: "paragraph",
                    text: "The shape model is intentionally plain. Instead of building a deep object hierarchy with separate tables for rectangles, ellipses, text, groups, and lines, the canvas state stores serializable shape records in one JSON document. That makes the editor fast to evolve and keeps realtime messages small: most edits are just patches against a shape id. The tradeoff is that the backend must be strict about validating which fields are allowed for which shape type."
                },
                {
                    kind: "equation",
                    label: "Canvas object",
                    tex: "C_i = (owner_i, members_i, state_i, revision_i, history_i)",
                    caption: "Each canvas has an owner, a member set, a JSON state, a monotonic revision, and shared server-side history."
                },
                {
                    kind: "example",
                    label: "Shape union",
                    language: "typescript",
                    code: `type BaseShape = {
  id: string;
  type: "rect" | "ellipse" | "line" | "text";
  groupId?: string | null;
  groupIds?: string[] | null;
  strokeColor: string;
  fillColor: string;
  strokeOpacity: number;
  fillOpacity: number;
  strokeWidth: number;
  rotation?: number;
  createdBy: string;
  updatedAt: number;
};

type RectLike = BaseShape & { x: number; y: number; width: number; height: number };
type LineShape = BaseShape & { x1: number; y1: number; x2: number; y2: number };
type TextShape = RectLike & {
  text: string;
  textColor: string;
  textOpacity: number;
  fontSize: number;        // validated as 4..512
  textAlign?: "left" | "center" | "right";
};`,
                    caption: "The editor keeps shape objects plain and serializable so operations can patch JSON state directly."
                },
                {
                    kind: "paragraph",
                    text: "Text is intentionally whole-object styling rather than per-span rich text. A text shape can edit content, text color, text opacity, font size, and left/center/right alignment. Older text shapes without textAlign render as left-aligned. The toolbar keeps text controls visible for discoverability, but disables and mutes them unless the selection contains only unlocked text shapes."
                },
                {
                    kind: "paragraph",
                    text: "The text editing flow is designed around commit boundaries. Double-clicking or creating a text shape opens an inline textarea inside the SVG foreignObject. While the user types, text is local editor state. Blur, Escape, Tab, or Cmd/Ctrl+Enter commits one update_shape operation. That keeps typing responsive, avoids character-by-character collaborative editing complexity, and still gives undo/redo a clear unit: the completed text edit."
                },
                {
                    kind: "paragraph",
                    text: "That is a product and architecture choice, not a missing parser detail. Per-span rich text would require text-range operations, selection ranges, conflict handling inside a string, and more complex undo semantics. LiveBoard's current text object behaves like a styled diagram label: the whole label can be aligned, resized, colored, moved, grouped, rotated, and undone as one canvas object."
                },
                {
                    kind: "equation",
                    label: "Validated text style",
                    tex: "fontSize \\in [4,512],\\quad textAlign \\in \\{left,center,right\\}",
                    caption: "The frontend clamps committed values and the backend rejects invalid durable text-style patches."
                },
                {
                    kind: "paragraph",
                    text: "Grouping is represented as a stack rather than as a separate group node. Each shape may carry groupIds, where the last element is the current active group. Creating a parent group appends a new id to every selected unit. Ungrouping removes only the active id, preserving child groups below it."
                },
                {
                    kind: "diagram",
                    label: "Nested grouping flow",
                    body: `select units
  -> unit can be one unlocked shape or one already-grouped object
  -> Group appends new parent group id to every selected unit
  -> selection reconciles to the new top group
  -> move/scale/rotate operate on the group as one unit

Ungroup
  -> remove only the active/top group id
  -> preserve child group ids underneath`,
                    caption: "Groups are stored directly on member shapes. Nested grouping is a stack operation, not a separate tree of group nodes."
                },
                {
                    kind: "paragraph",
                    text: "The stack representation keeps grouping compatible with the rest of the operation model. Moving a group is still a batch of shape patches, deleting a group is still a batch of shape deletes, and undoing either action still uses the same inverse machinery as ordinary shape edits. There is no separate group object whose lifetime could drift away from its members."
                },
                {
                    kind: "equation",
                    label: "Nested group stack",
                    tex: "top(g_s) = g_s[|g_s|-1]",
                    caption: "Selection, movement, and ungrouping operate on the top group id, while earlier stack entries preserve nested grouping."
                }
            ]
        },
        {
            id: "operation-algebra",
            eyebrow: "IV",
            title: "Operation Algebra and Shared History",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The most important correctness decision in LiveBoard is moving undo/redo out of the client. If every editor kept a private history stack, two users editing the same object could undo different local stories over one shared state. LiveBoard instead treats history as a server-owned sequence of invertible operations serialized by the canvas row."
                },
                {
                    kind: "paragraph",
                    text: "The key practical detail is that the server derives the inverse from the state it actually locked, not from the state a browser thought it had. Suppose one client changes a rectangle from blue to red while another client is slightly behind. The undo record must restore blue from the authoritative pre-operation state, not from a stale or optimistic client snapshot. This is why durable edits go through a transaction that reads the canvas row, validates the operation, computes the next state, and records both forward and inverse operations together."
                },
                {
                    kind: "bullets",
                    items: [
                        "create_shape records newly drawn rectangles, ellipses, lines, and text boxes.",
                        "update_shape records moves, resizes, rotations, text commits, style changes, grouping metadata changes, and endpoint updates for lines.",
                        "update_canvas records canvas-level changes such as backgroundColor from the paint bucket.",
                        "reorder_shape records bring-to-front, bring-forward, send-backward, and send-to-back context menu actions.",
                        "delete_shape records toolbar delete, keyboard delete, and context-menu delete for unlocked shapes.",
                        "batch records multi-shape gestures: multi-selection movement, group transforms, multi-style edits, grouping, ungrouping, and grouped deletes."
                    ]
                },
                {
                    kind: "equation",
                    label: "Operation application",
                    tex: "S_{r+1} = apply(S_r, op_r)",
                    caption: "A durable operation transforms the authoritative canvas state and increments the canvas revision once."
                },
                {
                    kind: "equation",
                    label: "Inverse derivation",
                    tex: "op_r^{-1} = invert(S_r, op_r)",
                    caption: "The inverse is derived from the locked state before applying the operation, which makes undo independent of the submitting client."
                },
                {
                    kind: "example",
                    label: "Operation union",
                    language: "typescript",
                    code: `type CanvasOperation =
  | { id: string; kind: "batch"; ops: CanvasOperation[] }
  | { id: string; kind: "create_shape"; shape: Shape }
  | { id: string; kind: "update_canvas"; patch: Partial<CanvasState> }
  | { id: string; kind: "update_shape"; shapeId: string; patch: Partial<Shape> }
  | { id: string; kind: "delete_shape"; shapeId: string }
  | { id: string; kind: "reorder_shape"; shapeId: string; toIndex: number };`,
                    caption: "Batch operations are used when one user action must affect several shapes as one undoable history item."
                },
                {
                    kind: "paragraph",
                    text: "Multi-shape movement, group transforms, folder-independent shape grouping, and shared style edits all become batch operations. The inverse of a batch is the reversed list of child inverses. That preserves atomic user intent: one drag of six objects creates one undo step rather than six unrelated updates. Operation ids also act as an idempotency surface: duplicate durable submissions can return the already recorded revision rather than applying the same mutation twice."
                },
                {
                    kind: "paragraph",
                    text: "Batches also make the UI feel honest. If a user rotates a selected cluster, the system should not expose the implementation detail that five individual shape records changed. The history entry should say, in effect, \"undo that rotation.\" The server still stores the precise patches needed to reverse the change, but the user-facing unit remains the gesture that created it."
                },
                {
                    kind: "diagram",
                    label: "Feature to operation mapping",
                    body: `draw shape              -> create_shape
drag one shape          -> preview_op update_shape, then durable update_shape
drag group or selection -> preview_op batch, then durable batch
edit text content       -> local textarea draft, then durable update_shape
change style            -> update_shape or batch
paint background        -> update_canvas
bring forward/back      -> reorder_shape
group/ungroup           -> batch of groupIds patches
undo/redo               -> server applies stored inverse/forward op`,
                    caption: "The editor has many features, but they collapse into a small operation vocabulary that the backend can validate, persist, invert, and broadcast."
                },
                {
                    kind: "equation",
                    label: "Batch inverse",
                    tex: "invert(S, [op_1,\\ldots,op_n]) = [op_n^{-1},\\ldots,op_1^{-1}]",
                    caption: "Batch inversion reverses child order because each inverse must undo the latest applied child first."
                },
                {
                    kind: "example",
                    label: "Durable mutation transaction",
                    language: "sql",
                    code: `BEGIN;
SELECT state, revision FROM canvases WHERE id = $1 FOR UPDATE;
-- validate operation and derive inverse from locked state
UPDATE canvases SET state = $next_state, revision = revision + 1 WHERE id = $1;
INSERT INTO canvas_ops(canvas_id, revision, op) VALUES ($1, $next_revision, $op);
INSERT INTO canvas_history(canvas_id, forward_op, inverse_op, applied_revision)
  VALUES ($1, $op, $inverse, $next_revision);
COMMIT;`,
                    caption: "The durable write path validates, inverts, applies, logs, and publishes after a single authoritative revision is created."
                }
            ]
        },
        {
            id: "realtime-protocol",
            eyebrow: "V",
            title: "Realtime Protocol",
            blocks: [
                {
                    kind: "image",
                    label: "Canvas editor",
                    image: canvasEditorImage,
                    alt: "LiveBoard editor showing toolbar controls, selected objects, canvas surface, and collaborative whiteboard UI",
                    caption: "The editor sends durable operations for committed changes and preview operations during high-frequency drag, resize, and rotation gestures."
                },
                {
                    kind: "paragraph",
                    text: "WebSocket collaboration separates previews from durable commits. During drag, resize, and rotation, the frontend sends throttled preview operations so other users see motion without inflating the revision counter. Color picker movement is local-only preview state until the picker rests or blurs, so dragging through a spectrum does not create hundreds of saved revisions. On pointer up, blur, Enter, or another commit boundary, the frontend sends one durable operation with history enabled."
                },
                {
                    kind: "paragraph",
                    text: "Opening a canvas uses both HTTP and WebSocket paths. The whiteboard first fetches canvas metadata and the current durable state through GET /api/canvases/{canvas_id}. It then opens /ws/canvases/{canvas_id}, authenticated by the same httpOnly session cookie. The socket returns a snapshot containing state, revision, active users, and undo/redo availability. From that point forward, ordinary resource management remains HTTP, while live editing, cursors, previews, undo, and redo travel over the socket."
                },
                {
                    kind: "paragraph",
                    text: "This preview/commit split is what lets LiveBoard feel live without turning every pixel of movement into saved history. Other clients can see an object moving during a drag, but the durable record only contains the final resting position. The same idea applies to color selection: intermediate swatch values help the local user preview the result, while the saved canvas receives one final color change."
                },
                {
                    kind: "bullets",
                    items: [
                        "cursor messages keep collaborators visible without changing canvas state.",
                        "preview_op messages show remote drag, resize, and rotation motion without incrementing revision.",
                        "op messages represent committed changes that must be validated, persisted, inverted, and broadcast with a new revision.",
                        "undo and redo messages ask the server to apply shared history, so every connected editor sees the same result.",
                        "presence_join and presence_leave messages maintain the active collaborator list.",
                        "access_removed, session_expired, rate_limited, and preview_reset messages are recovery/control events that keep users and canvases in a correct state."
                    ]
                },
                {
                    kind: "equation",
                    label: "Preview stream",
                    tex: "preview(op_t) \\Rightarrow state_{local}^{*},\\quad revision' = revision",
                    caption: "Preview operations mutate transient room state for connected clients but do not persist history or increment revision."
                },
                {
                    kind: "diagram",
                    label: "WebSocket message flow",
                    body: `client A pointer move
  -> preview_op(batch update_shape...)
  -> room fanout
  -> client B applies transient preview

client A pointer up
  -> op(batch update_shape..., undoable=true)
  -> backend validates + locks + persists
  -> op_applied(revision+1, history_status)
  -> all clients reconcile state`,
                    caption: "The same operation shape is used for previews and commits, but only committed operations enter PostgreSQL history."
                },
                {
                    kind: "diagram",
                    label: "Revision-gap recovery",
                    body: `client current revision = 17
receives op_applied revision = 19
  -> expected 18, observed 19
  -> pause operation application
  -> GET /api/canvases/:canvasId
  -> replace local canvas state, revision, history
  -> resume from durable PostgreSQL snapshot`,
                    caption: "Redis Pub/Sub is best-effort. Durable correctness comes from revision numbers plus snapshot refresh when a client detects that it missed an operation."
                },
                {
                    kind: "paragraph",
                    text: "Revision-gap recovery is deliberately simple. The client does not try to replay a partial event stream or ask Redis for missed messages. It notices that the next durable revision is not the one it expected and replaces local canvas state with the authoritative HTTP snapshot. This makes Pub/Sub acceptable for realtime delivery because PostgreSQL remains the replay source for durable state."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "liveboard-recovery",
                        title: "Rate-limit recovery",
                        description: "Rejected writes are never persisted or fanned out. The sender and peers both return to the last durable canvas so transient previews cannot become visible drift."
                    }
                },
                {
                    kind: "paragraph",
                    text: "Presence is a separate stream: cursor messages carry canvas-space coordinates, selected shape id, user id, username, and a deterministic user color. Remote cursors are inverse-scaled by the local zoom so the cursor glyph stays the same screen size as each editor pans or zooms."
                },
                {
                    kind: "paragraph",
                    text: "Local optimism is intentionally bounded. A sender applies its own durable operation immediately so the UI does not wait on the network, but useCanvasSocket tracks operation ids so the sender does not double-apply the broadcast echo. If the server sends a snapshot, rate-limit event, or revision-gap refresh, the optimistic queue is cleared and local canvas state is replaced with PostgreSQL truth."
                }
            ]
        },
        {
            id: "distributed-runtime",
            eyebrow: "VI",
            title: "Distributed Runtime",
            blocks: [
                {
                    kind: "paragraph",
                    text: "LiveBoard can run several FastAPI backend containers behind a backend proxy. This required separating local socket ownership from room-wide collaboration semantics. Each replica owns only the WebSocket objects connected to that process. Redis carries room events, presence records, invalidation messages, and rate-limit counters across replicas."
                },
                {
                    kind: "paragraph",
                    text: "Without Redis, a single process can broadcast to the sockets it owns, but two backend processes would become two isolated rooms. A user connected to replica A would not automatically reach a user connected to replica B. Redis closes that gap by acting as the shared notification layer between replicas while leaving each process responsible for its own in-memory WebSocket objects."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "liveboard-fanout",
                        title: "Cross-replica fanout",
                        description: "A room is logical, not process-local. A replica commits durable operations to PostgreSQL, then uses Redis Pub/Sub so every other replica can forward the event to its local sockets."
                    }
                },
                {
                    kind: "equation",
                    label: "Authority split",
                    tex: "Durable = PostgreSQL,\\quad Ephemeral = Redis \\cup Browser",
                    caption: "Redis is deliberately not a cache for canvas state. It coordinates events that are either transient or recoverable from PostgreSQL."
                },
                {
                    kind: "example",
                    label: "Redis keys",
                    language: "text",
                    code: `liveboard:canvas:{canvas_id}:events
liveboard:presence:{canvas_id}:connections
liveboard:presence:conn:{connection_id}
rate:{scope}:{bucket}`,
                    caption: "The scaled runtime uses Pub/Sub channels for canvas events, TTL records for presence, and fixed-window counters for shared rate limits."
                },
                {
                    kind: "paragraph",
                    text: "Presence is user-level even when the same user has multiple tabs open. Redis stores connection ids with short TTLs. A join is broadcast when a user moves from zero connections to one or more, and a leave is delayed briefly so a refresh or tab handoff does not flicker the collaborator list."
                },
                {
                    kind: "paragraph",
                    text: "The TTL detail is important in a distributed WebSocket system. If a backend process exits without running its disconnect cleanup, Redis will eventually expire its connection records. That means the presence layer is eventually self-healing instead of depending on perfect shutdown behavior. The short delayed leave avoids the opposite problem: making ordinary reconnects look like people rapidly leaving and rejoining."
                },
                {
                    kind: "diagram",
                    label: "Presence transition",
                    body: `socket accepted
  -> add connection id to canvas set
  -> write connection record with TTL
  -> if previous user connection count was 0: presence_join

socket closed
  -> remove connection id
  -> wait briefly
  -> if user connection count is still 0: presence_leave`,
                    caption: "The collaborator list is derived from Redis presence in scaled mode and from local sockets in single-process fallback mode."
                },
                {
                    kind: "paragraph",
                    text: "Rate limits are shared across replicas when Redis is enabled. Authentication routes, HTTP API routes, cursor messages, preview messages, history messages, and durable writes each have separate counters. The write limit is the most important collaboration guard because it protects revision churn and history growth. Cursor and preview limits are intentionally higher so normal collaboration remains fluid."
                },
                {
                    kind: "paragraph",
                    text: "The rate-limit behavior is tied back into collaboration recovery. When a durable write is rejected, the server does not let the rejected operation leak to peers as if it had succeeded. The writer receives the saved canvas snapshot and briefly stops interacting with the canvas while it syncs. Peers receive a preview reset so any transient movement they saw from that writer is discarded. This is less magical than trying to patch over rejected writes, and it makes the failure mode visible."
                },
                {
                    kind: "example",
                    label: "Scaled local runtime",
                    language: "bash",
                    code: `docker compose up --build --scale server=3
curl http://localhost:3001/health
# {"ok": true, "postgres": true, "redis": true}`,
                    caption: "The Docker Compose path runs backend replicas behind Caddy, with all replicas sharing PostgreSQL and Redis."
                },
                {
                    kind: "paragraph",
                    text: "The single-process development path still works when REDIS_URL is unset: fanout, presence, and rate limits fall back to in-memory process state. That fallback is useful for simple backend work, but it is intentionally not treated as a distributed mode."
                }
            ]
        },
        {
            id: "editor-geometry",
            eyebrow: "VII",
            title: "Editor Geometry and Interaction Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The editor uses SVG as the scene representation. The canvas viewport is effectively infinite by rendering a very large background rectangle and treating the SVG viewBox as the camera window. Wheel input changes zoom around the cursor. Middle-button or background drag changes the viewport origin."
                },
                {
                    kind: "bullets",
                    items: [
                        "Toolbar tools include select, rectangle, ellipse, line, text, and paint bucket.",
                        "The header shows canvas metadata, revision state, active presence, navigation, and sharing controls.",
                        "Mouse wheel zooms around the pointer, and middle-button dragging pans without touching shared canvas state.",
                        "Select-tool background drag draws a box selection; dragging selected artwork moves selected units.",
                        "Delete/Backspace removes selected unlocked shapes; Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, and Cmd/Ctrl+Y call server undo/redo.",
                        "Right-click shape menus expose z-order actions, group/ungroup, and delete.",
                        "The paint bucket can apply fill style to a shape or update the canvas background color."
                    ]
                },
                {
                    kind: "paragraph",
                    text: "Using SVG keeps the editor close to the document model. Rectangles, ellipses, lines, text, selection outlines, and handles are all inspectable vector elements rather than pixels in a canvas bitmap. The cost is that geometry has to be explicit: zoom, rotation, hit targets, transformed bounds, and text editing all need careful coordinate conversion."
                },
                {
                    kind: "equation",
                    label: "Viewport transform",
                    tex: "screen(p) = zoom \\cdot (p - camera)",
                    caption: "The whiteboard treats the SVG viewBox as camera state; shapes remain in shared canvas coordinates."
                },
                {
                    kind: "paragraph",
                    text: "Selection behavior distinguishes object editing from viewport movement. Left-dragging the background with the select tool draws a box selection. Dragging any selected object moves the whole selection. Combined selection handles scale selected units, and the rotation handle rotates every selected unit around the selection center."
                },
                {
                    kind: "diagram",
                    label: "Pointer interaction states",
                    body: `idle
  -> background pointer down with select tool: box-selecting
  -> drawing tool pointer down: drawing draft shape
  -> selected shape pointer down: moving
  -> resize handle pointer down: resizing
  -> rotation handle pointer down: rotating
  -> middle button down: panning local viewport

pointer up
  -> local preview becomes one durable operation when the gesture changed shared canvas state`,
                    caption: "The frontend keeps local interaction state explicit so it can decide which gestures are local-only, transient previews, or durable history entries."
                },
                {
                    kind: "paragraph",
                    text: "The interaction model tries to make the same gesture mean the same thing for one object, many objects, and a grouped unit. A drag moves the selected unit, a corner handle scales it, and the rotation handle rotates it. The implementation may produce one shape patch or a batch of many shape patches, but the user's mental model stays centered on the visible selection box."
                },
                {
                    kind: "equation",
                    label: "Rotation transform",
                    tex: "p' = c + R_\\theta(p-c)",
                    caption: "Lines rotate by transforming endpoints. Rect-like shapes rotate by moving their center and updating their stored rotation angle."
                },
                {
                    kind: "paragraph",
                    text: "Selection overlays are not simply the stored axis-aligned boxes. Single rotated shapes compute rendered corners from the stored rotation so the outline and handles remain aligned with the visual object. Multi-selection and group overlays compute the axis-aligned bounds of each member's rendered corners, producing a combined box that wraps what the user actually sees."
                },
                {
                    kind: "paragraph",
                    text: "Toolbar synchronization follows the same respect for selection state. When every selected relevant shape shares a value, that value appears in the toolbar. If selected shapes disagree, the control remains useful as a next action but does not pretend there is one current value. Text controls stay visible so users can discover them, but they are muted and disabled unless the selection contains only unlocked text shapes."
                },
                {
                    kind: "bullets",
                    items: [
                        "Stroke controls: color, opacity, width.",
                        "Fill controls: color and opacity.",
                        "Text controls: text color, text opacity, pixel font size with increase/decrease buttons, and left/center/right alignment.",
                        "Slider controls commit on release rather than on every movement.",
                        "Color controls preview locally while the picker is moving and commit once the color rests or the picker blurs.",
                        "Grouped members are locked from direct style, text, bucket, and delete mutations, while the group can still move, scale, rotate, or be nested into a parent group."
                    ]
                },
                {
                    kind: "equation",
                    label: "Rendered bounds",
                    tex: "bounds_{rendered}(s) = AABB(\\{R_\\theta q_i\\}_{i=1}^{4})",
                    caption: "The overlay uses the axis-aligned bounding box of rotated corners for wrapping selected artwork."
                },
                {
                    kind: "paragraph",
                    text: "The canvas is visually infinite and operationally finite only in the mathematical sense that coordinates must be valid finite numbers. The backend does not validate movement against the initial viewport dimensions, so dragging far left, right, up, or down can still produce a durable operation that every client will converge on."
                },
                {
                    kind: "equation",
                    label: "Coordinate validity",
                    tex: "valid(p) \\Leftrightarrow isFinite(p_x) \\land isFinite(p_y)",
                    caption: "Durable movement validation follows the infinite-canvas model by rejecting non-finite values rather than rejecting coordinates outside the starting view."
                },
                {
                    kind: "paragraph",
                    text: "Read-only canvas text is not browser-selectable, which keeps object drags from turning into accidental text selection. The one exception is the active inline text editor: while editing a text shape, that shape's editor allows normal browser text selection, caret movement, and typing."
                }
            ]
        },
        {
            id: "access-control",
            eyebrow: "VIII",
            title: "Access Control, Sessions, and Removal",
            blocks: [
                {
                    kind: "image",
                    label: "Sharing modal",
                    image: sharingModalImage,
                    alt: "LiveBoard sharing modal showing canvas members and invite controls",
                    caption: "The share modal exposes the membership set and lets the owner add or remove access without leaving the editor."
                },
                {
                    kind: "paragraph",
                    text: "Canvas access is a graph edge from user to canvas, plus ownership. The owner is implicit from the canvas row. Shared access is stored in a membership table. A user may open a canvas if they are the owner or a current member."
                },
                {
                    kind: "paragraph",
                    text: "The application bootstrap starts with the same security model. On load, the React app calls GET /api/me with same-origin credentials. If the liveboard_session cookie maps to a valid server-side session, the dashboard opens. If not, the user sees signup/login. Signup normalizes credentials, hashes the password, creates a session, and sets the httpOnly cookie. Login accepts username or email, verifies the stored password hash, and creates the same session shape."
                },
                {
                    kind: "paragraph",
                    text: "Access control is enforced on both ordinary HTTP routes and the WebSocket path. That is necessary because a collaborative editor has two doors into the same resource: a user can fetch the canvas over HTTP, or they can join the live editing room. The same predicate has to guard both doors, and it has to remain true after the socket has already opened."
                },
                {
                    kind: "equation",
                    label: "Access predicate",
                    tex: "canOpen(u,c) = owner(c)=u \\lor (u,c) \\in A",
                    caption: "Both HTTP reads and WebSocket joins evaluate the same ownership-or-membership predicate."
                },
                {
                    kind: "paragraph",
                    text: "Session tokens are stored server-side, expire automatically, and are rechecked while WebSockets are open. This matters because deleting a stolen token should eventually stop an attacker even if they already established a socket. Membership removal also closes active sockets for the removed user and displays an access message on their screen."
                },
                {
                    kind: "diagram",
                    label: "Invite flow",
                    body: `owner opens share modal
  -> GET /api/canvases/:id/members
  -> owner enters username or email
  -> POST /api/canvases/:id/invite
  -> backend verifies owner and target user
  -> INSERT canvas_members
  -> modal updates member list
  -> invited user sees canvas in Shared with You`,
                    caption: "Sharing is stored as membership rows. Folders remain owner-local and do not affect whether the invited user can open the canvas."
                },
                {
                    kind: "diagram",
                    label: "Removal path",
                    body: `owner removes member
  -> DELETE /api/canvases/:id/members/:userId
  -> database membership row deleted
  -> Redis invalidation reaches every backend replica
  -> each room manager finds matching local sockets
  -> access_removed message
  -> socket close
  -> removed client stops receiving updates`,
                    caption: "Access changes affect both future authorization and currently connected editors."
                },
                {
                    kind: "paragraph",
                    text: "The Redis invalidation path is an acceleration path, not the security boundary. Open sockets re-check their session and canvas membership before every incoming message and every 30 seconds while idle. If an invalidation message is missed, the next database-backed check still closes an unauthorized socket."
                },
                {
                    kind: "paragraph",
                    text: "Canvas rename is intentionally split by ownership and context. Owners can rename from the dashboard context menu or inline from the board header; both use PATCH /api/canvases/{canvas_id}. Connected editors receive a canvas_renamed WebSocket event so the open header stays in sync. Non-owners can open shared canvases but cannot rename them or move them through the owner's folder tree."
                }
            ]
        },
        {
            id: "database",
            eyebrow: "IX",
            title: "Durable Data Layout",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The database layout is small but deliberately complete. Users and sessions support authentication. Canvases own JSON state and revision. Members represent sharing. Folders organize only the owner's own canvases. Operations form an append-only record of durable mutations, and history rows point to forward/inverse operations for undo and redo."
                },
                {
                    kind: "paragraph",
                    text: "There are two different storage shapes in play. Relational tables model identity, ownership, membership, folders, and append-only operation metadata because those are relationships the database is good at enforcing. The canvas drawing itself is stored as JSON because the shape schema is polymorphic and evolves with editor features. The operation validator is the boundary that keeps the flexible JSON state from becoming arbitrary untrusted data."
                },
                {
                    kind: "diagram",
                    label: "Core tables",
                    body: `users
  id, username, email, password_hash

sessions
  token_hash, user_id, expires_at

canvases
  id, owner_id, name, folder_id, sort_order, state, revision

canvas_members
  canvas_id, user_id

canvas_folders
  id, owner_id, parent_id, name, sort_order

canvas_ops
  id, canvas_id, revision, op

canvas_history
  id, canvas_id, user_id, forward_op, inverse_op, undone_at`,
                    caption: "The schema separates file organization, sharing, state snapshots, operation logs, and undoable history."
                },
                {
                    kind: "equation",
                    label: "Revision invariant",
                    tex: "revision(c) = |\\{op \\in canvas\\_ops : op.canvasId = c\\}|",
                    caption: "Revision is advanced once per durable operation and not during preview fanout."
                },
                {
                    kind: "paragraph",
                    text: "The state column is JSON because shape variants evolve quickly and because operations already validate the patch surface. Relational rows are used where relationships matter: users, sessions, members, folders, operation metadata, and history entries."
                },
                {
                    kind: "paragraph",
                    text: "The revision column is the bridge between those two worlds. It is stored with the canvas row, advanced under the same lock that writes JSON state, and echoed to clients in every durable WebSocket message. That single number lets clients detect missed operations, lets the UI display saved progress, and gives distributed fanout a convergence check without requiring sticky sessions or durable Redis streams."
                },
                {
                    kind: "diagram",
                    label: "Durability boundary",
                    body: `PostgreSQL
  users, sessions, canvases, folders, members
  canvas state snapshots
  revision numbers
  operation log
  undo/redo history

Redis
  Pub/Sub fanout
  presence TTLs
  rate-limit counters
  access/deletion invalidation

Browser
  viewport
  selection
  toolbar draft values
  local color and drag previews`,
                    caption: "The design keeps canonical collaboration data in PostgreSQL while allowing fast, discardable state to live closer to sockets and UI."
                }
            ]
        },
        {
            id: "feature-flow-catalog",
            eyebrow: "X",
            title: "Feature Flow Catalog",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The useful test of LiveBoard's architecture is whether each product feature has a clear route through the system. A feature should have one obvious frontend owner, one obvious backend contract, one durable state owner when persistence is needed, and one realtime story when collaborators are affected. The following catalog summarizes those routes."
                },
                {
                    kind: "example",
                    label: "Dashboard feature flows",
                    language: "text",
                    code: `signup/login
  AuthScreen -> /api/auth/signup or /api/auth/login -> sessions -> dashboard

create canvas
  Dashboard -> POST /api/canvases -> canvases + owner membership -> rename modal

create nested folder
  Dashboard/FolderModal -> POST /api/folders(parentId) -> canvas_folders

move canvas into folder
  drag/drop -> PATCH /api/canvases/:id/folder -> canvases.folder_id

move folder into folder
  drag/drop -> PATCH /api/folders/:id/parent -> canvas_folders.parent_id

reorder mixed siblings
  insertion zone drop -> PATCH /api/dashboard/order -> sort_order rewrite

share canvas
  ShareModal -> POST /api/canvases/:id/invite -> canvas_members

delete folder subtree
  ConfirmModal -> DELETE /api/folders/:id -> folders, canvases, sockets closed`,
                    caption: "Dashboard features use HTTP because they are resource-management actions rather than high-frequency live canvas edits."
                },
                {
                    kind: "example",
                    label: "Editor feature flows",
                    language: "text",
                    code: `draw
  pointer draft -> create_shape -> PostgreSQL revision -> op_applied

move/resize/rotate
  local optimistic preview -> preview_op fanout -> pointer-up durable op

multi-select or group transform
  combined bounds -> batch preview -> batch durable op -> one undo step

style change
  toolbar control -> update_shape or batch -> server-derived inverse

text edit
  inline textarea draft -> update_shape on commit -> one history entry

paint bucket
  shape click -> update_shape fill patch
  background click -> update_canvas backgroundColor

z-order action
  context menu -> reorder_shape -> shapes array order changes

undo/redo
  toolbar/shortcut -> websocket undo/redo -> server history -> op_applied`,
                    caption: "Editor features use WebSockets when collaborators should see the result live and use the same durable operation pipeline when the result should be saved."
                },
                {
                    kind: "example",
                    label: "Realtime and recovery flows",
                    language: "text",
                    code: `cursor movement
  canvas coordinates -> cursor message -> Redis fanout -> inverse-scaled remote cursor

durable op miss
  client observes revision gap -> GET /api/canvases/:id -> replace local state

rate-limited write
  backend rejects before persistence -> rate_limited snapshot to sender
  peers receive preview_reset -> refresh durable state

access removal
  DELETE member row -> Redis invalidation -> access_removed -> socket close

server scale-out
  any replica handles HTTP/WS -> PostgreSQL serializes writes
  Redis fans out transient and committed room events`,
                    caption: "Recovery flows are explicit product behavior, not incidental error handling. They keep the editor understandable when the network or rate limiter interrupts normal collaboration."
                }
            ]
        },
        {
            id: "design-lessons",
            eyebrow: "XI",
            title: "Design Choices and Tradeoffs",
            blocks: [
                {
                    kind: "bullets",
                    items: [
                        "Shared undo/redo belongs near the authoritative state, not in each browser tab.",
                        "Preview operations should use the same data shape as durable operations but must not increment revision.",
                        "Redis is a coordination layer, not a canvas-state cache; that keeps failure recovery tied to PostgreSQL snapshots and revisions.",
                        "Revision-gap recovery is cheaper than making every realtime event durable because cursor, preview, and presence messages are intentionally ephemeral.",
                        "Fixed-window rate limits are simple and predictable; the tradeoff is bucket-edge burstiness, which is acceptable for this collaboration workload.",
                        "Folders should organize owner-owned canvases only; sharing is a separate access graph.",
                        "Selection reconciliation must run after local, remote, undo, and redo operations so grouped children cannot remain individually editable.",
                        "SVG is a practical editor substrate when geometry helpers, rendered bounds, and viewport math are kept explicit.",
                        "Access removal must affect live sockets, not just future HTTP requests.",
                        "Whole-object text styling keeps collaboration and undo semantics tractable; per-span rich text would require a deeper text operation model."
                    ]
                },
                {
                    kind: "diagram",
                    label: "Rejected alternatives",
                    body: `sticky sessions only
  -> rejected: correctness should not depend on load-balancer affinity

PostgreSQL LISTEN/NOTIFY for everything
  -> rejected: high-frequency preview/cursor traffic should not live in the durable database path

Redis Streams for all collaboration events
  -> rejected: durable operations are already recoverable by revision snapshot

Redis canvas-state cache
  -> rejected: adds invalidation around the most important state`,
                    caption: "The chosen architecture is intentionally boring where correctness matters and fast where state is temporary."
                },
                {
                    kind: "paragraph",
                    text: "The alternatives mostly fail by putting the wrong kind of state in the wrong layer. Sticky sessions make the load balancer part of the correctness story. PostgreSQL notifications make transient cursor traffic compete with durable database work. Redis Streams add replay machinery for events that either do not need replay or can already be recovered from PostgreSQL. A Redis canvas cache would speed up some reads but complicate the only state that must never be ambiguous."
                },
                {
                    kind: "paragraph",
                    text: "The project is less about one isolated trick than about making many small contracts agree: JSON shape state, relational ownership, WebSocket rooms, Redis coordination, React interaction state, server-side history, and a serious dashboard UI. LiveBoard works because each boundary is narrow enough to explain and direct enough to test, while the complete product still feels like one continuous collaborative surface."
                }
            ]
        }
    ]
};
