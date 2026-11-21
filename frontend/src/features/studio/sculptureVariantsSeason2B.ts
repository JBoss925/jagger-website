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
const MAGENTA = "#e03c8a";
const ROSE = "#c9437d";
const GOLD = "#f5b83d";
const EMERALD = "#22bf90";
const STEEL = "#64749c";
const SILVER = "#8c9bb8";
const WHITE = "#ffffff";

// ============================================================================
// PRECOMPUTED NON-OVERLAPPING GEOMETRY TABLES (SEASON 2B — 11 CHALLENGERS)
// ============================================================================

// Wireframe 3x3x3 cube (20 edge+corner points + 1 center = 21)
const WIREFRAME_21: Array<{ x: number; y: number; z: number; isCorner: boolean; isCore: boolean }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; isCorner: boolean; isCore: boolean }> = [];
  const vals = [-0.22, 0, 0.22];
  for (const x of vals) {
    for (const y of vals) {
      for (const z of vals) {
        const nz = (x !== 0 ? 1 : 0) + (y !== 0 ? 1 : 0) + (z !== 0 ? 1 : 0);
        if (nz >= 2) pts.push({ x, y, z, isCorner: nz === 3, isCore: false });
      }
    }
  }
  pts.push({ x: 0, y: 0, z: 0, isCorner: false, isCore: true });
  return pts; // 21
})();

// 14-cube 3D Axis Arrow template along +X
const AXIS_ARROW_14: Array<{ a: number; b: number; c: number; s: number }> = [
  { a: 0.48, b: 0, c: 0, s: 0.17 },
  { a: 0.68, b: 0, c: 0, s: 0.17 },
  { a: 0.88, b: 0, c: 0, s: 0.17 },
  { a: 1.08, b: 0, c: 0, s: 0.17 },
  { a: 1.28, b: 0, c: 0, s: 0.17 },
  { a: 1.46, b: 0, c: 0, s: 0.155 },
  { a: 1.18, b: 0.2, c: 0, s: 0.15 },
  { a: 1.18, b: -0.2, c: 0, s: 0.15 },
  { a: 1.18, b: 0, c: 0.2, s: 0.15 },
  { a: 1.18, b: 0, c: -0.2, s: 0.15 },
  { a: 1.06, b: 0.17, c: 0.17, s: 0.14 },
  { a: 1.06, b: 0.17, c: -0.17, s: 0.14 },
  { a: 1.06, b: -0.17, c: 0.17, s: 0.14 },
  { a: 1.06, b: -0.17, c: -0.17, s: 0.14 },
];

// Hollow 5x3x3 camera body minus 3 core cubes = 42
const CAMERA_BODY_42: Array<{ x: number; y: number; z: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; col: string }> = [];
  const xs = [-0.63, -0.45, -0.27, -0.09, 0.09];
  const ys = [-0.45, -0.27, -0.09];
  const zs = [-0.18, 0, 0.18];
  for (const x of xs) {
    for (const y of ys) {
      for (const z of zs) {
        if (y === -0.27 && z === 0 && x > -0.6 && x < 0.05) continue;
        let col = VIOLET;
        if (x === -0.45 && y === -0.09 && z === 0.18) col = MAGENTA; // REC tally
        else if (x === -0.63 && y === -0.27 && z !== 0) col = GOLD; // rear dials
        else if (y === -0.27 && z === 0.18 && x > -0.55 && x < 0.05) col = NAVY;
        pts.push({ x, y, z, col });
      }
    }
  }
  return pts; // 42
})();

// Faceted open-window Lightbulb Dome (73 cubes)
const BULB_DOME_73: Array<{ x: number; y: number; z: number; s: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; s: number; col: string }> = [];
  const rings: Array<{ y: number; r: number; n: number; s: number; openFront?: number }> = [
    { y: 1.04, r: 0.19, n: 4, s: 0.15 },
    { y: 0.86, r: 0.48, n: 12, s: 0.16 },
    { y: 0.62, r: 0.68, n: 16, s: 0.165, openFront: 3 },
    { y: 0.36, r: 0.74, n: 16, s: 0.17, openFront: 5 },
    { y: 0.1, r: 0.62, n: 14, s: 0.165, openFront: 3 },
    { y: -0.14, r: 0.44, n: 12, s: 0.155 },
    { y: -0.34, r: 0.36, n: 10, s: 0.15 },
  ];
  for (const rg of rings) {
    for (let k = 0; k < rg.n; k++) {
      const a = (k / rg.n) * Math.PI * 2;
      // Angle centered on +Z is a = Math.PI/2 -> sin(a) > threshold
      const x = Math.cos(a) * rg.r;
      const z = Math.sin(a) * rg.r;
      if (rg.openFront) {
        const halfArc = (rg.openFront / rg.n) * Math.PI;
        let diff = Math.abs(a - Math.PI / 2);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < halfArc) continue;
      }
      const isRearBackdrop = rg.openFront && z < -rg.r * 0.42;
      pts.push({ x, y: rg.y, z, s: rg.s, col: isRearBackdrop ? VIOLET : GOLD });
    }
  }
  return pts; // 73
})();

// Shield heater face (44) + back core (10) = 54
const SHIELD_54: Array<{ x: number; y: number; z: number; s: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; s: number; col: string }> = [];
  const p = 0.18;
  const rows = [
    { y: 3.5, cols: [-3, -2, -1, 0, 1, 2, 3] },
    { y: 2.5, cols: [-3, -2, -1, 0, 1, 2, 3] },
    { y: 1.5, cols: [-3, -2, -1, 0, 1, 2, 3] },
    { y: 0.5, cols: [-3, -2, -1, 0, 1, 2, 3] },
    { y: -0.5, cols: [-3, -2, -1, 0, 1, 2, 3] },
    { y: -1.5, cols: [-2, -1, 0, 1, 2] },
    { y: -2.5, cols: [-1, 0, 1] },
    { y: -3.5, cols: [0] },
  ];
  for (let ri = 0; ri < rows.length; ri++) {
    const rw = rows[ri];
    for (let ci = 0; ci < rw.cols.length; ci++) {
      const c = rw.cols[ci];
      const isEdge = ri === 0 || ci === 0 || ci === rw.cols.length - 1 || ri === rows.length - 1;
      const isBoss = Math.abs(c) <= 1 && Math.abs(rw.y - 0.5) <= 1 && (c === 0 || rw.y === 0.5);
      const col = ri === 0 ? GOLD : isEdge ? VIOLET : isBoss ? GOLD : (ri + c) % 2 === 0 ? NAVY : COBALT;
      pts.push({ x: c * p, y: rw.y * p, z: -0.26, s: 0.155, col });
    }
  }
  // 10 back depth core cubes
  for (let i = 0; i < 10; i++) {
    const c = (i % 5) - 2;
    const r = i < 5 ? 1.5 : -0.5;
    pts.push({ x: c * p, y: r * p, z: -0.44, s: 0.145, col: VIOLET });
  }
  return pts; // 54
})();

// 33-cube Broadsword template along +U
const SWORD_33: Array<{ u: number; v: number; role: "pommel" | "hilt" | "guard" | "edge" | "shadow" }> = (() => {
  const pts: Array<{ u: number; v: number; role: "pommel" | "hilt" | "guard" | "edge" | "shadow" }> = [];
  pts.push({ u: -7, v: 0, role: "pommel" });
  pts.push({ u: -6, v: 0, role: "hilt" }, { u: -5, v: 0, role: "hilt" }, { u: -4, v: 0, role: "hilt" });
  for (let v = -2; v <= 2; v++) pts.push({ u: -3, v, role: "guard" });
  pts.push({ u: -2, v: -2, role: "guard" }, { u: -2, v: 2, role: "guard" });
  for (let u = -2; u <= 7; u++) {
    pts.push({ u, v: 0.55, role: "edge" });
    pts.push({ u, v: -0.55, role: "shadow" });
  }
  pts.push({ u: 8, v: 0, role: "edge" }, { u: 9, v: 0, role: "edge" });
  return pts; // 33
})();

// Folded Origami Dart Paper Airplane (96 cubes: 76 swept wings + 20 V-keel!)
const PAPER_PLANE_96: Array<{ lx: number; ly: number; lz: number; col: string }> = (() => {
  const pts: Array<{ lx: number; ly: number; lz: number; col: string }> = [];
  const p = 0.155;
  const stations = [
    { ix: 5, w: 1 }, { ix: 4, w: 3 }, { ix: 3, w: 5 }, { ix: 2, w: 5 },
    { ix: 1, w: 7 }, { ix: 0, w: 7 }, { ix: -1, w: 9 }, { ix: -2, w: 9 },
    { ix: -3, w: 11 }, { ix: -4, w: 11 }, { ix: -5, w: 8 },
  ];
  for (const st of stations) {
    const half = Math.floor(st.w / 2);
    for (let i = 0; i < st.w; i++) {
      // V-notch at tail (ix === -5 omits center iz=0)
      const iz = st.ix === -5 ? (i < 4 ? i - 4 : i - 3) : i - half;
      const ly = iz === 0 ? -0.02 : 0.06 + 0.03 * (Math.abs(iz) - 1);
      const isOuter = Math.abs(iz) === half || st.ix === 5 || st.ix === -5;
      const isStripe = Math.abs(iz) === Math.max(1, half - 1) && st.ix <= 1 && st.ix >= -4;
      const col = iz === 0 ? NAVY : isOuter ? (Math.abs(iz) >= 4 ? VIOLET : COBALT) : isStripe ? EMERALD : WHITE;
      pts.push({ lx: st.ix * p, ly, lz: iz * p, col });
    }
  }
  // 20 Underside V-Keel cubes (8 + 6 + 4 + 2)
  const keelTiers = [
    { ly: -0.17, xs: [-4, -3, -2, -1, 0, 1, 2, 3], col: NAVY },
    { ly: -0.32, xs: [-4, -3, -2, -1, 0, 1], col: VIOLET },
    { ly: -0.47, xs: [-4, -3, -2, -1], col: VIOLET },
    { ly: -0.62, xs: [-4, -3], col: VIOLET },
  ];
  for (const kt of keelTiers) {
    for (const ix of kt.xs) {
      pts.push({ lx: ix * p, ly: kt.ly, lz: 0, col: kt.col });
    }
  }
  return pts; // 96
})();

// Stadium loop sampler (18 uniform perimeter points)
function stadiumLoop18(k: number, halfLen: number, rad: number): [number, number] {
  const straight = halfLen * 2;
  const arc = Math.PI * rad;
  const total = 2 * straight + 2 * arc;
  const d = ((k % 18) / 18) * total;
  if (d < straight) return [-halfLen + d, rad];
  if (d < straight + arc) {
    const a = Math.PI / 2 - ((d - straight) / arc) * Math.PI;
    return [halfLen + Math.cos(a) * rad, Math.sin(a) * rad];
  }
  if (d < 2 * straight + arc) return [halfLen - (d - straight - arc), -rad];
  const a = -Math.PI / 2 - ((d - 2 * straight - arc) / arc) * Math.PI;
  return [-halfLen + Math.cos(a) * rad, Math.sin(a) * rad];
}

// ============================================================================
// SEASON 2 PART B — 11 CHALLENGERS
// ============================================================================
export const VARIANTS_SEASON2_B: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1. RENGINE — 3D Engine Transform Gizmo (`X`/`Y`/`Z` RGB Arrows + Rotation Arcs + Jewel Core!)
     -------------------------------------------------------------------------- */
  "rengine-axis-gizmo": {
    hero(idx, _count, t) {
      const rotY = -0.52 + Math.sin(t * 0.45) * 0.32;
      const rotX = 0.36 + Math.cos(t * 0.38) * 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.15, col = VIOLET;

      if (idx < 21) {
        const p = WIREFRAME_21[idx];
        const [jx, jy, jz] = rotateYX(p.x, p.y, p.z, t * 1.25, t * 0.85);
        lx = jx; ly = jy; lz = jz;
        sc = p.isCore ? 0.165 : 0.135;
        col = p.isCore ? MAGENTA : p.isCorner ? GOLD : VIOLET;
      } else if (idx < 63) {
        // 3 RGB Axis Arrows (14 each = 42)
        const j = idx - 21;
        const axis = Math.floor(j / 14); // 0=+X, 1=+Y, 2=+Z
        const k = j % 14;
        const ap = AXIS_ARROW_14[k];
        const pulse = 0.92 + 0.14 * Math.sin(t * 3.2 - ap.a * 2.2 + axis);
        if (axis === 0) { lx = ap.a; ly = ap.b; lz = ap.c; col = MAGENTA; }
        else if (axis === 1) { lx = ap.b; ly = ap.a; lz = ap.c; col = EMERALD; }
        else { lx = ap.b; ly = ap.c; lz = ap.a; col = COBALT; }
        sc = ap.s * pulse;
      } else if (idx < 90) {
        // 3 Positive-Octant Rotation Arcs (9 each = 27)
        const j = idx - 63;
        const plane = Math.floor(j / 9);
        const k = j % 9;
        const th = ((12 + k * 8.25) * Math.PI) / 180;
        const r = 1.0;
        const pulse = 0.92 + 0.14 * Math.sin(t * 2.8 - k * 0.5 + plane);
        if (plane === 0) { lx = Math.cos(th) * r; ly = Math.sin(th) * r; lz = 0; col = COBALT; }
        else if (plane === 1) { lx = 0; ly = Math.cos(th) * r; lz = Math.sin(th) * r; col = MAGENTA; }
        else { lx = Math.cos(th) * r; ly = 0; lz = Math.sin(th) * r; col = EMERALD; }
        sc = 0.128 * pulse;
      } else if (idx < 102) {
        // 3 Plane-Translate 2x2 handles (4 each = 12)
        const j = idx - 90;
        const plane = Math.floor(j / 4);
        const sub = j % 4;
        const u = sub % 2 === 0 ? 0.4 : 0.56;
        const v = sub < 2 ? 0.4 : 0.56;
        if (plane === 0) { lx = u; ly = v; lz = 0; col = COBALT; }
        else if (plane === 1) { lx = 0; ly = u; lz = v; col = MAGENTA; }
        else { lx = u; ly = 0; lz = v; col = EMERALD; }
        sc = 0.135;
      } else {
        // 3 Counter-quadrant Gimbal Arcs (6 each = 18)
        const j = idx - 102;
        const plane = Math.floor(j / 6);
        const k = j % 6;
        const th = ((105 + k * 12) * Math.PI) / 180;
        const r = 1.0;
        if (plane === 0) { lx = Math.cos(th) * r; ly = Math.sin(th) * r; lz = 0; }
        else if (plane === 1) { lx = 0; ly = Math.cos(th) * r; lz = Math.sin(th) * r; }
        else { lx = Math.cos(th) * r; ly = 0; lz = Math.sin(th) * r; }
        sc = 0.12;
        col = VIOLET;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0.14, 0, 0, MAGENTA], [0.28, 0, 0, MAGENTA], [0.42, 0, 0, MAGENTA],
        [0, 0.14, 0, EMERALD], [0, 0.28, 0, EMERALD], [0, 0.42, 0, EMERALD],
        [0, 0, 0.14, COBALT], [0, 0, 0.28, COBALT], [0, 0, 0.42, COBALT],
        [0.24, 0.24, 0, COBALT], [0, 0.24, 0.24, MAGENTA], [0.24, 0, 0.24, EMERALD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.5 + Math.sin(t * 0.5) * 0.3, 0.36);
      return { dx, dy, dz, rx: 0.36, ry: -0.5 + Math.sin(t * 0.5) * 0.3, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2. RENGINE — Vintage-Modern Cinema/Render Camera + Glowing Volumetric Frustum!
     -------------------------------------------------------------------------- */
  "rengine-cinema-camera": {
    hero(idx, _count, t) {
      const rotY = -0.3 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.16;
      const bob = Math.sin(t * 1.1) * 0.05;
      const reelSpin = -t * 1.8;
      let lx = 0, ly = 0, lz = 0, sc = 0.155, col = VIOLET;

      if (idx < 42) {
        const b = CAMERA_BODY_42[idx];
        lx = b.x * 1.25;
        ly = b.y * 1.25 + bob;
        lz = b.z * 1.25;
        sc = 0.19;
        col = b.col === MAGENTA && Math.sin(t * 3.8) < 0 ? ROSE : b.col;
      } else if (idx < 68) {
        // Twin Top Film Reels (13 each = 26)
        const j = idx - 42;
        const isRight = j >= 13;
        const k = j % 13;
        const rxC = isRight ? 0.12 : -0.78;
        const ryC = 0.56 + bob;
        if (k === 0) {
          lx = rxC; ly = ryC; lz = 0; sc = 0.18; col = GOLD;
        } else if (k <= 10) {
          const a = ((k - 1) / 10) * Math.PI * 2 + reelSpin;
          lx = rxC + Math.cos(a) * 0.33;
          ly = ryC + Math.sin(a) * 0.33;
          lz = 0;
          sc = 0.165;
          col = (k === 1 || k === 6) ? GOLD : k % 2 === 0 ? VIOLET : NAVY;
        } else {
          lx = rxC; ly = ryC; lz = k === 11 ? 0.18 : -0.18; sc = 0.135; col = isRight ? EMERALD : MAGENTA;
        }
      } else if (idx < 91) {
        // Stepped Glass Lens Cone (23)
        const j = idx - 68;
        const ly0 = -0.34 + bob;
        if (j < 8) {
          const a = (j / 8) * Math.PI * 2;
          lx = 0.34; ly = ly0 + Math.cos(a) * 0.22; lz = Math.sin(a) * 0.22; sc = 0.15; col = NAVY;
        } else if (j < 18) {
          const a = ((j - 8) / 10) * Math.PI * 2;
          lx = 0.56; ly = ly0 + Math.cos(a) * 0.31; lz = Math.sin(a) * 0.31; sc = 0.165; col = VIOLET;
        } else if (j === 18) {
          lx = 0.45; ly = ly0; lz = 0; sc = 0.21; col = COBALT;
        } else {
          const a = ((j - 19) / 4) * Math.PI * 2 + Math.PI / 4;
          lx = 0.52; ly = ly0 + Math.cos(a) * 0.14; lz = Math.sin(a) * 0.14; sc = 0.115; col = WHITE;
        }
      } else if (idx < 115) {
        // Glowing Light Frustum (16 rays + 8 front frame edges = 24)
        const j = idx - 91;
        const ly0 = -0.34 + bob;
        if (j < 16) {
          const ray = Math.floor(j / 4);
          const step = j % 4;
          const u = step / 3;
          const sy = ray < 2 ? 1 : -1;
          const sz = ray % 2 === 0 ? 1 : -1;
          const wave = 0.85 + 0.25 * Math.sin(t * 3.4 - step * 0.9);
          lx = 0.84 + u * 0.62;
          ly = ly0 + sy * (0.28 + u * 0.28);
          lz = sz * (0.28 + u * 0.28);
          sc = 0.135 * wave;
          col = step < 2 ? GOLD : EMERALD;
        } else {
          const k = j - 16;
          const edgePts: Array<[number, number]> = [
            [0.56, 0.22], [0.56, -0.22], [-0.56, 0.22], [-0.56, -0.22],
            [0.22, 0.56], [-0.22, 0.56], [0.22, -0.56], [-0.22, -0.56],
          ];
          const ep = edgePts[k];
          lx = 1.46; ly = ly0 + ep[0]; lz = ep[1]; sc = 0.14; col = k % 2 === 0 ? COBALT : EMERALD;
        }
      } else {
        // Rear Eyepiece (5)
        const j = idx - 115;
        const ly0 = -0.22 + bob;
        if (j === 0) {
          lx = -1.0; ly = ly0; lz = 0; sc = 0.15; col = NAVY;
        } else {
          const sy = j < 3 ? 0.12 : -0.12;
          const sz = j % 2 === 0 ? 0.12 : -0.12;
          lx = -1.16; ly = ly0 + sy; lz = sz; sc = 0.125; col = VIOLET;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.28, -0.04, 0, MAGENTA], [-0.1, -0.04, 0, VIOLET], [0.08, -0.04, 0, VIOLET],
        [-0.28, -0.22, 0, VIOLET], [-0.1, -0.22, 0, VIOLET], [0.08, -0.22, 0, NAVY],
        [-0.2, 0.22, 0, NAVY], [0.04, 0.22, 0, GOLD],
        [0.26, -0.12, 0, COBALT],
        [0.42, 0.04, 0, GOLD], [0.42, -0.28, 0, GOLD], [0.54, -0.12, 0, EMERALD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.28 + Math.sin(t * 0.4) * 0.2, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: -0.28 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3. PORTFOLIO VIEWS — Multi-Device Responsive Trio (Desktop + Tilted Tablet + Smartphone!)
     -------------------------------------------------------------------------- */
  "port-device-trio": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.28) * 0.2;
      const rotX = 0.14;
      let lx = 0, ly = 0, lz = 0, sc = 0.16, col = VIOLET;

      if (idx < 62) {
        // Desktop Monitor (back z = -0.45): 9x6 bezel (26) + 7x4 UI screen (28) + stand (8)
        const p = 0.21;
        const dy = Math.sin(t * 1.2) * 0.05;
        if (idx < 26) {
          let c = 0, r = 0;
          if (idx < 9) { c = idx - 4; r = 2.5; }
          else if (idx < 18) { c = idx - 9 - 4; r = -2.5; }
          else if (idx < 22) { c = -4; r = 1.5 - (idx - 18); }
          else { c = 4; r = 1.5 - (idx - 22); }
          lx = c * p; ly = 0.35 + r * p + dy; lz = -0.45; sc = 0.185; col = VIOLET;
        } else if (idx < 54) {
          const k = idx - 26;
          const c = (k % 7) - 3;
          const r = 1.5 - Math.floor(k / 7);
          lx = c * p; ly = 0.35 + r * p + dy; lz = -0.42; sc = 0.175;
          if (r === 1.5) col = c === -3 ? MAGENTA : c === -2 ? GOLD : NAVY;
          else if (c <= -2) col = COBALT;
          else if (c <= 1) col = r === -1.5 ? EMERALD : WHITE;
          else col = r > 0 ? GOLD : MAGENTA;
        } else {
          const k = idx - 54;
          if (k < 2) { lx = 0; ly = -0.42 - k * 0.21 + dy; lz = -0.45; col = NAVY; }
          else if (k < 7) { lx = (k - 4) * 0.21; ly = -0.84 + dy; lz = -0.45; col = VIOLET; }
          else { lx = 0; ly = -0.84 + dy; lz = -0.24; col = VIOLET; }
          sc = 0.18;
        }
      } else if (idx < 92) {
        // Tilted Tablet front-left (30 cubes: 5x6 grid)
        const j = idx - 62;
        const c = (j % 5) - 2;
        const r = 2.5 - Math.floor(j / 5);
        const isEdge = Math.abs(c) === 2 || Math.abs(r) === 2.5;
        const dy = Math.sin(t * 1.2 + 1.2) * 0.06;
        const yaw = 0.36 + Math.sin(t * 0.9) * 0.06;
        const [rxp, ryp, rzp] = rotateYX(c * 0.175, r * 0.175, isEdge ? 0 : 0.03, yaw, 0);
        lx = -1.04 + rxp;
        ly = -0.24 + ryp + dy;
        lz = 0.36 + rzp;
        sc = 0.155;
        col = isEdge ? (r === -2.5 && c === 0 ? GOLD : VIOLET) : r === 1.5 ? EMERALD : r === 0.5 ? WHITE : r === -0.5 ? MAGENTA : COBALT;
      } else {
        // Sleek Smartphone front-right (28 cubes: 4x7 grid)
        const j = idx - 92;
        const c = (j % 4) - 1.5;
        const r = 3 - Math.floor(j / 4);
        const isEdge = Math.abs(c) === 1.5 || Math.abs(r) === 3;
        const dy = Math.sin(t * 1.2 + 2.4) * 0.06;
        const yaw = -0.36 - Math.sin(t * 0.9) * 0.06;
        const [rxp, ryp, rzp] = rotateYX(c * 0.16, r * 0.16, isEdge ? 0 : 0.03, yaw, 0);
        lx = 1.06 + rxp;
        ly = -0.32 + ryp + dy;
        lz = 0.44 + rzp;
        sc = 0.14;
        col = isEdge ? VIOLET : r === 2 ? MAGENTA : r === 1 ? WHITE : r === 0 ? EMERALD : r === -1 ? GOLD : COBALT;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, 0.24, -0.14, VIOLET], [0, 0.24, -0.14, COBALT], [0.24, 0.24, -0.14, VIOLET],
        [-0.24, 0.04, -0.14, GOLD], [0, 0.04, -0.14, WHITE], [0.24, 0.04, -0.14, EMERALD],
        [-0.3, -0.06, 0.16, VIOLET], [-0.14, -0.06, 0.16, EMERALD],
        [-0.3, -0.22, 0.16, VIOLET], [-0.14, -0.22, 0.16, MAGENTA],
        [0.28, -0.04, 0.2, VIOLET], [0.28, -0.22, 0.2, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4. PORTFOLIO VIEWS — 4-Perspective Rotating Showroom Pedestal!
     -------------------------------------------------------------------------- */
  "port-gallery-cube": {
    hero(idx, _count, t) {
      const spinY = t * 0.45;
      const rotX = 0.24;
      let lx = 0, ly = 0, lz = 0, sc = 0.175, col = VIOLET;

      if (idx < 80) {
        // 4 Color-Coded Framed Screens (20 cubes each: 4x5) facing +Z, +X, -Z, -X!
        const face = Math.floor(idx / 20);
        const k = idx % 20;
        const u = ((k % 4) - 1.5) * 0.21;
        const v = (2 - Math.floor(k / 4)) * 0.21;
        const isEdge = k % 4 === 0 || k % 4 === 3 || Math.floor(k / 4) === 0 || Math.floor(k / 4) === 4;
        const r = 0.62;
        if (face === 0) { lx = u; ly = 0.14 + v; lz = r; col = isEdge ? VIOLET : k % 2 === 0 ? COBALT : GOLD; }
        else if (face === 1) { lx = r; ly = 0.14 + v; lz = -u; col = isEdge ? ROSE : v > 0 ? MAGENTA : WHITE; }
        else if (face === 2) { lx = -u; ly = 0.14 + v; lz = -r; col = isEdge ? VIOLET : k % 2 === 0 ? EMERALD : NAVY; }
        else { lx = -r; ly = 0.14 + v; lz = u; col = isEdge ? NAVY : v < 0 ? GOLD : EMERALD; }
      } else if (idx < 96) {
        // Central Spine (7) + 4 radial brackets + 4 crown + 1 apex (16)
        const j = idx - 80;
        if (j < 7) { lx = 0; ly = -0.74 + j * 0.27; lz = 0; col = j % 2 === 0 ? NAVY : VIOLET; }
        else if (j < 11) {
          const a = ((j - 7) * Math.PI) / 2;
          lx = Math.cos(a) * 0.3; ly = 0.14; lz = Math.sin(a) * 0.3; sc = 0.15; col = GOLD;
        } else if (j < 15) {
          const a = ((j - 11) * Math.PI) / 2 - t * 1.4;
          lx = Math.cos(a) * 0.24; ly = 1.02; lz = Math.sin(a) * 0.24; sc = 0.15; col = GOLD;
        } else {
          lx = 0; ly = 1.22; lz = 0; sc = 0.17; col = MAGENTA;
        }
      } else {
        // Tiered Circular Turntable Pedestal (8 upper + 16 lower = 24)
        const j = idx - 96;
        if (j < 8) {
          const a = (j / 8) * Math.PI * 2;
          lx = Math.cos(a) * 0.56; ly = -0.82; lz = Math.sin(a) * 0.56; sc = 0.19; col = NAVY;
        } else {
          const k = j - 8;
          const a = (k / 16) * Math.PI * 2;
          lx = Math.cos(a) * 0.96; ly = -1.06; lz = Math.sin(a) * 0.96; sc = 0.21;
          col = k % 4 === 0 ? GOLD : VIOLET;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, spinY, rotX);
      return makeTarget(x, y, z, rotX, spinY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.18, 0.24, COBALT], [0, -0.02, 0.24, VIOLET],
        [0.24, 0.18, 0, MAGENTA], [0.24, -0.02, 0, ROSE],
        [0, 0.18, -0.24, EMERALD], [0, -0.02, -0.24, VIOLET],
        [-0.24, 0.18, 0, GOLD], [-0.24, -0.02, 0, NAVY],
        [-0.2, -0.26, 0.2, VIOLET], [0.2, -0.26, 0.2, VIOLET],
        [-0.2, -0.26, -0.2, VIOLET], [0.2, -0.26, -0.2, GOLD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, t * 0.65, 0.24);
      return { dx, dy, dz, rx: 0.24, ry: t * 0.65, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5. TSXLIGHT RENDERER — Glowing Faceted Golden Lightbulb + Inner `</>` Filament!
     -------------------------------------------------------------------------- */
  "tsx-lightbulb": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.5) * 0.26;
      const rotX = 0.12;
      const bob = Math.sin(t * 1.1) * 0.06;
      let lx = 0, ly = 0, lz = 0, sc = 0.16, col = GOLD;

      if (idx < BULB_DOME_73.length) {
        const b = BULB_DOME_73[idx];
        const glow = 0.94 + 0.09 * Math.sin(t * 2.6 - b.y * 2.5);
        lx = b.x * 1.25;
        ly = b.y * 1.25 + bob;
        lz = b.z * 1.25;
        sc = b.s * 1.22 * glow;
        col = b.col;
      } else if (idx < 92) {
        // 19 cubes: Glowing inner `</>` Filament + support leads framed inside dark rear cavity!
        const k = idx - BULB_DOME_73.length;
        const fil: Array<[number, number, string]> = [
          // `<` (5)
          [-0.26, 0.56, WHITE], [-0.36, 0.46, EMERALD], [-0.46, 0.36, WHITE], [-0.36, 0.26, EMERALD], [-0.26, 0.16, WHITE],
          // `/` (5)
          [0.08, 0.58, MAGENTA], [0.04, 0.47, MAGENTA], [0.0, 0.36, MAGENTA], [-0.04, 0.25, MAGENTA], [-0.08, 0.14, MAGENTA],
          // `>` (5)
          [0.26, 0.56, WHITE], [0.36, 0.46, EMERALD], [0.46, 0.36, WHITE], [0.36, 0.26, EMERALD], [0.26, 0.16, WHITE],
          // Lead wires down into neck (4)
          [-0.2, 0.02, NAVY], [-0.16, -0.14, NAVY], [0.2, 0.02, NAVY], [0.16, -0.14, NAVY],
        ];
        const fp = fil[k % fil.length];
        lx = fp[0] * 1.15;
        ly = fp[1] * 1.25 + bob;
        lz = 0.18;
        sc = 0.125;
        col = fp[2];
      } else {
        // 28 cubes: Ribbed Metallic Edison Screw Base!
        const j = idx - 92;
        if (j < 10) {
          const a = (j / 10) * Math.PI * 2;
          lx = Math.cos(a) * 0.42; ly = -0.65 + bob; lz = Math.sin(a) * 0.42; sc = 0.18; col = NAVY;
        } else if (j < 19) {
          const a = ((j - 10) / 9) * Math.PI * 2;
          lx = Math.cos(a) * 0.37; ly = -0.85 + bob; lz = Math.sin(a) * 0.37; sc = 0.175; col = VIOLET;
        } else if (j < 27) {
          const a = ((j - 19) / 8) * Math.PI * 2;
          lx = Math.cos(a) * 0.31; ly = -1.05 + bob; lz = Math.sin(a) * 0.31; sc = 0.17; col = NAVY;
        } else {
          lx = 0; ly = -1.24 + bob; lz = 0; sc = 0.21; col = VIOLET;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.38, 0, GOLD], [-0.22, 0.24, 0, GOLD], [0.22, 0.24, 0, GOLD],
        [-0.24, 0.04, 0, GOLD], [0.24, 0.04, 0, GOLD], [-0.14, -0.12, 0, GOLD], [0.14, -0.12, 0, GOLD],
        [0, 0.16, 0.08, MAGENTA], [0, 0.16, -0.18, VIOLET],
        [-0.1, -0.28, 0, NAVY], [0.1, -0.28, 0, NAVY], [0, -0.42, 0, VIOLET],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.24, 0.12);
      return { dx, dy, dz, rx: 0.12, ry: Math.sin(t * 0.45) * 0.24, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6. TSXLIGHT RENDERER — Studio Stage Spotlight Casting Cone Onto UI Card!
     -------------------------------------------------------------------------- */
  "tsx-stage-spotlight": {
    hero(idx, _count, t) {
      const rotY = -0.18 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.16;
      const pitch = -0.66 + Math.sin(t * 0.9) * 0.07;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const ox = -0.92, oy = 0.82;
      let lx = 0, ly = 0, lz = 0, sc = 0.15, col = VIOLET;

      if (idx < 48) {
        // Spotlight Fixture (42 body + 6 U-yoke mount)
        if (idx < 42) {
          let fx = 0, fy = 0, fz = 0;
          if (idx < 5) {
            fx = -0.42;
            const o2: Array<[number, number]> = [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.16], [0, -0.16]];
            fy = o2[idx][0]; fz = o2[idx][1]; sc = 0.16; col = VIOLET;
          } else if (idx < 13) {
            const a = ((idx - 5) / 8) * Math.PI * 2;
            fx = -0.22; fy = Math.cos(a) * 0.26; fz = Math.sin(a) * 0.26; sc = 0.17; col = VIOLET;
          } else if (idx < 21) {
            const a = ((idx - 13) / 8) * Math.PI * 2;
            fx = 0; fy = Math.cos(a) * 0.29; fz = Math.sin(a) * 0.29; sc = 0.175; col = NAVY;
          } else if (idx < 31) {
            const a = ((idx - 21) / 10) * Math.PI * 2;
            fx = 0.22; fy = Math.cos(a) * 0.33; fz = Math.sin(a) * 0.33; sc = 0.17; col = VIOLET;
          } else if (idx < 36) {
            const k = idx - 31;
            const o2: Array<[number, number]> = [[0, 0], [0.12, 0.12], [-0.12, 0.12], [0.12, -0.12], [-0.12, -0.12]];
            fx = 0.2; fy = o2[k][0]; fz = o2[k][1]; sc = 0.135; col = k === 0 ? WHITE : GOLD;
          } else {
            const k = idx - 36;
            fx = 0.42; fy = k < 3 ? 0.4 : -0.4; fz = ((k % 3) - 1) * 0.18; sc = 0.145; col = NAVY;
          }
          lx = ox + fx * cp - fy * sp;
          ly = oy + fx * sp + fy * cp;
          lz = fz;
        } else {
          const k = idx - 42;
          lx = ox + (k < 2 ? 0 : k < 4 ? 0 : (k === 4 ? -0.16 : 0.16));
          ly = oy + (k < 2 ? 0 : k < 4 ? 0.36 : 0.56);
          lz = k < 2 ? (k === 0 ? -0.44 : 0.44) : k < 4 ? (k === 2 ? -0.34 : 0.34) : 0;
          sc = 0.15;
          col = k < 2 ? GOLD : NAVY;
        }
      } else if (idx < 76) {
        // 28 Volumetric Light Cone Beams (4 rays x 6 + 4 floating photons)
        const j = idx - 48;
        if (j < 24) {
          const ray = Math.floor(j / 6);
          const step = j % 6;
          const u = step / 5;
          const a = Math.PI / 4 + (ray * Math.PI) / 2;
          const fx = 0.54 + u * 1.18;
          const rad = 0.26 + u * 0.36;
          const fy = Math.cos(a) * rad;
          const fz = Math.sin(a) * rad;
          const wave = 0.85 + 0.25 * Math.sin(t * 3.0 - step * 0.85);
          lx = ox + fx * cp - fy * sp;
          ly = oy + fx * sp + fy * cp;
          lz = fz;
          sc = 0.13 * wave;
          col = step < 3 ? GOLD : EMERALD;
        } else {
          const k = j - 24;
          const fx = 0.72 + k * 0.26;
          const fy = Math.sin(t * 2.2 + k * 1.6) * 0.14;
          const fz = Math.cos(t * 1.8 + k * 1.6) * 0.14;
          lx = ox + fx * cp - fy * sp;
          ly = oy + fx * sp + fy * cp;
          lz = fz;
          sc = 0.11;
          col = k % 2 === 0 ? GOLD : MAGENTA;
        }
      } else {
        // 44 cubes: Illuminated 6x5 UI Component Card (30) + Stage Light Pool Ring (14)!
        const j = idx - 76;
        if (j < 30) {
          const c = (j % 6) - 2.5;
          const r = 2 - Math.floor(j / 6);
          const isEdge = Math.abs(c) === 2.5 || Math.abs(r) === 2;
          const bob = Math.sin(t * 1.3) * 0.05;
          const [cx, cy, cz] = rotateYX(c * 0.19, r * 0.19, 0, -0.22, -0.2);
          lx = 0.68 + cx;
          ly = -0.66 + cy + bob;
          lz = cz;
          sc = 0.165;
          col = isEdge ? (r === 2 && c > 0 ? GOLD : VIOLET) : r === 1 ? (c < 0 ? COBALT : MAGENTA) : r === 0 ? WHITE : c < 0 ? EMERALD : GOLD;
        } else {
          const k = j - 30;
          const a = (k / 14) * Math.PI * 2 + t * 0.35;
          lx = 0.68 + Math.cos(a) * 0.74;
          ly = -1.24;
          lz = Math.sin(a) * 0.56;
          sc = 0.145;
          col = k % 2 === 0 ? GOLD : MAGENTA;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, 0.36, 0, VIOLET], [-0.24, 0.28, 0, NAVY], [-0.14, 0.2, 0, GOLD],
        [-0.02, 0.1, 0, GOLD], [0.1, 0.0, 0, GOLD], [0.22, -0.08, 0, EMERALD],
        [0.06, -0.18, 0, VIOLET], [0.24, -0.18, 0, COBALT], [0.42, -0.18, 0, VIOLET],
        [0.06, -0.34, 0, WHITE], [0.24, -0.34, 0, EMERALD], [0.42, -0.34, 0, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.18 + Math.sin(t * 0.4) * 0.2, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: -0.18 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7. RANDOM ARENA — Crossed Pixelated Broadswords Mounted Over Heraldic Shield!
     -------------------------------------------------------------------------- */
  "arena-crossed-swords": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.42) * 0.22;
      const rotX = 0.14;
      const clash = Math.sin(t * 2.4) * 0.04;
      let lx = 0, ly = 0, lz = 0, sc = 0.15, col = VIOLET;

      if (idx < SHIELD_54.length) {
        const s = SHIELD_54[idx];
        lx = s.x * 1.25;
        ly = s.y * 1.25;
        lz = s.z * 1.25;
        sc = s.s * 1.22;
        col = s.col;
      } else {
        // Two Crossed Broadswords (33 each = 66, separated cleanly in Z so zero intersection!)
        const j = idx - SHIELD_54.length;
        const isA = j < 33;
        const k = j % 33;
        const sp = SWORD_33[k];
        const ang = (isA ? Math.PI / 4 + clash : (3 * Math.PI) / 4 - clash);
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const u = sp.u * 0.165;
        const v = sp.v * 0.165;
        lx = u * ca - v * sa;
        ly = u * sa + v * ca;
        lz = isA ? 0.16 : 0.38;
        const gleam = sp.role === "edge" && Math.sin(t * 3.0 - sp.u * 0.6) > 0.72;
        sc = 0.145;
        col =
          sp.role === "pommel" || sp.role === "guard"
            ? GOLD
            : sp.role === "hilt"
              ? isA
                ? MAGENTA
                : VIOLET
              : gleam
                ? WHITE
                : sp.role === "edge"
                  ? SILVER
                  : STEEL;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.24, -0.14, GOLD], [-0.2, 0.04, -0.14, COBALT], [0.2, 0.04, -0.14, NAVY], [0, -0.22, -0.14, VIOLET],
        [-0.28, -0.26, 0.1, MAGENTA], [-0.14, -0.12, 0.1, GOLD], [0.06, 0.08, 0.1, SILVER], [0.24, 0.26, 0.1, SILVER],
        [0.28, -0.26, 0.22, VIOLET], [0.14, -0.12, 0.22, GOLD], [-0.06, 0.08, 0.22, SILVER], [-0.24, 0.26, 0.22, SILVER],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     8. RANDOM ARENA — Classic Square Boxing Ring + Two Sparring Gloved Ball-Fighters!
     -------------------------------------------------------------------------- */
  "arena-boxing-ring": {
    hero(idx, _count, t) {
      const rotY = -0.58 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.48;
      let lx = 0, ly = 0, lz = 0, sc = 0.2, col = VIOLET;

      if (idx < 49) {
        // 7x7 Elevated Canvas Mat & Dark Apron
        const c = (idx % 7) - 3;
        const r = Math.floor(idx / 7) - 3;
        const isEdge = Math.abs(c) === 3 || Math.abs(r) === 3;
        const isCross = !isEdge && ((c === 0 && Math.abs(r) <= 1) || (r === 0 && Math.abs(c) <= 1));
        lx = c * 0.34;
        ly = -0.68;
        lz = r * 0.34;
        sc = 0.29;
        col = isEdge ? VIOLET : isCross ? GOLD : WHITE;
      } else if (idx < 65) {
        // 4 Tall Corner Posts (4 cubes each = 16)
        const j = idx - 49;
        const corner = Math.floor(j / 4);
        const lvl = j % 4;
        const sx = corner % 2 === 0 ? -1.02 : 1.02;
        const sz = corner < 2 ? -1.02 : 1.02;
        lx = sx;
        ly = -0.36 + lvl * 0.34;
        lz = sz;
        sc = 0.22;
        col = lvl === 3 ? GOLD : corner === 0 ? MAGENTA : corner === 3 ? COBALT : VIOLET;
      } else if (idx < 97) {
        // Twin Taut Perimeter Ropes (4 sides x 2 tiers x 4 cubes = 32)
        const j = idx - 65;
        const tier = j < 16 ? 0 : 1;
        const k = j % 16;
        const side = Math.floor(k / 4);
        const u = ((k % 4) - 1.5) * 0.44;
        lx = side === 0 ? u : side === 1 ? 1.02 : side === 2 ? -u : -1.02;
        ly = tier === 0 ? -0.02 : 0.32;
        lz = side === 0 ? -1.02 : side === 1 ? u : side === 2 ? 1.02 : -u;
        sc = 0.145;
        col = tier === 0 ? COBALT : MAGENTA;
      } else if (idx < 119) {
        // Two Gloved Ball-Fighters sparring inside the ring! (11 each = 22)
        const j = idx - 97;
        const isA = j < 11;
        const k = j % 11;
        const dir = isA ? -1 : 1;
        const jab = Math.sin(t * 3.2) * 0.16;
        const hop = Math.pow(Math.sin(t * 3.2 + (isA ? 0 : Math.PI / 2)), 2) * 0.1;
        const fx = dir * (0.48 - Math.abs(jab) * 0.45);
        const fy = -0.18 + hop;
        const fz = dir * 0.12;
        const offsets: Array<[number, number, number, string, number]> = [
          [0, 0, 0, isA ? MAGENTA : EMERALD, 0.18],
          [0.16, 0, 0, isA ? MAGENTA : EMERALD, 0.16],
          [-0.16, 0, 0, isA ? MAGENTA : EMERALD, 0.16],
          [0, 0.16, 0, isA ? MAGENTA : EMERALD, 0.16],
          [0, -0.16, 0, isA ? MAGENTA : EMERALD, 0.16],
          [0, 0, 0.16, isA ? MAGENTA : EMERALD, 0.16],
          [0, 0, -0.16, isA ? MAGENTA : EMERALD, 0.16],
          // 2 boxing gloves thrusting inward!
          [-dir * (0.28 + Math.max(0, jab * dir) * 0.3), 0.04, 0.16, isA ? GOLD : COBALT, 0.16],
          [-dir * (0.24 + Math.max(0, -jab * dir) * 0.25), -0.02, -0.16, isA ? GOLD : COBALT, 0.16],
          // 2 crisp white eyes
          [-dir * 0.16, 0.12, 0.08, WHITE, 0.1],
          [-dir * 0.16, 0.12, -0.08, WHITE, 0.1],
        ];
        const op = offsets[k];
        lx = fx + op[0];
        ly = fy + op[1];
        lz = fz + op[2];
        sc = op[4];
        col = op[3];
      } else {
        // Center Clash Spark!
        const spark = Math.abs(Math.sin(t * 3.2));
        lx = 0; ly = 0.18 + spark * 0.14; lz = 0;
        sc = 0.12 + spark * 0.1;
        col = GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, 0.06, -0.32, MAGENTA], [0.32, 0.06, -0.32, VIOLET],
        [-0.32, 0.06, 0.32, VIOLET], [0.32, 0.06, 0.32, COBALT],
        [0, 0.1, -0.32, MAGENTA], [0.32, 0.1, 0, COBALT], [0, 0.1, 0.32, MAGENTA], [-0.32, 0.1, 0, COBALT],
        [-0.12, -0.16, 0, WHITE], [0.12, -0.16, 0, GOLD],
        [-0.14, 0.04, 0.04, MAGENTA], [0.14, 0.04, -0.04, EMERALD],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.55 + Math.sin(t * 0.4) * 0.2, 0.46);
      return { dx, dy, dz, rx: 0.46, ry: -0.55 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     9. CHAINS — Interlocking 3D Chain Links + Bold Emerald Circular Undo Arrow (`↺`)!
     -------------------------------------------------------------------------- */
  "chains-undo-loop": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.34) * 0.24;
      const rotX = 0.18;
      const rock = Math.sin(t * 1.4) * 0.12;
      let lx = 0, ly = 0, lz = 0, sc = 0.16, col = COBALT;

      if (idx < 72) {
        // Link A (0..35, XY plane, left) & Link B (36..71, XZ plane, right) — true 3D interlock!
        const isB = idx >= 36;
        const k = idx % 36;
        const layer = k < 18 ? 0.1 : -0.1;
        const [su, sv] = stadiumLoop18(k % 18, 0.56, 0.34);
        if (!isB) {
          const [rxp, ryp, rzp] = rotateYX(su - 0.3, sv, layer, 0, rock);
          lx = rxp; ly = ryp; lz = rzp;
          col = layer > 0 ? COBALT : NAVY;
        } else {
          const [rxp, ryp, rzp] = rotateYX(su + 0.3, layer, sv, 0, -rock);
          lx = rxp; ly = ryp; lz = rzp;
          col = layer > 0 ? MAGENTA : VIOLET;
        }
        sc = 0.15;
      } else if (idx < 79) {
        // Spinning 7-cube Wrapped Core Gem at (0, 0, 0)
        const k = idx - 72;
        const gPts: Array<[number, number, number]> = [
          [0, 0, 0], [0.14, 0, 0], [-0.14, 0, 0], [0, 0.14, 0], [0, -0.14, 0], [0, 0, 0.14], [0, 0, -0.14],
        ];
        const gp = gPts[k];
        const [gx, gy, gz] = rotateYX(gp[0], gp[1], gp[2], t * 1.6, t * 1.1);
        lx = gx; ly = gy; lz = gz;
        sc = 0.125;
        col = k === 0 ? WHITE : GOLD;
      } else {
        // 41 cubes: Bold 270° Circular Counter-Clockwise Undo Arrow (`↺`) wrapping around the chain!
        const j = idx - 79;
        const r = 1.24;
        if (j < 28) {
          const th = ((-135 + j * 10) * Math.PI) / 180;
          const pulse = 0.9 + 0.18 * Math.sin(t * 3.0 - j * 0.35);
          lx = Math.cos(th) * r;
          ly = Math.sin(th) * r;
          lz = 0;
          sc = 0.175 * pulse;
          col = j % 7 === 0 ? GOLD : EMERALD;
        } else {
          // 13-cube Bold 3D Arrowhead at +135° pointing counter-clockwise down-left!
          const k = j - 28;
          const tipX = Math.cos((135 * Math.PI) / 180) * r;
          const tipY = Math.sin((135 * Math.PI) / 180) * r;
          // Tangent unit vector (-0.707, -0.707), Normal (-0.707, +0.707)
          const headPts: Array<[number, number, number]> = [
            [0.24, 0, 0], // tip
            [0.08, 0.16, 0], [0.08, -0.16, 0],
            [-0.08, 0.32, 0], [-0.08, 0, 0], [-0.08, -0.32, 0],
            [-0.22, 0.42, 0], [-0.22, -0.42, 0],
            [0.08, 0.12, 0.16], [0.08, -0.12, 0.16],
            [0.08, 0.12, -0.16], [0.08, -0.12, -0.16],
            [-0.08, 0, 0.16],
          ];
          const hp = headPts[k % headPts.length];
          const tx = -0.7071, ty = -0.7071;
          const nx = -0.7071, ny = 0.7071;
          lx = tipX + hp[0] * tx + hp[1] * nx;
          ly = tipY + hp[0] * ty + hp[1] * ny;
          lz = hp[2];
          sc = 0.175;
          col = k === 0 ? GOLD : EMERALD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      if (slot < 4) {
        const pts: Array<[number, number, number, string]> = [
          [-0.12, 0, 0, COBALT], [0.12, 0, 0, VIOLET], [0, 0.08, 0.08, GOLD], [0, -0.08, -0.08, MAGENTA],
        ];
        const p = pts[slot];
        const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.18);
        return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
      }
      const k = slot - 4;
      const th = ((-135 + k * 38) * Math.PI) / 180;
      const [dx, dy, dz] = rotateYX(Math.cos(th) * 0.34 * boost, Math.sin(th) * 0.34 * boost, 0, Math.sin(t * 0.45) * 0.25, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc * 0.9, color: k === 7 ? GOLD : EMERALD };
    },
  },

  /* --------------------------------------------------------------------------
     10. ABOUT JAGGER — 3D Circular Medallion Coin with Proud Lowercase `j.`!
     -------------------------------------------------------------------------- */
  "about-j-circle-badge": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.55) * 0.38;
      const rotX = 0.12;
      const bob = Math.sin(t * 1.1) * 0.05;
      const pulse = 1 + 0.08 * Math.sin(t * 2.4);
      let lx = 0, ly = 0, lz = 0, sc = 0.21, col = VIOLET;

      if (idx < 48) {
        // Beveled Circular Coin Rim (24 front + 24 back gold-reeded)
        const isBack = idx >= 24;
        const k = idx % 24;
        const a = (k / 24) * Math.PI * 2;
        const r = 1.24;
        lx = Math.cos(a) * r;
        ly = Math.sin(a) * r + bob;
        lz = isBack ? -0.18 : 0.1;
        sc = 0.23;
        col = !isBack ? VIOLET : k % 3 === 0 ? GOLD : NAVY;
      } else if (idx < 85) {
        // Recessed Pearl Coin Face (37 cubes strictly framed inside dark rim!)
        const j = idx - 48;
        if (j === 0) {
          lx = 0; ly = bob; lz = -0.1;
        } else if (j < 7) {
          const a = ((j - 1) / 6) * Math.PI * 2;
          lx = Math.cos(a) * 0.32; ly = Math.sin(a) * 0.32 + bob; lz = -0.1;
        } else if (j < 19) {
          const a = ((j - 7) / 12) * Math.PI * 2;
          lx = Math.cos(a) * 0.64; ly = Math.sin(a) * 0.64 + bob; lz = -0.1;
        } else {
          const a = ((j - 19) / 18) * Math.PI * 2;
          lx = Math.cos(a) * 0.94; ly = Math.sin(a) * 0.94 + bob; lz = -0.1;
        }
        sc = 0.23;
        col = WHITE;
      } else if (idx < 108) {
        // 23 cubes: BOLD PROUD 3D Lowercase `j.` with period cleanly at middle baseline!
        const k = idx - 85;
        const jGlyph: Array<[number, number, string]> = [
          // Tittle (4 — matches lowercase j stem in deep violet so ONLY the terminal period is magenta!)
          [-0.14, 0.54, VIOLET], [0.04, 0.54, VIOLET], [-0.14, 0.72, VIOLET], [0.04, 0.72, VIOLET],
          // Vertical stem (10)
          [-0.14, 0.28, VIOLET], [0.04, 0.28, VIOLET],
          [-0.14, 0.1, VIOLET], [0.04, 0.1, VIOLET],
          [-0.14, -0.08, VIOLET], [0.04, -0.08, VIOLET],
          [-0.14, -0.26, VIOLET], [0.04, -0.26, VIOLET],
          [-0.14, -0.44, VIOLET], [0.04, -0.44, VIOLET],
          // Descender hook (5)
          [-0.32, -0.62, VIOLET], [-0.14, -0.62, VIOLET],
          [-0.5, -0.44, VIOLET], [-0.32, -0.44, VIOLET], [-0.5, -0.26, VIOLET],
          // Middle-baseline period `.` (4)
          [0.34, -0.22, MAGENTA], [0.52, -0.22, MAGENTA], [0.34, -0.04, MAGENTA], [0.52, -0.04, MAGENTA],
        ];
        const gp = jGlyph[k % jGlyph.length];
        lx = gp[0];
        ly = gp[1] + bob;
        lz = 0.22;
        sc = gp[2] === MAGENTA ? 0.17 * pulse : 0.17;
        col = gp[2];
      } else {
        // Back medallion engraved ring (12)
        const k = idx - 108;
        const a = (k / 12) * Math.PI * 2;
        lx = Math.cos(a) * 0.62;
        ly = Math.sin(a) * 0.62 + bob;
        lz = -0.34;
        sc = 0.21;
        col = VIOLET;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      if (slot < 6) {
        const a = (slot / 6) * Math.PI * 2;
        const [dx, dy, dz] = rotateYX(Math.cos(a) * 0.34 * boost, Math.sin(a) * 0.34 * boost, -0.04, Math.sin(t * 0.45) * 0.3, 0.12);
        return { dx, dy, dz, rx: 0.12, ry: Math.sin(t * 0.45) * 0.3, rz: 0, scale: sc, color: VIOLET };
      }
      const pts: Array<[number, number, string]> = [
        [-0.02, 0.2, MAGENTA], [-0.02, 0.02, VIOLET], [-0.02, -0.14, VIOLET],
        [-0.14, -0.2, VIOLET], [-0.2, -0.1, VIOLET], [0.16, -0.06, MAGENTA],
      ];
      const p = pts[slot - 6];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, 0.1 * boost, Math.sin(t * 0.45) * 0.3, 0.12);
      return { dx, dy, dz, rx: 0.12, ry: Math.sin(t * 0.45) * 0.3, rz: 0, scale: sc * 0.9, color: p[2] };
    },
  },

  /* --------------------------------------------------------------------------
     11. ABOUT CONTACT — Folded Origami Paper Airplane + Sweeping Dotted Flight Trail!
     -------------------------------------------------------------------------- */
  "contact-paper-plane": {
    hero(idx, _count, t) {
      const rotY = -0.24 + Math.sin(t * 0.32) * 0.18;
      const rotX = 0.18;
      const glideY = Math.sin(t * 1.3) * 0.08;
      const bank = -0.34 + Math.sin(t * 1.1) * 0.1;
      const pitch = 0.42 + Math.cos(t * 1.3) * 0.05;
      let lx = 0, ly = 0, lz = 0, sc = 0.145, col = WHITE;

      if (idx < PAPER_PLANE_96.length) {
        const pp = PAPER_PLANE_96[idx];
        // Rotate by pitch around Z, then bank around X!
        const cp = Math.cos(pitch), sp = Math.sin(pitch);
        const x1 = pp.lx * cp - pp.ly * sp;
        const y1 = pp.lx * sp + pp.ly * cp;
        const cb = Math.cos(bank), sb = Math.sin(bank);
        const y2 = y1 * cb - pp.lz * sb;
        const z2 = y1 * sb + pp.lz * cb;
        lx = 0.3 + x1 * 1.25;
        ly = 0.32 + y2 * 1.25 + glideY;
        lz = z2 * 1.25;
        sc = 0.16;
        col = pp.col;
      } else {
        // 24 cubes: Sweeping Dotted Flight Arc trailing behind the plane's tail!
        const k = idx - PAPER_PLANE_96.length; // 0..23
        const u = k / 23; // 0 far tail .. 1 near plane
        const wave = 0.85 + 0.25 * Math.sin(t * 3.4 - k * 0.55);
        lx = -1.78 + u * 1.32;
        ly = -1.16 + u * 0.95 + Math.sin(u * Math.PI * 2.1) * 0.26;
        lz = -0.3 + u * 0.28 + Math.cos(u * Math.PI * 1.8) * 0.14;
        sc = (0.085 + u * 0.045) * wave;
        col = k % 2 === 0 ? MAGENTA : GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0.34, 0.26, 0, COBALT], [0.16, 0.14, 0, NAVY], [0, 0.04, 0, NAVY],
        [0.14, 0.22, -0.14, COBALT], [-0.04, 0.14, -0.22, COBALT],
        [0.12, 0.14, 0.16, EMERALD], [-0.04, 0.04, 0.22, EMERALD],
        [0.02, -0.06, 0, VIOLET],
        [-0.16, -0.08, -0.04, GOLD], [-0.28, -0.18, -0.06, MAGENTA],
        [-0.4, -0.24, -0.08, GOLD], [-0.5, -0.34, -0.1, MAGENTA],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.2 + Math.sin(t * 0.45) * 0.2, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: -0.2 + Math.sin(t * 0.45) * 0.2, rz: 0, scale: slot >= 8 ? sc * 0.72 : sc, color: p[3] };
    },
  },
};
