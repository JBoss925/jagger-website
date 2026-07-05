import canvasEditorImage from "../../assets/liveboard-canvas-editor.jpg";
import folderStructureImage from "../../assets/liveboard-folder-structure.jpg";
import sharingModalImage from "../../assets/liveboard-sharing-modal.jpg";
import type { PaperDocument } from "./types";

export const liveboardPaper: PaperDocument = {
    slug: "liveboard",
    title: "LiveBoard: A Realtime Collaborative Whiteboard With Server-Owned History",
    subtitle: "A full-stack whiteboard system for shared canvas editing, synchronized undo/redo, access control, folder organization, presence, and durable operational state.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "LiveBoard is a collaborative whiteboard application built around a React/SVG editor, a FastAPI backend, PostgreSQL-owned durable state, and WebSocket collaboration rooms. The application supports realtime shape editing, presence cursors, invite and removal flows, Drive-style canvas/folder organization, infinite-canvas navigation, grouping, z-ordering, text editing, opacity, stroke width, text sizing, rotation, multi-selection transforms, and shared undo/redo. The central architectural choice is that durable canvas history is owned by the backend rather than by individual clients. User actions are represented as typed operations, applied under an authoritative canvas revision, inverted against the locked state, and broadcast to connected editors. This paper describes the data model, operation algebra, collaboration protocol, access lifecycle, frontend interaction model, and file-management layer in sufficient detail to reconstruct the system.",
    description: "A technical paper for LiveBoard: realtime whiteboard collaboration, PostgreSQL state, WebSocket rooms, server-side history, access control, Drive-style folders, and SVG editor transforms.",
    categories: ["Systems", "Research Notes"],
    tags: [
        "TypeScript",
        "React",
        "FastAPI",
        "PostgreSQL",
        "WebSockets",
        "Docker",
        "Realtime Collaboration",
        "Undo Redo",
        "SVG Editing",
        "Access Control",
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
                    text: "LiveBoard is best understood as a product surface wrapped around an operation-processing core. The visible application has two major user spaces: the dashboard, where canvases and folders are managed, and the editor, where one canvas is edited collaboratively. The backend owns identities, sessions, access, canvas state, history, revision numbers, and folder structure."
                },
                {
                    kind: "equation",
                    label: "LiveBoard state",
                    tex: "\\mathcal{L} = (U, S, C, F, A, H, R, W)",
                    caption: "The system is composed of users U, sessions S, canvases C, folders F, access edges A, history H, active room state R, and WebSocket streams W."
                },
                {
                    kind: "paragraph",
                    text: "The important separation is durable versus transient state. PostgreSQL stores users, session tokens, canvases, folder rows, membership rows, operation logs, and undo/redo history. React state stores the current view, selected ids, toolbar defaults, temporary drag previews, modal state, and local viewport. WebSocket rooms store active sockets, presence, cursor color, and preview fanout."
                },
                {
                    kind: "diagram",
                    label: "Runtime boundary",
                    body: `browser/editor
  |  HTTP: list/create/rename/share/folders
  |  WS: cursor, op, preview_op, undo, redo
  v
FastAPI application
  |  validates access/session and operation shape
  |  locks canvas row during durable mutations
  v
PostgreSQL
  users, sessions, canvases, members, folders, ops, history`,
                    caption: "HTTP handles resource management and WebSockets handle live editing; both converge on the same authoritative PostgreSQL state."
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
                    text: "The frontend computes tree rail segments statically from the sibling relationship at each level. A row receives one rail segment per indent: a straight rail when an ancestor has a following sibling, a T rail when the row itself has following siblings, and an L rail when it is the last child for its parent. This avoids CSS guessing and makes nested folder drawings deterministic from the tree data."
                },
                {
                    kind: "equation",
                    label: "Rail classifier",
                    tex: "rail(d, i) \\in \\{none, straight, tee, elbow\\}",
                    caption: "Each row computes a rail token for depth d and sibling index i, then renders static segments rather than relying on cascading pseudo-element state."
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
                    text: "A canvas stores a JSON state object with a background color and ordered shape list. Shape ordering is the z-order: later shapes draw above earlier shapes. Every durable shape mutation is expressed as create, update, delete, reorder, or batch."
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
type TextShape = RectLike & { text: string; textColor: string; textOpacity: number; fontSize: number };`,
                    caption: "The editor keeps shape objects plain and serializable so operations can patch JSON state directly."
                },
                {
                    kind: "paragraph",
                    text: "Grouping is represented as a stack rather than as a separate group node. Each shape may carry groupIds, where the last element is the current active group. Creating a parent group appends a new id to every selected unit. Ungrouping removes only the active id, preserving child groups below it."
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
                    text: "The most important correctness decision in LiveBoard is moving undo/redo out of the client. If every editor kept a private history stack, two users editing the same object could undo different local stories over one shared state. LiveBoard instead treats history as a server-owned sequence of invertible operations."
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
                    text: "Multi-shape movement, group transforms, folder-independent shape grouping, and shared style edits all become batch operations. The inverse of a batch is the reversed list of child inverses. That preserves atomic user intent: one drag of six objects creates one undo step rather than six unrelated updates."
                },
                {
                    kind: "equation",
                    label: "Batch inverse",
                    tex: "invert(S, [op_1,\\ldots,op_n]) = [op_n^{-1},\\ldots,op_1^{-1}]",
                    caption: "Batch inversion reverses child order because each inverse must undo the latest applied child first."
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
                    text: "WebSocket collaboration separates previews from durable commits. During drag, resize, and rotation, the frontend sends throttled preview operations so other users see motion without inflating the revision counter. On pointer up, the frontend sends one durable operation with history enabled."
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
                    kind: "paragraph",
                    text: "Presence is a separate stream: cursor messages carry canvas-space coordinates, selected shape id, user id, username, and a deterministic user color. Remote cursors are inverse-scaled by the local zoom so the cursor glyph stays the same screen size as each editor pans or zooms."
                }
            ]
        },
        {
            id: "editor-geometry",
            eyebrow: "VI",
            title: "Editor Geometry and Interaction Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The editor uses SVG as the scene representation. The canvas viewport is effectively infinite by rendering a very large background rectangle and treating the SVG viewBox as the camera window. Wheel input changes zoom around the cursor. Middle-button or background drag changes the viewport origin."
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
                    kind: "equation",
                    label: "Rendered bounds",
                    tex: "bounds_{rendered}(s) = AABB(\\{R_\\theta q_i\\}_{i=1}^{4})",
                    caption: "The overlay uses the axis-aligned bounding box of rotated corners for wrapping selected artwork."
                }
            ]
        },
        {
            id: "access-control",
            eyebrow: "VII",
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
                    label: "Removal path",
                    body: `owner removes member
  -> DELETE /api/canvases/:id/members/:userId
  -> database membership row deleted
  -> room manager finds matching active sockets
  -> access_removed message
  -> socket close
  -> removed client stops receiving updates`,
                    caption: "Access changes affect both future authorization and currently connected editors."
                }
            ]
        },
        {
            id: "database",
            eyebrow: "VIII",
            title: "Durable Data Layout",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The database layout is small but deliberately complete. Users and sessions support authentication. Canvases own JSON state and revision. Members represent sharing. Folders organize only the owner's own canvases. Operations form an append-only record of durable mutations, and history rows point to forward/inverse operations for undo and redo."
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
                }
            ]
        },
        {
            id: "design-lessons",
            eyebrow: "IX",
            title: "Design Lessons",
            blocks: [
                {
                    kind: "bullets",
                    items: [
                        "Shared undo/redo belongs near the authoritative state, not in each browser tab.",
                        "Preview operations should use the same data shape as durable operations but must not increment revision.",
                        "Folders should organize owner-owned canvases only; sharing is a separate access graph.",
                        "Selection reconciliation must run after local, remote, undo, and redo operations so grouped children cannot remain individually editable.",
                        "SVG is a practical editor substrate when geometry helpers, rendered bounds, and viewport math are kept explicit.",
                        "Access removal must affect live sockets, not just future HTTP requests."
                    ]
                },
                {
                    kind: "paragraph",
                    text: "The project is less about one isolated trick than about making many small contracts agree: JSON shape state, relational ownership, WebSocket rooms, React interaction state, server-side history, and a serious dashboard UI. LiveBoard works because each boundary is narrow enough to explain and direct enough to test."
                }
            ]
        }
    ]
};
