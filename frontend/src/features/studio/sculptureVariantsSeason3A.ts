import type { CubeTarget } from "./CubeFormations";
import { rotateYX, type VariantEvaluator } from "./sculptureVariantsPartB";

function makeTarget(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
  scale: number,
  color: string,
): CubeTarget {
  return { x, y, z, rx, ry, rz, scale, color };
}

// High-contrast jewel palette for light lavender (#f5f0ff) studio backdrop
const INDIGO = "#2b2452";
const NAVY = "#344b8c";
const COBALT = "#2d6ae0";
const MAGENTA = "#e03c8a";
const ROSE = "#c9437d";
const GOLD = "#f5b83d";
const EMERALD = "#22bf90";
const SLATE = "#362952";
const STEEL = "#64749c";
const SILVER = "#8c9bb8";
const WHITE = "#ffffff";

// Incite Analytics crimson heart + ECG palette
const CRIMSON_DEEP = "#9e1f48";
const CRIMSON_MID = "#d43764";
const CRIMSON_LIGHT = "#e34f7a";
const CRIMSON_GLINT = "#ffadc4";
const CRIMSON_PULSE = "#ff6b96";

// About Jagger exact favicon.svg purple crystal gradient palette
const BRAND_LIGHT = "#a888eb";
const BRAND_MID = "#805ad4";
const BRAND_DARK = "#5d39ad";
const BRAND_SHEEN = "#cbb5f7";
const BRAND_DOT = "#efe6ff";

// ============================================================================
// SHARED MATH & PRECOMPUTED NON-OVERLAPPING VOXEL TABLES (SEASON 3A — 13)
// ============================================================================

/** Smooth periodic PQRST heartbeat waveform on u in [0, 1) — zero wraparound jump! */
function evalPqrst(u: number): number {
  const p = 0.22 * Math.exp(-Math.pow((u - 0.22) / 0.045, 2));
  const q = -0.24 * Math.exp(-Math.pow((u - 0.36) / 0.022, 2));
  const r = 0.96 * Math.exp(-Math.pow((u - 0.42) / 0.024, 2));
  const s = -0.38 * Math.exp(-Math.pow((u - 0.48) / 0.022, 2));
  const tw = 0.32 * Math.exp(-Math.pow((u - 0.66) / 0.055, 2));
  return p + q + r + s + tw;
}

/** Authentic double-pulse Lub-Dub beat envelope (seamless at cycle wrap) */
function evalLubDub(t: number, rate = 0.9): { lub: number; dub: number; beat: number } {
  const c = ((t * rate) % 1 + 1) % 1;
  const lub = Math.exp(-Math.pow((c - 0.14) / 0.045, 2)) * 0.12;
  const dub = Math.exp(-Math.pow((c - 0.29) / 0.04, 2)) * 0.075;
  return { lub, dub, beat: 1 + lub + dub };
}

/** Exact favicon.svg diagonal purple gradient (#a888eb upper-left -> #805ad4 mid -> #5d39ad lower-right) */
function brandPurpleGrad(nx: number, ny: number, allowSheen = false): string {
  if (allowSheen && ny > 0.56 && nx < 0.45 && nx > -0.78) return BRAND_SHEEN;
  const g = nx * 0.7 - ny * 0.8;
  if (g < -0.22) return BRAND_LIGHT;
  if (g < 0.32) return BRAND_MID;
  return BRAND_DARK;
}

// Crisp 5x7 Bold Golden `$` Glyph (17 non-overlapping integer cells)
const DOLLAR_XL_17: Array<[number, number]> = [
  [0, 6],
  [-1, 5], [0, 5], [1, 5], [2, 5],
  [-2, 4], [0, 4],
  [-1, 3], [0, 3], [1, 3],
  [0, 2], [2, 2],
  [-2, 1], [-1, 1], [0, 1], [1, 1],
  [0, 0],
];

// Compact 5x7 `$` Flag Glyph for Cash Register (15 non-overlapping cells)
const DOLLAR_FLAG_15: Array<[number, number]> = [
  [0, 6],
  [-1, 5], [0, 5], [1, 5],
  [-1, 4], [0, 4],
  [-1, 3], [0, 3], [1, 3],
  [0, 2], [1, 2],
  [-1, 1], [0, 1], [1, 1],
  [0, 0],
];

// Solid Beveled 3D Crimson Heart (66 non-overlapping cubes — exact Contender A geometry!)
const SOLID_HEART_66: Array<{ x: number; y: number; z: number; layer: number }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; layer: number }> = [];
  const p = 0.245;
  const centerArt = [
    "0110110",
    "1111111",
    "1111111",
    "0111110",
    "0011100",
    "0001000",
  ];
  for (let r = 0; r < centerArt.length; r++) {
    for (let c = 0; c < 7; c++) {
      if (centerArt[r][c] === "1") {
        pts.push({ x: (c - 3) * p, y: (2.5 - r) * p, z: 0, layer: 0 });
      }
    }
  }
  const midArt = [
    "0000000",
    "0110110",
    "0111110",
    "0011100",
    "0001000",
    "0000000",
  ];
  for (let r = 0; r < midArt.length; r++) {
    for (let c = 0; c < 7; c++) {
      if (midArt[r][c] === "1") {
        pts.push({ x: (c - 3) * p, y: (2.5 - r) * p, z: 0.24, layer: 1 });
        pts.push({ x: (c - 3) * p, y: (2.5 - r) * p, z: -0.24, layer: -1 });
      }
    }
  }
  const crownFront: Array<[number, number]> = [
    [-1.5, 1.2], [-0.8, 1.4], [1.2, 1.2], [-0.5, 0.4], [0.5, 0.4], [0, -0.4],
  ];
  crownFront.forEach(([cx, cy]) =>
    pts.push({ x: cx * p, y: cy * p, z: 0.45, layer: 2 }),
  );
  const crownBack: Array<[number, number]> = [
    [-1.2, 1.2], [1.2, 1.2], [-0.5, 0.4], [0.5, 0.4], [0, -0.4],
  ];
  crownBack.forEach(([cx, cy]) =>
    pts.push({ x: cx * p, y: cy * p, z: -0.45, layer: -2 }),
  );
  return pts; // 66
})();

// Compact 14-cube Crimson Heart for Smartwatch Screen (non-overlapping on pitch 0.165)
const WATCH_HEART_14: Array<{ x: number; y: number; glint?: boolean }> = [
  { x: -1.5, y: 1.5, glint: true }, { x: -0.5, y: 1.5 }, { x: 0.5, y: 1.5 }, { x: 1.5, y: 1.5 },
  { x: -2, y: 0.5, glint: true }, { x: -1, y: 0.5 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, { x: 2, y: 0.5 },
  { x: -1, y: -0.5 }, { x: 0, y: -0.5 }, { x: 1, y: -0.5 },
  { x: -0.5, y: -1.5 }, { x: 0.5, y: -1.5 },
];

// Shield Emblem Rim (32 cubes) + Dark-Navy Shield Interior (44 cubes) + Plump 26-cube Heart
const SHIELD_RIM_32: Array<{ x: number; y: number; z: number }> = [
  // Top arched crown edge (9)
  { x: -4, y: 4, z: 0 }, { x: -3, y: 4.1, z: 0 }, { x: -2, y: 4.2, z: 0 }, { x: -1, y: 4.3, z: 0 },
  { x: 0, y: 4.35, z: 0 },
  { x: 1, y: 4.3, z: 0 }, { x: 2, y: 4.2, z: 0 }, { x: 3, y: 4.1, z: 0 }, { x: 4, y: 4, z: 0 },
  // Upper vertical flanks (8)
  { x: -4, y: 3, z: 0 }, { x: 4, y: 3, z: 0 },
  { x: -4, y: 2, z: 0 }, { x: 4, y: 2, z: 0 },
  { x: -4, y: 1, z: 0 }, { x: 4, y: 1, z: 0 },
  { x: -4, y: 0, z: 0 }, { x: 4, y: 0, z: 0 },
  // Tapering heater shield curve (11)
  { x: -3.5, y: -1, z: 0 }, { x: 3.5, y: -1, z: 0 },
  { x: -3, y: -2, z: 0 }, { x: 3, y: -2, z: 0 },
  { x: -2.2, y: -3, z: 0 }, { x: 2.2, y: -3, z: 0 },
  { x: -1.4, y: -4, z: 0 }, { x: 1.4, y: -4, z: 0 },
  { x: -0.7, y: -5, z: 0 }, { x: 0.7, y: -5, z: 0 },
  { x: 0, y: -5.85, z: 0 },
  // 4 raised golden corner & crown studs (z = +0.9)
  { x: -4, y: 4, z: 0.9 }, { x: 4, y: 4, z: 0.9 },
  { x: 0, y: 4.35, z: 0.9 }, { x: 0, y: -5.85, z: 0.9 },
];

const SHIELD_FACE_44: Array<{ x: number; y: number; outer: boolean }> = (() => {
  const pts: Array<{ x: number; y: number; outer: boolean }> = [];
  for (const y of [3, 2, 1, 0]) {
    for (let x = -3; x <= 3; x++) {
      pts.push({ x, y, outer: Math.abs(x) === 3 || y === 3 });
    }
  }
  for (const x of [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]) {
    pts.push({ x, y: -1, outer: Math.abs(x) === 2.5 });
  }
  for (let x = -2; x <= 2; x++) {
    pts.push({ x, y: -2, outer: Math.abs(x) === 2 });
  }
  for (let x = -1; x <= 1; x++) {
    pts.push({ x, y: -3, outer: Math.abs(x) === 1 });
  }
  pts.push({ x: -0.5, y: -4, outer: true }, { x: 0.5, y: -4, outer: true });
  return pts; // 28 + 6 + 5 + 3 + 2 = 44
})();

const SHIELD_HEART_26: Array<{ x: number; y: number; z: number; layer: number }> = [
  // Base sculpted heart layer (18 cubes on 0.205 grid)
  { x: -1.5, y: 1.5, z: 0, layer: 1 }, { x: -0.5, y: 1.5, z: 0, layer: 1 },
  { x: 0.5, y: 1.5, z: 0, layer: 1 }, { x: 1.5, y: 1.5, z: 0, layer: 1 },
  { x: -2, y: 0.5, z: 0, layer: 0 }, { x: -1, y: 0.5, z: 0, layer: 1 },
  { x: 0, y: 0.5, z: 0, layer: 1 }, { x: 1, y: 0.5, z: 0, layer: 1 }, { x: 2, y: 0.5, z: 0, layer: 0 },
  { x: -1.5, y: -0.5, z: 0, layer: 0 }, { x: -0.5, y: -0.5, z: 0, layer: 1 },
  { x: 0.5, y: -0.5, z: 0, layer: 1 }, { x: 1.5, y: -0.5, z: 0, layer: 0 },
  { x: -1, y: -1.5, z: 0, layer: 0 }, { x: 0, y: -1.5, z: 0, layer: 1 }, { x: 1, y: -1.5, z: 0, layer: 0 },
  { x: -0.5, y: -2.4, z: 0, layer: 0 }, { x: 0.5, y: -2.4, z: 0, layer: 0 },
  // Raised plump glossy relief cap (8 cubes at z = +0.95)
  { x: -1.1, y: 1.1, z: 0.95, layer: 2 }, { x: 1.1, y: 1.1, z: 0.95, layer: 2 },
  { x: -1.0, y: 0.1, z: 0.95, layer: 2 }, { x: 0, y: 0.1, z: 0.95, layer: 2 }, { x: 1.0, y: 0.1, z: 0.95, layer: 2 },
  { x: -0.5, y: -0.9, z: 0.95, layer: 2 }, { x: 0.5, y: -0.9, z: 0.95, layer: 2 },
  { x: 0, y: -1.8, z: 0.95, layer: 2 },
];

// Exact 23-cube Proud Geometric Lowercase `j.` matching /public/favicon.svg
// Pure #ffffff `j` (19) + raised middle-zone #efe6ff period `.` (4), strict 0.18 grid!
const BRAND_J_DOT_23: Array<{ x: number; y: number; isDot: boolean }> = [
  // Tittle (4 cubes — 2x2 crisp round-square dot)
  { x: -0.21, y: 0.53, isDot: false }, { x: -0.03, y: 0.53, isDot: false },
  { x: -0.21, y: 0.71, isDot: false }, { x: -0.03, y: 0.71, isDot: false },
  // Vertical stem (10 cubes — chunky 2-wide geometric stroke)
  { x: -0.21, y: 0.28, isDot: false }, { x: -0.03, y: 0.28, isDot: false },
  { x: -0.21, y: 0.10, isDot: false }, { x: -0.03, y: 0.10, isDot: false },
  { x: -0.21, y: -0.08, isDot: false }, { x: -0.03, y: -0.08, isDot: false },
  { x: -0.21, y: -0.26, isDot: false }, { x: -0.03, y: -0.26, isDot: false },
  { x: -0.21, y: -0.44, isDot: false }, { x: -0.03, y: -0.44, isDot: false },
  // Curved geometric descender hook (5 cubes)
  { x: -0.39, y: -0.44, isDot: false }, { x: -0.57, y: -0.44, isDot: false },
  { x: -0.21, y: -0.62, isDot: false }, { x: -0.39, y: -0.62, isDot: false }, { x: -0.57, y: -0.62, isDot: false },
  // Raised middle-zone period `.` (4 cubes — right at the typographic middle of the `j`)
  { x: 0.36, y: -0.26, isDot: true }, { x: 0.54, y: -0.26, isDot: true },
  { x: 0.36, y: -0.08, isDot: true }, { x: 0.54, y: -0.08, isDot: true },
];

// Faceted 5x5x5 Purple Crystal Shell (97 cubes — omits 1 invisible bottom-center cube)
const CRYSTAL_CUBE_97: Array<{ gx: number; gy: number; gz: number; col: string }> = (() => {
  const pts: Array<{ gx: number; gy: number; gz: number; col: string }> = [];
  for (let gx = -2; gx <= 2; gx++) {
    for (let gy = -2; gy <= 2; gy++) {
      for (let gz = -2; gz <= 2; gz++) {
        const isShell = Math.abs(gx) === 2 || Math.abs(gy) === 2 || Math.abs(gz) === 2;
        if (!isShell) continue;
        if (gx === 0 && gy === -2 && gz === 0) continue; // 98 -> 97 so 97 + 23 = 120
        const edgeCount =
          (Math.abs(gx) === 2 ? 1 : 0) +
          (Math.abs(gy) === 2 ? 1 : 0) +
          (Math.abs(gz) === 2 ? 1 : 0);
        let col = BRAND_MID;
        if (edgeCount >= 2 && gy === 2) col = BRAND_SHEEN;
        else if (edgeCount >= 2 && (gz === 2 || gx === -2)) col = BRAND_LIGHT;
        else if (gy === 2) col = BRAND_LIGHT;
        else if (gz === 2 || gx === -2) col = BRAND_MID;
        else col = BRAND_DARK;
        pts.push({ gx, gy, gz, col });
      }
    }
  }
  return pts; // 97
})();

// Isometric Cargo Ship Hull (36 non-overlapping integer-grid cubes)
const SHIP_HULL_36: Array<{ gx: number; gy: number; gz: number; col: string }> = (() => {
  const pts: Array<{ gx: number; gy: number; gz: number; col: string }> = [];
  // Waterline crimson lower hull (15 cubes at gy = -2)
  for (let gx = -4; gx <= 2; gx++) {
    pts.push({ gx, gy: -2, gz: -1, col: ROSE });
    pts.push({ gx, gy: -2, gz: 1, col: ROSE });
  }
  pts.push({ gx: 3, gy: -2, gz: 0, col: ROSE });
  // Deep navy upper hull freeboard (21 cubes at gy = -1)
  pts.push({ gx: -5, gy: -1, gz: -1, col: INDIGO });
  pts.push({ gx: -5, gy: -1, gz: 0, col: INDIGO });
  pts.push({ gx: -5, gy: -1, gz: 1, col: INDIGO });
  for (let gx = -4; gx <= 2; gx++) {
    pts.push({ gx, gy: -1, gz: -2, col: gx % 2 === 0 ? INDIGO : NAVY });
    pts.push({ gx, gy: -1, gz: 2, col: gx % 2 === 0 ? INDIGO : NAVY });
  }
  pts.push({ gx: 3, gy: -1, gz: -1, col: NAVY });
  pts.push({ gx: 3, gy: -1, gz: 1, col: NAVY });
  pts.push({ gx: 4, gy: -1, gz: 0, col: NAVY });
  pts.push({ gx: 5, gy: -1, gz: 0, col: INDIGO });
  return pts; // 36
})();

// Ship Stern Bridge Tower & Funnel (20 non-overlapping cubes)
const SHIP_BRIDGE_20: Array<{ gx: number; gy: number; gz: number; col: string }> = [
  // Lower white superstructure deck (6)
  { gx: -4, gy: 0, gz: -1, col: WHITE }, { gx: -4, gy: 0, gz: 0, col: WHITE }, { gx: -4, gy: 0, gz: 1, col: WHITE },
  { gx: -3, gy: 0, gz: -1, col: WHITE }, { gx: -3, gy: 0, gz: 0, col: WHITE }, { gx: -3, gy: 0, gz: 1, col: WHITE },
  // Mid white deck (3)
  { gx: -4, gy: 1, gz: -1, col: WHITE }, { gx: -4, gy: 1, gz: 0, col: WHITE }, { gx: -4, gy: 1, gz: 1, col: WHITE },
  // Bridge wing tips + dark tinted bridge windows (5)
  { gx: -4, gy: 2, gz: -2, col: WHITE }, { gx: -4, gy: 2, gz: 2, col: WHITE },
  { gx: -3, gy: 2, gz: -1, col: INDIGO }, { gx: -3, gy: 2, gz: 0, col: INDIGO }, { gx: -3, gy: 2, gz: 1, col: INDIGO },
  // White bridge roof + golden radar mast + funnel stack (6)
  { gx: -4, gy: 3, gz: -1, col: WHITE }, { gx: -4, gy: 3, gz: 0, col: WHITE }, { gx: -4, gy: 3, gz: 1, col: WHITE },
  { gx: -4, gy: 4, gz: 0, col: GOLD },
  { gx: -5, gy: 1, gz: 0, col: NAVY }, { gx: -5, gy: 2, gz: 0, col: MAGENTA },
];

// Vibrant Stacked Docker Shipping Containers (36 non-overlapping cubes)
const SHIP_CONTAINERS_36: Array<{ gx: number; gy: number; gz: number; col: string }> = (() => {
  const pts: Array<{ gx: number; gy: number; gz: number; col: string }> = [];
  const rowCols: string[][] = [
    [COBALT, EMERALD, GOLD],
    [MAGENTA, COBALT, EMERALD],
    [GOLD, ROSE, COBALT],
  ];
  // Bottom tier gy = 0 (6 cols x 3 lanes = 18)
  for (let gx = -2; gx <= 3; gx++) {
    const stackIdx = Math.floor((gx + 2) / 2); // 0, 1, 2
    for (let gz = -1; gz <= 1; gz++) {
      pts.push({ gx, gy: 0, gz, col: rowCols[stackIdx][gz + 1] });
    }
  }
  // Second tier gy = 1 (5 cols x 3 lanes = 15)
  const tier2Cols: string[][] = [
    [GOLD, MAGENTA, COBALT],
    [EMERALD, GOLD, ROSE],
    [COBALT, EMERALD, MAGENTA],
  ];
  for (let gx = -2; gx <= 2; gx++) {
    const stackIdx = Math.min(2, Math.floor((gx + 2) / 2));
    for (let gz = -1; gz <= 1; gz++) {
      pts.push({ gx, gy: 1, gz, col: tier2Cols[stackIdx][gz + 1] });
    }
  }
  // Top accent containers gy = 2 (3)
  pts.push({ gx: -1, gy: 2, gz: 0, col: GOLD });
  pts.push({ gx: 0, gy: 2, gz: 0, col: GOLD });
  pts.push({ gx: 0, gy: 2, gz: -1, col: EMERALD });
  return pts; // 36
})();

// ============================================================================
// SEASON 3 PART A — 13 MUSEUM-GRADE VOXEL SCULPTURES
// ============================================================================
export const VARIANTS_SEASON3_A: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1. LOWE'S — Enlarged XL Retail Storefront + Scalloped Awning + Giant Golden `$` Sign!
     -------------------------------------------------------------------------- */
  "lowes-storefront-xl": {
    hero(idx, _count, t) {
      const P = 0.265;
      const yShift = -0.34;
      const rotY = -0.25 + Math.sin(t * 0.34) * 0.17;
      const rotX = 0.15;
      let lx = 0, ly = 0, lz = 0, sc = 0.236, col = NAVY;

      if (idx < 42) {
        // Bold enlarged storefront curb, pillars, cornice & fascia (42)
        if (idx < 18) {
          lx = ((idx % 9) - 4) * P;
          ly = -3.2 * P;
          lz = (idx < 9 ? 0 : 1) * P;
          col = idx < 9 ? INDIGO : NAVY;
        } else if (idx < 28) {
          const k = idx - 18;
          lx = (k < 5 ? -4 : 4) * P;
          ly = ((k % 5) - 2.2) * P;
          lz = 0;
          col = NAVY;
        } else if (idx < 35) {
          lx = (idx - 28 - 3) * P;
          ly = 1.8 * P;
          col = INDIGO;
        } else {
          lx = (idx - 35 - 3) * P;
          ly = 0.8 * P;
          col = NAVY;
        }
      } else if (idx < 65) {
        // Glowing lit display window + entrance door + golden handle (23)
        const j = idx - 42;
        if (j < 12) {
          const c = (j % 4) - 3;
          const r = Math.floor(j / 4) - 2;
          lx = c * P;
          ly = (r - 0.2) * P;
          col = r === -2 ? INDIGO : r === -1 ? GOLD : c % 2 === 0 ? COBALT : WHITE;
        } else if (j === 12) {
          lx = -1.5 * P;
          ly = -1.2 * P;
          lz = 0.72 * P;
          sc = 0.195;
          col = MAGENTA;
        } else if (j < 16) {
          const k = j - 13; // 0..2 divider pillar
          lx = 1 * P;
          ly = (k - 2.2) * P;
          col = NAVY;
        } else if (j < 22) {
          const k = j - 16; // 6-cube 2x3 entrance door
          lx = (2 + (k % 2)) * P;
          ly = (Math.floor(k / 2) - 2.2) * P;
          col = k >= 4 ? COBALT : ROSE;
        } else {
          // Gleaming golden door handle
          lx = 2 * P;
          ly = -1.2 * P;
          lz = 0.78 * P;
          sc = 0.155;
          col = GOLD;
        }
      } else if (idx < 92) {
        // 27 Crisp Blue-and-White Striped Scalloped Awning cubes (3 tiers x 9 cols)
        const j = idx - 65;
        const tier = Math.floor(j / 9);
        const gx = (j % 9) - 4;
        const rip = tier === 2 ? Math.sin(t * 2.9 + gx * 0.8) * 0.032 : 0;
        lx = gx * P;
        ly = (tier === 0 ? 1.25 : tier === 1 ? 0.55 : -0.2) * P + rip;
        lz = (tier === 0 ? 0.96 : tier === 1 ? 1.85 : 2.08) * P;
        col = tier === 2 ? (gx % 2 === 0 ? COBALT : NAVY) : gx % 2 === 0 ? COBALT : WHITE;
      } else {
        // 28 cubes: BIGGER, THICKER Golden `$` Roof Sign (17) + Dark Navy Backing Struts (7) + Posts & Depth (4)
        const j = idx - 92;
        const signYaw = Math.sin(t * 1.05) * 0.14;
        if (j < 17) {
          const dp = DOLLAR_XL_17[j % DOLLAR_XL_17.length];
          const [sx, sy, sz] = rotateYX(dp[0] * P * 0.96, dp[1] * P * 0.96, 0.34 * P, signYaw, 0);
          lx = sx;
          ly = 2.85 * P + sy;
          lz = sz;
          sc = 0.228;
          col = GOLD;
        } else if (j < 24) {
          // Dark navy backing struts & crossbar anchoring the `$` sign so it pops!
          const k = j - 17;
          const strutPts: Array<[number, number, number]> = [
            [-1.2, 2.4, -0.58], [1.2, 2.4, -0.58],
            [-1.2, 3.5, -0.58], [1.2, 3.5, -0.58],
            [-1.0, 4.6, -0.58], [0, 4.6, -0.58], [1.0, 4.6, -0.58],
          ];
          const sp = strutPts[k % strutPts.length];
          const [sx, sy, sz] = rotateYX(sp[0] * P, (sp[1] - 2.85) * P, sp[2] * P, signYaw, 0);
          lx = sx;
          ly = 2.85 * P + sy;
          lz = sz;
          sc = 0.22;
          col = INDIGO;
        } else if (j < 26) {
          // Front awning posts
          lx = (j === 24 ? -4 : 4) * P;
          ly = -1.6 * P;
          lz = 1.9 * P;
          col = INDIGO;
        } else {
          // Rear side wall depth blocks
          lx = (j === 26 ? -4 : 4) * P;
          ly = -1.2 * P;
          lz = -1.0 * P;
          col = INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly + yShift, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.28, 0.12, 0.16, COBALT], [0, 0.12, 0.16, WHITE], [0.28, 0.12, 0.16, COBALT],
        [-0.26, -0.1, 0, GOLD], [0, -0.1, 0, NAVY], [0.26, -0.1, 0, ROSE],
        [-0.26, -0.3, 0, INDIGO], [0, -0.3, 0, INDIGO], [0.26, -0.3, 0, ROSE],
        [0, 0.44, 0.04, GOLD], [-0.14, 0.34, -0.06, INDIGO], [0.14, 0.34, -0.06, INDIGO],
      ];
      const p = pts[slot];
      const ry = -0.24 + Math.sin(t * 0.4) * 0.2;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2. LOWE'S S3 — Classic 3D Retail Cash Register / POS Terminal + Golden `$` Flag!
     -------------------------------------------------------------------------- */
  "lowes-s3-cash-register": {
    hero(idx, _count, t) {
      const P = 0.235;
      const yShift = -0.18;
      const rotY = -0.32 + Math.sin(t * 0.32) * 0.18;
      const rotX = 0.2;
      const pull = (0.5 + 0.5 * Math.sin(t * 1.15)) * 1.15 * P;
      const flagPop = (0.5 + 0.5 * Math.sin(t * 1.15)) * 0.22;
      let lx = 0, ly = 0, lz = 0, sc = 0.208, col = INDIGO;

      if (idx < 26) {
        // Dark Indigo Cash Drawer Housing (16 left/right walls + 10 back wall)
        if (idx < 16) {
          const side = idx < 8 ? -3 : 3;
          const k = idx % 8;
          const gz = (k % 4) - 2;
          const gy = k < 4 ? -4 : -3;
          lx = side * P;
          ly = gy * P;
          lz = gz * P;
          col = INDIGO;
        } else {
          const k = idx - 16;
          lx = ((k % 5) - 2) * P;
          ly = (k < 5 ? -4 : -3) * P;
          lz = -2 * P;
          col = INDIGO;
        }
      } else if (idx < 46) {
        // 20 cubes: Smoothly Sliding Silver/Navy Cash Drawer + Emerald Bills + Golden Handle
        const j = idx - 26;
        if (j < 10) {
          lx = ((j % 5) - 2) * P;
          ly = (j < 5 ? -4 : -3) * P;
          lz = 1.5 * P + pull;
          col = j < 5 ? NAVY : SILVER;
        } else if (j === 10) {
          lx = 0;
          ly = -3.5 * P;
          lz = 2.38 * P + pull;
          sc = 0.155;
          col = GOLD;
        } else {
          const k = j - 11; // 9 interior cash slots
          const row = k < 5 ? 0 : 1;
          const colIdx = row === 0 ? k - 2 : k - 6.5;
          lx = colIdx * P;
          ly = -3.8 * P;
          lz = (row === 0 ? 0.45 : -0.55) * P + pull;
          sc = 0.185;
          col = k % 3 === 0 ? GOLD : EMERALD;
        }
      } else if (idx < 62) {
        // 16 cubes: Upper Dark-Indigo Register Sloped Chassis Cheeks
        const j = idx - 46;
        const side = j < 8 ? -3 : 3;
        const k = j % 8;
        const row = Math.floor(k / 2); // 0..3
        const depth = k % 2; // 0..1
        lx = side * P;
        ly = (-2 + row) * P;
        lz = (-2 + depth * (1.2 - row * 0.25)) * P;
        col = row >= 2 ? NAVY : INDIGO;
      } else if (idx < 78) {
        // 16 cubes: Angled Colorful Keypad Buttons (4x4) with smooth wave press!
        const j = idx - 62;
        const c = j % 4;
        const r = Math.floor(j / 4);
        const press = Math.max(0, Math.sin(t * 2.8 - (c + r) * 0.85)) * 0.04;
        lx = (c - 1.5) * 1.15 * P;
        ly = (-1.85 + r * 0.82) * P - press;
        lz = (1.45 - r * 0.65) * P - press;
        sc = 0.182;
        if (r === 0 && c === 3) col = EMERALD;
        else if (r === 0 && c === 0) col = MAGENTA;
        else if (r === 3 && c === 3) col = GOLD;
        else col = (c + r) % 2 === 0 ? COBALT : WHITE;
      } else if (idx < 98) {
        // 20 cubes: Raised Green LCD Price Screen (12 dark bezel + 8 glowing emerald digits)
        const j = idx - 78;
        if (j < 12) {
          const framePts: Array<[number, number]> = [
            [-2.5, 3.6], [-1.5, 3.6], [-0.5, 3.6], [0.5, 3.6], [1.5, 3.6], [2.5, 3.6],
            [-2.5, 2.5], [2.5, 2.5],
            [-2.5, 1.5], [-0.8, 1.5], [0.8, 1.5], [2.5, 1.5],
          ];
          const fp = framePts[j % framePts.length];
          lx = fp[0] * P;
          ly = fp[1] * P;
          lz = -1.35 * P;
          col = INDIGO;
        } else {
          const k = j - 12; // 8 glowing price display cubes (4x2)
          const c = (k % 4) - 1.5;
          const r = Math.floor(k / 4);
          const scan = Math.sin(t * 3.2 - c * 0.9) > 0.45;
          lx = c * 1.05 * P;
          ly = (2.25 + r * 0.68) * P;
          lz = -0.68 * P;
          sc = scan ? 0.165 : 0.145;
          col = scan ? "#63f0c4" : EMERALD;
        }
      } else {
        // 22 cubes: Pop-up Golden `$` Sale Flag on Top (3 steel stem + 4 navy collar + 15 golden `$`)
        const j = idx - 98;
        if (j < 3) {
          lx = 0;
          ly = (4.3 + j * 0.72) * P + flagPop * 0.45;
          lz = -1.35 * P;
          sc = 0.165;
          col = STEEL;
        } else if (j < 7) {
          const k = j - 3;
          const backPts: Array<[number, number]> = [[-1.1, 4.9], [1.1, 4.9], [-1.1, 6.2], [1.1, 6.2]];
          const bp = backPts[k % backPts.length];
          lx = bp[0] * P;
          ly = bp[1] * P + flagPop;
          lz = -1.85 * P;
          sc = 0.19;
          col = NAVY;
        } else {
          const k = j - 7;
          const dp = DOLLAR_FLAG_15[k % DOLLAR_FLAG_15.length];
          const fp = 0.185;
          lx = dp[0] * fp;
          ly = 4.65 * P + dp[1] * fp + flagPop;
          lz = -1.15 * P;
          sc = 0.162;
          col = GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly + yShift, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.26, 0.1, SILVER], [0, -0.26, 0.16, GOLD], [0.24, -0.26, 0.1, SILVER],
        [-0.24, -0.06, 0.04, COBALT], [0, -0.06, 0.04, WHITE], [0.24, -0.06, 0.04, EMERALD],
        [-0.24, 0.14, -0.08, INDIGO], [0, 0.14, -0.08, EMERALD], [0.24, 0.14, -0.08, INDIGO],
        [-0.1, 0.36, -0.08, GOLD], [0.1, 0.36, -0.08, GOLD], [0, 0.46, -0.08, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.3 + Math.sin(t * 0.4) * 0.2;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.2);
      return { dx, dy, dz, rx: 0.2, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3. LOWE'S S3 — Sculpted 3D Cobalt & Navy Retail Shopping Cart + Merchandise!
     -------------------------------------------------------------------------- */
  "lowes-s3-shopping-cart": {
    hero(idx, _count, t) {
      const P = 0.24;
      const rotY = -0.44 + Math.sin(t * 0.32) * 0.18;
      const rotX = 0.18;
      const roll = t * 2.4;
      const bob = Math.sin(t * 2.4) * 0.025;
      let lx = 0, ly = 0, lz = 0, sc = 0.205, col = COBALT;

      if (idx < 16) {
        // 4 Continuously Spinning Dark Rolling Wheels (4 cubes each)
        const wIdx = Math.floor(idx / 4);
        const spoke = idx % 4;
        const wx = wIdx < 2 ? -2.4 * P : 2.5 * P;
        const wz = wIdx % 2 === 0 ? -1.55 * P : 1.55 * P;
        const a = roll + (spoke / 4) * Math.PI * 2;
        lx = wx + Math.cos(a) * 0.145;
        ly = -3.35 * P + Math.sin(a) * 0.145;
        lz = wz;
        sc = 0.14;
        col = spoke === 0 ? STEEL : INDIGO;
      } else if (idx < 32) {
        // Lower Chassis Rails (10) + Angled Rear Push Posts (6)
        const j = idx - 16;
        if (j < 10) {
          const side = j < 5 ? -1.55 : 1.55;
          const c = (j % 5) - 2;
          lx = c * 1.25 * P;
          ly = -2.25 * P + bob;
          lz = side * P;
          sc = 0.19;
          col = NAVY;
        } else {
          const k = j - 10;
          const side = k < 3 ? -1.65 : 1.65;
          const step = k % 3; // 0..2
          lx = (-2.85 - step * 0.55) * P;
          ly = (-1.1 + step * 1.55) * P + bob;
          lz = side * P;
          sc = 0.185;
          col = step === 2 ? STEEL : NAVY;
        }
      } else if (idx < 38) {
        // 6 cubes: Vibrant Crimson Handlebar across the rear
        const j = idx - 32;
        lx = -4.05 * P;
        ly = 2.3 * P + bob;
        lz = (-1.75 + j * 0.7) * P;
        sc = 0.195;
        col = MAGENTA;
      } else if (idx < 92) {
        // 54 cubes: Sculpted Angled Wire Basket (floor 15 + side walls 24 + nose 8 + rear 7)
        const j = idx - 38;
        if (j < 15) {
          const c = (j % 5) - 2;
          const d = Math.floor(j / 5) - 1;
          lx = (c * 1.15 + 0.35) * P;
          ly = -1.05 * P + bob;
          lz = d * 1.1 * P;
          sc = 0.195;
          col = NAVY;
        } else if (j < 39) {
          const k = j - 15; // 24 side wire wall cubes (2 sides x 2 tiers x 6 cols)
          const side = k < 12 ? -1 : 1;
          const rem = k % 12;
          const tier = rem < 6 ? 0 : 1;
          const colIdx = rem % 6;
          lx = (-2.3 + colIdx * (1.08 + tier * 0.08)) * P;
          ly = (0.1 + tier * 1.25) * P + bob;
          lz = side * (1.72 + tier * 0.24) * P;
          sc = 0.185;
          col = tier === 1 ? COBALT : colIdx % 2 === 0 ? COBALT : NAVY;
        } else if (j < 47) {
          const k = j - 39; // 8 slanted front nose cubes (2 tiers x 4 cols)
          const tier = k < 4 ? 0 : 1;
          const c = (k % 4) - 1.5;
          lx = (3.25 + tier * 0.45) * P;
          ly = (0.1 + tier * 1.25) * P + bob;
          lz = c * 1.05 * P;
          sc = 0.185;
          col = COBALT;
        } else {
          const k = j - 47; // 7 rear basket wall cubes
          const tier = k < 3 ? 0 : 1;
          const c = tier === 0 ? k - 1 : (k - 3) - 1.5;
          lx = (-2.55 - tier * 0.25) * P;
          ly = (0.15 + tier * 1.2) * P + bob;
          lz = c * 1.05 * P;
          sc = 0.185;
          col = tier === 1 ? COBALT : NAVY;
        }
      } else {
        // 28 cubes: Colorful Merchandise Boxes & Tall Golden `$` Package Nestled Inside!
        const j = idx - 92;
        if (j < 8) {
          // Emerald box (2x2x2) front-left
          const cx = j % 2;
          const cy = Math.floor(j / 2) % 2;
          const cz = Math.floor(j / 4);
          lx = (1.15 + cx * 0.92) * P;
          ly = (0.0 + cy * 0.92) * P + bob;
          lz = (-0.95 + cz * 0.92) * P;
          sc = 0.19;
          col = cy === 1 && cz === 0 ? "#4be0ae" : EMERALD;
        } else if (j < 16) {
          // Magenta gift box (2x2x2) rear-right
          const k = j - 8;
          const cx = k % 2;
          const cy = Math.floor(k / 2) % 2;
          const cz = Math.floor(k / 4);
          lx = (-1.45 + cx * 0.92) * P;
          ly = (0.0 + cy * 0.92) * P + bob;
          lz = (0.05 + cz * 0.92) * P;
          sc = 0.19;
          col = cy === 1 && cx === 0 ? WHITE : MAGENTA;
        } else {
          // Tall Golden `$` Box peeking boldly above the rim (12 cubes)
          const k = j - 16;
          const gLift = Math.sin(t * 2.0) * 0.04;
          const boxPts: Array<[number, number, number, string]> = [
            [-0.2, 0.0, -0.7, GOLD], [0.7, 0.0, -0.7, GOLD],
            [-0.2, 0.0, 0.2, GOLD], [0.7, 0.0, 0.2, GOLD],
            [-0.2, 0.95, -0.7, GOLD], [0.7, 0.95, -0.7, GOLD],
            [-0.2, 0.95, 0.2, GOLD], [0.7, 0.95, 0.2, GOLD],
            [-0.2, 1.9, -0.25, GOLD], [0.7, 1.9, -0.25, GOLD],
            [0.25, 2.75, -0.25, GOLD], [0.25, 1.9, 0.65, INDIGO],
          ];
          const bp = boxPts[k % boxPts.length];
          lx = bp[0] * P;
          ly = bp[1] * P + bob + gLift;
          lz = bp[2] * P;
          sc = 0.19;
          col = bp[3];
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.22, -0.32, 0.12, INDIGO], [0.24, -0.32, 0.12, INDIGO],
        [-0.22, -0.32, -0.12, INDIGO], [0.24, -0.32, -0.12, INDIGO],
        [-0.36, 0.22, 0, MAGENTA], [-0.22, 0.0, 0.14, COBALT],
        [0.04, 0.0, 0.14, COBALT], [0.28, 0.06, 0.14, COBALT],
        [-0.14, 0.12, -0.06, MAGENTA], [0.14, 0.12, -0.06, EMERALD],
        [0, 0.28, 0, GOLD], [0.16, 0.26, 0.02, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.4 + Math.sin(t * 0.4) * 0.2;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.18);
      return { dx, dy, dz, rx: 0.18, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4. INCITE ANALYTICS — Solid Beveled 3D Crimson Heart + 36 Live Jumping PQRST ECG Cubes!
     -------------------------------------------------------------------------- */
  "incite-filled-heart-ecg": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.28) * 0.2;
      const rotX = 0.14;
      // Synchronized double-pulse Lub-Dub heartbeat matching the leaping ECG cadence
      const { lub, dub, beat } = evalLubDub(t, 0.78);
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = CRIMSON_MID;

      if (idx < SOLID_HEART_66.length) {
        // 66 cubes: Plump SOLID Filled 3D Beveled Crimson Heart!
        const v = SOLID_HEART_66[idx];
        lx = v.x * beat;
        ly = 0.62 + v.y * beat;
        lz = v.z * beat;
        sc = 0.222 * (1 + (lub + dub) * 0.36);
        const isGlint = v.layer === 2 && v.x < -0.15 && v.y > 0.1;
        col = isGlint
          ? CRIMSON_GLINT
          : v.layer === 2
            ? CRIMSON_LIGHT
            : v.layer === 1
              ? CRIMSON_MID
              : CRIMSON_DEEP;
      } else if (idx < 84) {
        // 18 cubes: Dark-slate medical monitor backline bar cleanly grounding the live ECG
        const k = idx - 66;
        lx = (k - 8.5) * 0.215;
        ly = -1.04;
        lz = -0.24;
        sc = 0.19;
        col = SLATE;
      } else {
        // 36 cubes: Stationary horizontal ECG slots that PHYSICALLY JUMP UP & DOWN in a live PQRST wave!
        const k = idx - 84;
        const u = ((k / 36 - t * 0.78) % 1 + 1) % 1;
        const yWave = evalPqrst(u);
        const absW = Math.abs(yWave);
        lx = (k - 17.5) * 0.114;
        ly = -1.02 + yWave * 0.88;
        lz = 0.08 + Math.min(0.16, absW * 0.18);
        sc = absW > 0.2 ? 0.132 : 0.102;
        col = yWave > 0.45 ? CRIMSON_GLINT : absW > 0.16 ? CRIMSON_PULSE : CRIMSON_DEEP;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const { beat } = evalLubDub(t, 0.78);
      const pts: Array<[number, number, number, string]> = [
        [-0.14, 0.28, 0, CRIMSON_MID], [0.14, 0.28, 0, CRIMSON_MID],
        [-0.22, 0.12, 0, CRIMSON_LIGHT], [0, 0.12, 0.06, CRIMSON_GLINT], [0.22, 0.12, 0, CRIMSON_LIGHT],
        [0, -0.04, 0, CRIMSON_DEEP],
        [-0.36, -0.28, 0, SLATE], [-0.21, -0.28, 0.04, CRIMSON_DEEP],
        [-0.06, -0.28, 0.06, CRIMSON_PULSE], [0.09, -0.28, 0.06, CRIMSON_PULSE],
        [0.24, -0.28, 0.04, CRIMSON_DEEP], [0.36, -0.28, 0, SLATE],
      ];
      const p = pts[slot];
      let px = p[0];
      let py = p[1];
      let col = p[3];
      if (slot < 6) {
        px *= beat;
        py = 0.12 + (py - 0.12) * beat;
      } else if (slot >= 7 && slot <= 10) {
        const u = (((slot - 7) / 4 - t * 0.78) % 1 + 1) % 1;
        const jWave = evalPqrst(u);
        py += jWave * 0.22;
        col = jWave > 0.4 ? CRIMSON_GLINT : Math.abs(jWave) > 0.16 ? CRIMSON_PULSE : CRIMSON_DEEP;
      }
      const ry = Math.sin(t * 0.4) * 0.22;
      const [dx, dy, dz] = rotateYX(px * boost, py * boost, p[2] * boost, ry, 0.14);
      return { dx, dy, dz, rx: 0.14, ry, rz: 0, scale: sc, color: col };
    },
  },

  /* --------------------------------------------------------------------------
     5. INCITE S3 — 3D Wearable Health Smartwatch with Beating Heart & Emerald BPM Wave!
     -------------------------------------------------------------------------- */
  "incite-s3-smartwatch-bpm": {
    hero(idx, _count, t) {
      const P = 0.225;
      const rotY = -0.24 + Math.sin(t * 0.34) * 0.22;
      const rotX = 0.16;
      const { beat } = evalLubDub(t, 0.95);
      let lx = 0, ly = 0, lz = 0, sc = 0.198, col = INDIGO;

      if (idx < 20) {
        // Rounded-square Obsidian Watch Case Bezel (20 cubes, skipping outer 4 corners)
        if (idx < 5) { lx = (idx - 2) * P; ly = 3 * P; }
        else if (idx < 10) { lx = (idx - 7) * P; ly = -3 * P; }
        else if (idx < 15) { lx = -3 * P; ly = (idx - 12) * P; }
        else { lx = 3 * P; ly = (idx - 17) * P; }
        lz = 0.52 * P;
        col = INDIGO;
      } else if (idx < 36) {
        // Rear Case Housing (4x4 solid backplate = 16 cubes)
        const j = idx - 20;
        lx = ((j % 4) - 1.5) * 1.25 * P;
        ly = (Math.floor(j / 4) - 1.5) * 1.25 * P;
        lz = -0.62 * P;
        sc = 0.21;
        col = SLATE;
      } else if (idx < 42) {
        // Golden Digital Crown Dial + Lower Action Button (6 cubes)
        const j = idx - 36;
        const crownPts: Array<[number, number, number, string]> = [
          [3.88, 1.0, 0.35, GOLD], [3.88, 1.0, -0.35, GOLD], [4.35, 1.0, 0, GOLD],
          [3.88, -0.8, 0.22, STEEL], [3.88, -0.8, -0.22, STEEL], [3.88, -1.65, 0, GOLD],
        ];
        const cp = crownPts[j % crownPts.length];
        lx = cp[0] * P;
        ly = cp[1] * P;
        lz = cp[2] * P;
        sc = 0.165;
        col = cp[3];
      } else if (idx < 74) {
        // Curved Top & Bottom Slate Wrist Bands (16 top + 16 bottom = 32 cubes)
        const j = idx - 42;
        const isBottom = j >= 16;
        const k = j % 16;
        const r = Math.floor(k / 4); // 0..3 outward along strap
        const c = (k % 4) - 1.5;
        const sign = isBottom ? -1 : 1;
        lx = c * 1.02 * P;
        ly = sign * (3.85 + r * 0.86) * P;
        lz = (-0.18 - r * r * 0.26) * P;
        sc = 0.192;
        const isBuckle = isBottom && r === 2 && Math.abs(c) < 0.8;
        col = isBuckle ? GOLD : Math.abs(c) > 1 ? NAVY : SLATE;
      } else if (idx < 94) {
        // Dark Watch Screen Backplane (5x4 = 20 cubes)
        const j = idx - 74;
        lx = ((j % 5) - 2) * P;
        ly = (Math.floor(j / 5) - 1.5) * 1.15 * P;
        lz = 0.08 * P;
        sc = 0.20;
        col = "#221b42";
      } else if (idx < 108) {
        // Glowing Beating Crimson Heart on Upper Screen (14 cubes)
        const k = idx - 94;
        const hp = WATCH_HEART_14[k % WATCH_HEART_14.length];
        const hpPitch = 0.165;
        lx = hp.x * hpPitch * beat;
        ly = 0.95 * P + hp.y * hpPitch * beat;
        lz = 0.78 * P;
        sc = 0.142 * (0.96 + (beat - 1) * 0.6);
        col = hp.glint ? CRIMSON_GLINT : hp.y > 0 ? CRIMSON_LIGHT : CRIMSON_MID;
      } else {
        // Bright Emerald BPM Pulse Wave on Lower Screen (12 cubes)
        const k = idx - 108;
        const u = ((k / 12 - t * 0.62) % 1 + 1) % 1;
        const w = evalPqrst(u);
        lx = (k - 5.5) * 0.148;
        ly = -1.35 * P + w * 0.24;
        lz = 0.82 * P;
        sc = Math.abs(w) > 0.2 ? 0.125 : 0.102;
        col = w > 0.4 ? "#7ef7d1" : EMERALD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.36, -0.06, NAVY], [0, -0.36, -0.06, NAVY],
        [-0.22, 0.18, 0, INDIGO], [0.22, 0.18, 0, INDIGO],
        [-0.22, -0.18, 0, INDIGO], [0.22, -0.18, 0, INDIGO],
        [0.32, 0.06, 0, GOLD],
        [-0.08, 0.08, 0.08, CRIMSON_LIGHT], [0.08, 0.08, 0.08, CRIMSON_MID], [0, -0.02, 0.08, CRIMSON_DEEP],
        [-0.12, -0.14, 0.08, EMERALD], [0.12, -0.14, 0.08, EMERALD],
      ];
      const p = pts[slot];
      const ry = -0.22 + Math.sin(t * 0.4) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6. INCITE S3 — Dark-Navy Medical Crest Shield + Golden Rim + Heart + Emerald ECG!
     -------------------------------------------------------------------------- */
  "incite-s3-pulse-shield": {
    hero(idx, _count, t) {
      const P = 0.235;
      const yShift = 0.16;
      const rotY = Math.sin(t * 0.3) * 0.22;
      const rotX = 0.12;
      const { beat } = evalLubDub(t, 0.92);
      let lx = 0, ly = 0, lz = 0, sc = 0.205, col = NAVY;

      if (idx < SHIELD_RIM_32.length) {
        // 32 cubes: Bold Golden Heraldic Shield Rim & Studs
        const rp = SHIELD_RIM_32[idx];
        lx = rp.x * P;
        ly = rp.y * P;
        lz = rp.z * P;
        sc = rp.z > 0 ? 0.18 : 0.208;
        col = GOLD;
      } else if (idx < 76) {
        // 44 cubes: Recessed Dark-Navy Crest Shield Face
        const fp = SHIELD_FACE_44[(idx - 32) % SHIELD_FACE_44.length];
        lx = fp.x * P;
        ly = fp.y * P;
        lz = -0.35 * P;
        sc = 0.205;
        col = fp.outer ? INDIGO : NAVY;
      } else if (idx < 102) {
        // 26 cubes: Plump Beating Crimson Heart Centered Proudly on Upper Shield
        const hp = SHIELD_HEART_26[(idx - 76) % SHIELD_HEART_26.length];
        const hpP = 0.205;
        lx = hp.x * hpP * beat;
        ly = 1.48 * P + hp.y * hpP * beat;
        lz = 0.65 * P + hp.z * hpP * beat;
        sc = 0.182 * (0.98 + (beat - 1) * 0.45);
        const isGlint = hp.layer === 2 && hp.x < 0 && hp.y > 0.5;
        col = isGlint
          ? CRIMSON_GLINT
          : hp.layer === 2
            ? CRIMSON_LIGHT
            : hp.layer === 1
              ? CRIMSON_MID
              : CRIMSON_DEEP;
      } else {
        // 18 cubes: Glowing Emerald ECG Trace Slicing Horizontally Across Lower Shield
        const k = idx - 102;
        const u = ((k / 18 - t * 0.58) % 1 + 1) % 1;
        const w = evalPqrst(u);
        lx = (k - 8.5) * 0.178;
        ly = -1.65 * P + w * 0.46;
        lz = 0.85 * P + Math.min(0.12, Math.abs(w) * 0.14);
        sc = Math.abs(w) > 0.2 ? 0.145 : 0.118;
        col = w > 0.42 ? "#7ef7d1" : EMERALD;
      }

      const [x, y, z] = rotateYX(lx, ly + yShift, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.28, 0, GOLD], [0, 0.32, 0, GOLD], [0.24, 0.28, 0, GOLD],
        [-0.24, 0.02, 0, GOLD], [0.24, 0.02, 0, GOLD], [0, -0.34, 0, GOLD],
        [0, 0.02, -0.06, NAVY],
        [-0.09, 0.14, 0.08, CRIMSON_LIGHT], [0.09, 0.14, 0.08, CRIMSON_MID], [0, 0.04, 0.08, CRIMSON_DEEP],
        [-0.14, -0.12, 0.08, EMERALD], [0.14, -0.12, 0.08, EMERALD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.14);
      return { dx, dy, dz, rx: 0.14, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7. VELOCITOR — Framed 8x7 Isometric Nav Map + S-Route + Pins + TINY 3D DELIVERY TRUCK!
     -------------------------------------------------------------------------- */
  "vel-map-tiny-truck": {
    hero(idx, _count, t, pal) {
      const rotY = -0.45 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.52;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = pal.primary;
      let cubeRy = rotY;

      if (idx < 56) {
        // Exact vel-nav-map 8x7 Tilted Dark-Framed Navigation Map Tile
        const c = (idx % 8) - 3.5;
        const r = Math.floor(idx / 8) - 3;
        const isEdge = Math.abs(c) === 3.5 || Math.abs(r) === 3;
        lx = c * 0.4;
        ly = -0.62;
        lz = r * 0.4;
        sc = isEdge ? 0.32 : 0.3;
        const isPark = !isEdge && ((c < -1 && r > 0) || (c > 1 && r < 0));
        col = isEdge ? "#2f355c" : isPark ? "#56b595" : "#dce6f7";
      } else if (idx < 78) {
        // 22 cubes: Raised Cobalt S-Curved Highway Route Ribbon with Traveling Wave Pulse
        const j = idx - 56;
        const s = j / 21;
        const rxP = -1.1 + s * 2.2;
        const rzP = 0.95 - s * 1.9 + Math.sin(s * Math.PI * 2) * 0.48;
        const wave = Math.max(0, Math.sin(t * 3.4 - j * 0.42));
        lx = rxP;
        ly = -0.32 + wave * 0.06;
        lz = rzP;
        sc = 0.19 + wave * 0.04;
        col = wave > 0.72 ? "#5cc8ff" : "#2f6ae0";
      } else if (idx < 104) {
        // Start Emerald Pin (12 at -1.12, 0.95) + Destination Crimson Pin (14 at +1.12, -0.95)
        const j = idx - 78;
        const isEnd = j >= 12;
        const k = isEnd ? j - 12 : j;
        const px = isEnd ? 1.12 : -1.12;
        const pz = isEnd ? -0.95 : 0.95;
        const bob = Math.sin(t * 2.2 + (isEnd ? Math.PI : 0)) * 0.1;
        if (k < 4) {
          lx = px;
          ly = -0.22 + k * 0.18 + bob;
          lz = pz;
          sc = 0.14;
        } else {
          const a = ((k - 4) / (isEnd ? 10 : 8)) * Math.PI * 2;
          lx = px + Math.cos(a) * 0.22;
          ly = 0.62 + Math.sin(a) * 0.22 + bob;
          lz = pz;
          sc = 0.19;
        }
        col = isEnd ? "#e63b6a" : "#20b28a";
      } else {
        // 16 cubes: UNMISTAKABLE TINY 3D DELIVERY TRUCK driving smoothly back & forth along S-curve!
        const j = idx - 104;
        const phase = t * 0.85 - 0.95;
        const s = 0.5 + 0.36 * Math.sin(phase);
        const cx = -1.1 + s * 2.2;
        const cz = 0.95 - s * 1.9 + Math.sin(s * Math.PI * 2) * 0.48;
        // Exact analytical tangent (dx/ds, dz/ds) + smooth U-turn at each pin!
        const dxDs = 2.2;
        const dzDs = -1.9 + Math.cos(s * Math.PI * 2) * Math.PI * 2 * 0.48;
        const uTurn = Math.PI * (0.5 - 0.5 * Math.tanh(Math.cos(phase) * 5.0));
        const heading = Math.atan2(dzDs, dxDs) + uTurn;
        const ch = Math.cos(heading);
        const sh = Math.sin(heading);
        const u = 0.155;
        const truckPts: Array<[number, number, number, number, string]> = [
          // 4 dark rolling wheels (ty = 0)
          [-1.35, 0, -0.78, 0.125, INDIGO], [-1.35, 0, 0.78, 0.125, INDIGO],
          [0.95, 0, -0.78, 0.125, INDIGO], [0.95, 0, 0.78, 0.125, INDIGO],
          // 8-cube Crisp White/Gold Cargo Box (lower gold stripe + upper crisp white box)
          [-1.5, 1.0, -0.5, 0.138, GOLD], [-0.5, 1.0, -0.5, 0.138, GOLD],
          [-1.5, 1.0, 0.5, 0.138, GOLD], [-0.5, 1.0, 0.5, 0.138, GOLD],
          [-1.5, 2.0, -0.5, 0.138, WHITE], [-0.5, 2.0, -0.5, 0.138, WHITE],
          [-1.5, 2.0, 0.5, 0.138, WHITE], [-0.5, 2.0, 0.5, 0.138, WHITE],
          // 3-cube Cobalt Cab + 1 Amber Windshield
          [0.65, 1.0, -0.5, 0.136, COBALT], [0.65, 1.0, 0.5, 0.136, COBALT],
          [1.55, 0.9, 0, 0.132, COBALT],
          [0.72, 1.95, 0, 0.136, GOLD],
        ];
        const tp = truckPts[j % truckPts.length];
        const tx = tp[0] * u;
        const ty = tp[1] * u;
        const tz = tp[2] * u;
        lx = cx + tx * ch - tz * sh;
        ly = -0.04 + ty + Math.abs(Math.sin(t * 7.0)) * 0.014;
        lz = cz + tx * sh + tz * ch;
        sc = tp[3];
        col = tp[4];
        cubeRy = rotY - heading;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, cubeRy, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const s = 0.5 + 0.35 * Math.sin(t * 0.9);
      const tx = -0.18 + s * 0.36;
      const tz = 0.16 - s * 0.32;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.14, 0.24, "#2f355c"], [0.24, -0.14, 0.24, "#2f355c"],
        [-0.24, -0.14, -0.24, "#56b595"], [0.24, -0.14, -0.24, "#2f355c"],
        [0, -0.14, 0, "#dce6f7"],
        [-0.18, -0.02, 0.16, "#2f6ae0"], [0.18, -0.02, -0.16, "#2f6ae0"],
        [-0.24, 0.18, 0.24, "#20b28a"], [0.24, 0.2, -0.24, "#e63b6a"],
        // Tiny truck moving smoothly along route!
        [tx - 0.06, 0.14, tz + 0.04, WHITE], [tx, 0.08, tz, GOLD], [tx + 0.08, 0.12, tz - 0.06, COBALT],
      ];
      const p = pts[slot];
      const ry = -0.45 + Math.sin(t * 0.4) * 0.2;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.48);
      return { dx, dy, dz, rx: 0.48, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     8. VELOCITOR S3 — Glowing Emerald GPS Radar Screen + Sweeping Arm + 3 Truck Blips!
     -------------------------------------------------------------------------- */
  "vel-s3-radar-fleet": {
    hero(idx, _count, t) {
      const rotY = -0.18 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.34;
      const sweepAngle = -t * 1.65;
      let lx = 0, ly = 0, lz = 0, sc = 0.2, col = INDIGO;

      if (idx < 36) {
        // 36 cubes: Circular Dark Radar Bezel + Cardinal Gold Ticks
        const a = (idx / 36) * Math.PI * 2;
        lx = Math.cos(a) * 1.54;
        ly = Math.sin(a) * 1.54;
        lz = 0.04;
        sc = idx % 9 === 0 ? 0.245 : 0.225;
        col = idx % 9 === 0 ? GOLD : INDIGO;
      } else if (idx < 60) {
        // 24 cubes: Outer Concentric Radar Ring (lights up as sweep passes!)
        const k = idx - 36;
        const a = (k / 24) * Math.PI * 2;
        const angDiff = Math.abs(Math.atan2(Math.sin(sweepAngle - a), Math.cos(sweepAngle - a)));
        const lit = Math.exp(-angDiff * angDiff * 4.0);
        lx = Math.cos(a) * 1.12;
        ly = Math.sin(a) * 1.12;
        lz = -0.08 + lit * 0.06;
        sc = 0.15 + lit * 0.04;
        col = lit > 0.45 ? EMERALD : NAVY;
      } else if (idx < 76) {
        // 16 cubes: Inner Concentric Radar Ring
        const k = idx - 60;
        const a = (k / 16) * Math.PI * 2;
        const angDiff = Math.abs(Math.atan2(Math.sin(sweepAngle - a), Math.cos(sweepAngle - a)));
        const lit = Math.exp(-angDiff * angDiff * 4.0);
        lx = Math.cos(a) * 0.64;
        ly = Math.sin(a) * 0.64;
        lz = -0.08 + lit * 0.06;
        sc = 0.14 + lit * 0.035;
        col = lit > 0.45 ? EMERALD : NAVY;
      } else if (idx < 92) {
        // 16 cubes: Crosshair Axis Lines (4 cardinal arms x 4 radii, recessed at lz = -0.22)
        const k = idx - 76;
        const arm = Math.floor(k / 4);
        const step = k % 4;
        const radii = [0.28, 0.52, 0.88, 1.32];
        const a = (arm / 4) * Math.PI * 2;
        const r = radii[step];
        lx = Math.cos(a) * r;
        ly = Math.sin(a) * r;
        lz = -0.22;
        sc = 0.115;
        col = SLATE;
      } else if (idx < 101) {
        // 9 cubes: Central Hub + Continuously Sweeping Bright Emerald Radar Arm
        const k = idx - 92;
        if (k === 0) {
          lx = 0; ly = 0; lz = 0.2; sc = 0.21; col = EMERALD;
        } else {
          const r = 0.2 + (k - 1) * 0.165;
          lx = Math.cos(sweepAngle) * r;
          ly = Math.sin(sweepAngle) * r;
          lz = 0.2;
          sc = 0.142;
          col = k >= 6 ? "#7ef7d1" : EMERALD;
        }
      } else if (idx < 108) {
        // 7 cubes: Trailing Phosphor Sweep Fan
        const k = idx - 101;
        const trailSpecs: Array<[number, number]> = [
          [0.42, 0.24], [0.76, 0.24], [1.10, 0.24], [1.32, 0.28],
          [0.58, 0.48], [0.92, 0.48], [1.22, 0.52],
        ];
        const ts = trailSpecs[k % trailSpecs.length];
        const a = sweepAngle + ts[1];
        lx = Math.cos(a) * ts[0];
        ly = Math.sin(a) * ts[0];
        lz = 0.06;
        sc = 0.112;
        col = EMERALD;
      } else {
        // 12 cubes: 3 Pulsing Crimson/Gold Fleet Truck Blips (4 cubes each)
        const k = idx - 108;
        const bIdx = Math.floor(k / 4);
        const sub = k % 4;
        const blips: Array<[number, number]> = [
          [0.86, 0.65],
          [1.18, 2.55],
          [0.74, 4.45],
        ];
        const bp = blips[bIdx % blips.length];
        const bx = Math.cos(bp[1]) * bp[0];
        const by = Math.sin(bp[1]) * bp[0];
        const angDiff = Math.abs(Math.atan2(Math.sin(sweepAngle - bp[1]), Math.cos(sweepAngle - bp[1])));
        const ping = Math.exp(-angDiff * angDiff * 3.2);
        if (sub === 0) {
          lx = bx;
          ly = by;
          lz = 0.34 + ping * 0.14;
          sc = 0.175 + ping * 0.055;
          col = ping > 0.45 ? GOLD : MAGENTA;
        } else {
          const pa = ((sub - 1) / 3) * Math.PI * 2 + t * 1.4;
          const pr = 0.16 + ping * 0.09;
          lx = bx + Math.cos(pa) * pr;
          ly = by + Math.sin(pa) * pr;
          lz = 0.28;
          sc = 0.092 + ping * 0.025;
          col = ping > 0.35 ? GOLD : ROSE;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const sw = -t * 1.8;
      if (slot < 6) {
        const a = (slot / 6) * Math.PI * 2;
        const [dx, dy, dz] = rotateYX(Math.cos(a) * 0.34 * boost, Math.sin(a) * 0.34 * boost, 0, -0.18, 0.32);
        return { dx, dy, dz, rx: 0.32, ry: -0.18, rz: 0, scale: sc, color: INDIGO };
      }
      const extras: Array<[number, number, number, string]> = [
        [0, 0, 0.08, EMERALD],
        [Math.cos(sw) * 0.16, Math.sin(sw) * 0.16, 0.1, EMERALD],
        [Math.cos(sw) * 0.28, Math.sin(sw) * 0.28, 0.1, "#7ef7d1"],
        [0.18, 0.14, 0.14, MAGENTA],
        [-0.2, 0.08, 0.14, GOLD],
        [0.06, -0.2, 0.14, MAGENTA],
      ];
      const p = extras[slot - 6];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.18, 0.32);
      return { dx, dy, dz, rx: 0.32, ry: -0.18, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     9. VELOCITOR S3 — Elevated Curved Highway Deck + Gliding Van + Glossy Crimson GPS Pin!
     -------------------------------------------------------------------------- */
  "vel-s3-highway-pin": {
    hero(idx, _count, t) {
      const rotY = -0.34 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.34;
      let lx = 0, ly = 0, lz = 0, sc = 0.21, col = SLATE;
      let cubeRy = rotY;

      const roadPos = (u: number): { cx: number; cz: number; tx: number; tz: number } => {
        const cx = -1.65 + u * 3.3;
        const cz = 0.55 + Math.sin(u * Math.PI * 1.45 - 0.5) * 0.62;
        const dx = 3.3;
        const dz = Math.cos(u * Math.PI * 1.45 - 0.5) * Math.PI * 1.45 * 0.62;
        const len = Math.hypot(dx, dz) || 1;
        return { cx, cz, tx: dx / len, tz: dz / len };
      };

      if (idx < 42) {
        // 42 cubes: Elevated Curved Dark-Asphalt Highway Deck (14 segments x 3 lanes)
        const seg = Math.floor(idx / 3);
        const lane = (idx % 3) - 1; // -1, 0, +1
        const u = seg / 13;
        const r = roadPos(u);
        const nx = -r.tz;
        const nz = r.tx;
        lx = r.cx + nx * lane * 0.28;
        ly = -0.46;
        lz = r.cz + nz * lane * 0.28;
        sc = 0.225;
        col = lane === 0 ? SLATE : INDIGO;
      } else if (idx < 48) {
        // 6 cubes: 3 Concrete Bridge Piers under the elevated highway
        const k = idx - 42;
        const pierU = [0.18, 0.5, 0.82][Math.floor(k / 2) % 3];
        const tier = k % 2;
        const r = roadPos(pierU);
        lx = r.cx;
        ly = -0.74 - tier * 0.26;
        lz = r.cz;
        sc = 0.21;
        col = tier === 0 ? NAVY : STEEL;
      } else if (idx < 58) {
        // 10 cubes: Amber Dashed Centerline Road Stripes
        const k = idx - 48;
        const u = 0.05 + (k / 9) * 0.9;
        const r = roadPos(u);
        const wave = Math.max(0, Math.sin(t * 3.2 - k * 0.65));
        lx = r.cx;
        ly = -0.28 + wave * 0.02;
        lz = r.cz;
        sc = 0.112;
        col = GOLD;
      } else if (idx < 74) {
        // 16 cubes: Sleek Cobalt/White Tiny Delivery Van gliding smoothly back & forth
        const k = idx - 58;
        const u = 0.5 + 0.38 * Math.sin(t * 0.88);
        const r = roadPos(u);
        const uTurn = Math.PI * (0.5 - 0.5 * Math.tanh(Math.cos(t * 0.88) * 5.0));
        const heading = Math.atan2(r.tz, r.tx) + uTurn;
        const ch = Math.cos(heading);
        const sh = Math.sin(heading);
        const vu = 0.145;
        const vanPts: Array<[number, number, number, number, string]> = [
          // 4 wheels
          [-1.2, 0, -0.75, 0.115, INDIGO], [-1.2, 0, 0.75, 0.115, INDIGO],
          [1.0, 0, -0.75, 0.115, INDIGO], [1.0, 0, 0.75, 0.115, INDIGO],
          // Cargo body (6)
          [-1.35, 0.95, -0.5, 0.128, WHITE], [-0.35, 0.95, -0.5, 0.128, WHITE],
          [-1.35, 0.95, 0.5, 0.128, WHITE], [-0.35, 0.95, 0.5, 0.128, WHITE],
          [-1.35, 1.9, 0, 0.132, COBALT], [-0.35, 1.9, 0, 0.132, COBALT],
          // Sleek cab + windshield + headlights (6)
          [0.65, 0.95, -0.5, 0.128, COBALT], [0.65, 0.95, 0.5, 0.128, COBALT],
          [0.65, 1.85, 0, 0.13, GOLD],
          [1.55, 0.88, 0, 0.125, COBALT],
          [1.62, 0.85, -0.48, 0.085, GOLD], [1.62, 0.85, 0.48, 0.085, GOLD],
        ];
        const vp = vanPts[k % vanPts.length];
        const vx = vp[0] * vu;
        const vy = vp[1] * vu;
        const vz = vp[2] * vu;
        lx = r.cx + vx * ch - vz * sh;
        ly = -0.18 + vy;
        lz = r.cz + vx * sh + vz * ch;
        sc = vp[3];
        col = vp[4];
        cubeRy = rotY - heading;
      } else {
        // 46 cubes: Bold Glossy Crimson GPS Teardrop Pin standing prominently beside the road!
        const k = idx - 74;
        const px = 0.62;
        const pz = -0.82;
        const bob = Math.sin(t * 2.0) * 0.07;
        if (k < 12) {
          // Tapered teardrop bottom cone (12)
          const conePts: Array<[number, number, number]> = [
            [0, -0.44, 0],
            [-0.12, -0.22, 0], [0.12, -0.22, 0],
            [-0.24, 0.0, 0], [0, 0.0, 0.16], [0.24, 0.0, 0], [0, 0.0, -0.16],
            [-0.36, 0.24, 0], [-0.14, 0.24, 0.18], [0.14, 0.24, 0.18], [0.36, 0.24, 0], [0, 0.24, -0.2],
          ];
          const cp = conePts[k % conePts.length];
          lx = px + cp[0];
          ly = cp[1] + bob;
          lz = pz + cp[2];
          sc = k === 0 ? 0.165 : 0.19;
          col = k < 3 ? CRIMSON_DEEP : CRIMSON_MID;
        } else if (k < 36) {
          // Circular glossy pin head (16 outer ring + 8 front/back plump relief)
          const m = k - 12;
          if (m < 16) {
            const a = (m / 16) * Math.PI * 2;
            lx = px + Math.cos(a) * 0.54;
            ly = 0.92 + Math.sin(a) * 0.54 + bob;
            lz = pz;
            sc = 0.205;
            col = Math.sin(a) > 0.35 && Math.cos(a) < 0.2 ? CRIMSON_LIGHT : CRIMSON_MID;
          } else {
            const q = m - 16;
            const isFront = q < 4;
            const a = ((q % 4) / 4) * Math.PI * 2 + 0.78;
            lx = px + Math.cos(a) * 0.42;
            ly = 0.92 + Math.sin(a) * 0.42 + bob;
            lz = pz + (isFront ? 0.18 : -0.18);
            sc = 0.19;
            col = isFront && q === 1 ? CRIMSON_GLINT : isFront ? CRIMSON_LIGHT : CRIMSON_DEEP;
          }
        } else if (k < 44) {
          // 8 cubes: Crisp White Inner GPS Pin Ring (strictly framed inside crimson head!)
          const a = ((k - 36) / 8) * Math.PI * 2;
          lx = px + Math.cos(a) * 0.22;
          ly = 0.92 + Math.sin(a) * 0.22 + bob;
          lz = pz + 0.15;
          sc = 0.135;
          col = WHITE;
        } else {
          // 2 cubes: Ground shadow marker directly under pin tip
          lx = px + (k === 44 ? -0.14 : 0.14);
          ly = -0.62;
          lz = pz;
          sc = 0.16;
          col = INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, cubeRy, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const vx = Math.sin(t * 0.95) * 0.22;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, -0.22, 0.16, INDIGO], [-0.1, -0.22, 0.2, SLATE],
        [0.12, -0.22, 0.16, SLATE], [0.34, -0.22, 0.08, INDIGO],
        [0, -0.14, 0.18, GOLD],
        [vx - 0.06, -0.04, 0.18, WHITE], [vx + 0.06, -0.04, 0.18, COBALT],
        [0.16, -0.04, -0.18, CRIMSON_DEEP],
        [0.04, 0.16, -0.18, CRIMSON_MID], [0.28, 0.16, -0.18, CRIMSON_MID],
        [0.16, 0.3, -0.18, CRIMSON_LIGHT], [0.16, 0.16, -0.12, WHITE],
      ];
      const p = pts[slot];
      const ry = -0.34 + Math.sin(t * 0.4) * 0.2;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.34);
      return { dx, dy, dz, rx: 0.34, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     10. ABOUT JAGGER — Exact 1-to-1 Favicon Purple Crystal Medallion Coin (`j.`)!
     -------------------------------------------------------------------------- */
  "about-j-brand-purple": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.52) * 0.38;
      const rotX = 0.1;
      const bob = Math.sin(t * 1.1) * 0.05;
      const dotPulse = 1 + 0.07 * Math.sin(t * 2.4);
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = BRAND_MID;

      if (idx < 48) {
        // Beveled Circular Coin Rim (24 front + 24 back — exact favicon purple gradient!)
        const isBack = idx >= 24;
        const k = idx % 24;
        const a = (k / 24) * Math.PI * 2;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        const r = 1.28;
        lx = nx * r;
        ly = ny * r + bob;
        lz = isBack ? -0.2 : 0.08;
        sc = 0.238;
        col = !isBack
          ? brandPurpleGrad(nx, ny, true)
          : ny > 0.25
            ? BRAND_MID
            : BRAND_DARK;
      } else if (idx < 85) {
        // 37 cubes: Solid Purple Crystal Medallion Disc (upper-left #a888eb -> #805ad4 -> #5d39ad)
        const j = idx - 48;
        let dx = 0;
        let dy = 0;
        if (j === 0) {
          dx = 0; dy = 0;
        } else if (j < 7) {
          const a = ((j - 1) / 6) * Math.PI * 2;
          dx = Math.cos(a) * 0.34;
          dy = Math.sin(a) * 0.34;
        } else if (j < 19) {
          const a = ((j - 7) / 12) * Math.PI * 2;
          dx = Math.cos(a) * 0.68;
          dy = Math.sin(a) * 0.68;
        } else {
          const a = ((j - 19) / 18) * Math.PI * 2;
          dx = Math.cos(a) * 1.0;
          dy = Math.sin(a) * 1.0;
        }
        lx = dx;
        ly = dy + bob;
        lz = -0.08;
        sc = 0.245;
        col = brandPurpleGrad(dx / 1.28, dy / 1.28, true);
      } else if (idx < 108) {
        // 23 cubes: Proud Pure `#ffffff` Lowercase `j` + Raised Middle-Zone `#efe6ff` Period `.`!
        const gp = BRAND_J_DOT_23[(idx - 85) % BRAND_J_DOT_23.length];
        lx = gp.x;
        ly = gp.y + bob;
        lz = 0.24;
        sc = gp.isDot ? 0.162 * dotPulse : 0.162;
        col = gp.isDot ? BRAND_DOT : WHITE;
      } else {
        // 12 cubes: Engraved Back Medallion Purple Ring
        const k = idx - 108;
        const a = (k / 12) * Math.PI * 2;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        lx = nx * 0.64;
        ly = ny * 0.64 + bob;
        lz = -0.34;
        sc = 0.21;
        col = brandPurpleGrad(nx, ny, false);
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const ry = Math.sin(t * 0.45) * 0.3;
      if (slot < 6) {
        const a = (slot / 6) * Math.PI * 2;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        const [dx, dy, dz] = rotateYX(nx * 0.34 * boost, ny * 0.34 * boost, -0.04, ry, 0.12);
        return { dx, dy, dz, rx: 0.12, ry, rz: 0, scale: sc, color: brandPurpleGrad(nx, ny, true) };
      }
      const pts: Array<[number, number, string]> = [
        [-0.04, 0.2, WHITE], [-0.04, 0.02, WHITE], [-0.04, -0.14, WHITE],
        [-0.16, -0.2, WHITE], [-0.22, -0.1, WHITE], [0.16, -0.06, BRAND_DOT],
      ];
      const p = pts[slot - 6];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, 0.1 * boost, ry, 0.12);
      return { dx, dy, dz, rx: 0.12, ry, rz: 0, scale: sc, color: p[2] };
    },
  },

  /* --------------------------------------------------------------------------
     11. ABOUT S3 — Airy Open-Space Purple Halo Ring Framing Floating Chunky White `j.`!
     -------------------------------------------------------------------------- */
  "about-s3-purple-j-floating": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.46) * 0.34;
      const rotX = 0.12;
      const ringBob = Math.sin(t * 1.0) * 0.04;
      const glyphBob = Math.sin(t * 1.45 + 0.5) * 0.065;
      const dotPulse = 1 + 0.07 * Math.sin(t * 2.4);
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = BRAND_MID;

      if (idx < 56) {
        // 56 cubes: Glossy Purple Circular Outer Halo Ring (28 front + 28 back bevel)
        const isBack = idx >= 28;
        const k = idx % 28;
        const a = (k / 28) * Math.PI * 2;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        const r = 1.46;
        lx = nx * r;
        ly = ny * r + ringBob;
        lz = isBack ? -0.14 : 0.1;
        sc = isBack ? 0.215 : 0.232;
        col = !isBack
          ? brandPurpleGrad(nx, ny, true)
          : ny > 0.2
            ? BRAND_MID
            : BRAND_DARK;
      } else if (idx < 102) {
        // 46 cubes: Bold Chunky 2-Layer 3D Pure-White Lowercase `j` + `#efe6ff` Raised Middle Period!
        const j = idx - 56;
        const isBackLayer = j >= 23;
        const gp = BRAND_J_DOT_23[j % BRAND_J_DOT_23.length];
        const gScale = 1.1;
        lx = gp.x * gScale;
        ly = gp.y * gScale + glyphBob;
        lz = isBackLayer ? -0.12 : 0.12;
        sc = (gp.isDot ? 0.176 * dotPulse : 0.176) * (isBackLayer ? 0.96 : 1);
        // Back layer uses soft lavender brand tint for ultra-crisp 3D contrast on light backdrop!
        col = isBackLayer
          ? gp.isDot
            ? BRAND_SHEEN
            : BRAND_LIGHT
          : gp.isDot
            ? BRAND_DOT
            : WHITE;
      } else {
        // 18 cubes: Slowly Orbiting Inner Lavender-Purple Accent Ring
        const k = idx - 102;
        const a = (k / 18) * Math.PI * 2 + t * 0.35;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        lx = nx * 1.16;
        ly = ny * 1.16 + ringBob;
        lz = -0.28;
        sc = 0.13;
        col = brandPurpleGrad(nx, ny, false);
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const ry = Math.sin(t * 0.45) * 0.3;
      if (slot < 6) {
        const a = (slot / 6) * Math.PI * 2;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        const [dx, dy, dz] = rotateYX(nx * 0.38 * boost, ny * 0.38 * boost, 0, ry, 0.12);
        return { dx, dy, dz, rx: 0.12, ry, rz: 0, scale: sc, color: brandPurpleGrad(nx, ny, true) };
      }
      const pts: Array<[number, number, string]> = [
        [-0.04, 0.2, WHITE], [-0.04, 0.02, WHITE], [-0.04, -0.14, WHITE],
        [-0.16, -0.2, BRAND_LIGHT], [-0.22, -0.1, WHITE], [0.16, -0.06, BRAND_DOT],
      ];
      const p = pts[slot - 6];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, 0.08 * boost, ry, 0.12);
      return { dx, dy, dz, rx: 0.12, ry, rz: 0, scale: sc, color: p[2] };
    },
  },

  /* --------------------------------------------------------------------------
     12. ABOUT S3 — GameCube-Inspired Faceted Purple Crystal Emblem Cube (`j.`)!
     -------------------------------------------------------------------------- */
  "about-s3-purple-cube-j": {
    hero(idx, _count, t) {
      const rotY = -0.42 + Math.sin(t * 0.48) * 0.42;
      const rotX = 0.34 + Math.cos(t * 0.42) * 0.08;
      const bob = Math.sin(t * 1.2) * 0.06;
      const dotPulse = 1 + 0.07 * Math.sin(t * 2.4);
      const P = 0.34;
      let lx = 0, ly = 0, lz = 0, sc = 0.298, col = BRAND_MID;

      if (idx < CRYSTAL_CUBE_97.length) {
        // 97 cubes: Faceted 5x5x5 Purple Crystal Shell
        const c = CRYSTAL_CUBE_97[idx];
        lx = c.gx * P;
        ly = c.gy * P + bob;
        lz = c.gz * P;
        sc = 0.298;
        col = c.col;
      } else {
        // 23 cubes: Crisp `#ffffff` Lowercase `j` + `#efe6ff` Period Proudly Inlaid on +Z Face!
        const gp = BRAND_J_DOT_23[(idx - CRYSTAL_CUBE_97.length) % BRAND_J_DOT_23.length];
        const gScale = 0.94;
        lx = gp.x * gScale;
        ly = gp.y * gScale + bob;
        lz = 2 * P + 0.255;
        sc = gp.isDot ? 0.152 * dotPulse : 0.152;
        col = gp.isDot ? BRAND_DOT : WHITE;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const ry = -0.45 + Math.sin(t * 0.48) * 0.35;
      const pts: Array<[number, number, number, string]> = [
        [-0.22, 0.22, -0.22, BRAND_SHEEN], [0.22, 0.22, -0.22, BRAND_LIGHT],
        [-0.22, 0.22, 0.22, BRAND_LIGHT], [0.22, 0.22, 0.22, BRAND_MID],
        [-0.22, -0.22, -0.22, BRAND_DARK], [0.22, -0.22, -0.22, BRAND_DARK],
        [-0.22, -0.22, 0.22, BRAND_MID], [0.22, -0.22, 0.22, BRAND_DARK],
        // Front face white `j.` emblem
        [-0.04, 0.14, 0.28, WHITE], [-0.04, -0.04, 0.28, WHITE],
        [-0.14, -0.14, 0.28, WHITE], [0.12, -0.04, 0.28, BRAND_DOT],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.34);
      return { dx, dy, dz, rx: 0.34, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     13. REDVENTURES S3 — Isometric Docker-Style Container Cargo Ship Over Ocean Waves!
     -------------------------------------------------------------------------- */
  "rv-s3-container-ship": {
    hero(idx, _count, t) {
      const P = 0.225;
      const rotY = -0.5 + Math.sin(t * 0.28) * 0.15;
      const rotX = 0.26;
      const shipBob = Math.sin(t * 1.55) * 0.055;
      const pitchRock = Math.cos(t * 1.55) * 0.035;
      let lx = 0, ly = 0, lz = 0, sc = 0.198, col = NAVY;

      if (idx < SHIP_HULL_36.length) {
        // 36 cubes: Deep Navy Hull + Tapered Bow + Crimson Waterline
        const h = SHIP_HULL_36[idx];
        lx = h.gx * P;
        ly = h.gy * P + shipBob + h.gx * pitchRock * 0.25;
        lz = h.gz * P;
        col = h.col;
      } else if (idx < 56) {
        // 20 cubes: Crisp White Stern Bridge Tower + Dark Bridge Windows + Funnel
        const b = SHIP_BRIDGE_20[(idx - 36) % SHIP_BRIDGE_20.length];
        lx = b.gx * P;
        ly = b.gy * P + shipBob + b.gx * pitchRock * 0.25;
        lz = b.gz * P;
        col = b.col;
      } else if (idx < 92) {
        // 36 cubes: Vibrant Stacked Cobalt / Emerald / Gold / Magenta Shipping Containers
        const c = SHIP_CONTAINERS_36[(idx - 56) % SHIP_CONTAINERS_36.length];
        lx = c.gx * P;
        ly = c.gy * P + shipBob + c.gx * pitchRock * 0.25;
        lz = c.gz * P;
        sc = 0.195;
        col = c.col;
      } else {
        // 28 cubes: Wavy Blue Ocean Crests & Bow Foam Surrounding the Ship!
        const k = idx - 92;
        const oceanPts: Array<[number, number, boolean]> = [
          // Port side swell (11)
          [-6, -3.2, false], [-4.8, -3.2, false], [-3.6, -3.2, false], [-2.4, -3.2, false],
          [-1.2, -3.2, false], [0, -3.2, false], [1.2, -3.2, false], [2.4, -3.2, false],
          [3.6, -3.0, false], [4.8, -2.2, true], [5.8, -1.2, true],
          // Starboard side swell (11)
          [-6, 3.2, false], [-4.8, 3.2, false], [-3.6, 3.2, false], [-2.4, 3.2, false],
          [-1.2, 3.2, false], [0, 3.2, false], [1.2, 3.2, false], [2.4, 3.2, false],
          [3.6, 3.0, false], [4.8, 2.2, true], [5.8, 1.2, true],
          // Bow crest + stern wake (6)
          [6.3, 0, true], [5.2, 0, true],
          [-6.4, -1.5, false], [-6.4, 0, true], [-6.4, 1.5, false], [-7.4, 0, false],
        ];
        const op = oceanPts[k % oceanPts.length];
        const wave = Math.sin(t * 2.4 - op[0] * 0.65 + op[1] * 0.45);
        lx = op[0] * P;
        ly = -2.85 * P + wave * 0.12;
        lz = op[1] * P;
        sc = 0.19;
        col = op[2] && wave > 0.15 ? "#7cc8ff" : wave > 0.25 ? COBALT : NAVY;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const bob = Math.sin(t * 1.8) * 0.03;
      const pts: Array<[number, number, number, string]> = [
        [-0.3, -0.2, 0, INDIGO], [-0.08, -0.2, 0, ROSE], [0.14, -0.2, 0, INDIGO], [0.34, -0.18, 0, NAVY],
        [-0.28, 0.02, 0, WHITE], [-0.28, 0.2, 0, INDIGO], [-0.36, 0.14, 0, MAGENTA],
        [-0.08, 0.0, 0.06, COBALT], [0.12, 0.0, 0.06, EMERALD],
        [-0.04, 0.18, 0, GOLD], [0.14, 0.16, -0.04, MAGENTA],
        [0.02, -0.34, 0.16, COBALT],
      ];
      const p = pts[slot];
      const ry = -0.5 + Math.sin(t * 0.4) * 0.18;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + bob) * boost, p[2] * boost, ry, 0.26);
      return { dx, dy, dz, rx: 0.26, ry, rz: 0, scale: sc, color: p[3] };
    },
  },
};
