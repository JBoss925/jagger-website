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

const VIOLET = "#2b2452";
const NAVY = "#344b8c";
const COBALT = "#2d6ae0";
const SKY = "#5b92f0";
const MAGENTA = "#e03c8a";
const ROSE = "#c9437d";
const GOLD = "#f5b83d";
const AMBER = "#d98a2b";
const EMERALD = "#22bf90";
const STEEL = "#7faef7";
const WHITE = "#ffffff";

// ============================================================================
// PRECOMPUTED EXACT VOXEL TABLES (SEASON 2C — 11 WILD-CARD CHALLENGERS)
// ============================================================================

// Helper: 8-cube hollow ring around (y=0, z=0) at fixed x
function ring8YZ(x: number, col: string, bottomCol?: string): Array<{ x: number; y: number; z: number; col: string }> {
  const coords: Array<[number, number]> = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
  ];
  return coords.map(([y, z]) => ({
    x,
    y,
    z,
    col: bottomCol && y === -1 ? bottomCol : col,
  }));
}

// 16-cube glossy `↖` OS cursor template
const CURSOR_16: Array<{ dx: number; dy: number; dz: number; isCore: boolean }> = [
  { dx: 0, dy: 0, dz: 0, isCore: false },
  { dx: 0, dy: -1, dz: 0, isCore: false }, { dx: 1, dy: -1, dz: 0, isCore: false },
  { dx: 0, dy: -2, dz: 0, isCore: false }, { dx: 1, dy: -2, dz: 0, isCore: false }, { dx: 2, dy: -2, dz: 0, isCore: false },
  { dx: 0, dy: -3, dz: 0, isCore: false }, { dx: 1, dy: -3, dz: 0, isCore: false }, { dx: 2, dy: -3, dz: 0, isCore: false }, { dx: 3, dy: -3, dz: 0, isCore: false },
  { dx: 0, dy: -4, dz: 0, isCore: false }, { dx: 2, dy: -4, dz: 0, isCore: false },
  { dx: 3, dy: -5, dz: 0, isCore: false },
  { dx: 1, dy: -2, dz: 1, isCore: true }, { dx: 1, dy: -3, dz: 1, isCore: true }, { dx: 2, dy: -3, dz: 1, isCore: true },
];

// 15-cube 2D arrow pointing RIGHT (`→`), extruded 2 deep = 30
const ARROW_RIGHT_15: Array<[number, number]> = [
  [-7, -1], [-7, 0], [-7, 1], [-6, -1], [-6, 0], [-6, 1],
  [-5, -2], [-5, -1], [-5, 0], [-5, 1], [-5, 2],
  [-4, -1], [-4, 0], [-4, 1],
  [-3, 0],
];

// 62-cube watertight 3D Earth Globe shell (r^2 in {3, 4, 5, 6})
const GLOBE_62: Array<{ x: number; y: number; z: number; isLand: boolean }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; isLand: boolean }> = [];
  for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
      for (let z = -2; z <= 2; z++) {
        const r2 = x * x + y * y + z * z;
        if (r2 >= 3 && r2 <= 6) {
          // Two stylized emerald continents: Americas (front-left) + Eurasia-Africa (right/back)
          const americas = x <= 0 && z >= 0 && y >= -1;
          const eurasia = x >= 1 && y >= -1 && z <= 1;
          pts.push({ x, y, z, isLand: americas || eurasia });
        }
      }
    }
  }
  return pts; // 62
})();

// ============================================================================
// SEASON 2 PART C — 11 WILD-CARD CHALLENGERS
// ============================================================================
export const VARIANTS_SEASON2_C: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1. JETSTREAM — Glass Weather Thermometer (Rising Mercury) + Puffy Cloud & Golden Sun!
     -------------------------------------------------------------------------- */
  "js-thermometer-cloud": {
    hero(idx, _count, t) {
      const P = 0.25;
      const rotY = -0.16 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.14;
      const level = 1.5 + 1.5 * Math.sin(t * 1.6); // smooth mercury height 0..3
      const cloudBob = Math.sin(t * 1.1) * 0.08;
      let lx = 0, ly = 0, lz = 0, sc = 0.215, col = COBALT;

      if (idx < 52) {
        // Thermometer (x in [-5..-2]): 19 Bulb + 19 Frame + 10 Mercury/Glass + 4 Ticks
        const therm: Array<{ x: number; y: number; z: number; col: string; isMerc?: boolean; isBulb?: boolean }> = [];
        for (let x = -5; x <= -3; x++) for (let y = -4; y <= -2; y++) therm.push({ x, y, z: 0, col: MAGENTA, isBulb: true });
        [[-4, -3], [-5, -3], [-3, -3], [-4, -4], [-4, -2]].forEach(([x, y]) => {
          therm.push({ x, y, z: 1, col: MAGENTA, isBulb: true });
          therm.push({ x, y, z: -1, col: ROSE, isBulb: true });
        });
        for (let y = -1; y <= 4; y++) {
          therm.push({ x: -5, y, z: 0, col: VIOLET });
          therm.push({ x: -3, y, z: 0, col: VIOLET });
          therm.push({ x: -4, y, z: -1, col: NAVY });
        }
        therm.push({ x: -4, y: 5, z: 0, col: VIOLET });
        for (let y = -1; y <= 4; y++) therm.push({ x: -4, y, z: 0, col: WHITE, isMerc: true });
        for (let y = -1; y <= 2; y++) therm.push({ x: -4, y, z: 1, col: MAGENTA, isMerc: true });
        therm.push({ x: -2, y: -1, z: 0, col: VIOLET }, { x: -2, y: 1, z: 0, col: VIOLET }, { x: -2, y: 3, z: 0, col: VIOLET }, { x: -4, y: 5, z: -1, col: NAVY });

        const tp = therm[idx];
        lx = tp.x * P; ly = tp.y * P; lz = tp.z * P;
        if (tp.isBulb) sc = 0.215 * (1 + 0.04 * Math.sin(t * 1.6));
        if (tp.isMerc) {
          const filled = tp.y <= level;
          col = filled ? MAGENTA : WHITE;
          if (tp.z === 1 && !filled) sc = 0.14;
        } else {
          col = tp.col;
        }
      } else if (idx < 100) {
        // 48-cube Puffy Cumulus Cloud (x in [0..5], y in [-2..1])
        const cloud: Array<{ x: number; y: number; z: number; col: string }> = [];
        for (let x = 0; x <= 4; x++) { cloud.push({ x, y: -2, z: 0, col: COBALT }, { x, y: -2, z: 1, col: COBALT }); }
        for (let x = 1; x <= 3; x++) cloud.push({ x, y: -2, z: 2, col: COBALT });
        for (let x = 0; x <= 5; x++) { cloud.push({ x, y: -1, z: 0, col: NAVY }, { x, y: -1, z: 1, col: SKY }); }
        for (let x = 0; x <= 4; x++) cloud.push({ x, y: -1, z: 2, col: WHITE });
        for (let x = 1; x <= 4; x++) cloud.push({ x, y: 0, z: 0, col: SKY });
        for (let x = 0; x <= 4; x++) cloud.push({ x, y: 0, z: 1, col: WHITE });
        for (let x = 1; x <= 3; x++) cloud.push({ x, y: 0, z: 2, col: WHITE });
        cloud.push({ x: 1, y: 1, z: 0, col: SKY }, { x: 2, y: 1, z: 0, col: SKY },
          { x: 1, y: 1, z: 1, col: WHITE }, { x: 2, y: 1, z: 1, col: WHITE }, { x: 3, y: 1, z: 1, col: WHITE }, { x: 4, y: 1, z: 1, col: SKY });
        const cp = cloud[idx - 52];
        lx = cp.x * P; ly = cp.y * P + cloudBob; lz = cp.z * P; col = cp.col;
      } else {
        // 20-cube Golden Sun behind cloud at (3, 4, -1)
        const sun: Array<[number, number, number, boolean]> = [];
        for (let x = 2; x <= 4; x++) for (let y = 3; y <= 5; y++) sun.push([x, y, -1, false]);
        [[3, 4], [2, 4], [4, 4], [3, 5], [3, 3]].forEach(([x, y]) => sun.push([x, y, 0, false]));
        [[3, 6], [5, 4], [1, 4], [5, 6], [1, 6], [5, 2]].forEach(([x, y]) => sun.push([x, y, -1, true]));
        const k = idx - 100;
        const sp = sun[k];
        lx = sp[0] * P; ly = sp[1] * P; lz = sp[2] * P;
        sc = sp[3] ? 0.215 * (0.86 + 0.14 * Math.sin(t * 2.4 + k * 1.05)) : 0.215;
        col = sp[3] ? AMBER : GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, -0.22, 0, MAGENTA], [-0.32, -0.02, 0, MAGENTA], [-0.32, 0.18, 0, VIOLET], [-0.32, 0.36, 0, VIOLET],
        [0.16, 0.36, -0.1, GOLD], [0.34, 0.36, -0.1, GOLD], [0.34, 0.18, -0.1, AMBER],
        [-0.04, -0.14, 0, COBALT], [0.16, -0.14, 0, COBALT], [0.36, -0.14, 0, COBALT],
        [0.04, 0.06, 0, WHITE], [0.24, 0.06, 0, SKY],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2. JETSTREAM — Red-and-White Striped Airport Windsock Rippling Under Sun & Cloud!
     -------------------------------------------------------------------------- */
  "js-windsock-vane": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotY = -0.18 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = VIOLET;

      if (idx < 25) {
        // Mast, Vane Cross-Arm & Throat Hoop (25)
        const mast: Array<{ x: number; y: number; z: number; col: string }> = [
          { x: -4, y: -4, z: 0, col: VIOLET }, { x: -5, y: -4, z: 0, col: VIOLET }, { x: -3, y: -4, z: 0, col: VIOLET },
          { x: -4, y: -4, z: 1, col: VIOLET }, { x: -4, y: -4, z: -1, col: VIOLET }, { x: -4, y: -3, z: 0, col: VIOLET },
          { x: -4, y: -2, z: 0, col: NAVY }, { x: -4, y: -1, z: 0, col: NAVY }, { x: -4, y: 0, z: 0, col: NAVY },
          { x: -4, y: 1, z: 0, col: NAVY }, { x: -4, y: 2, z: 0, col: NAVY }, { x: -4, y: 3, z: 0, col: GOLD },
          { x: -5, y: 2, z: 0, col: VIOLET }, { x: -3, y: 2, z: 0, col: VIOLET },
          { x: -3, y: 1, z: 0, col: VIOLET }, { x: -3, y: 0, z: 0, col: VIOLET }, { x: -3, y: -1, z: 0, col: VIOLET },
          ...ring8YZ(-2, VIOLET),
        ];
        const m = mast[idx];
        lx = m.x * P; ly = m.y * P; lz = m.z * P; col = m.col;
      } else if (idx < 73) {
        // 48-cube Striped Tapered Windsock rippling smoothly in a sine breeze!
        const sock: Array<{ x: number; y: number; z: number; col: string }> = [
          ...ring8YZ(-1, MAGENTA),
          ...ring8YZ(0, WHITE, "#c7d8ff"),
          ...ring8YZ(1, MAGENTA),
          ...ring8YZ(2, WHITE, "#c7d8ff"),
          { x: 3, y: 0, z: 0, col: MAGENTA }, { x: 3, y: 1, z: 0, col: MAGENTA }, { x: 3, y: -1, z: 0, col: MAGENTA }, { x: 3, y: 0, z: 1, col: MAGENTA }, { x: 3, y: 0, z: -1, col: MAGENTA },
          { x: 4, y: 0, z: 0, col: WHITE }, { x: 4, y: 1, z: 0, col: WHITE }, { x: 4, y: -1, z: 0, col: "#c7d8ff" }, { x: 4, y: 0, z: 1, col: WHITE }, { x: 4, y: 0, z: -1, col: "#c7d8ff" },
          { x: 5, y: 0, z: 0, col: ROSE }, { x: 5, y: -1, z: 0, col: ROSE }, { x: 5, y: 0, z: 1, col: ROSE }, { x: 5, y: 0, z: -1, col: ROSE },
          { x: 6, y: 0, z: 0, col: ROSE }, { x: 6, y: -1, z: 0, col: ROSE },
        ];
        const sp = sock[idx - 25];
        const amp = 0.055 * (sp.x + 2);
        const dy = amp * Math.sin(t * 3.6 - 0.65 * sp.x);
        const dz = 0.65 * amp * Math.cos(t * 2.8 - 0.55 * sp.x);
        lx = sp.x * P; ly = sp.y * P + dy; lz = sp.z * P + dz; col = sp.col;
      } else if (idx < 90) {
        // 17-cube Golden Sun upper-right
        const sun: Array<[number, number, number]> = [];
        for (let x = 3; x <= 5; x++) for (let y = 3; y <= 5; y++) sun.push([x, y, -1]);
        [[4, 4], [3, 4], [5, 4], [4, 5], [4, 3]].forEach(([x, y]) => sun.push([x, y, 0]));
        sun.push([4, 6, -1], [6, 4, -1], [6, 6, -1]);
        const sp = sun[idx - 73];
        lx = sp[0] * P; ly = sp[1] * P; lz = sp[2] * P; col = idx >= 87 ? AMBER : GOLD;
      } else {
        // 30-cube Sky Cloud upper-center
        const cloud: Array<{ x: number; y: number; z: number; col: string }> = [];
        for (let x = -2; x <= 2; x++) cloud.push({ x, y: 3, z: 0, col: COBALT });
        for (let x = -2; x <= 3; x++) cloud.push({ x, y: 3, z: 1, col: COBALT });
        for (let x = -1; x <= 2; x++) cloud.push({ x, y: 3, z: 2, col: SKY });
        for (let x = -1; x <= 2; x++) { cloud.push({ x, y: 4, z: 0, col: SKY }, { x, y: 4, z: 1, col: WHITE }); }
        for (let x = 0; x <= 2; x++) cloud.push({ x, y: 4, z: 2, col: WHITE });
        cloud.push({ x: 0, y: 5, z: 0, col: SKY }, { x: 1, y: 5, z: 0, col: SKY }, { x: 0, y: 5, z: 1, col: WHITE }, { x: 1, y: 5, z: 1, col: WHITE });
        const cp = cloud[idx - 90];
        lx = cp.x * P + Math.sin(t * 0.8) * 0.1; ly = cp.y * P; lz = cp.z * P; col = cp.col;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.3, 0, VIOLET], [-0.36, -0.1, 0, NAVY], [-0.36, 0.1, 0, NAVY], [-0.36, 0.28, 0, GOLD],
        [-0.18, 0.12, 0, MAGENTA], [-0.02, 0.12, 0, WHITE], [0.14, 0.1, 0, MAGENTA], [0.3, 0.08, 0, WHITE], [0.44, 0.06, 0, ROSE],
        [0.14, 0.36, -0.1, GOLD], [0.3, 0.36, -0.1, AMBER], [-0.04, 0.36, 0, COBALT],
      ];
      const p = pts[slot];
      const wave = slot >= 4 && slot <= 8 ? Math.sin(t * 3.6 - slot * 0.8) * 0.04 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + wave) * boost, p[2] * boost, Math.sin(t * 0.4) * 0.2, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3. LIVEBOARD — 3-Legged Studio Easel + Framed Whiteboard + Sticky Notes + 2 `↖` Cursors!
     -------------------------------------------------------------------------- */
  "lb-easel-cursors": {
    hero(idx, _count, t) {
      const P = 0.24;
      const rotY = -0.14 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.12;
      let lx = 0, ly = 0, lz = 0, sc = 0.205, col = VIOLET;

      if (idx < 22) {
        // 3-Legged Studio Easel Stand + Marker Tray
        const stand: Array<[number, number, number, string]> = [
          [-3, -2, 0, AMBER], [-3, -3, 0, AMBER], [-4, -4, 0, AMBER], [-4, -5, 0, VIOLET],
          [3, -2, 0, AMBER], [3, -3, 0, AMBER], [4, -4, 0, AMBER], [4, -5, 0, VIOLET],
          [0, 2, -1, AMBER], [0, 1, -1, AMBER], [0, 0, -2, AMBER], [0, -1, -2, AMBER], [0, -2, -3, AMBER], [0, -3, -3, AMBER], [0, -4, -4, VIOLET],
          [0, 5, 0, AMBER], [0, 5, -1, AMBER],
          [-2, -1, 1, VIOLET], [-1, -1, 1, COBALT], [0, -1, 1, VIOLET], [1, -1, 1, MAGENTA], [2, -1, 1, VIOLET],
        ];
        const s = stand[idx];
        lx = s[0] * P; ly = s[1] * P; lz = s[2] * P; col = s[3];
      } else if (idx < 76) {
        // Framed Whiteboard (26 dark frame + 28 framed white canvas = 54)
        const j = idx - 22;
        if (j < 26) {
          let gx = 0, gy = 0;
          if (j < 9) { gx = j - 4; gy = 4; }
          else if (j < 18) { gx = j - 9 - 4; gy = -1; }
          else if (j < 22) { gx = -4; gy = j - 18; }
          else { gx = 4; gy = j - 22; }
          lx = gx * P; ly = gy * P; lz = 0; col = VIOLET;
        } else {
          const k = j - 26;
          lx = ((k % 7) - 3) * P;
          ly = Math.floor(k / 7) * P;
          lz = 0;
          col = WHITE;
        }
      } else if (idx < 88) {
        // 3 Colorful Sticky Notes (4 cubes each = 12)
        const j = idx - 76;
        const note = Math.floor(j / 4);
        const sub = j % 4;
        const origins: Array<[number, number, string]> = [[-3, 2, GOLD], [1, 2, EMERALD], [-2, 0, MAGENTA]];
        const [ox, oy, c] = origins[note];
        lx = (ox + (sub % 2)) * P;
        ly = (oy + Math.floor(sub / 2)) * P;
        lz = 0.85 * P;
        sc = 0.195;
        col = c;
      } else {
        // Two Oversized 3D `↖` OS Cursors (16 each = 32) gliding smoothly across the board!
        const j = idx - 88;
        const isPink = j >= 16;
        const cp = CURSOR_16[j % 16];
        const bx = -2.4 + 0.45 * Math.sin(t * 1.2);
        const by = 2.2 + 0.35 * Math.sin(t * 2.4);
        const px = 1.4 + 0.42 * Math.cos(t * 1.1);
        const py = 2.6 + 0.38 * Math.sin(t * 1.1 + 0.8);
        lx = ((isPink ? px : bx) + cp.dx * 0.68) * P;
        ly = ((isPink ? py : by) + cp.dy * 0.68) * P;
        lz = (1.65 + cp.dz * 0.65) * P;
        sc = 0.155;
        col = cp.isCore ? WHITE : isPink ? MAGENTA : COBALT;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.24, 0, VIOLET], [0, 0.24, 0, VIOLET], [0.24, 0.24, 0, VIOLET],
        [-0.24, 0.04, 0, GOLD], [0, 0.04, 0, WHITE], [0.24, 0.04, 0, EMERALD],
        [-0.22, -0.24, 0, AMBER], [0.22, -0.24, 0, AMBER],
        [-0.18, 0.02, 0.2, COBALT], [-0.08, -0.08, 0.2, COBALT],
        [0.18, 0.1, 0.2, MAGENTA], [0.28, 0.0, 0.2, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.12);
      return { dx, dy, dz, rx: 0.12, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4. AIXC COMPRESSOR — Archival File Folder Squeezed by Giant Golden `→ [■] ←` Arrows!
     -------------------------------------------------------------------------- */
  "aixc-folder-squeeze": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotY = -0.14 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.14;
      const sq = 0.5 + 0.5 * Math.sin(t * 2.2);
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = COBALT;

      if (idx < 60) {
        // Center 3D Archival File Folder (28 back+tab + 12 mid gusset/paper + 20 front cobalt flap)
        const sx = 1 - 0.16 * sq;
        const sy = 1 + 0.07 * sq;
        if (idx < 25) {
          lx = ((idx % 5) - 2) * P * sx;
          ly = (Math.floor(idx / 5) - 2) * P * sy;
          lz = -1 * P;
          col = NAVY;
        } else if (idx < 28) {
          lx = (-2 + (idx - 25)) * P * sx;
          ly = 3 * P * sy;
          lz = -1 * P;
          col = GOLD;
        } else if (idx < 40) {
          const mid: Array<[number, number, string]> = [
            [-1, 2, WHITE], [0, 2, WHITE], [1, 2, WHITE],
            [-2, 2, VIOLET], [2, 2, VIOLET], [-2, -1, VIOLET], [2, -1, VIOLET],
            [-2, -2, VIOLET], [-1, -2, VIOLET], [0, -2, VIOLET], [1, -2, VIOLET], [2, -2, VIOLET],
          ];
          const m = mid[idx - 28];
          lx = m[0] * P * sx; ly = m[1] * P * sy; lz = 0; col = m[2];
        } else {
          const k = idx - 40; // 5x4 front flap
          const c = (k % 5) - 2;
          const r = Math.floor(k / 5) - 2;
          lx = c * P * sx; ly = r * P * sy; lz = 1 * P;
          col = r === 0 && Math.abs(c) <= 1 ? (sq > 0.65 ? GOLD : EMERALD) : COBALT;
        }
      } else {
        // Left Arrow `→` (30) & Right Arrow `←` (30) thrusting smoothly inward!
        const j = idx - 60;
        const isRight = j >= 30;
        const k = j % 30;
        const isFront = k < 15;
        const ap = ARROW_RIGHT_15[k % 15];
        const thrust = 0.28 * sq;
        lx = (isRight ? -ap[0] * P - thrust : ap[0] * P + thrust);
        ly = ap[1] * P;
        lz = (isFront ? 0.6 : -0.3) * P;
        sc = 0.195;
        col = isFront ? GOLD : AMBER;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const sq = 0.05 * Math.sin(t * 2.4);
      const pts: Array<[number, number, number, string]> = [
        [-0.08, 0.24, 0, GOLD], [0.08, 0.24, 0, NAVY],
        [-0.08, 0.04, 0, COBALT], [0.08, 0.04, 0, EMERALD],
        [-0.08, -0.16, 0, COBALT], [0.08, -0.16, 0, COBALT],
        [-0.44 + sq, 0.16, 0, GOLD], [-0.3 + sq, 0.02, 0, GOLD], [-0.44 + sq, -0.12, 0, GOLD],
        [0.44 - sq, 0.16, 0, GOLD], [0.3 - sq, 0.02, 0, GOLD], [0.44 - sq, -0.12, 0, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5. JAGGER GAMES — Iconic 3D Retro Handheld Console (GameBoy + Glowing Puzzle LCD!)
     -------------------------------------------------------------------------- */
  "games-handheld": {
    hero(idx, _count, t) {
      const P = 0.24;
      const rotY = Math.sin(t * 0.45) * 0.24;
      const rotX = 0.12 + Math.cos(t * 0.8) * 0.06;
      const pressA = -0.06 * (0.5 + 0.5 * Math.sin(t * 3.8));
      const pressB = -0.06 * (0.5 + 0.5 * Math.sin(t * 3.8 + Math.PI));
      let lx = 0, ly = 0, lz = 0, sc = 0.205, col = "#6b5ce7";

      if (idx < 47) {
        // Front Chassis (7x9 minus chamfer (3,-4) and 5x3 LCD) = 47
        const body: Array<{ x: number; y: number; col: string }> = [];
        for (let y = -4; y <= 4; y++) {
          for (let x = -3; x <= 3; x++) {
            if (x === 3 && y === -4) continue;
            if (x >= -2 && x <= 2 && y >= 1 && y <= 3) continue;
            const c = (y === -4 && (x === -1 || x === 0)) ? NAVY : (x === 2 && y === -4) ? VIOLET : "#7c68e6";
            body.push({ x, y, col: c });
          }
        }
        const b = body[idx];
        lx = b.x * P; ly = b.y * P; lz = 0; col = b.col;
      } else if (idx < 62) {
        // 15-cube Glowing Emerald Pixel-Puzzle LCD Screen (5x3)!
        const k = idx - 47;
        const x = (k % 5) - 2;
        const y = 1 + Math.floor(k / 5);
        lx = x * P; ly = y * P; lz = 0.04 * P;
        const isT = (y === 3 && Math.abs(x) <= 1) || (y === 2 && x === 0);
        const isBlue = y === 1 && (x === -2 || x === -1);
        const isPink = y === 1 && x === 2;
        col = isT ? GOLD : isBlue ? COBALT : isPink ? MAGENTA : EMERALD;
      } else if (idx < 82) {
        // 20-cube Raised Dark-Plum Screen Bezel (perimeter of 7x5 at y in [0..4], z=1)
        const j = idx - 62;
        let x = 0, y = 0;
        if (j < 7) { x = j - 3; y = 4; }
        else if (j < 14) { x = j - 7 - 3; y = 0; }
        else if (j < 17) { x = -3; y = 1 + (j - 14); }
        else { x = 3; y = 1 + (j - 17); }
        lx = x * P; ly = y * P; lz = 0.9 * P;
        col = x === -3 && y === 2 ? MAGENTA : VIOLET;
      } else if (idx < 91) {
        // 9 Tactile Controls: Cross D-pad (5) + Crimson A/B Buttons (2) + Start/Select (2)
        const ctrl: Array<[number, number, string, number]> = [
          [-2, -2, VIOLET, 0], [-3, -2, VIOLET, 0], [-1, -2, VIOLET, 0], [-2, -1, VIOLET, 0], [-2, -3, VIOLET, 0],
          [1, -3, MAGENTA, pressB], [2, -2, MAGENTA, pressA],
          [-1, -4, NAVY, 0], [0, -4, NAVY, 0],
        ];
        const c = ctrl[idx - 82];
        lx = c[0] * P; ly = c[1] * P; lz = 0.9 * P + c[3]; col = c[2];
      } else {
        // 29 cubes: Back Housing Shell (27) + Top Gold Game Cartridge (2)!
        const j = idx - 91;
        if (j < 27) {
          const back: Array<[number, number]> = [];
          for (let x = -3; x <= 3; x++) back.push([x, 4]);
          for (let x = -3; x <= 2; x++) back.push([x, -4]);
          for (let y = -3; y <= 3; y++) back.push([-3, y], [3, y]);
          const bp = back[j];
          lx = bp[0] * P; ly = bp[1] * P; lz = -1 * P; col = NAVY;
        } else {
          lx = (j === 27 ? -1 : 0) * P; ly = 5 * P; lz = -0.8 * P; col = GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.2, 0.34, 0, VIOLET], [0, 0.34, 0, VIOLET], [0.2, 0.34, 0, VIOLET],
        [-0.2, 0.14, 0, EMERALD], [0, 0.14, 0, GOLD], [0.2, 0.14, 0, EMERALD],
        [-0.2, -0.06, 0, "#7c68e6"], [0, -0.06, 0, "#7c68e6"], [0.2, -0.06, 0, "#7c68e6"],
        [-0.2, -0.26, 0.08, VIOLET], [0, -0.26, 0, "#7c68e6"], [0.2, -0.26, 0.08, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.26, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.26, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6. HEARTH — Vintage Studio Analog VU Meter Gauge (Warm Amber Dial + Bouncing Needle!)
     -------------------------------------------------------------------------- */
  "hearth-vu-needle": {
    hero(idx, _count, t) {
      const P = 0.24;
      const rotY = -0.14 + Math.sin(t * 0.3) * 0.16;
      const rotX = 0.14;
      const needleAng = 0.1 + 0.52 * Math.sin(t * 2.5) + 0.2 * Math.sin(t * 5.6 + 0.7) + 0.08 * Math.cos(t * 8.4);
      let lx = 0, ly = 0, lz = 0, sc = 0.205, col = VIOLET;

      if (idx < 35) {
        // Warm Golden-Amber Dial Face (7x5 at z=0) + Arched Emerald->Gold->Redline dB Scale!
        const x = (idx % 7) - 3;
        const y = Math.floor(idx / 7) - 2;
        lx = x * P; ly = y * P; lz = 0;
        if ((x === -3 && y === 0) || (x === -2 && y === 1) || (x === -1 && y === 2)) col = EMERALD;
        else if ((x === 0 || x === 1) && y === 2) col = GOLD;
        else if ((x === 2 && y === 1) || (x === 3 && y === 0)) col = needleAng > 0.25 ? MAGENTA : ROSE;
        else col = y === -2 ? GOLD : "#fff0c2";
      } else if (idx < 111) {
        // 3-Layer Studio Rack Housing (28 mid + 24 front lip + 24 back = 76)
        const j = idx - 35;
        if (j < 28) {
          let x = 0, y = 0;
          if (j < 9) { x = j - 4; y = 3; }
          else if (j < 18) { x = j - 9 - 4; y = -3; }
          else if (j < 23) { x = -4; y = j - 18 - 2; }
          else { x = 4; y = j - 23 - 2; }
          lx = x * P; ly = y * P; lz = 0; col = VIOLET;
        } else {
          const isBack = j >= 52;
          const k = (j - 28) % 24;
          let x = 0, y = 0;
          if (k < 7) { x = k - 3; y = 3; }
          else if (k < 14) { x = k - 7 - 3; y = -3; }
          else if (k < 19) { x = -4; y = k - 14 - 2; }
          else { x = 4; y = k - 19 - 2; }
          lx = x * P; ly = y * P; lz = (isBack ? -1 : 1) * P; col = isBack ? NAVY : VIOLET;
        }
      } else if (idx < 115) {
        // Brass Pivot Hub (4)
        const k = idx - 111;
        lx = (k < 3 ? k - 1 : 0) * P;
        ly = -2 * P;
        lz = (k === 3 ? 1.85 : 1.0) * P;
        col = k === 3 ? GOLD : VIOLET;
      } else {
        // 5-segment Sweeping Dark Analog Needle bouncing smoothly around (0, -2)!
        const seg = idx - 114; // 1..5
        const r = seg * 0.78 * P;
        lx = Math.sin(needleAng) * r;
        ly = -2 * P + Math.cos(needleAng) * r;
        lz = 1.28 * P;
        sc = 0.145;
        col = seg === 5 ? MAGENTA : VIOLET;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, idx >= 115 ? -needleAng : 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.22, -0.22, 0, VIOLET], [0, -0.22, 0, VIOLET], [0.22, -0.22, 0, VIOLET],
        [-0.36, 0, 0, VIOLET], [-0.36, 0.2, 0, VIOLET], [0.36, 0, 0, VIOLET], [0.36, 0.2, 0, VIOLET],
        [-0.18, 0.22, 0, EMERALD], [0, 0.24, 0, GOLD], [0.18, 0.22, 0, MAGENTA],
        [0, 0, 0, "#fff0c2"], [0.06, 0.08, 0.18, VIOLET],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7. PALMETTO — Sculpted 3D Emerald Leaf + Golden Vein Over Sunburst & Mini Solar Grid!
     -------------------------------------------------------------------------- */
  "palmetto-eco-leaf": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotY = -0.2 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = EMERALD;

      if (idx < 42) {
        // Mini Solar Grid Base (18 bevel frame + 10 cobalt/gold PV cells + 14 under-deck/feet)
        const base: Array<{ x: number; y: number; z: number; col: string }> = [];
        for (let x = -3; x <= 3; x++) { base.push({ x, y: -3, z: -1, col: VIOLET }, { x, y: -3, z: 2, col: VIOLET }); }
        base.push({ x: -3, y: -3, z: 0, col: VIOLET }, { x: -3, y: -3, z: 1, col: VIOLET }, { x: 3, y: -3, z: 0, col: VIOLET }, { x: 3, y: -3, z: 1, col: VIOLET });
        for (let x = -2; x <= 2; x++) {
          const shim = Math.sin(t * 2.5 - x * 0.9) > 0.7;
          base.push({ x, y: -3, z: 0, col: x === 0 ? GOLD : shim ? SKY : COBALT });
          base.push({ x, y: -3, z: 1, col: x === 0 ? GOLD : shim ? SKY : COBALT });
        }
        for (let x = -2; x <= 2; x++) { base.push({ x, y: -4, z: 0, col: NAVY }, { x, y: -4, z: 1, col: NAVY }); }
        base.push({ x: -3, y: -4, z: -1, col: VIOLET }, { x: 3, y: -4, z: -1, col: VIOLET }, { x: -3, y: -4, z: 2, col: VIOLET }, { x: 3, y: -4, z: 2, col: VIOLET });
        const bp = base[idx];
        lx = bp.x * P; ly = bp.y * P; lz = bp.z * P; col = bp.col;
      } else if (idx < 66) {
        // 24-cube Golden Sunburst Halo upper-right behind leaf!
        const sun: Array<[number, number, number, boolean]> = [];
        for (let x = 1; x <= 3; x++) for (let y = 1; y <= 3; y++) sun.push([x, y, -2, false]);
        for (let x = 2; x <= 3; x++) for (let y = 2; y <= 3; y++) sun.push([x, y, -1, false]);
        [[2, 4], [2, 5], [4, 2], [5, 2], [4, 4], [0, 4], [4, 0], [0, 2], [-1, 2], [2, 0], [2, -1]].forEach(([x, y]) => sun.push([x, y, -2, true]));
        const k = idx - 42;
        const sp = sun[k];
        lx = sp[0] * P; ly = sp[1] * P; lz = sp[2] * P;
        sc = sp[3] ? 0.195 * (0.86 + 0.14 * Math.sin(t * 2.4 + k * 0.7)) : 0.195;
        col = sp[2] === -1 ? "#ffd166" : GOLD;
      } else {
        // 54-cube Sculpted 3D Emerald Leaf with Golden Vein swaying gently!
        const leaf: Array<{ x: number; y: number; z: number; col: string }> = [
          { x: -1, y: -2, z: 0, col: "#169970" }, { x: -1, y: -1, z: 0, col: "#169970" }, { x: -1, y: -2, z: 1, col: "#169970" },
          { x: -1, y: 0, z: 1, col: GOLD }, { x: -1, y: 1, z: 1, col: GOLD }, { x: 0, y: 2, z: 1, col: GOLD }, { x: 0, y: 3, z: 1, col: GOLD }, { x: 1, y: 4, z: 1, col: GOLD },
          // Blade (29)
          { x: -2, y: -1, z: 0, col: EMERALD }, { x: 0, y: -1, z: 0, col: EMERALD },
          ...[-3, -2, -1, 0, 1].map((x) => ({ x, y: 0, z: 0, col: EMERALD })),
          ...[-3, -2, -1, 0, 1, 2].map((x) => ({ x, y: 1, z: 0, col: EMERALD })),
          ...[-3, -2, -1, 0, 1, 2].map((x) => ({ x, y: 2, z: 0, col: EMERALD })),
          ...[-2, -1, 0, 1, 2].map((x) => ({ x, y: 3, z: 0, col: EMERALD })),
          ...[-1, 0, 1].map((x) => ({ x, y: 4, z: 0, col: EMERALD })),
          { x: 1, y: 5, z: 0, col: EMERALD }, { x: 2, y: 5, z: 0, col: EMERALD },
          // Cupped relief (10)
          { x: -2, y: 0, z: 1, col: EMERALD }, { x: -2, y: 1, z: 1, col: EMERALD }, { x: -2, y: 2, z: 1, col: EMERALD }, { x: -1, y: 2, z: 1, col: EMERALD }, { x: -1, y: 3, z: 1, col: EMERALD },
          { x: 0, y: 0, z: 1, col: "#19a87d" }, { x: 0, y: 1, z: 1, col: "#19a87d" }, { x: 1, y: 1, z: 1, col: "#19a87d" }, { x: 1, y: 2, z: 1, col: "#19a87d" }, { x: 1, y: 3, z: 1, col: "#19a87d" },
          // Back spine (7)
          { x: -1, y: 0, z: -1, col: "#148a66" }, { x: -1, y: 1, z: -1, col: "#148a66" }, { x: 0, y: 1, z: -1, col: "#148a66" },
          { x: -1, y: 2, z: -1, col: "#148a66" }, { x: 0, y: 2, z: -1, col: "#148a66" }, { x: 0, y: 3, z: -1, col: "#148a66" }, { x: 1, y: 3, z: -1, col: "#148a66" },
        ];
        const lp = leaf[idx - 66];
        const sway = Math.sin(t * 1.4) * 0.08;
        const dx0 = (lp.x + 1) * P;
        const dy0 = (lp.y + 2) * P;
        lx = -1 * P + dx0 * Math.cos(sway) - dy0 * Math.sin(sway);
        ly = -2 * P + dx0 * Math.sin(sway) + dy0 * Math.cos(sway);
        lz = lp.z * P;
        col = lp.col;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.22, -0.26, 0, VIOLET], [0, -0.26, 0, COBALT], [0.22, -0.26, 0, VIOLET],
        [0.2, 0.2, -0.14, GOLD], [0.36, 0.2, -0.14, GOLD], [0.2, 0.36, -0.14, AMBER],
        [-0.22, -0.02, 0, EMERALD], [0, -0.02, 0, EMERALD], [-0.22, 0.16, 0, EMERALD],
        [0, 0.16, 0.08, GOLD], [-0.12, 0.32, 0, EMERALD], [0.1, 0.34, 0, EMERALD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.2 + Math.sin(t * 0.4) * 0.2, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: -0.2 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     8. INCITE ANALYTICS — Medical Stethoscope Coiled Around Glossy Beating Crimson Heart!
     -------------------------------------------------------------------------- */
  "incite-stethoscope": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotY = Math.sin(t * 0.3) * 0.2;
      const rotX = 0.14;
      const beat = 1 + 0.08 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.6), 4) + 0.045 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.6 - 0.85), 4);
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = MAGENTA;

      if (idx < 56) {
        // Glossy 3D Crimson Heart (27 mid + 16 front + 13 back = 56)
        const heart: Array<{ x: number; y: number; z: number; col: string }> = [
          ...[-2, -1, 1, 2].map((x) => ({ x, y: 2, z: 0, col: MAGENTA })),
          ...[-3, -2, -1, 0, 1, 2, 3].map((x) => ({ x, y: 1, z: 0, col: MAGENTA })),
          ...[-3, -2, -1, 0, 1, 2, 3].map((x) => ({ x, y: 0, z: 0, col: MAGENTA })),
          ...[-2, -1, 0, 1, 2].map((x) => ({ x, y: -1, z: 0, col: MAGENTA })),
          ...[-1, 0, 1].map((x) => ({ x, y: -2, z: 0, col: MAGENTA })),
          { x: 0, y: -3, z: 0, col: MAGENTA },
          // Front bevel (16)
          { x: -1, y: 2, z: 1, col: MAGENTA }, { x: 1, y: 2, z: 1, col: MAGENTA },
          ...[-2, -1, 0, 1, 2].map((x) => ({ x, y: 1, z: 1, col: x <= -1 ? WHITE : MAGENTA })),
          ...[-2, -1, 0, 1, 2].map((x) => ({ x, y: 0, z: 1, col: MAGENTA })),
          ...[-1, 0, 1].map((x) => ({ x, y: -1, z: 1, col: MAGENTA })),
          { x: 0, y: -2, z: 1, col: MAGENTA },
          // Back bevel (13)
          ...[-2, -1, 0, 1, 2].map((x) => ({ x, y: 1, z: -1, col: ROSE })),
          ...[-2, -1, 0, 1, 2].map((x) => ({ x, y: 0, z: -1, col: ROSE })),
          ...[-1, 0, 1].map((x) => ({ x, y: -1, z: -1, col: ROSE })),
        ];
        const hp = heart[idx];
        lx = hp.x * P * beat; ly = hp.y * P * beat; lz = hp.z * P * beat; col = hp.col;
      } else if (idx < 74) {
        // 18-cube Binaural Earpieces & Y-Fork top-left
        const head: Array<[number, number, number, string]> = [
          [-5, 5, 0, VIOLET], [-2, 5, 0, VIOLET],
          [-6, 5, 0, STEEL], [-6, 4, 0, STEEL], [-6, 3, 0, STEEL], [-5, 2, 0, STEEL],
          [-1, 5, 0, STEEL], [-1, 4, 0, STEEL], [-2, 3, 0, STEEL], [-3, 3, 0, STEEL], [-4, 2, 0, STEEL],
          [-5, 1, 0, VIOLET], [-4, 1, 0, VIOLET], [-5, 1, 1, VIOLET], [-4, 1, 1, VIOLET],
          [-6, 4, 1, STEEL], [-1, 4, 1, STEEL], [-5, 2, 1, STEEL],
        ];
        const h = head[idx - 56];
        lx = h[0] * P; ly = h[1] * P; lz = h[2] * P; col = h[3];
      } else if (idx < 102) {
        // 28-cube Coiled Flexible Tubing cradling bottom of heart (14 nodes x 2 z-layers)
        const nodes: Array<[number, number]> = [
          [-5, 0], [-5, -1], [-5, -2], [-4, -3], [-3, -4], [-2, -4], [-1, -4],
          [0, -4], [1, -4], [2, -4], [3, -4], [4, -3], [5, -2], [5, -1],
        ];
        const j = idx - 74;
        const ni = j % 14;
        const isFront = j < 14;
        const pulse = 0.94 + 0.1 * Math.sin(t * 3.8 - ni * 0.5);
        lx = nodes[ni][0] * P; ly = nodes[ni][1] * P; lz = (isFront ? 1 : 0) * P;
        sc = 0.195 * pulse;
        col = isFront ? VIOLET : NAVY;
      } else {
        // 18-cube Metallic Chestpiece Diaphragm Bell on right!
        const j = idx - 102;
        const isFront = j >= 9;
        const k = j % 9;
        const x = 4 + (k % 3);
        const y = Math.floor(k / 3);
        const dz = Math.sin(t * 2.6 - 0.3) * 0.06;
        lx = x * P; ly = y * P; lz = (isFront ? 1 : 0) * P + dz;
        col = !isFront ? NAVY : (x === 5 && y === 1 ? WHITE : STEEL);
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.14, 0.2, 0, MAGENTA], [0.14, 0.2, 0, MAGENTA], [-0.16, 0.02, 0, MAGENTA], [0, 0.02, 0.08, WHITE], [0.16, 0.02, 0, MAGENTA], [0, -0.14, 0, MAGENTA],
        [-0.36, 0.34, 0, STEEL], [-0.36, 0.16, 0, STEEL], [-0.36, -0.04, 0, VIOLET],
        [-0.18, -0.32, 0, VIOLET], [0.18, -0.32, 0, VIOLET], [0.34, -0.14, 0, STEEL],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     9. CORNELL DTI LEAD / LEADERSHIP — Striped Coastal Lighthouse + Twin 360° Golden Beams!
     -------------------------------------------------------------------------- */
  "lead-lighthouse": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotY = -0.22 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = MAGENTA;

      if (idx < 88) {
        // Base/Waves (27) + Striped Tapered Tower (37) + Gallery/Lantern/Dome (24) = 88
        const tower: Array<{ x: number; y: number; z: number; col: string; isWave?: boolean }> = [];
        for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) {
          tower.push({ x, y: -5, z, col: Math.abs(x) === 2 && Math.abs(z) === 1 ? COBALT : NAVY });
        }
        tower.push({ x: -3, y: -5, z: 0, col: EMERALD, isWave: true }, { x: 3, y: -5, z: 0, col: EMERALD, isWave: true }, { x: 0, y: -5, z: 2, col: EMERALD, isWave: true });
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) tower.push({ x, y: -4, z, col: VIOLET });
        // Red y=-3 (9), White y=-2 (9), Red y=-1 (9)
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) tower.push({ x, y: -3, z, col: x === 0 && z === 1 ? VIOLET : MAGENTA });
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) tower.push({ x, y: -2, z, col: z === -1 ? "#c7d8ff" : WHITE });
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) tower.push({ x, y: -1, z, col: MAGENTA });
        // Tapered cross y=0 White (5) & y=1 Red (5)
        [[0, 0], [-1, 0], [1, 0], [0, 1], [0, -1]].forEach(([x, z]) => tower.push({ x, y: 0, z, col: x === 0 && z === 1 ? VIOLET : WHITE }));
        [[0, 0], [-1, 0], [1, 0], [0, 1], [0, -1]].forEach(([x, z]) => tower.push({ x, y: 1, z, col: MAGENTA }));
        // Balcony y=2 (9), Lantern y=3 (9), Dome y=4 (5) + spire (1)
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) tower.push({ x, y: 2, z, col: VIOLET });
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
          const isCorner = Math.abs(x) === 1 && Math.abs(z) === 1;
          tower.push({ x, y: 3, z, col: isCorner ? VIOLET : GOLD });
        }
        [[0, 0], [-1, 0], [1, 0], [0, 1], [0, -1]].forEach(([x, z]) => tower.push({ x, y: 4, z, col: MAGENTA }));
        tower.push({ x: 0, y: 5, z: 0, col: GOLD });

        const tp = tower[idx];
        const wBob = tp.isWave ? Math.sin(t * 2.2 + tp.x) * 0.05 : 0;
        lx = tp.x * P; ly = tp.y * P + wBob; lz = tp.z * P; col = tp.col;
      } else {
        // 32 cubes: Twin 360° Sweeping Golden Guiding Light Beams! (16 per side)
        const j = idx - 88;
        const dir = j < 16 ? 1 : -1;
        const k = j % 16;
        const beamOffsets: Array<[number, number, number, number, string]> = [
          [2, 0, 0, 0.19, GOLD],
          [3, 0, 0, 0.19, GOLD], [3, 0.85, 0, 0.17, GOLD], [3, -0.85, 0, 0.17, GOLD], [3, 0, 0.85, 0.17, GOLD], [3, 0, -0.85, 0.17, GOLD],
          [4, 0, 0, 0.17, "#ffd166"], [4, 1.0, 0, 0.16, "#ffd166"], [4, -1.0, 0, 0.16, "#ffd166"], [4, 0, 1.0, 0.16, "#ffd166"], [4, 0, -1.0, 0.16, "#ffd166"],
          [5, 0, 0, 0.15, "#ffd166"], [5, 1.1, 0, 0.14, "#ffd166"], [5, -1.1, 0, 0.14, "#ffd166"], [5, 0, 1.1, 0.14, "#ffd166"], [5, 0, -1.1, 0.14, "#ffd166"],
        ];
        const bp = beamOffsets[k];
        const beamSpin = t * 0.85;
        const bx = dir * bp[0] * P;
        const bz = bp[2] * P;
        lx = bx * Math.cos(beamSpin) + bz * Math.sin(beamSpin);
        ly = (3 + bp[1] * 0.72) * P;
        lz = -bx * Math.sin(beamSpin) + bz * Math.cos(beamSpin);
        sc = bp[3];
        col = bp[4];
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.22, -0.34, 0, NAVY], [0, -0.34, 0, VIOLET], [0.22, -0.34, 0, NAVY],
        [0, -0.16, 0, MAGENTA], [0, 0.02, 0, WHITE], [0, 0.18, 0, MAGENTA],
        [0, 0.34, 0, GOLD], [0, 0.48, 0, MAGENTA],
        [-0.38, 0.34, 0, GOLD], [-0.2, 0.34, 0, GOLD], [0.2, 0.34, 0, GOLD], [0.38, 0.34, 0, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.2 + Math.sin(t * 0.4) * 0.25, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: -0.2 + Math.sin(t * 0.4) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     10. ABOUT SYSTEMS & PLATFORM — 4-Way Symmetric Silicon CPU Microchip + 16 Golden IC Pins!
     -------------------------------------------------------------------------- */
  "sys-microchip": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotY = -0.18 + Math.sin(t * 0.4) * 0.22;
      const rotX = 0.22;
      const bob = Math.sin(t * 1.3) * 0.06;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = VIOLET;

      if (idx < 49) {
        // Main 7x7 Silicon Die (24 outer bezel + 25 inner circuit matrix)
        const x = (idx % 7) - 3;
        const y = Math.floor(idx / 7) - 3;
        const isEdge = Math.abs(x) === 3 || Math.abs(y) === 3;
        const isPad = (Math.abs(x) === 2 && Math.abs(y) === 1) || (Math.abs(x) === 1 && Math.abs(y) === 2);
        const isBus = Math.abs(x) === 2 || Math.abs(y) === 2;
        lx = x * P; ly = y * P + bob; lz = 0;
        col = x === -3 && y === 3 ? GOLD : isEdge ? VIOLET : isPad ? EMERALD : isBus ? NAVY : (x === 0 && y === 0 ? EMERALD : VIOLET);
      } else if (idx < 74) {
        // 5x5 Stepped Back Substrate (z = -1)
        const k = idx - 49;
        lx = ((k % 5) - 2) * P;
        ly = (Math.floor(k / 5) - 2) * P + bob;
        lz = -1 * P;
        col = NAVY;
      } else if (idx < 88) {
        // 14-cube Raised Glowing Circuit Core & Data Bridges (z = 1, 2)
        const core: Array<[number, number, number, string]> = [];
        for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) core.push([x, y, 1, x === 0 && y === 0 ? COBALT : EMERALD]);
        core.push([0, 2, 1, COBALT], [0, -2, 1, COBALT], [2, 0, 1, COBALT], [-2, 0, 1, COBALT], [0, 0, 2, WHITE]);
        const cp = core[idx - 74];
        const r = Math.hypot(cp[0], cp[1]);
        const pulse = 0.94 + 0.12 * Math.sin(t * 3.4 - r * 0.85);
        lx = cp[0] * P; ly = cp[1] * P + bob; lz = cp[2] * P;
        sc = 0.195 * pulse;
        col = cp[3];
      } else {
        // 32 cubes: 16 Golden Metallic IC Pins (4 per side x 2 cubes long!)
        const j = idx - 88;
        const side = Math.floor(j / 8); // 0=L, 1=R, 2=T, 3=B
        const k = j % 8;
        const pinIdx = Math.floor(k / 2); // 0..3 -> [-2, -1, 1, 2]
        const seg = k % 2; // 0 shoulder, 1 tip
        const pos = [-2, -1, 1, 2][pinIdx];
        const dist = 4 + seg;
        if (side === 0) { lx = -dist * P; ly = pos * P + bob; }
        else if (side === 1) { lx = dist * P; ly = pos * P + bob; }
        else if (side === 2) { lx = pos * P; ly = dist * P + bob; }
        else { lx = pos * P; ly = -dist * P + bob; }
        lz = 0;
        const wave = 0.9 + 0.14 * Math.sin(t * 3.4 - dist * 0.7);
        sc = 0.18 * wave;
        col = seg === 0 ? AMBER : GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.1, -0.1, 0, EMERALD], [0.1, 0.1, 0, EMERALD], [0.1, -0.1, 0, VIOLET], [-0.1, 0.1, 0, VIOLET],
        [-0.32, -0.1, 0, GOLD], [-0.32, 0.1, 0, GOLD], [0.32, -0.1, 0, GOLD], [0.32, 0.1, 0, GOLD],
        [-0.1, 0.32, 0, GOLD], [0.1, 0.32, 0, GOLD], [-0.1, -0.32, 0, GOLD], [0.1, -0.32, 0, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.18 + Math.sin(t * 0.45) * 0.25, 0.22);
      return { dx, dy, dz, rx: 0.22, ry: -0.18 + Math.sin(t * 0.45) * 0.25, rz: 0, scale: slot >= 4 ? sc * 0.85 : sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     11. VELOCITOR — Rotating 3D Earth Globe + Crimson Map Pin + Orbiting GPS Satellite!
     -------------------------------------------------------------------------- */
  "vel-gps-globe": {
    hero(idx, _count, t) {
      const P = 0.23;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = COBALT;

      if (idx < GLOBE_62.length) {
        // Spinning Watertight 3D Earth Globe at (0, -1, 0)
        const g = GLOBE_62[idx];
        const [gx, gy, gz] = rotateYX(g.x * P, g.y * P, g.z * P, t * 0.45, 0);
        lx = gx; ly = -1.2 * P + gy; lz = gz;
        col = g.isLand ? EMERALD : (g.y < 0 ? NAVY : COBALT);
      } else if (idx < 82) {
        // 20-cube Bold Crimson Map Pin (`📍`) planted right atop the globe!
        const pin: Array<[number, number, number, string]> = [
          [0, 2, 0, ROSE],
          [0, 3, 0, MAGENTA], [-1, 3, 0, MAGENTA], [1, 3, 0, MAGENTA], [0, 3, 1, MAGENTA], [0, 3, -1, MAGENTA],
          ...[-1, 0, 1].flatMap((x) => [-1, 0, 1].map((z) => [x, 4, z, x === 0 && z === 1 ? WHITE : MAGENTA] as [number, number, number, string])),
          [0, 5, 0, MAGENTA], [-1, 5, 0, MAGENTA], [1, 5, 0, MAGENTA], [0, 5, 1, MAGENTA], [0, 5, -1, MAGENTA],
        ];
        const pp = pin[idx - GLOBE_62.length];
        const pulse = 0.96 + 0.05 * Math.sin(t * 2.8);
        lx = pp[0] * P * pulse; ly = (pp[1] - 0.2) * P * pulse; lz = pp[2] * P * pulse;
        col = pp[3];
      } else if (idx < 108) {
        // 22-cube Solar-Winged GPS Satellite + 4-cube Downlink Signal Beam!
        const j = idx - 82;
        const satSweep = Math.sin(t * 0.75) * 0.35;
        const satBob = Math.cos(t * 1.5) * 0.1;
        const sat: Array<[number, number, number, string]> = [
          // Foil bus (4) + sensor cap (2) + dish (4)
          [4, 4, 0, GOLD], [4, 4, 1, GOLD], [4, 5, 0, GOLD], [4, 5, 1, GOLD],
          [4, 6, 0, VIOLET], [4, 6, 1, VIOLET],
          [3, 3, 0, STEEL], [3, 3, 1, STEEL], [3, 4, 0, STEEL], [3, 4, 1, STEEL],
          // Twin solar wings (12)
          [4, 4, -1, COBALT], [4, 5, -1, COBALT], [4, 4, -2, COBALT], [4, 5, -2, EMERALD], [4, 4, -3, COBALT], [4, 5, -3, COBALT],
          [4, 4, 2, COBALT], [4, 5, 2, COBALT], [4, 4, 3, COBALT], [4, 5, 3, EMERALD], [4, 4, 4, COBALT], [4, 5, 4, COBALT],
          // Signal beam (4)
          [2, 4.8, 0, GOLD], [2, 3.9, 0, EMERALD], [2, 3.0, 0, GOLD], [2, 3.9, 1, EMERALD],
        ];
        const sp = sat[j];
        const [sx, sy, sz] = rotateYX(sp[0] * P, (sp[1] - 0.5) * P + satBob, sp[2] * P, satSweep, 0);
        lx = sx; ly = sy; lz = sz;
        sc = j >= 22 ? 0.155 * (0.85 + 0.25 * Math.sin(t * 4.5 + j)) : 0.185;
        col = sp[3];
      } else {
        // 12-cube Tilted Orbital Track Ring cleanly encircling the globe!
        const k = idx - 108;
        const phi = (k / 12) * Math.PI * 2 + t * 0.35;
        lx = Math.cos(phi) * 3.7 * P;
        ly = (-1.2 + Math.sin(phi) * 1.15) * P;
        lz = Math.sin(phi) * 3.4 * P;
        sc = 0.125;
        col = k % 2 === 0 ? GOLD : STEEL;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, -0.15, rotX);
      return makeTarget(x, y, z, rotX, -0.15, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, -0.18, 0, COBALT], [0.2, -0.18, 0, COBALT], [-0.2, -0.18, 0, COBALT], [0, -0.36, 0, NAVY],
        [-0.08, -0.02, 0.1, EMERALD], [0.14, -0.02, 0.1, EMERALD],
        [0, 0.18, 0, MAGENTA], [0, 0.34, 0, MAGENTA], [0, 0.34, 0.14, WHITE],
        [0.34, 0.34, 0, GOLD], [0.34, 0.34, 0.18, COBALT], [0.34, 0.34, -0.18, COBALT],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, t * 0.45, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: t * 0.45, rz: 0, scale: sc, color: p[3] };
    },
  },
};
