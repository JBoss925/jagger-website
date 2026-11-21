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
// PRECOMPUTED NON-OVERLAPPING VOXEL TABLES (SEASON 2A — 12 CHALLENGERS)
// ============================================================================

const BLUEPRINT_WALLS_23: Array<[number, number]> = [
  [-3, 2], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2],
  [-3, -2], [-2, -2], [-1, -2], [1, -2], [2, -2],
  [-3, -1], [-3, 0], [-3, 1],
  [2, -1], [2, 0], [2, 1],
  [-1, 1], [-1, 0], [0, 0], [1, 0], [-2, -1], [1, 1],
];

const HARDHAT_DOME_58: Array<{ x: number; y: number; z: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; col: string }> = [];
  const ring16: Array<[number, number]> = [
    [-1, 3], [0, 3], [1, 3], [-1, -3], [0, -3], [1, -3],
    [-2, 2], [2, 2], [-2, -2], [2, -2],
    [-3, 1], [3, 1], [-3, -1], [3, -1], [-3, 0], [3, 0],
  ];
  ring16.forEach(([x, z]) => pts.push({ x, y: 0, z, col: GOLD }));
  ring16.forEach(([x, z]) =>
    pts.push({ x, y: 1, z, col: x === 0 && z === 3 ? INDIGO : GOLD }),
  );
  const ring12: Array<[number, number]> = [
    [-1, 2], [0, 2], [1, 2], [-1, -2], [0, -2], [1, -2],
    [-2, 1], [2, 1], [-2, -1], [2, -1], [-2, 0], [2, 0],
  ];
  ring12.forEach(([x, z]) =>
    pts.push({ x, y: 2, z, col: x === 0 && z === 2 ? COBALT : GOLD }),
  );
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      pts.push({ x, y: 3, z, col: GOLD });
    }
  }
  pts.push({ x: 0, y: 3, z: -2, col: GOLD }, { x: 0, y: 3, z: 2, col: GOLD });
  pts.push(
    { x: 0, y: 4, z: -1, col: GOLD },
    { x: 0, y: 4, z: 0, col: GOLD },
    { x: 0, y: 4, z: 1, col: GOLD },
  );
  return pts; // 58
})();

const HARDHAT_BRIM_22: Array<{ x: number; y: number; z: number; col: string }> = [
  { x: -2, y: 0, z: 4, col: GOLD }, { x: -1, y: 0, z: 4, col: GOLD }, { x: 0, y: 0, z: 4, col: GOLD },
  { x: 1, y: 0, z: 4, col: GOLD }, { x: 2, y: 0, z: 4, col: GOLD },
  { x: -1, y: 0, z: 5, col: GOLD }, { x: 0, y: 0, z: 5, col: GOLD }, { x: 1, y: 0, z: 5, col: GOLD },
  { x: -3, y: 0, z: 2, col: GOLD }, { x: 3, y: 0, z: 2, col: GOLD },
  { x: -4, y: 0, z: 1, col: GOLD }, { x: 4, y: 0, z: 1, col: GOLD },
  { x: -4, y: 0, z: 0, col: GOLD }, { x: 4, y: 0, z: 0, col: GOLD },
  { x: -4, y: 0, z: -1, col: GOLD }, { x: 4, y: 0, z: -1, col: GOLD },
  { x: -3, y: 0, z: -2, col: GOLD }, { x: 3, y: 0, z: -2, col: GOLD },
  { x: -1, y: 0, z: -4, col: GOLD }, { x: 0, y: 0, z: -4, col: GOLD }, { x: 1, y: 0, z: -4, col: GOLD },
  { x: 0, y: 1, z: 4, col: COBALT },
];

const LAMBDA_22: Array<[number, number]> = [
  [-7, 4], [-6, 4],
  [-6, 3], [-5, 3],
  [-5, 2], [-4, 2],
  [-5, 1], [-4, 1],
  [-5, 0], [-4, 0], [-3, 0],
  [-6, -1], [-5, -1], [-6, -2], [-7, -2], [-7, -3], [-6, -3],
  [-3, -1], [-2, -1], [-3, -2], [-2, -2], [-2, -3],
];

const BOLT_17: Array<[number, number]> = [
  [1, 4], [2, 4],
  [0, 3], [1, 3],
  [-1, 2], [0, 2],
  [-2, 1], [-1, 1],
  [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],
  [0, -1], [1, -1],
  [-1, -2],
  [-2, -3],
];

const DOLLAR_16: Array<[number, number]> = [
  [-1, 7], [0, 7], [1, 7], [2, 7],
  [-2, 6], [0, 6],
  [-1, 5], [0, 5], [1, 5],
  [0, 4], [2, 4],
  [-2, 3], [-1, 3], [0, 3], [1, 3],
  [0, 8],
];

// ============================================================================
// SEASON 2 PART A — 12 CHALLENGERS
// ============================================================================
export const VARIANTS_SEASON2_A: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1. H2 CORPORATION — Rolled Blueprint Sheet + Floor Plan + Divider & AI Magnifier!
     -------------------------------------------------------------------------- */
  "h2-blueprint-compass": {
    hero(idx, _count, t) {
      const P = 0.24;
      const rotY = -0.2 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.18;
      const dx = 1.1 + 0.85 * Math.sin(t * 1.1);
      const dy = 0.3 + 0.85 * Math.cos(t * 0.85);
      const spread = 1 + 0.1 * Math.sin(t * 1.4);
      let lx = 0, ly = 0, lz = 0, sc = 0.21, col = COBALT;

      if (idx < 56) {
        const c = (idx % 8) - 4; // -4..3
        const r = Math.floor(idx / 8) - 3; // -3..3
        const isBorder = c === -4 || c === 3 || r === -3 || r === 3;
        lx = c * P;
        ly = r * P;
        lz = 0;
        col = isBorder ? NAVY : COBALT;
      } else if (idx < 77) {
        // Rolled right scroll edge (3 strips x 7 rows = 21)
        const j = idx - 56;
        const strip = Math.floor(j / 7);
        const r = (j % 7) - 3;
        lx = (strip === 1 ? 5 : 4) * P;
        ly = r * P;
        lz = (strip === 0 ? 1 : strip === 2 ? -1 : 0) * P;
        col = strip === 0 ? COBALT : strip === 1 ? NAVY : INDIGO;
      } else if (idx < 100) {
        // 23 Crisp White Floor-Plan Walls strictly framed over COBALT!
        const w = BLUEPRINT_WALLS_23[idx - 77];
        const near = Math.hypot(w[0] - dx, w[1] - dy) < 1.35;
        lx = w[0] * P;
        ly = w[1] * P;
        lz = 0.85 * P;
        sc = near ? 0.205 : 0.175;
        col = near ? EMERALD : WHITE;
      } else if (idx < 111) {
        // 11-cube Golden Drafting Divider on left
        const k = idx - 100;
        const pts: Array<[number, number, string]> = [
          [0, 2.8, INDIGO], [0, 1.9, GOLD],
          [-0.5 * spread, 1.0, GOLD], [-1.0 * spread, 0.1, GOLD], [-1.5 * spread, -0.8, GOLD], [-2.0 * spread, -1.7, INDIGO],
          [0.5 * spread, 1.0, GOLD], [1.0 * spread, 0.1, GOLD], [1.5 * spread, -0.8, GOLD], [2.0 * spread, -1.7, INDIGO],
          [0, 0.1, ROSE],
        ];
        const p = pts[k];
        lx = (-1.3 + p[0] * 0.65) * P;
        ly = (p[1] * 0.72) * P;
        lz = 2.0 * P;
        sc = 0.185;
        col = p[2];
      } else {
        // 9-cube AI Magnifier Lens scanning the floor plan!
        const k = idx - 111;
        if (k < 6) {
          const a = (k / 6) * Math.PI * 2 + t * 0.8;
          lx = (dx + Math.cos(a) * 0.95) * P;
          ly = (dy + Math.sin(a) * 0.95) * P;
          lz = 2.2 * P;
          sc = 0.18;
          col = k % 2 === 0 ? MAGENTA : EMERALD;
        } else if (k === 6) {
          lx = dx * P;
          ly = dy * P;
          lz = 2.0 * P;
          sc = 0.14;
          col = EMERALD;
        } else {
          const h = k - 7;
          lx = (dx + 1.45 + h * 0.7) * P;
          ly = (dy - 1.1 - h * 0.7) * P;
          lz = 2.2 * P;
          sc = 0.18;
          col = INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.24, 0, NAVY], [0, 0.24, 0, COBALT], [0.24, 0.24, 0, NAVY],
        [-0.24, 0, 0, COBALT], [0, 0, 0, WHITE], [0.24, 0, 0, COBALT],
        [-0.24, -0.24, 0, NAVY], [0, -0.24, 0, COBALT], [0.24, -0.24, 0, NAVY],
        [0.44, 0, 0.08, INDIGO],
        [-0.08, 0.1, 0.2, GOLD], [0.14, -0.1, 0.22, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.25, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.4) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2. H2 CORPORATION — Golden Construction Hard Hat Over Steel I-Beam!
     -------------------------------------------------------------------------- */
  "h2-hardhat-beam": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotX = 0.2;
      if (idx < 80) {
        const rotY = -0.22 + Math.sin(t * 0.7) * 0.26;
        const bob = Math.sin(t * 1.6) * 0.08;
        const p = idx < 58 ? HARDHAT_DOME_58[idx] : HARDHAT_BRIM_22[idx - 58];
        const [x, y, z] = rotateYX(p.x * P, (p.y + 0.65) * P + bob, p.z * P, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, 0.21, p.col);
      }
      // 40 cubes: Steel I-Beam below (16 top flange + 8 web + 16 bottom flange)
      const j = idx - 80;
      const rotY = -0.32 + Math.sin(t * 0.7 + Math.PI) * 0.08;
      let gx = 0, gy = -2.2, gz = 0, col = NAVY;
      if (j < 16) {
        gx = (j % 8) - 3.5;
        gy = -1.6;
        gz = j < 8 ? -0.55 : 0.55;
        col = Math.abs(gx) === 3.5 ? COBALT : NAVY;
      } else if (j < 24) {
        gx = (j - 16) - 3.5;
        gy = -2.6;
        gz = 0;
        col = INDIGO;
      } else {
        const k = j - 24;
        gx = (k % 8) - 3.5;
        gy = -3.6;
        gz = k < 8 ? -0.55 : 0.55;
        col = Math.abs(gx) === 3.5 ? COBALT : NAVY;
      }
      const [x, y, z] = rotateYX(gx * P, gy * P, gz * P, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, 0.205, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.22, 0.14, 0, GOLD], [0, 0.14, 0, GOLD], [0.22, 0.14, 0, GOLD],
        [0, 0.34, 0, GOLD], [0, 0.14, 0.22, GOLD], [0, 0.3, 0.18, COBALT],
        [-0.28, -0.14, 0, NAVY], [0, -0.14, 0, NAVY], [0.28, -0.14, 0, NAVY],
        [0, -0.3, 0, INDIGO], [-0.22, -0.44, 0, NAVY], [0.22, -0.44, 0, NAVY],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.25 + Math.sin(t * 0.5) * 0.25, 0.2);
      return { dx, dy, dz, rx: 0.2, ry: -0.25 + Math.sin(t * 0.5) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3. GOOGLE L4 — Stepped Industrial ETL Data Funnel + 3 Streams + Output DB Stack!
     -------------------------------------------------------------------------- */
  "gl4-server-funnel": {
    hero(idx, _count, t) {
      const P = 0.2;
      const rotY = t * 0.34;
      const rotX = 0.24;
      let lx = 0, ly = 0, lz = 0, sc = 0.18, col = NAVY;

      if (idx < 68) {
        // Stepped Circular Funnel Hopper (20 + 16 + 12 + 8 + 6 + 6 = 68)
        const rings: Array<{ n: number; r: number; y: number; c: string }> = [
          { n: 20, r: 3.5, y: 2.0, c: INDIGO },
          { n: 16, r: 2.8, y: 1.0, c: NAVY },
          { n: 12, r: 2.1, y: 0.0, c: NAVY },
          { n: 8, r: 1.45, y: -1.0, c: INDIGO },
          { n: 6, r: 1.0, y: -1.9, c: INDIGO },
          { n: 6, r: 1.0, y: -2.7, c: COBALT },
        ];
        let rem = idx;
        for (const rg of rings) {
          if (rem < rg.n) {
            const a = (rem / rg.n) * Math.PI * 2;
            lx = Math.cos(a) * rg.r * P;
            ly = rg.y * P;
            lz = Math.sin(a) * rg.r * P;
            col = rg.c;
            sc = rg.n === 6 ? 0.17 : 0.185;
            break;
          }
          rem -= rg.n;
        }
      } else if (idx < 86) {
        // 3 Incoming Colored Data Streams (6 stationary arc slots each = 18)
        const j = idx - 68;
        const st = Math.floor(j / 6);
        const slot = j % 6;
        const u = slot / 5;
        const az = [Math.PI * 1.15, -Math.PI * 0.15, Math.PI * 0.5][st];
        const r = (3.4 - 2.3 * u) * P;
        const wave = 0.85 + 0.25 * Math.sin(t * 4.0 - slot * 0.9 + st);
        lx = Math.cos(az) * r;
        ly = (5.3 - 3.6 * u) * P;
        lz = Math.sin(az) * r;
        sc = 0.165 * wave;
        col = [COBALT, EMERALD, GOLD][st];
      } else if (idx < 98) {
        // 3 Source Packet Clusters (4 cubes each = 12)
        const j = idx - 86;
        const st = Math.floor(j / 4);
        const sub = j % 4;
        const az = [Math.PI * 1.15, -Math.PI * 0.15, Math.PI * 0.5][st];
        const cx = Math.cos(az) * 3.5 * P;
        const cz = Math.sin(az) * 3.5 * P;
        const a = (sub / 4) * Math.PI * 2 + t * 1.6;
        lx = cx + Math.cos(a) * 0.24;
        ly = 5.6 * P + (sub % 2 === 0 ? 0.12 : -0.12);
        lz = cz + Math.sin(a) * 0.24;
        sc = 0.15;
        col = [COBALT, EMERALD, GOLD][st];
      } else {
        // 22 cubes: Nozzle drop + 3 stacked 7-cube organized DB discs!
        const j = idx - 98;
        if (j === 0) {
          lx = 0; ly = -3.0 * P; lz = 0; sc = 0.17; col = GOLD;
        } else {
          const k = j - 1; // 0..20 -> 3 discs x 7
          const disc = Math.floor(k / 7);
          const sub = k % 7;
          const dy = (-3.9 - disc * 1.0) * P;
          const pulse = 0.9 + 0.15 * Math.sin(t * 3.5 - disc * 1.1);
          if (sub === 0) {
            lx = 0; ly = dy; lz = 0; col = GOLD;
          } else {
            const a = ((sub - 1) / 6) * Math.PI * 2;
            lx = Math.cos(a) * 1.12 * P;
            ly = dy;
            lz = Math.sin(a) * 1.12 * P;
            col = [EMERALD, COBALT, INDIGO][disc];
          }
          sc = 0.175 * pulse;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.36, 0, COBALT], [0, 0.4, -0.12, GOLD], [0.24, 0.36, 0, EMERALD],
        [-0.26, 0.12, 0, INDIGO], [0.26, 0.12, 0, INDIGO], [0, 0.12, 0.22, NAVY], [0, 0.12, -0.22, NAVY],
        [0, -0.1, 0, NAVY],
        [-0.14, -0.32, 0, EMERALD], [0.14, -0.32, 0, COBALT], [0, -0.32, 0.14, GOLD], [0, -0.32, -0.14, INDIGO],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, t * 0.5, 0.22);
      return { dx, dy, dz, rx: 0.22, ry: t * 0.5, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4. GOOGLE L4 — Isometric Conveyor Belt + Central Transform Scanner Arch!
     -------------------------------------------------------------------------- */
  "gl4-conveyor-factory": {
    hero(idx, _count, t) {
      const P = 0.22;
      const rotY = -0.44 + Math.sin(t * 0.24) * 0.14;
      const rotX = 0.24;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = NAVY;

      if (idx < 36) {
        if (idx < 18) {
          // Side rails (9 x 2)
          const gx = (idx % 9) - 4;
          const gz = idx < 9 ? -2 : 2;
          lx = gx * P; ly = -1 * P; lz = gz * P; col = NAVY;
        } else if (idx < 26) {
          // 4 legs (2 tall each)
          const k = idx - 18;
          const leg = Math.floor(k / 2);
          const lvl = k % 2;
          lx = (leg < 2 ? -3.5 : 3.5) * P;
          ly = (-2 - lvl) * P;
          lz = (leg % 2 === 0 ? -2 : 2) * P;
          col = INDIGO;
        } else {
          // 2 End rollers (5 cubes each)
          const k = idx - 26;
          const side = k < 5 ? -5 : 5;
          const sub = k % 5;
          lx = side * P;
          ly = -1 * P;
          lz = (sub - 2) * P;
          col = sub === 0 || sub === 4 ? INDIGO : ROSE;
        }
      } else if (idx < 66) {
        // 30 Belt tread slats (10 cols x 3 rows) with smooth left-to-right ripple!
        const j = idx - 36;
        const c = (j % 10) - 4.5;
        const r = Math.floor(j / 10) - 1;
        const ripple = Math.sin(t * 4.5 - c * 1.1) * 0.025;
        lx = c * P;
        ly = -0.5 * P + ripple;
        lz = r * P;
        sc = 0.19;
        col = Math.floor(c + 5) % 2 === 0 ? INDIGO : NAVY;
      } else if (idx < 96) {
        // 30-cube Central Transform Scanner Arch!
        const j = idx - 66;
        if (j < 16) {
          // 4 pillar rows x 2 z-sides x 2 x-thickness
          const side = j < 8 ? -2 : 2;
          const k = j % 8;
          const gx = k % 2 === 0 ? -0.5 : 0.5;
          const gy = Math.floor(k / 2);
          lx = gx * P; ly = gy * P; lz = side * P;
          col = gy % 2 === 0 ? INDIGO : COBALT;
        } else if (j < 22) {
          // Top bridge (2 x 3)
          const k = j - 16;
          lx = (k < 3 ? -0.5 : 0.5) * P;
          ly = 3.6 * P;
          lz = ((k % 3) - 1) * P;
          col = k % 2 === 0 ? NAVY : COBALT;
        } else if (j < 25) {
          // Beacon crown
          const k = j - 22;
          lx = 0; ly = 4.5 * P; lz = (k - 1) * P;
          col = k === 1 ? EMERALD : GOLD;
        } else {
          // 5 glowing laser scanner curtain cubes
          const k = j - 25;
          const pulse = 0.8 + 0.3 * Math.sin(t * 5.0 + k);
          lx = 0;
          ly = (k < 3 ? 2.4 : 1.4) * P;
          lz = (k < 3 ? k - 1 : k === 3 ? -0.65 : 0.65) * P;
          sc = 0.15 * pulse;
          col = k < 3 ? MAGENTA : EMERALD;
        }
      } else {
        // 24 cubes: 6 Payload Crates (3 raw left -> 3 polished gold/emerald right!)
        const j = idx - 96;
        const crate = Math.floor(j / 4); // 0..5
        const sub = j % 4;
        const xs = [-3.8, -2.3, -0.95, 0.95, 2.3, 3.8];
        const wave = 0.9 + 0.16 * Math.sin(t * 3.4 - crate * 0.9);
        lx = xs[crate] * P;
        ly = (sub < 2 ? 0.55 : 1.35) * P;
        lz = (sub % 2 === 0 ? -0.42 : 0.42) * P;
        sc = 0.17 * wave;
        col = crate < 3 ? (sub % 2 === 0 ? COBALT : MAGENTA) : (sub % 2 === 0 ? GOLD : EMERALD);
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.18, 0, INDIGO], [-0.12, -0.18, 0, NAVY], [0.12, -0.18, 0, INDIGO], [0.36, -0.18, 0, NAVY],
        [0, 0.04, 0.2, NAVY], [0, 0.04, -0.2, NAVY], [0, 0.26, 0.08, COBALT], [0, 0.26, -0.08, MAGENTA],
        [-0.3, 0.06, 0, COBALT], [-0.3, 0.24, 0, ROSE],
        [0.3, 0.06, 0, GOLD], [0.3, 0.24, 0, EMERALD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.4 + Math.sin(t * 0.4) * 0.2, 0.24);
      return { dx, dy, dz, rx: 0.24, ry: -0.4 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5. LOWE'S — Crisp 3D Retail Barcode Label Swept by Crimson Laser Scanner!
     -------------------------------------------------------------------------- */
  "lowes-barcode-scanner": {
    hero(idx, _count, t) {
      const P = 0.22;
      const rotY = Math.sin(t * 0.45) * 0.24;
      const rotX = 0.14;
      const yScan = 2.0 * Math.sin(t * 1.9);
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = INDIGO;

      if (idx < 34) {
        // Indigo Price-Tag Bezel (11x7 outer rim = 32 + 2 top hang tabs)
        if (idx < 22) {
          lx = ((idx % 11) - 5) * P;
          ly = (idx < 11 ? 3 : -3) * P;
        } else if (idx < 32) {
          const k = idx - 22;
          lx = (k < 5 ? -5 : 5) * P;
          ly = ((k % 5) - 2) * P;
        } else {
          lx = (idx === 32 ? -1 : 1) * P;
          ly = 4 * P;
          col = NAVY;
        }
        lz = 0;
      } else if (idx < 79) {
        // 45 cubes: Solid Framed White Tag Face (9x5 strictly inside INDIGO frame!)
        const k = idx - 34;
        lx = ((k % 9) - 4) * P;
        ly = (Math.floor(k / 9) - 2) * P;
        lz = -0.05 * P;
        col = WHITE;
      } else if (idx < 105) {
        // 26 Raised 3D Barcode Bars with authentic UPC spacing!
        const bars: Array<[number, number, boolean]> = [];
        for (let r = -2; r <= 2; r++) bars.push([-4, r, true], [4, r, true]); // 10 guard bars
        for (let r = -1; r <= 2; r++) bars.push([-1, r, true], [2, r, true]); // 8 thick inner bars
        for (let r = -1; r <= 2; r++) bars.push([-2, r, false], [1, r, false]); // 8 thin inner bars
        const b = bars[idx - 79];
        const near = Math.abs(b[1] - yScan) < 0.65;
        lx = b[0] * P;
        ly = b[1] * P;
        lz = (near ? 1.1 : 0.85) * P;
        sc = b[2] ? 0.19 : 0.145;
        col = b[2] ? INDIGO : NAVY;
      } else {
        // 15 cubes: Glowing Crimson Laser Beam sweeping up and down across barcode!
        const k = idx - 105;
        if (k < 11) {
          lx = (k - 5) * P;
          ly = yScan * P;
          lz = 1.8 * P;
          sc = 0.15;
          col = MAGENTA;
        } else {
          const side = k < 13 ? -6 : 6;
          const isFront = k % 2 === 0;
          lx = side * P;
          ly = yScan * P;
          lz = (isFront ? 1.6 : 0.9) * P;
          sc = 0.19;
          col = isFront ? ROSE : INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const yScan = Math.sin(t * 2.2) * 0.22;
      if (slot < 9) {
        const c = (slot % 3) - 1;
        const r = Math.floor(slot / 3) - 1;
        const [dx, dy, dz] = rotateYX(c * 0.22 * boost, r * 0.22 * boost, 0, Math.sin(t * 0.45) * 0.25, 0.14);
        return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: c === 0 ? WHITE : INDIGO };
      }
      const k = slot - 9;
      const [dx, dy, dz] = rotateYX(((k - 1) * 0.26) * boost, yScan * boost, 0.22 * boost, Math.sin(t * 0.45) * 0.25, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc * 0.8, color: MAGENTA };
    },
  },

  /* --------------------------------------------------------------------------
     6. LOWE'S — Striped Scalloped Retail Storefront + Golden `$` Roof Sign!
     -------------------------------------------------------------------------- */
  "lowes-storefront": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = -0.26 + Math.sin(t * 0.35) * 0.18;
      const rotX = 0.16;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = NAVY;

      if (idx < 44) {
        if (idx < 18) {
          lx = ((idx % 9) - 4) * P;
          ly = -3.4 * P;
          lz = (idx < 9 ? 0 : 1) * P;
          col = idx < 9 ? INDIGO : NAVY;
        } else if (idx < 28) {
          const k = idx - 18;
          lx = (k < 5 ? -4 : 4) * P;
          ly = ((k % 5) - 2.4) * P;
          lz = 0;
          col = NAVY;
        } else if (idx < 35) {
          lx = (idx - 28 - 3) * P;
          ly = 1.6 * P;
          col = INDIGO;
        } else if (idx < 42) {
          lx = (idx - 35 - 3) * P;
          ly = 0.6 * P;
          col = NAVY;
        } else {
          lx = 1 * P;
          ly = (idx === 42 ? -2.4 : -1.4) * P;
          col = NAVY;
        }
      } else if (idx < 65) {
        // Lit display window + entrance door (21)
        const j = idx - 44;
        if (j < 12) {
          const c = (j % 4) - 3;
          const r = Math.floor(j / 4) - 2;
          lx = c * P;
          ly = (r - 0.4) * P;
          col = r === -2 ? INDIGO : r === -1 ? GOLD : c % 2 === 0 ? COBALT : WHITE;
        } else if (j === 12) {
          lx = -2 * P; ly = -1.4 * P; lz = 0.6 * P; col = MAGENTA; sc = 0.16;
        } else if (j === 13) {
          lx = 1 * P; ly = -0.4 * P; col = NAVY;
        } else if (j < 20) {
          const k = j - 14;
          lx = (2 + (k % 2)) * P;
          ly = (Math.floor(k / 2) - 2.4) * P;
          col = k >= 4 ? COBALT : ROSE;
        } else {
          lx = 2 * P; ly = -1.4 * P; lz = 0.8 * P; col = GOLD; sc = 0.14;
        }
      } else if (idx < 92) {
        // 27 Striped Scalloped Awning cubes (3 tiers x 9 cols)
        const j = idx - 65;
        const tier = Math.floor(j / 9); // 0 top, 1 mid, 2 valance
        const gx = (j % 9) - 4;
        const rip = tier === 2 ? Math.sin(t * 3.0 + gx * 0.8) * 0.025 : 0;
        lx = gx * P;
        ly = (tier === 0 ? 1.1 : tier === 1 ? 0.45 : -0.25) * P + rip;
        lz = (tier === 0 ? 1.0 : tier === 1 ? 1.85 : 2.05) * P;
        col = tier === 2 ? (gx % 2 === 0 ? COBALT : NAVY) : gx % 2 === 0 ? COBALT : WHITE;
      } else {
        // 28 cubes: Bold Golden `$` Roof Sign (16) + Struts (2) + Posts (2) + Rear Depth (8)
        const j = idx - 92;
        if (j < 16) {
          const dp = DOLLAR_16[j];
          const [sx, sy, sz] = rotateYX(dp[0] * P * 0.9, (dp[1] - 0.6) * P * 0.9, 0.3 * P, Math.sin(t * 1.2) * 0.2, 0);
          lx = sx;
          ly = sy;
          lz = sz;
          sc = 0.185;
          col = GOLD;
        } else if (j < 18) {
          lx = (j === 16 ? -1 : 1) * P;
          ly = 2.0 * P;
          lz = 0.5 * P;
          col = INDIGO;
        } else if (j < 20) {
          lx = (j === 18 ? -4 : 4) * P;
          ly = -1.6 * P;
          lz = 1.9 * P;
          col = INDIGO;
        } else {
          const k = j - 20;
          lx = (k < 4 ? -4 : 4) * P;
          ly = ((k % 4) - 2.4) * P;
          lz = -1 * P;
          col = INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.26, 0.14, 0.14, COBALT], [0, 0.14, 0.14, WHITE], [0.26, 0.14, 0.14, COBALT],
        [-0.24, -0.06, 0, GOLD], [0, -0.06, 0, NAVY], [0.24, -0.06, 0, ROSE],
        [-0.24, -0.26, 0, INDIGO], [0, -0.26, 0, INDIGO], [0.24, -0.26, 0, ROSE],
        [0, 0.38, 0, GOLD], [-0.16, 0.34, 0, INDIGO], [0.16, 0.34, 0, INDIGO],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.24 + Math.sin(t * 0.4) * 0.2, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: -0.24 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7. OJAML — Sculpted 3D Greek Lambda (`λ`) → Rotating WebAssembly Gear Chip!
     -------------------------------------------------------------------------- */
  "ojaml-lambda-wasm": {
    hero(idx, _count, t) {
      const P = 0.2;
      const rotY = -0.14 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.18, col = MAGENTA;

      if (idx < 44) {
        // 22-cube sculpted Lambda x 2 depth layers
        const isFront = idx < 22;
        const p = LAMBDA_22[idx % 22];
        const bob = Math.sin(t * 1.4) * 0.06;
        lx = (p[0] + 0.6) * P;
        ly = p[1] * P + bob;
        lz = (isFront ? 0.5 : -0.5) * P;
        sc = 0.185;
        col = !isFront ? INDIGO : MAGENTA;
      } else if (idx < 56) {
        // 12-cube Compile Arrow `→`
        const j = idx - 44;
        const arrowPts: Array<[number, number]> = [
          [-0.95, 0], [0.0, 0], [0.95, 0], [0.25, 0.85], [0.25, -0.85],
        ];
        if (j < 10) {
          const isFront = j < 5;
          const ap = arrowPts[j % 5];
          const pulse = 0.92 + 0.14 * Math.sin(t * 3.8 - ap[0] * 1.4);
          lx = ap[0] * P;
          ly = ap[1] * P;
          lz = (isFront ? 0.45 : -0.45) * P;
          sc = 0.18 * pulse;
          col = isFront ? GOLD : INDIGO;
        } else {
          lx = 1.45 * P;
          ly = 0;
          lz = (j === 10 ? 0.35 : -0.35) * P;
          sc = 0.16;
          col = GOLD;
        }
      } else {
        // 64 cubes: Rotating WASM Gear + Binary Silicon Core (centered cx = 5.2 * P)
        const j = idx - 56;
        const cx = 5.2 * P;
        const spin = -t * 0.85;
        if (j < 24) {
          const layer = j < 12 ? 0.5 : -0.5;
          const a = ((j % 12) / 12) * Math.PI * 2 + spin;
          lx = cx + Math.cos(a) * 2.1 * P;
          ly = Math.sin(a) * 2.1 * P;
          lz = layer * P;
          sc = 0.19;
          col = layer > 0 ? COBALT : NAVY;
        } else if (j < 40) {
          const k = j - 24;
          const layer = k < 8 ? 0.5 : -0.5;
          const a = ((k % 8) / 8) * Math.PI * 2 + spin;
          lx = cx + Math.cos(a) * 2.95 * P;
          ly = Math.sin(a) * 2.95 * P;
          lz = layer * P;
          sc = 0.19;
          col = layer > 0 ? COBALT : INDIGO;
        } else if (j < 58) {
          // 3x3x2 Inner Silicon Chip
          const k = j - 40;
          const layer = k < 9 ? 0.45 : -0.45;
          const sub = k % 9;
          const gx = (sub % 3) - 1;
          const gy = Math.floor(sub / 3) - 1;
          lx = cx + gx * 0.85 * P;
          ly = gy * 0.85 * P;
          lz = layer * P;
          sc = 0.155;
          col = gx === 0 && gy === 0 ? EMERALD : Math.abs(gx) === 1 && Math.abs(gy) === 1 ? GOLD : INDIGO;
        } else {
          // 6 blinking front binary bit cubes
          const k = j - 58;
          const blink = Math.sin(t * 3.5 + k * 1.4) > 0;
          lx = cx + ((k % 3) - 1) * 0.72 * P;
          ly = (k < 3 ? 0.55 : -0.55) * P;
          lz = 1.15 * P;
          sc = blink ? 0.135 : 0.105;
          col = k % 2 === 0 ? EMERALD : GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, 0.28, 0, GOLD], [-0.26, 0.1, 0, MAGENTA], [-0.36, -0.14, 0, MAGENTA], [-0.14, -0.14, 0, INDIGO], [-0.22, -0.26, 0, INDIGO],
        [0.02, 0.02, 0, GOLD],
        [0.32, 0, 0.06, EMERALD],
        [0.32, 0.22, 0, COBALT], [0.5, 0.08, 0, INDIGO], [0.44, -0.18, 0, COBALT], [0.2, -0.18, 0, INDIGO], [0.16, 0.08, 0, COBALT],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.24, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.24, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     8. OJAML — Type-Safe Compiler Machine (Scroll → Meshing 8:6 Gears → Output Cubes!)
     -------------------------------------------------------------------------- */
  "ojaml-gear-compiler": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = -0.14 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.16;
      const th1 = t * 0.9;
      const th2 = -t * 1.2 + Math.PI / 6;
      let lx = 0, ly = 0, lz = 0, sc = 0.185, col = COBALT;

      if (idx < 26) {
        // Left Input Code Scroll
        if (idx < 15) {
          const c = (idx % 3) - 6.5;
          const r = Math.floor(idx / 3) - 2;
          lx = c * P; ly = r * P; lz = 0;
          col = c === -5.5 && Math.abs(r) <= 1 ? NAVY : INDIGO;
        } else if (idx < 21) {
          const k = idx - 15;
          const wave = Math.sin(t * 3.0 - Math.floor(k / 2)) > 0.3;
          lx = (-6.0 + (k % 2) * 1.0) * P;
          ly = (1.2 - Math.floor(k / 2) * 1.2) * P;
          lz = 0.9 * P;
          sc = wave ? 0.17 : 0.145;
          col = [COBALT, GOLD, MAGENTA, EMERALD, GOLD, COBALT][k];
        } else if (idx < 25) {
          const k = idx - 21;
          lx = (k % 2 === 0 ? -6.5 : -4.5) * P;
          ly = (k < 2 ? 3 : -3) * P;
          lz = 0.4 * P;
          col = GOLD;
        } else {
          lx = -3.6 * P; ly = 0.7 * P; lz = 0; sc = 0.16; col = MAGENTA;
        }
      } else if (idx < 90) {
        // Two exact 8:6 interlocking Compiler Gears (38 + 26 = 64)
        const j = idx - 26;
        if (j < 38) {
          const cx = -0.7 * P, cy = 0.7 * P;
          if (j < 20) {
            const layer = j < 10 ? 0.45 : -0.45;
            const a = ((j % 10) / 10) * Math.PI * 2 + th1;
            lx = cx + Math.cos(a) * 1.65 * P;
            ly = cy + Math.sin(a) * 1.65 * P;
            lz = layer * P;
            col = layer > 0 ? COBALT : INDIGO;
          } else if (j < 36) {
            const k = j - 20;
            const layer = k < 8 ? 0.45 : -0.45;
            const a = ((k % 8) / 8) * Math.PI * 2 + th1;
            lx = cx + Math.cos(a) * 2.55 * P;
            ly = cy + Math.sin(a) * 2.55 * P;
            lz = layer * P;
            col = layer > 0 ? MAGENTA : ROSE;
          } else {
            lx = cx; ly = cy; lz = (j === 36 ? 0.45 : -0.45) * P; col = GOLD;
          }
        } else {
          const k = j - 38; // 26 cubes
          const cx = 1.9 * P, cy = -1.9 * P;
          if (k < 12) {
            const layer = k < 6 ? 0.45 : -0.45;
            const a = ((k % 6) / 6) * Math.PI * 2 + th2;
            lx = cx + Math.cos(a) * 1.12 * P;
            ly = cy + Math.sin(a) * 1.12 * P;
            lz = layer * P;
            col = GOLD;
          } else if (k < 24) {
            const m = k - 12;
            const layer = m < 6 ? 0.45 : -0.45;
            const a = ((m % 6) / 6) * Math.PI * 2 + th2;
            lx = cx + Math.cos(a) * 2.02 * P;
            ly = cy + Math.sin(a) * 2.02 * P;
            lz = layer * P;
            col = layer > 0 ? GOLD : ROSE;
          } else {
            lx = cx; ly = cy; lz = (k === 24 ? 0.45 : -0.45) * P; col = INDIGO;
          }
        }
      } else {
        // 30 cubes: 3 stacked 2x2x2 Compiled Artifact Blocks on right + rail + sparks!
        const j = idx - 90;
        if (j < 24) {
          const blk = Math.floor(j / 8); // 0 top, 1 mid, 2 bot
          const sub = j % 8;
          const by = (2.3 - blk * 2.3) * P + Math.sin(t * 2.0 - blk) * 0.08;
          const ox = (sub & 1 ? 0.48 : -0.48) * P;
          const oy = (sub & 2 ? 0.48 : -0.48) * P;
          const oz = (sub & 4 ? 0.48 : -0.48) * P;
          const [rxp, ryp, rzp] = rotateYX(ox, oy, oz, t * 0.8 + blk, 0.25);
          lx = 5.5 * P + rxp;
          ly = by + ryp;
          lz = rzp;
          sc = 0.175;
          col = [EMERALD, COBALT, GOLD][blk];
        } else if (j < 28) {
          lx = (-2 + (j - 24) * 2) * P;
          ly = -3.6 * P;
          lz = 0;
          col = INDIGO;
        } else {
          lx = 4.1 * P;
          ly = (j === 28 ? 1.2 : 0.0) * P;
          lz = 0;
          sc = 0.15;
          col = j === 28 ? EMERALD : GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.4, 0.12, 0, INDIGO], [-0.4, -0.12, 0, COBALT],
        [-0.08, 0.12, 0, GOLD], [-0.24, 0.12, 0, MAGENTA], [0.08, 0.12, 0, MAGENTA], [-0.08, 0.28, 0, MAGENTA], [-0.08, -0.04, 0, MAGENTA],
        [0.18, -0.16, 0, INDIGO], [0.32, -0.16, 0, GOLD], [0.18, -0.3, 0, GOLD],
        [0.44, 0.16, 0, EMERALD], [0.44, -0.1, 0, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.24, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.45) * 0.24, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     9. JAGGERSCRIPT — Retro-Modern Code Terminal Window (`>_` + Traffic Dots!)
     -------------------------------------------------------------------------- */
  "js-terminal-prompt": {
    hero(idx, _count, t) {
      const P = 0.22;
      const rotY = Math.sin(t * 0.4) * 0.2;
      const rotX = 0.14;
      const blink = 0.35 + 0.65 * Math.pow(Math.sin(t * 2.1), 2);
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = INDIGO;

      if (idx < 36) {
        // Window Frame (top 11 + bot 11 + sides 12 + 2 stand feet)
        if (idx < 11) {
          lx = (idx - 5) * P; ly = 3 * P; lz = 0.45 * P; col = NAVY;
        } else if (idx < 22) {
          lx = (idx - 11 - 5) * P; ly = -4 * P; lz = 0.45 * P; col = INDIGO;
        } else if (idx < 34) {
          const k = idx - 22;
          lx = (k < 6 ? -5 : 5) * P;
          ly = ((k % 6) - 3) * P;
          lz = 0.45 * P;
          col = INDIGO;
        } else {
          lx = (idx === 34 ? -3 : 3) * P;
          ly = -5 * P;
          lz = 0;
          col = NAVY;
        }
      } else if (idx < 90) {
        // Recessed Dark Terminal Screen Cavity (9x6 = 54)
        const k = idx - 36;
        lx = ((k % 9) - 4) * P;
        ly = (Math.floor(k / 9) - 3) * P;
        lz = -0.35 * P;
        sc = 0.205;
        col = INDIGO;
      } else {
        // 30 cubes: Traffic dots (3) + Title pill (3) + Giant `>` (10) + `_` & Blinking Block Cursor (8) + Output dots (6)!
        const k = idx - 90;
        if (k < 3) {
          lx = (-4 + k) * P; ly = 3 * P; lz = 1.25 * P; sc = 0.15;
          col = [MAGENTA, GOLD, EMERALD][k];
        } else if (k < 6) {
          lx = (1 + (k - 3)) * P; ly = 3 * P; lz = 1.15 * P; sc = 0.145; col = COBALT;
        } else if (k < 16) {
          const chev: Array<[number, number]> = [
            [-3, 2], [-2, 2], [-2, 1], [-1, 1], [-1, 0], [0, 0],
            [-2, -1], [-1, -1], [-3, -2], [-2, -2],
          ];
          const cp = chev[k - 6];
          const wave = Math.sin(t * 3.5 - cp[0]) > 0.5;
          lx = cp[0] * P; ly = cp[1] * P; lz = 0.65 * P;
          sc = wave ? 0.21 : 0.19;
          col = EMERALD;
        } else if (k < 24) {
          // `_` underscore (4) + blinking block cursor (4)
          const c = k - 16;
          if (c < 4) {
            lx = (1 + c) * P; ly = -2 * P; lz = 0.65 * P; sc = 0.19; col = GOLD;
          } else {
            const b = c - 4;
            lx = (2 + (b % 2)) * P;
            ly = (-1 + Math.floor(b / 2)) * P;
            lz = 0.65 * P;
            sc = 0.19 * blink;
            col = GOLD;
          }
        } else {
          const d = k - 24;
          const xs = [-3, -2, 0, 1, 3, 4];
          lx = xs[d] * P; ly = -3 * P; lz = 0.55 * P; sc = 0.135;
          col = d === 2 || d === 3 ? MAGENTA : COBALT;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.28, 0, MAGENTA], [0, 0.28, 0, GOLD], [0.24, 0.28, 0, EMERALD],
        [-0.24, 0.04, 0, INDIGO], [0, 0.04, 0, INDIGO], [0.24, 0.04, 0, INDIGO],
        [-0.24, -0.2, 0, INDIGO], [0, -0.2, 0, INDIGO], [0.24, -0.2, 0, INDIGO],
        [-0.18, 0.06, 0.2, EMERALD], [-0.04, -0.06, 0.2, EMERALD], [0.18, -0.08, 0.2, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.24, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.24, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     10. JAGGERSCRIPT — Script Page + Blazing Golden Lightning Bolt (`⚡`) & `< >`!
     -------------------------------------------------------------------------- */
  "js-lightning-script": {
    hero(idx, _count, t) {
      const P = 0.2;
      const rotY = Math.sin(t * 0.4) * 0.22;
      const rotX = 0.14;
      const breathe = Math.sin(t * 1.8) * 0.09;
      let lx = 0, ly = 0, lz = 0, sc = 0.175, col = COBALT;

      if (idx < 50) {
        // 7x7 Script Page with dog-ear corner (23 border + 25 cobalt sheet + 2 fold = 50)
        const pageCoords: Array<{ x: number; y: number; z: number; c: string }> = [];
        for (let r = -3; r <= 3; r++) {
          for (let c = -3; c <= 3; c++) {
            if (c === 3 && r === 3) continue;
            const isEdge = Math.abs(c) === 3 || Math.abs(r) === 3;
            pageCoords.push({ x: c, y: r, z: -0.6, c: isEdge ? INDIGO : COBALT });
          }
        }
        pageCoords.push(
          { x: 2.5, y: 2.5, z: -0.2, c: NAVY },
          { x: 2.0, y: 2.0, z: 0.25, c: COBALT },
        );
        const pc = pageCoords[idx % pageCoords.length];
        lx = pc.x * P; ly = pc.y * P; lz = pc.z * P; col = pc.c;
      } else if (idx < 60) {
        // 10 Framed Code Lines inside the COBALT sheet!
        const lines: Array<[number, number, string]> = [
          [-2, 2, WHITE], [-1, 2, WHITE], [2, 1, WHITE], [-2, -1, WHITE],
          [-2, -2, WHITE], [-1, -2, WHITE], [1, -2, WHITE], [2, -2, WHITE],
          [-2, 1, EMERALD], [2, -1, EMERALD],
        ];
        const l = lines[idx - 50];
        lx = l[0] * P; ly = l[1] * P; lz = 0.25 * P; sc = 0.15; col = l[2];
      } else if (idx < 94) {
        // 34 cubes: Blazing Golden Lightning Bolt `⚡` (17 x 2 depth layers)
        const j = idx - 60;
        const isFront = j < 17;
        const bp = BOLT_17[j % 17];
        const pulse = 0.92 + 0.16 * Math.sin(t * 5.2 + bp[1] * 0.9);
        lx = bp[0] * P;
        ly = bp[1] * P;
        lz = (isFront ? 1.75 : 1.05) * P;
        sc = 0.18 * pulse;
        col = isFront ? GOLD : ROSE;
      } else {
        // 26 cubes: Flanking `<` and `>` Angle Brackets (13 each!)
        const j = idx - 94;
        const isRight = j >= 13;
        const k = isRight ? j - 13 : j;
        const dir = isRight ? 1 : -1;
        const pts: Array<[number, number]> = [
          [4.5, 2.5], [5.5, 1.5], [6.5, 0.5], [6.5, -0.5], [5.5, -1.5], [4.5, -2.5],
        ];
        if (k < 12) {
          const isFront = k < 6;
          const p = pts[k % 6];
          lx = dir * (p[0] * P + breathe);
          ly = p[1] * P;
          lz = (isFront ? 0.85 : 0) * P;
          sc = 0.18;
          col = isFront ? MAGENTA : INDIGO;
        } else {
          lx = dir * (7.3 * P + breathe);
          ly = 0;
          lz = 0.45 * P;
          sc = 0.17;
          col = EMERALD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.12, 0.12, -0.08, COBALT], [0.12, 0.12, -0.08, COBALT],
        [-0.12, -0.12, -0.08, COBALT], [0.12, -0.12, -0.08, COBALT],
        [0.08, 0.3, 0.14, GOLD], [-0.08, 0.08, 0.14, GOLD], [0.08, -0.08, 0.14, GOLD], [-0.08, -0.3, 0.14, GOLD],
        [-0.36, 0.12, 0, INDIGO], [-0.36, -0.12, 0, MAGENTA], [0.36, 0.12, 0, INDIGO], [0.36, -0.12, 0, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     11. GENETICTS — 3D Rotating DNA Double Helix + Bullseye Target & Dart!
     -------------------------------------------------------------------------- */
  "gen-dna-helix": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = -0.14 + Math.sin(t * 0.25) * 0.14;
      const rotX = 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.185, col = EMERALD;

      if (idx < 77) {
        // 3D DNA Double Helix at cx = -2.3 * P (22 Strand 1 + 22 Strand 2 + 33 Base-Pair Rungs)
        const cx = -2.3 * P;
        const spin = t * 1.05;
        if (idx < 44) {
          const isStrand2 = idx >= 22;
          const i = idx % 22;
          const th = i * 0.48 + spin + (isStrand2 ? Math.PI : 0);
          lx = cx + Math.cos(th) * 2.1 * P;
          ly = (-5.25 + i * 0.5) * P;
          lz = Math.sin(th) * 2.1 * P;
          col = isStrand2 ? COBALT : EMERALD;
        } else {
          // 11 Base-pair rungs x 3 cubes = 33
          const j = idx - 44;
          const rung = Math.floor(j / 3); // 0..10
          const pos = (j % 3) - 1; // -1, 0, +1
          const i = rung * 2 + 1;
          const th = i * 0.48 + spin;
          const r = pos * 1.05 * P;
          const wave = 0.9 + 0.15 * Math.sin(t * 3.2 - rung * 0.6);
          lx = cx + Math.cos(th) * r;
          ly = (-5.25 + i * 0.5) * P;
          lz = Math.sin(th) * r;
          sc = 0.165 * wave;
          col = pos === 0 ? GOLD : pos < 0 ? INDIGO : MAGENTA;
        }
      } else {
        // 43 cubes: Bullseye Fitness Target + Dart on right (cx = +3.6 * P)
        const j = idx - 77;
        const cx = 3.6 * P;
        const cy = -0.2 * P + Math.sin(t * 1.5) * 0.06;
        if (j < 16) {
          const a = (j / 16) * Math.PI * 2;
          lx = cx + Math.cos(a) * 2.45 * P;
          ly = cy + Math.sin(a) * 2.45 * P;
          lz = 0;
          sc = 0.185;
          col = j % 2 === 0 ? MAGENTA : ROSE;
        } else if (j < 26) {
          const a = ((j - 16) / 10) * Math.PI * 2;
          lx = cx + Math.cos(a) * 1.55 * P;
          ly = cy + Math.sin(a) * 1.55 * P;
          lz = 0.15 * P;
          col = NAVY;
        } else if (j < 31) {
          const a = ((j - 26) / 5) * Math.PI * 2;
          lx = cx + Math.cos(a) * 0.8 * P;
          ly = cy + Math.sin(a) * 0.8 * P;
          lz = 0.3 * P;
          col = GOLD;
        } else if (j === 31) {
          lx = cx; ly = cy; lz = 0.5 * P; sc = 0.21; col = EMERALD;
        } else if (j < 39) {
          // Backing disc (7 + center)
          const k = j - 32;
          const a = (k / 7) * Math.PI * 2;
          lx = cx + (k === 0 ? 0 : Math.cos(a) * 1.3 * P);
          ly = cy + (k === 0 ? 0 : Math.sin(a) * 1.3 * P);
          lz = -0.65 * P;
          col = INDIGO;
        } else {
          // Dart planted dead-center in bullseye!
          const d = j - 39; // 0..3
          lx = cx + d * 0.35 * P;
          ly = cy + d * 0.35 * P;
          lz = (1.2 + d * 0.72) * P;
          sc = d === 3 ? 0.18 : 0.145;
          col = d === 3 ? EMERALD : GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      if (slot < 8) {
        const isS2 = slot >= 4;
        const k = slot % 4;
        const th = k * 1.1 + t * 1.4 + (isS2 ? Math.PI : 0);
        const [dx, dy, dz] = rotateYX((-0.24 + Math.cos(th) * 0.14) * boost, ((k - 1.5) * 0.2) * boost, Math.sin(th) * 0.14 * boost, 0.15, 0.14);
        return { dx, dy, dz, rx: 0.14, ry: 0.15, rz: 0, scale: sc, color: isS2 ? COBALT : EMERALD };
      }
      const k = slot - 8;
      const pts: Array<[number, number, string]> = [[0.28, 0, GOLD], [0.28, 0.2, MAGENTA], [0.46, -0.1, MAGENTA], [0.1, -0.1, MAGENTA]];
      const [dx, dy, dz] = rotateYX(pts[k][0] * boost, pts[k][1] * boost, 0, 0.15, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: 0.15, rz: 0, scale: sc, color: pts[k][2] };
    },
  },

  /* --------------------------------------------------------------------------
     12. GENETICTS — Darwinian 4-Step Fitness Staircase + Climbing Orbs + Golden Peak Crown!
     -------------------------------------------------------------------------- */
  "gen-evolution-tree": {
    hero(idx, _count, t) {
      const P = 0.22;
      const rotY = -0.22 + Math.sin(t * 0.3) * 0.16;
      const rotX = 0.18;
      const yOff = -0.8 * P;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = COBALT;

      if (idx < 23) {
        if (idx < 22) {
          lx = ((idx % 11) - 5) * P;
          ly = -4 * P + yOff;
          lz = (idx < 11 ? -0.5 : 0.5) * P;
          col = idx % 2 === 0 ? INDIGO : NAVY;
        } else {
          lx = 6 * P; ly = -4 * P + yOff; lz = 0; col = GOLD;
        }
      } else if (idx < 83) {
        // 60 cubes: 4 rising 2x2 fitness bar pillars (8 + 12 + 16 + 24 = 60)
        const j = idx - 23;
        const specs = [
          { count: 8, x0: -5, h: 2 },
          { count: 12, x0: -2, h: 3 },
          { count: 16, x0: 1, h: 4 },
          { count: 24, x0: 4, h: 6 },
        ];
        let rem = j;
        for (let gi = 0; gi < specs.length; gi++) {
          const sp = specs[gi];
          if (rem < sp.count) {
            const lvl = Math.floor(rem / 4);
            const sub = rem % 4;
            lx = (sp.x0 + (sub % 2)) * P;
            ly = (-3 + lvl) * P + yOff;
            lz = (sub < 2 ? -0.5 : 0.5) * P;
            col = gi === 0 ? NAVY : gi === 1 ? (lvl === 2 ? COBALT : NAVY) : gi === 2 ? COBALT : lvl >= 4 ? EMERALD : COBALT;
            break;
          }
          rem -= sp.count;
        }
      } else if (idx < 100) {
        // 17 Climbing Generation Orbs & Fitness Curve Beads
        const j = idx - 83;
        if (j < 3) {
          const b = Math.sin(t * 2.4) * 0.08;
          lx = (-4.5 + (j - 1) * 0.55) * P;
          ly = -0.6 * P + yOff + b;
          lz = (j === 1 ? 0.5 : -0.3) * P;
          sc = 0.15;
          col = [EMERALD, ROSE, COBALT][j];
        } else if (j < 7) {
          const k = j - 3;
          const b = Math.sin(t * 2.4 - 0.8) * 0.08;
          const a = (k / 4) * Math.PI * 2 + t;
          lx = -1.5 * P + Math.cos(a) * 0.45 * P;
          ly = 0.85 * P + yOff + b;
          lz = Math.sin(a) * 0.45 * P;
          sc = 0.155;
          col = k === 0 ? GOLD : EMERALD;
        } else if (j < 12) {
          const k = j - 7;
          const b = Math.sin(t * 2.4 - 1.6) * 0.08;
          const a = (k / 4) * Math.PI * 2 - t;
          lx = 1.5 * P + (k === 0 ? 0 : Math.cos(a) * 0.5 * P);
          ly = 1.9 * P + yOff + b;
          lz = k === 0 ? 0 : Math.sin(a) * 0.5 * P;
          sc = 0.15;
          col = k === 0 ? GOLD : EMERALD;
        } else {
          const k = j - 12; // 5 rising trend arc beads
          const u = k / 4;
          const pulse = 0.85 + 0.25 * Math.sin(t * 3.8 - k * 0.8);
          lx = (-3.2 + u * 6.4) * P;
          ly = (-0.5 + u * 3.4) * P + yOff;
          lz = 1.35 * P;
          sc = 0.14 * pulse;
          col = k % 2 === 0 ? GOLD : EMERALD;
        }
      } else {
        // 20 cubes: Spinning Golden Peak Crown above Gen 4!
        const j = idx - 100;
        const cx = 4.5 * P;
        const crownY = yOff + Math.sin(t * 2.0 - 2.4) * 0.08;
        const spin = t * 0.9;
        if (j < 8) {
          const a = (j / 8) * Math.PI * 2 + spin;
          lx = cx + Math.cos(a) * 1.15 * P;
          ly = 3.4 * P + crownY;
          lz = Math.sin(a) * 1.15 * P;
          sc = 0.17;
          col = GOLD;
        } else if (j < 14) {
          const a = ((j - 8) / 6) * Math.PI * 2 + spin;
          lx = cx + Math.cos(a) * 1.25 * P;
          ly = 4.25 * P + crownY;
          lz = Math.sin(a) * 1.25 * P;
          sc = 0.17;
          col = GOLD;
        } else if (j < 17) {
          const a = ((j - 14) / 3) * Math.PI * 2 + spin;
          lx = cx + Math.cos(a) * 1.15 * P;
          ly = 5.05 * P + crownY;
          lz = Math.sin(a) * 1.15 * P;
          sc = 0.17;
          col = GOLD;
        } else {
          const k = j - 17;
          const a = (k / 3) * Math.PI * 2 + spin;
          lx = cx + Math.cos(a) * 1.15 * P;
          ly = 5.8 * P + crownY;
          lz = Math.sin(a) * 1.15 * P;
          sc = 0.15;
          col = [MAGENTA, EMERALD, COBALT][k];
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.24, 0, NAVY], [-0.36, -0.02, 0, EMERALD],
        [-0.12, -0.24, 0, NAVY], [-0.12, -0.04, 0, COBALT], [-0.12, 0.18, 0, EMERALD],
        [0.12, -0.24, 0, NAVY], [0.12, -0.04, 0, COBALT], [0.12, 0.16, 0, EMERALD],
        [0.36, -0.24, 0, INDIGO], [0.36, -0.04, 0, COBALT], [0.36, 0.16, 0, EMERALD], [0.36, 0.38, 0, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.22 + Math.sin(t * 0.4) * 0.2, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: -0.22 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },
};
