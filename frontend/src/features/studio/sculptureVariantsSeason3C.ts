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

const INDIGO = "#2b2452";
const NAVY = "#344b8c";
const COBALT = "#2d6ae0";
const MAGENTA = "#e03c8a";
const ROSE = "#c9437d";
const GOLD = "#f5b83d";
const EMERALD = "#22bf90";
const WHITE = "#ffffff";

// ============================================================================
// PRECOMPUTED NON-OVERLAPPING GEOMETRY TABLES (SEASON 3C — 13 SCULPTURES)
// ============================================================================

// 1. Vault outer perimeter ring (7x7 perimeter = 24)
const VAULT_RING_24: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let y = -3; y <= 3; y++) {
    for (let x = -3; x <= 3; x++) {
      if (Math.abs(x) === 3 || Math.abs(y) === 3) {
        pts.push([x, y]);
      }
    }
  }
  return pts; // 24
})();

// 1. Vault inner recessed core (12-cube 3D emerald heartbeat crystal)
const VAULT_CORE_12: Array<[number, number, number]> = [
  [0, 0, -0.35],
  [-0.85, 0, -0.35],
  [0.85, 0, -0.35],
  [0, -0.85, -0.35],
  [0, 0.85, -0.35],
  [-0.75, -0.75, -0.95],
  [0.75, -0.75, -0.95],
  [-0.75, 0.75, -0.95],
  [0.75, 0.75, -0.95],
  [0, 0, 0.35],
  [-0.65, 0, 0.25],
  [0.65, 0, 0.25],
];

// 2. Browser frame (7 cols x 6 rows perimeter = 22)
const BROWSER_FRAME_22: Array<[number, number, string]> = (() => {
  const pts: Array<[number, number, string]> = [];
  for (let r = -3; r <= 2; r++) {
    for (let c = -3; c <= 3; c++) {
      if (r === -3 || r === 2 || c === -3 || c === 3) {
        let col = INDIGO;
        if (r === 2) {
          if (c === -2) col = ROSE;
          else if (c === -1) col = GOLD;
          else if (c === 0) col = EMERALD;
          else if (c === 1 || c === 2) col = COBALT;
        }
        pts.push([c, r, col]);
      }
    }
  }
  return pts; // 22
})();

// 2. Browser inner UI cards (10)
const BROWSER_CARDS_10: Array<[number, number, string]> = [
  [-1, 1, MAGENTA], [0, 1, COBALT], [1, 1, COBALT],
  [-2, 0, NAVY], [-2, -1, NAVY], [-2, -2, NAVY],
  [0, 0, EMERALD], [1, 0, GOLD], [0, -1, COBALT], [1, -1, MAGENTA],
];

// 4. Cutaway 4x4 perimeter ring (12)
const SLAB_RING_12: Array<[number, number]> = [
  [-1.5, -1.5], [-0.5, -1.5], [0.5, -1.5], [1.5, -1.5],
  [1.5, -0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5],
  [-0.5, 1.5], [-1.5, 1.5], [-1.5, 0.5], [-1.5, -0.5],
];

// 5. Scroll document frame (8x9 perimeter = 30)
const SCROLL_FRAME_30: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let r = -4; r <= 4; r++) {
    for (let c = -4; c <= 3; c++) {
      if (r === -4 || r === 4 || c === -4 || c === 3) {
        pts.push([c, r]);
      }
    }
  }
  return pts; // 30
})();

// 5. Scroll syntax-highlighted code lines (22)
const SCROLL_CODE_22: Array<[number, number, string]> = [
  [-3, 3, MAGENTA], [-2, 3, MAGENTA], [-1, 3, COBALT], [0, 3, COBALT],
  [-2, 2, NAVY], [-1, 2, GOLD], [0, 2, GOLD], [1, 2, GOLD],
  [-2, 1, COBALT], [-1, 1, COBALT], [0, 1, EMERALD], [1, 1, EMERALD], [2, 1, EMERALD],
  [-2, 0, MAGENTA], [-1, 0, INDIGO], [0, 0, INDIGO],
  [-3, -1, COBALT], [-2, -1, COBALT], [-1, -1, GOLD],
  [-3, -2, NAVY], [-2, -2, NAVY], [-1, -2, NAVY],
];

// 6. IDE card frame (11x9 perimeter = 36)
const IDE_FRAME_36: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let r = -4; r <= 4; r++) {
    for (let c = -5; c <= 5; c++) {
      if (r === -4 || r === 4 || c === -5 || c === 5) {
        pts.push([c, r]);
      }
    }
  }
  return pts; // 36
})();

// 6. <T> 3D emblem (23 cubes: 7 '<', 9 'T', 7 '>')
const GENERIC_T_23: Array<[number, number, string]> = [
  // '<' (7)
  [-4.1, 1.6, COBALT], [-3.45, 2.25, COBALT], [-2.8, 2.9, COBALT], [-2.15, 3.35, COBALT],
  [-3.45, 0.95, COBALT], [-2.8, 0.3, COBALT], [-2.15, -0.15, COBALT],
  // 'T' (9)
  [-1.5, 3.1, GOLD], [-0.75, 3.1, GOLD], [0, 3.1, GOLD], [0.75, 3.1, GOLD], [1.5, 3.1, GOLD],
  [0, 2.3, GOLD], [0, 1.5, GOLD], [0, 0.7, GOLD], [0, -0.1, GOLD],
  // '>' (7)
  [4.1, 1.6, COBALT], [3.45, 2.25, COBALT], [2.8, 2.9, COBALT], [2.15, 3.35, COBALT],
  [3.45, 0.95, COBALT], [2.8, 0.3, COBALT], [2.15, -0.15, COBALT],
];

// 6. { } curly braces (14 cubes: 7 '{', 7 '}')
const CURLY_BRACES_14: Array<[number, number, string]> = [
  [-2.4, -0.9, MAGENTA], [-3.2, -1.2, MAGENTA], [-3.2, -1.95, MAGENTA],
  [-4.0, -2.35, MAGENTA], [-3.2, -2.75, MAGENTA], [-3.2, -3.5, MAGENTA], [-2.4, -3.8, MAGENTA],
  [2.4, -0.9, MAGENTA], [3.2, -1.2, MAGENTA], [3.2, -1.95, MAGENTA],
  [4.0, -2.35, MAGENTA], [3.2, -2.75, MAGENTA], [3.2, -3.5, MAGENTA], [2.4, -3.8, MAGENTA],
];

// 7. Split-screen pane frame (6 cols x 7 rows perimeter = 22)
const PANE_FRAME_22: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let r = -3; r <= 3; r++) {
    for (let c = 0; c < 6; c++) {
      if (r === -3 || r === 3 || c === 0 || c === 5) {
        pts.push([c - 2.5, r]);
      }
    }
  }
  return pts; // 22
})();

// 8. Retro Arcade Cabinet Side Silhouette (20 points in (y, z) per side)
const ARCADE_SIDE_20: Array<[number, number, string]> = [
  // Back vertical spine (9)
  [-4, -1.6, INDIGO], [-3, -1.6, INDIGO], [-2, -1.6, INDIGO], [-1, -1.6, INDIGO],
  [0, -1.6, INDIGO], [1, -1.6, INDIGO], [2, -1.6, INDIGO], [3, -1.6, INDIGO], [4, -1.6, INDIGO],
  // Lower kickplate edge (3)
  [-4, 0.5, COBALT], [-3, 0.5, COBALT], [-2, 0.5, COBALT],
  // Control-deck overhang nose (2)
  [-1, 0.5, COBALT], [-1, 1.5, GOLD],
  // Recessed CRT screen cheeks (3)
  [0, 0.2, COBALT], [1, 0.2, COBALT], [2, 0.2, COBALT],
  // Top marquee hood overhang (3)
  [3, 0.8, GOLD], [4, 0.5, COBALT], [4, -0.5, INDIGO],
];

// 9. Interlocking Jigsaw Quadrant 0 (Top-Right) exact 25 front + 5 backing = 30
// 90-degree CCW rotation maps Q0 -> Q1 -> Q2 -> Q3 with 100% exact tab-into-blank fit!
const JIGSAW_Q0_FRONT_25: Array<[number, number]> = (() => {
  const removed = new Set(["2.5,0.5", "1.5,1.5", "2.5,1.5", "3.5,1.5"]);
  const pts: Array<[number, number]> = [];
  for (let ix = 0; ix < 5; ix++) {
    for (let iy = 0; iy < 5; iy++) {
      const x = ix + 0.5;
      const y = iy + 0.5;
      if (!removed.has(`${x},${y}`)) {
        pts.push([x, y]);
      }
    }
  }
  // 4-cell mushroom tab protruding left into Q1's exact removed blank!
  pts.push([-0.5, 2.5], [-1.5, 1.5], [-1.5, 2.5], [-1.5, 3.5]);
  return pts; // 25
})();

const JIGSAW_Q0_BACK_5: Array<[number, number]> = [
  [4.5, 4.5], [3.5, 4.5], [2.5, 4.5], [4.5, 3.5], [4.5, 2.5],
];

// 10. Chess board outer 6x6 perimeter border (20)
const CHESS_BORDER_20: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let gx = -2.5; gx <= 2.5; gx += 1) {
    for (let gz = -2.5; gz <= 2.5; gz += 1) {
      if (Math.abs(gx) === 2.5 || Math.abs(gz) === 2.5) {
        pts.push([gx, gz]);
      }
    }
  }
  return pts; // 20
})();

// 13. Cassette shell outer perimeter (11x7 perimeter = 32)
const CASSETTE_SHELL_32: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let r = -3; r <= 3; r++) {
    for (let c = -5; c <= 5; c++) {
      if (r === -3 || r === 3 || c === -5 || c === 5) {
        pts.push([c, r]);
      }
    }
  }
  return pts; // 32
})();

// Helper for marble track 3D curve & horizontal normal
function evalMarbleTrack(u: number): {
  x: number;
  y: number;
  z: number;
  nx: number;
  nz: number;
} {
  const x = (u - 0.5) * 3.0;
  const y = (0.5 - u) * 1.62 + Math.sin(u * Math.PI * 2) * 0.14;
  const z = Math.sin(u * Math.PI * 2) * 0.46;
  const dx = 3.0;
  const dz = Math.cos(u * Math.PI * 2) * Math.PI * 2 * 0.46;
  const len = Math.hypot(dx, dz) || 1;
  return { x, y, z, nx: -dz / len, nz: dx / len };
}

// ============================================================================
// SEASON 3 PART C — 13 MUSEUM-GRADE VOXEL SCULPTURES
// ============================================================================
export const VARIANTS_SEASON3_C: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1. FORTRESS VAULT — Armored Steel Bank Vault, Spinning Golden Wheel & Emerald Heartbeat
     -------------------------------------------------------------------------- */
  "sys-s3-fortress-vault": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.24;
      const rotY = -0.22 + Math.sin(t * 0.34) * 0.2;
      const rotX = 0.16;
      const wheelAngle = t * 0.68;
      const boltSlide = Math.sin(t * 1.15) * 0.26;
      const beat =
        0.5 +
        0.35 * Math.sin(t * 3.6) +
        0.15 * Math.sin(t * 7.2);

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.205;
      let col = INDIGO;

      if (i < 48) {
        // Front & back 7x7 armored steel rings (24 + 24)
        const isBack = i >= 24;
        const p = VAULT_RING_24[i % VAULT_RING_24.length];
        const isCorner = Math.abs(p[0]) === 3 && Math.abs(p[1]) === 3;
        lx = p[0] * P;
        ly = p[1] * P;
        lz = (isBack ? -1.05 : 0) * P;
        sc = 0.21;
        col = isCorner && !isBack ? GOLD : isBack ? INDIGO : (p[0] + p[1]) % 2 === 0 ? INDIGO : NAVY;
      } else if (i < 54) {
        // Heavy left steel hinges (6)
        const k = i - 48;
        const hingePts: Array<[number, number, number, string]> = [
          [-4, 2, 0, NAVY], [-4, 1, 0, GOLD], [-4, -1, 0, GOLD],
          [-4, -2, 0, NAVY], [-4, 2, -1.05, INDIGO], [-4, -2, -1.05, INDIGO],
        ];
        const h = hingePts[k % hingePts.length];
        lx = h[0] * P;
        ly = h[1] * P;
        lz = h[2] * P;
        sc = 0.2;
        col = h[3];
      } else if (i < 63) {
        // 3x3 recessed dark backplate (9)
        const k = i - 54;
        lx = ((k % 3) - 1) * P;
        ly = (Math.floor(k / 3) - 1) * P;
        lz = -2.05 * P;
        sc = 0.21;
        col = INDIGO;
      } else if (i < 79) {
        // 8 sliding armored locking bolts (N/S/E/W) + 8 inner chamfer lugs
        const k = i - 63;
        if (k < 8) {
          const dir = Math.floor(k / 2); // 0:+X, 1:-X, 2:+Y, 3:-Y
          const seg = k % 2; // 0:base, 1:tip
          const r = (3.85 + seg * 0.85 + boltSlide) * P;
          if (dir === 0) {
            lx = r;
            ly = 0;
          } else if (dir === 1) {
            lx = -r;
            ly = 0;
          } else if (dir === 2) {
            lx = 0;
            ly = r;
          } else {
            lx = 0;
            ly = -r;
          }
          lz = 0.1 * P;
          sc = 0.185;
          col = seg === 1 ? GOLD : COBALT;
        } else {
          const cIdx = k - 8;
          const chamfers: Array<[number, number, number]> = [
            [-2, 2, 0], [2, 2, 0], [-2, -2, 0], [2, -2, 0],
            [-2, 0, -1.05], [2, 0, -1.05], [0, -2, -1.05], [0, 2, -1.05],
          ];
          const ch = chamfers[cIdx % chamfers.length];
          lx = ch[0] * P;
          ly = ch[1] * P;
          lz = ch[2] * P;
          sc = 0.195;
          col = NAVY;
        }
      } else if (i < 91) {
        // 12-cube Glowing Emerald Heartbeat Core inside chamber
        const p = VAULT_CORE_12[(i - 79) % VAULT_CORE_12.length];
        const pulseScale = 0.92 + beat * 0.18;
        lx = p[0] * P * pulseScale;
        ly = p[1] * P * pulseScale;
        lz = p[2] * P;
        sc = i === 79 ? 0.195 + beat * 0.035 : 0.155 + beat * 0.025;
        col = i === 79 && beat > 0.72 ? WHITE : EMERALD;
      } else {
        // 29-cube Golden Rotary Locking Wheel with 4 spokes & crank handles
        const k = i - 91;
        if (k < 16) {
          const a = (k / 16) * Math.PI * 2 + wheelAngle;
          const R = 2.25 * P;
          lx = Math.cos(a) * R;
          ly = Math.sin(a) * R;
          lz = 1.65 * P;
          sc = 0.175;
          col = k % 4 === 0 ? GOLD : k % 2 === 0 ? GOLD : COBALT;
        } else if (k < 24) {
          const spoke = Math.floor((k - 16) / 2);
          const step = (k - 16) % 2;
          const a = (spoke / 4) * Math.PI * 2 + wheelAngle;
          const r = (0.85 + step * 0.72) * P;
          lx = Math.cos(a) * r;
          ly = Math.sin(a) * r;
          lz = 1.65 * P;
          sc = 0.155;
          col = GOLD;
        } else if (k < 28) {
          // 4 crank handles protruding forward on the rim
          const a = ((k - 24) / 4) * Math.PI * 2 + wheelAngle;
          const R = 2.25 * P;
          lx = Math.cos(a) * R;
          ly = Math.sin(a) * R;
          lz = 2.4 * P;
          sc = 0.15;
          col = MAGENTA;
        } else {
          // Center golden wheel hub
          lx = 0;
          ly = 0;
          lz = 1.85 * P;
          sc = 0.205;
          col = GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const wa = t * 0.9;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.24, 0, INDIGO], [0, 0.24, 0, NAVY], [0.24, 0.24, 0, INDIGO],
        [-0.24, 0, 0, NAVY], [0.24, 0, 0, NAVY],
        [-0.24, -0.24, 0, INDIGO], [0, -0.24, 0, NAVY], [0.24, -0.24, 0, INDIGO],
        [0, 0, -0.04, EMERALD],
        [Math.cos(wa) * 0.2, Math.sin(wa) * 0.2, 0.22, GOLD],
        [Math.cos(wa + 2.094) * 0.2, Math.sin(wa + 2.094) * 0.2, 0.22, GOLD],
        [Math.cos(wa + 4.188) * 0.2, Math.sin(wa + 4.188) * 0.2, 0.22, GOLD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.45) * 0.26;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2. BROWSER PLUG — Framed Desktop Browser Plugged into 3-Tier Cobalt Database Cylinder
     -------------------------------------------------------------------------- */
  "fs-s3-browser-plug": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.21;
      const rotY = -0.18 + Math.sin(t * 0.32) * 0.18;
      const rotX = 0.17;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.185;
      let col = INDIGO;

      if (i < 52) {
        // Left Desktop Browser Window centered at x = -4.2*P, y = 0.5*P
        const bx = -4.2;
        const by = 0.5;
        if (i < 22) {
          const f = BROWSER_FRAME_22[i % BROWSER_FRAME_22.length];
          lx = (bx + f[0]) * P;
          ly = (by + f[1]) * P;
          lz = 0;
          col = f[2];
        } else if (i < 42) {
          // 5x4 crisp white viewport strictly framed inside dark-indigo bezel
          const k = i - 22;
          const c = (k % 5) - 2;
          const r = Math.floor(k / 5) - 2;
          lx = (bx + c) * P;
          ly = (by + r) * P;
          lz = -0.14 * P;
          sc = 0.185;
          col = WHITE;
        } else {
          // 10 colorful UI cards popping forward
          const u = BROWSER_CARDS_10[(i - 42) % BROWSER_CARDS_10.length];
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 - (i - 42) * 0.5);
          lx = (bx + u[0]) * P;
          ly = (by + u[1]) * P;
          lz = (0.76 + pulse * 0.12) * P;
          sc = 0.165;
          col = u[2];
        }
      } else if (i < 72) {
        // 20-cube Bold Curved Emerald/Gold Data Cable + Plug Connectors
        const k = i - 52;
        if (k < 2) {
          // Left plug socket on browser right edge
          lx = (-0.35 + k * 0.72) * P;
          ly = -1.2 * P;
          lz = 0.15 * P;
          sc = 0.18;
          col = k === 0 ? INDIGO : GOLD;
        } else if (k < 4) {
          // Right plug socket entering DB cylinder
          const j = k - 2;
          lx = (2.15 + j * 0.72) * P;
          ly = -1.2 * P;
          lz = 0.15 * P;
          sc = 0.18;
          col = j === 1 ? INDIGO : GOLD;
        } else {
          // 16-segment smooth dipping cable arc
          const seg = k - 4;
          const s = (seg + 0.5) / 16; // 0..1
          const theta = s * Math.PI;
          lx = (-0.2 + s * 2.75) * P;
          ly = (-1.65 - Math.sin(theta) * 2.15) * P;
          lz = (0.2 + Math.sin(theta) * 1.1) * P;
          const wave = Math.sin(t * 3.4 - seg * 0.65);
          const revWave = Math.sin(t * 3.4 + seg * 0.65);
          sc = wave > 0.65 || revWave > 0.75 ? 0.185 : 0.15;
          col = wave > 0.55 ? GOLD : revWave > 0.65 ? MAGENTA : EMERALD;
        }
      } else {
        // Right Solid 3-Tier Cobalt Database Cylinder (48 cubes) centered at x = 5.0*P
        const k = i - 72;
        const dbX = 5.0 * P;
        const dbSpin = Math.sin(t * 0.45) * 0.15;
        if (k < 36) {
          // 3 stacked cylindrical rings x 12 cubes
          const tier = Math.floor(k / 12); // 0, 1, 2
          const slot = k % 12;
          const a = (slot / 12) * Math.PI * 2 + dbSpin;
          const R = 1.85 * P;
          lx = dbX + Math.cos(a) * R;
          ly = (tier - 1) * 1.95 * P;
          lz = Math.sin(a) * R;
          sc = 0.175;
          const frontLed = slot === 3 || slot === 4;
          const blink = Math.sin(t * 3.0 + tier * 1.7 + slot) > 0.35;
          col = frontLed && blink ? (tier === 1 ? GOLD : EMERALD) : tier === 2 ? COBALT : tier === 1 ? NAVY : COBALT;
        } else if (k < 42) {
          // Solid top cylinder lid fill (6)
          const j = k - 36;
          if (j === 0) {
            lx = dbX;
            ly = 1.95 * P;
            lz = 0;
          } else {
            const a = ((j - 1) / 5) * Math.PI * 2 + dbSpin;
            lx = dbX + Math.cos(a) * 0.92 * P;
            ly = 1.95 * P;
            lz = Math.sin(a) * 0.92 * P;
          }
          sc = 0.175;
          col = j === 0 ? GOLD : COBALT;
        } else {
          // 6 dark-indigo tier-separator groove bands facing viewer
          const j = k - 42;
          const gapIdx = Math.floor(j / 3); // 0: between 0-1, 1: between 1-2
          const sub = (j % 3) - 1;
          const a = Math.PI * 0.5 + sub * 0.62 + dbSpin;
          const R = 1.55 * P;
          lx = dbX + Math.cos(a) * R;
          ly = (gapIdx === 0 ? -0.98 : 0.98) * P;
          lz = Math.sin(a) * R;
          sc = 0.16;
          col = sub === 0 ? EMERALD : INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.38, 0.22, 0, INDIGO], [-0.16, 0.22, 0, MAGENTA],
        [-0.38, 0, 0, WHITE], [-0.16, 0, 0, COBALT],
        [-0.08, -0.22, 0.08, EMERALD], [0.06, -0.28, 0.12, GOLD], [0.2, -0.22, 0.08, EMERALD],
        [0.34, 0.24, 0, COBALT], [0.34, 0.02, 0, NAVY], [0.34, -0.2, 0, COBALT],
        [0.48, 0.12, 0.1, COBALT], [0.48, -0.1, 0.1, EMERALD],
      ];
      const p = pts[slot];
      const ry = -0.18 + Math.sin(t * 0.45) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3. BRIDGE TOWERS — Glass UI Tower + Navy DB Tower Joined by Golden Suspension Bridge
     -------------------------------------------------------------------------- */
  "fs-s3-bridge-towers": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.21;
      const rotY = -0.2 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.16;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.18;
      let col = COBALT;

      if (i < 32) {
        // Left Glowing Glass UI Tower centered at x = -4.5*P
        if (i < 28) {
          const colIdx = Math.floor(i / 7); // 0..3 (4 vertical legs)
          const row = i % 7; // 0..6 -> y = -3.0..+3.6
          const xOff = colIdx % 2 === 0 ? -5.3 : -3.7;
          const zOff = colIdx < 2 ? 0.75 : -0.75;
          lx = xOff * P;
          ly = (-3.0 + row * 1.1) * P;
          lz = zOff * P;
          col = colIdx < 2 ? (row === 6 ? GOLD : row % 2 === 0 ? COBALT : EMERALD) : NAVY;
        } else {
          // 4 glowing UI interior glass cross-panels
          const k = i - 28;
          const ys = [-1.0, 0.5, 2.0, 3.6];
          const cols = [WHITE, EMERALD, MAGENTA, GOLD];
          lx = -4.5 * P;
          ly = ys[k % 4] * P;
          lz = 0;
          sc = 0.175;
          col = cols[k % 4];
        }
      } else if (i < 64) {
        // Right Deep-Navy Database Tower centered at x = +4.5*P
        const k = i - 32;
        if (k < 28) {
          const colIdx = Math.floor(k / 7);
          const row = k % 7;
          const xOff = colIdx % 2 === 0 ? 3.7 : 5.3;
          const zOff = colIdx < 2 ? 0.75 : -0.75;
          lx = xOff * P;
          ly = (-3.0 + row * 1.1) * P;
          lz = zOff * P;
          col = colIdx < 2 ? (row === 6 ? COBALT : row % 2 === 0 ? INDIGO : NAVY) : INDIGO;
        } else {
          const j = k - 28;
          const ys = [-1.0, 0.5, 2.0, 3.6];
          const blink = Math.sin(t * 2.8 + j * 1.4) > 0.3;
          lx = 4.5 * P;
          ly = ys[j % 4] * P;
          lz = 0;
          sc = 0.175;
          col = j === 3 ? GOLD : blink ? EMERALD : COBALT;
        }
      } else if (i < 86) {
        // 22-cube Dual-Lane Suspension Roadway Deck carrying bidirectional live data pulses
        const k = i - 64;
        const lane = Math.floor(k / 11); // 0: front (+Z, L->R), 1: back (-Z, R->L)
        const sIdx = k % 11;
        const xs = [-7.2, -6.3, -2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7, 6.3, 7.2];
        const gx = xs[sIdx];
        lx = gx * P;
        ly = -1.6 * P;
        lz = (lane === 0 ? 0.55 : -0.55) * P;
        const wave =
          lane === 0
            ? Math.sin(t * 3.4 - gx * 0.95)
            : Math.sin(t * 3.4 + gx * 0.95);
        const lit = wave > 0.62;
        sc = lit ? 0.19 : 0.165;
        col = lit ? (lane === 0 ? EMERALD : MAGENTA) : NAVY;
      } else if (i < 108) {
        // 22-cube Twin Sweeping Golden Catenary Cables (11 front + 11 back)
        const k = i - 86;
        const side = Math.floor(k / 11);
        const sIdx = k % 11;
        const xs = [-7.2, -6.3, -2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7, 6.3, 7.2];
        const gx = xs[sIdx];
        let gy = 0;
        if (Math.abs(gx) <= 3.0) {
          gy = -0.5 + 3.8 * (gx / 3.6) * (gx / 3.6);
        } else {
          gy = Math.abs(gx) > 6.7 ? -0.1 : 1.3;
        }
        lx = gx * P;
        ly = gy * P;
        lz = (side === 0 ? 0.75 : -0.75) * P;
        sc = 0.16;
        col = GOLD;
      } else {
        // 12-cube Vertical Golden Suspender Hangers (6 per side)
        const k = i - 108;
        const side = Math.floor(k / 6);
        const hIdx = k % 6;
        const hangers: Array<[number, number]> = [
          [-2.7, -0.52], [-2.7, 0.54], [-1.8, -0.58],
          [1.8, -0.58], [2.7, -0.52], [2.7, 0.54],
        ];
        const h = hangers[hIdx];
        lx = h[0] * P;
        ly = h[1] * P;
        lz = (side === 0 ? 0.75 : -0.75) * P;
        sc = 0.135;
        col = GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.22, 0, COBALT], [-0.36, 0.04, 0, EMERALD], [-0.36, 0.3, 0, GOLD],
        [0.36, -0.22, 0, INDIGO], [0.36, 0.04, 0, NAVY], [0.36, 0.3, 0, COBALT],
        [-0.18, -0.12, 0, NAVY], [0, -0.12, 0, EMERALD], [0.18, -0.12, 0, MAGENTA],
        [-0.18, 0.14, 0, GOLD], [0, 0.04, 0, GOLD], [0.18, 0.14, 0, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.16 + Math.sin(t * 0.45) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4. CUBE CUTAWAY — 3-Story Full-Stack Tower (UI Storefront / Emerald API Gear / Navy DB)
     -------------------------------------------------------------------------- */
  "fs-s3-cube-cutaway": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.225;
      const rotY = -0.35 + Math.sin(t * 0.32) * 0.26;
      const rotX = 0.18;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.19;
      let col = INDIGO;

      if (i < 48) {
        // 4 Architectural Floor/Roof Slabs (4 x 12 perimeter ring)
        const slab = Math.floor(i / 12); // 0:base, 1:f1-2, 2:f2-3, 3:roof
        const p = SLAB_RING_12[i % SLAB_RING_12.length];
        const ys = [-4.2, -1.4, 1.4, 4.2];
        const isCorner = Math.abs(p[0]) === 1.5 && Math.abs(p[1]) === 1.5;
        lx = p[0] * P;
        ly = ys[slab] * P;
        lz = p[1] * P;
        sc = 0.195;
        col =
          slab === 3
            ? isCorner
              ? GOLD
              : INDIGO
            : slab === 2
              ? COBALT
              : slab === 1
                ? NAVY
                : INDIGO;
      } else if (i < 72) {
        // 4 Corner Structural Pillars across 3 stories (24 cubes)
        const k = i - 48;
        const corner = Math.floor(k / 6); // 0..3
        const step = k % 6; // 0..1 story0, 2..3 story1, 4..5 story2
        const story = Math.floor(step / 2);
        const sub = step % 2;
        const cx = corner % 2 === 0 ? -1.5 : 1.5;
        const cz = corner < 2 ? -1.5 : 1.5;
        const yTable = [-3.27, -2.33, -0.47, 0.47, 2.33, 3.27];
        lx = cx * P;
        ly = yTable[step] * P;
        lz = cz * P;
        sc = 0.185;
        col = story === 2 ? COBALT : story === 1 ? NAVY : INDIGO;
        if (story === 2 && sub === 1 && cz > 0) col = GOLD;
      } else if (i < 88) {
        // Top Floor Interior (16): Bright Glass UI Storefront with window bars
        const k = i - 72;
        const uiPts: Array<[number, number, number, string]> = [
          // Front storefront header & window bars
          [-0.5, 3.27, 1.5, MAGENTA], [0.5, 3.27, 1.5, GOLD],
          [-0.5, 2.33, 1.5, COBALT], [0.5, 2.33, 1.5, EMERALD],
          // Glowing white UI canvas framed inside glass walls
          [-0.55, 3.27, 0.05, WHITE], [0.55, 3.27, 0.05, WHITE],
          [-0.55, 2.33, 0.05, WHITE], [0.55, 2.33, 0.05, WHITE],
          // Back cobalt UI glow panel
          [-0.55, 3.27, -1.1, COBALT], [0.55, 3.27, -1.1, COBALT],
          [-0.55, 2.33, -1.1, NAVY], [0.55, 2.33, -1.1, NAVY],
          // Side window mullions
          [-1.5, 2.8, -0.5, COBALT], [-1.5, 2.8, 0.5, MAGENTA],
          [1.5, 2.8, -0.5, COBALT], [1.5, 2.8, 0.5, GOLD],
        ];
        const u = uiPts[k % uiPts.length];
        lx = u[0] * P;
        ly = u[1] * P;
        lz = u[2] * P;
        sc = 0.175;
        col = u[3];
      } else if (i < 104) {
        // Middle Floor Interior (16): Rotating Glowing Emerald API Logic Gear
        const k = i - 88;
        const ga = t * 1.15;
        if (k === 0) {
          lx = 0;
          ly = 0;
          lz = 0.15 * P;
          sc = 0.17;
          col = GOLD;
        } else if (k < 7) {
          const a = ((k - 1) / 6) * Math.PI * 2 + ga;
          lx = Math.cos(a) * 0.56 * P;
          ly = Math.sin(a) * 0.56 * P;
          lz = 0.15 * P;
          sc = 0.115;
          col = EMERALD;
        } else if (k < 13) {
          const a = ((k - 7) / 6) * Math.PI * 2 + ga;
          lx = Math.cos(a) * 1.04 * P;
          ly = Math.sin(a) * 1.04 * P;
          lz = 0.15 * P;
          sc = 0.145;
          col = k % 2 === 0 ? EMERALD : GOLD;
        } else {
          // Back API bus mounts (3)
          const bPts: Array<[number, number, number, string]> = [
            [-0.55, 0, -1.35, COBALT], [0.55, 0, -1.35, COBALT], [0, 0, -0.85, NAVY],
          ];
          const b = bPts[(k - 13) % bPts.length];
          lx = b[0] * P;
          ly = b[1] * P;
          lz = b[2] * P;
          sc = 0.165;
          col = b[3];
        }
      } else {
        // Ground Floor Interior (16): Deep-Navy Cylindrical Vault Database (2 x 8 rings)
        const k = i - 104;
        const tier = Math.floor(k / 8); // 0, 1
        const slot = k % 8;
        const a = (slot / 8) * Math.PI * 2 + Math.sin(t * 0.6) * 0.2;
        const R = 0.92 * P;
        lx = Math.cos(a) * R;
        ly = (tier === 0 ? -3.27 : -2.33) * P;
        lz = Math.sin(a) * R;
        sc = 0.145;
        const isFront = slot === 2;
        const led = Math.sin(t * 3.2 + tier * 2.1) > 0.25;
        col = isFront ? (led ? GOLD : EMERALD) : slot % 2 === 0 ? NAVY : COBALT;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.2, -0.32, 0.12, INDIGO], [0.2, -0.32, 0.12, NAVY],
        [-0.2, -0.32, -0.12, NAVY], [0.2, -0.32, -0.12, COBALT],
        [-0.22, 0, 0, EMERALD], [0.22, 0, 0, EMERALD],
        [0, 0, 0.2, GOLD], [0, 0, -0.2, EMERALD],
        [-0.2, 0.32, 0.12, MAGENTA], [0.2, 0.32, 0.12, GOLD],
        [-0.2, 0.32, -0.12, COBALT], [0.2, 0.32, -0.12, WHITE],
      ];
      const p = pts[slot];
      const ry = -0.32 + Math.sin(t * 0.45) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.18);
      return { dx, dy, dz, rx: 0.18, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5. SCROLL PLAY — Framed Upright Script Document + Giant Glowing Emerald ▶ Play Button
     -------------------------------------------------------------------------- */
  "js-s3-scroll-play": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.22;
      const rotY = -0.16 + Math.sin(t * 0.32) * 0.16;
      const rotX = 0.15;
      const activeRow = Math.round(Math.sin(t * 1.55) * 2.5 + 0.5); // -2..3 ping-pong
      const playPulse = 1 + 0.06 * Math.sin(t * 2.6);

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.19;
      let col = INDIGO;

      if (i < 30) {
        // Upright dark-indigo document frame (8x9 perimeter)
        const p = SCROLL_FRAME_30[i % SCROLL_FRAME_30.length];
        lx = (p[0] - 0.3) * P;
        ly = p[1] * P;
        lz = 0;
        sc = 0.195;
        col = p[0] === 3 && p[1] === 4 ? GOLD : p[1] === 4 ? NAVY : INDIGO;
      } else if (i < 72) {
        // Crisp white paper face (6x7 = 42) strictly inside the indigo frame
        const k = i - 30;
        const c = (k % 6) - 3;
        const r = Math.floor(k / 6) - 3;
        lx = (c - 0.3) * P;
        ly = r * P;
        lz = -0.12 * P;
        sc = 0.195;
        col = WHITE;
      } else if (i < 94) {
        // 22 colorful syntax-highlighted code tokens
        const p = SCROLL_CODE_22[(i - 72) % SCROLL_CODE_22.length];
        const isLit = p[1] === activeRow;
        lx = (p[0] - 0.3) * P;
        ly = p[1] * P;
        lz = (isLit ? 0.92 : 0.7) * P;
        sc = isLit ? 0.18 : 0.16;
        col = isLit ? EMERALD : p[2];
      } else {
        // 26-cube Giant Glowing Emerald Circular ▶ Play/Run Button off bottom-right corner
        const k = i - 94;
        const cx = 2.55 * P;
        const cy = -2.45 * P;
        if (k < 16) {
          // 16-cube circular emerald badge ring
          const a = (k / 16) * Math.PI * 2 + t * 0.35;
          const R = 2.05 * P * playPulse;
          lx = cx + Math.cos(a) * R;
          ly = cy + Math.sin(a) * R;
          lz = 1.85 * P;
          sc = 0.155;
          col = EMERALD;
        } else if (k < 20) {
          // 4 inner dark backing fill tiles behind the white triangle
          const j = k - 16;
          const bx = j % 2 === 0 ? -0.62 : 0.62;
          const by = j < 2 ? -0.62 : 0.62;
          lx = cx + bx * P * playPulse;
          ly = cy + by * P * playPulse;
          lz = 1.32 * P;
          sc = 0.18;
          col = NAVY;
        } else {
          // 6-cube crisp WHITE ▶ Play Triangle nestled inside the emerald badge
          const tri: Array<[number, number]> = [
            [-0.65, -0.72], [-0.65, 0], [-0.65, 0.72],
            [0.05, -0.38], [0.05, 0.38],
            [0.75, 0],
          ];
          const tp = tri[(k - 20) % tri.length];
          lx = cx + tp[0] * P * playPulse;
          ly = cy + tp[1] * P * playPulse;
          lz = 2.08 * P;
          sc = 0.15;
          col = WHITE;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.26, 0.3, 0, INDIGO], [0.06, 0.3, 0, INDIGO],
        [-0.26, 0.04, 0, WHITE], [0.06, 0.04, 0, COBALT],
        [-0.26, -0.22, 0, INDIGO], [-0.04, -0.22, 0, MAGENTA],
        [-0.1, 0.18, 0.14, GOLD],
        [0.24, -0.02, 0.24, EMERALD], [0.24, -0.34, 0.24, EMERALD],
        [0.08, -0.18, 0.24, EMERALD], [0.4, -0.18, 0.24, EMERALD],
        [0.24, -0.18, 0.32, WHITE],
      ];
      const p = pts[slot];
      const ry = -0.15 + Math.sin(t * 0.45) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.15);
      return { dx, dy, dz, rx: 0.15, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6. TYPE BRACKETS — 3D <T> & { } Emblem in Dark-Slate IDE Card + Emerald Execution Sweep
     -------------------------------------------------------------------------- */
  "js-s3-type-brackets": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.215;
      const rotY = -0.15 + Math.sin(t * 0.3) * 0.16;
      const rotX = 0.14;
      const scanY = Math.sin(t * 1.45) * 3.1; // smooth ping-pong across IDE lines

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.18;
      let col = INDIGO;

      if (i < 36) {
        // Dark-slate IDE outer card frame (11x9 perimeter)
        const p = IDE_FRAME_36[i % IDE_FRAME_36.length];
        lx = p[0] * P;
        ly = p[1] * P;
        lz = -0.6 * P;
        sc = 0.19;
        col =
          p[1] === 4 && p[0] === -4
            ? ROSE
            : p[1] === 4 && p[0] === -3
              ? GOLD
              : p[1] === 4 && p[0] === -2
                ? EMERALD
                : INDIGO;
      } else if (i < 46) {
        // Line-number gutter (7) + header tab pills (3)
        const k = i - 36;
        if (k < 7) {
          lx = -4.0 * P;
          ly = (k - 3) * P;
          lz = -0.75 * P;
          sc = 0.175;
          col = NAVY;
        } else {
          const j = k - 7;
          lx = (-1.5 + j * 2.0) * P;
          ly = 3.1 * P;
          lz = -0.75 * P;
          sc = 0.17;
          col = NAVY;
        }
      } else if (i < 58) {
        // 12 Dark-slate IDE backplate interior tiles
        const k = i - 46;
        const c = (k % 4) - 1.5;
        const r = Math.floor(k / 4) - 1;
        lx = c * 2.1 * P;
        ly = r * 2.2 * P;
        lz = -0.82 * P;
        sc = 0.2;
        col = INDIGO;
      } else if (i < 81) {
        // 23-cube Bold 3D <T> Generic Type Emblem on upper half
        const p = GENERIC_T_23[(i - 58) % GENERIC_T_23.length];
        const near = Math.abs(p[1] - scanY) < 0.72;
        lx = p[0] * P;
        ly = p[1] * P;
        lz = (near ? 1.05 : 0.78) * P;
        sc = near ? 0.178 : 0.16;
        col = near ? EMERALD : p[2];
      } else if (i < 95) {
        // 14-cube Bold 3D { } Curly Braces on lower half
        const p = CURLY_BRACES_14[(i - 81) % CURLY_BRACES_14.length];
        const near = Math.abs(p[1] - scanY) < 0.72;
        lx = p[0] * P;
        ly = p[1] * P;
        lz = (near ? 1.05 : 0.82) * P;
        sc = near ? 0.178 : 0.16;
        col = near ? EMERALD : p[2];
      } else if (i < 110) {
        // 15 Inner Typed Code Tokens inside { } (3 rows x 5 cols)
        const k = i - 95;
        const c = (k % 5) - 2;
        const r = Math.floor(k / 5);
        const gy = -1.45 - r * 0.9;
        const near = Math.abs(gy - scanY) < 0.65;
        const palette = [COBALT, WHITE, GOLD, WHITE, COBALT];
        lx = c * 0.82 * P;
        ly = gy * P;
        lz = (near ? 0.8 : 0.45) * P;
        sc = near ? 0.16 : 0.14;
        col = near ? EMERALD : palette[k % palette.length];
      } else {
        // 10-cube Glowing Emerald Execution Highlight Scanner Bar
        const k = i - 110;
        lx = (k - 4.5) * 0.92 * P;
        ly = scanY * P;
        lz = 0.08 * P;
        sc = 0.15;
        col = EMERALD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const scanY = Math.sin(t * 1.6) * 0.24;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, 0.28, -0.06, INDIGO], [0.36, 0.28, -0.06, INDIGO],
        [-0.36, -0.28, -0.06, INDIGO], [0.36, -0.28, -0.06, INDIGO],
        [-0.28, 0.14, 0.12, COBALT], [0.28, 0.14, 0.12, COBALT],
        [0, 0.22, 0.14, GOLD], [0, 0.02, 0.14, GOLD],
        [-0.22, -0.18, 0.12, MAGENTA], [0.22, -0.18, 0.12, MAGENTA],
        [-0.12, scanY, 0.02, EMERALD], [0.12, scanY, 0.02, EMERALD],
      ];
      const p = pts[slot];
      const ry = -0.14 + Math.sin(t * 0.42) * 0.2;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.15);
      return { dx, dy, dz, rx: 0.15, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7. REPL CUBE — Split-Screen Code Editor + Terminal Output Bridged by Golden ▶ Run Arrow
     -------------------------------------------------------------------------- */
  "js-s3-repl-cube": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.21;
      const rotY = -0.16 + Math.sin(t * 0.3) * 0.17;
      const rotX = 0.15;
      const runPulse = Math.sin(t * 2.5);
      const arrowPush = runPulse * 0.22 * P;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.18;
      let col = INDIGO;

      if (i < 52) {
        // Left Dark Code Editor Pane centered at x = -4.5*P
        const ex = -4.5;
        if (i < 22) {
          const f = PANE_FRAME_22[i % PANE_FRAME_22.length];
          lx = (ex + f[0]) * P;
          ly = f[1] * P;
          lz = 0;
          sc = 0.185;
          col =
            f[1] === 3 && f[0] === -1.5
              ? ROSE
              : f[1] === 3 && f[0] === -0.5
                ? GOLD
                : f[1] === 3 && f[0] === 0.5
                  ? EMERALD
                  : INDIGO;
        } else if (i < 42) {
          // 4x5 dark-navy editor backing
          const k = i - 22;
          const c = (k % 4) - 1.5;
          const r = Math.floor(k / 4) - 2;
          lx = (ex + c) * P;
          ly = r * P;
          lz = -0.15 * P;
          sc = 0.185;
          col = NAVY;
        } else {
          // 10 colored syntax lines popping forward
          const lines: Array<[number, number, string]> = [
            [-1.5, 2, MAGENTA], [-0.5, 2, COBALT], [0.5, 2, COBALT],
            [-1.0, 1, GOLD], [0.0, 1, WHITE], [1.0, 1, GOLD],
            [-1.0, 0, COBALT], [0.0, 0, EMERALD],
            [-1.5, -1, MAGENTA], [-0.5, -1, WHITE],
          ];
          const ln = lines[(i - 42) % lines.length];
          lx = (ex + ln[0]) * P;
          ly = ln[1] * P;
          lz = 0.68 * P;
          sc = 0.16;
          col = ln[2];
        }
      } else if (i < 104) {
        // Right Crisp Dark Terminal Output Pane centered at x = +4.5*P
        const k = i - 52;
        const tx = 4.5;
        if (k < 22) {
          const f = PANE_FRAME_22[k % PANE_FRAME_22.length];
          lx = (tx + f[0]) * P;
          ly = f[1] * P;
          lz = 0;
          sc = 0.185;
          col = f[1] === 3 && Math.abs(f[0]) < 2 ? COBALT : INDIGO;
        } else if (k < 42) {
          // 4x5 deep-indigo terminal interior
          const j = k - 22;
          const c = (j % 4) - 1.5;
          const r = Math.floor(j / 4) - 2;
          lx = (tx + c) * P;
          ly = r * P;
          lz = -0.15 * P;
          sc = 0.185;
          col = INDIGO;
        } else {
          // 10 crisp emerald '>' prompt + result lines
          const outPts: Array<[number, number, string]> = [
            // '>' chevron prompt top-left
            [-1.5, 2, EMERALD], [-0.8, 1.5, EMERALD], [-1.5, 1, EMERALD],
            // Result values
            [0.2, 1.5, WHITE], [1.1, 1.5, GOLD],
            [-1.3, 0, EMERALD], [-0.4, 0, EMERALD], [0.5, 0, EMERALD],
            [-1.3, -1.2, GOLD], [-0.4, -1.2, WHITE],
          ];
          const o = outPts[(k - 42) % outPts.length];
          const glow = runPulse > 0.35;
          lx = (tx + o[0]) * P;
          ly = o[1] * P;
          lz = (glow ? 0.82 : 0.65) * P;
          sc = glow ? 0.165 : 0.15;
          col = o[2];
        }
      } else {
        // 16-cube Center Glowing Golden ▶ Run Arrow Bridge
        const k = i - 104;
        if (k < 8) {
          // Bold ▶ run triangle
          const arrow: Array<[number, number]> = [
            [-0.6, -1.2], [-0.6, -0.4], [-0.6, 0.4], [-0.6, 1.2],
            [0.2, -0.8], [0.2, 0], [0.2, 0.8],
            [1.0, 0],
          ];
          const ap = arrow[k % arrow.length];
          lx = ap[0] * P + arrowPush;
          ly = ap[1] * P;
          lz = 0.58 * P;
          sc = 0.165;
          col = GOLD;
        } else if (k < 10) {
          // 2 energized trailing spark pips behind the arrow
          const s = k - 8;
          lx = -1.35 * P + arrowPush * 0.6;
          ly = (s === 0 ? -0.4 : 0.4) * P;
          lz = 0.58 * P;
          sc = 0.135;
          col = EMERALD;
        } else {
          // 6 upper & lower data-bus bridge rails connecting the two screens
          const j = k - 10;
          const top = j < 3;
          const step = (j % 3) - 1;
          const wave = Math.sin(t * 3.5 - step * 1.1) > 0.4;
          lx = step * 1.15 * P;
          ly = (top ? 2.35 : -2.35) * P;
          lz = 0;
          sc = 0.155;
          col = wave ? EMERALD : COBALT;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const push = Math.sin(t * 2.5) * 0.04;
      const pts: Array<[number, number, number, string]> = [
        [-0.4, 0.22, 0, INDIGO], [-0.24, 0.22, 0, MAGENTA],
        [-0.4, -0.06, 0, NAVY], [-0.24, -0.06, 0, COBALT],
        [-0.06 + push, 0.16, 0.12, GOLD], [-0.06 + push, -0.02, 0.12, GOLD],
        [0.08 + push, 0.07, 0.12, GOLD], [0, -0.24, 0, COBALT],
        [0.24, 0.22, 0, INDIGO], [0.4, 0.22, 0, COBALT],
        [0.24, -0.06, 0, EMERALD], [0.4, -0.06, 0, WHITE],
      ];
      const p = pts[slot];
      const ry = -0.16 + Math.sin(t * 0.45) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.15);
      return { dx, dy, dz, rx: 0.15, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     8. ARCADE CABINET — Retro Upright Cabinet, Golden Marquee, Tetris LCD & Joystick Deck
     -------------------------------------------------------------------------- */
  "games-s3-arcade-cabinet": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.21;
      const rotY = -0.38 + Math.sin(t * 0.34) * 0.28;
      const rotX = 0.14;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.185;
      let col = INDIGO;

      if (i < 40) {
        // Sculpted Left & Right Side Silhouettes (20 + 20)
        const side = i < 20 ? -1 : 1;
        const p = ARCADE_SIDE_20[i % ARCADE_SIDE_20.length];
        lx = side * 2.25 * P;
        ly = p[0] * P;
        lz = p[1] * P;
        sc = 0.19;
        col = p[2];
      } else if (i < 55) {
        // Glowing Golden Top Marquee Box (10) + Roof Cap (5)
        const k = i - 40;
        if (k < 10) {
          const c = (k % 5) - 2;
          const r = Math.floor(k / 5); // 0, 1
          const twinkle = Math.sin(t * 4.2 + c * 1.1) > 0.65;
          lx = c * 0.82 * P;
          ly = (3.15 + r * 0.82) * P;
          lz = 1.05 * P;
          sc = 0.165;
          col = r === 1 && Math.abs(c) <= 1 && twinkle ? WHITE : c === 0 && r === 0 ? MAGENTA : GOLD;
        } else {
          const c = (k - 10) - 2;
          lx = c * 0.82 * P;
          ly = 4.15 * P;
          lz = -0.55 * P;
          sc = 0.175;
          col = INDIGO;
        }
      } else if (i < 79) {
        // 24-cube Bright Emerald/Magenta/Gold Tetris Puzzle LCD Screen
        const k = i - 55;
        if (k < 16) {
          // 4x4 angled CRT LCD grid
          const c = (k % 4) - 1.5;
          const r = Math.floor(k / 4); // 0..3 -> y = 0.15..2.5
          const gy = 0.15 + r * 0.78;
          lx = c * 0.86 * P;
          ly = gy * P;
          lz = (0.15 - (gy - 1.2) * 0.22) * P;
          sc = 0.162;
          const gridCols = [
            EMERALD, EMERALD, GOLD, COBALT,
            MAGENTA, EMERALD, GOLD, COBALT,
            INDIGO, MAGENTA, INDIGO, COBALT,
            INDIGO, INDIGO, INDIGO, INDIGO,
          ];
          col = gridCols[k % gridCols.length];
        } else if (k < 20) {
          // 4-cube active falling T-tetromino oscillating smoothly up & down
          const j = k - 16;
          const drop = Math.sin(t * 1.9) * 0.55;
          const piece: Array<[number, number]> = [
            [-0.43, 2.05], [0.43, 2.05], [1.29, 2.05], [0.43, 1.3],
          ];
          const pp = piece[j % piece.length];
          const gy = pp[1] + drop * 0.65;
          lx = pp[0] * P;
          ly = gy * P;
          lz = (0.68 - (gy - 1.2) * 0.22) * P;
          sc = 0.15;
          col = MAGENTA;
        } else {
          // 4 top/bottom CRT monitor bezel bars
          const j = k - 20;
          lx = (j % 2 === 0 ? -0.9 : 0.9) * P;
          ly = (j < 2 ? -0.45 : 2.95) * P;
          lz = 0.2 * P;
          sc = 0.165;
          col = NAVY;
        }
      } else if (i < 100) {
        // 21-cube Tilted Control Deck + Joystick + Bright Arcade Buttons
        const k = i - 79;
        if (k < 10) {
          // 5x2 angled control deck surface
          const c = (k % 5) - 2;
          const row = Math.floor(k / 5); // 0:back, 1:front
          lx = c * 0.82 * P;
          ly = (row === 0 ? -0.88 : -1.18) * P;
          lz = (row === 0 ? 1.0 : 1.82) * P;
          sc = 0.168;
          col = row === 0 ? INDIGO : NAVY;
        } else if (k < 13) {
          // Left joystick shaft + wiggling bright magenta ball top
          const j = k - 10;
          const wX = Math.cos(t * 3.1) * 0.18 * (j * 0.55);
          const wZ = Math.sin(t * 3.1) * 0.18 * (j * 0.55);
          lx = (-1.1 + wX) * P;
          ly = (-0.52 + j * 0.34) * P;
          lz = (1.52 + wZ) * P;
          sc = j === 2 ? 0.175 : 0.11;
          col = j === 2 ? MAGENTA : WHITE;
        } else if (k < 17) {
          // 4 bright arcade buttons pressing smoothly
          const j = k - 13;
          const press = Math.max(0, Math.sin(t * 3.6 + j * 1.5)) * 0.14;
          const btns: Array<[number, number, string]> = [
            [0.25, 1.32, EMERALD], [1.05, 1.32, GOLD],
            [0.45, 1.92, COBALT], [1.25, 1.92, ROSE],
          ];
          const b = btns[j % btns.length];
          lx = b[0] * P;
          ly = (-0.64 - press) * P;
          lz = b[1] * P;
          sc = 0.135;
          col = b[2];
        } else {
          // 4 front control-deck lip trim
          const j = k - 17;
          lx = (j - 1.5) * 0.9 * P;
          ly = -1.68 * P;
          lz = 1.82 * P;
          sc = 0.16;
          col = j === 1 || j === 2 ? GOLD : COBALT;
        }
      } else {
        // 20-cube Lower Cabinet Front Panel + Glowing Coin Slots + Back Foot Brace
        const k = i - 100;
        if (k < 16) {
          const c = (k % 4) - 1.5;
          const r = Math.floor(k / 4); // 0..3 -> y = -2.15..-4.31
          lx = c * 0.9 * P;
          ly = (-2.15 - r * 0.72) * P;
          lz = 0.55 * P;
          sc = 0.165;
          const isCoin = r === 1 && (c === -0.5 || c === 0.5);
          col = isCoin ? ROSE : r === 0 ? NAVY : INDIGO;
        } else {
          const j = k - 16;
          lx = (j - 1.5) * 0.9 * P;
          ly = -4.3 * P;
          lz = -1.55 * P;
          sc = 0.175;
          col = INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.16, -0.34, 0, INDIGO], [0.16, -0.34, 0, INDIGO], [0, -0.34, -0.14, NAVY],
        [-0.18, -0.06, 0.18, NAVY], [0.18, -0.06, 0.18, GOLD], [-0.14, 0.08, 0.24, MAGENTA],
        [-0.14, 0.14, 0, EMERALD], [0.14, 0.14, 0, COBALT],
        [-0.14, 0.3, -0.06, GOLD], [0.14, 0.3, -0.06, MAGENTA],
        [-0.14, 0.44, 0.12, GOLD], [0.14, 0.44, 0.12, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.35 + Math.sin(t * 0.45) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.15);
      return { dx, dy, dz, rx: 0.15, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     9. JIGSAW WORDLE — 4-Piece Interlocking Jigsaw Puzzle Breathing Apart & Locking Together
     -------------------------------------------------------------------------- */
  "games-s3-jigsaw-wordle": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.235;
      const rotY = -0.18 + Math.sin(t * 0.34) * 0.22;
      const rotX = 0.18 + Math.cos(t * 0.28) * 0.06;

      // 4 identical 90-degree rotationally-symmetric interlocking puzzle quadrants (30 cubes each)
      const q = Math.floor(i / 30); // 0:TR(GOLD), 1:TL(EMERALD), 2:BL(COBALT), 3:BR(MAGENTA)
      const k = i % 30;
      const qCols = [GOLD, EMERALD, COBALT, MAGENTA];
      const baseCol = qCols[q % 4];

      // Smooth breathing separation & snug interlocking click (zero flyback!)
      const breathe = 0.5 - 0.5 * Math.cos(t * 1.35);
      const gap = breathe * breathe * 0.88 * P;
      const quadDirs: Array<[number, number]> = [
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ];
      const dir = quadDirs[q % 4];

      let u = 0;
      let v = 0;
      let lz = 0;
      let sc = 0.205;
      let col = baseCol;

      if (k < 25) {
        const pt = JIGSAW_Q0_FRONT_25[k % JIGSAW_Q0_FRONT_25.length];
        u = pt[0];
        v = pt[1];
        lz = 0;
        // Crisp single white center-badge pip strictly framed inside the 5x5 jewel color
        const isPip = u === 3.5 && v === 3.5;
        col = isPip ? WHITE : baseCol;
        if (isPip) lz = 0.18 * P;
      } else {
        // 5-cube dark-indigo 3D extrusion backing along each piece's outer corner
        const bp = JIGSAW_Q0_BACK_5[(k - 25) % JIGSAW_Q0_BACK_5.length];
        u = bp[0];
        v = bp[1];
        lz = -0.88 * P;
        sc = 0.2;
        col = INDIGO;
      }

      // Rotate (u, v) by q * 90 deg CCW so tabs fit neighbors' blanks with 100% precision!
      let gx = u;
      let gy = v;
      if (q === 1) {
        gx = -v;
        gy = u;
      } else if (q === 2) {
        gx = -u;
        gy = -v;
      } else if (q === 3) {
        gx = v;
        gy = -u;
      }

      const lx = gx * P + dir[0] * gap;
      const ly = gy * P + dir[1] * gap;
      const zLift = (q % 2 === 0 ? 1 : -1) * breathe * 0.16 * P;

      const [x, y, z] = rotateYX(lx, ly, lz + zLift, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const q = Math.floor(slot / 3);
      const k = slot % 3;
      const g = (0.5 - 0.5 * Math.cos(t * 1.4)) * 0.09;
      const cols = [GOLD, EMERALD, COBALT, MAGENTA];
      const base: Array<[number, number]> = [
        [0.18, 0.18], [0.18, 0.36], [0, 0.18],
      ];
      const b = base[k];
      let ux = b[0];
      let uy = b[1];
      const dirs: Array<[number, number]> = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
      if (q === 1) {
        ux = -b[1];
        uy = b[0];
      } else if (q === 2) {
        ux = -b[0];
        uy = -b[1];
      } else if (q === 3) {
        ux = b[1];
        uy = -b[0];
      }
      const lx = (ux + dirs[q][0] * g) * boost;
      const ly = (uy + dirs[q][1] * g) * boost;
      const ry = -0.15 + Math.sin(t * 0.45) * 0.22;
      const [dx, dy, dz] = rotateYX(lx, ly, 0, ry, 0.18);
      return { dx, dy, dz, rx: 0.18, ry, rz: 0, scale: sc, color: cols[q] };
    },
  },

  /* --------------------------------------------------------------------------
     10. CHESS CROWN — Sculpted 3D Golden Crowned Chess King on Tilted 4x4 Checkered Board
     -------------------------------------------------------------------------- */
  "games-s3-chess-crown": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const rotY = 0.52 + Math.sin(t * 0.32) * 0.28;
      const rotX = 0.34;
      const tileP = 0.33;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.2;
      let col = GOLD;

      if (i < 16) {
        // 4x4 Checkered Dark-Indigo & Pearl Chess Board
        const gx = (i % 4) - 1.5;
        const gz = Math.floor(i / 4) - 1.5;
        const isDark = ((i % 4) + Math.floor(i / 4)) % 2 === 0;
        lx = gx * tileP;
        ly = -1.16;
        lz = gz * tileP;
        sc = 0.29;
        col = isDark ? INDIGO : WHITE;
      } else if (i < 36) {
        // 20-cube Framed Dark-Navy Board Border Rim (strictly frames the pearl tiles!)
        const p = CHESS_BORDER_20[(i - 16) % CHESS_BORDER_20.length];
        const isCorner = Math.abs(p[0]) === 2.5 && Math.abs(p[1]) === 2.5;
        lx = p[0] * tileP;
        ly = -1.22;
        lz = p[1] * tileP;
        sc = 0.245;
        col = isCorner ? GOLD : NAVY;
      } else {
        // 84-cube Sculpted 3D Golden Crowned Chess King Trophy
        const k = i - 36;
        const kingSpin = t * 0.45;
        const hover = Math.sin(t * 1.4) * 0.04;

        if (k < 12) {
          // Wide circular golden plinth base
          const a = (k / 12) * Math.PI * 2 + kingSpin;
          lx = Math.cos(a) * 0.56;
          ly = -0.86 + hover;
          lz = Math.sin(a) * 0.56;
          sc = 0.205;
          col = GOLD;
        } else if (k < 16) {
          // Lower collar ring
          const a = ((k - 12) / 4) * Math.PI * 2 + Math.PI * 0.25 + kingSpin;
          lx = Math.cos(a) * 0.38;
          ly = -0.64 + hover;
          lz = Math.sin(a) * 0.38;
          sc = 0.195;
          col = GOLD;
        } else if (k < 48) {
          // 4 fluted turned-column body rings x 8 cubes
          const ring = Math.floor((k - 16) / 8); // 0..3
          const slot = (k - 16) % 8;
          const a = (slot / 8) * Math.PI * 2 + kingSpin;
          const radii = [0.36, 0.28, 0.26, 0.34];
          const ys = [-0.42, -0.2, 0.02, 0.25];
          const scs = [0.19, 0.175, 0.17, 0.185];
          lx = Math.cos(a) * radii[ring];
          ly = ys[ring] + hover;
          lz = Math.sin(a) * radii[ring];
          sc = scs[ring];
          col = ring === 2 && slot % 2 === 0 ? NAVY : GOLD;
        } else if (k < 56) {
          // Royal velvet gem collar (8 cubes)
          const slot = k - 48;
          const a = (slot / 8) * Math.PI * 2 + kingSpin;
          lx = Math.cos(a) * 0.42;
          ly = 0.49 + hover;
          lz = Math.sin(a) * 0.42;
          sc = 0.185;
          col = slot % 2 === 0 ? MAGENTA : COBALT;
        } else if (k < 68) {
          // Wide flared golden crown rim (12 cubes)
          const slot = k - 56;
          const a = (slot / 12) * Math.PI * 2 + kingSpin;
          lx = Math.cos(a) * 0.52;
          ly = 0.72 + hover;
          lz = Math.sin(a) * 0.52;
          sc = 0.19;
          col = GOLD;
        } else if (k < 76) {
          // 8 towering crenellated crown spires
          const slot = k - 68;
          const a = (slot / 8) * Math.PI * 2 + kingSpin;
          lx = Math.cos(a) * 0.5;
          ly = 0.96 + hover;
          lz = Math.sin(a) * 0.5;
          sc = 0.17;
          col = slot % 2 === 0 ? GOLD : EMERALD;
        } else {
          // Iconic Royal Cross Finial & Crown Center Orb (8 cubes)
          const j = k - 76;
          const crossPts: Array<[number, number, number, string]> = [
            [0, 0.44, 0, GOLD],
            [0, 0.68, 0, MAGENTA],
            [0, 0.94, 0, GOLD],
            [0, 1.16, 0, GOLD],
            [0, 1.38, 0, GOLD],
            [0, 1.6, 0, GOLD],
            [-0.22, 1.38, 0, GOLD],
            [0.22, 1.38, 0, GOLD],
          ];
          const cp = crossPts[j % crossPts.length];
          const c = Math.cos(kingSpin);
          const s = Math.sin(kingSpin);
          lx = cp[0] * c + cp[2] * s;
          ly = cp[1] + hover;
          lz = -cp[0] * s + cp[2] * c;
          sc = 0.175;
          col = cp[3];
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.2, -0.34, 0.2, INDIGO], [0.2, -0.34, 0.2, WHITE],
        [-0.2, -0.34, -0.2, WHITE], [0.2, -0.34, -0.2, INDIGO],
        [0, -0.14, 0, GOLD], [0, 0.06, 0, GOLD],
        [-0.16, 0.22, 0, GOLD], [0.16, 0.22, 0, GOLD],
        [0, 0.22, 0.14, MAGENTA], [0, 0.22, -0.14, EMERALD],
        [0, 0.4, 0, GOLD], [0, 0.4, 0.14, GOLD],
      ];
      const p = pts[slot];
      const ry = 0.45 + Math.sin(t * 0.45) * 0.26;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.3);
      return { dx, dy, dz, rx: 0.3, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     11. DOMINO CASCADE — 6 Glossy S-Curve Domino Tiles Tipping Forward & Rewinding Back Up
     -------------------------------------------------------------------------- */
  "chains-s3-domino-cascade": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const rotY = -0.22 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.28;

      // 6 dominoes x 20 cubes each = 120 cubes
      const d = Math.floor(i / 20); // 0..5
      const k = i % 20;
      const P = 0.172;

      // Sweeping S-curve placement in XZ ground plane
      const s = (d - 2.5) / 2.5; // -1..+1
      const baseX = s * 1.48;
      const baseY = -0.58;
      const baseZ = Math.sin(s * 2.15) * 0.58;

      // Forward tangent direction along the S-curve
      const tx = 1.48;
      const tz = Math.cos(s * 2.15) * 0.58 * 2.15;
      const tLen = Math.hypot(tx, tz) || 1;
      const fx = tx / tLen;
      const fz = tz / tLen;
      // Right vector (tile width axis) perpendicular to tangent in XZ
      const rxAxis = -fz;
      const rzAxis = fx;

      // Smooth C1-continuous forward cascade -> rewind-undo wave (ZERO % 1 flybacks!)
      const uWave = 0.5 + 0.5 * Math.sin(t * 0.88);
      const isRewinding = Math.cos(t * 0.88) < 0;
      const start = d * 0.115;
      const raw = Math.max(0, Math.min(1, (uWave - start) / 0.32));
      const fall = raw * raw * (3 - 2 * raw);
      const tip = fall * 1.0; // tilts forward up to ~57 deg along tangent

      const pipColors = [COBALT, EMERALD, GOLD, MAGENTA, ROSE, EMERALD];
      const tileAccent = pipColors[d % pipColors.length];
      const isActive = fall > 0.08 && fall < 0.92;

      // Local tile coordinates: u (width across right axis), v (height above pivot >= 0), w (forward thickness)
      let u = 0;
      let v = 0;
      let w = 0;
      let sc = 0.15;
      let col = INDIGO;

      if (k < 15) {
        // 3 wide x 5 tall glossy dark-indigo domino body with gleaming gold center divider
        const colIdx = (k % 3) - 1; // -1, 0, 1
        const rowIdx = Math.floor(k / 3); // 0..4
        u = colIdx * P;
        v = (rowIdx + 0.5) * P;
        w = 0;
        sc = 0.152;
        if (rowIdx === 2) {
          col = isActive ? (isRewinding ? MAGENTA : EMERALD) : GOLD;
        } else {
          col = Math.abs(colIdx) === 1 && (rowIdx === 0 || rowIdx === 4) ? NAVY : INDIGO;
        }
      } else {
        // 5 crisp jewel pips on front face (+w)
        const pIdx = k - 15;
        const pipCoords: Array<[number, number]> = [
          [-0.65, 4.05], [0.65, 3.35],
          [-0.65, 1.65], [0.65, 0.95],
          [0, d % 2 === 0 ? 3.7 : 1.3],
        ];
        const pp = pipCoords[pIdx % pipCoords.length];
        u = pp[0] * P;
        v = pp[1] * P;
        w = 0.88 * P;
        sc = 0.112;
        col = pIdx === 4 ? WHITE : tileAccent;
      }

      // Tip around the tile's bottom pivot (v = 0) along forward tangent (fx, fz)
      const cosT = Math.cos(tip);
      const sinT = Math.sin(tip);
      const vRot = v * cosT - w * sinT;
      const wRot = v * sinT + w * cosT;

      const lx = baseX + rxAxis * u + fx * wRot;
      const ly = baseY + vRot;
      const lz = baseZ + rzAxis * u + fz * wRot;

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, -tip * 0.65, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const d = Math.floor(slot / 2); // 6 mini dominoes
      const top = slot % 2 === 1;
      const s = (d - 2.5) / 2.5;
      const uWave = 0.5 + 0.5 * Math.sin(t * 0.95);
      const raw = Math.max(0, Math.min(1, (uWave - d * 0.115) / 0.32));
      const tip = raw * raw * (3 - 2 * raw) * 0.9;
      const bx = s * 0.42;
      const bz = Math.sin(s * 2.1) * 0.16;
      const cols = [COBALT, EMERALD, GOLD, MAGENTA, ROSE, GOLD];
      const lx = (bx + (top ? Math.sin(tip) * 0.2 : 0)) * boost;
      const ly = (-0.12 + (top ? Math.cos(tip) * 0.2 : 0)) * boost;
      const lz = bz * boost;
      const ry = -0.2 + Math.sin(t * 0.45) * 0.2;
      const [dx, dy, dz] = rotateYX(lx, ly, lz, ry, 0.26);
      return { dx, dy, dz, rx: 0.26, ry, rz: -tip * 0.6, scale: sc, color: top ? cols[d] : INDIGO };
    },
  },

  /* --------------------------------------------------------------------------
     12. MARBLE TRACK — Modular 3D Pipeline Marble Run with 3 Glowing Transform Arches
     -------------------------------------------------------------------------- */
  "chains-s3-marble-track": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const rotY = -0.22 + Math.sin(t * 0.3) * 0.2;
      const rotX = 0.24;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.165;
      let col = COBALT;

      if (i < 36) {
        // Left & Right Parallel Modular Track Rails (18 + 18)
        const rail = i < 18 ? -1 : 1;
        const k = i % 18;
        const u = k / 17;
        const pt = evalMarbleTrack(u);
        lx = pt.x + pt.nx * rail * 0.24;
        ly = pt.y;
        lz = pt.z + pt.nz * rail * 0.24;
        sc = 0.16;
        col = k % 2 === 0 ? INDIGO : COBALT;
      } else if (i < 52) {
        // 8 Cross-Tie Sleepers + 8 Vertical Support Pillars
        const k = i - 36;
        if (k < 8) {
          const u = (k + 0.5) / 8;
          const pt = evalMarbleTrack(u);
          lx = pt.x;
          ly = pt.y - 0.18;
          lz = pt.z;
          sc = 0.15;
          col = NAVY;
        } else {
          const j = k - 8;
          const postIdx = Math.floor(j / 2); // 0..3
          const tier = j % 2; // 0:bottom, 1:upper
          const postUs = [0.08, 0.36, 0.64, 0.92];
          const pt = evalMarbleTrack(postUs[postIdx % 4]);
          const topY = pt.y - 0.38;
          const botY = -1.22;
          lx = pt.x;
          ly = tier === 0 ? botY : (botY + topY) * 0.5;
          lz = pt.z;
          sc = 0.16;
          col = INDIGO;
        }
      } else if (i < 94) {
        // 3 Glowing Transformation Arches (3 x 14 = 42): COBALT -> EMERALD -> GOLD
        const k = i - 52;
        const archIdx = Math.floor(k / 14); // 0, 1, 2
        const slot = k % 14;
        const archUs = [0.18, 0.5, 0.82];
        const archCols = [COBALT, EMERALD, GOLD];
        const aCol = archCols[archIdx % 3];
        const pt = evalMarbleTrack(archUs[archIdx % 3]);

        let off = 0;
        let dy = 0;
        if (slot < 3) {
          // Left pillar (3)
          off = -0.44;
          dy = slot * 0.22;
          col = aCol;
        } else if (slot < 6) {
          // Right pillar (3)
          off = 0.44;
          dy = (slot - 3) * 0.22;
          col = aCol;
        } else if (slot < 11) {
          // Top semicircular arch (5)
          const ang = ((slot - 6) / 4) * (Math.PI * 0.76) + Math.PI * 0.12;
          off = Math.cos(ang) * 0.44;
          dy = 0.44 + Math.sin(ang) * 0.44;
          col = aCol;
        } else if (slot < 13) {
          // Left & right base foot anchors (2)
          off = slot === 11 ? -0.44 : 0.44;
          dy = -0.22;
          col = INDIGO;
        } else {
          // Top glowing keystone beacon (1)
          off = 0;
          dy = 1.08;
          col = archIdx === 1 ? WHITE : MAGENTA;
        }
        lx = pt.x + pt.nx * off;
        ly = pt.y + dy;
        lz = pt.z + pt.nz * off;
        sc = slot === 13 ? 0.145 : 0.16;
      } else if (i < 115) {
        // 3 Synchronized Glowing Monadic Orbs (3 x 7 = 21) ping-ponging smoothly without ever colliding!
        const k = i - 94;
        const orbIdx = Math.floor(k / 7); // 0, 1, 2
        const sub = k % 7;
        const uBase = 0.12 + 0.46 * (0.5 + 0.5 * Math.sin(t * 0.92));
        const isUndo = Math.cos(t * 0.92) < 0;
        const uOrb = uBase + orbIdx * 0.15; // strictly separated along track!
        const pt = evalMarbleTrack(uOrb);

        // Monadic type transformation color by track zone
        const orbCol =
          uOrb < 0.34 ? COBALT : uOrb < 0.66 ? EMERALD : GOLD;

        const offsets: Array<[number, number, number]> = [
          [0, 0, 0],
          [0.115, 0, 0], [-0.115, 0, 0],
          [0, 0.115, 0], [0, -0.115, 0],
          [0, 0, 0.115], [0, 0, -0.115],
        ];
        const o = offsets[sub % offsets.length];
        lx = pt.x + o[0];
        ly = pt.y + 0.22 + o[1];
        lz = pt.z + o[2];
        sc = sub === 0 ? 0.11 : 0.095;
        col = sub === 0 ? (isUndo ? MAGENTA : WHITE) : orbCol;
      } else {
        // 5 Start/End Modular Bumper Stops & Beacons
        const k = i - 115;
        const isEnd = k >= 2;
        const pt = evalMarbleTrack(isEnd ? 1.0 : 0.0);
        const side = isEnd ? (k - 3) * 0.24 : (k === 0 ? -0.24 : 0.24);
        lx = pt.x + pt.nx * side;
        ly = pt.y + (isEnd && k === 3 ? 0.22 : 0.08);
        lz = pt.z + pt.nz * side;
        sc = 0.155;
        col = isEnd ? GOLD : ROSE;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const uBase = 0.12 + 0.44 * (0.5 + 0.5 * Math.sin(t * 1.0));
      let lx = 0;
      let ly = 0;
      let lz = 0;
      let col = INDIGO;
      if (slot < 6) {
        const u = slot / 5;
        lx = (u - 0.5) * 0.78;
        ly = (0.5 - u) * 0.42;
        lz = Math.sin(u * Math.PI * 2) * 0.12;
        col = slot % 2 === 0 ? INDIGO : COBALT;
      } else if (slot < 9) {
        const aIdx = slot - 6;
        const us = [0.18, 0.5, 0.82];
        const cols = [COBALT, EMERALD, GOLD];
        const u = us[aIdx];
        lx = (u - 0.5) * 0.78;
        ly = (0.5 - u) * 0.42 + 0.24;
        lz = Math.sin(u * Math.PI * 2) * 0.12;
        col = cols[aIdx];
      } else {
        const oIdx = slot - 9;
        const u = uBase + oIdx * 0.16;
        lx = (u - 0.5) * 0.78;
        ly = (0.5 - u) * 0.42 + 0.1;
        lz = Math.sin(u * Math.PI * 2) * 0.12 + 0.08;
        col = u < 0.34 ? COBALT : u < 0.66 ? EMERALD : GOLD;
      }
      const ry = -0.2 + Math.sin(t * 0.45) * 0.22;
      const [dx, dy, dz] = rotateYX(lx * boost, ly * boost, lz * boost, ry, 0.22);
      return { dx, dy, dz, rx: 0.22, ry, rz: 0, scale: sc, color: col };
    },
  },

  /* --------------------------------------------------------------------------
     13. REWIND TAPE — Retro-Modern Dual-Reel History Cassette Tape + Golden ↺ Rewind Badge
     -------------------------------------------------------------------------- */
  "chains-s3-rewind-tape": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.21;
      const rotY = -0.16 + Math.sin(t * 0.32) * 0.18;
      const rotX = 0.16;
      const spin = t * 1.9;
      const badgeBob = Math.sin(t * 1.8) * 0.08 * P;

      let lx = 0;
      let ly = 0;
      let lz = 0;
      let sc = 0.185;
      let col = INDIGO;

      if (i < 32) {
        // Dark-violet/indigo cassette outer shell (11x7 perimeter)
        const p = CASSETTE_SHELL_32[i % CASSETTE_SHELL_32.length];
        const isScrew = Math.abs(p[0]) === 5 && Math.abs(p[1]) === 3;
        lx = p[0] * P;
        ly = p[1] * P;
        lz = 0;
        sc = 0.19;
        col = isScrew ? GOLD : INDIGO;
      } else if (i < 44) {
        // Bottom cassette tape-head trapezoid bump (7) + back shell ribs (5)
        const k = i - 32;
        if (k < 7) {
          const c = k - 3; // -3..3
          lx = c * P;
          ly = -3.85 * P;
          lz = 0.42 * P;
          sc = 0.18;
          col = Math.abs(c) === 2 ? INDIGO : NAVY;
        } else {
          const c = ((k - 7) - 2) * 2;
          lx = c * P;
          ly = -2.95 * P;
          lz = -0.88 * P;
          sc = 0.185;
          col = INDIGO;
        }
      } else if (i < 70) {
        // Classic White Label Stripe (9) + Retro Accent Stripe (9) + Window Cheeks (8)
        const k = i - 44;
        if (k < 9) {
          // Crisp white label stripe strictly inside the dark indigo cassette frame
          lx = (k - 4) * P;
          ly = 2.08 * P;
          lz = 0.22 * P;
          sc = 0.185;
          col = WHITE;
        } else if (k < 18) {
          // Bold retro magenta/rose/cobalt accent stripe below label
          const c = (k - 9) - 4;
          lx = c * P;
          ly = 1.16 * P;
          lz = 0.22 * P;
          sc = 0.185;
          col = c < -1 ? MAGENTA : c <= 1 ? ROSE : COBALT;
        } else {
          // Window side cheeks (6) + center dark window dividers (2)
          const chPts: Array<[number, number, string]> = [
            [-4, 0, NAVY], [-4, -1, NAVY], [-4, -2, NAVY],
            [4, 0, NAVY], [4, -1, NAVY], [4, -2, NAVY],
            [0, -0.1, INDIGO], [0, -1.8, INDIGO],
          ];
          const ch = chPts[(k - 18) % chPts.length];
          lx = ch[0] * P;
          ly = ch[1] * P;
          lz = 0.15 * P;
          sc = 0.18;
          col = ch[2];
        }
      } else if (i < 98) {
        // Twin Counter-Rotating Emerald (left) & Gold (right) Sprocket Reels (14 + 14)
        const k = i - 70;
        const isRight = k >= 14;
        const slot = k % 14;
        const rCx = (isRight ? 2.1 : -2.1) * P;
        const rCy = -0.88 * P;
        const aDir = isRight ? -spin : spin; // counter-rotating!
        const spoolCol = isRight ? GOLD : EMERALD;

        if (slot < 6) {
          // 6 inner sprocket hub teeth
          const a = (slot / 6) * Math.PI * 2 + aDir;
          lx = rCx + Math.cos(a) * 0.56 * P;
          ly = rCy + Math.sin(a) * 0.56 * P;
          lz = 0.42 * P;
          sc = 0.105;
          col = slot % 2 === 0 ? WHITE : INDIGO;
        } else {
          // 8 outer tape-spool ring cubes
          const a = ((slot - 6) / 8) * Math.PI * 2 + aDir;
          lx = rCx + Math.cos(a) * 1.12 * P;
          ly = rCy + Math.sin(a) * 1.12 * P;
          lz = 0.34 * P;
          sc = 0.165;
          col = spoolCol;
        }
      } else {
        // 22-cube Bold Floating `◀◀` Rewind Double-Chevron hovering cleanly above the cassette!
        const k = i - 98;
        const isSecond = k >= 11;
        const slot = k % 11;
        const slide = Math.sin(t * 2.6 - (isSecond ? 0.5 : 0)) * 0.24 * P;
        const chevCx = (isSecond ? 1.55 : -1.55) * P - slide;
        const chevCy = 5.15 * P + badgeBob;
        const chevPts: Array<[number, number]> = [
          // Crisp 11-cube solid left-pointing triangle `◀` (tip left, 5-tall base right)
          [-1.35, 0],
          [-0.55, -0.55], [-0.55, 0], [-0.55, 0.55],
          [0.25, -1.05], [0.25, -0.35], [0.25, 0.35], [0.25, 1.05],
          [1.05, -0.75], [1.05, 0], [1.05, 0.75],
        ];
        const cp = chevPts[slot % chevPts.length];
        lx = chevCx + cp[0] * P * 0.82;
        ly = chevCy + cp[1] * P * 0.82;
        lz = 0.32 * P;
        const pulse = Math.sin(t * 3.4 - (isSecond ? 1.0 : 0)) > 0.45;
        sc = pulse ? 0.172 : 0.156;
        col = isSecond ? GOLD : EMERALD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, 0.16, 0, INDIGO], [0.36, 0.16, 0, INDIGO],
        [-0.36, -0.22, 0, INDIGO], [0.36, -0.22, 0, INDIGO],
        [0, -0.28, 0.06, NAVY], [-0.14, 0.14, 0.06, WHITE],
        [0.14, 0.14, 0.06, MAGENTA], [0, -0.06, 0, INDIGO],
        [-0.18, -0.06, 0.12, EMERALD], [0.18, -0.06, 0.12, GOLD],
        [-0.1, 0.4, 0.08, GOLD], [0.1, 0.4, 0.08, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.15 + Math.sin(t * 0.45) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },
};
