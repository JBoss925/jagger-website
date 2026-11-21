import type { CubeTarget } from "./CubeFormations";
import type { PaletteSpec } from "./spatialModel";

export type MiniResult = {
  dx: number;
  dy: number;
  dz: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  color: string;
};

export type VariantEvaluator = {
  hero: (idx: number, count: number, t: number, pal: PaletteSpec) => CubeTarget;
  mini: (
    idx: number,
    cnt: number,
    t: number,
    boost: number,
    sc: number,
    pal: PaletteSpec,
  ) => MiniResult;
};

export function rotateYX(
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

// ============================================================================
// PRECOMPUTED CLEAN NON-OVERLAPPING VOXEL GEOMETRIES (PART B — 14 CONTENDERS)
// ============================================================================

// Shared crisp 3D Map Pin silhouette (28 non-overlapping cubes, 2 layers deep on ring)
const MAP_PIN_28: Array<{ x: number; y: number; z: number; role: "ring" | "tip" | "eye" }> = (() => {
  const art = [
    "01110",
    "11211",
    "11111",
    "01110",
    "00100",
    "00100",
  ];
  const pts: Array<{ x: number; y: number; z: number; role: "ring" | "tip" | "eye" }> = [];
  for (let r = 0; r < art.length; r++) {
    for (let c = 0; c < art[r].length; c++) {
      const ch = art[r][c];
      if (ch === "0") continue;
      const x = (c - 2) * 0.22;
      const y = (2.5 - r) * 0.22;
      const role = ch === "2" ? "eye" : r >= 4 ? "tip" : "ring";
      pts.push({ x, y, z: 0.1, role });
      if (pts.length < 28 && (role === "ring" || role === "tip")) {
        pts.push({ x, y, z: -0.1, role });
      }
    }
  }
  return pts.slice(0, 28);
})();

// Crisp 5-point Star emblem (18 cubes)
const STAR_18: Array<[number, number]> = [
  [0, 0.56],
  [-0.22, 0.22], [0, 0.22], [0.22, 0.22],
  [-0.58, 0.04], [-0.36, 0.04], [-0.14, 0.04], [0.14, 0.04], [0.36, 0.04], [0.58, 0.04],
  [-0.24, -0.18], [0, -0.18], [0.24, -0.18],
  [-0.36, -0.44], [-0.16, -0.44], [0.16, -0.44], [0.36, -0.44],
  [0, 0.04],
];

// ============================================================================
// PART B CONTENDERS (7 SUBJECTS × 2 CONTENDERS = 14 FULL SCULPTURES)
// ============================================================================
export const VARIANTS_PART_B: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1A. RED VENTURES — Launchpad Cloud Rocket (Rocket blasting out of cloud + plinth!)
     -------------------------------------------------------------------------- */
  "rv-rocket": {
    hero(idx, _count, t, pal) {
      const rotY = -0.26 + Math.sin(t * 0.3) * 0.2;
      const rotX = 0.2;
      const hoverY = Math.sin(t * 2.2) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = pal.primary;

      if (idx < 18) {
        // Dark-indigo server launchpad plinth (6 wide x 3 deep at y = -1.55)
        const c = (idx % 6) - 2.5;
        const d = Math.floor(idx / 6) - 1;
        lx = c * 0.32;
        ly = -1.56;
        lz = d * 0.32;
        sc = 0.27;
        col = d === 1 && Math.abs(c) <= 1.5 ? "#f0b94b" : "#3a2d6b";
      } else if (idx < 54) {
        // 36 cubes: Puffy 3-lobe cloud collar hugging the rocket exhaust (zero gap!)
        const j = idx - 18;
        const lobe = j < 12 ? -1 : j < 24 ? 1 : 0;
        const k = j % 12;
        const a = (k / 12) * Math.PI * 2;
        const breathe = 1 + Math.sin(t * 2.2 + Math.PI + lobe) * 0.06;
        const cx = lobe === 0 ? 0 : lobe * 0.78;
        const cy = lobe === 0 ? -0.96 : -1.04;
        const r = (lobe === 0 ? 0.64 : 0.48) * breathe;
        lx = cx + Math.cos(a) * r;
        ly = cy + (k % 2 === 0 ? 0.14 : -0.14);
        lz = Math.sin(a) * r * 0.72;
        sc = 0.26;
        col = k % 3 === 0 ? pal.light : pal.primary;
      } else if (idx < 66) {
        // 12 cubes: Glowing amber exhaust plume nestled inside the cloud collar
        const j = idx - 54;
        const tier = Math.floor(j / 4); // 0 top .. 2 bottom
        const sub = j % 4;
        const a = (sub / 4) * Math.PI * 2 + t * 2.4;
        const r = 0.16 + tier * 0.08;
        const wave = 0.8 + 0.25 * Math.sin(t * 5.2 - tier * 1.1);
        lx = Math.cos(a) * r;
        ly = -0.34 - tier * 0.24 + hoverY * 0.4;
        lz = Math.sin(a) * r;
        sc = 0.21 * wave;
        col = tier === 0 ? "#ffd166" : "#f59e0b";
      } else if (idx < 86) {
        // 20 cubes: Rocket fuselage (5 vertical rings x 4 cubes, crisp 2x2 column)
        const j = idx - 66;
        const ring = Math.floor(j / 4); // 0..4
        const sub = j % 4;
        const sx = sub % 2 === 0 ? -0.17 : 0.17;
        const sz = sub < 2 ? -0.17 : 0.17;
        lx = sx;
        ly = -0.14 + ring * 0.31 + hoverY;
        lz = sz;
        sc = 0.26;
        // Cyan porthole highlight on front of ring 2
        col = ring === 2 && sz > 0 ? "#5cc8ff" : ring % 2 === 0 ? "#f2ecff" : "#382c6e";
      } else if (idx < 96) {
        // 10 cubes: Tapered crimson nose cone (4 base + 4 mid + 2 tip)
        const j = idx - 86;
        if (j < 4) {
          lx = (j % 2 === 0 ? -0.15 : 0.15);
          ly = 1.42 + hoverY;
          lz = (j < 2 ? -0.15 : 0.15);
          sc = 0.23;
        } else if (j < 8) {
          const k = j - 4;
          lx = (k % 2 === 0 ? -0.09 : 0.09);
          ly = 1.66 + hoverY;
          lz = (k < 2 ? -0.09 : 0.09);
          sc = 0.18;
        } else {
          lx = 0;
          ly = 1.86 + (j - 8) * 0.15 + hoverY;
          lz = 0;
          sc = j === 8 ? 0.16 : 0.12;
        }
        col = "#d9467a";
      } else {
        // 24 cubes: 4 sweeping crimson delta fins (6 cubes each)
        const j = idx - 96;
        const fin = Math.floor(j / 6); // 0..3 (+X, -X, +Z, -Z)
        const k = j % 6;
        const row = Math.floor(k / 2); // 0 top .. 2 bottom
        const out = (k % 2) + 1; // 1..2 outward steps
        const dist = 0.32 + (row * 0.12 + out * 0.18);
        const fy = 0.32 - row * 0.28 + hoverY;
        const a = (fin * Math.PI) / 2;
        lx = Math.cos(a) * dist;
        ly = fy;
        lz = Math.sin(a) * dist;
        sc = 0.2;
        col = out === 2 ? "#d9467a" : pal.deep;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.22, 0, pal.primary], [0, -0.24, 0, pal.light], [0.24, -0.22, 0, pal.primary], [0, -0.24, 0.2, pal.light],
        [0, -0.06, 0, "#f59e0b"],
        [0, 0.12, 0, "#f2ecff"], [0, 0.3, 0, "#382c6e"], [0, 0.48, 0, "#d9467a"],
        [-0.2, 0.08, 0, "#d9467a"], [0.2, 0.08, 0, "#d9467a"],
        [0, 0.08, 0.2, pal.deep], [0, 0.08, -0.2, pal.deep],
      ];
      const p = pts[slot];
      const bob = slot >= 5 ? Math.sin(t * 2.4) * 0.05 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + bob) * boost, p[2] * boost, Math.sin(t * 0.45) * 0.3, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.45) * 0.3, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     1B. RED VENTURES — Unified Cloud Deploy Stack (↑ Arrow Emerging from Servers into Cloud!)
     -------------------------------------------------------------------------- */
  "rv-cloud-deploy": {
    hero(idx, _count, t, pal) {
      const rotY = -0.22 + Math.sin(t * 0.3) * 0.2;
      const rotX = 0.18;
      const lift = Math.sin(t * 2.0) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = pal.primary;

      if (idx < 48) {
        // 3 stacked dark-indigo server blades connected cleanly (16 cubes each: 4 wide x 2 deep x 2? -> 8 wide x 2 deep!)
        const blade = Math.floor(idx / 16); // 0, 1, 2
        const k = idx % 16;
        const c = (k % 8) - 3.5;
        const d = Math.floor(k / 8) - 0.5;
        lx = c * 0.3;
        ly = -1.42 + blade * 0.42;
        lz = d * 0.36;
        sc = 0.25;
        const ledLit = d > 0 && (c === -2.5 || c === -1.5);
        const pulse = Math.sin(t * 3.0 - blade * 0.9) > 0.2;
        col = ledLit ? (pulse ? "#38d9a9" : "#f0b94b") : blade === 1 ? "#4b3994" : "#342766";
      } else if (idx < 94) {
        // 46 cubes: Puffy asymmetrical 3-lobe cloud crown sitting cleanly above server stack!
        const j = idx - 48;
        const rows: Array<{ y: number; cols: number[] }> = [
          { y: 0.28, cols: [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5] }, // 8x2 = 16 flat base
          { y: 0.62, cols: [-4, -3, -2, -1, 0, 1, 2, 3, 4] }, // 9x2 = 18 puffed belly
          { y: 0.96, cols: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5] }, // 6x2 = 12 upper lobes!
        ];
        let rem = j;
        let rxC = 0, ryC = 0.6, rzC = 0;
        for (const row of rows) {
          const cap = row.cols.length * 2;
          if (rem < cap) {
            const cIdx = Math.floor(rem / 2);
            const zLayer = rem % 2 === 0 ? -0.2 : 0.2;
            rxC = row.cols[cIdx] * 0.32;
            ryC = row.y + Math.sin(t * 1.8 - 0.6) * 0.05;
            rzC = zLayer;
            break;
          }
          rem -= cap;
        }
        lx = rxC;
        ly = ryC;
        lz = rzC;
        sc = 0.28;
        col = rzC > 0 ? pal.light : pal.primary;
      } else {
        // 26 cubes: Bold crimson-coral Upward Deploy Arrow (`↑`) proud in front (z = +0.58) bridging servers -> cloud!
        const j = idx - 94;
        const arrowArt: Array<[number, number]> = [
          // 2-wide shaft (10 cubes)
          [-0.14, -1.1], [0.14, -1.1],
          [-0.14, -0.82], [0.14, -0.82],
          [-0.14, -0.54], [0.14, -0.54],
          [-0.14, -0.26], [0.14, -0.26],
          [-0.14, 0.02], [0.14, 0.02],
          // Bold stepped arrowhead (16 cubes)
          [-0.7, 0.28], [-0.42, 0.28], [-0.14, 0.28], [0.14, 0.28], [0.42, 0.28], [0.7, 0.28],
          [-0.42, 0.56], [-0.14, 0.56], [0.14, 0.56], [0.42, 0.56],
          [-0.14, 0.84], [0.14, 0.84],
          [0, 1.12],
          // Back bevel depth on head
          [-0.28, 0.42], [0.28, 0.42], [0, 0.7],
        ];
        const p = arrowArt[j % arrowArt.length];
        lx = p[0];
        ly = p[1] + lift;
        lz = j >= 23 ? 0.44 : 0.64;
        sc = 0.23;
        col = ly > 0.7 + lift ? "#ffd166" : "#e03e73";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 11;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.28, 0, "#342766"], [0, -0.28, 0, "#342766"], [0.24, -0.28, 0, "#342766"],
        [-0.28, 0.08, 0, pal.primary], [0, 0.08, 0, pal.light], [0.28, 0.08, 0, pal.primary],
        [-0.14, 0.28, 0, pal.light], [0.14, 0.28, 0, pal.primary],
        [0, -0.06, 0.22, "#e03e73"], [0, 0.14, 0.22, "#e03e73"], [0, 0.34, 0.22, "#ffd166"],
      ];
      const p = pts[slot];
      const lift = slot >= 8 ? Math.sin(t * 2.4) * 0.05 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + lift) * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2A. GOOGLE INTERN — Iconic 3D Flip Wall Calendar + Oversized Binder Rings + Pop-Out Checkmark!
     -------------------------------------------------------------------------- */
  "gi-calendar": {
    hero(idx, _count, t, pal) {
      const rotY = -0.24 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.16;
      const pop = 0.5 + 0.5 * Math.sin(t * 2.2);
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = pal.primary;

      if (idx < 36) {
        // Crisp 9 wide x 9 tall outer dark-navy calendar bezel perimeter (32) + 4 rear easel stand cubes
        if (idx < 32) {
          const side = Math.floor(idx / 8); // 4 sides x 8 unique steps
          const step = idx % 8;
          const gx = side === 0 ? step - 4 : side === 1 ? 4 : side === 2 ? 4 - step : -4;
          const gy = side === 0 ? 4 : side === 1 ? 4 - step : side === 2 ? -4 : -4 + step;
          lx = gx * 0.3;
          ly = gy * 0.3 - 0.14;
          lz = -0.08;
          sc = 0.27;
          col = gy >= 2 ? "#2b4da8" : "#2d3b75";
        } else {
          // Rear easel support leg
          const k = idx - 32;
          lx = (k % 2 === 0 ? -0.55 : 0.55);
          ly = -0.45 - Math.floor(k / 2) * 0.48;
          lz = -0.52 - Math.floor(k / 2) * 0.25;
          sc = 0.24;
          col = "#2d3b75";
        }
      } else if (idx < 50) {
        // Bold royal-blue Calendar Header Bar (7 wide x 2 tall = 14 cubes)
        const j = idx - 36;
        const c = (j % 7) - 3;
        const r = Math.floor(j / 7); // 0, 1
        lx = c * 0.3;
        ly = 0.76 + r * 0.28;
        lz = 0.04;
        sc = 0.265;
        col = r === 1 ? "#3b6ee8" : "#2b52bd";
      } else if (idx < 68) {
        // TWO Oversized 3D Spiral Binder Rings arching cleanly over the top! (9 cubes each = 18)
        const j = idx - 50;
        const ring = j < 9 ? -0.78 : 0.78;
        const k = j % 9;
        const a = (k / 8) * Math.PI * 1.45 - Math.PI * 0.22; // clean arch front-to-back over top edge
        lx = ring;
        ly = 1.2 + Math.sin(a) * 0.42;
        lz = Math.cos(a) * 0.36;
        sc = 0.175;
        col = "#f0b94b";
      } else if (idx < 104) {
        // Clean 4x3 grid of 12 Date Tiles (3 cubes each? -> 12 crisp tiles x 3? Better: 12 tiles in 4x3, 36 cubes = 3x1 or spaced 2x2-ish!)
        // Wait: 4 cols x 3 rows = 12 day tiles; let's use 36 cubes as 12 crisp 3-cube date cells (back + face) or a clean 6x6 recessed board!
        // Even crisper: 24 light recessed backing cubes + 12 distinct colored day-tile blocks!
        const j = idx - 68;
        if (j < 24) {
          // 6x4 clean crisp recessed calendar page backing
          const c = (j % 6) - 2.5;
          const r = Math.floor(j / 6) - 1.5;
          lx = c * 0.36;
          ly = -0.35 + r * 0.36;
          lz = -0.18;
          sc = 0.31;
          col = "#f2ecff";
        } else {
          // 12 individual day-squares in a clean 4 cols x 3 rows grid (zero overlap!)
          const dIdx = j - 24; // 0..11
          const c = (dIdx % 4) - 1.5;
          const r = 1 - Math.floor(dIdx / 4); // +1 top .. -1 bottom
          const isActive = dIdx === 5; // center-left active day pops forward!
          const waveZ = Math.sin(t * 2.2 - (c + r) * 0.6) * 0.05;
          lx = c * 0.52;
          ly = -0.35 + r * 0.48;
          lz = isActive ? 0.36 + pop * 0.22 : 0.14 + waveZ;
          sc = isActive ? 0.34 : 0.25;
          col = isActive ? "#f59e0b" : pal.primary;
        }
      } else {
        // 16 cubes: Bold Emerald 3D Checkmark (`✓`) floating proudly in front of the popped active tile!
        const j = idx - 104;
        const checkPts: Array<[number, number]> = [
          [-0.44, -0.04], [-0.32, -0.18], [-0.2, -0.32], [-0.08, -0.44],
          [0.06, -0.32], [0.2, -0.18], [0.34, -0.02], [0.48, 0.14],
          [0.62, 0.3], [0.74, 0.44],
          // 2nd thickness offset for unmistakable legibility
          [-0.36, 0.04], [-0.14, -0.22], [0.02, -0.36], [0.24, -0.08], [0.44, 0.18], [0.64, 0.38],
        ];
        const p = checkPts[j % checkPts.length];
        lx = 0.54 + p[0];
        ly = -0.24 + p[1];
        lz = 0.62 + pop * 0.22;
        sc = 0.185;
        col = "#16a374";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.2, 0.34, 0, "#f0b94b"], [0.2, 0.34, 0, "#f0b94b"],
        [-0.24, 0.18, 0, "#2b52bd"], [0, 0.18, 0, "#2b52bd"], [0.24, 0.18, 0, "#2b52bd"],
        [-0.24, -0.04, 0, "#f2ecff"], [0, -0.04, 0, "#f2ecff"], [0.24, -0.04, 0, "#f2ecff"],
        [-0.24, -0.26, 0, pal.light], [0, -0.26, 0, "#f59e0b"], [0.24, -0.26, 0, pal.light],
        [0.08, -0.14, 0.22, "#16a374"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.28, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.45) * 0.28, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2B. GOOGLE INTERN — 3D Analog Clock + Stacked Schedule Shift Bars!
     -------------------------------------------------------------------------- */
  "gi-clock-schedule": {
    hero(idx, _count, t, pal) {
      const rotY = -0.2 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.16;
      const cx = -0.82;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = pal.primary;

      if (idx < 36) {
        // Clock circular cobalt bezel (2 layers x 16 = 32) + top crown (4)
        if (idx < 32) {
          const layer = idx < 16 ? -0.14 : 0.14;
          const a = ((idx % 16) / 16) * Math.PI * 2;
          lx = cx + Math.cos(a) * 1.05;
          ly = Math.sin(a) * 1.05;
          lz = layer;
          sc = 0.24;
          col = layer > 0 ? "#3b6ee8" : "#243b8a";
        } else {
          const k = idx - 32;
          lx = cx + (k % 2 === 0 ? -0.14 : 0.14);
          ly = 1.32 + Math.floor(k / 2) * 0.18;
          lz = 0;
          sc = 0.18;
          col = "#f0b94b";
        }
      } else if (idx < 56) {
        // Recessed pale clock face (14) + 4 cardinal ticks (4) + gold pivot (2)
        const j = idx - 36;
        if (j < 14) {
          const ring = j < 8 ? 0.64 : 0.3;
          const cnt = j < 8 ? 8 : 6;
          const a = ((j < 8 ? j : j - 8) / cnt) * Math.PI * 2;
          lx = cx + Math.cos(a) * ring;
          ly = Math.sin(a) * ring;
          lz = -0.06;
          sc = 0.27;
          col = "#f2ecff";
        } else if (j < 18) {
          const a = ((j - 14) * Math.PI) / 2;
          lx = cx + Math.cos(a) * 0.78;
          ly = Math.sin(a) * 0.78;
          lz = 0.12;
          sc = 0.15;
          col = "#243b8a";
        } else {
          lx = cx;
          ly = 0;
          lz = 0.22 + (j - 18) * 0.14;
          sc = 0.18;
          col = "#f0b94b";
        }
      } else if (idx < 68) {
        // Clock hands: hour hand (5 cubes, z = +0.26) + minute hand (7 cubes, z = +0.44)
        const j = idx - 56;
        const isHour = j < 5;
        const step = isHour ? j + 1 : j - 4;
        const ang = isHour ? -t * 0.28 + 1.1 : -t * 1.45 + 0.4;
        const r = step * (isHour ? 0.125 : 0.12);
        lx = cx + Math.cos(ang) * r;
        ly = Math.sin(ang) * r;
        lz = isHour ? 0.26 : 0.44;
        sc = isHour ? 0.15 : 0.135;
        col = isHour ? "#243b8a" : "#e04868";
      } else {
        // Right side: vertical dark timeline rail (10) + 3 gliding color-coded schedule bars (42 = 3x14 -> 7x2)
        const j = idx - 68;
        if (j < 10) {
          lx = 0.65;
          ly = -1.05 + j * 0.235;
          lz = 0;
          sc = 0.17;
          col = "#2d3b75";
        } else {
          const k = j - 10; // 42 cubes = 3 bars x 14 (7 wide x 2 tall)
          const bar = Math.floor(k / 14); // 0, 1, 2
          const sub = k % 14;
          const colIdx = sub % 7;
          const rowIdx = Math.floor(sub / 7);
          const slide = Math.sin(t * 1.6 + bar * 1.35) * 0.22;
          lx = 0.96 + colIdx * 0.21 + slide;
          ly = (1 - bar) * 0.72 + (rowIdx - 0.5) * 0.21;
          lz = 0.08;
          sc = 0.19;
          col = bar === 0 ? "#3b6ee8" : bar === 1 ? "#20b28a" : "#f0b94b";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.22, 0, "#3b6ee8"], [-0.42, 0.04, 0, "#3b6ee8"], [-0.24, -0.14, 0, "#3b6ee8"], [-0.06, 0.04, 0, "#3b6ee8"],
        [-0.24, 0.04, 0.12, "#f0b94b"], [-0.24, 0.16, 0.18, "#e04868"],
        [0.18, 0.22, 0, "#3b6ee8"], [0.36, 0.22, 0, "#3b6ee8"],
        [0.18, 0.0, 0, "#20b28a"], [0.36, 0.0, 0, "#20b28a"],
        [0.18, -0.22, 0, "#f0b94b"], [0.36, -0.22, 0, pal.primary],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3A. CORNELL DTI LEAD / LEADERSHIP — Team Podium + 3 Sculpted Meeples + Golden Chevron!
     -------------------------------------------------------------------------- */
  "lead-podium": {
    hero(idx, _count, t, pal) {
      const rotY = -0.22 + Math.sin(t * 0.3) * 0.24;
      const rotX = 0.2;
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = pal.primary;

      if (idx < 36) {
        // Grounded 2-tier dark-indigo podium (24 lower 6x4 + 12 raised center dais 4x3)
        if (idx < 24) {
          const c = (idx % 6) - 2.5;
          const d = Math.floor(idx / 6) - 1.5;
          lx = c * 0.44;
          ly = -1.42;
          lz = d * 0.4;
          sc = 0.34;
          col = "#362b6b";
        } else {
          const k = idx - 24;
          const c = (k % 4) - 1.5;
          const d = Math.floor(k / 4) - 1;
          lx = c * 0.32;
          ly = -1.04;
          lz = d * 0.32 + 0.18;
          sc = 0.27;
          col = pal.deep;
        }
      } else if (idx < 104) {
        // 3 Sculpted Human Bust/Meeple Figures (Lead center 28 cubes + 2 flanking teammates 20 cubes each = 68)
        const j = idx - 36;
        const isLead = j < 28;
        const isLeft = !isLead && j < 48;
        const k = isLead ? j : isLeft ? j - 28 : j - 48;
        const baseX = isLead ? 0 : isLeft ? -1.06 : 1.06;
        const baseY = isLead ? -0.74 : -1.06;
        const baseZ = isLead ? 0.22 : -0.22;
        const bob = Math.sin(t * 2.0 - (isLead ? 0 : 0.7)) * 0.07;

        if (isLead) {
          if (k < 20) {
            // Sculpted wide shoulders/torso (5 wide x 2 deep x 2 tall)
            const c = (k % 5) - 2;
            const d = Math.floor(k / 5) % 2 - 0.5;
            const r = Math.floor(k / 10); // 0 bottom, 1 shoulders
            lx = baseX + c * (r === 1 ? 0.22 : 0.19);
            ly = baseY + r * 0.28 + bob;
            lz = baseZ + d * 0.24;
            sc = 0.24;
            col = "#c9437d";
          } else {
            // Crisp 2x2x2 round head sitting cleanly on neck!
            const h = k - 20;
            lx = baseX + (h & 1 ? 0.13 : -0.13);
            ly = baseY + 0.72 + (h & 2 ? 0.13 : -0.13) + bob;
            lz = baseZ + (h & 4 ? 0.13 : -0.13);
            sc = 0.23;
            col = "#f0b94b";
          }
        } else {
          if (k < 12) {
            // Flanking teammate torso (3 wide x 2 deep x 2 tall)
            const c = (k % 3) - 1;
            const d = Math.floor(k / 3) % 2 - 0.5;
            const r = Math.floor(k / 6);
            lx = baseX + c * 0.22;
            ly = baseY + r * 0.26 + bob;
            lz = baseZ + d * 0.22;
            sc = 0.23;
            col = isLeft ? "#4870d6" : "#32a895";
          } else {
            // Flanking teammate 2x2x2 head
            const h = k - 12;
            lx = baseX + (h & 1 ? 0.12 : -0.12);
            ly = baseY + 0.66 + (h & 2 ? 0.12 : -0.12) + bob;
            lz = baseZ + (h & 4 ? 0.12 : -0.12);
            sc = 0.21;
            col = isLeft ? "#a9c1f7" : "#a8e6db";
          }
        }
      } else {
        // 16 cubes: Bold Golden Rising Leadership Chevron (`^`) hovering cleanly overhead!
        const j = idx - 104;
        const chev: Array<[number, number]> = [
          [-0.84, 0.96], [-0.56, 1.18], [-0.28, 1.4], [0, 1.62],
          [0.28, 1.4], [0.56, 1.18], [0.84, 0.96],
          [-0.84, 1.2], [-0.56, 1.42], [-0.28, 1.64], [0, 1.86],
          [0.28, 1.64], [0.56, 1.42], [0.84, 1.2],
          [-0.14, 1.52], [0.14, 1.52],
        ];
        const p = chev[j % chev.length];
        const floatY = Math.sin(t * 2.0 - 1.2) * 0.12;
        lx = p[0];
        ly = p[1] + floatY;
        lz = 0.16;
        sc = 0.2;
        col = "#f0b94b";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.26, 0, "#362b6b"], [0, -0.26, 0, "#362b6b"], [0.24, -0.26, 0, "#362b6b"],
        [0, -0.04, 0.08, "#c9437d"], [0, 0.18, 0.08, "#f0b94b"],
        [-0.28, -0.08, -0.06, "#4870d6"], [-0.28, 0.1, -0.06, "#a9c1f7"],
        [0.28, -0.08, -0.06, "#32a895"], [0.28, 0.1, -0.06, "#a8e6db"],
        [-0.16, 0.34, 0.06, "#f0b94b"], [0, 0.44, 0.06, "#f0b94b"], [0.16, 0.34, 0.06, pal.primary],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.3, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.45) * 0.3, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3B. CORNELL DTI LEAD / LEADERSHIP — 3D Navigational Compass Rose!
     -------------------------------------------------------------------------- */
  "lead-compass": {
    hero(idx, _count, t, pal) {
      const rotY = -0.18 + Math.sin(t * 0.32) * 0.24;
      const rotX = 0.24;
      const needleAng = Math.sin(t * 1.4) * 0.55 + Math.sin(t * 2.8) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = pal.primary;

      if (idx < 40) {
        // Thick 2-layer continuous beveled circular compass bezel (2 x 20)
        const layer = idx < 20 ? -0.15 : 0.15;
        const a = ((idx % 20) / 20) * Math.PI * 2;
        lx = Math.cos(a) * 1.44;
        ly = Math.sin(a) * 1.44 - 0.14;
        lz = layer;
        sc = 0.295;
        col = layer > 0 ? pal.deep : "#2e245c";
      } else if (idx < 52) {
        // Pocket-compass top suspension loop (12 cubes -> unmistakable compass cue!)
        const j = idx - 40;
        const a = (j / 12) * Math.PI * 2;
        lx = Math.cos(a) * 0.34;
        ly = 1.72 + Math.sin(a) * 0.34;
        lz = 0;
        sc = 0.155;
        col = "#f0b94b";
      } else if (idx < 64) {
        // 4 cardinal N/E/S/W bezel markers (3 cubes each = 12)
        const j = idx - 52;
        const card = Math.floor(j / 3); // 0=N, 1=E, 2=S, 3=W
        const sub = j % 3;
        const a = Math.PI / 2 - (card * Math.PI) / 2;
        const r = 1.12 - sub * 0.12;
        lx = Math.cos(a) * r;
        ly = Math.sin(a) * r - 0.14;
        lz = 0.2;
        sc = card === 0 ? 0.19 : 0.15;
        col = card === 0 ? "#e03e6d" : "#f0b94b";
      } else if (idx < 88) {
        // Recessed pale-lavender compass dial (24 cleanly spaced concentric cubes)
        const j = idx - 64;
        const isOuter = j < 16;
        const a = ((isOuter ? j : j - 16) / (isOuter ? 16 : 8)) * Math.PI * 2;
        const r = isOuter ? 0.88 : 0.45;
        lx = Math.cos(a) * r;
        ly = Math.sin(a) * r - 0.14;
        lz = -0.14;
        sc = 0.27;
        col = "#f2ecff";
      } else {
        // 32 cubes: Proud 3D Diamond Compass Needle (crimson North / deep slate South + gold center cap)
        const j = idx - 88;
        if (j < 4) {
          // Center gold pivot cap
          lx = (j % 2 === 0 ? -0.1 : 0.1);
          ly = -0.14 + (j < 2 ? -0.1 : 0.1);
          lz = 0.46;
          sc = 0.18;
          col = "#f0b94b";
        } else {
          const k = j - 4; // 28 cubes: 14 North (crimson) + 14 South (navy)
          const isNorth = k < 14;
          const m = isNorth ? k : k - 14;
          const dir = isNorth ? 1 : -1;
          // Tapered diamond blade profile
          const blade: Array<[number, number]> = [
            [-0.22, 0.16], [0, 0.16], [0.22, 0.16],
            [-0.18, 0.36], [0, 0.36], [0.18, 0.36],
            [-0.12, 0.56], [0, 0.56], [0.12, 0.56],
            [-0.06, 0.76], [0.06, 0.76],
            [0, 0.94], [0, 1.08], [0, 0.44],
          ];
          const bp = blade[m % blade.length];
          const bx = bp[0];
          const by = bp[1] * dir;
          const ca = Math.cos(needleAng);
          const sa = Math.sin(needleAng);
          lx = bx * ca - by * sa;
          ly = -0.14 + bx * sa + by * ca;
          lz = m === 13 ? 0.38 : 0.28;
          sc = m >= 11 ? 0.15 : 0.185;
          col = isNorth ? "#e03e6d" : "#3a326e";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 11;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.42, 0, "#f0b94b"],
        [0, 0.24, 0, pal.deep], [0.24, 0.12, 0, pal.deep], [0.24, -0.12, 0, pal.deep],
        [0, -0.24, 0, pal.deep], [-0.24, -0.12, 0, pal.deep], [-0.24, 0.12, 0, pal.deep],
        [0, 0.14, 0.16, "#e03e6d"], [0, 0.0, 0.2, "#f0b94b"], [0, -0.14, 0.16, "#3a326e"],
        [0, 0.0, -0.06, "#f2ecff"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.28, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.45) * 0.28, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4A. CORNELL DTI TPM (CUE) — Thick Obsidian 3D Smartphone + Bold Center Map Pin!
     -------------------------------------------------------------------------- */
  "tpm-phone-pin": {
    hero(idx, _count, t, pal) {
      const rotY = -0.28 + Math.sin(t * 0.34) * 0.22;
      const rotX = 0.16;
      const pinBob = Math.sin(t * 2.4) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = pal.primary;

      if (idx < 60) {
        // Thick dark obsidian Smartphone Chassis: 7x10 outer perimeter (30) + back shell (24) + top notch (3) + bottom home bar (3)
        if (idx < 30) {
          const r = idx < 7 ? 0 : idx < 14 ? 9 : Math.floor((idx - 14) / 2) + 1;
          const c = idx < 7 ? idx : idx < 14 ? idx - 7 : (idx % 2 === 0 ? 0 : 6);
          lx = (c - 3) * 0.27;
          ly = (4.5 - r) * 0.28;
          lz = 0.05;
          sc = 0.255;
          col = "#2b2452";
        } else if (idx < 54) {
          // Solid recessed dark-indigo screen/map back (4 wide x 6 tall = 24)
          const k = idx - 30;
          const c = (k % 4) - 1.5;
          const r = Math.floor(k / 4) - 2.5;
          lx = c * 0.34;
          ly = r * 0.36;
          lz = -0.12;
          sc = 0.31;
          // Subtle map grid streets across the phone screen
          col = c === 0.5 || r === 0.5 ? pal.light : pal.primary;
        } else if (idx < 57) {
          // Signature iPhone top speaker/camera notch
          const k = idx - 54;
          lx = (k - 1) * 0.22;
          ly = 1.04;
          lz = 0.14;
          sc = 0.18;
          col = "#1f193d";
        } else {
          // Signature bottom home indicator bar
          const k = idx - 57;
          lx = (k - 1) * 0.24;
          ly = -1.04;
          lz = 0.14;
          sc = 0.15;
          col = "#f2ecff";
        }
      } else if (idx < 92) {
        // Side hardware buttons (4) + clean map landing dot & ripple right under center pin (28)
        const j = idx - 60;
        if (j < 4) {
          lx = 1.02;
          ly = 0.58 - j * 0.28;
          lz = 0.02;
          sc = 0.13;
          col = "#4a3f80";
        } else {
          // Glowing target ring on the phone map screen center!
          const k = j - 4;
          const isInner = k < 10;
          const a = ((isInner ? k : k - 10) / (isInner ? 10 : 18)) * Math.PI * 2 + t * 0.6;
          const r = isInner ? 0.24 : 0.52 + Math.sin(t * 2.4) * 0.05;
          lx = Math.cos(a) * r;
          ly = -0.28 + Math.sin(a) * r * 0.6;
          lz = 0.16;
          sc = isInner ? 0.12 : 0.1;
          col = isInner ? "#f0b94b" : "#f2ecff";
        }
      } else {
        // 28 cubes: BOLD Crimson 3D Map Pin (`📍`) popping straight out of the DEAD CENTER of the phone screen!
        const j = idx - 92;
        const p = MAP_PIN_28[j % MAP_PIN_28.length];
        lx = p.x * 1.15;
        ly = 0.28 + p.y * 1.15 + pinBob;
        lz = 0.68 + p.z;
        sc = p.role === "eye" ? 0.19 : 0.23;
        col = p.role === "eye" ? "#f2ecff" : "#e63b6a";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.16, 0.3, 0, "#2b2452"], [0.16, 0.3, 0, "#2b2452"],
        [-0.16, 0.1, 0, pal.primary], [0.16, 0.1, 0, pal.primary],
        [-0.16, -0.1, 0, pal.primary], [0.16, -0.1, 0, pal.primary],
        [-0.16, -0.3, 0, "#2b2452"], [0.16, -0.3, 0, "#2b2452"],
        [0, 0.18, 0.22, "#e63b6a"], [-0.1, 0.08, 0.22, "#e63b6a"], [0.1, 0.08, 0.22, "#e63b6a"], [0, -0.06, 0.22, "#e63b6a"],
      ];
      const p = pts[slot];
      const bob = slot >= 8 ? Math.sin(t * 2.4) * 0.05 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + bob) * boost, p[2] * boost, Math.sin(t * 0.45) * 0.28, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.45) * 0.28, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4B. CORNELL DTI TPM (CUE) — Notched Event Ticket Stub + Star + Bold Map Pin!
     -------------------------------------------------------------------------- */
  "tpm-ticket-pin": {
    hero(idx, _count, t, pal) {
      const rotY = -0.22 + Math.sin(t * 0.3) * 0.2;
      const rotX = 0.16;
      const rock = Math.sin(t * 1.4) * 0.05;
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = pal.primary;

      if (idx < 74) {
        // Horizontal Notched Event Ticket (11 wide x 7 tall minus left/right center semicircular bite notches + tear perforations!)
        // Clean grid of 74 ticket voxels:
        const ticketCoords: Array<{ x: number; y: number; kind: "edge" | "tear" | "face" }> = [];
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 11; c++) {
            // Classic semicircular side bite notches at middle row (r=3, c=0 and c=10)
            if (r === 3 && (c === 0 || c === 10)) continue;
            // Perforation tear seam gap on column 7
            if (c === 7 && (r === 1 || r === 3 || r === 5)) continue;
            const kind =
              r === 0 || r === 6 || c === 0 || c === 10
                ? "edge"
                : c === 7
                  ? "tear"
                  : "face";
            ticketCoords.push({ x: (c - 5) * 0.29, y: (3 - r) * 0.29, kind });
          }
        }
        const tc = ticketCoords[idx % ticketCoords.length];
        lx = tc.x;
        ly = tc.y;
        lz = tc.kind === "edge" ? 0.04 : -0.06;
        sc = tc.kind === "tear" ? 0.15 : 0.26;
        col = tc.kind === "edge" ? pal.deep : tc.kind === "tear" ? "#2b2452" : pal.primary;
      } else if (idx < 92) {
        // 18 cubes: Raised Golden Star (`★`) on the left main panel of the ticket!
        const j = idx - 74;
        const sp = STAR_18[j % STAR_18.length];
        lx = -0.58 + sp[0];
        ly = sp[1];
        lz = 0.28 + Math.sin(t * 2.2) * 0.05;
        sc = 0.2;
        col = "#f0b94b";
      } else {
        // 28 cubes: Crisp Crimson Map Pin (`📍`) centered cleanly inside the right stub!
        const j = idx - 92;
        const p = MAP_PIN_28[j % MAP_PIN_28.length];
        lx = 0.9 + p.x * 0.84;
        ly = 0.1 + p.y * 0.88 + Math.sin(t * 2.4 + 0.8) * 0.12;
        lz = 0.44 + p.z;
        sc = p.role === "eye" ? 0.15 : 0.185;
        col = p.role === "eye" ? "#f2ecff" : "#e63b6a";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, rock, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 11;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, 0.14, 0, pal.deep], [-0.1, 0.14, 0, pal.primary], [0.12, 0.14, 0, pal.primary], [0.32, 0.14, 0, pal.deep],
        [-0.32, -0.14, 0, pal.deep], [-0.1, -0.14, 0, pal.primary], [0.12, -0.14, 0, pal.primary], [0.32, -0.14, 0, pal.deep],
        [-0.14, 0, 0.16, "#f0b94b"],
        [0.24, 0.22, 0.2, "#e63b6a"], [0.24, 0.02, 0.2, "#e63b6a"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5A. FULL STACK / RANGE — Isometric 3-Layer Stack Sandwich (UI + API + DB!)
     -------------------------------------------------------------------------- */
  "fs-3layer-stack": {
    hero(idx, _count, t, pal) {
      const rotY = -0.68 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.42;
      const waveTop = Math.sin(t * 1.9) * 0.1;
      const waveMid = Math.sin(t * 1.9 - 0.7) * 0.08;
      const waveBot = Math.sin(t * 1.9 - 1.4) * 0.05;
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = pal.primary;

      if (idx < 42) {
        // Bottom tier: Chunky 2-platter cylindrical DB base (2x18 + 6 golden band cubes)
        if (idx < 36) {
          const platter = idx < 18 ? 0 : 1;
          const k = idx % 18;
          const a = (k / 18) * Math.PI * 2;
          const r = k % 3 === 0 ? 0.56 : 1.06;
          lx = Math.cos(a) * r;
          ly = -1.24 + platter * 0.42 + waveBot;
          lz = Math.sin(a) * r;
          sc = 0.27;
          col = platter === 0 ? "#2b3773" : "#3a4ea3";
        } else {
          const k = idx - 36;
          const a = (k / 6) * Math.PI * 2 + t * 0.4;
          lx = Math.cos(a) * 1.08;
          ly = -1.03 + waveBot;
          lz = Math.sin(a) * 1.08;
          sc = 0.17;
          col = "#f0b94b";
        }
      } else if (idx < 74) {
        // Middle tier: Deep-violet Backend/API isometric square slab (6x6 perimeter + inner grid = 32 cubes)
        const j = idx - 42;
        if (j < 20) {
          // 6x6 outer border = 20 unique perimeter cubes
          const side = Math.floor(j / 5);
          const step = j % 5;
          const gx = side === 0 ? step - 2.5 : side === 1 ? 2.5 : side === 2 ? 2.5 - step : -2.5;
          const gz = side === 0 ? -2.5 : side === 1 ? step - 2.5 : side === 2 ? 2.5 : 2.5 - step;
          lx = gx * 0.34;
          ly = 0.05 + waveMid;
          lz = gz * 0.34;
          sc = 0.27;
          col = "#6d44c7";
        } else {
          // 12 inner API logic core blocks (4x3)
          const k = j - 20;
          lx = ((k % 4) - 1.5) * 0.34;
          ly = 0.05 + waveMid;
          lz = (Math.floor(k / 4) - 1) * 0.36;
          sc = 0.22;
          col = k % 5 === 0 ? "#24b88d" : pal.light;
        }
      } else if (idx < 108) {
        // Top tier: Royal-blue Frontend UI isometric slab with 3 vivid window dots (20 border + 11 cards + 3 dots = 34)
        const j = idx - 74;
        if (j < 20) {
          const side = Math.floor(j / 5);
          const step = j % 5;
          const gx = side === 0 ? step - 2.5 : side === 1 ? 2.5 : side === 2 ? 2.5 - step : -2.5;
          const gz = side === 0 ? -2.5 : side === 1 ? step - 2.5 : side === 2 ? 2.5 : 2.5 - step;
          lx = gx * 0.34;
          ly = 1.06 + waveTop;
          lz = gz * 0.34;
          sc = 0.27;
          col = "#3d6ee3";
        } else if (j < 31) {
          const k = j - 20;
          lx = ((k % 4) - 1.5) * 0.34;
          ly = 1.06 + waveTop;
          lz = (Math.floor(k / 4) - 1) * 0.36;
          sc = 0.22;
          col = "#f2ecff";
        } else {
          // 3 bright traffic-light window dots on top front edge!
          const d = j - 31;
          lx = -0.62 + d * 0.28;
          ly = 1.24 + waveTop;
          lz = 0.86;
          sc = 0.16;
          col = d === 0 ? "#e64e7a" : d === 1 ? "#f0b94b" : "#24b88d";
        }
      } else {
        // 12 high-contrast dark-indigo & gold vertical data-sync beads cleanly between layers!
        const j = idx - 108;
        const corner = Math.floor(j / 3); // 0..3
        const bead = j % 3; // 0..2 vertical
        const a = (corner * Math.PI) / 2 + Math.PI / 4;
        const r = 0.92;
        const pulse = 0.78 + 0.3 * Math.sin(t * 3.6 - bead * 1.1 + corner);
        lx = Math.cos(a) * r;
        ly = -0.68 + bead * 0.68;
        lz = Math.sin(a) * r;
        sc = 0.16 * pulse;
        col = pulse > 0.95 ? "#f0b94b" : "#2d2463";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      const tier = Math.floor(slot / 4); // 0 bottom DB, 1 mid API, 2 top UI
      const k = slot % 4;
      const ox = k % 2 === 0 ? -0.14 : 0.14;
      const oz = k < 2 ? -0.14 : 0.14;
      const ty = (tier - 1) * 0.28 + Math.sin(t * 2.0 - tier * 0.7) * 0.03;
      const col = tier === 2 ? "#3d6ee3" : tier === 1 ? "#6d44c7" : "#2b3773";
      const [dx, dy, dz] = rotateYX(ox * boost, ty * boost, oz * boost, -0.6 + Math.sin(t * 0.4) * 0.2, 0.42);
      return { dx, dy, dz, rx: 0.42, ry: -0.6 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: k === 0 && tier === 2 ? pal.light : col };
    },
  },

  /* --------------------------------------------------------------------------
     5B. FULL STACK / RANGE — Side-by-Side Open Laptop + Bold `<-->` Arrows + DB Cylinder!
     -------------------------------------------------------------------------- */
  "fs-laptop-db": {
    hero(idx, _count, t, pal) {
      const rotY = -0.18 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.22;
      const shift = Math.sin(t * 2.4) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = pal.primary;

      if (idx < 52) {
        // Left: Unmistakable 3D Open Laptop (x = -1.35): closed 6x5 screen perimeter (18) + code lines (12) + slanted keyboard deck (22)
        if (idx < 18) {
          // Exact 18 unique perimeter points of a 6 wide x 5 tall screen bezel (ZERO missing corner!)
          const side = idx < 6 ? 0 : idx < 9 ? 1 : idx < 15 ? 2 : 3;
          let gx = 0, gy = 0;
          if (side === 0) { gx = idx - 2.5; gy = 2; } // top 6 (-2.5..+2.5)
          else if (side === 1) { gx = 2.5; gy = 1 - (idx - 6); } // right 3 (1, 0, -1)
          else if (side === 2) { gx = 2.5 - (idx - 9); gy = -2; } // bottom 6 (+2.5..-2.5)
          else { gx = -2.5; gy = -1 + (idx - 15); } // left 3 (-1, 0, +1)
          lx = -1.42 + gx * 0.23;
          ly = 0.34 + gy * 0.23;
          lz = -0.32;
          sc = 0.22;
          col = "#2b2452";
        } else if (idx < 30) {
          // Recessed glowing code bars inside laptop screen (4x3 = 12)
          const k = idx - 18;
          lx = -1.42 + ((k % 4) - 1.5) * 0.22;
          ly = 0.34 + (Math.floor(k / 4) - 1) * 0.22;
          lz = -0.22;
          sc = 0.185;
          col = k % 3 === 0 ? "#5cc8ff" : "#f2ecff";
        } else {
          // Slanted keyboard base extending forward (+Z) from bottom of screen! (22 cubes: 6x3 + 4 trackpad/bevel)
          const k = idx - 30;
          const c = (k % 6) - 2.5;
          const r = Math.floor(k / 6); // 0..3
          lx = -1.42 + c * 0.23;
          ly = -0.24 - r * 0.06;
          lz = -0.14 + r * 0.25;
          sc = 0.2;
          col = r === 3 ? pal.light : (c + r) % 2 === 0 ? "#3f3678" : "#5e50a6";
        }
      } else if (idx < 100) {
        // Right: Solid 3-tier Cylindrical Database Drum (x = +1.42): 3 rings x 12 + 12 top/groove rings = 48 cubes!
        const j = idx - 52;
        if (j < 36) {
          const tier = Math.floor(j / 12); // 0, 1, 2
          const a = ((j % 12) / 12) * Math.PI * 2 + t * 0.25;
          const r = 0.62;
          lx = 1.42 + Math.cos(a) * r;
          ly = -0.76 + tier * 0.62;
          lz = Math.sin(a) * r;
          sc = 0.285;
          col = tier === 1 ? "#3b6ee8" : "#273f8f";
        } else {
          // 2 glowing golden/cyan separator bands cleanly between the 3 DB platters
          const k = j - 36;
          const band = k < 6 ? 0 : 1;
          const a = ((k % 6) / 6) * Math.PI * 2 - t * 0.4;
          const r = 0.66;
          lx = 1.42 + Math.cos(a) * r;
          ly = -0.46 + band * 0.64;
          lz = Math.sin(a) * r;
          sc = 0.16;
          col = band === 0 ? "#f0b94b" : "#5cc8ff";
        }
      } else {
        // Center: TWO BOLD High-Contrast Opposing Arrows (`→` top emerald, `←` bottom amber-coral, 10 cubes each = 20)!
        const j = idx - 100;
        const isRight = j < 10;
        const k = isRight ? j : j - 10;
        const dir = isRight ? 1 : -1;
        const pts: Array<[number, number]> = [
          [-0.45, 0], [-0.27, 0], [-0.09, 0], [0.09, 0], [0.27, 0],
          [0.45, 0], [0.27, 0.18], [0.27, -0.18], [0.09, 0.3], [0.09, -0.3],
        ];
        const p = pts[k];
        lx = p[0] * dir + shift * dir;
        ly = (isRight ? 0.34 : -0.36) + p[1];
        lz = 0.35;
        sc = 0.165;
        col = isRight ? "#18a87a" : "#e3683b";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.34, 0.16, -0.06, "#2b2452"], [-0.34, -0.02, -0.06, "#5cc8ff"],
        [-0.34, -0.12, 0.1, "#3f3678"], [-0.18, -0.12, 0.1, "#3f3678"],
        [0, 0.12, 0.14, "#18a87a"], [0, -0.12, 0.14, "#e3683b"],
        [0.32, 0.22, 0, "#273f8f"], [0.32, 0.08, 0, "#5cc8ff"],
        [0.32, -0.04, 0, "#3b6ee8"], [0.32, -0.16, 0, "#f0b94b"],
        [0.32, -0.28, 0, "#273f8f"], [0.18, -0.04, 0.12, "#3b6ee8"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.2);
      return { dx, dy, dz, rx: 0.2, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6A. VELOCITOR — 3D Voxel Delivery Truck on Road + Floating Crimson GPS Pin!
     -------------------------------------------------------------------------- */
  "vel-truck-gps": {
    hero(idx, _count, t, pal) {
      const rotY = -0.44 + Math.sin(t * 0.28) * 0.2;
      const rotX = 0.2;
      const bounce = Math.sin(t * 5.2) * 0.035;
      const pinBob = Math.sin(t * 2.4) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = pal.primary;

      if (idx < 19) {
        // Dark asphalt road strip (16) + 3 pulsing amber center dashes (3)
        if (idx < 16) {
          const c = (idx % 8) - 3.5;
          const d = Math.floor(idx / 8) - 0.5;
          lx = c * 0.44;
          ly = -1.32;
          lz = d * 0.72;
          sc = 0.34;
          col = "#2f355c";
        } else {
          const k = idx - 16;
          const pulse = Math.sin(t * 4.5 + k * 1.4) > 0;
          lx = (k - 1) * 0.95;
          ly = -1.16;
          lz = 0;
          sc = pulse ? 0.17 : 0.14;
          col = "#f0b94b";
        }
      } else if (idx < 35) {
        // 4 solid dark-slate rolling wheels (4 cubes each = 16)
        const j = idx - 19;
        const w = Math.floor(j / 4); // 0..3
        const sub = j % 4;
        const wx = w < 2 ? -0.82 : 0.88;
        const wz = w % 2 === 0 ? -0.52 : 0.52;
        const ang = -t * 3.2 + (sub * Math.PI) / 2;
        lx = wx + Math.cos(ang) * 0.12;
        ly = -0.88 + Math.sin(ang) * 0.12;
        lz = wz;
        sc = 0.22;
        col = sub === 0 ? "#b8c7e8" : "#222640";
      } else if (idx < 71) {
        // Cobalt freight Cargo Box (36 cubes: 5 long x 3 tall x 2 sides + top roof + amber logistics stripe!)
        const j = idx - 35;
        const colIdx = j % 6; // 0..5 along X (-1.45 .. -0.05)
        const r = Math.floor(j / 6) % 3; // 0..2 along Y
        const side = Math.floor(j / 18) === 0 ? -0.44 : 0.44;
        lx = -1.48 + colIdx * 0.28;
        ly = -0.54 + r * 0.31 + bounce;
        lz = side;
        sc = 0.265;
        col = r === 1 ? "#f0b94b" : "#3a82d6";
      } else if (idx < 92) {
        // Forward Cab (21 cubes: stepped hood, sky-blue windshield, twin amber headlights)
        const j = idx - 71;
        if (j < 12) {
          // Cab main body (3x2x2)
          const c = j % 3;
          const r = Math.floor(j / 3) % 2;
          const d = j < 6 ? -0.36 : 0.36;
          lx = 0.36 + c * 0.28;
          ly = -0.56 + r * 0.28 + bounce;
          lz = d;
          sc = 0.26;
          col = "#245594";
        } else if (j < 17) {
          // Bright sky-blue windshield across front of cab
          const k = j - 12;
          lx = 0.86;
          ly = -0.14 + bounce;
          lz = (k - 2) * 0.18;
          sc = 0.2;
          col = "#a8dcff";
        } else {
          // Front hood bumper + 2 glowing amber headlights!
          const k = j - 17;
          lx = 1.18;
          ly = -0.56 + bounce;
          lz = (k - 1.5) * 0.22;
          sc = 0.2;
          col = k === 0 || k === 3 ? "#ffd166" : "#245594";
        }
      } else {
        // 28 cubes: BOLD Crimson 3D GPS Location Pin (`📍`) hovering cleanly above the cargo roof!
        const j = idx - 92;
        const p = MAP_PIN_28[j % MAP_PIN_28.length];
        lx = -0.45 + p.x * 1.12;
        ly = 0.98 + p.y * 1.12 + pinBob;
        lz = p.z;
        sc = p.role === "eye" ? 0.17 : 0.22;
        col = p.role === "eye" ? "#f2ecff" : "#e63b6a";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.24, 0, "#222640"], [0.22, -0.24, 0, "#222640"],
        [-0.32, -0.04, 0, "#3a82d6"], [-0.12, -0.04, 0, "#f0b94b"],
        [-0.32, 0.12, 0, "#3a82d6"], [-0.12, 0.12, 0, "#3a82d6"],
        [0.14, -0.04, 0, "#245594"], [0.32, -0.06, 0, "#ffd166"], [0.14, 0.1, 0, "#a8dcff"],
        [-0.1, 0.36, 0, "#e63b6a"], [-0.1, 0.5, 0, "#e63b6a"], [0.02, 0.44, 0, "#e63b6a"],
      ];
      const p = pts[slot];
      const bob = slot >= 9 ? Math.sin(t * 2.4) * 0.05 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + bob) * boost, p[2] * boost, -0.4 + Math.sin(t * 0.4) * 0.2, 0.2);
      return { dx, dy, dz, rx: 0.2, ry: -0.4 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6B. VELOCITOR — Tilted 3D Navigation Map + S-Route + Pins & GPS Arrowhead (`➤`)!
     -------------------------------------------------------------------------- */
  "vel-nav-map": {
    hero(idx, _count, t, pal) {
      const rotY = -0.45 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.52;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = pal.primary;

      if (idx < 56) {
        // 8x7 Tilted dark-framed Navigation Map Tile with muted slate city blocks & emerald parks
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
        // 22 cubes: Raised cobalt S-curved highway route ribbon with smooth traveling pulse!
        const j = idx - 56;
        const s = j / 21; // 0 start .. 1 end
        const rxP = -1.1 + s * 2.2;
        const rzP = 0.95 - s * 1.9 + Math.sin(s * Math.PI * 2) * 0.48;
        const wave = Math.max(0, Math.sin(t * 3.4 - j * 0.42));
        lx = rxP;
        ly = -0.32 + wave * 0.08;
        lz = rzP;
        sc = 0.19 + wave * 0.05;
        col = wave > 0.72 ? "#5cc8ff" : "#2f6ae0";
      } else if (idx < 104) {
        // Start Emerald Pin (12) + Destination Crimson Pin (14) = 26 cubes
        const j = idx - 78;
        const isEnd = j >= 12;
        const k = isEnd ? j - 12 : j;
        const px = isEnd ? 1.12 : -1.12;
        const pz = isEnd ? -0.95 : 0.95;
        const bob = Math.sin(t * 2.2 + (isEnd ? Math.PI : 0)) * 0.1;
        // Stem + chunky rounded pin head
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
        // 16 cubes: Chunky Amber-Gold 3D GPS Navigation Arrowhead (`➤`) hovering prominently over center!
        const j = idx - 104;
        const navPts: Array<[number, number]> = [
          [0, -0.52], // nose tip pointing toward destination
          [-0.18, -0.28], [0, -0.28], [0.18, -0.28],
          [-0.36, -0.04], [-0.18, -0.04], [0, -0.04], [0.18, -0.04], [0.36, -0.04],
          [-0.5, 0.22], [-0.28, 0.22], [0.28, 0.22], [0.5, 0.22],
          [-0.56, 0.42], [0.56, 0.42], [0, 0.08],
        ];
        const p = navPts[j % navPts.length];
        // Rotate arrowhead -45deg to aim along route toward destination
        const ca = Math.cos(-0.75);
        const sa = Math.sin(-0.75);
        lx = p[0] * ca - p[1] * sa;
        ly = 0.42 + Math.sin(t * 2.2) * 0.12;
        lz = p[0] * sa + p[1] * ca;
        sc = 0.21;
        col = j === 0 || j === 15 ? "#2f355c" : "#f0b94b";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.14, 0.24, "#2f355c"], [0.24, -0.14, 0.24, "#2f355c"],
        [-0.24, -0.14, -0.24, "#56b595"], [0.24, -0.14, -0.24, "#2f355c"],
        [0, -0.14, 0, "#dce6f7"],
        [-0.18, -0.02, 0.16, "#2f6ae0"], [0, -0.02, 0, "#5cc8ff"], [0.18, -0.02, -0.16, "#2f6ae0"],
        [-0.22, 0.18, 0.22, "#20b28a"], [0.22, 0.22, -0.22, "#e63b6a"],
        [0, 0.22, 0, "#f0b94b"], [0.08, 0.22, -0.08, "#f0b94b"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.45 + Math.sin(t * 0.4) * 0.2, 0.48);
      return { dx, dy, dz, rx: 0.48, ry: -0.45 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7A. ABOUT SYSTEMS & PLATFORM — Two Interlocking Meshing 3D Mechanical Gears!
     -------------------------------------------------------------------------- */
  "sys-gears": {
    hero(idx, _count, t, pal) {
      const rotY = -0.18 + Math.sin(t * 0.3) * 0.22;
      const rotX = 0.2;
      const theta1 = t * 0.72;
      const theta2 = -t * 0.96 + Math.PI / 6; // Exact 4:3 tooth-locked mesh ratio (8 teeth vs 6 teeth)!
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = pal.primary;

      if (idx < 68) {
        // LARGE 8-Tooth Jewel-Teal/Indigo Primary Gear (centered at x = -0.58, y = -0.34)
        const gx = -0.58, gy = -0.34;
        if (idx < 32) {
          // 2-layer solid machined bevel rim (16 x 2)
          const layer = idx < 16 ? -0.13 : 0.13;
          const a = ((idx % 16) / 16) * Math.PI * 2 + theta1;
          lx = gx + Math.cos(a) * 0.9;
          ly = gy + Math.sin(a) * 0.9;
          lz = layer;
          sc = 0.275;
          col = layer > 0 ? pal.primary : pal.deep;
        } else if (idx < 56) {
          // 8 bold mechanical gear teeth (3 cubes per tooth = 24)
          const j = idx - 32;
          const tooth = Math.floor(j / 3);
          const sub = j % 3;
          const a = (tooth / 8) * Math.PI * 2 + theta1 + (sub - 1) * 0.08;
          const r = sub === 1 ? 1.24 : 1.15;
          lx = gx + Math.cos(a) * r;
          ly = gy + Math.sin(a) * r;
          lz = 0;
          sc = 0.23;
          col = pal.deep;
        } else {
          // 4 inner spokes (4) + luminous center axle collar (8)
          const j = idx - 56;
          if (j < 4) {
            const a = (j / 4) * Math.PI * 2 + theta1;
            lx = gx + Math.cos(a) * 0.56;
            ly = gy + Math.sin(a) * 0.56;
            lz = 0;
            sc = 0.22;
            col = pal.light;
          } else {
            const a = ((j - 4) / 8) * Math.PI * 2 + theta1;
            lx = gx + Math.cos(a) * 0.28;
            ly = gy + Math.sin(a) * 0.28;
            lz = 0.08;
            sc = 0.19;
            col = "#f2ecff";
          }
        }
      } else {
        // SMALL 6-Tooth Warm Amber/Violet Meshing Secondary Gear (centered at x = +1.08, y = +0.76 -> dist = 1.99, exact mesh!)
        const j = idx - 68; // 52 cubes
        const gx = 1.08, gy = 0.76;
        if (j < 24) {
          const layer = j < 12 ? -0.13 : 0.13;
          const a = ((j % 12) / 12) * Math.PI * 2 + theta2;
          lx = gx + Math.cos(a) * 0.64;
          ly = gy + Math.sin(a) * 0.64;
          lz = layer;
          sc = 0.265;
          col = layer > 0 ? "#f0b94b" : "#c78624";
        } else if (j < 42) {
          // 6 crisp meshing gear teeth (3 cubes each = 18)
          const k = j - 24;
          const tooth = Math.floor(k / 3);
          const sub = k % 3;
          const a = (tooth / 6) * Math.PI * 2 + theta2 + (sub - 1) * 0.1;
          const r = sub === 1 ? 0.94 : 0.86;
          lx = gx + Math.cos(a) * r;
          ly = gy + Math.sin(a) * r;
          lz = 0;
          sc = 0.21;
          col = "#c78624";
        } else {
          // 10 hub & spoke cubes
          const k = j - 42;
          const a = (k / 10) * Math.PI * 2 + theta2;
          const r = k % 2 === 0 ? 0.24 : 0.42;
          lx = gx + Math.cos(a) * r;
          ly = gy + Math.sin(a) * r;
          lz = 0.06;
          sc = 0.175;
          col = k % 2 === 0 ? "#f2ecff" : "#f0b94b";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 12;
      if (slot < 7) {
        const a = (slot / 6) * Math.PI * 2 + t * 0.9;
        const r = slot === 6 ? 0 : 0.22;
        const [dx, dy, dz] = rotateYX((-0.16 + Math.cos(a) * r) * boost, (-0.1 + Math.sin(a) * r) * boost, 0, 0.2, 0.18);
        return { dx, dy, dz, rx: 0.18, ry: 0.2, rz: 0, scale: sc, color: slot === 6 ? "#f2ecff" : pal.deep };
      }
      const k = slot - 7;
      const a = (k / 4) * Math.PI * 2 - t * 1.2;
      const r = k === 4 ? 0 : 0.16;
      const [dx, dy, dz] = rotateYX((0.24 + Math.cos(a) * r) * boost, (0.2 + Math.sin(a) * r) * boost, 0, 0.2, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: 0.2, rz: 0, scale: sc * 0.92, color: k === 4 ? "#f2ecff" : "#f0b94b" };
    },
  },

  /* --------------------------------------------------------------------------
     7B. ABOUT SYSTEMS & PLATFORM — Sleek 3D Data-Center Server Tower Rack!
     -------------------------------------------------------------------------- */
  "sys-server-rack": {
    hero(idx, _count, t, pal) {
      const rotY = -0.34 + Math.sin(t * 0.26) * 0.2;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = pal.primary;

      if (idx < 48) {
        // Architectural dark cabinet: base plinth (12) + top cooling crown (12) + 4 vertical corner posts (24)
        if (idx < 24) {
          const isTop = idx >= 12;
          const k = idx % 12;
          const c = (k % 4) - 1.5;
          const d = Math.floor(k / 4) - 1;
          lx = c * 0.38;
          ly = isTop ? 1.56 : -1.56;
          lz = d * 0.38;
          sc = 0.3;
          col = "#2b2a52";
        } else {
          const k = idx - 24;
          const post = Math.floor(k / 6); // 0..3
          const lvl = k % 6; // 0..5
          lx = post % 2 === 0 ? -0.76 : 0.76;
          lz = post < 2 ? -0.52 : 0.52;
          ly = -1.2 + lvl * 0.48;
          sc = 0.22;
          col = "#36386b";
        }
      } else if (idx < 98) {
        // 5 stacked horizontal server blades (10 cubes each = 50: 4x2 chassis + 2 vivid blinking front LEDs!)
        const j = idx - 48;
        const blade = Math.floor(j / 10); // 0..4
        const k = j % 10;
        const by = -1.16 + blade * 0.56;
        const breath = Math.sin(t * 1.8 + blade * 0.9) * 0.04;
        if (k < 8) {
          const c = (k % 4) - 1.5;
          const d = Math.floor(k / 4) - 0.5;
          lx = c * 0.32;
          ly = by;
          lz = d * 0.34 + breath;
          sc = 0.25;
          col = blade % 2 === 0 ? pal.deep : pal.primary;
        } else {
          // 2 bright live status LEDs on right front face of each blade!
          const led = k - 8;
          const blink = Math.sin(t * (3.1 + blade * 0.8) + led * 2.1) > -0.15;
          lx = 0.34 + led * 0.22;
          ly = by;
          lz = 0.42 + breath;
          sc = blink ? 0.165 : 0.12;
          col = !blink ? pal.light : led === 0 ? "#24d4a2" : "#5cc8ff";
        }
      } else {
        // 22 cubes: Twin vertical illuminated network/power conduit rails on left & right!
        const j = idx - 98;
        const side = j < 11 ? -1 : 1;
        const lvl = j % 11; // 0..10
        const wave = 0.8 + 0.3 * Math.sin(t * 3.4 - lvl * 0.65);
        lx = side * 1.12;
        ly = -1.25 + lvl * 0.25;
        lz = 0;
        sc = 0.15 * wave;
        col = wave > 0.98 ? "#5cc8ff" : pal.light;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc, pal) {
      const slot = idx % 11;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.34, 0, "#2b2a52"], [0, -0.34, 0, "#2b2a52"],
        [-0.14, 0.16, 0, pal.deep], [0.14, 0.16, 0, pal.primary],
        [-0.14, 0, 0, pal.primary], [0.14, 0, 0, pal.deep],
        [-0.14, -0.16, 0, pal.deep], [0.14, -0.16, 0, pal.primary],
        [0.18, 0.16, 0.18, "#24d4a2"], [0.18, 0, 0.18, "#5cc8ff"], [0.18, -0.16, 0.18, "#24d4a2"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.32 + Math.sin(t * 0.4) * 0.2, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: -0.32 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },
};
