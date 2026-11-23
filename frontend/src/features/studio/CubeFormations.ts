import type { FormationKind, PaletteSpec, SectionId, SpatialItem } from "./spatialModel";
import { VARIANTS_PART_A } from "./sculptureVariantsPartA";
import { VARIANTS_PART_B, type VariantEvaluator } from "./sculptureVariantsPartB";
import { VARIANTS_SEASON2_A } from "./sculptureVariantsSeason2A";
import { VARIANTS_SEASON2_B } from "./sculptureVariantsSeason2B";
import { VARIANTS_SEASON2_C } from "./sculptureVariantsSeason2C";
import { VARIANTS_SEASON3_A } from "./sculptureVariantsSeason3A";
import { VARIANTS_SEASON3_B } from "./sculptureVariantsSeason3B";
import { VARIANTS_SEASON3_C } from "./sculptureVariantsSeason3C";
import { VARIANTS_ABOUT_UNIQUE } from "./sculptureVariantsAboutUnique";
import { VARIANTS_RISK } from "./sculptureVariantsRisk";
import { VARIANTS_H2 } from "./sculptureVariantsH2";

const CHAMPION_EVALUATORS: Record<string, VariantEvaluator> = {
  ...VARIANTS_PART_A,
  ...VARIANTS_PART_B,
  ...VARIANTS_SEASON2_A,
  ...VARIANTS_SEASON2_B,
  ...VARIANTS_SEASON2_C,
  ...VARIANTS_SEASON3_A,
  ...VARIANTS_SEASON3_B,
  ...VARIANTS_SEASON3_C,
  ...VARIANTS_ABOUT_UNIQUE,
  ...VARIANTS_RISK,
  ...VARIANTS_H2,
};

/**
 * Active Live Sculptures (Season 3 — honoring all user preferences & locked favorites,
 * Lowe's 3D Retail Cash Register, Risk Quant Terminal champion, and dedicated unique sculptures
 * for About Working with a Team and About Range with zero reuse from Cornell DTI).
 */
export const ACTIVE_CHAMPION_VARIANT: Partial<Record<FormationKind, string>> = {
  "exp-h2-construction": "h2-crane-pick-and-place",
  "risk-terminal": "risk-monitor-candles",
  "jetstream-weather": "js-sun-cloud",
  "liveboard-canvas": "lb-whiteboard-cursors",
  "aixc-compress": "aixc-zipper",
  "games-board": "games-controller",
  "hearth-tube": "hearth-headphones",
  "ojaml-compiler": "ojaml-lambda-wasm",
  "portfolio-viewports": "port-device-trio",
  "chains-monad": "chains-s3-rewind-tape",
  "exp-google-pipeline": "gl4-server-funnel",
  "exp-palmetto-solar": "palmetto-panel-battery",
  "exp-lowes-retail": "lowes-s3-cash-register",
  "exp-incite-heartbeat": "incite-filled-heart-ecg",
  "exp-redventures-cloud": "rv-rocket",
  "exp-google-dance": "gi-clock-schedule",
  "exp-dti-constellation": "lead-compass",
  "about-leadership": "team-s3-roundtable",
  "exp-dti-events": "tpm-s3-megaphone-confetti",
  "exp-dti-fullstack": "fs-laptop-db",
  "about-range": "range-s3-swiss-army",
  "exp-velocitor-fleet": "vel-map-tiny-truck",
  "about-monogram": "about-j-brand-purple",
  "about-systems": "sys-microchip",
};

export const CUBE_COUNT = 120;

export type CubeTarget = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  color: string;
};

// Exact 56 unique edge+corner lattice points of a 6x6x6 hollow cube (zero duplicate corners)
const HOLLOW_6_EDGES: Array<[number, number, number]> = (() => {
  const pts: Array<[number, number, number]> = [];
  const vals = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  for (const x of vals) {
    for (const y of vals) {
      for (const z of vals) {
        const on =
          (Math.abs(x) === 2.5 ? 1 : 0) +
          (Math.abs(y) === 2.5 ? 1 : 0) +
          (Math.abs(z) === 2.5 ? 1 : 0);
        if (on >= 2) pts.push([x, y, z]);
      }
    }
  }
  return pts;
})();

// Exact 32 unique edge+corner lattice points of a 4x4x4 hollow cube
const HOLLOW_4_EDGES: Array<[number, number, number]> = (() => {
  const pts: Array<[number, number, number]> = [];
  const vals = [-1.5, -0.5, 0.5, 1.5];
  for (const x of vals) {
    for (const y of vals) {
      for (const z of vals) {
        const on =
          (Math.abs(x) === 1.5 ? 1 : 0) +
          (Math.abs(y) === 1.5 ? 1 : 0) +
          (Math.abs(z) === 1.5 ? 1 : 0);
        if (on >= 2) pts.push([x, y, z]);
      }
    }
  }
  return pts;
})();

// Exact 27 solid 3x3x3 core lattice points
const CORE_3_POINTS: Array<[number, number, number]> = (() => {
  const pts: Array<[number, number, number]> = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        pts.push([x, y, z]);
      }
    }
  }
  return pts;
})();

// Sculptural "J" monogram voxel coordinates (clean spacing, zero overlap)
const MONOGRAM_J_VOXELS: Array<[number, number, number]> = (() => {
  const grid = [
    "111111",
    "000110",
    "000110",
    "000110",
    "000110",
    "110110",
    "111110",
    "011100",
  ];
  const pts: Array<[number, number, number]> = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "1") {
        const x = (c - 2.5) * 0.31;
        const y = (3.5 - r) * 0.31;
        pts.push([x, y, -0.155], [x, y, 0.155]);
      }
    }
  }
  return pts; // 54 voxels
})();

// Iconic 3D Code Braces `{ ... }` + syntax lines for JaggerScript (clean non-overlapping grid!)
const CODE_BRACES_VOXELS: Array<{ x: number; y: number; z: number; role: "brace" | "line"; lineIdx: number; col: number }> = (() => {
  const leftBrace = [
    "0011",
    "0100",
    "0100",
    "1000",
    "0100",
    "0100",
    "0011",
  ];
  const pts: Array<{ x: number; y: number; z: number; role: "brace" | "line"; lineIdx: number; col: number }> = [];
  // Left `{` and mirrored Right `}` (2 layers deep = 40 voxels)
  for (let r = 0; r < leftBrace.length; r++) {
    for (let c = 0; c < leftBrace[r].length; c++) {
      if (leftBrace[r][c] === "1") {
        const lx = -1.62 + c * 0.25;
        const ry = (3 - r) * 0.32;
        pts.push({ x: lx, y: ry, z: -0.13, role: "brace", lineIdx: r, col: c });
        pts.push({ x: lx, y: ry, z: 0.13, role: "brace", lineIdx: r, col: c });
        const rx = 1.62 - c * 0.25;
        pts.push({ x: rx, y: ry, z: -0.13, role: "brace", lineIdx: r, col: c });
        pts.push({ x: rx, y: ry, z: 0.13, role: "brace", lineIdx: r, col: c });
      }
    }
  }
  // 5 crisp horizontal indented code lines inside the braces (40 voxels)
  const lines = [
    { row: 2, cols: [-3, -2, -1, 0, 1] },
    { row: 1, cols: [-2, -1, 0, 1, 2, 3] },
    { row: 0, cols: [-2, -1, 0, 1] },
    { row: -1, cols: [-1, 0, 1, 2, 3] },
    { row: -2, cols: [-3, -2, -1, 0] },
  ];
  lines.forEach((ln, li) => {
    ln.cols.forEach((c, ci) => {
      pts.push({ x: c * 0.27, y: ln.row * 0.36, z: -0.12, role: "line", lineIdx: li, col: ci });
      pts.push({ x: c * 0.27, y: ln.row * 0.36, z: 0.12, role: "line", lineIdx: li, col: ci });
    });
  });
  return pts; // 88 voxels total
})();

// Iconic 3D Price Tag with `$` inlay for Lowe's (Central Price Master)
const PRICE_TAG_VOXELS: Array<{ x: number; y: number; z: number; kind: "border" | "dollar" | "fill" }> = (() => {
  const art = [
    "001111100",
    "012222210",
    "122000221",
    "122232221",
    "122333221",
    "122322221",
    "122333221",
    "122223221",
    "122333221",
    "122232221",
    "111111111",
  ];
  const pts: Array<{ x: number; y: number; z: number; kind: "border" | "dollar" | "fill" }> = [];
  for (let r = 0; r < art.length; r++) {
    for (let c = 0; c < art[r].length; c++) {
      const ch = art[r][c];
      if (ch === "0") continue;
      const x = (c - 4) * 0.27;
      const y = (5 - r) * 0.27;
      const kind = ch === "1" ? "border" : ch === "3" ? "dollar" : "fill";
      pts.push({ x, y, z: kind === "dollar" ? 0.18 : 0, kind });
    }
  }
  return pts; // 90 non-overlapping voxels
})();

// Iconic 3D Smartphone frame + Map Pin for Cornell DTI TPM (Cue campus-events app)
const PHONE_EVENT_VOXELS: Array<{ x: number; y: number; z: number; part: "frame" | "card" | "pin"; cardIdx: number }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; part: "frame" | "card" | "pin"; cardIdx: number }> = [];
  // Vertical phone bezel (7 wide x 10 tall outer border = 30 cubes)
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 7; c++) {
      const isEdge = r === 0 || r === 9 || c === 0 || c === 6;
      if (isEdge) {
        pts.push({
          x: (c - 3) * 0.27,
          y: (4.5 - r) * 0.27 - 0.12,
          z: 0,
          part: "frame",
          cardIdx: -1,
        });
      }
    }
  }
  // 3 floating event cards inside the screen (5x2 cubes each = 30 cubes)
  for (let card = 0; card < 3; card++) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        pts.push({
          x: (c - 2) * 0.25,
          y: (1 - card) * 0.72 + (0.5 - r) * 0.24 - 0.12,
          z: 0.24,
          part: "card",
          cardIdx: card,
        });
      }
    }
  }
  // Location map pin hovering above top-right of the phone (16 cubes)
  const pinArt = [
    "01110",
    "11011",
    "11111",
    "01110",
    "00100",
  ];
  for (let r = 0; r < pinArt.length; r++) {
    for (let c = 0; c < pinArt[r].length; c++) {
      if (pinArt[r][c] === "1") {
        pts.push({
          x: 1.05 + (c - 2) * 0.21,
          y: 1.12 + (2 - r) * 0.21,
          z: 0.35,
          part: "pin",
          cardIdx: 0,
        });
      }
    }
  }
  return pts; // 76 clean non-overlapping cubes
})();

// Iconic 3D Sealed Envelope (`✉`) for Get in Touch / Contact
const ENVELOPE_VOXELS: Array<{ x: number; y: number; z: number; part: "body" | "flap" | "seal" }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; part: "body" | "flap" | "seal" }> = [];
  // 11 wide x 7 tall crisp envelope body border + back panel (77 cubes)
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 11; c++) {
      const x = (c - 5) * 0.28;
      const y = (3 - r) * 0.28;
      const isEdge = r === 0 || r === 6 || c === 0 || c === 10;
      pts.push({ x, y, z: isEdge ? 0.12 : -0.12, part: "body" });
    }
  }
  // Crisp V-shaped front envelope flap along the diagonals (19 cubes)
  for (let step = 0; step <= 5; step++) {
    const y = (3 - step * 0.65) * 0.28;
    const lx = (-5 + step) * 0.28;
    const rx = (5 - step) * 0.28;
    pts.push({ x: lx, y, z: 0.3, part: "flap" });
    if (step < 5) pts.push({ x: rx, y, z: 0.3, part: "flap" });
  }
  // Wax seal gem at the tip of the V-flap (4 cubes)
  pts.push(
    { x: -0.14, y: -0.08, z: 0.48, part: "seal" },
    { x: 0.14, y: -0.08, z: 0.48, part: "seal" },
    { x: -0.14, y: -0.34, z: 0.48, part: "seal" },
    { x: 0.14, y: -0.34, z: 0.48, part: "seal" },
  );
  return pts;
})();

function rotateYX(
  px: number,
  py: number,
  pz: number,
  rotY: number,
  rotX: number,
): [number, number, number] {
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y1 = py * cosX - pz * sinX;
  const z1 = py * sinX + pz * cosX;
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  return [px * cosY + z1 * sinY, y1, -px * sinY + z1 * cosY];
}

function triadColor(palette: PaletteSpec, role: "primary" | "deep" | "light" | "pearl"): string {
  if (role === "deep") return palette.deep;
  if (role === "light") return palette.light;
  if (role === "pearl") return "#f2ecff";
  return palette.primary;
}

/**
 * Compute clean, HUD-safe 3D overview anchor coordinates for every section.
 */
export function getOverviewAnchor(
  section: SectionId,
  index: number,
  count: number,
): [number, number, number] {
  if (count <= 1) return [0, -0.32, 0.2];

  if (section === "experience") {
    const topCount = Math.ceil(count / 2);
    const isTop = index < topCount;
    const rowLen = isTop ? topCount : count - topCount;
    const col = isTop ? index : index - topCount;
    const u = rowLen > 1 ? col / (rowLen - 1) - 0.5 : 0;
    const x = u * (isTop ? 7.8 : 6.6);
    const y = (isTop ? 0.62 : -1.42) + Math.cos(u * Math.PI) * 0.16;
    const z = isTop ? 0.1 : -0.1;
    return [x, y, z];
  }

  if (section === "library") {
    const cols = Math.min(4, Math.ceil(count / 2));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const rowLen = row === 0 ? Math.min(cols, count) : Math.max(1, count - cols);
    const u = rowLen > 1 ? col / (rowLen - 1) - 0.5 : 0;
    const x = u * 6.8;
    const y = row === 0 ? 0.72 : -1.36;
    const z = row === 0 ? 0.12 : -0.08;
    return [x, y, z];
  }

  if (section === "demos") {
    const topCount = Math.ceil(count / 2);
    const isTop = index < topCount;
    const rowLen = isTop ? topCount : count - topCount;
    const col = isTop ? index : index - topCount;
    const u = rowLen > 1 ? col / (rowLen - 1) - 0.5 : 0;
    const x = u * (isTop ? 6.6 : 5.0);
    const y = (isTop ? 0.72 : -1.36) + (isTop ? 1 : -1) * Math.cos(u * Math.PI) * 0.18;
    return [x, y, isTop ? 0.12 : -0.06];
  }

  if (section === "about") {
    const cols = 3;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const u = col - 1;
    const x = u * 3.0;
    const y = row === 0 ? 0.74 : -1.34;
    return [x, y, row === 0 ? 0.14 : -0.06];
  }

  if (count >= 11) {
    const rowSizes = [4, 5, count - 9];
    let row = 0;
    let col = index;
    if (index >= rowSizes[0] + rowSizes[1]) {
      row = 2;
      col = index - (rowSizes[0] + rowSizes[1]);
    } else if (index >= rowSizes[0]) {
      row = 1;
      col = index - rowSizes[0];
    }
    const len = rowSizes[row];
    const u = len > 1 ? col / (len - 1) - 0.5 : 0;
    const spanX = row === 0 ? 5.8 : row === 1 ? 7.6 : 5.8;
    const rowY = row === 0 ? 1.18 : row === 1 ? -0.45 : -2.08;
    const z = (1 - row) * 0.12;
    return [u * spanX, rowY, z];
  }

  if (count <= 4) {
    const u = count > 1 ? index / (count - 1) - 0.5 : 0;
    return [u * Math.min(6.2, (count - 1) * 2.3), -0.35, 0.15];
  }
  const topCount = Math.ceil(count / 2);
  const isTop = index < topCount;
  const len = isTop ? topCount : count - topCount;
  const col = isTop ? index : index - topCount;
  const u = len > 1 ? col / (len - 1) - 0.5 : 0;
  return [u * 6.4, isTop ? 0.72 : -1.36, isTop ? 0.1 : -0.1];
}

/**
 * Clean, non-overlapping mini-sculptures for Overview mode (NO `% 1` backward flyback!).
 */
export function computeMiniFormation(
  formation: FormationKind,
  _isLibraryVolume: boolean,
  localIdx: number,
  localCount: number,
  t: number,
  hovered: boolean,
  palette: PaletteSpec,
  useLegacy = false,
): {
  dx: number;
  dy: number;
  dz: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  color: string;
} {
  const boost = hovered ? 1.16 : 1;
  const sc = (localCount > 14 ? 0.15 : 0.172) * boost;
  const spin = t * 0.48;

  const idx = localIdx;
  const cnt = localCount;
  const u = cnt > 1 ? idx / (cnt - 1) : 0.5;
  const yBias = 0;

  if (!useLegacy) {
    const champKey = ACTIVE_CHAMPION_VARIANT[formation];
    const champ = champKey ? CHAMPION_EVALUATORS[champKey] : undefined;
    if (champ) {
      const m = champ.mini(idx, cnt, t, boost, sc, palette);
      return { ...m, dy: m.dy + yBias };
    }
  }

  let lx = 0;
  let ly = 0;
  let lz = 0;
  let rx = 0.24;
  let ry = spin;
  let rz = 0;
  let cubeScale = sc;
  let color = idx % 4 === 0 ? palette.deep : idx % 3 === 0 ? palette.light : palette.primary;

  switch (formation) {
    case "ojaml-compiler": {
      const treePts: Array<[number, number, number]> = [
        [0, 0.3, 0],
        [-0.22, 0.08, 0],
        [0.22, 0.08, 0],
        [-0.32, -0.14, 0],
        [-0.1, -0.14, 0],
        [0.1, -0.14, 0],
        [0.32, -0.14, 0],
        [-0.1, -0.36, 0],
        [0.1, -0.36, 0],
      ];
      const p = treePts[idx % treePts.length];
      const wave = Math.sin(t * 2.2 - p[1] * 4) * 0.5 + 0.5;
      [lx, ly, lz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.32, 0.18);
      cubeScale = sc * (0.94 + wave * 0.12);
      color = wave > 0.72 ? "#f2ecff" : idx === 0 ? palette.deep : palette.primary;
      rx = 0.18;
      ry = Math.sin(t * 0.45) * 0.32;
      break;
    }

    case "liveboard-canvas": {
      if (idx === cnt - 1) {
        lx = Math.cos(t * 1.2) * 0.24 * boost;
        ly = 0.22 * boost;
        lz = Math.sin(t * 1.2) * 0.24 * boost;
        color = palette.deep;
      } else {
        const c = (idx % 3) - 1;
        const r = Math.floor(idx / 3) - 1;
        [lx, ly, lz] = rotateYX(c * 0.22 * boost, -0.06, r * 0.22 * boost, -0.4 + Math.sin(t * 0.45) * 0.18, 0.56);
      }
      rx = 0.56;
      ry = -0.4;
      break;
    }

    case "hearth-tube": {
      // Mini vertical VU spectrum bars rising from a clean baseline
      const bar = idx;
      const pos = (u - 0.5) * 0.82 * boost;
      const h = (Math.sin(t * 2.4 + bar * 0.9) * 0.5 + 0.5) * 0.32 * boost;
      [lx, ly, lz] = rotateYX(pos, -0.16 + h, 0, Math.sin(t * 0.4) * 0.25, 0.18);
      color = h > 0.2 ? "#f2ecff" : bar % 2 === 0 ? palette.primary : palette.deep;
      rx = 0.18;
      ry = Math.sin(t * 0.4) * 0.25;
      break;
    }

    case "jaggerscript-heap": {
      // Mini `{ code }` braces + inner syntax lines
      const pts: Array<[number, number, number]> = [
        [-0.32, 0.2, 0], [-0.42, 0, 0], [-0.32, -0.2, 0],
        [0.32, 0.2, 0], [0.42, 0, 0], [0.32, -0.2, 0],
        [-0.1, 0.12, 0], [0.1, 0.12, 0], [0, -0.12, 0],
      ];
      const p = pts[idx % pts.length];
      const active = Math.sin(t * 2.4 - idx * 0.6) > 0.55;
      [lx, ly, lz] = rotateYX(p[0] * boost, p[1] * boost, 0, Math.sin(t * 0.45) * 0.28, 0.16);
      color = idx < 6 ? palette.deep : active ? "#f2ecff" : palette.light;
      rx = 0.16;
      ry = Math.sin(t * 0.45) * 0.28;
      break;
    }

    case "aixc-compress": {
      const phase = Math.pow(Math.sin(t * 1.4) * 0.5 + 0.5, 1.5);
      const sp = (0.105 + phase * 0.11) * boost;
      const bx = idx & 1 ? 1 : -1;
      const by = idx & 2 ? 1 : -1;
      const bz = idx & 4 ? 1 : -1;
      [lx, ly, lz] = rotateYX(bx * sp, by * sp, bz * sp, spin, 0.42);
      rx = 0.42;
      ry = spin;
      break;
    }

    case "genetic-trajectory": {
      // Clean non-wrapping parabolic arc cubes with a smooth traveling highlight pulse!
      const p = u * 2 - 1;
      const pulsePos = Math.sin(t * 1.4) * 0.95; // smooth back-and-forth pulse, zero flyback!
      const lit = Math.abs(p - pulsePos) < 0.3;
      lx = p * 0.42 * boost;
      ly = (0.28 - p * p * 0.46) * boost + (lit ? 0.04 : 0);
      lz = 0;
      cubeScale = lit ? sc * 1.18 : sc * 0.92;
      color = idx === cnt - 1 ? palette.deep : lit ? "#f2ecff" : palette.primary;
      rx = 0.16;
      ry = 0.22;
      break;
    }

    case "games-board": {
      // Compact checkered 3x3 board + capped 2-cube mini Santorini tower (never grows tall even with 40 cubes!)
      const slot = idx % 12;
      const layer = Math.floor(idx / 12);
      if (slot < 9) {
        const c = (slot % 3) - 1;
        const r = Math.floor(slot / 3) - 1;
        [lx, ly, lz] = rotateYX(
          c * 0.21 * boost,
          (-0.14 + layer * 0.04) * boost,
          r * 0.21 * boost,
          spin * 0.5,
          0.48,
        );
        color = slot % 2 === 0 ? palette.primary : palette.light;
      } else {
        const tier = slot - 9; // strictly 0, 1, 2
        const ox = tier === 2 ? 0 : (tier === 0 ? -0.1 : 0.1);
        [lx, ly, lz] = rotateYX(
          ox * boost,
          (0.06 + Math.min(tier, 1) * 0.18) * boost,
          0,
          spin * 0.5,
          0.48,
        );
        color = tier === 2 ? "#f2ecff" : palette.deep;
      }
      rx = 0.48;
      ry = spin * 0.5;
      break;
    }

    case "jetstream-weather": {
      // Mini cumulus cloud + gently bobbing raindrop cubes below (smooth sin wave, zero wraparound!)
      if (idx < 5) {
        const cloudPts: Array<[number, number, number]> = [
          [-0.22, 0.16, 0], [0, 0.24, 0], [0.22, 0.16, 0], [-0.11, 0.08, 0.18], [0.11, 0.08, -0.18],
        ];
        const p = cloudPts[idx];
        lx = (p[0] + Math.sin(t * 1.1) * 0.04) * boost;
        ly = p[1] * boost;
        lz = p[2] * boost;
        color = idx % 2 === 0 ? "#f2ecff" : palette.light;
      } else {
        const drop = idx - 5;
        const bob = Math.sin(t * 2.2 + drop * 1.4) * 0.08;
        lx = ((drop % 3) - 1) * 0.2 * boost;
        ly = (-0.18 + bob) * boost;
        lz = 0;
        cubeScale = sc * 0.78;
        color = palette.primary;
      }
      rx = 0.14;
      ry = 0.25;
      break;
    }

    case "rengine-scenegraph": {
      if (idx < 8) {
        const bx = idx & 1 ? 1 : -1;
        const by = idx & 2 ? 1 : -1;
        const bz = idx & 4 ? 1 : -1;
        [lx, ly, lz] = rotateYX(bx * 0.135 * boost, by * 0.135 * boost, bz * 0.135 * boost, spin, 0.45);
      } else {
        const a = t * 1.3 + idx;
        lx = Math.cos(a) * 0.38 * boost;
        ly = Math.sin(a * 1.5) * 0.14 * boost;
        lz = Math.sin(a) * 0.38 * boost;
        color = palette.deep;
      }
      rx = 0.45;
      ry = spin;
      break;
    }

    case "arena-clash": {
      // Compact two 2x2 clashing fighters (capped at 4 slots per side so large cnt never stacks tall!)
      const cycle = Math.abs(Math.sin(t * 2.0));
      const sep = (0.16 + cycle * 0.22) * boost;
      const half = Math.max(1, Math.floor(cnt / 2));
      const isLeft = idx < half;
      const local = (isLeft ? idx : idx - half) % 4;
      const row = local % 2 === 0 ? -0.1 : 0.1;
      const col = local < 2 ? -0.1 : 0.1;
      lx = (isLeft ? -sep : sep) + row * 0.5;
      ly = col * boost;
      lz = row * boost;
      color = isLeft ? palette.deep : palette.light;
      rx = 0.25;
      ry = spin * 0.5;
      break;
    }

    case "exp-h2-construction": {
      // Compact 2x2x3 building on left + clean L-shaped crane on right (capped height!)
      const slot = idx % 10;
      if (slot < 6) {
        const col = slot % 2 === 0 ? -0.22 : -0.02;
        const row = Math.floor(slot / 2) - 1;
        [lx, ly, lz] = rotateYX(col * boost, row * 0.19 * boost, 0, spin * 0.45, 0.2);
      } else if (slot < 8) {
        const lvl = slot - 6;
        [lx, ly, lz] = rotateYX(0.26 * boost, (-0.12 + lvl * 0.22) * boost, 0, spin * 0.45, 0.2);
        color = palette.deep;
      } else {
        const arm = slot - 8;
        [lx, ly, lz] = rotateYX((0.06 - arm * 0.22) * boost, 0.3 * boost, 0, spin * 0.45, 0.2);
        color = "#f2ecff";
      }
      rx = 0.2;
      ry = spin * 0.45;
      break;
    }

    case "exp-palmetto-solar": {
      // Mini house roof + sun cube above
      const housePts: Array<[number, number, number]> = [
        [-0.2, -0.18, 0], [0, -0.18, 0], [0.2, -0.18, 0],
        [-0.2, 0.02, 0], [0.2, 0.02, 0],
        [-0.18, 0.2, 0], [0, 0.32, 0], [0.18, 0.2, 0],
        [0.36, 0.38, 0.12],
      ];
      const p = housePts[idx % housePts.length];
      [lx, ly, lz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.3, 0.18);
      color = idx >= 8 ? "#f2ecff" : idx >= 5 ? palette.deep : palette.primary;
      rx = 0.18;
      ry = Math.sin(t * 0.45) * 0.3;
      break;
    }

    case "exp-incite-heartbeat": {
      const px = (u - 0.5) * 0.82 * boost;
      const beatPos = Math.sin(t * 1.4) * 0.9;
      const dist = Math.abs((u * 2 - 1) - beatPos);
      const spike = dist < 0.28 ? Math.cos((dist / 0.28) * Math.PI * 0.5) * 0.28 * boost : 0;
      lx = px;
      ly = spike - 0.04;
      lz = 0;
      if (spike > 0.12) color = palette.deep;
      rx = 0.12;
      ry = 0.18;
      break;
    }

    default: {
      const col = (idx % 3) - 1;
      const row = Math.floor(idx / 3) - 1;
      const wave = Math.sin(t * 1.4 + col * 0.8 + row * 0.5) * 0.035;
      [lx, ly, lz] = rotateYX(
        col * 0.22 * boost,
        row * 0.22 * boost + wave,
        ((idx % 2) - 0.5) * 0.19 * boost,
        spin * 0.5,
        0.3,
      );
      rx = 0.3;
      ry = spin * 0.5;
      break;
    }
  }

  return {
    dx: lx,
    dy: ly + yBias,
    dz: lz,
    rx,
    ry,
    rz,
    scale: cubeScale,
    color,
  };
}

/**
 * HERO FORMATION (ALL 120 CUBES):
 * Every sculpture follows TWO strict design laws:
 *  1) Instant literal content recognition (house+solar, `{ code }`, envelope, price tag, crane, arena, cloud+rain, etc.)
 *  2) ZERO self-intersecting z-fighting clusters & ZERO `% 1` backward-flyback phasing!
 *     (All flow animations use smooth continuous traveling waves or closed orbits/ping-pong.)
 */
export function computeHeroFormation(
  item: SpatialItem,
  idx: number,
  count: number,
  t: number,
  centerX: number,
  centerY: number,
  useLegacy = false,
): CubeTarget {
  const pal = item.palette;
  const f = item.formation;
  const u = idx / Math.max(count - 1, 1);

  if (!useLegacy) {
    const champKey = ACTIVE_CHAMPION_VARIANT[f];
    const champ = champKey ? CHAMPION_EVALUATORS[champKey] : undefined;
    if (champ) {
      const res = champ.hero(idx, count, t, pal);
      const floatY = Math.sin(t * 0.8 + u * 2) * 0.035;
      return {
        ...res,
        x: centerX + res.x,
        y: centerY + res.y + floatY,
        z: res.z + 0.55,
      };
    }
  }

  let x = 0;
  let y = 0;
  let z = 0;
  let rx = 0.22;
  let ry = t * 0.28;
  let rz = 0;
  let scale = 0.24;
  let color = triadColor(pal, idx % 6 === 0 ? "pearl" : idx % 4 === 0 ? "deep" : idx % 3 === 0 ? "light" : "primary");

  switch (f) {
    /* --------------------------------------------------------------------
       1. OJAML — Non-Overlapping AST Syntax Tree -> Smooth Traveling Compile Wave -> WASM Block
       -------------------------------------------------------------------- */
    case "ojaml-compiler": {
      const rotY = -0.22 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.18;
      // Traveling compile pulse moves smoothly top (y = +1.5) -> bottom (y = -1.5) via smooth cosine wave
      const waveY = 1.65 - (((t * 0.85) % 1) * 3.3);
      if (idx < 28) {
        // 7 crisp AST nodes (4 non-overlapping cubes per node)
        const nodes: Array<[number, number, number]> = [
          [0, 1.48, 0],
          [-0.78, 0.82, 0],
          [0.78, 0.82, 0],
          [-1.24, 0.14, 0],
          [-0.36, 0.14, 0],
          [0.36, 0.14, 0],
          [1.24, 0.14, 0],
        ];
        const n = Math.floor(idx / 4);
        const sub = idx % 4;
        const [nx, ny, nz] = nodes[n];
        const ox = sub % 2 === 0 ? -0.115 : 0.115;
        const oy = sub < 2 ? -0.115 : 0.115;
        const dist = Math.abs(ny - waveY);
        const lit = dist < 0.45;
        [x, y, z] = rotateYX(nx + ox, ny + oy, nz + (lit ? 0.08 : 0), rotY, rotX);
        scale = lit ? 0.22 : 0.2;
        color = lit ? "#f2ecff" : n === 0 ? pal.deep : pal.primary;
      } else if (idx < 64) {
        // 36 FIXED cleanly-spaced branch edge cubes (6 branches x 6 interior slots: NEVER fly backward!)
        const e = idx - 28;
        const nodes: Array<[number, number]> = [
          [0, 1.48], [-0.78, 0.82], [0.78, 0.82],
          [-1.24, 0.14], [-0.36, 0.14], [0.36, 0.14], [1.24, 0.14],
        ];
        const pairs = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
        const b = Math.floor(e / 6);
        const step = (e % 6 + 1) / 7; // strictly between nodes (0.14..0.86) -> zero node overlap!
        const a = nodes[pairs[b][0]];
        const c = nodes[pairs[b][1]];
        const px = a[0] + (c[0] - a[0]) * step;
        const py = a[1] + (c[1] - a[1]) * step;
        const lit = Math.abs(py - waveY) < 0.36;
        [x, y, z] = rotateYX(px, py, lit ? 0.08 : 0, rotY, rotX);
        scale = lit ? 0.185 : 0.145;
        color = lit ? "#f2ecff" : pal.light;
      } else if (idx < 76) {
        // 12 FIXED cleanly-spaced compiler funnel cubes (3 rows x 4 tapering smoothly into WASM block)
        const j = idx - 64;
        const row = Math.floor(j / 4); // 0, 1, 2
        const col = (j % 4) - 1.5;
        const taper = 1 - row * 0.24;
        const px = col * 0.42 * taper;
        const py = -0.26 - row * 0.26;
        const lit = Math.abs(py - waveY) < 0.34;
        [x, y, z] = rotateYX(px, py, 0, rotY, rotX);
        scale = lit ? 0.2 : 0.16;
        color = lit ? "#f2ecff" : pal.primary;
      } else {
        // 44 cubes forming a crisp 4x3x4-ish compiled WebAssembly binary cube at base (clean 0.30 spacing)
        const j = idx - 76;
        const gx = (j % 4) - 1.5;
        const gz = (Math.floor(j / 4) % 4) - 1.5;
        const gy = Math.floor(j / 16); // 0, 1, 2
        const py = -1.62 + gy * 0.31;
        const lit = Math.abs(py - waveY) < 0.38;
        [x, y, z] = rotateYX(gx * 0.31, py, gz * 0.31, rotY, rotX);
        scale = lit ? 0.285 : 0.265;
        color = lit ? "#f2ecff" : gy === 2 ? pal.light : (gx + gz) % 2 === 0 ? pal.deep : pal.primary;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       2. LIVEBOARD — Crisp 9x9 Infinite Canvas + 2 Dragged Shapes + 2 Distinct Live Cursors!
       -------------------------------------------------------------------- */
    case "liveboard-canvas": {
      const rotY = -0.42 + Math.sin(t * 0.26) * 0.14;
      const rotX = 0.52;
      if (idx < 72) {
        // 9x8 clean tiled infinite whiteboard plane
        const col = (idx % 9) - 4;
        const row = Math.floor(idx / 9) - 3.5;
        [x, y, z] = rotateYX(col * 0.36, -0.62, row * 0.36, rotY, rotX);
        scale = 0.295;
        color = (col + Math.floor(row + 4)) % 2 === 0 ? "#f2ecff" : pal.light;
      } else if (idx < 100) {
        // TWO clearly separated shapes being collaboratively moved across opposite sides of the board!
        const j = idx - 72; // 28 cubes: Shape A (16 cubes 4x4 frame) + Shape B (12 cubes 4x3 card)
        const isA = j < 16;
        const k = isA ? j : j - 16;
        const ax = -0.82 + Math.cos(t * 0.9) * 0.42;
        const az = -0.35 + Math.sin(t * 1.05) * 0.48;
        const bx = 0.85 + Math.sin(t * 0.8) * 0.42;
        const bz = 0.35 + Math.cos(t * 0.95) * 0.46;
        const sx = isA ? ((k % 4) - 1.5) * 0.24 : ((k % 4) - 1.5) * 0.24;
        const sz = isA ? (Math.floor(k / 4) - 1.5) * 0.24 : (Math.floor(k / 4) - 1) * 0.24;
        [x, y, z] = rotateYX((isA ? ax : bx) + sx, -0.05, (isA ? az : bz) + sz, rotY, rotX);
        scale = 0.21;
        color = isA ? pal.primary : "#c479b0";
      } else {
        // TWO unmistakable, color-coded collaborative pointer arrows hovering high above their shapes!
        const j = idx - 100; // 20 cubes = 10 per cursor!
        const isA = j < 10;
        const k = isA ? j : j - 10;
        const ax = -0.58 + Math.cos(t * 0.9) * 0.42;
        const az = -0.1 + Math.sin(t * 1.05) * 0.48;
        const bx = 1.08 + Math.sin(t * 0.8) * 0.42;
        const bz = 0.58 + Math.cos(t * 0.95) * 0.46;
        // Sharp tilted arrow-head + diagonal tail (10 crisp non-overlapping cubes)
        const arrowPts: Array<[number, number, number]> = [
          [0, 0.38, 0], // tip pointing down at shape
          [0.16, 0.56, 0], [-0.16, 0.56, 0], [0, 0.56, 0.16], [0, 0.56, -0.16],
          [0.16, 0.74, 0.14], [0, 0.74, 0],
          [0.28, 0.92, 0.24], [0.4, 1.1, 0.34], [0.52, 1.28, 0.44],
        ];
        const ap = arrowPts[k];
        [x, y, z] = rotateYX((isA ? ax : bx) + ap[0], ap[1], (isA ? az : bz) + ap[2], rotY, rotX);
        scale = 0.155;
        color = isA ? pal.deep : "#b5528d";
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       3. HEARTH — Studio Audio Saturation Console: Rotating Warmth Knob + Vertical VU EQ Bars!
       -------------------------------------------------------------------- */
    case "hearth-tube": {
      const rotY = -0.22 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.24;
      if (idx < 36) {
        // Sleek horizontal audio console baseplate (12 wide x 3 deep = 36 non-overlapping cubes)
        const c = (idx % 12) - 5.5;
        const d = Math.floor(idx / 12) - 1;
        [x, y, z] = rotateYX(c * 0.31, -1.05, d * 0.31, rotY, rotX);
        scale = 0.265;
        color = d === 0 ? pal.light : "#f2ecff";
      } else if (idx < 64) {
        // Sculpted Analog Saturation Rotary Knob on the left side (smoothly turning back & forth!)
        const j = idx - 36; // 28 cubes
        const dialAngle = Math.sin(t * 1.1) * 1.2;
        if (j < 24) {
          // 2 clean non-overlapping circular tiers of 12 cubes
          const tier = Math.floor(j / 12);
          const a = ((j % 12) / 12) * Math.PI * 2 + dialAngle;
          const r = 0.56;
          [x, y, z] = rotateYX(-1.12 + Math.cos(a) * r, -0.58 + tier * 0.28, Math.sin(a) * r, rotY, rotX);
          scale = 0.22;
          color = tier === 1 ? pal.primary : pal.deep;
        } else {
          // Luminous white indicator pointer bar on top of knob!
          const k = j - 24; // 0..3
          const r = 0.12 + k * 0.17;
          [x, y, z] = rotateYX(-1.12 + Math.cos(dialAngle) * r, -0.02, Math.sin(dialAngle) * r, rotY, rotX);
          scale = 0.16;
          color = "#f2ecff";
        }
      } else {
        // 8 crisp vertical Audio VU Equalizer columns on the right (7 cubes tall each = 56 cubes)
        // Smoothly rising from the console baseline like a real analog studio spectrum analyzer!
        const j = idx - 64;
        const col = Math.floor(j / 7); // 0..7
        const lvl = j % 7; // 0..6
        const bx = -0.1 + col * 0.29;
        const activeHeight = 3.2 + Math.sin(t * 2.6 + col * 0.75) * 2.0 + Math.cos(t * 4.2 - col * 0.5) * 0.9;
        const isLit = lvl <= activeHeight;
        const py = -0.72 + lvl * 0.29;
        [x, y, z] = rotateYX(bx, py, 0, rotY, rotX);
        scale = isLit ? 0.24 : 0.11;
        color = !isLit ? "#f2ecff" : lvl >= 5 ? "#f2ecff" : lvl >= 3 ? pal.primary : pal.deep;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       4. JAGGERSCRIPT — Iconic 3D Code Braces `{ ... }` with Animated Syntax Lines!
       -------------------------------------------------------------------- */
    case "jaggerscript-heap": {
      const rotY = Math.sin(t * 0.35) * 0.28;
      const rotX = 0.16;
      const activeLine = Math.floor((t * 1.4) % 5);
      if (idx < CODE_BRACES_VOXELS.length) {
        const v = CODE_BRACES_VOXELS[idx];
        const isExecuting = v.role === "line" && v.lineIdx === activeLine;
        const popZ = isExecuting ? 0.16 : 0;
        [x, y, z] = rotateYX(v.x, v.y, v.z + popZ, rotY, rotX);
        scale = v.role === "brace" ? 0.225 : isExecuting ? 0.23 : 0.2;
        color =
          v.role === "brace"
            ? pal.deep
            : isExecuting
              ? "#f2ecff"
              : v.col === 0
                ? pal.primary
                : pal.light;
      } else {
        // 32 cubes forming a clean surrounding code-window frame border (no overlap!)
        const j = idx - CODE_BRACES_VOXELS.length; // 0..31
        const side = Math.floor(j / 8); // 4 sides x 8 strictly unique points
        const s = (j % 8) / 8; // 0..0.875 -> zero duplicate corners!
        const W = 2.05;
        const H = 1.48;
        const px = side === 0 ? -W + s * 2 * W : side === 1 ? W : side === 2 ? W - s * 2 * W : -W;
        const py = side === 0 ? H : side === 1 ? H - s * 2 * H : side === 2 ? -H : -H + s * 2 * H;
        [x, y, z] = rotateYX(px, py, -0.35, rotY, rotX);
        scale = 0.18;
        color = pal.light;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       5. AIXC COMPRESSOR — Crisp 5x5x5 Breathing Architectural Matrix (Zero Overlap!)
       -------------------------------------------------------------------- */
    case "aixc-compress": {
      const gx = (idx % 5) - 2;
      const gy = (Math.floor(idx / 5) % 5) - 2;
      const gz = Math.floor(idx / 25) - 2;
      const phase = Math.pow(Math.sin(t * 1.2) * 0.5 + 0.5, 1.6);
      const spacing = 0.295 + phase * 0.28;
      const rotY = 0.55 + t * 0.34;
      const rotX = 0.42 + Math.sin(t * 0.35) * 0.1;
      [x, y, z] = rotateYX(gx * spacing, gy * spacing, gz * spacing, rotY, rotX);
      rx = rotX;
      ry = rotY;
      scale = 0.26 - phase * 0.03;
      const isCorner = Math.abs(gx) === 2 && Math.abs(gy) === 2;
      color = isCorner ? pal.deep : (gx + gy + gz) % 2 === 0 ? pal.primary : pal.light;
      break;
    }

    /* --------------------------------------------------------------------
       6. GENETICTS — Launcher + 4 Fixed Clean Parabolic Arcs + Traveling Evolution Pulse + Bullseye!
          (Zero `% 1` backward flyback — silky-smooth wave of glowing shots!)
       -------------------------------------------------------------------- */
    case "genetic-trajectory": {
      const rotY = -0.2 + Math.sin(t * 0.28) * 0.14;
      const rotX = 0.16;
      if (idx < 12) {
        // Launcher cannon base on left (3x4 clean non-overlapping block)
        const bx = (idx % 3 - 1) * 0.25 - 1.72;
        const by = Math.floor(idx / 3) * 0.25 - 1.15;
        [x, y, z] = rotateYX(bx, by, 0, rotY, rotX);
        scale = 0.22;
        color = pal.deep;
      } else if (idx < 96) {
        // 4 fixed non-overlapping parabolic trajectory arcs (21 slots each) with smooth luminous wave!
        const j = idx - 12;
        const gen = j % 4;
        const slot = Math.floor(j / 4); // 0..20
        const s = (slot + 0.5) / 21; // strictly stationary slot 0.02..0.98
        const uArc = s * 2 - 1;
        const reach = gen === 0 ? 1.68 : gen === 1 ? 1.48 : gen === 2 ? 1.84 : 1.28;
        const peak = gen === 0 ? 1.46 : 1.12 + gen * 0.22;
        const px = -1.62 + s * (1.62 + reach);
        const py = peak - uArc * uArc * (peak + 0.92);
        const pz = (gen - 1.5) * 0.32;

        // Smooth continuous traveling shot wave along each arc (no cube ever teleports backward!)
        const waveHead = ((t * (0.65 + gen * 0.08) + gen * 0.23) % 1);
        let d = s - waveHead;
        if (d < -0.5) d += 1;
        if (d > 0.5) d -= 1;
        const lit = Math.abs(d) < 0.095;

        [x, y, z] = rotateYX(px, py + (lit ? 0.05 : 0), pz, rotY, rotX);
        scale = lit ? 0.255 : gen === 0 ? 0.185 : 0.145;
        color = lit ? "#f2ecff" : gen === 0 ? pal.primary : pal.light;
      } else {
        // Crisp non-overlapping target bullseye on the right (16 outer + 8 inner = 24 cubes)
        const j = idx - 96;
        const isInner = j >= 16;
        const a = (isInner ? (j - 16) / 8 : j / 16) * Math.PI * 2 + t * 0.5;
        const r = isInner ? 0.26 : 0.62;
        [x, y, z] = rotateYX(1.74, -0.92 + Math.sin(a) * r, Math.cos(a) * r, rotY, rotX);
        scale = isInner ? 0.16 : 0.19;
        color = isInner ? "#f2ecff" : pal.deep;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       7. JAGGER GAMES — 6x6 Checkered Game Board + 4 Rising Santorini Towers (Zero Overlap!)
       -------------------------------------------------------------------- */
    case "games-board": {
      const rotY = -0.45 + t * 0.2;
      const rotX = 0.54;
      if (idx < 36) {
        // 6x6 clean checkered voxel board
        const c = (idx % 6) - 2.5;
        const r = Math.floor(idx / 6) - 2.5;
        [x, y, z] = rotateYX(c * 0.44, -0.82, r * 0.44, rotY, rotX);
        scale = 0.38;
        color = (Math.floor(c + 3) + Math.floor(r + 3)) % 2 === 0 ? pal.light : "#f2ecff";
      } else if (idx < 72) {
        // Perimeter sliding puzzle tiles cleanly on the outer ring (zero overlap with inner 4 towers!)
        const j = idx - 36;
        const ringPositions: Array<[number, number]> = [];
        for (let c = 0; c < 6; c++) ringPositions.push([c - 2.5, -2.5]);
        for (let r = 1; r < 6; r++) ringPositions.push([2.5, r - 2.5]);
        for (let c = 4; c >= 0; c--) ringPositions.push([c - 2.5, 2.5]);
        for (let r = 4; r >= 1; r--) ringPositions.push([-2.5, r - 2.5]);
        const pos = ringPositions[j % ringPositions.length];
        const tier = Math.floor(j / ringPositions.length);
        const hop = Math.max(0, Math.sin(t * 2.0 + j * 0.65)) * 0.18;
        [x, y, z] = rotateYX(pos[0] * 0.44, -0.44 + tier * 0.28 + hop, pos[1] * 0.44, rotY, rotX);
        scale = 0.24;
        color = j % 4 === 0 ? pal.deep : pal.primary;
      } else {
        // 4 stepped Santorini towers cleanly on the inner 4 quadrants (12 cubes each = 48 cubes)
        const j = idx - 72;
        const tower = Math.floor(j / 12);
        const k = j % 12;
        const tx = tower % 2 === 0 ? -0.66 : 0.66;
        const tz = tower < 2 ? -0.66 : 0.66;
        const level = Math.floor(k / 4);
        const sub = k % 4;
        const rOff = 0.155;
        const sx = sub % 2 === 0 ? -rOff : rOff;
        const sz = sub < 2 ? -rOff : rOff;
        const grow = Math.sin(t * 1.4 + tower * 1.4) * 0.1;
        [x, y, z] = rotateYX(tx + sx, -0.35 + level * 0.34 + grow, tz + sz, rotY, rotX);
        scale = 0.26 - level * 0.025;
        color = level === 2 ? pal.deep : level === 1 ? pal.primary : "#f2ecff";
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       8. JETSTREAM — Sculpted Cumulus Cloud + Smooth Wind Waves + Shimmering Rain Columns
       -------------------------------------------------------------------- */
    case "jetstream-weather": {
      const rotY = -0.2 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.16;
      if (idx < 48) {
        // Clean orthogonal layered voxel cumulus cloud at top (zero z-fighting!)
        const cloudVoxels: Array<[number, number, number]> = [
          // Bottom flat cloud base (5x2 = 10) + mid layer (7x2 = 14) + upper domes (24)
          ...Array.from({ length: 14 }, (_, k) => [((k % 7) - 3) * 0.32, 0.72, (Math.floor(k / 7) - 0.5) * 0.32] as [number, number, number]),
          ...Array.from({ length: 18 }, (_, k) => [((k % 6) - 2.5) * 0.32, 1.04, (Math.floor(k / 6) - 1) * 0.32] as [number, number, number]),
          ...Array.from({ length: 12 }, (_, k) => [((k % 4) - 1.5) * 0.32, 1.36, (Math.floor(k / 4) - 1) * 0.32] as [number, number, number]),
          [-0.16, 1.66, 0], [0.16, 1.66, 0], [-0.48, 1.36, 0.32], [0.48, 1.36, -0.32],
        ];
        const p = cloudVoxels[idx % cloudVoxels.length];
        const drift = Math.sin(t * 0.8) * 0.12;
        [x, y, z] = rotateYX(p[0] + drift, p[1], p[2], rotY, rotX);
        scale = 0.285;
        color = idx % 3 === 0 ? "#f2ecff" : pal.light;
      } else if (idx < 84) {
        // 3 crisp horizontal laminar Jet-Stream wind currents (12 fixed slots each, smooth wave ripple!)
        const j = idx - 48;
        const stream = Math.floor(j / 12); // 0, 1, 2
        const slot = j % 12;
        const s = slot / 11;
        const px = (s - 0.5) * 3.5;
        const py = -0.08 + (stream - 1) * 0.38 + Math.sin(s * Math.PI * 2 - t * 2.6 + stream) * 0.22;
        const pz = (stream - 1) * 0.32;
        const gust = Math.sin(s * Math.PI * 2 - t * 3.0 + stream) > 0.5;
        [x, y, z] = rotateYX(px, py, pz, rotY, rotX);
        scale = gust ? 0.21 : 0.16;
        color = gust ? "#f2ecff" : pal.primary;
      } else {
        // 6 vertical shimmering rain columns (6 droplets each = 36 cubes, smooth wave pulse, zero wrap!)
        const j = idx - 84;
        const col = Math.floor(j / 6) - 2.5;
        const row = j % 6; // 0 top .. 5 bottom
        const fallWave = ((t * 1.6 + col * 0.37) % 1) * 6;
        let d = row - fallWave;
        if (d < -3) d += 6;
        if (d > 3) d -= 6;
        const lit = Math.abs(d) < 0.85;
        const px = col * 0.44 + row * 0.08; // gentle wind slant
        const py = 0.34 - row * 0.34;
        [x, y, z] = rotateYX(px, py, (col % 2 === 0 ? 0.16 : -0.16), rotY, rotX);
        scale = lit ? 0.19 : 0.11;
        color = lit ? pal.deep : pal.light;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       9. RENGINE — GameCube-Homage Nested Cube + Orbiting Face-Rotating Squares!
       -------------------------------------------------------------------- */
    case "rengine-scenegraph": {
      const rotX = 0.46 + Math.sin(t * 0.35) * 0.08;
      const rotY = t * 0.32;
      if (idx < 56) {
        const [gx, gy, gz] = HOLLOW_6_EDGES[idx];
        [x, y, z] = rotateYX(gx * 0.38, gy * 0.38, gz * 0.38, rotY, rotX);
        rx = rotX;
        ry = rotY;
        scale = 0.31;
        const isCorner = Math.abs(gx) === 2.5 && Math.abs(gy) === 2.5 && Math.abs(gz) === 2.5;
        color = isCorner ? pal.deep : pal.primary;
      } else if (idx < 88) {
        const [gx, gy, gz] = HOLLOW_4_EDGES[idx - 56];
        const childRotY = -t * 0.55;
        [x, y, z] = rotateYX(gx * 0.3, gy * 0.3, gz * 0.3, childRotY, rotX * 0.8);
        rx = rotX * 0.8;
        ry = childRotY;
        scale = 0.23;
        color = pal.light;
      } else if (idx < 96) {
        // Tight 2x2x2 jewel grandchild entity core (8 cubes)
        const k = idx - 88;
        const gx = k & 1 ? 0.16 : -0.16;
        const gy = k & 2 ? 0.16 : -0.16;
        const gz = k & 4 ? 0.16 : -0.16;
        const coreRot = t * 0.85;
        [x, y, z] = rotateYX(gx, gy, gz, coreRot, 0.35);
        rx = 0.35;
        ry = coreRot;
        scale = 0.22;
        color = "#f2ecff";
      } else {
        // 24 crisp satellite squares rotating in synchronized 4-cube squares around ALL 6 outer faces!
        const k = idx - 96; // 0..23 -> 6 faces x 4 rotating square-orbit cubes!
        const face = Math.floor(k / 4); // 0..5 (+X, -X, +Y, -Y, +Z, -Z)
        const corner = k % 4;
        const faceSpin = t * 1.15 * (face % 2 === 0 ? 1 : -1) + (corner * Math.PI) / 2;
        const dist = 1.48; // sits crisply outside the 0.95 outer cube face!
        const r = 0.42;
        const u1 = Math.cos(faceSpin) * r;
        const u2 = Math.sin(faceSpin) * r;
        let lx = 0, ly = 0, lz = 0;
        if (face === 0) { lx = dist; ly = u1; lz = u2; }
        else if (face === 1) { lx = -dist; ly = u1; lz = u2; }
        else if (face === 2) { lx = u1; ly = dist; lz = u2; }
        else if (face === 3) { lx = u1; ly = -dist; lz = u2; }
        else if (face === 4) { lx = u1; ly = u2; lz = dist; }
        else { lx = u1; ly = u2; lz = -dist; }
        [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
        rx = rotX + faceSpin * 0.5;
        ry = rotY + faceSpin * 0.5;
        scale = 0.2;
        color = corner % 2 === 0 ? "#f2ecff" : pal.deep;
      }
      break;
    }

    /* --------------------------------------------------------------------
       10. PORTFOLIO VIEWS — 3 Fanned Angled Browser Windows Facing Camera (Coverflow Arc!)
       -------------------------------------------------------------------- */
    case "portfolio-viewports": {
      // 3 crisp browser frames (40 cubes each: 8 wide x 5 tall) fanned in a shallow arc toward camera!
      const card = Math.floor(idx / 40); // 0 (left), 1 (center), 2 (right)
      const k = idx % 40;
      const col = (k % 8) - 3.5; // -3.5..3.5
      const row = Math.floor(k / 8) - 2; // -2..2
      const activeFloat = Math.sin(t * 1.1 + card * 2.1) * 0.14;
      const cardYaw = (card - 1) * -0.44 + Math.sin(t * 0.35) * 0.12;
      const cardOffsetX = (card - 1) * 1.45;
      const cardOffsetZ = card === 1 ? 0.55 : -0.18;
      const lx = col * 0.2;
      const ly = row * 0.28 + activeFloat;
      const [rxp, ryp, rzp] = rotateYX(lx, ly, 0, cardYaw, 0.12);
      x = cardOffsetX + rxp;
      y = ryp;
      z = cardOffsetZ + rzp;
      rx = 0.12;
      ry = cardYaw;
      const isTopChrome = row === 2;
      const isBorder = Math.abs(col) === 3.5 || row === -2;
      scale = isTopChrome ? 0.19 : isBorder ? 0.175 : 0.155;
      color = isTopChrome
        ? col < -1.5
          ? "#f2ecff"
          : pal.deep
        : isBorder
          ? pal.primary
          : "#f2ecff";
      break;
    }

    /* --------------------------------------------------------------------
       11. TSXLIGHT RENDERER — 3D Refracting Optical Light Prism + Incoming Beam + Spectrum Fan!
       -------------------------------------------------------------------- */
    case "tsxlight-layers": {
      const rotY = -0.18 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.18;
      if (idx < 45) {
        // Crisp 3D Triangular Optical Prism in center (3 layers x 15-cube triangle = 45 cubes!)
        const depthLayer = Math.floor(idx / 15) - 1; // -1, 0, 1
        const local = idx % 15;
        // Triangle rows: 1 + 2 + 3 + 4 + 5 = 15 cubes!
        let r = 0, rem = local;
        while (rem >= r + 1) { rem -= r + 1; r++; }
        const px = (rem - r / 2) * 0.29;
        const py = (2 - r) * 0.28;
        const pz = depthLayer * 0.3;
        [x, y, z] = rotateYX(px, py, pz, rotY, rotX);
        scale = 0.245;
        color = depthLayer === 0 ? "#f2ecff" : pal.light;
      } else if (idx < 63) {
        // Incoming pure-white Light Beam hitting the left face of the prism (18 fixed slots, pulse wave!)
        const j = idx - 45;
        const s = j / 17; // 0 left .. 1 prism face
        const wave = ((t * 1.2) % 1);
        const lit = Math.abs(s - wave) < 0.14;
        const px = -2.05 + s * 1.48;
        const py = -0.25 + s * 0.36;
        [x, y, z] = rotateYX(px, py, 0, rotY, rotX);
        scale = lit ? 0.21 : 0.15;
        color = "#f2ecff";
      } else {
        // Refracted 5-ray Spectrum Cone fanning gracefully out the right face! (57 cubes = 5 rays)
        const j = idx - 63;
        const ray = j % 5; // 0..4 (top violet -> periwinkle -> teal -> rose -> soft gold-pearl)
        const slot = Math.floor(j / 5); // 0..11
        const s = slot / 11;
        const wave = ((t * 1.2) % 1);
        const lit = Math.abs(s - wave) < 0.15;
        const spreadAngle = (ray - 2) * 0.26;
        const px = 0.52 + s * 1.58;
        const py = 0.12 + Math.sin(spreadAngle) * (0.28 + s * 1.65);
        const pz = (ray - 2) * 0.12;
        const rayColors = ["#7c5cd6", "#6b93e0", "#65b3a6", "#cc7ea8", "#e3a5c7"];
        [x, y, z] = rotateYX(px, py, pz, rotY, rotX);
        scale = lit ? 0.215 : 0.155;
        color = lit ? "#f2ecff" : rayColors[ray];
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       12. RANDOM ARENA — Crisp Arena Ring + Two Round Ball Fighters Clashing & Bursting!
       -------------------------------------------------------------------- */
    case "arena-clash": {
      const rotX = 0.54;
      const rotY = Math.sin(t * 0.25) * 0.18;
      if (idx < 56) {
        // Crisp circular arena containment wall ring (2 tiers of 28 cubes)
        const tier = Math.floor(idx / 28);
        const a = ((idx % 28) / 28) * Math.PI * 2;
        const r = 1.78;
        [x, y, z] = rotateYX(Math.cos(a) * r, -0.35 + tier * 0.26, Math.sin(a) * r, rotY, rotX);
        rx = rotX;
        ry = rotY - a;
        scale = 0.22;
        color = tier === 1 ? pal.light : "#f2ecff";
      } else if (idx < 108) {
        // TWO DISTINCT BALL FIGHTERS (26 cubes each: dense Fibonacci sphere + spinning melee blade!)
        // Elastic ping-pong collision cycle: charge inward -> CLASH at center -> recoil to arena walls!
        const j = idx - 56;
        const isFighterA = j < 26;
        const local = isFighterA ? j : j - 26;
        const period = 2.4;
        const phase = (t % period) / period;
        const distFromCenter = 0.34 + Math.pow(Math.abs(phase * 2 - 1), 0.72) * 0.84;
        const orbitA = t * 0.55;
        const dir = isFighterA ? -1 : 1;
        const fx = Math.cos(orbitA) * distFromCenter * dir;
        const fz = Math.sin(orbitA) * distFromCenter * dir;

        if (local < 20) {
          // Compact dense ball fighter sphere (20 cubes)
          const phi = Math.acos(1 - 2 * ((local + 0.5) / 20));
          const theta = Math.PI * (1 + Math.sqrt(5)) * local + t * 2.5 * dir;
          const r = 0.32;
          [x, y, z] = rotateYX(
            fx + Math.sin(phi) * Math.cos(theta) * r,
            -0.18 + Math.cos(phi) * r,
            fz + Math.sin(phi) * Math.sin(theta) * r,
            rotY,
            rotX,
          );
          scale = 0.2;
          color = isFighterA ? "#7f5cd6" : "#d4729f";
        } else {
          // Spinning rotating weapon arm sticking out from each fighter!
          const w = local - 20;
          const wa = t * 4.8 * dir + (isFighterA ? 0 : Math.PI);
          const wr = 0.36 + w * 0.13;
          [x, y, z] = rotateYX(fx + Math.cos(wa) * wr, -0.15, fz + Math.sin(wa) * wr, rotY, rotX);
          scale = 0.16;
          color = isFighterA ? "#dcd0fc" : "#fad4e5";
        }
        rx = rotX;
        ry = rotY;
      } else {
        // 12 elastic collision spark cubes bursting cleanly outward right at impact (phase ≈ 0.5)!
        const j = idx - 108;
        const period = 2.4;
        const phase = (t % period) / period;
        const impactAge = phase >= 0.5 ? (phase - 0.5) * 2 : 0;
        const a = (j / 12) * Math.PI * 2 + t;
        const burstR = impactAge > 0 ? impactAge * 1.45 : 0.08;
        const burstY = impactAge > 0 ? Math.sin(impactAge * Math.PI) * 0.95 : -0.15;
        [x, y, z] = rotateYX(Math.cos(a) * burstR, burstY, Math.sin(a) * burstR, rotY, rotX);
        scale = impactAge > 0 ? 0.18 * (1 - impactAge * 0.72) : 0.06;
        color = "#f2ecff";
        rx = t * 3 + j;
        ry = t * 2;
      }
      break;
    }

    /* --------------------------------------------------------------------
       13. CHAINS — 4 Crisp Non-Overlapping Interlocking Chain Links + Gliding Monad Value!
       -------------------------------------------------------------------- */
    case "chains-monad": {
      const rotY = Math.sin(t * 0.3) * 0.26;
      const rotX = 0.26;
      if (idx < 96) {
        // 4 interlocking links x 24 cleanly spaced cubes (zero overlap!)
        const link = Math.floor(idx / 24);
        const k = idx % 24;
        const a = (k / 24) * Math.PI * 2;
        const cx = (link - 1.5) * 0.92;
        const rxLink = 0.64;
        const ryLink = 0.42;
        const lx = Math.cos(a) * rxLink;
        const ly = link % 2 === 0 ? Math.sin(a) * ryLink : 0;
        const lz = link % 2 === 0 ? 0 : Math.sin(a) * ryLink;
        [x, y, z] = rotateYX(cx + lx, ly + Math.sin(t * 1.3 + link) * 0.08, lz, rotY, rotX);
        scale = 0.145;
        color = link % 2 === 0 ? pal.primary : pal.light;
      } else {
        // Smoothly gliding wrapped value cube-cluster (ping-pong forward & undo rewind!)
        const j = idx - 96; // 24 cubes in a crisp orbiting ring around the value
        const pos = Math.sin(t * 0.85) * 1.48;
        const a = (j / 24) * Math.PI * 2 + t * 1.8;
        const r = 0.24;
        [x, y, z] = rotateYX(pos, Math.cos(a) * r, Math.sin(a) * r, rotY, rotX);
        scale = 0.12;
        color = j % 3 === 0 ? "#f2ecff" : pal.deep;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 1: H2 CORPORATION — Clearly Separated Architectural Building + Tall L-Shaped Tower Crane!
       (Building on left x=-0.95, Crane mast completely clear on right x=+1.22,
        Jib high overhead at y=+1.42 hoisting a glass floor module cleanly above the roof!)
       -------------------------------------------------------------------- */
    case "exp-h2-construction": {
      const rotY = -0.34 + Math.sin(t * 0.2) * 0.14;
      const rotX = 0.2;
      if (idx < 60) {
        // Clean modern 4-story hollow glass-frame building on the LEFT (zero crane collision!)
        // 4 stories x 12 perimeter cubes (4x4 square outline = 12 cubes per floor) + 12 roof edge cubes
        const story = Math.floor(idx / 12); // 0..4
        const k = idx % 12;
        const side = Math.floor(k / 3);
        const pos = k % 3; // 0, 1, 2 -> 12 unique perimeter points on a 4x4 grid!
        const gx = side === 0 ? pos - 1.5 : side === 1 ? 1.5 : side === 2 ? 1.5 - pos : -1.5;
        const gz = side === 0 ? -1.5 : side === 1 ? pos - 1.5 : side === 2 ? 1.5 : 1.5 - pos;
        const py = -1.36 + story * 0.34;
        [x, y, z] = rotateYX(-0.92 + gx * 0.31, py, gz * 0.31, rotY, rotX);
        scale = 0.26;
        color =
          story === 0
            ? pal.deep
            : story === 4
              ? pal.light
              : k % 3 === 0
                ? pal.primary
                : "#f2ecff";
      } else if (idx < 102) {
        // Tall unmistakable L-shaped Tower Crane standing completely clear on the RIGHT (x = +1.25)!
        const j = idx - 60; // 42 cubes
        if (j < 20) {
          // Vertical lattice mast (10 stories tall, 2 crisp columns, y = -1.36 .. +1.42)
          const side = j % 2 === 0 ? -0.14 : 0.14;
          const lvl = Math.floor(j / 2); // 0..9
          [x, y, z] = rotateYX(1.25 + side, -1.36 + lvl * 0.31, 0, rotY, rotX);
          scale = 0.21;
          color = lvl % 2 === 0 ? pal.deep : pal.primary;
        } else if (j < 38) {
          // Horizontal Jib Arm extending high OVER the building roof at y = +1.46 (zero collision!)
          const k = j - 20; // 0..17 -> x from +1.85 (counterweight) to -1.55 (over building!)
          const ax = 1.82 - k * 0.21;
          [x, y, z] = rotateYX(ax, 1.46, 0, rotY, rotX);
          scale = 0.175;
          color = k % 3 === 0 ? "#f2ecff" : pal.deep;
        } else {
          // Counterweight concrete block on the far right tail of the crane (4 cubes)
          const k = j - 38;
          const cx = 1.72 + (k % 2) * 0.24;
          const cy = 1.2 + Math.floor(k / 2) * 0.24;
          [x, y, z] = rotateYX(cx, cy, 0, rotY, rotX);
          scale = 0.21;
          color = pal.deep;
        }
      } else {
        // Trolley + Vertical Hoist Cable + Suspended 2x2x2 Glass Roof Module lowering smoothly over the building!
        const j = idx - 102; // 18 cubes
        const trolleyX = -0.92 + Math.sin(t * 0.7) * 0.34; // glides cleanly over building roof
        const drop = Math.sin(t * 1.15) * 0.5 + 0.5; // lowers cleanly between y=0.72 and y=0.32 (above roof y=0.0!)
        if (j < 2) {
          // Trolley carriage riding directly under the crane jib
          [x, y, z] = rotateYX(trolleyX + (j === 0 ? -0.11 : 0.11), 1.24, 0, rotY, rotX);
          scale = 0.16;
          color = pal.primary;
        } else if (j < 10) {
          // Crisp vertical hoist cable segments
          const seg = j - 2; // 0..7
          const cableLen = 0.38 + drop * 0.34;
          const cy = 1.14 - (seg / 7) * cableLen;
          [x, y, z] = rotateYX(trolleyX, cy, 0, rotY, rotX);
          scale = 0.075;
          color = pal.light;
        } else {
          // Suspended 2x2x2 glowing glass roof block being lowered neatly onto the top of the building!
          const k = j - 10; // 0..7
          const mx = k & 1 ? 0.13 : -0.13;
          const my = k & 2 ? 0.13 : -0.13;
          const mz = k & 4 ? 0.13 : -0.13;
          const modY = 0.62 - drop * 0.34;
          [x, y, z] = rotateYX(trolleyX + mx, modY + my, mz, rotY, rotX);
          scale = 0.215;
          color = "#f2ecff";
        }
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 2: PALMETTO — Sculpted 3D Voxel House with Solar-Panel Roof + Radiant Sun!
       -------------------------------------------------------------------- */
    case "exp-palmetto-solar": {
      const rotY = -0.42 + Math.sin(t * 0.28) * 0.2;
      const rotX = 0.22;
      if (idx < 48) {
        // Crisp modern house walls (4-sided perimeter, 3 stories tall, clean non-overlapping grid)
        const tier = Math.floor(idx / 16); // 0, 1, 2
        const k = idx % 16;
        const side = Math.floor(k / 4);
        const pos = k % 4; // 0..3 -> 16 unique perimeter positions around a 5x5 square!
        const gx = side === 0 ? pos - 2 : side === 1 ? 2 : side === 2 ? 2 - pos : -2;
        const gz = side === 0 ? -2 : side === 1 ? pos - 2 : side === 2 ? 2 : 2 - pos;
        [x, y, z] = rotateYX(gx * 0.31 - 0.18, -1.2 + tier * 0.31, gz * 0.31, rotY, rotX);
        scale = 0.27;
        color = tier === 0 ? pal.light : "#f2ecff";
      } else if (idx < 96) {
        // Pitched Rooftop tiled with deep teal-blue Solar Panels (48 cubes: left & right slopes!)
        const j = idx - 48;
        const slope = j < 24 ? -1 : 1; // left slope vs right slope
        const k = j % 24;
        const step = Math.floor(k / 6); // 0 (eave) .. 3 (ridge)
        const depth = (k % 6) - 2.5;
        const px = slope * (0.76 - step * 0.22) - 0.18;
        const py = -0.24 + step * 0.25;
        const pz = depth * 0.29;
        // Subtle solar shimmer sweeping across panels
        const glint = Math.sin(t * 2.2 + step * 0.8 + depth * 0.5) > 0.7;
        [x, y, z] = rotateYX(px, py, pz, rotY, rotX);
        scale = 0.235;
        color = glint ? "#f2ecff" : (step + Math.floor(depth + 3)) % 2 === 0 ? pal.deep : pal.primary;
      } else {
        // Radiant Sun hovering cleanly at upper-right (12 core cubes + 12 pulsing sunbeams)
        const j = idx - 96;
        const sx = 1.25;
        const sy = 1.15;
        if (j < 12) {
          const a = (j / 12) * Math.PI * 2 + t * 0.5;
          const r = 0.28;
          [x, y, z] = rotateYX(sx + Math.cos(a) * r, sy + Math.sin(a) * r, (j % 2 === 0 ? 0.1 : -0.1), rotY, rotX);
          scale = 0.19;
          color = "#f2ecff";
        } else {
          const k = j - 12; // 6 rays x 2 cubes pulsing cleanly outward
          const ray = Math.floor(k / 2);
          const seg = k % 2;
          const a = (ray / 6) * Math.PI * 2 + t * 0.4;
          const pulse = Math.sin(t * 2.4 + ray) * 0.06;
          const r = 0.54 + seg * 0.22 + pulse;
          [x, y, z] = rotateYX(sx + Math.cos(a) * r, sy + Math.sin(a) * r, 0, rotY, rotX);
          scale = 0.14;
          color = pal.light;
        }
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 3: RED VENTURES — Sculpted Cloud Platform + Auto-Scaling Server Towers + Metric Bars!
       -------------------------------------------------------------------- */
    case "exp-redventures-cloud": {
      const rotY = -0.35 + Math.sin(t * 0.24) * 0.18;
      const rotX = 0.22;
      if (idx < 40) {
        // Sculpted Cloud floating at top (clean orthogonal cloud silhouette, zero overlap!)
        const cloudPts: Array<[number, number, number]> = [
          ...Array.from({ length: 14 }, (_, k) => [((k % 7) - 3) * 0.31, 0.92, (Math.floor(k / 7) - 0.5) * 0.31] as [number, number, number]),
          ...Array.from({ length: 16 }, (_, k) => [((k % 8) - 3.5) * 0.31, 1.22, (Math.floor(k / 8) - 0.5) * 0.31] as [number, number, number]),
          ...Array.from({ length: 10 }, (_, k) => [((k % 5) - 2) * 0.31, 1.52, (Math.floor(k / 5) - 0.5) * 0.31] as [number, number, number]),
        ];
        const p = cloudPts[idx];
        [x, y, z] = rotateYX(p[0], p[1] + Math.sin(t * 0.9) * 0.05, p[2], rotY, rotX);
        scale = 0.265;
        color = idx % 3 === 0 ? "#f2ecff" : pal.light;
      } else if (idx < 88) {
        // 3 neat Server Rack towers on the left/center (16 cubes each = 2x2x4, cleanly separated!)
        const j = idx - 40;
        const rack = Math.floor(j / 16); // 0, 1, 2
        const k = j % 16;
        const rxBase = -1.15 + rack * 0.85;
        const cx = k % 2 === 0 ? -0.14 : 0.14;
        const cz = Math.floor(k / 2) % 2 === 0 ? -0.14 : 0.14;
        const level = Math.floor(k / 4); // 0..3
        const pulse = Math.sin(t * 1.8 + rack * 1.2 - level * 0.5) > 0.6;
        [x, y, z] = rotateYX(rxBase + cx, -1.25 + level * 0.32, cz, rotY, rotX);
        scale = 0.245;
        color = pulse ? "#f2ecff" : level === 0 ? pal.deep : pal.primary;
      } else {
        // 4 rising stepped Grafana Metric Bar columns on the right (8 cubes each = 32 cubes)
        const j = idx - 88;
        const bar = Math.floor(j / 8); // 0..3
        const lvl = j % 8;
        const bx = 0.92 + bar * 0.32;
        const maxH = 2.5 + bar * 1.2 + Math.sin(t * 1.9 + bar) * 1.2;
        const lit = lvl <= maxH;
        [x, y, z] = rotateYX(bx, -1.25 + lvl * 0.28, 0, rotY, rotX);
        scale = lit ? 0.23 : 0.09;
        color = !lit ? pal.light : lvl >= 5 ? "#f2ecff" : pal.deep;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 4: GOOGLE L4 — Distributed Dataflow DAG Pipeline (Smooth Pulse Wave, Zero Flyback!)
       -------------------------------------------------------------------- */
    case "exp-google-pipeline": {
      const rotY = -0.18 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.2;
      const waveX = -1.8 + ((t * 0.72) % 1) * 3.6;
      if (idx < 60) {
        const stages: Array<[number, number, number]> = [
          [-1.58, 0.96, 0],
          [-1.58, 0, 0],
          [-1.58, -0.96, 0],
          [0, 0, 0],
          [1.58, 0, 0],
        ];
        const st = Math.floor(idx / 12);
        const k = idx % 12;
        const [sx, sy, sz] = stages[st];
        const gx = k % 2 === 0 ? -0.14 : 0.14;
        const gy = (Math.floor(k / 2) % 3 - 1) * 0.26;
        const gz = k >= 6 ? 0.14 : -0.14;
        const lit = Math.abs(sx - waveX) < 0.42;
        [x, y, z] = rotateYX(sx + gx, sy + gy, sz + gz, rotY, rotX);
        scale = lit ? 0.24 : 0.22;
        color = lit ? "#f2ecff" : st === 3 ? pal.deep : st === 4 ? pal.light : pal.primary;
      } else {
        // 60 FIXED cleanly-spaced pipe segments along the 3 lanes (20 per lane, ZERO flyback!)
        const j = idx - 60;
        const lane = Math.floor(j / 20); // 0, 1, 2
        const slot = j % 20; // 0..19
        const p = (slot + 1) / 21;
        const startY = (1 - lane) * 0.96;
        const px = -1.42 + p * 2.84;
        const py = p < 0.5 ? startY * (1 - p * 2) : (1 - lane) * 0.24 * Math.sin((p - 0.5) * Math.PI);
        const pz = (lane - 1) * 0.22;
        const lit = Math.abs(px - waveX) < 0.34;
        [x, y, z] = rotateYX(px, py, pz, rotY, rotX);
        scale = lit ? 0.2 : 0.145;
        color = lit ? "#f2ecff" : pal.primary;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 5: CORNELL DTI DEVELOPER LEAD & LEADERSHIP — Multi-Team Hub & Bridge Arch!
       -------------------------------------------------------------------- */
    case "exp-dti-constellation":
    case "about-leadership": {
      const rotY = -0.3 + t * 0.22;
      const rotX = 0.3;
      if (idx < 27) {
        // Central elevated Leadership Prism (3x3x3 tight core)
        const [gx, gy, gz] = CORE_3_POINTS[idx];
        [x, y, z] = rotateYX(gx * 0.27, 0.35 + gy * 0.27, gz * 0.27, rotY, rotX);
        scale = 0.23;
        color = gy === 1 ? "#f2ecff" : pal.deep;
      } else if (idx < 75) {
        // 4 clean arched bridges radiating outward to 4 product teams (12 cubes per bridge)
        const j = idx - 27;
        const arm = Math.floor(j / 12); // 0..3
        const step = j % 12; // 0..11
        const s = (step + 1) / 13;
        const a = (arm / 4) * Math.PI * 2 + Math.PI / 4;
        const r = 0.48 + s * 1.18;
        const archY = 0.35 - s * 0.85 + Math.sin(s * Math.PI) * 0.42;
        const pulse = Math.sin(t * 2.4 - s * 5 + arm) > 0.6;
        [x, y, z] = rotateYX(Math.cos(a) * r, archY, Math.sin(a) * r, rotY, rotX);
        scale = pulse ? 0.19 : 0.15;
        color = pulse ? "#f2ecff" : pal.light;
      } else {
        // 4 distinct Product Team pedestals (11-12 cubes each: clean 2x2x3 mini-buildings!)
        const j = idx - 75;
        const team = Math.floor(j / 11) % 4;
        const k = j % 11;
        const a = (team / 4) * Math.PI * 2 + Math.PI / 4;
        const tx = Math.cos(a) * 1.72;
        const tz = Math.sin(a) * 1.72;
        const bx = k % 2 === 0 ? -0.14 : 0.14;
        const bz = Math.floor(k / 2) % 2 === 0 ? -0.14 : 0.14;
        const by = Math.floor(k / 4) * 0.28 - 0.85 + Math.sin(t * 1.5 + team * 1.4) * 0.08;
        [x, y, z] = rotateYX(tx + bx, by, tz + bz, rotY, rotX);
        scale = 0.23;
        color = Math.floor(k / 4) === 2 ? pal.light : pal.primary;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 6: GOOGLE INTERN — Drag-and-Drop Multi-User Roster Calendar Scheduler!
       -------------------------------------------------------------------- */
    case "exp-google-dance": {
      const rotY = -0.32 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.32;
      if (idx < 72) {
        // Clean 6-day x 4-slot Wall Calendar Grid (back frame + day header bar, zero overlap!)
        const col = (idx % 6) - 2.5;
        const row = Math.floor(idx / 6) % 4 - 1.5;
        const layer = Math.floor(idx / 24); // 0, 1, 2
        if (layer === 0) {
          [x, y, z] = rotateYX(col * 0.48, row * 0.48, -0.18, rotY, rotX);
          scale = 0.34;
          color = row === 1.5 ? pal.deep : "#f2ecff";
        } else if (layer === 1) {
          // Crisp grid cells slightly forward
          [x, y, z] = rotateYX(col * 0.48, row * 0.48, 0.14, rotY, rotX);
          scale = 0.2;
          color = pal.light;
        } else {
          // Top calendar binding rings along top edge
          const ringX = (idx - 48 - 11.5) * 0.24;
          [x, y, z] = rotateYX(ringX, 1.15, 0.05, rotY, rotX);
          scale = 0.16;
          color = pal.deep;
        }
      } else {
        // 4 floating colorful Schedule Event Blocks smoothly sliding/dragging across calendar slots!
        const j = idx - 72; // 48 cubes = 4 event bars x 12 cubes (4 wide x 3? -> 6 wide x 2 tall!)
        const ev = Math.floor(j / 12); // 0..3
        const k = j % 12;
        const bx = (k % 4 - 1.5) * 0.24;
        const by = (Math.floor(k / 4) - 1) * 0.22;
        // Smooth drag-and-drop slide back and forth across columns & lift forward while dragging!
        const slidePhase = Math.sin(t * 0.95 + ev * 1.55);
        const dragLift = Math.max(0, Math.cos(t * 0.95 + ev * 1.55)) * 0.24;
        const ex = slidePhase * 0.85;
        const ey = (1.5 - ev) * 0.56 - 0.15;
        [x, y, z] = rotateYX(ex + bx, ey + by, 0.48 + dragLift, rotY, rotX);
        scale = 0.2;
        color = ev % 2 === 0 ? pal.primary : pal.deep;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 7: CORNELL DTI TPM — Cue Campus Events Smartphone + Event Cards + Map Pin!
       -------------------------------------------------------------------- */
    case "exp-dti-events": {
      const rotY = -0.25 + Math.sin(t * 0.34) * 0.24;
      const rotX = 0.16;
      if (idx < PHONE_EVENT_VOXELS.length) {
        const v = PHONE_EVENT_VOXELS[idx];
        const pinBob = v.part === "pin" ? Math.sin(t * 2.4) * 0.12 : 0;
        const cardPop =
          v.part === "card"
            ? Math.sin(t * 1.8 - v.cardIdx * 1.1) * 0.08
            : 0;
        [x, y, z] = rotateYX(v.x, v.y + pinBob, v.z + cardPop, rotY, rotX);
        scale = v.part === "pin" ? 0.18 : v.part === "card" ? 0.21 : 0.23;
        color =
          v.part === "pin"
            ? pal.deep
            : v.part === "frame"
              ? pal.primary
              : v.cardIdx === 0
                ? "#f2ecff"
                : pal.light;
      } else {
        // Subtle radar discovery pulse ring behind the phone (44 cleanly spaced cubes)
        const j = idx - PHONE_EVENT_VOXELS.length;
        const rem = count - PHONE_EVENT_VOXELS.length;
        const a = (j / Math.max(1, rem)) * Math.PI * 2 + t * 0.35;
        const r = 1.72 + Math.sin(t * 1.8) * 0.1;
        [x, y, z] = rotateYX(Math.cos(a) * r, Math.sin(a) * r * 0.85, -0.45, rotY, rotX);
        scale = 0.14;
        color = j % 2 === 0 ? "#f2ecff" : pal.light;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 8: CORNELL DTI FULL STACK & ABOUT RANGE — Iconic 3-Tier Totem
       (Tilted Browser UI Top -> Bidirectional API Arrows Middle -> Cylindrical DB Drum Bottom!)
       -------------------------------------------------------------------- */
    case "exp-dti-fullstack":
    case "about-range": {
      const rotY = -0.26 + Math.sin(t * 0.3) * 0.22;
      const rotX = 0.22;
      if (idx < 48) {
        // Bottom: Cylindrical Database Drum (3 circular rings x 16 cleanly spaced cubes!)
        const ring = Math.floor(idx / 16); // 0, 1, 2
        const a = ((idx % 16) / 16) * Math.PI * 2 + t * 0.25;
        const r = 0.84;
        [x, y, z] = rotateYX(Math.cos(a) * r, -1.32 + ring * 0.32, Math.sin(a) * r, rotY, rotX);
        scale = 0.22;
        color = ring === 1 ? "#f2ecff" : pal.deep;
      } else if (idx < 72) {
        // Middle: Bidirectional Request (Up) & Response (Down) Arrows (24 cubes, smooth sin pulse!)
        const j = idx - 48;
        const isUp = j < 12;
        const k = isUp ? j : j - 12;
        const ax = isUp ? -0.45 : 0.45;
        const bob = Math.sin(t * 2.4 + (isUp ? 0 : Math.PI)) * 0.14;
        // 8 vertical shaft cubes + 4 arrowhead cubes
        let px = ax, py = 0;
        if (k < 8) {
          py = -0.42 + k * 0.14 + bob;
        } else {
          const tipY = isUp ? 0.56 + bob : -0.42 + bob;
          const dir = isUp ? -1 : 1;
          const wing = k - 8;
          px = ax + (wing % 2 === 0 ? -0.18 : 0.18) * (wing < 2 ? 1 : 1.7);
          py = tipY + dir * (wing < 2 ? 0.16 : 0.3);
        }
        [x, y, z] = rotateYX(px, py, 0, rotY, rotX);
        scale = 0.145;
        color = isUp ? "#f2ecff" : pal.primary;
      } else {
        // Top: Crisp Browser / Client Window Frame (8 wide x 6 tall = 48 cubes!)
        const j = idx - 72;
        const col = (j % 8) - 3.5;
        const row = Math.floor(j / 8) - 2.5;
        const isChrome = row === 2.5;
        const isBorder = Math.abs(col) === 3.5 || row === -2.5;
        [x, y, z] = rotateYX(col * 0.25, 1.15 + row * 0.22, 0, rotY, rotX);
        scale = isChrome ? 0.21 : isBorder ? 0.19 : 0.15;
        color = isChrome ? pal.deep : isBorder ? pal.primary : "#f2ecff";
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 9: LOWE'S — Iconic 3D Voxel Price Tag (`$`) for Central Price Master!
       -------------------------------------------------------------------- */
    case "exp-lowes-retail": {
      const rotY = Math.sin(t * 0.42) * 0.38;
      const rotX = 0.16;
      const scanY = Math.sin(t * 1.5) * 1.35;
      if (idx < PRICE_TAG_VOXELS.length) {
        const v = PRICE_TAG_VOXELS[idx];
        const lit = Math.abs(v.y - scanY) < 0.24;
        [x, y, z] = rotateYX(v.x, v.y, v.z + (lit ? 0.08 : 0), rotY, rotX);
        scale = v.kind === "dollar" ? 0.24 : 0.23;
        color =
          v.kind === "dollar"
            ? pal.deep
            : lit
              ? "#f2ecff"
              : v.kind === "border"
                ? pal.primary
                : pal.light;
      } else {
        // Hanging string loop above the tag eyelet (30 cleanly spaced cubes)
        const j = idx - PRICE_TAG_VOXELS.length;
        const rem = count - PRICE_TAG_VOXELS.length;
        const a = (j / Math.max(1, rem)) * Math.PI * 2;
        const sx = Math.cos(a) * 0.34;
        const sy = 1.62 + Math.sin(a) * 0.42;
        [x, y, z] = rotateYX(sx, sy, 0, rotY, rotX);
        scale = 0.11;
        color = pal.primary;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 10: INCITE ANALYTICS — Beating Crystal Heart + Clean Non-Overlapping ECG Pulse!
       -------------------------------------------------------------------- */
    case "exp-incite-heartbeat": {
      const rotY = Math.sin(t * 0.28) * 0.2;
      const rotX = 0.14;
      if (idx < 36) {
        // 36 cleanly spaced horizontal ECG cubes (spacing 0.115 across 4.0 -> zero overlap!)
        const s = idx / 35;
        const px = (s - 0.5) * 3.9;
        const waveCenter = (t * 0.48) % 1;
        let d = s - waveCenter;
        if (d > 0.5) d -= 1;
        if (d < -0.5) d += 1;
        let py = -1.02;
        if (Math.abs(d) < 0.055) py += Math.cos((d / 0.055) * Math.PI * 0.5) * 0.86;
        else if (Math.abs(d + 0.08) < 0.035) py -= 0.24;
        else if (Math.abs(d - 0.08) < 0.035) py -= 0.28;
        else if (Math.abs(d - 0.17) < 0.06) py += 0.22;
        [x, y, z] = rotateYX(px, py, 0, rotY, rotX);
        scale = Math.abs(d) < 0.07 ? 0.18 : 0.11;
        color = Math.abs(d) < 0.07 ? "#f2ecff" : pal.primary;
      } else {
        // Clean double-layered beating crystal heart hovering above ECG (2 rings of 42 cubes = 84)
        const j = idx - 36;
        const layer = j < 42 ? 0 : 1;
        const k = j % 42;
        const a = (k / 42) * Math.PI * 2;
        const beat = 1 + Math.pow(Math.max(0, Math.sin(t * 3.0)), 6) * 0.16;
        const rScale = (layer === 0 ? 0.058 : 0.044) * beat;
        const hx = 16 * Math.pow(Math.sin(a), 3) * rScale;
        const hy = (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * rScale;
        const hz = layer === 0 ? 0 : 0.22;
        [x, y, z] = rotateYX(hx, 0.55 + hy, hz, rotY, rotX);
        scale = layer === 0 ? 0.17 : 0.14;
        color = layer === 1 ? pal.light : k % 3 === 0 ? "#f2ecff" : pal.deep;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       EXP 11: VELOCITOR — City Road Grid + Smoothly Driving GPS Trucks + Satellite!
       -------------------------------------------------------------------- */
    case "exp-velocitor-fleet": {
      const rotY = -0.42 + Math.sin(t * 0.24) * 0.18;
      const rotX = 0.54;
      if (idx < 72) {
        const isRow = idx < 36;
        const k = isRow ? idx : idx - 36;
        const street = Math.floor(k / 9) - 1.5;
        const pos = (k % 9) - 4;
        const px = isRow ? pos * 0.38 : street * 1.0;
        const pz = isRow ? street * 1.0 : pos * 0.38;
        [x, y, z] = rotateYX(px, -0.72, pz, rotY, rotX);
        scale = 0.2;
        color = pal.light;
      } else if (idx < 96) {
        // 4 fleet trucks driving smoothly back-and-forth along roads (sin wave -> ZERO teleport!)
        const j = idx - 72;
        const veh = Math.floor(j / 6);
        const sub = j % 6;
        const street = (veh - 1.5) * 1.0;
        const travel = Math.sin(t * (0.75 + veh * 0.12) + veh * 1.4) * 1.25;
        const vx = veh % 2 === 0 ? travel : street;
        const vz = veh % 2 === 0 ? street : travel;
        [x, y, z] = rotateYX(vx + (sub % 3 - 1) * 0.16, -0.36 + (sub >= 3 ? 0.17 : 0), vz, rotY, rotX);
        scale = 0.15;
        color = pal.deep;
      } else {
        // Orbiting GPS satellite cleanly above the city
        const j = idx - 96;
        const sa = t * 0.65;
        const sx = Math.cos(sa) * 0.78;
        const sz = Math.sin(sa) * 0.78;
        const wing = j - 12;
        [x, y, z] = rotateYX(sx + wing * 0.13, 1.18, sz, rotY, rotX);
        scale = Math.abs(wing) < 3 ? 0.2 : 0.115;
        color = Math.abs(wing) < 3 ? "#f2ecff" : pal.primary;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       ABOUT MONOGRAM — Sculpted 3D "J" Framed Cleanly Inside a Wide Orbital Halo!
       -------------------------------------------------------------------- */
    case "about-monogram": {
      const rotY = Math.sin(t * 0.42) * 0.34;
      const rotX = 0.14;
      if (idx < MONOGRAM_J_VOXELS.length) {
        const [mx, my, mz] = MONOGRAM_J_VOXELS[idx];
        [x, y, z] = rotateYX(mx, my, mz, rotY, rotX);
        scale = 0.275;
        color = mz > 0 ? pal.primary : pal.deep;
      } else {
        // Wide non-overlapping halo ring cleanly OUTSIDE the "J" (zero clipping!)
        const j = idx - MONOGRAM_J_VOXELS.length;
        const rem = count - MONOGRAM_J_VOXELS.length;
        const a = (j / Math.max(1, rem)) * Math.PI * 2 + t * 0.4;
        [x, y, z] = rotateYX(Math.cos(a) * 1.88, Math.sin(a) * 1.66, -0.25, rotY * 0.4, 0.18);
        scale = 0.135;
        color = j % 2 === 0 ? "#f2ecff" : pal.light;
      }
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       ABOUT SYSTEMS — Terraced Infrastructure Pillars + Smooth Sweeping Telemetry Beam
       -------------------------------------------------------------------- */
    case "about-systems": {
      const rotY = -0.45 + Math.sin(t * 0.25) * 0.2;
      const rotX = 0.3;
      const col = (idx % 5) - 2;
      const row = Math.floor(idx / 5) % 6 - 2.5;
      const depth = Math.floor(idx / 30) - 1.5;
      const scanX = Math.sin(t * 1.2) * 1.3;
      const lit = Math.abs(col * 0.52 - scanX) < 0.32;
      [x, y, z] = rotateYX(col * 0.52, row * 0.44, depth * 0.52, rotY, rotX);
      scale = lit ? 0.28 : 0.22;
      color = lit ? "#f2ecff" : depth > 0 ? pal.primary : pal.deep;
      rx = rotX;
      ry = rotY;
      break;
    }

    /* --------------------------------------------------------------------
       ABOUT CONTACT — Iconic 3D Floating Voxel Envelope (`✉`)!
       -------------------------------------------------------------------- */
    case "about-beacon":
    default: {
      const rotY = Math.sin(t * 0.38) * 0.32;
      const rotX = 0.16 + Math.sin(t * 0.5) * 0.06;
      if (idx < ENVELOPE_VOXELS.length) {
        const v = ENVELOPE_VOXELS[idx];
        const flapLift = v.part === "flap" || v.part === "seal" ? Math.sin(t * 1.6) * 0.06 : 0;
        [x, y, z] = rotateYX(v.x, v.y + flapLift, v.z + flapLift, rotY, rotX);
        scale = v.part === "seal" ? 0.22 : 0.235;
        color = v.part === "seal" ? pal.deep : v.part === "flap" ? pal.primary : "#f2ecff";
      } else {
        // Gentle orbiting send-sparkles around the envelope (cleanly spaced outside!)
        const j = idx - ENVELOPE_VOXELS.length;
        const rem = count - ENVELOPE_VOXELS.length;
        const a = (j / Math.max(1, rem)) * Math.PI * 2 + t * 0.55;
        [x, y, z] = rotateYX(Math.cos(a) * 1.98, Math.sin(a) * 1.38, -0.35, rotY * 0.5, 0.2);
        scale = 0.14;
        color = pal.light;
      }
      rx = rotX;
      ry = rotY;
      break;
    }
  }

  const floatY = Math.sin(t * 0.8 + u * 2) * 0.035;

  return {
    x: centerX + x,
    y: centerY + y + floatY,
    z: z + 0.55,
    rx,
    ry,
    rz,
    scale,
    color,
  };
}

/**
 * Compute all 120 cube targets for the current state (Overview clusters OR Hero monument).
 */
export function computeAllCubeTargets(
  items: SpatialItem[],
  section: SectionId,
  selected: SpatialItem | null,
  hoveredSlug: string | null,
  t: number,
  heroCenterX: number,
): CubeTarget[] {
  const targets: CubeTarget[] = new Array(CUBE_COUNT);

  if (selected) {
    for (let i = 0; i < CUBE_COUNT; i++) {
      targets[i] = computeHeroFormation(
        selected,
        i,
        CUBE_COUNT,
        t,
        heroCenterX,
        -0.1,
      );
    }
    return targets;
  }

  if (items.length === 0) {
    for (let i = 0; i < CUBE_COUNT; i++) {
      const a = (i / CUBE_COUNT) * Math.PI * 2 + t * 0.25;
      const r = 2.2;
      targets[i] = {
        x: 0.9 + Math.cos(a) * r,
        y: Math.sin(a) * r * 0.6,
        z: 0,
        rx: a,
        ry: t * 0.5,
        rz: 0,
        scale: 0.18,
        color: i % 2 === 0 ? "#9678dc" : "#dcd0fc",
      };
    }
    return targets;
  }

  const itemCount = items.length;
  const basePerItem = Math.floor(CUBE_COUNT / itemCount);
  const remainder = CUBE_COUNT % itemCount;

  let cursor = 0;
  for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
    const item = items[itemIdx];
    const sliceSize = basePerItem + (itemIdx < remainder ? 1 : 0);
    const [ax, ay, az] = getOverviewAnchor(section, itemIdx, itemCount);
    const isHovered = hoveredSlug === item.slug;
    const hoverLift = isHovered ? 0.16 : 0;

    for (let localIdx = 0; localIdx < sliceSize; localIdx++) {
      const m = computeMiniFormation(
        item.formation,
        Boolean(item.isLibraryVolume),
        localIdx,
        sliceSize,
        t + itemIdx * 0.35,
        isHovered,
        item.palette,
      );
      targets[cursor++] = {
        x: ax + m.dx,
        y: ay + m.dy + hoverLift,
        z: az + m.dz + (isHovered ? 0.45 : 0),
        rx: m.rx,
        ry: m.ry,
        rz: m.rz,
        scale: m.scale,
        color: isHovered && localIdx % 3 === 0 ? "#f2ecff" : m.color,
      };
    }
  }

  return targets;
}
