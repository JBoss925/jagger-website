import type { CubeTarget } from "./CubeFormations";
import type { PaletteSpec } from "./spatialModel";
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

// ============================================================================
// PRECOMPUTED CLEAN NON-OVERLAPPING VOXEL GEOMETRIES (PART A — 14 CONTENDERS)
// ============================================================================

// Classic 45-degree OS Mouse-Pointer Arrow Cursor (`↖`, 15 non-overlapping cubes!)
// Tip at (0, 0), body extends down-right (+x, -y) — universally recognizable at a glance!
const OS_CURSOR_15: Array<{ x: number; y: number; isInner: boolean }> = [
  // Tip
  { x: 0, y: 0, isInner: false },
  // Row 1 (width 2)
  { x: 0, y: -1, isInner: false }, { x: 1, y: -1, isInner: false },
  // Row 2 (width 3)
  { x: 0, y: -2, isInner: false }, { x: 1, y: -2, isInner: true }, { x: 2, y: -2, isInner: false },
  // Row 3 (width 4)
  { x: 0, y: -3, isInner: false }, { x: 1, y: -3, isInner: true }, { x: 2, y: -3, isInner: true }, { x: 3, y: -3, isInner: false },
  // Row 4 (barb)
  { x: 0, y: -4, isInner: false }, { x: 1, y: -4, isInner: false }, { x: 2, y: -4, isInner: false },
  // Diagonal tail
  { x: 2, y: -5, isInner: false }, { x: 3, y: -6, isInner: false },
];

// Asymmetrical 3-Lobe Cumulus Cloud (64 non-overlapping cubes, 2 deep + front dome!)
const CUMULUS_CLOUD_64: Array<{ x: number; y: number; z: number; isRim: boolean }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; isRim: boolean }> = [];
  const p = 0.28;
  // Flat base y=0.14 (9 cols: -4..4 x 2 z layers = 18)
  for (let c = -4; c <= 4; c++) {
    pts.push({ x: c * p, y: 0.14, z: -0.14, isRim: true });
    pts.push({ x: c * p, y: 0.14, z: 0.14, isRim: true });
  }
  // Mid belly y=0.42 (10 cols: -4.5..4.5 x 2 = 20)
  for (let c = 0; c < 10; c++) {
    const x = (c - 4.5) * p;
    const edge = c === 0 || c === 9;
    pts.push({ x, y: 0.42, z: -0.14, isRim: edge });
    pts.push({ x, y: 0.42, z: 0.14, isRim: edge });
  }
  // Asymmetrical 3 lobes y=0.70 (left -3,-2; tall center -1,0,1; right 2,3 = 8 cols x 2 = 16)
  const lobeCols = [-3.5, -2.5, -1.2, -0.2, 0.8, 1.8, 2.8, 3.6];
  for (let i = 0; i < lobeCols.length; i++) {
    const x = lobeCols[i] * p;
    const edge = i === 0 || i === lobeCols.length - 1;
    pts.push({ x, y: 0.7, z: -0.14, isRim: edge });
    pts.push({ x, y: 0.7, z: 0.14, isRim: edge });
  }
  // Tall off-center crown dome y=0.98 (3 cols x 2 = 6)
  for (const c of [-1.2, -0.2, 0.8]) {
    pts.push({ x: c * p, y: 0.98, z: -0.14, isRim: false });
    pts.push({ x: c * p, y: 0.98, z: 0.14, isRim: false });
  }
  // Sculpted front puffy relief cap (4 cubes at z=+0.42)
  pts.push(
    { x: -0.34, y: 0.48, z: 0.42, isRim: false },
    { x: -0.04, y: 0.52, z: 0.42, isRim: false },
    { x: 0.28, y: 0.46, z: 0.42, isRim: false },
    { x: -0.18, y: 0.78, z: 0.42, isRim: false },
  );
  return pts; // exactly 64!
})();

// Solid Beveled 3D Heart (66 non-overlapping cubes!)
const SOLID_HEART_66: Array<{ x: number; y: number; z: number; layer: number }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; layer: number }> = [];
  const p = 0.245;
  // Center full slice z=0 (27 cubes)
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
  // Inset pillow layer z=±0.24 (14 cubes each = 28)
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
  // Front glossy crown relief z=+0.45 (6) + back z=-0.45 (5) = 11 -> total 66!
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
  return pts; // 66!
})();

// Unbroken Continuous ECG PQRST Polyline (38 tightly connected points including vertical QRS strokes!)
const ECG_POLYLINE_38: Array<[number, number]> = (() => {
  const waypoints: Array<[number, number]> = [
    [-1.72, 0],
    [-1.08, 0],
    [-0.92, 0.2], // P-wave peak
    [-0.76, 0],
    [-0.44, 0],
    [-0.32, -0.24], // Q-dip
    [-0.12, 0.88], // Tall R-spike!
    [0.08, -0.42], // Deep S-trough!
    [0.24, 0],
    [0.62, 0],
    [0.86, 0.3], // T-wave hump
    [1.12, 0],
    [1.72, 0],
  ];
  // Compute cumulative arc length and sample 38 strictly uniform points -> ZERO gaps on vertical spikes!
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1][0] - waypoints[i][0];
    const dy = waypoints[i + 1][1] - waypoints[i][1];
    const len = Math.hypot(dx, dy);
    segLens.push(len);
    total += len;
  }
  const out: Array<[number, number]> = [];
  for (let k = 0; k < 38; k++) {
    const targetD = (k / 37) * total;
    let acc = 0;
    let pt: [number, number] = waypoints[waypoints.length - 1];
    for (let i = 0; i < segLens.length; i++) {
      if (acc + segLens[i] >= targetD || i === segLens.length - 1) {
        const frac = segLens[i] > 0 ? (targetD - acc) / segLens[i] : 0;
        pt = [
          waypoints[i][0] + (waypoints[i + 1][0] - waypoints[i][0]) * frac,
          waypoints[i][1] + (waypoints[i + 1][1] - waypoints[i][1]) * frac,
        ];
        break;
      }
      acc += segLens[i];
    }
    out.push(pt);
  }
  return out;
})();

// Game Controller ergonomic silhouette (35 cells per layer x 2 layers = 70 cubes!)
const GAMEPAD_BODY_70: Array<{ x: number; y: number; z: number; isRim: boolean }> = (() => {
  const art = [
    "011111110",
    "111111111",
    "111111111",
    "111000111",
    "110000011",
  ];
  const pts: Array<{ x: number; y: number; z: number; isRim: boolean }> = [];
  for (let r = 0; r < art.length; r++) {
    for (let c = 0; c < 9; c++) {
      if (art[r][c] === "1") {
        const isRim = r === 0 || r === 4 || c === 0 || c === 8 || (r === 3 && (c === 2 || c === 6));
        pts.push({ x: (c - 4) * 0.3, y: (1.6 - r) * 0.3, z: -0.14, isRim });
        pts.push({ x: (c - 4) * 0.3, y: (1.6 - r) * 0.3, z: 0.14, isRim });
      }
    }
  }
  return pts; // 70 cubes!
})();

// Exact 21 6-Face Die Pips (1..6, opposite faces sum to 7!)
const DIE_PIPS_21: Array<[number, number, number]> = (() => {
  const d = 0.67;
  const o = 0.34;
  return [
    // +Z: 1 (center)
    [0, 0, d],
    // -Z: 6
    [-o, -o, -d], [-o, 0, -d], [-o, o, -d], [o, -o, -d], [o, 0, -d], [o, o, -d],
    // +Y: 2
    [-o, d, -o], [o, d, o],
    // -Y: 5
    [-o, -d, -o], [o, -d, -o], [0, -d, 0], [-o, -d, o], [o, -d, o],
    // +X: 3
    [d, -o, -o], [d, 0, 0], [d, o, o],
    // -X: 4
    [-d, -o, -o], [-d, -o, o], [-d, o, -o], [-d, o, o],
  ];
})();

// ============================================================================
// PART A CONTENDERS (7 SUBJECTS × 2 CONTENDERS = 14 FULL SCULPTURES)
// ============================================================================
export const VARIANTS_PART_A: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1A. JETSTREAM — Sun-Peek Asymmetrical Cumulus + Golden Sun + Slanted Rain & Wind Curl!
     -------------------------------------------------------------------------- */
  "js-sun-cloud": {
    hero(idx, _count, t) {
      const rotY = -0.16 + Math.sin(t * 0.3) * 0.16;
      const rotX = 0.14;
      const cloudBob = Math.sin(t * 1.1) * 0.05;
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = "#4f9ae3";

      if (idx < 64) {
        // 64 cubes: Iconic Asymmetrical 3-Lobe Cumulus Cloud (crisp blue underside + snowy crown!)
        const p = CUMULUS_CLOUD_64[idx];
        lx = p.x - 0.16;
        ly = p.y + cloudBob;
        lz = p.z;
        sc = 0.255;
        col = p.isRim ? "#3380cf" : p.y > 0.6 ? "#ffffff" : "#dcedff";
      } else if (idx < 90) {
        // 26 cubes: Bright Golden-Amber Sun peeking clearly behind upper-right shoulder of the cloud!
        const j = idx - 64;
        const sx = 1.06, sy = 1.02, sz = -0.44;
        if (j < 18) {
          // Dense 2-layer sun disk (9 front + 9 back)
          const layer = j < 9 ? 0.12 : -0.12;
          const k = j % 9;
          const gx = (k % 3) - 1;
          const gy = Math.floor(k / 3) - 1;
          lx = sx + gx * 0.24;
          ly = sy + gy * 0.24;
          lz = sz + layer;
          sc = 0.22;
          col = gx === 0 && gy === 0 ? "#ffe07d" : "#f5b83d";
        } else {
          // 8 bold rotating golden sunbeams!
          const ray = j - 18;
          const a = (ray / 8) * Math.PI * 2 + t * 0.45;
          const r = 0.62 + Math.sin(t * 2.2 + ray) * 0.05;
          lx = sx + Math.cos(a) * r;
          ly = sy + Math.sin(a) * r;
          lz = sz;
          sc = 0.165;
          col = "#e88c24";
        }
      } else if (idx < 108) {
        // 18 cubes: 3 Crisp Wind-Slanted Raindrop Streaks cleanly on the left-center under the cloud
        const j = idx - 90;
        const streak = Math.floor(j / 6); // 0, 1, 2
        const slot = j % 6; // 0 top .. 5 bottom
        const fallWave = ((t * 1.8 + streak * 0.33) % 1) * 6;
        let d = slot - fallWave;
        if (d < -3) d += 6;
        if (d > 3) d -= 6;
        const lit = Math.abs(d) < 0.9;
        lx = -1.16 + streak * 0.56 - slot * 0.065;
        ly = -0.26 - slot * 0.21;
        lz = 0.16;
        sc = lit ? 0.18 : 0.135;
        col = lit ? "#1d5ca8" : "#4f9ae3";
      } else {
        // 12 cubes: Clean Curled Jet-Stream Wind Ribbon (`~`) clearly separated to the right of the rain streaks!
        const j = idx - 108;
        const s = j / 11;
        const curl = s > 0.72 ? (s - 0.72) / 0.28 : 0;
        const px = 0.24 + s * 1.38 - Math.sin(curl * Math.PI) * 0.22;
        const py = -0.58 + Math.sin(s * Math.PI * 2 - t * 2.8) * 0.1 + curl * 0.44;
        const gust = Math.sin(s * 6 - t * 3.2) > 0.45;
        lx = px;
        ly = py;
        lz = 0.34;
        sc = gust ? 0.185 : 0.145;
        col = gust ? "#217a99" : "#42a8c2";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.3, 0.06, 0, "#3380cf"], [-0.1, 0.06, 0, "#3380cf"], [0.1, 0.06, 0, "#3380cf"],
        [-0.2, 0.24, 0, "#ffffff"], [0, 0.28, 0, "#ffffff"], [0.16, 0.22, 0, "#dcedff"],
        [0.28, 0.34, -0.12, "#f5b83d"], [0.4, 0.26, -0.12, "#e88c24"], [0.24, 0.46, -0.12, "#e88c24"],
        [-0.24, -0.2, 0.08, "#1d5ca8"], [-0.04, -0.24, 0.08, "#4f9ae3"], [0.2, -0.16, 0.12, "#217a99"],
      ];
      const p = pts[slot];
      const bob = slot >= 9 ? Math.sin(t * 2.4 + slot) * 0.04 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + bob) * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     1B. JETSTREAM — Spinning 3-Cup Weather Anemometer + Cloud-Sun Crest & Wind Curls!
     -------------------------------------------------------------------------- */
  "js-anemometer": {
    hero(idx, _count, t) {
      const rotY = -0.16 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = "#4f9ae3";

      if (idx < 38) {
        // Upper-left sculpted asymmetrical Cloud Crest (38 cubes)
        const p = CUMULUS_CLOUD_64[Math.floor((idx / 38) * 60)];
        lx = -0.78 + p.x * 0.72;
        ly = 0.46 + p.y * 0.72 + Math.sin(t * 1.1) * 0.04;
        lz = p.z * 0.72;
        sc = 0.21;
        col = p.isRim ? "#3380cf" : "#ffffff";
      } else if (idx < 54) {
        // Golden Sun peeking behind upper-left cloud (16 cubes)
        const j = idx - 38;
        const sx = -1.42, sy = 1.24, sz = -0.35;
        if (j < 10) {
          const a = (j / 10) * Math.PI * 2;
          const r = j < 2 ? 0 : 0.22;
          lx = sx + Math.cos(a) * r;
          ly = sy + Math.sin(a) * r;
          lz = sz + (j % 2 === 0 ? 0.08 : -0.08);
          sc = 0.19;
          col = "#f5b83d";
        } else {
          const a = ((j - 10) / 6) * Math.PI * 2 + t * 0.5;
          lx = sx + Math.cos(a) * 0.48;
          ly = sy + Math.sin(a) * 0.48;
          lz = sz;
          sc = 0.14;
          col = "#e88c24";
        }
      } else if (idx < 96) {
        // Right side (x = +0.92): Spinning 3-Cup Meteorological Wind Anemometer! (42 cubes)
        const j = idx - 54;
        const ax = 0.92;
        if (j < 9) {
          // 3x3 dark slate pedestal base
          lx = ax + ((j % 3) - 1) * 0.28;
          ly = -1.28;
          lz = (Math.floor(j / 3) - 1) * 0.28;
          sc = 0.24;
          col = "#29597a";
        } else if (j < 16) {
          // Vertical central anemometer mast (7 cubes)
          const lvl = j - 9;
          lx = ax;
          ly = -0.98 + lvl * 0.29;
          lz = 0;
          sc = 0.19;
          col = lvl % 2 === 0 ? "#29597a" : "#4f9ae3";
        } else if (j < 18) {
          // Top spinning hub cap
          lx = ax;
          ly = 0.96 + (j - 16) * 0.16;
          lz = 0;
          sc = 0.22;
          col = "#f5b83d";
        } else if (j < 27) {
          // 3 horizontal arms 120° apart (3 x 3 = 9)
          const k = j - 18;
          const arm = Math.floor(k / 3);
          const step = (k % 3) + 1;
          const a = t * 1.9 + (arm * Math.PI * 2) / 3;
          const r = step * 0.22;
          lx = ax + Math.cos(a) * r;
          ly = 0.96;
          lz = Math.sin(a) * r;
          sc = 0.135;
          col = "#649ec2";
        } else {
          // 3 vivid C-shaped wind-catcher cups spinning at the arm tips! (3 x 5 = 15)
          const k = j - 27;
          const arm = Math.floor(k / 5);
          const sub = k % 5;
          const a = t * 1.9 + (arm * Math.PI * 2) / 3;
          const cx = ax + Math.cos(a) * 0.78;
          const cz = Math.sin(a) * 0.78;
          const cupOffsets: Array<[number, number, number]> = [
            [0, 0, 0], [0, 0.16, 0], [0, -0.16, 0], [0.14, 0, 0.12], [-0.14, 0, 0.12],
          ];
          const co = cupOffsets[sub];
          lx = cx + co[0] * Math.cos(a) - co[2] * Math.sin(a);
          ly = 0.96 + co[1];
          lz = cz + co[0] * Math.sin(a) + co[2] * Math.cos(a);
          sc = 0.175;
          col = arm === 0 ? "#e05858" : arm === 1 ? "#f2a83b" : "#3a86d8";
        }
      } else {
        // 24 cubes: 2 bold horizontal Jet-Stream Wind-Curl ribbons sweeping into the anemometer!
        const j = idx - 96;
        const line = j < 12 ? 0 : 1;
        const slot = j % 12;
        const s = slot / 11;
        const gust = Math.sin(s * 6 - t * 3.4 + line) > 0.45;
        lx = -1.65 + s * 2.15;
        ly = (line === 0 ? -0.25 : -0.82) + Math.sin(s * Math.PI * 2 - t * 2.6 + line) * 0.14;
        lz = 0.25;
        sc = gust ? 0.185 : 0.145;
        col = gust ? "#1d6d8f" : "#42a8c2";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      if (slot < 4) {
        const pts: Array<[number, number, number, string]> = [
          [-0.32, 0.18, 0, "#3380cf"], [-0.14, 0.24, 0, "#ffffff"], [-0.36, 0.34, -0.1, "#f5b83d"], [-0.26, -0.16, 0.1, "#42a8c2"],
        ];
        const p = pts[slot];
        const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, 0.15, 0.16);
        return { dx, dy, dz, rx: 0.16, ry: 0.15, rz: 0, scale: sc, color: p[3] };
      }
      if (slot < 7) {
        const lvl = slot - 4;
        const [dx, dy, dz] = rotateYX(0.22 * boost, (-0.24 + lvl * 0.2) * boost, 0, 0.15, 0.16);
        return { dx, dy, dz, rx: 0.16, ry: 0.15, rz: 0, scale: sc, color: "#29597a" };
      }
      // 3 spinning colored wind cups + 2 wind streaks
      const k = slot - 7;
      if (k < 3) {
        const a = t * 2.4 + (k * Math.PI * 2) / 3;
        const [dx, dy, dz] = rotateYX((0.22 + Math.cos(a) * 0.22) * boost, 0.24 * boost, Math.sin(a) * 0.22 * boost, 0.15, 0.16);
        return { dx, dy, dz, rx: 0.16, ry: 0.15, rz: 0, scale: sc * 0.92, color: k === 0 ? "#e05858" : k === 1 ? "#f2a83b" : "#3a86d8" };
      }
      const [dx, dy, dz] = rotateYX((-0.12 + (k - 3) * 0.2) * boost, -0.22 * boost, 0.1 * boost, 0.15, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: 0.15, rz: 0, scale: sc * 0.85, color: "#1d6d8f" };
    },
  },

  /* --------------------------------------------------------------------------
     2A. LIVEBOARD — Upright Framed Whiteboard + 2 Large Classic `↖` Mouse Cursors & Dragged Shapes!
     -------------------------------------------------------------------------- */
  "lb-whiteboard-cursors": {
    hero(idx, _count, t) {
      const rotY = -0.14 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.12;
      // Smooth independent collaborative drag orbits cleanly inside the left & right halves of the whiteboard!
      const dragAX = -0.82 + Math.cos(t * 0.9) * 0.2;
      const dragAY = 0.3 + Math.sin(t * 1.1) * 0.18;
      const dragBX = 0.56 + Math.sin(t * 0.85) * 0.18;
      const dragBY = 0.08 + Math.cos(t * 1.0) * 0.16;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = "#344b8c";

      if (idx < 44) {
        // Upright Whiteboard Frame (40-cube hollow perimeter 13x9) + 4-cube bottom marker tray!
        if (idx < 40) {
          let gx = 0, gy = 0;
          if (idx < 13) { gx = idx - 6; gy = 4; }
          else if (idx < 26) { gx = idx - 13 - 6; gy = -4; }
          else if (idx < 33) { gx = -6; gy = 3 - (idx - 26); }
          else { gx = 6; gy = 3 - (idx - 33); }
          lx = gx * 0.29;
          ly = gy * 0.29;
          lz = -0.18;
          sc = 0.255;
          col = "#344b8c";
        } else {
          // Bottom marker tray with blue & pink whiteboard markers!
          const m = idx - 40;
          lx = -0.45 + m * 0.3;
          ly = -1.16;
          lz = 0.12;
          sc = 0.18;
          col = m < 2 ? "#2663eb" : "#e03c8a";
        }
      } else if (idx < 80) {
        // 2 Collaboratively Dragged Shapes inside the open whiteboard frame!
        const j = idx - 44; // 36 cubes
        if (j < 16) {
          // Shape A: Warm Gold 4x4 Sticky Note dragged by Blue Cursor
          const c = (j % 4) - 1.5;
          const r = Math.floor(j / 4) - 1.5;
          lx = dragAX + c * 0.21;
          ly = dragAY + r * 0.21;
          lz = 0.06;
          sc = 0.19;
          col = r === 1.5 ? "#e09822" : "#f4bd4f";
        } else {
          // Shape B: Mint-Teal Selection Box + 4 Blue Corner Resize Handles dragged by Pink Cursor!
          const k = j - 16; // 20 cubes: 12 hollow frame + 4 inner + 4 handles
          if (k < 16) {
            const c = (k % 4) - 1.5;
            const r = Math.floor(k / 4) - 1.5;
            const isEdge = Math.abs(c) === 1.5 || Math.abs(r) === 1.5;
            lx = dragBX + c * 0.22;
            ly = dragBY + r * 0.22;
            lz = 0.06;
            sc = isEdge ? 0.19 : 0.15;
            col = isEdge ? "#2ca38c" : "#a8ebd9";
          } else {
            // 4 crisp corner resize handle dots
            const h = k - 16;
            lx = dragBX + (h % 2 === 0 ? -0.42 : 0.42);
            ly = dragBY + (h < 2 ? -0.42 : 0.42);
            lz = 0.2;
            sc = 0.135;
            col = "#2663eb";
          }
        }
      } else {
        // 40 cubes: TWO LARGE, UNMISTAKABLE CLASSIC `↖` OS MOUSE-ARROW CURSORS + Name-Tag Pills! (20 cubes each!)
        const j = idx - 80;
        const isA = j < 20;
        const k = isA ? j : j - 20;
        const tipX = isA ? dragAX + 0.18 : dragBX + 0.18;
        const tipY = isA ? dragAY - 0.14 : dragBY - 0.14;
        if (k < 15) {
          const cp = OS_CURSOR_15[k];
          lx = tipX + cp.x * 0.145;
          ly = tipY + cp.y * 0.145;
          lz = 0.46;
          sc = 0.138;
          col = cp.isInner ? "#ffffff" : isA ? "#2663eb" : "#e03c8a";
        } else {
          // 5-cube multiplayer name-tag pill right beside the cursor tail!
          const p = k - 15;
          lx = tipX + 0.56 + p * 0.135;
          ly = tipY - 0.82;
          lz = 0.44;
          sc = 0.125;
          col = isA ? "#5285f2" : "#eb6ba6";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, 0.24, -0.06, "#344b8c"], [0, 0.24, -0.06, "#344b8c"], [0.36, 0.24, -0.06, "#344b8c"],
        [-0.36, -0.24, -0.06, "#344b8c"], [0, -0.24, -0.06, "#344b8c"], [0.36, -0.24, -0.06, "#344b8c"],
        [-0.16, 0.04, 0.04, "#f4bd4f"], [0.16, -0.02, 0.04, "#2ca38c"],
        // Blue & Pink cursors gliding in front!
        [-0.12 + Math.cos(t * 1.4) * 0.08, -0.04 + Math.sin(t * 1.4) * 0.06, 0.22, "#2663eb"],
        [-0.04 + Math.cos(t * 1.4) * 0.08, -0.14 + Math.sin(t * 1.4) * 0.06, 0.22, "#2663eb"],
        [0.2 + Math.sin(t * 1.3) * 0.08, 0.02 + Math.cos(t * 1.3) * 0.06, 0.22, "#e03c8a"],
        [0.28 + Math.sin(t * 1.3) * 0.08, -0.08 + Math.cos(t * 1.3) * 0.06, 0.22, "#e03c8a"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2B. LIVEBOARD — Studio Drawing Canvas + Giant 3D Yellow Pencil/Stylus + 2 Live `↖` Cursors!
     -------------------------------------------------------------------------- */
  "lb-pencil-cursors": {
    hero(idx, _count, t) {
      const rotY = -0.16 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.2;
      const sketchPos = Math.sin(t * 1.15) * 0.5 + 0.5; // 0..1 smooth back-and-forth along Bezier ink stroke
      let lx = 0, ly = 0, lz = 0, sc = 0.21, col = "#344b8c";

      if (idx < 40) {
        // Framed Drawing Canvas (32-cube 11x7 perimeter + 8-cube top swatch toolbar!)
        if (idx < 32) {
          let gx = 0, gy = 0;
          if (idx < 11) { gx = idx - 5; gy = 3; }
          else if (idx < 22) { gx = idx - 11 - 5; gy = -3; }
          else if (idx < 27) { gx = -5; gy = 2 - (idx - 22); }
          else { gx = 5; gy = 2 - (idx - 27); }
          lx = gx * 0.32;
          ly = gy * 0.34;
          lz = -0.2;
          sc = 0.25;
          col = "#344b8c";
        } else {
          const k = idx - 32;
          lx = -1.05 + k * 0.3;
          ly = 1.24;
          lz = -0.05;
          sc = 0.18;
          const swatches = ["#2663eb", "#e03c8a", "#f4bd4f", "#38b29a", "#7844ad", "#344b8c", "#344b8c", "#344b8c"];
          col = swatches[k];
        }
      } else if (idx < 64) {
        // Live drawn Bezier S-curve ink stroke (16 cubes) + 8-cube mint shape node on left!
        const j = idx - 40;
        if (j < 16) {
          const s = j / 15;
          const lit = Math.abs(s - sketchPos) < 0.14;
          lx = -1.1 + s * 2.1;
          ly = -0.35 + Math.sin(s * Math.PI * 2) * 0.52;
          lz = 0.08;
          sc = lit ? 0.2 : 0.155;
          col = lit ? "#f4bd4f" : "#2663eb";
        } else {
          const k = j - 16;
          lx = -1.05 + (k % 4) * 0.21;
          ly = 0.42 + (Math.floor(k / 4) - 0.5) * 0.21;
          lz = 0.08;
          sc = 0.185;
          col = "#38b29a";
        }
      } else if (idx < 90) {
        // 26 cubes: Chunky Iconic 3D Yellow Wooden Pencil with Graphite Tip & Pink Eraser at 45° angle!
        const j = idx - 64;
        const tipX = -1.1 + sketchPos * 2.1;
        const tipY = -0.35 + Math.sin(sketchPos * Math.PI * 2) * 0.52;
        // Pencil extends up-right-forward from (tipX, tipY, 0.22)
        const dx = 0.65, dy = 0.68, dz = 0.25;
        if (j === 0) {
          lx = tipX; ly = tipY; lz = 0.22; sc = 0.14; col = "#24283b"; // graphite tip
        } else if (j < 4) {
          const k = j - 1;
          lx = tipX + dx * 0.2 + (k - 1) * 0.08;
          ly = tipY + dy * 0.2 + (k === 1 ? 0.08 : -0.05);
          lz = 0.22 + dz * 0.2;
          sc = 0.17;
          col = "#f0c98d"; // sharpened wood cone
        } else if (j < 20) {
          // 2x2x4 golden pencil barrel!
          const k = j - 4;
          const step = Math.floor(k / 4); // 0..3
          const sub = k % 4;
          const off = (sub % 2 === 0 ? -0.1 : 0.1);
          const offZ = (sub < 2 ? -0.1 : 0.1);
          const dist = 0.44 + step * 0.26;
          lx = tipX + dx * dist + off;
          ly = tipY + dy * dist - off * 0.8;
          lz = 0.22 + dz * dist + offZ;
          sc = 0.19;
          col = sub % 2 === 0 ? "#f5b83d" : "#e39a24";
        } else if (j < 22) {
          // Silver metal ferrule ring
          const k = j - 20;
          const dist = 1.48;
          lx = tipX + dx * dist + (k === 0 ? -0.08 : 0.08);
          ly = tipY + dy * dist;
          lz = 0.22 + dz * dist;
          sc = 0.2;
          col = "#b8c4db";
        } else {
          // 4-cube Pink Eraser cap!
          const k = j - 22;
          const dist = 1.72;
          lx = tipX + dx * dist + (k % 2 === 0 ? -0.09 : 0.09);
          ly = tipY + dy * dist + (k < 2 ? -0.09 : 0.09);
          lz = 0.22 + dz * dist;
          sc = 0.19;
          col = "#e86ca0";
        }
      } else {
        // 30 cubes: TWO classic `↖` OS Mouse Cursors (15 each, Blue left + Pink right)!
        const j = idx - 90;
        const isA = j < 15;
        const cp = OS_CURSOR_15[j % 15];
        const cx = isA ? -1.05 + Math.cos(t * 1.0) * 0.24 : 0.88 + Math.sin(t * 0.9) * 0.24;
        const cy = isA ? 0.55 + Math.sin(t * 1.1) * 0.2 : -0.12 + Math.cos(t * 1.0) * 0.2;
        lx = cx + cp.x * 0.135;
        ly = cy + cp.y * 0.135;
        lz = 0.48;
        sc = 0.128;
        col = cp.isInner ? "#ffffff" : isA ? "#2663eb" : "#e03c8a";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, 0.2, -0.08, "#344b8c"], [0.32, 0.2, -0.08, "#344b8c"],
        [-0.32, -0.2, -0.08, "#344b8c"], [0.32, -0.2, -0.08, "#344b8c"],
        [-0.2, -0.14, 0.12, "#24283b"], [-0.06, 0, 0.14, "#f5b83d"], [0.08, 0.14, 0.16, "#f5b83d"], [0.22, 0.28, 0.18, "#e86ca0"],
        [-0.24, 0.1, 0.22, "#2663eb"], [-0.16, 0.02, 0.22, "#2663eb"],
        [0.24, -0.08, 0.22, "#e03c8a"], [0.32, -0.16, 0.22, "#e03c8a"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3A. AIXC COMPRESSOR — Hydraulic Compression Press (`▼` / `▲` Vice Plates Clamping Data)!
     -------------------------------------------------------------------------- */
  "aixc-press": {
    hero(idx, _count, t) {
      const rotY = -0.26 + Math.sin(t * 0.28) * 0.2;
      const rotX = 0.22;
      const squeeze = Math.pow(Math.sin(t * 1.2) * 0.5 + 0.5, 1.4);
      const jawY = 1.24 - squeeze * 0.58; // smoothly compresses from ±1.24 down to ±0.66!
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = "#436899";

      if (idx < 72) {
        // Top (0..35) & Bottom (36..71) Hydraulic Vice Jaws with Bold Gold `▼` / `▲` Chevrons!
        const isTop = idx < 36;
        const j = isTop ? idx : idx - 36;
        const dir = isTop ? 1 : -1;
        if (j < 21) {
          // 7 wide x 3 deep beveled steel press plate
          const c = (j % 7) - 3;
          const d = Math.floor(j / 7) - 1;
          lx = c * 0.3;
          ly = dir * jawY;
          lz = d * 0.3;
          sc = 0.27;
          col = d === 1 ? "#436899" : "#2c4469";
        } else if (j < 29) {
          // 2x2x2 hydraulic piston column behind the plate
          const k = j - 21;
          lx = (k & 1 ? 0.15 : -0.15);
          ly = dir * (jawY + 0.32 + (k & 2 ? 0.26 : 0));
          lz = (k & 4 ? 0.15 : -0.15);
          sc = 0.23;
          col = "#2c4469";
        } else {
          // Bold 7-cube Golden Inward Compression Chevron (`▼` on top jaw, `▲` on bottom jaw)!
          const k = j - 29; // 0..6
          const chev: Array<[number, number]> = [
            [-0.45, 0.26], [-0.22, 0.12], [0, -0.02], [0.22, 0.12], [0.45, 0.26],
            [-0.14, 0.24], [0.14, 0.24],
          ];
          const cp = chev[k];
          lx = cp[0];
          ly = dir * (jawY + 0.3 + cp[1]);
          lz = 0.42;
          sc = 0.185;
          col = "#f2b33d";
        }
      } else {
        // 48 cubes: Compressible 4x3x4 Data Matrix cleanly squeezed between the jaws (zero clipping!)
        const j = idx - 72;
        const gx = (j % 4) - 1.5;
        const gy = (Math.floor(j / 4) % 3) - 1;
        const gz = Math.floor(j / 12) - 1.5;
        const spX = 0.42 - squeeze * 0.18;
        const spY = 0.38 - squeeze * 0.18;
        const spZ = 0.34 - squeeze * 0.12;
        lx = gx * spX;
        ly = gy * spY;
        lz = gz * spZ;
        sc = 0.185;
        const isCore = Math.abs(gx) <= 0.6 && gy === 0 && Math.abs(gz) <= 0.6;
        col = isCore && squeeze > 0.45 ? "#f2b33d" : squeeze > 0.65 ? "#2e6fc4" : (gx + gy + gz) % 2 === 0 ? "#5aa6d9" : "#6f94c4";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const sq = Math.pow(Math.sin(t * 1.4) * 0.5 + 0.5, 1.4);
      const jy = 0.34 - sq * 0.14;
      if (slot < 3) {
        const [dx, dy, dz] = rotateYX(((slot - 1) * 0.2) * boost, jy * boost, 0, 0.25, 0.2);
        return { dx, dy, dz, rx: 0.2, ry: 0.25, rz: 0, scale: sc, color: slot === 1 ? "#f2b33d" : "#2c4469" };
      }
      if (slot < 6) {
        const [dx, dy, dz] = rotateYX(((slot - 4) * 0.2) * boost, -jy * boost, 0, 0.25, 0.2);
        return { dx, dy, dz, rx: 0.2, ry: 0.25, rz: 0, scale: sc, color: slot === 4 ? "#f2b33d" : "#2c4469" };
      }
      const k = slot - 6;
      const sp = (0.16 - sq * 0.06) * boost;
      const [dx, dy, dz] = rotateYX(((k % 3) - 1) * sp, (k < 3 ? -0.06 : 0.06) * boost, 0, 0.25, 0.2);
      return { dx, dy, dz, rx: 0.2, ry: 0.25, rz: 0, scale: sc * 0.85, color: sq > 0.5 ? "#f2b33d" : "#5aa6d9" };
    },
  },

  /* --------------------------------------------------------------------------
     3B. AIXC COMPRESSOR — Iconic 3D Zipper (`ZIP`) Closing Loose Data Into Tight Archive!
     -------------------------------------------------------------------------- */
  "aixc-zipper": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.34) * 0.26;
      const rotX = 0.14;
      const sliderY = Math.sin(t * 0.95) * 0.78;
      let lx = 0, ly = 0, lz = 0, sc = 0.2, col = "#436899";

      if (idx < 32) {
        // Closed Archive Document Frame cleanly enclosing the zipper (zero floating rails!)
        let gx = 0, gy = 0;
        if (idx < 9) { gx = idx - 4; gy = 5; } // top edge (9)
        else if (idx < 18) { gx = idx - 9 - 4; gy = -5; } // bottom edge (9)
        else if (idx < 25) { gx = -4; gy = 3 - (idx - 18); } // left edge (7)
        else { gx = 4; gy = 3 - (idx - 25); } // right edge (7)
        lx = gx * 0.29;
        ly = gy * 0.29;
        lz = -0.26;
        sc = 0.24;
        col = "#436899";
      } else if (idx < 84) {
        // 52 cubes: 13 interlocking staggered Zipper Teeth per side (2 cubes per tooth)!
        // Above sliderY they splay wide open into a `V`; below sliderY they lock snugly together!
        const j = idx - 32;
        const isRight = j >= 26;
        const k = isRight ? j - 26 : j;
        const tooth = Math.floor(k / 2); // 0 bottom .. 12 top
        const sub = k % 2; // inner / outer cube of tooth
        const side = isRight ? 1 : -1;
        const ty = -1.16 + tooth * 0.21 + (isRight ? 0.1 : 0);
        const openAmt = Math.max(0, ty - sliderY);
        const splay = Math.pow(openAmt, 1.25) * 0.58;
        lx = side * (0.14 + sub * 0.18 + splay);
        ly = ty;
        lz = 0;
        sc = 0.175;
        col = openAmt > 0.08 ? (sub === 0 ? "#52b2d4" : "#6f94c4") : "#2c4469";
      } else if (idx < 102) {
        // 18 cubes: Chunky Golden Zipper Slider Saddle (9) + Hollow Dangling Pull Tab (9)!
        const j = idx - 84;
        if (j < 9) {
          const c = (j % 3) - 1;
          const r = Math.floor(j / 3) - 1;
          lx = c * 0.19;
          ly = sliderY + r * 0.19;
          lz = 0.18;
          sc = 0.19;
          col = "#f2b33d";
        } else {
          // Hollow dangling zipper pull tab hanging below slider!
          const p = j - 9;
          const tabPts: Array<[number, number]> = [
            [0, -0.32],
            [-0.17, -0.5], [0.17, -0.5],
            [-0.17, -0.68], [0.17, -0.68],
            [-0.17, -0.86], [0.17, -0.86],
            [0, -0.86], [0, -0.5],
          ];
          const tp = tabPts[p];
          lx = tp[0];
          ly = sliderY + tp[1];
          lz = 0.36;
          sc = 0.16;
          col = p === 0 || p === 8 ? "#d9881e" : "#f2b33d";
        }
      } else {
        // 18 cubes: Tight solid Compressed Archive Base Bar (6x3) at bottom!
        const j = idx - 102;
        const c = (j % 6) - 2.5;
        const r = Math.floor(j / 6);
        lx = c * 0.25;
        ly = -1.56 + r * 0.18;
        lz = 0.04;
        sc = 0.22;
        col = r === 2 ? "#436899" : "#2c4469";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const sy = Math.sin(t * 1.2) * 0.14;
      const pts: Array<[number, number, number, string]> = [
        [-0.08, -0.32, 0, "#2c4469"], [0.08, -0.24, 0, "#2c4469"],
        [-0.08, -0.12, 0, "#2c4469"], [0.08, -0.04, 0, "#2c4469"],
        [-0.18, 0.12, 0, "#52b2d4"], [0.18, 0.14, 0, "#52b2d4"],
        [-0.3, 0.28, 0, "#6f94c4"], [0.3, 0.3, 0, "#6f94c4"],
        [0, sy + 0.04, 0.18, "#f2b33d"], [0, sy - 0.1, 0.22, "#d9881e"],
        [-0.2, -0.34, 0, "#2c4469"], [0.2, -0.34, 0, "#2c4469"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.45) * 0.25, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.45) * 0.25, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4A. JAGGER GAMES — Iconic 3D Game Controller (Ergonomic Grips + D-Pad + Vivid ABXY Buttons!)
     -------------------------------------------------------------------------- */
  "games-controller": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.45) * 0.24;
      const rotX = 0.16 + Math.sin(t * 0.7) * 0.06;
      const activeBtn = Math.floor((t * 2.2) % 4);
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = "#8b5cc9";

      if (idx < 70) {
        // Ergonomic 2-layer Controller Body with twin arched lower grips!
        const p = GAMEPAD_BODY_70[idx];
        lx = p.x;
        ly = p.y;
        lz = p.z;
        sc = 0.265;
        col = p.z < 0 ? "#5e3396" : p.isRim ? "#7844ad" : "#a975d9";
      } else if (idx < 74) {
        // 4 L/R Shoulder Bumpers along top edge!
        const k = idx - 70;
        lx = k < 2 ? -0.96 + k * 0.28 : 0.68 + (k - 2) * 0.28;
        ly = 0.78;
        lz = 0;
        sc = 0.23;
        col = "#2d1d4d";
      } else if (idx < 87) {
        // Left Cross `+` D-Pad (9 cubes) + Center Start/Select pills (4 cubes)
        const j = idx - 74;
        if (j < 9) {
          const dpad: Array<[number, number]> = [
            [0, 0], [0, 0.18], [0, 0.34], [0, -0.18], [0, -0.34],
            [-0.18, 0], [-0.34, 0], [0.18, 0], [0.34, 0],
          ];
          const dp = dpad[j];
          lx = -0.74 + dp[0] * 0.92;
          ly = 0.12 + dp[1] * 0.92;
          lz = 0.36;
          sc = 0.155;
          col = "#261842";
        } else {
          const s = j - 9;
          lx = (s < 2 ? -0.18 : 0.18) + (s % 2 === 0 ? -0.06 : 0.06);
          ly = 0.14;
          lz = 0.32;
          sc = 0.11;
          col = "#3d2766";
        }
      } else if (idx < 103) {
        // 16 cubes: 4 VIVID JEWEL ABXY DIAMOND BUTTONS on right (4 clusters x 4 cubes)!
        const j = idx - 87;
        const btn = Math.floor(j / 4); // 0=Top(Blue), 1=Right(Crimson), 2=Bottom(Emerald), 3=Left(Gold)
        const sub = j % 4;
        const centers: Array<[number, number, string]> = [
          [0.82, 0.38, "#3c82e8"],
          [1.12, 0.08, "#e04868"],
          [0.82, -0.22, "#38b87c"],
          [0.52, 0.08, "#f4be44"],
        ];
        const [bx, by, bCol] = centers[btn];
        const press = btn === activeBtn ? -0.07 : 0;
        lx = bx + (sub % 2 === 0 ? -0.065 : 0.065);
        ly = by + (sub < 2 ? -0.065 : 0.065);
        lz = 0.38 + press;
        sc = 0.13;
        col = bCol;
      } else {
        // Twin Analog Thumbsticks (2 x 5 = 10) + 7-cube top center player LED bar!
        const j = idx - 103;
        if (j < 10) {
          const isLeft = j < 5;
          const k = j % 5;
          const sx = isLeft ? -0.44 : 0.44;
          const sy = -0.34;
          const tiltX = Math.cos(t * 2.0 + (isLeft ? 0 : 1.5)) * 0.06;
          const tiltY = Math.sin(t * 2.0 + (isLeft ? 0 : 1.5)) * 0.06;
          if (k === 0) {
            lx = sx; ly = sy; lz = 0.3; sc = 0.15; col = "#261842";
          } else {
            // Compact 2x2 rounded thumbstick cap (reads as joystick, not a mini D-pad!)
            const cxOff = (k - 1) % 2 === 0 ? -0.07 : 0.07;
            const cyOff = (k - 1) < 2 ? -0.07 : 0.07;
            lx = sx + tiltX + cxOff;
            ly = sy + tiltY + cyOff;
            lz = 0.44;
            sc = 0.145;
            col = "#36235c";
          }
        } else {
          const k = j - 10; // 0..6 top LED glow strip
          lx = (k - 3) * 0.12;
          ly = 0.56;
          lz = 0.32;
          sc = 0.1;
          col = k === 3 ? "#5cc8ff" : "#dcd0fc";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.28, 0.12, 0, "#7844ad"], [0, 0.12, 0, "#a975d9"], [0.28, 0.12, 0, "#7844ad"],
        [-0.3, -0.1, 0, "#5e3396"], [0.3, -0.1, 0, "#5e3396"], [0, -0.02, 0, "#a975d9"],
        [-0.26, 0.12, 0.16, "#261842"], [-0.26, 0.02, 0.16, "#261842"],
        [0.24, 0.18, 0.18, "#3c82e8"], [0.34, 0.08, 0.18, "#e04868"],
        [0.24, -0.02, 0.18, "#38b87c"], [0.14, 0.08, 0.18, "#f4be44"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.5) * 0.26, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: Math.sin(t * 0.5) * 0.26, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4B. JAGGER GAMES — Twin Crisp 3D Tumbling Dice (Exact 1–6 Pips!) Over Puzzle Tile Tray!
     -------------------------------------------------------------------------- */
  "games-dice": {
    hero(idx, _count, t) {
      let lx = 0, ly = 0, lz = 0, rx = 0.2, ry = 0.2, sc = 0.22, col = "#a975d9";

      if (idx < 96) {
        // Die 1 (0..47, Royal Violet) & Die 2 (48..95, Coral-Rose) — each has 27 solid body + 21 exact 1–6 pips!
        const isDie1 = idx < 48;
        const k = isDie1 ? idx : idx - 48;
        const cx = isDie1 ? -0.92 : 0.94;
        const cy = (isDie1 ? 0.34 : 0.04) + Math.sin(t * 1.3 + (isDie1 ? 0 : 2.2)) * 0.12;
        const cz = isDie1 ? 0.12 : -0.08;
        const dRotY = (isDie1 ? 0.45 : -0.55) + t * (isDie1 ? 0.42 : -0.38);
        const dRotX = (isDie1 ? 0.42 : 0.62) + Math.sin(t * 0.65 + (isDie1 ? 0 : 1.5)) * 0.28;

        let px = 0, py = 0, pz = 0;
        if (k < 27) {
          // 3x3x3 beveled solid die body
          px = ((k % 3) - 1) * 0.4;
          py = (Math.floor(k / 3) % 3 - 1) * 0.4;
          pz = (Math.floor(k / 9) - 1) * 0.4;
          sc = 0.38;
          col = isDie1 ? "#a975d9" : "#de6898";
        } else {
          // Exact 1–6 die pips mounted cleanly on all 6 faces!
          const pipIdx = k - 27;
          const p = DIE_PIPS_21[pipIdx];
          px = p[0] * 0.92;
          py = p[1] * 0.92;
          pz = p[2] * 0.92;
          sc = 0.155;
          col = pipIdx === 0 ? "#f4be44" : "#261842";
        }
        const [rxp, ryp, rzp] = rotateYX(px, py, pz, dRotY, dRotX);
        lx = cx + rxp;
        ly = cy + ryp;
        lz = cz + rzp;
        rx = dRotX;
        ry = dRotY;
      } else {
        // 24 cubes: Sleek 6x4 Jordle / Wordle Puzzle Tile Base Tray!
        const j = idx - 96;
        const c = (j % 6) - 2.5;
        const r = Math.floor(j / 6) - 1.5;
        const [tx, ty, tz] = rotateYX(c * 0.42, -1.26, r * 0.38, -0.22 + Math.sin(t * 0.25) * 0.14, 0.32);
        lx = tx;
        ly = ty;
        lz = tz;
        rx = 0.32;
        ry = -0.22;
        sc = 0.26;
        const tileColors = ["#38b87c", "#f4be44", "#5e3396", "#38b87c", "#a975d9", "#f4be44"];
        col = tileColors[(j + Math.floor(j / 6)) % tileColors.length];
      }

      return makeTarget(lx, ly, lz, rx, ry, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const isLeft = slot < 6;
      const k = slot % 6;
      const cx = isLeft ? -0.22 : 0.22;
      const cy = isLeft ? 0.08 : -0.08;
      const pts: Array<[number, number, number, string]> = [
        [0, 0, 0, isLeft ? "#7844ad" : "#de6898"],
        [-0.08, 0.08, 0.14, "#261842"], [0.08, -0.08, 0.14, "#261842"],
        [0, 0, 0.14, "#f4be44"], [0.14, 0.05, 0, "#261842"], [0, 0.14, -0.04, "#261842"],
      ];
      const p = pts[k];
      const [dx, dy, dz] = rotateYX((cx + p[0]) * boost, (cy + p[1]) * boost, p[2] * boost, t * 0.6, 0.35);
      return { dx, dy, dz, rx: 0.35, ry: t * 0.6, rz: 0, scale: k === 0 ? sc * 1.45 : sc * 0.62, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5A. HEARTH — Framed Retro Studio Tube Amp (Solid Chassis + Glowing Vacuum Tube + 6-Bar VU Meter!)
     -------------------------------------------------------------------------- */
  "hearth-tube-amp": {
    hero(idx, _count, t) {
      const rotY = -0.18 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.16;
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = "#4a2542";

      if (idx < 46) {
        // Solid Beveled Studio Amp Chassis (42 perimeter + divider + 4 rubber amp feet)
        if (idx < 38) {
          let gx = 0, gy = 0;
          if (idx < 13) { gx = idx - 6; gy = 3.5; }
          else if (idx < 26) { gx = idx - 13 - 6; gy = -3.5; }
          else if (idx < 32) { gx = -6; gy = 2.5 - (idx - 26); }
          else { gx = 6; gy = 2.5 - (idx - 32); }
          lx = gx * 0.29;
          ly = gy * 0.29;
          lz = -0.14;
          sc = 0.265;
          col = gy === 3.5 || gy === -3.5 ? "#5c2e52" : "#4a2542";
        } else if (idx < 42) {
          // Center bay divider separating Tube bay (left) from VU Meter bay (right)
          const r = idx - 38;
          lx = -0.28;
          ly = -0.58 + r * 0.38;
          lz = -0.12;
          sc = 0.22;
          col = "#974b75";
        } else {
          // 4 chunky rubber amp feet
          const f = idx - 42;
          lx = f < 2 ? -1.45 + f * 0.3 : 1.15 + (f - 2) * 0.3;
          ly = -1.26;
          lz = -0.12;
          sc = 0.2;
          col = "#331a2e";
        }
      } else if (idx < 78) {
        // Left bay (x = -1.02): Warm Glowing Analog Vacuum Tube (32 cubes)!
        const j = idx - 46;
        const tx = -1.02;
        if (j < 6) {
          // Steel tube socket base (3x2)
          lx = tx + ((j % 3) - 1) * 0.22;
          ly = -0.72;
          lz = (j < 3 ? -0.12 : 0.12);
          sc = 0.2;
          col = "#362033";
        } else if (j < 12) {
          // Glowing orange-gold Vacuum Filament Core (2x3 solid center!)
          const k = j - 6;
          const glowPulse = Math.sin(t * 3.4) * 0.04;
          lx = tx + (k % 2 === 0 ? -0.11 : 0.11);
          ly = -0.36 + Math.floor(k / 2) * 0.26;
          lz = 0;
          sc = 0.21 + glowPulse;
          col = k >= 2 && k <= 3 ? "#ffd166" : "#ff9436";
        } else {
          // 20-cube rounded glass envelope around filament (8 lower + 8 upper + 4 dome cap)
          const k = j - 12;
          if (k < 16) {
            const ring = k < 8 ? -0.22 : 0.16;
            const a = ((k % 8) / 8) * Math.PI * 2 + 0.4;
            lx = tx + Math.cos(a) * 0.42;
            ly = ring;
            lz = Math.sin(a) * 0.42;
            sc = 0.165;
            col = "#f2b8d4";
          } else {
            const c = k - 16;
            const a = (c / 4) * Math.PI * 2 + 0.4;
            lx = tx + Math.cos(a) * 0.2;
            ly = 0.54;
            lz = Math.sin(a) * 0.2;
            sc = 0.175;
            col = "#ffd6e9";
          }
        }
      } else {
        // Right bay: Crisp 6-Column Studio VU Equalizer (6 x 7 = 42 LED segments: Emerald -> Amber -> Crimson!)
        const j = idx - 78;
        const colIdx = Math.floor(j / 7); // 0..5
        const lvl = j % 7; // 0..6
        const activeH = 3.1 + Math.sin(t * 2.8 + colIdx * 0.85) * 2.1 + Math.cos(t * 4.5 - colIdx * 0.6) * 0.9;
        const isLit = lvl <= activeH;
        lx = 0.08 + colIdx * 0.27;
        ly = -0.74 + lvl * 0.245;
        lz = isLit ? 0.1 : -0.04;
        sc = isLit ? 0.21 : 0.1;
        col = !isLit ? "#5e3252" : lvl >= 6 ? "#e64c66" : lvl >= 4 ? "#f4be44" : "#38b87c";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.22, 0, "#4a2542"], [-0.12, -0.22, 0, "#4a2542"], [0.12, -0.22, 0, "#4a2542"], [0.36, -0.22, 0, "#4a2542"],
        [-0.26, 0.02, 0.08, "#ff9436"], [-0.26, 0.22, 0.08, "#ffd166"],
        [0.02, 0.0, 0.08, "#38b87c"], [0.02, 0.2, 0.08, "#f4be44"],
        [0.2, 0.0, 0.08, "#38b87c"], [0.2, 0.22, 0.08, "#e64c66"],
        [0.38, 0.0, 0.08, "#38b87c"], [0.38, 0.16, 0.08, "#f4be44"],
      ];
      const p = pts[slot];
      const eq = slot >= 6 ? Math.sin(t * 3.0 + slot) * 0.05 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + eq) * boost, p[2] * boost, Math.sin(t * 0.4) * 0.24, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.4) * 0.24, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5B. HEARTH — Sculpted 3D Studio Headphones Embracing a Glowing Stereo Audio Waveform!
     -------------------------------------------------------------------------- */
  "hearth-headphones": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.34) * 0.26;
      const rotX = 0.16;
      const beat = Math.sin(t * 3.2) * 0.03;
      let lx = 0, ly = 0, lz = 0, sc = 0.23, col = "#5e3252";

      if (idx < 34) {
        // Arched Studio Headband (17 angular steps x 2 depth = 34 cubes)
        const step = Math.floor(idx / 2); // 0..16
        const zLayer = idx % 2 === 0 ? -0.14 : 0.14;
        const a = 0.1 * Math.PI + (step / 16) * (0.8 * Math.PI);
        lx = Math.cos(a) * 1.42;
        ly = 0.05 + Math.sin(a) * 1.42;
        lz = zLayer;
        sc = 0.245;
        col = step >= 5 && step <= 11 ? "#4a2542" : "#783c63";
      } else if (idx < 90) {
        // Twin Sculpted Studio Earcups (28 cubes each = 56)
        const j = idx - 34;
        const isRight = j >= 28;
        const k = isRight ? j - 28 : j;
        const side = isRight ? 1 : -1;
        if (k < 16) {
          // Outer metallic acoustic cup shell (oval ring + center cap)
          const isCap = k >= 12;
          if (!isCap) {
            const a = (k / 12) * Math.PI * 2;
            lx = side * (1.46 + beat);
            ly = -0.34 + Math.sin(a) * 0.56;
            lz = Math.cos(a) * 0.44;
            sc = 0.24;
            col = "#4a2542";
          } else {
            const c = k - 12;
            lx = side * (1.62 + beat);
            ly = -0.34 + (c < 2 ? -0.14 : 0.14);
            lz = (c % 2 === 0 ? -0.14 : 0.14);
            sc = 0.22;
            col = "#974b75";
          }
        } else {
          // 12-cube plush inward-facing rose earpad cushion ring!
          const a = ((k - 16) / 12) * Math.PI * 2;
          lx = side * (1.14 + beat);
          ly = -0.34 + Math.sin(a) * 0.52;
          lz = Math.cos(a) * 0.42;
          sc = 0.22;
          col = "#cc7ea8";
        }
      } else {
        // 30 cubes: Glowing Hearth-Fire Stereo Audio Waveform pulsing right between the earcups!
        const j = idx - 90;
        const colIdx = Math.floor(j / 3); // 0..9 across x = -0.78..+0.78
        const row = (j % 3) - 1; // -1, 0, +1 symmetric vertical bars
        const amp = 0.18 + (Math.sin(t * 3.6 + colIdx * 0.72) * 0.5 + 0.5) * 0.36;
        lx = (colIdx - 4.5) * 0.175;
        ly = -0.28 + row * amp;
        lz = 0.08;
        sc = row === 0 ? 0.175 : 0.145;
        const distCenter = Math.abs(colIdx - 4.5);
        col = distCenter < 1.8 ? "#ffd166" : distCenter < 3.4 ? "#ff8c38" : "#e05688";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.3, 0.16, 0, "#5e3252"], [-0.16, 0.34, 0, "#4a2542"], [0, 0.4, 0, "#4a2542"],
        [0.16, 0.34, 0, "#4a2542"], [0.3, 0.16, 0, "#5e3252"],
        [-0.32, -0.08, 0, "#974b75"], [-0.26, -0.2, 0, "#cc7ea8"],
        [0.32, -0.08, 0, "#974b75"], [0.26, -0.2, 0, "#cc7ea8"],
        [-0.1, -0.1, 0.08, "#ff8c38"], [0, -0.1, 0.08, "#ffd166"], [0.1, -0.1, 0.08, "#ff8c38"],
      ];
      const p = pts[slot];
      const w = slot >= 9 ? Math.sin(t * 3.5 + slot) * 0.06 : 0;
      const [dx, dy, dz] = rotateYX(p[0] * boost, (p[1] + w) * boost, p[2] * boost, Math.sin(t * 0.45) * 0.28, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: Math.sin(t * 0.45) * 0.28, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6A. PALMETTO — Solid-Gable Cozy Modern House + Gridded Solar Roof + Warm Golden-Amber Sun!
     -------------------------------------------------------------------------- */
  "palmetto-solid-house": {
    hero(idx, _count, t) {
      const rotY = -0.38 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.2;
      let lx = 0, ly = 0, lz = 0, sc = 0.25, col = "#d6ccbf";

      if (idx < 50) {
        // Solid-Gable House Walls (36) + Solid Front & Back Triangular Gables (8) + Lawn Base (6)!
        if (idx < 36) {
          // 5 wide x 3 deep perimeter x 3 stories = 36 cubes (12 per story)
          const story = Math.floor(idx / 12); // 0, 1, 2
          const k = idx % 12;
          let gx = 0, gz = 0;
          if (k < 5) { gx = k - 2; gz = 1; } // front wall (+Z)
          else if (k < 10) { gx = k - 5 - 2; gz = -1; } // back wall (-Z)
          else if (k === 10) { gx = -2; gz = 0; }
          else { gx = 2; gz = 0; }
          lx = -0.22 + gx * 0.31;
          ly = -1.16 + story * 0.31;
          lz = gz * 0.34;
          sc = 0.28;
          const isDoor = gz === 1 && gx === -1 && story <= 1;
          const isWindow = gz === 1 && gx === 1 && story === 1;
          col = isDoor ? "#2b5e54" : isWindow ? "#f5b83d" : story === 0 ? "#c9bfb3" : "#ded5c8";
        } else if (idx < 44) {
          // 100% SOLID Triangular Front & Back Gable Fill (ZERO see-through roof gaps!)
          const k = idx - 36;
          const isFront = k < 4;
          const m = k % 4;
          const gablePts: Array<[number, number]> = [
            [-1, -0.23], [0, -0.23], [1, -0.23], [0, 0.08],
          ];
          const gp = gablePts[m];
          lx = -0.22 + gp[0] * 0.31;
          ly = gp[1];
          lz = isFront ? 0.34 : -0.34;
          sc = 0.28;
          col = "#d6ccbf";
        } else {
          // 6-cube verdant lawn foundation strip
          const k = idx - 44;
          lx = -0.22 + (k - 2.5) * 0.34;
          ly = -1.46;
          lz = 0.14;
          sc = 0.26;
          col = "#388c7a";
        }
      } else if (idx < 92) {
        // Pitched Roof (12 left slate + 4 ridge cap) + Gridded Teal-Blue Solar Panel Array on sun-facing right slope (26)!
        const j = idx - 50; // 42 cubes
        if (j < 12) {
          // Left charcoal-slate roof slope (3 steps x 4 depth)
          const step = Math.floor(j / 4); // 0 eave .. 2 upper
          const d = (j % 4) - 1.5;
          lx = -0.22 - (0.86 - step * 0.28);
          ly = -0.28 + step * 0.28;
          lz = d * 0.31;
          sc = 0.255;
          col = "#3c525e";
        } else if (j < 16) {
          // Roof peak ridge cap (4 depth)
          const d = j - 12 - 1.5;
          lx = -0.22;
          ly = 0.56;
          lz = d * 0.31;
          sc = 0.24;
          col = "#2b3e4a";
        } else {
          // Sun-facing Right Roof Slope tiled with 26 crisp photovoltaic Solar Panel cells!
          const k = j - 16; // 0..25 -> 4 steps x 4 depth (16 main cells) + 10 raised grid cells/glints
          if (k < 20) {
            const step = Math.floor(k / 5); // 0..3
            const d = (k % 5) - 2;
            const glint = Math.sin(t * 2.2 + step * 0.8 + d * 0.5) > 0.72;
            lx = -0.22 + (0.94 - step * 0.25);
            ly = -0.32 + step * 0.25;
            lz = d * 0.26;
            sc = 0.23;
            col = glint ? "#9ef0e0" : (step + Math.floor(d + 2)) % 2 === 0 ? "#19536e" : "#25728c";
          } else {
            // Subtle silver aluminum solar-frame rails along top & bottom edges of panel array
            const m = k - 20;
            const isTop = m < 3;
            const d = (m % 3) - 1;
            lx = -0.22 + (isTop ? 0.2 : 0.98);
            ly = isTop ? 0.44 : -0.36;
            lz = d * 0.42;
            sc = 0.125;
            col = "#9be0d4";
          }
        }
      } else {
        // 28 cubes: UNMISTAKABLE WARM GOLDEN-AMBER SUN hovering upper-right (ZERO icy snowflake vibes!)
        const j = idx - 92;
        const sx = 1.32, sy = 1.06, sz = -0.06;
        if (j < 20) {
          // Solid beveled golden sun core (9 front + 9 back + 2 center highlight)
          const layer = j < 9 ? 0.12 : j < 18 ? -0.12 : 0.24;
          const k = j % 9;
          const gx = j >= 18 ? (j === 18 ? -0.1 : 0.1) : ((k % 3) - 1) * 0.23;
          const gy = j >= 18 ? 0 : (Math.floor(k / 3) - 1) * 0.23;
          lx = sx + gx;
          ly = sy + gy;
          lz = sz + layer;
          sc = 0.225;
          col = j >= 18 ? "#ffe382" : "#f5b83d";
        } else {
          // 8 crisp warm amber sunbeams rotating smoothly!
          const ray = j - 20;
          const a = (ray / 8) * Math.PI * 2 + t * 0.38;
          const r = 0.66 + Math.sin(t * 2.2 + ray) * 0.05;
          lx = sx + Math.cos(a) * r;
          ly = sy + Math.sin(a) * r;
          lz = sz;
          sc = 0.165;
          col = "#e88c24";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.24, -0.22, 0, "#c9bfb3"], [0, -0.22, 0, "#2b5e54"], [0.24, -0.22, 0, "#c9bfb3"],
        [-0.22, 0.0, 0, "#ded5c8"], [0, 0.0, 0, "#ded5c8"], [0.22, 0.0, 0, "#f5b83d"],
        [-0.18, 0.18, 0, "#3c525e"], [0, 0.3, 0, "#19536e"], [0.18, 0.18, 0, "#25728c"],
        [0.38, 0.36, -0.06, "#f5b83d"], [0.48, 0.28, -0.06, "#e88c24"], [0.34, 0.48, -0.06, "#e88c24"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.3 + Math.sin(t * 0.4) * 0.22, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: -0.3 + Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6B. PALMETTO — Tilted 3D Solar Panel Array + Golden Sun + Lightning Bolt & Charging Battery!
     -------------------------------------------------------------------------- */
  "palmetto-panel-battery": {
    hero(idx, _count, t) {
      const rotY = -0.22 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.2;
      const chargePhase = Math.sin(t * 1.4) * 0.5 + 0.5; // 0..1 smooth battery fill
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = "#246f8c";

      if (idx < 56) {
        // Left (x = -0.58): Tilted Gridded Solar Panel (30 cells + 16 frame rim + 4 stand + 6 pedestal!)
        if (idx < 30) {
          const c = (idx % 6) - 2.5;
          const r = Math.floor(idx / 6) - 2;
          const glint = Math.sin(t * 2.2 - c * 0.5 + r * 0.6) > 0.72;
          const [px, py, pz] = rotateYX(c * 0.27, r * 0.27, 0, 0, -0.55);
          lx = -0.62 + px;
          ly = -0.05 + py;
          lz = pz;
          sc = 0.235;
          col = glint ? "#9ef0e0" : (Math.floor(c + 3) + Math.floor(r + 2)) % 2 === 0 ? "#164a66" : "#246f8c";
        } else if (idx < 46) {
          // 16-cube aluminum perimeter rim around the tilted panel
          const k = idx - 30;
          const side = Math.floor(k / 4);
          const s = (k % 4) - 1.5;
          const rx0 = side === 0 ? s * 0.44 : side === 1 ? 0.88 : side === 2 ? -s * 0.44 : -0.88;
          const ry0 = side === 0 ? 0.76 : side === 1 ? -s * 0.38 : side === 2 ? -0.76 : s * 0.38;
          const [px, py, pz] = rotateYX(rx0, ry0, -0.06, 0, -0.55);
          lx = -0.62 + px;
          ly = -0.05 + py;
          lz = pz;
          sc = 0.16;
          col = "#75b8ad";
        } else if (idx < 50) {
          // Angled steel mounting post
          const k = idx - 46;
          lx = -0.62;
          ly = -0.46 - k * 0.23;
          lz = -0.18;
          sc = 0.19;
          col = "#2d4654";
        } else {
          // 3x2 grounded steel base pedestal
          const k = idx - 50;
          lx = -0.62 + ((k % 3) - 1) * 0.28;
          ly = -1.28;
          lz = -0.18 + (k < 3 ? -0.16 : 0.16);
          sc = 0.23;
          col = "#2d4654";
        }
      } else if (idx < 82) {
        // Upper-left: Warm Golden-Amber Sun (18 core + 8 rays = 26)
        const j = idx - 56;
        const sx = -1.36, sy = 1.18, sz = -0.2;
        if (j < 18) {
          const layer = j < 9 ? 0.11 : -0.11;
          const k = j % 9;
          lx = sx + ((k % 3) - 1) * 0.2;
          ly = sy + (Math.floor(k / 3) - 1) * 0.2;
          lz = sz + layer;
          sc = 0.195;
          col = "#f5b83d";
        } else {
          const ray = j - 18;
          const a = (ray / 8) * Math.PI * 2 + t * 0.4;
          lx = sx + Math.cos(a) * 0.58;
          ly = sy + Math.sin(a) * 0.58;
          lz = sz;
          sc = 0.145;
          col = "#e88c24";
        }
      } else if (idx < 94) {
        // 12 cubes: Crisp Golden 3D Lightning Bolt (`⚡`) bridging solar panel -> battery!
        const j = idx - 82;
        const bolt: Array<[number, number]> = [
          [0.14, 0.62], [0.02, 0.44], [-0.1, 0.26], [-0.22, 0.08],
          [-0.06, 0.08], [0.1, 0.08], [0.24, 0.08],
          [0.12, -0.1], [0.0, -0.28], [-0.12, -0.46], [-0.24, -0.64],
          [0.02, 0.08],
        ];
        const bp = bolt[j];
        const pulse = 0.92 + Math.sin(t * 3.4 - j * 0.4) * 0.14;
        lx = 0.66 + bp[0] * 0.85;
        ly = -0.14 + bp[1] * 0.92;
        lz = 0.34;
        sc = 0.16 * pulse;
        col = pulse > 1.0 ? "#ffe382" : "#f5b83d";
      } else {
        // 26 cubes: Upright Charging Battery Gauge on right (16 hollow frame + 2 top terminal + 8 rising green bars)!
        const j = idx - 94;
        const bx = 1.48;
        if (j < 16) {
          // 4 wide x 6 tall battery outline (16 perimeter cubes)
          let gx = 0, gy = 0;
          if (j < 4) { gx = j - 1.5; gy = 2.5; }
          else if (j < 8) { gx = j - 4 - 1.5; gy = -2.5; }
          else if (j < 12) { gx = -1.5; gy = 1.5 - (j - 8); }
          else { gx = 1.5; gy = 1.5 - (j - 12); }
          lx = bx + gx * 0.25;
          ly = -0.18 + gy * 0.26;
          lz = 0;
          sc = 0.21;
          col = "#2b5e54";
        } else if (j < 18) {
          // Top battery terminal nub
          lx = bx + (j === 16 ? -0.12 : 0.12);
          ly = 0.72;
          lz = 0;
          sc = 0.19;
          col = "#2b5e54";
        } else {
          // 4 rising emerald charge bars (2 cubes wide x 4 rows = 8)
          const k = j - 18;
          const row = Math.floor(k / 2); // 0..3
          const isLit = row / 3.2 <= chargePhase + 0.12;
          lx = bx + (k % 2 === 0 ? -0.13 : 0.13);
          ly = -0.58 + row * 0.26;
          lz = 0.12;
          sc = isLit ? 0.2 : 0.1;
          col = !isLit ? "#386b61" : row === 3 ? "#a8e05f" : "#38c48a";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.3, 0.34, -0.06, "#f5b83d"], [-0.18, 0.4, -0.06, "#e88c24"],
        [-0.3, -0.04, 0, "#164a66"], [-0.1, -0.04, 0, "#246f8c"],
        [-0.3, -0.22, 0.08, "#246f8c"], [-0.1, -0.22, 0.08, "#164a66"],
        [0.08, 0.08, 0.12, "#f5b83d"], [0.06, -0.08, 0.12, "#ffe382"],
        [0.3, 0.26, 0, "#2b5e54"], [0.3, 0.08, 0, "#38c48a"],
        [0.3, -0.08, 0, "#38c48a"], [0.3, -0.24, 0, "#2b5e54"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, -0.2 + Math.sin(t * 0.4) * 0.2, 0.2);
      return { dx, dy, dz, rx: 0.2, ry: -0.2 + Math.sin(t * 0.4) * 0.2, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7A. INCITE ANALYTICS — Solid Beveled 3D Crimson Heart + Unbroken High-Contrast ECG Bar!
     -------------------------------------------------------------------------- */
  "incite-solid-heart": {
    hero(idx, _count, t) {
      const rotY = Math.sin(t * 0.28) * 0.2;
      const rotX = 0.14;
      // Authentic double-pulse Lub-Dub heartbeat!
      const pCycle = (t * 0.9) % 1;
      const lub = Math.exp(-Math.pow((pCycle - 0.14) / 0.045, 2)) * 0.12;
      const dub = Math.exp(-Math.pow((pCycle - 0.29) / 0.04, 2)) * 0.075;
      const beat = 1 + lub + dub;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = "#c72c58";

      if (idx < SOLID_HEART_66.length) {
        // Plump, glossy SOLID 3D Beveled Crimson Heart!
        const v = SOLID_HEART_66[idx];
        lx = v.x * beat;
        ly = 0.56 + v.y * beat;
        lz = v.z * beat;
        sc = 0.225 * (1 + (lub + dub) * 0.4);
        const isGlint = v.layer === 2 && v.x < -0.15 && v.y > 0.1;
        col = isGlint ? "#ffadc4" : v.layer === 2 ? "#e34f7a" : v.layer === 1 ? "#d43764" : "#9e1f48";
      } else if (idx < 82) {
        // Dark-slate Medical Monitor Strip cleanly grounding the ECG wave (zero floating debris!)
        const k = idx - SOLID_HEART_66.length;
        const barLen = 82 - SOLID_HEART_66.length;
        lx = (k - (barLen - 1) / 2) * 0.22;
        ly = -1.04;
        lz = -0.24;
        sc = 0.21;
        col = "#362952";
      } else {
        // 38 cubes: UNBROKEN Continuous PQRST ECG Trace (high-contrast dark crimson -> luminous coral head!)
        const k = idx - 82;
        const pt = ECG_POLYLINE_38[k];
        const frac = k / 37;
        let dist = frac - pCycle;
        if (dist < -0.5) dist += 1;
        if (dist > 0.5) dist -= 1;
        const lit = Math.abs(dist) < 0.08;
        lx = pt[0];
        ly = -1.02 + pt[1];
        lz = lit ? 0.12 : 0.04;
        sc = lit ? 0.175 : 0.132;
        col = lit ? "#ff6b96" : "#9e1f48";
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const beat = 1 + Math.pow(Math.max(0, Math.sin(t * 3.0)), 6) * 0.12;
      const pts: Array<[number, number, number, string]> = [
        [-0.14, 0.28, 0, "#d43764"], [0.14, 0.28, 0, "#d43764"],
        [-0.22, 0.12, 0, "#c72c58"], [0, 0.12, 0.06, "#ffadc4"], [0.22, 0.12, 0, "#c72c58"],
        [0, -0.04, 0, "#9e1f48"],
        // Connected dark-crimson ECG spike below!
        [-0.36, -0.28, 0, "#362952"], [-0.18, -0.28, 0, "#9e1f48"],
        [-0.04, -0.1, 0.06, "#ff6b96"], [0.08, -0.36, 0.06, "#9e1f48"],
        [0.2, -0.28, 0, "#9e1f48"], [0.36, -0.28, 0, "#362952"],
      ];
      const p = pts[slot];
      const b = slot < 6 ? beat : 1;
      const [dx, dy, dz] = rotateYX(p[0] * boost * b, p[1] * boost * b, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7B. INCITE ANALYTICS — Framed Medical ECG Monitor Screen + Glowing Emerald Wave & Heart Badge!
     -------------------------------------------------------------------------- */
  "incite-monitor": {
    hero(idx, _count, t) {
      const rotY = -0.16 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.14;
      const sweep = (t * 0.85) % 1;
      const heartBeat = 1 + Math.exp(-Math.pow((sweep - 0.46) / 0.07, 2)) * 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.22, col = "#362952";

      if (idx < 48) {
        // Dark-Slate Medical Monitor Bezel (40) + Neck (2) + Stand Foot (6)
        if (idx < 40) {
          let gx = 0, gy = 0;
          if (idx < 13) { gx = idx - 6; gy = 4; }
          else if (idx < 26) { gx = idx - 13 - 6; gy = -4; }
          else if (idx < 33) { gx = -6; gy = 3 - (idx - 26); }
          else { gx = 6; gy = 3 - (idx - 33); }
          lx = gx * 0.28;
          ly = 0.18 + gy * 0.26;
          lz = -0.12;
          sc = 0.255;
          col = gy === 4 || gy === -4 ? "#48376b" : "#362952";
        } else if (idx < 42) {
          lx = 0;
          ly = -1.06 - (idx - 40) * 0.24;
          lz = -0.16;
          sc = 0.22;
          col = "#362952";
        } else {
          const k = idx - 42;
          lx = (k - 2.5) * 0.28;
          ly = -1.52;
          lz = -0.1;
          sc = 0.24;
          col = "#48376b";
        }
      } else if (idx < 64) {
        // Recessed subtle dark monitor screen backdrop (4x4 = 16) so the glowing emerald ECG wave shines cleanly!
        const k = idx - 48;
        lx = ((k % 4) - 1.5) * 0.72;
        ly = 0.18 + (Math.floor(k / 4) - 1.5) * 0.44;
        lz = -0.34;
        sc = 0.28;
        col = "#2b2147";
      } else if (idx < 102) {
        // 38 cubes: Unbroken Glowing Cardio-Emerald PQRST ECG Wave inside the monitor!
        const k = idx - 64;
        const pt = ECG_POLYLINE_38[k];
        const frac = k / 37;
        let dist = frac - sweep;
        if (dist < -0.5) dist += 1;
        if (dist > 0.5) dist -= 1;
        const lit = Math.abs(dist) < 0.09;
        lx = pt[0] * 0.84;
        ly = -0.06 + pt[1] * 0.85;
        lz = 0.12;
        sc = lit ? 0.175 : 0.13;
        col = lit ? "#c9ffed" : "#22bf90";
      } else {
        // 18 cubes: Pulsing 3D Crimson Heart Badge in upper-right corner (12) + 3 status LEDs + 3 BPM readout bars!
        const j = idx - 102;
        if (j < 12) {
          const miniHeart: Array<[number, number, number]> = [
            [-0.16, 0.16, 0], [0.16, 0.16, 0],
            [-0.28, 0.04, 0], [0, 0.04, 0], [0.28, 0.04, 0],
            [-0.16, -0.1, 0], [0.16, -0.1, 0], [0, -0.24, 0],
            [-0.12, 0.08, 0.16], [0.12, 0.08, 0.16], [0, -0.06, 0.16], [0, 0.04, -0.14],
          ];
          const mh = miniHeart[j];
          lx = 1.02 + mh[0] * heartBeat;
          ly = 0.68 + mh[1] * heartBeat;
          lz = 0.18 + mh[2];
          sc = 0.165;
          col = j === 8 ? "#ff9eba" : "#d43360";
        } else if (j < 15) {
          // 3 telemetry status LEDs on lower right frame
          const d = j - 12;
          lx = 0.92 + d * 0.22;
          ly = -0.66;
          lz = 0.14;
          sc = 0.125;
          col = d === 0 ? "#22bf90" : d === 1 ? "#f4be44" : "#e64878";
        } else {
          // 3 BPM readout bars top-left
          const d = j - 15;
          lx = -1.2 + d * 0.24;
          ly = 0.78;
          lz = 0.14;
          sc = 0.13;
          col = "#22bf90";
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.34, 0.22, -0.04, "#362952"], [0, 0.22, -0.04, "#362952"], [0.34, 0.22, -0.04, "#362952"],
        [-0.34, -0.2, -0.04, "#362952"], [0, -0.2, -0.04, "#362952"], [0.34, -0.2, -0.04, "#362952"],
        [-0.22, -0.04, 0.12, "#22bf90"], [-0.04, 0.12, 0.14, "#c9ffed"], [0.1, -0.1, 0.12, "#22bf90"],
        [0.24, 0.16, 0.16, "#d43360"], [0.24, 0.04, 0.16, "#d43360"], [0, -0.34, -0.04, "#48376b"],
      ];
      const p = pts[slot];
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, Math.sin(t * 0.4) * 0.22, 0.14);
      return { dx, dy, dz, rx: 0.14, ry: Math.sin(t * 0.4) * 0.22, rz: 0, scale: sc, color: p[3] };
    },
  },
};
