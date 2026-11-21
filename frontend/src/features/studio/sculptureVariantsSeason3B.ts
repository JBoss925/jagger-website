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
const SKY = "#3b92eb";
const CYAN = "#14a8c4";
const MAGENTA = "#e03c8a";
const ROSE = "#c9437d";
const CORNELL_RED = "#c92a2a";
const GOLD = "#f5b83d";
const EMERALD = "#22bf90";
const WHITE = "#ffffff";

// ============================================================================
// PRECOMPUTED NON-OVERLAPPING VOXEL TABLES (SEASON 3B — 13 SCULPTURES)
// ============================================================================

/** 36-voxel sculpted 3D sky-blue/cobalt cloud with crisp framed white core */
const CLOUD_36: Array<{ x: number; y: number; z: number; col: string }> = [
  // z = 0 main silhouette (20 voxels)
  { x: -2, y: -1, z: 0, col: COBALT },
  { x: -1, y: -1, z: 0, col: COBALT },
  { x: 0, y: -1, z: 0, col: COBALT },
  { x: 1, y: -1, z: 0, col: COBALT },
  { x: 2, y: -1, z: 0, col: COBALT },
  { x: -3, y: 0, z: 0, col: COBALT },
  { x: -2, y: 0, z: 0, col: SKY },
  { x: -1, y: 0, z: 0, col: WHITE },
  { x: 0, y: 0, z: 0, col: WHITE },
  { x: 1, y: 0, z: 0, col: WHITE },
  { x: 2, y: 0, z: 0, col: SKY },
  { x: 3, y: 0, z: 0, col: COBALT },
  { x: -2, y: 1, z: 0, col: COBALT },
  { x: -1, y: 1, z: 0, col: SKY },
  { x: 0, y: 1, z: 0, col: WHITE },
  { x: 1, y: 1, z: 0, col: SKY },
  { x: 2, y: 1, z: 0, col: COBALT },
  { x: -1, y: 2, z: 0, col: COBALT },
  { x: 0, y: 2, z: 0, col: SKY },
  { x: 1, y: 2, z: 0, col: COBALT },
  // z = 1 front puff (9 voxels)
  { x: -1, y: -1, z: 1, col: SKY },
  { x: 0, y: -1, z: 1, col: SKY },
  { x: 1, y: -1, z: 1, col: SKY },
  { x: -2, y: 0, z: 1, col: SKY },
  { x: -1, y: 0, z: 1, col: WHITE },
  { x: 0, y: 0, z: 1, col: WHITE },
  { x: 1, y: 0, z: 1, col: WHITE },
  { x: 2, y: 0, z: 1, col: SKY },
  { x: 0, y: 1, z: 1, col: SKY },
  // z = -1 back puff (7 voxels)
  { x: -1, y: -1, z: -1, col: NAVY },
  { x: 0, y: -1, z: -1, col: NAVY },
  { x: 1, y: -1, z: -1, col: NAVY },
  { x: -1, y: 0, z: -1, col: COBALT },
  { x: 0, y: 0, z: -1, col: COBALT },
  { x: 1, y: 0, z: -1, col: COBALT },
  { x: 0, y: 1, z: -1, col: COBALT },
];

/** 56-voxel hollow shell of a 4x4x4 dark-indigo network switch cube */
const ROUTER_SHELL_56: Array<{ x: number; y: number; z: number }> = (() => {
  const pts: Array<{ x: number; y: number; z: number }> = [];
  const coords = [-1.5, -0.5, 0.5, 1.5];
  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        if (Math.abs(x) === 1.5 || Math.abs(y) === 1.5 || Math.abs(z) === 1.5) {
          pts.push({ x, y, z });
        }
      }
    }
  }
  return pts; // 56 exact
})();

/** 50-voxel dark bezel frame + 2 vertical dividers for 3-column shift roster board */
const KANBAN_FRAME_50: Array<{ x: number; y: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; col: string }> = [];
  for (let x = -6; x <= 6; x++) {
    pts.push({ x, y: 2, col: INDIGO });
    pts.push({ x, y: -5, col: INDIGO });
  }
  for (let y = -4; y <= 1; y++) {
    pts.push({ x: -6, y, col: NAVY });
    pts.push({ x: 6, y, col: NAVY });
    pts.push({ x: -2, y, col: INDIGO });
    pts.push({ x: 2, y, col: INDIGO });
  }
  return pts; // 26 + 24 = 50 exact
})();

/** 39-voxel crimson velvet proscenium curtain arch */
const PROSCENIUM_39: Array<{ x: number; y: number; z: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; col: string }> = [];
  // Left & right curtain pillars (8 each = 16)
  for (let i = 0; i < 8; i++) {
    const y = -3.2 + i * 1.0;
    const c = i % 2 === 0 ? CORNELL_RED : ROSE;
    pts.push({ x: -5.0, y, z: 0.6, col: c });
    pts.push({ x: 5.0, y, z: 0.6, col: c });
  }
  // Inner gathered curtain drapes (3 each = 6) + gold tie-backs (2)
  for (let i = 0; i < 3; i++) {
    const y = 1.2 + i * 1.0;
    pts.push({ x: -4.0, y, z: 0.6, col: CORNELL_RED });
    pts.push({ x: 4.0, y, z: 0.6, col: CORNELL_RED });
  }
  pts.push({ x: -4.1, y: 0.1, z: 0.85, col: GOLD });
  pts.push({ x: 4.1, y: 0.1, z: 0.85, col: GOLD });
  // Overhead scalloped valance (11)
  for (let x = -5; x <= 5; x++) {
    pts.push({ x, y: 4.8, z: 0.6, col: Math.abs(x) % 2 === 0 ? CORNELL_RED : ROSE });
  }
  // Golden proscenium crest accents (4)
  for (const x of [-3, -1, 1, 3]) {
    pts.push({ x, y: 5.75, z: 0.6, col: GOLD });
  }
  return pts; // 16 + 6 + 2 + 11 + 4 = 39 exact
})();

/** 49-voxel peaked 4-tier striped Cornell-red & white canopy tent roof */
const CANOPY_ROOF_49: Array<{ x: number; y: number; z: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; col: string }> = [];
  const stripeColor = (x: number, z: number): string => {
    if (x === 0 && z === 0) return CORNELL_RED;
    const angle = Math.atan2(z, x) + Math.PI;
    const sector = Math.floor((angle / (Math.PI * 2)) * 8 + 0.5) % 2;
    return sector === 1 ? CORNELL_RED : WHITE;
  };
  const addRing = (r: number, y: number) => {
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        if (Math.abs(x) === r || Math.abs(z) === r) {
          pts.push({ x, y, z, col: stripeColor(x, z) });
        }
      }
    }
  };
  addRing(3, 0.7); // 24
  addRing(2, 1.68); // 16
  addRing(1, 2.66); // 8
  pts.push({ x: 0, y: 3.64, z: 0, col: CORNELL_RED }); // 1
  return pts; // 49 exact
})();

/** 65-voxel sculpted 3D megaphone cone (Cornell red & crisp white rings) */
const MEGAPHONE_CONE_65: Array<{ x: number; y: number; z: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; col: string }> = [];
  pts.push({ x: -4.4, y: 0, z: 0, col: INDIGO }); // 1 mouthpiece cap
  const rings: Array<{ x: number; r: number; n: number; col: string }> = [
    { x: -3.35, r: 0.96, n: 6, col: CORNELL_RED },
    { x: -2.3, r: 1.32, n: 8, col: WHITE },
    { x: -1.25, r: 1.72, n: 10, col: CORNELL_RED },
    { x: -0.2, r: 2.15, n: 12, col: WHITE },
    { x: 0.85, r: 2.6, n: 14, col: CORNELL_RED },
    { x: 1.85, r: 2.86, n: 14, col: INDIGO },
  ];
  for (let ri = 0; ri < rings.length; ri++) {
    const ring = rings[ri];
    for (let k = 0; k < ring.n; k++) {
      const a = (k / ring.n) * Math.PI * 2;
      const col =
        ri === rings.length - 1 && (k === 0 || k === 7) ? GOLD : ring.col;
      pts.push({
        x: ring.x,
        y: Math.cos(a) * ring.r,
        z: Math.sin(a) * ring.r,
        col,
      });
    }
  }
  return pts; // 1 + 6 + 8 + 10 + 12 + 14 + 14 = 65 exact
})();

/** 6 vertices & 12 edges of a regular octahedron */
const OCT_VERTS_6: Array<[number, number, number]> = [
  [4.5, 0, 0],
  [-4.5, 0, 0],
  [0, 4.5, 0],
  [0, -4.5, 0],
  [0, 0, 4.5],
  [0, 0, -4.5],
];

const OCT_EDGES_12: Array<[number, number]> = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [4, 3], [3, 5], [5, 2],
];

/** 52-voxel observability console rack housing */
const CONSOLE_HOUSING_52: Array<{ x: number; y: number; z: number; col: string }> = (() => {
  const pts: Array<{ x: number; y: number; z: number; col: string }> = [];
  for (let x = -6; x <= 6; x++) {
    pts.push({ x, y: 4, z: 0.5, col: INDIGO });
    pts.push({ x, y: -4, z: 0.5, col: INDIGO });
  }
  for (let y = -3; y <= 3; y++) {
    pts.push({ x: -6, y, z: 0.5, col: NAVY });
    pts.push({ x: 6, y, z: 0.5, col: NAVY });
  }
  for (let y = -3; y <= 2; y++) {
    pts.push({ x: 0, y, z: 0.5, col: NAVY });
  }
  for (const x of [-6, 6]) {
    for (const y of [-4, 0, 4]) {
      pts.push({ x, y, z: -0.65, col: INDIGO });
    }
  }
  return pts; // 26 + 14 + 6 + 6 = 52 exact
})();

// ============================================================================
// SEASON 3 PART B — 13 MUSEUM-GRADE SCULPTURES
// ============================================================================
export const VARIANTS_SEASON3_B: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     1. RV — Twin 3D Clouds Linked by CI/CD Pipeline Bridge with Golden Pulses
     -------------------------------------------------------------------------- */
  "rv-s3-cloud-bridge": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = -0.18 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.2;
      let lx = 0, ly = 0, lz = 0, sc = 0.182, col = COBALT;

      if (idx < 36) {
        // Left sculpted 3D cloud
        const c = CLOUD_36[idx % CLOUD_36.length];
        const bob = Math.sin(t * 1.15) * 0.18;
        lx = (c.x - 6.0) * P;
        ly = (c.y + 0.65 + bob) * P;
        lz = c.z * P;
        col = c.col;
      } else if (idx < 72) {
        // Right sculpted 3D cloud (mirrored)
        const c = CLOUD_36[(idx - 36) % CLOUD_36.length];
        const bob = Math.sin(t * 1.15 + 1.5) * 0.18;
        lx = (-c.x + 6.0) * P;
        ly = (c.y + 0.65 + bob) * P;
        lz = c.z * P;
        col = c.col;
      } else {
        // 48-cube CI/CD Pipeline Bridge connecting the twin clouds
        const k = idx - 72;
        if (k < 14) {
          // Dark-navy steel lower deck rails (7 cols x 2 z-sides)
          const gx = (k % 7) - 3;
          const gz = k < 7 ? -0.6 : 0.6;
          lx = gx * P;
          ly = -1.15 * P;
          lz = gz * P;
          col = Math.abs(gx) === 3 ? INDIGO : NAVY;
        } else if (k < 28) {
          // Glowing emerald CI/CD pipeline conduit with traveling golden deployment wave
          const j = k - 14;
          const gx = (j % 7) - 3;
          const gz = j < 7 ? -0.6 : 0.6;
          const wave = 0.5 + 0.5 * Math.sin(t * 3.8 - gx * 1.05);
          lx = gx * P;
          ly = -0.1 * P;
          lz = gz * P;
          sc = wave > 0.78 ? 0.188 : 0.172;
          col = wave > 0.78 ? GOLD : EMERALD;
        } else if (k < 36) {
          // Twin navy/indigo gateway bridge pylons at x = ±2.5
          const j = k - 28;
          const side = j < 4 ? -2.5 : 2.5;
          const local = j % 4;
          const gy = local < 2 ? 0.95 : 1.95;
          const gz = local % 2 === 0 ? -0.6 : 0.6;
          lx = side * P;
          ly = gy * P;
          lz = gz * P;
          col = local < 2 ? NAVY : INDIGO;
        } else if (k < 43) {
          // Overhead suspension data-arch cable
          const j = k - 36;
          const gx = j - 3;
          const archY = 2.0 + Math.cos((gx / 3) * (Math.PI * 0.5)) * 0.95;
          const pulse = 0.5 + 0.5 * Math.sin(t * 3.8 - gx * 1.05 + 0.6);
          lx = gx * P;
          ly = archY * P;
          lz = 0;
          sc = pulse > 0.8 ? 0.182 : 0.16;
          col = pulse > 0.8 ? GOLD : COBALT;
        } else {
          // 5 central CI/CD deployment stage beacons along pipeline spine
          const j = k - 43;
          const gx = (j - 2) * 1.15;
          const pulse = 0.5 + 0.5 * Math.sin(t * 3.8 - gx * 1.05);
          lx = gx * P;
          ly = (0.95 + pulse * 0.15) * P;
          lz = 0;
          sc = 0.155 + pulse * 0.03;
          col = pulse > 0.72 ? GOLD : EMERALD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pulse = Math.sin(t * 3.2 - slot * 0.9) > 0.4;
      const pts: Array<[number, number, number, string]> = [
        [-0.44, 0.08, 0, COBALT], [-0.34, 0.2, 0, SKY], [-0.26, 0.08, 0.08, WHITE],
        [0.44, 0.08, 0, COBALT], [0.34, 0.2, 0, SKY], [0.26, 0.08, 0.08, WHITE],
        [-0.14, -0.06, 0, NAVY], [0.14, -0.06, 0, NAVY],
        [-0.08, 0.04, 0, pulse ? GOLD : EMERALD], [0.08, 0.04, 0, !pulse ? GOLD : EMERALD],
        [0, 0.16, 0, GOLD], [0, -0.06, 0, INDIGO],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.45) * 0.28;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.2);
      return { dx, dy, dz, rx: 0.2, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     2. RV — Sculpted Air-Traffic Control Tower + Radar Dish + Telemetry Arcs
     -------------------------------------------------------------------------- */
  "rv-s3-control-tower": {
    hero(idx, _count, t) {
      const P = 0.22;
      const rotY = -0.22 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.22;
      let lx = 0, ly = 0, lz = 0, sc = 0.188, col = NAVY;

      if (idx < 16) {
        // 4x4 dark foundation plinth
        const gx = (idx % 4) - 1.5;
        const gz = Math.floor(idx / 4) - 1.5;
        const isEdge = Math.abs(gx) === 1.5 || Math.abs(gz) === 1.5;
        lx = gx * P;
        ly = -4.9 * P;
        lz = gz * P;
        col = isEdge ? INDIGO : NAVY;
      } else if (idx < 48) {
        // Tapered navy/white column (4 rings x 8 cubes)
        const k = idx - 16;
        const ring = Math.floor(k / 8); // 0..3
        const seg = k % 8;
        const a = (seg / 8) * Math.PI * 2;
        const r = 1.48 - ring * 0.12;
        lx = Math.cos(a) * r * P;
        ly = (-3.85 + ring * 1.02) * P;
        lz = Math.sin(a) * r * P;
        sc = 0.18;
        if (ring === 1 || ring === 2) {
          col = seg % 2 === 0 ? WHITE : NAVY;
        } else {
          col = ring === 0 ? NAVY : INDIGO;
        }
      } else if (idx < 84) {
        // Panoramic cyan glass control cab (12 floor + 12 glass + 12 roof)
        const k = idx - 48;
        const layer = Math.floor(k / 12); // 0 floor, 1 glass, 2 roof
        const seg = k % 12;
        const a = (seg / 12) * Math.PI * 2;
        const r = layer === 0 ? 2.15 : layer === 1 ? 2.4 : 2.3;
        lx = Math.cos(a) * r * P;
        ly = (0.25 + layer * 1.02) * P;
        lz = Math.sin(a) * r * P;
        sc = 0.185;
        if (layer === 0) {
          col = seg % 3 === 0 ? INDIGO : NAVY;
        } else if (layer === 1) {
          const sweep = Math.cos(a - t * 2.2);
          col = sweep > 0.72 ? GOLD : sweep > 0.2 ? EMERALD : CYAN;
        } else {
          const isBeacon = seg % 3 === 0;
          const blink = Math.sin(t * 3.5 + seg) > 0.35;
          col = isBeacon ? (blink ? MAGENTA : ROSE) : INDIGO;
        }
      } else if (idx < 102) {
        // Spinning golden radar dish mounted on roof (2 mast + 16 parabolic dish)
        const k = idx - 84;
        if (k < 2) {
          lx = 0;
          ly = (3.35 + k * 0.92) * P;
          lz = 0;
          sc = 0.175;
          col = NAVY;
        } else {
          const d = k - 2;
          const spin = t * 1.85;
          let dx = 0, dy = 0, dz = 0;
          if (d < 12) {
            // 4 wide x 3 tall concave parabolic dish
            const c = (d % 4) - 1.5;
            const r = Math.floor(d / 4) - 1;
            const curve = c * c * 0.2 + r * r * 0.25;
            dx = c * 0.92;
            dy = r * 0.92;
            dz = -0.65 + curve;
            const isInner = Math.abs(c) < 1 && r === 0;
            col = isInner ? WHITE : GOLD;
            sc = 0.17;
          } else if (d < 15) {
            // 3 tripod struts converging forward
            const s = d - 12;
            const sa = (s / 3) * Math.PI * 2;
            dx = Math.cos(sa) * 0.55;
            dy = Math.sin(sa) * 0.55;
            dz = 0.35;
            col = INDIGO;
            sc = 0.135;
          } else {
            // Central radar feedhorn emitter
            dx = 0;
            dy = 0;
            dz = 1.05;
            col = MAGENTA;
            sc = 0.16;
          }
          const cs = Math.cos(spin);
          const sn = Math.sin(spin);
          lx = (dx * cs - dz * sn) * P;
          ly = (4.55 + dy) * P;
          lz = (dx * sn + dz * cs) * P;
        }
      } else {
        // 3 glowing orbital telemetry arcs (3 arcs x 6 cubes = 18)
        const k = idx - 102;
        const arc = Math.floor(k / 6); // 0, 1, 2
        const step = k % 6;
        const speed = arc === 0 ? 1.25 : arc === 1 ? -1.05 : 1.45;
        const baseA = t * speed + arc * 2.1 - step * 0.27;
        const r = 4.05 + (arc - 1) * 0.25;
        const ox = Math.cos(baseA) * r;
        const oz = Math.sin(baseA) * r;
        const tilt = arc === 0 ? 0.42 : arc === 1 ? -0.45 : 0.2;
        const oy = Math.sin(baseA + arc * 1.2) * r * Math.sin(tilt);
        lx = ox * P;
        ly = (1.35 + oy) * P;
        lz = oz * Math.cos(tilt) * P;
        sc = 0.175 - step * 0.013;
        col = arc === 0 ? EMERALD : arc === 1 ? COBALT : GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const spin = t * 1.8;
      const pts: Array<[number, number, number, string]> = [
        [0, -0.38, 0, INDIGO], [0, -0.22, 0, NAVY], [0, -0.06, 0, WHITE], [0, 0.08, 0, NAVY],
        [-0.2, 0.2, 0.12, CYAN], [0.2, 0.2, 0.12, CYAN],
        [-0.2, 0.2, -0.12, COBALT], [0.2, 0.2, -0.12, COBALT],
        [Math.cos(spin) * 0.12, 0.38, Math.sin(spin) * 0.12, GOLD],
        [-Math.cos(spin) * 0.12, 0.38, -Math.sin(spin) * 0.12, MAGENTA],
        [Math.cos(t * 1.4) * 0.42, 0.22, Math.sin(t * 1.4) * 0.42, EMERALD],
        [Math.cos(t * 1.4 + Math.PI) * 0.42, 0.14, Math.sin(t * 1.4 + Math.PI) * 0.42, GOLD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.22);
      return { dx, dy, dz, rx: 0.22, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     3. GL4 — Hydroelectric Dataflow Paddle Turbine + 3 Streams + Navy Basin
     -------------------------------------------------------------------------- */
  "gl4-s3-water-turbine": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = -0.25 + Math.sin(t * 0.25) * 0.15;
      const rotX = 0.2;
      let lx = 0, ly = 0, lz = 0, sc = 0.18, col = COBALT;
      let rzLocal = 0;

      if (idx < 48) {
        // Rotating hydroelectric paddle turbine wheel centered at (0.3, 0.2, 0)
        const spin = -t * 1.45;
        const cx = 0.3;
        const cy = 0.2;
        if (idx < 6) {
          // Central axle shaft & gold endcaps
          const zSlots = [-2.45, -1.45, -0.48, 0.48, 1.45, 2.45];
          const zs = zSlots[idx % zSlots.length];
          lx = cx * P;
          ly = cy * P;
          lz = zs * P;
          sc = Math.abs(zs) > 2 ? 0.16 : 0.182;
          col = Math.abs(zs) > 1.8 ? GOLD : INDIGO;
          rzLocal = spin;
        } else {
          // 6 radial blades x 7 cubes = 42 cubes
          const j = idx - 6;
          const blade = Math.floor(j / 7);
          const part = j % 7;
          const a = (blade / 6) * Math.PI * 2 + spin;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          if (part === 0) {
            lx = (cx + ca * 1.1) * P;
            ly = (cy + sa * 1.1) * P;
            lz = 0;
            col = NAVY;
          } else if (part === 1) {
            lx = (cx + ca * 2.05) * P;
            ly = (cy + sa * 2.05) * P;
            lz = 0;
            col = NAVY;
          } else if (part === 2 || part === 3) {
            lx = (cx + ca * 2.95) * P;
            ly = (cy + sa * 2.95) * P;
            lz = (part === 2 ? -0.58 : 0.58) * P;
            col = blade % 2 === 0 ? COBALT : EMERALD;
          } else if (part === 4 || part === 5) {
            lx = (cx + ca * 3.8) * P;
            ly = (cy + sa * 3.8) * P;
            lz = (part === 4 ? -0.58 : 0.58) * P;
            col = GOLD;
          } else {
            // Structural outer ring brace halfway between blades
            const midA = a + Math.PI / 6;
            lx = (cx + Math.cos(midA) * 2.45) * P;
            ly = (cy + Math.sin(midA) * 2.45) * P;
            lz = 0;
            sc = 0.165;
            col = INDIGO;
          }
          rzLocal = a;
        }
      } else if (idx < 84) {
        // 3 vibrant incoming data streams pouring from top-left (3 x 12 = 36)
        const k = idx - 48;
        const stream = Math.floor(k / 12); // 0 cobalt, 1 emerald, 2 gold
        const step = k % 12; // 0 top-left intake -> 11 wheel impact
        const u = step / 11;
        const sx = -6.8 + u * 4.4;
        const sy = 4.95 - u * u * 3.35 + Math.sin(t * 4.8 - step * 0.75 + stream) * 0.08;
        const sz = (stream - 1) * 1.15;
        const wave = 0.5 + 0.5 * Math.sin(t * 5.2 - step * 0.85 - stream * 1.15);
        lx = sx * P;
        ly = sy * P;
        lz = sz * P;
        sc = 0.145 + wave * 0.038;
        const baseCol = stream === 0 ? COBALT : stream === 1 ? EMERALD : GOLD;
        col = wave > 0.84 ? (stream === 2 ? EMERALD : GOLD) : baseCol;
      } else {
        // 36-cube sleek navy storage basin below
        const k = idx - 84;
        if (k < 18) {
          // Floor slab: 9 cols x 2 rows
          const c = (k % 9) - 4;
          const r = k < 9 ? -0.75 : 0.75;
          lx = c * 1.05 * P;
          ly = -4.95 * P;
          lz = r * P;
          col = Math.abs(c) === 4 ? INDIGO : NAVY;
        } else if (k < 30) {
          // Raised front & back sleek trough walls (6 cols x 2 walls)
          const j = k - 18;
          const c = (j % 6) - 2.5;
          const wallZ = j < 6 ? -1.85 : 1.85;
          lx = c * 1.65 * P;
          ly = -3.95 * P;
          lz = wallZ * P;
          col = Math.abs(c) > 2 ? COBALT : NAVY;
        } else {
          // 6 glowing rippling data-water surface blocks inside the basin
          const j = k - 30;
          const gx = (j - 2.5) * 1.35;
          const ripple = Math.sin(t * 3.4 - j * 0.95);
          lx = gx * P;
          ly = (-3.9 + ripple * 0.18) * P;
          lz = 0;
          sc = 0.175;
          col = j % 3 === 0 ? COBALT : j % 3 === 1 ? EMERALD : GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, rzLocal, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const spin = -t * 1.6;
      const pts: Array<[number, number, number, string]> = [
        [0.05, 0.04, 0, INDIGO],
        [0.05 + Math.cos(spin) * 0.24, 0.04 + Math.sin(spin) * 0.24, 0, GOLD],
        [0.05 + Math.cos(spin + 1.25) * 0.24, 0.04 + Math.sin(spin + 1.25) * 0.24, 0, COBALT],
        [0.05 + Math.cos(spin + 2.51) * 0.24, 0.04 + Math.sin(spin + 2.51) * 0.24, 0, EMERALD],
        [0.05 + Math.cos(spin + 3.77) * 0.24, 0.04 + Math.sin(spin + 3.77) * 0.24, 0, GOLD],
        [0.05 + Math.cos(spin + 5.02) * 0.24, 0.04 + Math.sin(spin + 5.02) * 0.24, 0, COBALT],
        [-0.36, 0.36, -0.06, COBALT], [-0.26, 0.3, 0, EMERALD], [-0.18, 0.24, 0.06, GOLD],
        [-0.24, -0.34, 0, NAVY], [0.04, -0.34, 0, COBALT], [0.32, -0.34, 0, NAVY],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.2);
      return { dx, dy, dz, rx: 0.2, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     4. GL4 — Isometric 3-Track Data Rail Switchyard & Golden Switch Gantry
     -------------------------------------------------------------------------- */
  "gl4-s3-train-tracks": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = -0.4 + Math.sin(t * 0.26) * 0.14;
      const rotX = 0.42;
      let lx = 0, ly = 0, lz = 0, sc = 0.18, col = NAVY;

      if (idx < 54) {
        // 3 colored merging data tracks (3 lanes x 18 cubes: 9 bed + 9 active rail/train)
        const lane = Math.floor(idx / 18); // 0 cobalt, 1 magenta, 2 emerald
        const local = idx % 18;
        const isTop = local >= 9;
        const u = local % 9; // 0..8
        const gx = -6.7 + u * 0.94;
        const zStart = (lane - 1) * 3.15;
        const zEnd = (lane - 1) * 1.15;
        const s = Math.max(0, Math.min(1, (gx + 3.2) / 4.2));
        const smooth = s * s * (3 - 2 * s);
        const gz = zStart + (zEnd - zStart) * smooth;
        const laneCol = lane === 0 ? COBALT : lane === 1 ? MAGENTA : EMERALD;

        if (!isTop) {
          lx = gx * P;
          ly = -0.65 * P;
          lz = gz * P;
          sc = 0.175;
          col = u % 2 === 0 ? INDIGO : NAVY;
        } else {
          const wave = 0.5 + 0.5 * Math.sin(t * 4.2 - u * 0.85 - lane * 2.1);
          lx = gx * P;
          ly = (0.38 + (wave > 0.72 ? 0.14 : 0)) * P;
          lz = gz * P;
          sc = 0.16 + wave * 0.028;
          col = wave > 0.82 ? GOLD : laneCol;
        }
      } else if (idx < 82) {
        // 28-cube glowing golden switch gantry arch at x = +1.35
        const k = idx - 54;
        if (k < 8) {
          // Left & right steel gantry pillars
          const side = k < 4 ? -3.1 : 3.1;
          const h = k % 4;
          lx = 1.35 * P;
          ly = (-0.65 + h * 1.0) * P;
          lz = side * P;
          col = h % 2 === 0 ? INDIGO : NAVY;
        } else if (k < 20) {
          // Overhead golden truss crossbeam (6 z-cols x 2 x-rails)
          const j = k - 8;
          const gz = ((j % 6) - 2.5) * 1.02;
          const ox = j < 6 ? 0.85 : 1.85;
          lx = ox * P;
          ly = 3.15 * P;
          lz = gz * P;
          col = GOLD;
        } else if (k < 26) {
          // 3 lane signal lights + 3 signal top housings
          const j = k - 20;
          const lane = j % 3;
          const gz = (lane - 1) * 1.55;
          if (j < 3) {
            const active = Math.sin(t * 3.0 - lane * 2.1) > 0.3;
            lx = 1.35 * P;
            ly = 2.05 * P;
            lz = gz * P;
            sc = active ? 0.185 : 0.155;
            col = active ? GOLD : lane === 0 ? COBALT : lane === 1 ? MAGENTA : EMERALD;
          } else {
            lx = 1.35 * P;
            ly = 4.15 * P;
            lz = gz * P;
            sc = 0.165;
            col = INDIGO;
          }
        } else {
          // 2 top gantry roof beacons
          const j = k - 26;
          lx = 1.35 * P;
          ly = 4.95 * P;
          lz = (j === 0 ? -0.75 : 0.75) * P;
          sc = 0.16;
          col = Math.sin(t * 4.5 + j * Math.PI) > 0 ? GOLD : EMERALD;
        }
      } else {
        // 38-cube single high-speed output express track (x = 2.2..7.3, z = 0)
        const k = idx - 82;
        if (k < 12) {
          // Twin dark-navy rail bed rails at z = ±1.05
          const c = k % 6;
          const gz = k < 6 ? -1.05 : 1.05;
          lx = (2.3 + c * 1.0) * P;
          ly = -0.65 * P;
          lz = gz * P;
          col = c % 2 === 0 ? INDIGO : NAVY;
        } else if (k < 18) {
          // Glowing golden center guideway rail
          const c = k - 12;
          lx = (2.3 + c * 1.0) * P;
          ly = -0.65 * P;
          lz = 0;
          sc = 0.165;
          col = GOLD;
        } else if (k < 30) {
          // 6-car high-speed merged express stream (lower + upper dorsal strip)
          const j = k - 18;
          const c = j % 6;
          const upper = j >= 6;
          const wave = 0.5 + 0.5 * Math.sin(t * 5.6 - c * 0.9);
          lx = (2.3 + c * 1.0) * P;
          ly = (upper ? 1.35 : 0.38) * P;
          lz = 0;
          sc = upper ? 0.145 + wave * 0.03 : 0.18;
          const streamCols = [COBALT, MAGENTA, EMERALD, GOLD];
          col = upper
            ? wave > 0.65
              ? GOLD
              : streamCols[c % streamCols.length]
            : wave > 0.78
              ? GOLD
              : NAVY;
        } else {
          // 8 runway guide bollards flanking the express track
          const j = k - 30;
          const c = j % 4;
          const gz = j < 4 ? -2.15 : 2.15;
          const pulse = Math.sin(t * 5.6 - c * 1.1) > 0.35;
          lx = (2.8 + c * 1.45) * P;
          ly = 0.1 * P;
          lz = gz * P;
          sc = pulse ? 0.175 : 0.145;
          col = pulse ? GOLD : EMERALD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.42, -0.06, -0.24, COBALT], [-0.22, -0.04, -0.14, COBALT],
        [-0.42, -0.06, 0, MAGENTA], [-0.22, -0.04, 0, MAGENTA],
        [-0.42, -0.06, 0.24, EMERALD], [-0.22, -0.04, 0.14, EMERALD],
        [0.02, 0.2, -0.22, INDIGO], [0.02, 0.26, 0, GOLD], [0.02, 0.2, 0.22, INDIGO],
        [0.2, -0.04, 0, NAVY], [0.34, 0.02, 0, GOLD], [0.48, 0.02, 0, EMERALD],
      ];
      const p = pts[slot];
      const ry = -0.35 + Math.sin(t * 0.4) * 0.22;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.38);
      return { dx, dy, dz, rx: 0.38, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     5. GL4 — Dark-Indigo 3D Switch Cube + Colored Input & Golden Output Fibers
     -------------------------------------------------------------------------- */
  "gl4-s3-prism-router": {
    hero(idx, _count, t) {
      const P = 0.195;
      const rotY = -0.24 + Math.sin(t * 0.3) * 0.18;
      const rotX = 0.24;
      let lx = 0, ly = 0, lz = 0, sc = 0.168, col = INDIGO;

      if (idx < 56) {
        // 4x4x4 dark-indigo network switch shell
        const v = ROUTER_SHELL_56[idx % ROUTER_SHELL_56.length];
        lx = v.x * P;
        ly = v.y * P;
        lz = v.z * P;
        const isStatusStrip = v.y === 0.5 && (v.z === 1.5 || Math.abs(v.x) === 1.5);
        const isCorner = Math.abs(v.x) === 1.5 && Math.abs(v.z) === 1.5;
        const isTopRim = v.y === 1.5 && (Math.abs(v.x) === 1.5 || Math.abs(v.z) === 1.5);
        if (isStatusStrip) {
          const pulse = Math.sin(t * 3.8 - v.x * 1.15);
          col = pulse > 0.72 ? GOLD : EMERALD;
          sc = pulse > 0.72 ? 0.174 : 0.168;
        } else if (isTopRim) {
          col = COBALT;
        } else if (isCorner) {
          col = NAVY;
        } else {
          col = INDIGO;
        }
      } else if (idx < 60) {
        // 4 top router heatsink / telemetry fins
        const k = idx - 56;
        lx = (k - 1.5) * P;
        ly = 2.48 * P;
        lz = 0;
        sc = 0.162;
        col = Math.sin(t * 3.5 - k * 0.9) > 0.45 ? EMERALD : NAVY;
      } else if (idx < 66) {
        // 3 left input port collars + 3 right output port collars
        const k = idx - 60;
        const isRight = k >= 3;
        const lane = k % 3;
        lx = (isRight ? 2.48 : -2.48) * P;
        ly = (lane - 1) * 1.12 * P;
        lz = 0;
        sc = 0.165;
        col = isRight ? GOLD : NAVY;
      } else if (idx < 93) {
        // 3 bold colored input fiber cables on left (3 x 9 = 27)
        const k = idx - 66;
        const lane = Math.floor(k / 9); // 0 cobalt, 1 magenta, 2 emerald
        const step = k % 9; // 0 near port -> 8 far left
        const u = step / 8;
        const smooth = u * u * (3 - 2 * u);
        const gx = -3.45 - step * 0.92;
        const gy = (lane - 1) * (1.12 + smooth * 1.85) + Math.sin(t * 2.4 + step * 0.55 + lane) * 0.1;
        const gz = (lane - 1) * smooth * 1.05;
        // Wave travels rightward (from step 8 toward step 0)
        const wave = 0.5 + 0.5 * Math.sin(t * 4.5 + step * 0.85 - lane * 1.4);
        lx = gx * P;
        ly = gy * P;
        lz = gz * P;
        sc = 0.14 + wave * 0.032;
        const baseCol = lane === 0 ? COBALT : lane === 1 ? MAGENTA : EMERALD;
        col = wave > 0.82 ? GOLD : baseCol;
      } else {
        // 3 synchronized golden output fiber cables on right (3 x 9 = 27)
        const k = idx - 93;
        const lane = Math.floor(k / 9);
        const step = k % 9; // 0 near port -> 8 far right
        const u = step / 8;
        const smooth = u * u * (3 - 2 * u);
        const gx = 3.45 + step * 0.92;
        const gy = (lane - 1) * (1.12 + smooth * 1.85) + Math.sin(t * 2.4 - step * 0.55) * 0.08;
        const gz = (lane - 1) * smooth * 1.05;
        // Identical synchronized phase across all 3 output cables
        const wave = 0.5 + 0.5 * Math.sin(t * 4.5 - step * 0.85);
        lx = gx * P;
        ly = gy * P;
        lz = gz * P;
        sc = 0.142 + wave * 0.032;
        col = wave > 0.78 ? EMERALD : GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.08, 0.08, 0.08, INDIGO], [0.08, 0.08, 0.08, EMERALD],
        [-0.08, -0.08, 0.08, NAVY], [0.08, -0.08, 0.08, INDIGO],
        [0, 0.18, -0.06, COBALT], [0, -0.14, -0.06, INDIGO],
        [-0.36, 0.2, 0, COBALT], [-0.38, 0, 0, MAGENTA], [-0.36, -0.2, 0, EMERALD],
        [0.36, 0.2, 0, GOLD], [0.38, 0, 0, GOLD], [0.36, -0.2, 0, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.22 + Math.sin(t * 0.45) * 0.26;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.24);
      return { dx, dy, dz, rx: 0.24, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     6. GI — 3-Column Weekly Shift Roster Board Crowned by Analog Clock Medallion
     -------------------------------------------------------------------------- */
  "gi-s3-kanban-shifts": {
    hero(idx, _count, t) {
      const P = 0.205;
      const rotY = -0.16 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.16;
      let lx = 0, ly = 0, lz = 0, sc = 0.178, col = INDIGO;

      if (idx < 50) {
        // Dark bezel frame + 2 vertical column dividers
        const f = KANBAN_FRAME_50[idx % KANBAN_FRAME_50.length];
        lx = f.x * P;
        ly = f.y * P;
        lz = 0;
        col = f.col;
      } else if (idx < 59) {
        // 3 Column headers (Mon / Wed / Fri) — 3 cubes each
        const k = idx - 50;
        const c = Math.floor(k / 3); // 0, 1, 2
        const sub = (k % 3) - 1; // -1, 0, 1
        const cx = (c - 1) * 4;
        lx = (cx + sub) * P;
        ly = 1.0 * P;
        lz = 0.28 * P;
        sc = 0.172;
        col = sub === 0 ? WHITE : c === 1 ? NAVY : COBALT;
      } else if (idx < 95) {
        // 12 shift blocks (3 cols x 4 rows x 3 cubes = 36) gently pulsing into slots
        const k = idx - 59;
        const card = Math.floor(k / 3); // 0..11
        const sub = (k % 3) - 1;
        const colIdx = Math.floor(card / 4); // 0..2
        const rowIdx = card % 4; // 0..3
        const cx = (colIdx - 1) * 4;
        const cy = -rowIdx;
        const pulse = Math.max(0, Math.sin(t * 1.85 - card * 0.72));
        const palette = [
          EMERALD, GOLD, MAGENTA, COBALT,
          GOLD, EMERALD, ROSE, EMERALD,
          MAGENTA, COBALT, GOLD, EMERALD,
        ];
        lx = (cx + sub) * P;
        ly = cy * P;
        lz = (0.35 + pulse * 0.42) * P;
        sc = 0.168 + pulse * 0.014;
        col = palette[card % palette.length];
      } else {
        // 25-cube crisp analog clock medallion crowning the top
        const k = idx - 95;
        const cy = 5.05;
        if (k < 12) {
          // 12-hour dark indigo & gold bezel ring
          const a = (k / 12) * Math.PI * 2;
          lx = Math.cos(a) * 2.15 * P;
          ly = (cy + Math.sin(a) * 2.15) * P;
          lz = 0.2 * P;
          sc = 0.172;
          col = k % 3 === 0 ? GOLD : INDIGO;
        } else if (k < 20) {
          // 8-cube framed white clock dial face inside the dark bezel
          const a = ((k - 12) / 8) * Math.PI * 2;
          lx = Math.cos(a) * 1.12 * P;
          ly = (cy + Math.sin(a) * 1.12) * P;
          lz = -0.18 * P;
          sc = 0.165;
          col = WHITE;
        } else if (k === 20) {
          // Center clock hub
          lx = 0;
          ly = cy * P;
          lz = 0.55 * P;
          sc = 0.155;
          col = GOLD;
        } else if (k < 23) {
          // Sweeping minute hand (2 segments)
          const seg = k - 20; // 1, 2
          const a = Math.PI * 0.5 - t * 1.35;
          lx = Math.cos(a) * (seg * 0.78) * P;
          ly = (cy + Math.sin(a) * (seg * 0.78)) * P;
          lz = 0.72 * P;
          sc = 0.138;
          col = INDIGO;
        } else {
          // Sweeping hour hand (2 segments)
          const seg = k - 22; // 1, 2
          const a = Math.PI * 0.5 - t * 0.35 - 1.2;
          lx = Math.cos(a) * (seg * 0.58) * P;
          ly = (cy + Math.sin(a) * (seg * 0.58)) * P;
          lz = 0.92 * P;
          sc = 0.135;
          col = MAGENTA;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, -0.26, 0, INDIGO], [0, -0.26, 0, INDIGO], [0.32, -0.26, 0, INDIGO],
        [-0.24, -0.06, 0.08, EMERALD], [0, -0.06, 0.1, GOLD], [0.24, -0.06, 0.08, MAGENTA],
        [-0.24, 0.12, 0.08, COBALT], [0, 0.12, 0.08, EMERALD], [0.24, 0.12, 0.08, GOLD],
        [-0.14, 0.34, 0.04, INDIGO], [0, 0.38, 0.08, WHITE], [0.14, 0.34, 0.04, GOLD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     7. GI — Alvin Ailey Dance Theater Stage + Velvet Proscenium + 3 Dancers
     -------------------------------------------------------------------------- */
  "gi-s3-stage-spotlight": {
    hero(idx, _count, t) {
      const P = 0.2;
      const rotY = -0.14 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.22;
      let lx = 0, ly = 0, lz = 0, sc = 0.172, col = INDIGO;

      if (idx < 27) {
        // Dark theater stage floor plinth (9 wide x 3 deep)
        const c = (idx % 9) - 4;
        const r = Math.floor(idx / 9) - 1;
        lx = c * P;
        ly = -4.25 * P;
        lz = r * P;
        const isFootlight = r === 1 && (c === -2 || c === 0 || c === 2);
        col = isFootlight ? GOLD : r === -1 ? INDIGO : NAVY;
      } else if (idx < 66) {
        // Crimson velvet proscenium curtain arch (39 cubes)
        const p = PROSCENIUM_39[(idx - 27) % PROSCENIUM_39.length];
        lx = p.x * P;
        ly = p.y * P;
        lz = p.z * P;
        col = p.col;
      } else if (idx < 90) {
        // Twin golden overhead spotlights + diagonal light beams (24 cubes)
        const k = idx - 66;
        const isRight = k >= 12;
        const local = k % 12;
        const side = isRight ? 1 : -1;
        const sweep = Math.sin(t * 1.45 + side * 0.9) * 0.55;
        if (local < 2) {
          // Lamp housing on upper proscenium bar
          lx = side * (3.1 - local * 0.75) * P;
          ly = (3.75 - local * 0.35) * P;
          lz = 1.55 * P;
          sc = 0.165;
          col = local === 0 ? INDIGO : GOLD;
        } else {
          // 2 diagonal light rays x 5 cubes each
          const b = local - 2;
          const ray = b < 5 ? 0 : 1;
          const step = b % 5; // 0..4
          const u = (step + 1) / 5.4;
          const sx = side * 2.4;
          const sy = 3.1;
          const tx = side * (ray === 0 ? -0.4 : 1.5) + sweep;
          const ty = -3.0;
          lx = (sx + (tx - sx) * u) * P;
          ly = (sy + (ty - sy) * u) * P;
          lz = (1.45 - u * 0.55) * P;
          const shimmer = 0.5 + 0.5 * Math.sin(t * 4.0 - step * 0.9 + side);
          sc = 0.115 + shimmer * 0.028;
          col = GOLD;
        }
      } else {
        // 3 stylized synchronized dancer figures gracefully swaying (3 x 10 = 30)
        const k = idx - 90;
        const d = Math.floor(k / 10); // 0 left, 1 center lead, 2 right
        const part = k % 10;
        const cx = d === 0 ? -2.75 : d === 1 ? 0 : 2.75;
        const cz = d === 1 ? 0.1 : -0.75;
        const phase = t * 1.9 + (d === 1 ? 0 : 0.45);
        const sway = Math.sin(phase) * 0.45;
        const lift = Math.sin(phase) * 0.38;

        const bodyCol = d === 1 ? GOLD : d === 0 ? MAGENTA : EMERALD;
        const accentCol = d === 1 ? ROSE : COBALT;
        const parts: Array<[number, number, number, string]> = [
          [0, 0, 0, INDIGO], // standing foot
          [0, 0.96, 0, accentCol], // standing leg
          [-0.96, 0.78 + lift * 0.35, -0.15, accentCol], // arabesque extended leg
          [0.12 * sway, 1.92, 0, bodyCol], // torso core
          [-0.94 + 0.1 * sway, 1.78, 0.18, bodyCol], // flowing skirt left
          [0.95 + 0.1 * sway, 1.68, 0.18, bodyCol], // flowing skirt right
          [0.24 * sway, 2.88, 0, bodyCol], // upper chest
          [0.3 * sway, 3.84, 0, GOLD], // head
          [-0.94 + 0.35 * sway, 3.55 + lift * 0.45, 0.15, bodyCol], // sweeping arm L
          [0.96 + 0.35 * sway, 3.25 - lift * 0.35, 0.15, bodyCol], // sweeping arm R
        ];
        const pt = parts[part % parts.length];
        lx = (cx + pt[0]) * P;
        ly = (-3.25 + pt[1]) * P;
        lz = (cz + pt[2]) * P;
        sc = part === 7 ? 0.15 : 0.162;
        col = pt[3];
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const sway = Math.sin(t * 2.0) * 0.06;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, -0.34, 0, INDIGO], [0, -0.34, 0, NAVY], [0.32, -0.34, 0, INDIGO],
        [-0.4, -0.02, 0.06, CORNELL_RED], [-0.4, 0.28, 0.06, CORNELL_RED],
        [0, 0.38, 0.06, CORNELL_RED],
        [0.4, 0.28, 0.06, CORNELL_RED], [0.4, -0.02, 0.06, CORNELL_RED],
        [-0.18, 0.24, 0.12, GOLD], [0.18, 0.24, 0.12, GOLD],
        [-0.14 + sway, -0.08, 0, MAGENTA], [0.14 + sway, -0.08, 0, EMERALD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.2);
      return { dx, dy, dz, rx: 0.2, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     8. GI — Sculpted 3D Crystal Hourglass Beside Color-Coded Weekly Roster Grid
     -------------------------------------------------------------------------- */
  "gi-s3-hourglass-grid": {
    hero(idx, _count, t) {
      const P = 0.205;
      const rotY = -0.18 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.175, col = COBALT;

      if (idx < 64) {
        // Sculpted 3D crystal hourglass on left (cx = -3.4)
        const cx = -3.4;
        if (idx < 16) {
          // Top & bottom navy/indigo octagonal end caps (8 each)
          const isTop = idx < 8;
          const seg = idx % 8;
          const a = (seg / 8) * Math.PI * 2;
          lx = (cx + Math.cos(a) * 1.85) * P;
          ly = (isTop ? 4.35 : -4.35) * P;
          lz = Math.sin(a) * 1.85 * P;
          col = seg % 2 === 0 ? INDIGO : NAVY;
        } else if (idx < 28) {
          // 2 outer vertical frame rods (6 segments each)
          const k = idx - 16;
          const side = k < 6 ? -2.2 : 2.2;
          const step = k % 6;
          lx = (cx + side) * P;
          ly = (-3.15 + step * 1.26) * P;
          lz = 0;
          sc = 0.155;
          col = step === 2 || step === 3 ? GOLD : NAVY;
        } else if (idx < 52) {
          // Tapered cobalt crystal glass bulbs (4 rings x 6 cubes = 24)
          const k = idx - 28;
          const ring = Math.floor(k / 6); // 0 top wide, 1 top narrow, 2 bot narrow, 3 bot wide
          const seg = k % 6;
          const a = (seg / 6) * Math.PI * 2 + ring * 0.25;
          const r = ring === 0 || ring === 3 ? 1.52 : 1.04;
          const gy = ring === 0 ? 3.1 : ring === 1 ? 1.9 : ring === 2 ? -1.9 : -3.1;
          lx = (cx + Math.cos(a) * r) * P;
          ly = gy * P;
          lz = Math.sin(a) * r * P;
          sc = 0.168;
          col = ring === 1 || ring === 2 ? SKY : COBALT;
        } else {
          // 12 cubes: 4 waist collar + 7 pouring golden sand + 1 top finial
          const k = idx - 52;
          if (k < 4) {
            const a = (k / 4) * Math.PI * 2;
            lx = (cx + Math.cos(a) * 1.02) * P;
            ly = 0;
            lz = Math.sin(a) * 1.02 * P;
            sc = 0.16;
            col = COBALT;
          } else if (k === 4) {
            lx = cx * P;
            ly = 5.3 * P;
            lz = 0;
            sc = 0.165;
            col = GOLD;
          } else {
            // 7 glowing golden sand segments pulsing downward through the waist
            const s = k - 5; // 0 (top) .. 6 (bottom)
            const gy = 3.15 - s * 1.05;
            const pulse = 0.5 + 0.5 * Math.sin(t * 4.4 + s * 1.05);
            lx = cx * P;
            ly = gy * P;
            lz = 0;
            sc = s === 3 ? 0.145 + pulse * 0.035 : 0.165 + pulse * 0.02;
            col = GOLD;
          }
        }
      } else {
        // 56-cube color-coded weekly roster grid on right (x = 0.5..6.5)
        const k = idx - 64;
        if (k < 26) {
          // Outer dark indigo/navy board frame
          let gx = 0.5, gy = 0;
          if (k < 7) {
            gx = 0.5 + k;
            gy = 3.5;
          } else if (k < 14) {
            gx = 0.5 + (k - 7);
            gy = -3.5;
          } else if (k < 20) {
            gx = 0.5;
            gy = -2.5 + (k - 14);
          } else {
            gx = 6.5;
            gy = -2.5 + (k - 20);
          }
          lx = gx * P;
          ly = gy * P;
          lz = 0;
          col = k < 14 ? INDIGO : NAVY;
        } else {
          // 5 weekday columns x 6 rows (1 header row + 5 shift rows = 30)
          const j = k - 26;
          const c = j % 5; // 0..4
          const r = Math.floor(j / 5); // 0 top header .. 5 bottom
          const gx = 1.5 + c;
          const gy = 2.5 - r;
          const activeRow = 2.5 + Math.sin(t * 1.15) * 2.0;
          const near = r > 0 && Math.abs(r - activeRow) < 0.7;
          const shiftColors = [EMERALD, GOLD, MAGENTA, ROSE, WHITE];
          lx = gx * P;
          ly = gy * P;
          lz = (near ? 0.48 : 0.2) * P;
          sc = near ? 0.18 : 0.168;
          col = r === 0 ? COBALT : shiftColors[(c * 2 + r) % shiftColors.length];
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [-0.32, 0.34, 0, INDIGO], [-0.32, 0.18, 0, COBALT],
        [-0.32, 0, 0, GOLD], [-0.32, -0.18, 0, COBALT],
        [-0.32, -0.34, 0, INDIGO], [-0.2, 0.08, 0, GOLD],
        [0.06, 0.24, 0, COBALT], [0.28, 0.24, 0, COBALT],
        [0.06, 0, 0.06, EMERALD], [0.28, 0, 0.06, GOLD],
        [0.06, -0.24, 0.06, MAGENTA], [0.28, -0.24, 0.06, EMERALD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.18);
      return { dx, dy, dz, rx: 0.18, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     9. TPM — Live Outdoor Concert Stage! Truss Arch, Spotlights, Speakers,
        Lit Equalizer Backdrop & Energetic Bouncing Festival Crowd!
     -------------------------------------------------------------------------- */
  "tpm-s3-concert-stage": {
    hero(idx, _count, t) {
      const P = 0.205;
      const rotY = -0.16 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.22;
      let lx = 0, ly = 0, lz = 0, sc = 0.175, col = INDIGO;

      if (idx < 34) {
        // Stage deck (11) + Left/Right truss towers (10) + Overhead light bar (13)
        if (idx < 11) {
          const gx = idx - 5;
          lx = gx * P;
          ly = -2.2 * P;
          lz = -0.35 * P;
          col = Math.abs(gx) <= 1 ? GOLD : INDIGO;
        } else if (idx < 21) {
          const j = idx - 11;
          const side = j < 5 ? -5.1 : 5.1;
          const h = j % 5;
          lx = side * P;
          ly = (-1.2 + h * 1.0) * P;
          lz = -0.45 * P;
          col = h % 2 === 0 ? INDIGO : NAVY;
        } else {
          const j = idx - 21;
          const gx = j - 6;
          const flash = Math.sin(t * 5.0 + gx * 1.1) > 0.25;
          lx = gx * P;
          ly = 3.85 * P;
          lz = -0.45 * P;
          col =
            Math.abs(gx) % 2 === 1
              ? flash
                ? GOLD
                : MAGENTA
              : INDIGO;
        }
      } else if (idx < 50) {
        // Twin dark speaker stacks on left & right (8 each = 16)
        const k = idx - 34;
        const side = k < 8 ? -6.35 : 6.35;
        const local = k % 8;
        const isFront = local >= 4;
        const h = local % 4;
        const bass = Math.abs(Math.sin(t * 5.0)) * 0.14;
        lx = side * P;
        ly = (-2.0 + h * 1.05) * P;
        lz = (isFront ? 0.55 + (h === 1 || h === 2 ? bass : 0) : -0.5) * P;
        sc = 0.18;
        col = isFront && (h === 1 || h === 2) ? (bass > 0.09 ? MAGENTA : COBALT) : INDIGO;
      } else if (idx < 80) {
        // Vibrant lit equalizer backdrop screen (6 bars x 5 rows = 30)
        const k = idx - 50;
        const bar = Math.floor(k / 5); // 0..5
        const row = k % 5; // 0 bottom .. 4 top
        const gx = (bar - 2.5) * 1.4;
        const gy = -1.2 + row * 0.96;
        const level =
          2.6 +
          1.95 * Math.sin(t * 4.8 + bar * 1.15) * Math.cos(t * 2.1 - bar * 0.65);
        const lit = row <= level;
        lx = gx * P;
        ly = gy * P;
        lz = -1.65 * P;
        sc = lit ? 0.178 : 0.135;
        const barCols = [EMERALD, EMERALD, COBALT, GOLD, MAGENTA];
        col = lit ? barCols[row % barCols.length] : INDIGO;
      } else if (idx < 96) {
        // 4 diagonal stage spotlight beams (2 gold + 2 magenta, 4 cubes each = 16)
        const k = idx - 80;
        const beam = Math.floor(k / 4); // 0..3
        const step = k % 4;
        const u = (step + 0.7) / 4.2;
        const origins = [-3.8, -1.6, 1.6, 3.8];
        const targets = [-0.8, 1.6, -1.6, 0.8];
        const sweep = Math.sin(t * 2.1 + beam * 1.4) * 0.6;
        const sx = origins[beam % origins.length];
        const tx = targets[beam % targets.length] + sweep;
        lx = (sx + (tx - sx) * u) * P;
        ly = (3.1 - u * 4.4) * P;
        lz = (0.35 + u * 0.45) * P;
        sc = 0.125 + Math.sin(t * 4.5 - step) * 0.018;
        col = beam === 0 || beam === 3 ? GOLD : MAGENTA;
      } else {
        // Energetic colorful bouncing crowd of 12 festivalgoers in front (24 cubes)
        const k = idx - 96;
        const person = Math.floor(k / 2); // 0..11
        const isHead = k % 2 === 1;
        const row = person < 6 ? 0 : 1;
        const colPos = person % 6;
        const gx = row === 0 ? (colPos - 2.5) * 1.85 : (colPos - 2.5) * 2.0;
        const gz = row === 0 ? 1.85 : 3.15;
        const bounce = Math.abs(Math.sin(t * 5.2 + person * 0.85)) * 0.62;
        const crowdCols = [
          CORNELL_RED, GOLD, EMERALD, MAGENTA, COBALT, ROSE,
          EMERALD, CORNELL_RED, COBALT, GOLD, ROSE, MAGENTA,
        ];
        lx = gx * P;
        ly = (-4.05 + (isHead ? 0.98 : 0) + bounce) * P;
        lz = gz * P;
        sc = isHead ? 0.15 : 0.172;
        col = isHead
          ? person % 3 === 0
            ? GOLD
            : person % 3 === 1
              ? EMERALD
              : MAGENTA
          : crowdCols[person % crowdCols.length];
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const bounce = Math.abs(Math.sin(t * 5.0 + slot)) * 0.06;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.06, -0.06, INDIGO], [-0.36, 0.24, -0.06, INDIGO],
        [0, 0.34, -0.06, GOLD], [0.36, 0.24, -0.06, INDIGO], [0.36, -0.06, -0.06, INDIGO],
        [-0.14, 0.04, -0.14, EMERALD], [0, 0.12, -0.14, MAGENTA], [0.14, 0.04, -0.14, COBALT],
        [-0.46, 0.04, 0.04, NAVY], [0.46, 0.04, 0.04, NAVY],
        [-0.16, -0.3 + bounce, 0.2, CORNELL_RED], [0.16, -0.3 + bounce, 0.2, GOLD],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.45) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.22);
      return { dx, dy, dz, rx: 0.22, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     10. TPM — Campus Quad Festival Event Canopy Tent! Cornell-Red & White
         Striped Roof + 4 Corner Posts + Fluttering Bunting + Festival Lights!
     -------------------------------------------------------------------------- */
  "tpm-s3-campus-festival": {
    hero(idx, _count, t) {
      const P = 0.215;
      const rotY = -0.35 + Math.sin(t * 0.28) * 0.18;
      const rotX = 0.26;
      let lx = 0, ly = 0, lz = 0, sc = 0.184, col = CORNELL_RED;

      if (idx < 49) {
        // 4-tier striped Cornell-red & white peaked canopy roof
        const r = CANOPY_ROOF_49[idx % CANOPY_ROOF_49.length];
        lx = r.x * P;
        ly = r.y * P;
        lz = r.z * P;
        col = r.col;
      } else if (idx < 53) {
        // Peak golden flagpole & fluttering Cornell pennant
        const k = idx - 49;
        const flutter = Math.sin(t * 4.2 - k * 1.1) * 0.16;
        const pts: Array<[number, number, number, string]> = [
          [0, 4.6, 0, GOLD],
          [0, 5.5, 0, GOLD],
          [0.95, 5.15, flutter * 0.5, CORNELL_RED],
          [1.88, 5.15, flutter, CORNELL_RED],
        ];
        const pt = pts[k % pts.length];
        lx = pt[0] * P;
        ly = pt[1] * P;
        lz = pt[2] * P;
        sc = k < 2 ? 0.155 : 0.168;
        col = pt[3];
      } else if (idx < 69) {
        // 4 dark corner support posts (4 corners x 4 segments = 16)
        const k = idx - 53;
        const corner = Math.floor(k / 4);
        const h = k % 4;
        const cx = corner % 2 === 0 ? -3.0 : 3.0;
        const cz = corner < 2 ? -3.0 : 3.0;
        lx = cx * P;
        ly = (-0.3 - h * 0.98) * P;
        lz = cz * P;
        sc = 0.175;
        col = h === 3 ? NAVY : INDIGO;
      } else if (idx < 84) {
        // Festival welcome table & campus quad emerald planters under tent (15)
        const k = idx - 69;
        if (k < 9) {
          // 3x3 festival welcome booth table
          const c = (k % 3) - 1;
          const r = Math.floor(k / 3) - 1;
          lx = c * P;
          ly = -2.25 * P;
          lz = r * P;
          col = c === 0 ? GOLD : NAVY;
        } else if (k < 13) {
          // 4 table legs
          const leg = k - 9;
          lx = (leg % 2 === 0 ? -1.0 : 1.0) * P;
          ly = -3.22 * P;
          lz = (leg < 2 ? -1.0 : 1.0) * P;
          sc = 0.16;
          col = INDIGO;
        } else {
          // 2 quad lawn emerald accent bushes flanking front corners
          const side = k === 13 ? -4.1 : 4.1;
          lx = side * P;
          ly = -3.22 * P;
          lz = 2.6 * P;
          sc = 0.18;
          col = EMERALD;
        }
      } else if (idx < 104) {
        // 20 colorful fluttering triangle bunting pennants along all 4 eaves (4 x 5)
        const k = idx - 84;
        const side = Math.floor(k / 5); // 0 front, 1 back, 2 left, 3 right
        const pos = (k % 5) - 2; // -2..2
        const sag = -0.45 * (1 - (pos / 2.2) * (pos / 2.2));
        const sway = Math.sin(t * 3.6 + k * 0.85) * 0.14;
        const buntCols = [GOLD, EMERALD, COBALT, MAGENTA, CORNELL_RED];
        if (side === 0) {
          lx = pos * P;
          lz = (3.25 + sway) * P;
        } else if (side === 1) {
          lx = pos * P;
          lz = (-3.25 - sway) * P;
        } else if (side === 2) {
          lx = (-3.25 - sway) * P;
          lz = pos * P;
        } else {
          lx = (3.25 + sway) * P;
          lz = pos * P;
        }
        ly = (-0.28 + sag) * P;
        sc = 0.148;
        col = buntCols[k % buntCols.length];
      } else {
        // 16 warm golden twinkling festival string lights framing the canopy
        const k = idx - 104;
        const side = Math.floor(k / 4);
        const pos = (k % 4) - 1.5; // -1.5, -0.5, 0.5, 1.5
        const twinkle = 0.5 + 0.5 * Math.sin(t * 4.4 + k * 1.3);
        const sag = -0.35 * (1 - (pos / 1.8) * (pos / 1.8));
        if (side === 0) {
          lx = pos * 1.45 * P;
          lz = 4.15 * P;
        } else if (side === 1) {
          lx = pos * 1.45 * P;
          lz = -4.15 * P;
        } else if (side === 2) {
          lx = -4.15 * P;
          lz = pos * 1.45 * P;
        } else {
          lx = 4.15 * P;
          lz = pos * 1.45 * P;
        }
        ly = (0.65 + sag) * P;
        sc = 0.125 + twinkle * 0.036;
        col = twinkle > 0.85 && k % 3 === 0 ? MAGENTA : GOLD;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, 0.38, 0, CORNELL_RED],
        [-0.2, 0.2, 0.2, CORNELL_RED], [0.2, 0.2, 0.2, WHITE],
        [-0.2, 0.2, -0.2, WHITE], [0.2, 0.2, -0.2, CORNELL_RED],
        [-0.28, -0.18, 0.28, INDIGO], [0.28, -0.18, 0.28, INDIGO],
        [-0.28, -0.18, -0.28, INDIGO], [0.28, -0.18, -0.28, INDIGO],
        [0, 0.06, 0.3, GOLD], [-0.16, 0.02, 0.3, EMERALD], [0.16, 0.02, 0.3, MAGENTA],
      ];
      const p = pts[slot];
      const ry = -0.35 + Math.sin(t * 0.45) * 0.26;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.24);
      return { dx, dy, dz, rx: 0.24, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     11. TPM — 3D Event Megaphone / Bullhorn Blasting Stars & Confetti!
     -------------------------------------------------------------------------- */
  "tpm-s3-megaphone-confetti": {
    hero(idx, _count, t) {
      const P = 0.205;
      const rotY = -0.2 + Math.sin(t * 0.28) * 0.16;
      const rotX = 0.18;
      const tilt = 0.34 + Math.sin(t * 2.1) * 0.06; // angled upward-right
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      let mx = 0, my = 0, mz = 0, sc = 0.175, col = CORNELL_RED;
      let extraSpin = 0;

      if (idx < 72) {
        // Sculpted 3D Cornell-red & white megaphone cone (65) + dark handle & core (7)
        if (idx < 65) {
          const c = MEGAPHONE_CONE_65[idx % MEGAPHONE_CONE_65.length];
          mx = c.x - 1.4;
          my = c.y;
          mz = c.z;
          col = c.col;
        } else {
          const k = idx - 65;
          const handlePts: Array<[number, number, number, string]> = [
            [-2.5, -1.85, 0, INDIGO],
            [-2.7, -2.8, 0, INDIGO],
            [-2.9, -3.75, 0, NAVY],
            [-3.1, -4.7, 0, INDIGO],
            [-1.55, -2.15, 0, GOLD], // trigger button
            [0.65, 0, 0, GOLD], // acoustic sound cone core
            [-4.35, -0.95, 0, MAGENTA], // power switch
          ];
          const pt = handlePts[k % handlePts.length];
          mx = pt[0] - 1.4;
          my = pt[1];
          mz = pt[2];
          sc = k === 5 ? 0.185 : 0.168;
          col = pt[3];
        }
        // Apply upward-right megaphone tilt around Z
        const tx = mx * ct - my * st;
        const ty = mx * st + my * ct;
        const [x, y, z] = rotateYX(tx * P, ty * P, mz * P, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, tilt, sc, col);
      }

      // 48-cube festive burst: 3 golden stars (15) + 2 emerald notes (12) + 21 confetti sparks
      const k = idx - 72;
      if (k < 15) {
        // 3 sculpted 5-voxel golden stars floating out of the bell
        const star = Math.floor(k / 5);
        const part = k % 5;
        const centers: Array<[number, number, number]> = [
          [3.6, 2.9, 0.9],
          [5.8, 0.8, -0.9],
          [4.3, -1.4, 1.4],
        ];
        const c = centers[star % centers.length];
        const pulse = Math.sin(t * 2.8 + star * 2.1);
        const offsets: Array<[number, number]> = [
          [0, 0], [0.82, 0], [-0.82, 0], [0, 0.82], [0, -0.82],
        ];
        const o = offsets[part % offsets.length];
        mx = c[0] + o[0] + pulse * 0.25;
        my = c[1] + o[1] + Math.cos(t * 2.4 + star) * 0.22;
        mz = c[2];
        sc = part === 0 ? 0.165 : 0.14;
        col = GOLD;
        extraSpin = t * 0.9 + star;
      } else if (k < 27) {
        // 2 sculpted 6-voxel emerald music-note accents
        const note = Math.floor((k - 15) / 6);
        const part = (k - 15) % 6;
        const centers: Array<[number, number, number]> = [
          [2.5, 0.7, -1.7],
          [5.6, 3.3, 0.2],
        ];
        const c = centers[note % centers.length];
        const bob = Math.sin(t * 3.0 + note * 2.4) * 0.3;
        const shape: Array<[number, number]> = [
          [0, 0], [-0.82, 0], [0, 0.88], [0, 1.76], [0.82, 1.76], [0.82, 1.0],
        ];
        const sh = shape[part % shape.length];
        mx = c[0] + sh[0];
        my = c[1] + sh[1] + bob;
        mz = c[2];
        sc = 0.145;
        col = EMERALD;
      } else {
        // 21 magenta/cobalt/gold/red confetti sparks fanning in a joyful cone
        const j = k - 27;
        const layer = j % 3;
        const ang = (j / 21) * Math.PI * 2 + layer * 0.7;
        const dist = 2.0 + (j % 5) * 1.15;
        const breathe = Math.sin(t * 2.6 + j * 0.8) * 0.35;
        mx = 1.6 + dist + breathe * 0.5;
        my = Math.sin(ang) * (1.2 + dist * 0.42) + 1.1 + breathe;
        mz = Math.cos(ang) * (1.1 + dist * 0.34);
        const confCols = [MAGENTA, ROSE, COBALT, GOLD, CORNELL_RED, EMERALD];
        sc = 0.132 + (j % 2) * 0.02;
        col = confCols[j % confCols.length];
        extraSpin = t * 2.2 + j;
      }

      const [x, y, z] = rotateYX(mx * P, my * P, mz * P, rotY, rotX);
      return makeTarget(x, y, z, rotX + extraSpin * 0.4, rotY + extraSpin * 0.5, extraSpin * 0.3, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const bob = Math.sin(t * 3.0 + slot) * 0.04;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.14, 0, INDIGO], [-0.24, -0.3, 0, INDIGO],
        [-0.22, -0.08, 0, CORNELL_RED], [-0.08, 0, 0, WHITE],
        [0.06, 0.12, 0.1, CORNELL_RED], [0.06, 0.12, -0.1, CORNELL_RED],
        [0.06, -0.06, 0, CORNELL_RED],
        [0.26, 0.28 + bob, 0.06, GOLD], [0.42, 0.14 - bob, -0.06, EMERALD],
        [0.34, -0.04 + bob, 0.1, MAGENTA], [0.46, 0.32 - bob, 0, GOLD],
        [0.28, -0.22 + bob, -0.04, COBALT],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.45) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.18);
      return { dx, dy, dz, rx: 0.18, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     12. SYS — Octahedral Distributed-Systems Server Cluster & Consensus Mesh
     -------------------------------------------------------------------------- */
  "sys-s3-network-mesh": {
    hero(idx, _count, t) {
      const P = 0.21;
      const rotY = t * 0.34;
      const rotX = 0.32 + Math.sin(t * 0.45) * 0.12;
      let lx = 0, ly = 0, lz = 0, sc = 0.178, col = NAVY;

      if (idx < 48) {
        // 6 chunky 2x2x2 server nodes at the 6 vertices of an octahedron (6 x 8 = 48)
        const vIdx = Math.floor(idx / 8);
        const sub = idx % 8;
        const v = OCT_VERTS_6[vIdx % OCT_VERTS_6.length];
        const ox = sub & 1 ? 0.52 : -0.52;
        const oy = sub & 2 ? 0.52 : -0.52;
        const oz = sub & 4 ? 0.52 : -0.52;
        lx = (v[0] + ox) * P;
        ly = (v[1] + oy) * P;
        lz = (v[2] + oz) * P;
        const heartbeat = Math.sin(t * 3.8 - vIdx * 1.05) > 0.55;
        if (sub === 7) {
          col = heartbeat ? GOLD : EMERALD;
        } else if (sub >= 4) {
          col = COBALT;
        } else {
          col = sub % 2 === 0 ? INDIGO : NAVY;
        }
      } else if (idx < 96) {
        // 12 glowing emerald/gold consensus edges (12 edges x 4 cubes = 48)
        const k = idx - 48;
        const eIdx = Math.floor(k / 4);
        const step = k % 4; // 0..3
        const edge = OCT_EDGES_12[eIdx % OCT_EDGES_12.length];
        const va = OCT_VERTS_6[edge[0] % OCT_VERTS_6.length];
        const vb = OCT_VERTS_6[edge[1] % OCT_VERTS_6.length];
        const u = 0.24 + step * 0.173;
        lx = (va[0] + (vb[0] - va[0]) * u) * P;
        ly = (va[1] + (vb[1] - va[1]) * u) * P;
        lz = (va[2] + (vb[2] - va[2]) * u) * P;
        const wave = 0.5 + 0.5 * Math.sin(t * 4.2 - step * 1.15 - eIdx * 0.65);
        sc = 0.138 + wave * 0.036;
        col = wave > 0.72 ? GOLD : EMERALD;
      } else {
        // Pulsing central coordinator core (12) + 6 radial consensus spokes (12)
        const k = idx - 96;
        if (k < 8) {
          // 2x2x2 pulsing golden/magenta coordinator core
          const breathe = 1 + 0.1 * Math.sin(t * 2.8);
          const ox = (k & 1 ? 0.52 : -0.52) * breathe;
          const oy = (k & 2 ? 0.52 : -0.52) * breathe;
          const oz = (k & 4 ? 0.52 : -0.52) * breathe;
          lx = ox * P;
          ly = oy * P;
          lz = oz * P;
          sc = 0.175;
          col = k % 3 === 0 ? MAGENTA : GOLD;
        } else if (k < 12) {
          // 4 diagonal coordinator stabilizer fins
          const f = k - 8;
          lx = (f % 2 === 0 ? -1.45 : 1.45) * P;
          ly = 0;
          lz = (f < 2 ? -1.45 : 1.45) * P;
          sc = 0.15;
          col = COBALT;
        } else {
          // 6 radial consensus spokes x 2 beads each = 12
          const s = k - 12;
          const axis = Math.floor(s / 2); // 0..5
          const hop = s % 2; // 0 inner, 1 outer
          const v = OCT_VERTS_6[axis % OCT_VERTS_6.length];
          const frac = hop === 0 ? 0.44 : 0.68;
          const pulse = 0.5 + 0.5 * Math.sin(t * 4.5 - hop * 1.4 - axis * 0.7);
          lx = v[0] * frac * P;
          ly = v[1] * frac * P;
          lz = v[2] * frac * P;
          sc = 0.135 + pulse * 0.032;
          col = pulse > 0.65 ? GOLD : EMERALD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pts: Array<[number, number, number, string]> = [
        [0, 0, 0, GOLD],
        [0.36, 0, 0, COBALT], [-0.36, 0, 0, NAVY],
        [0, 0.36, 0, COBALT], [0, -0.36, 0, NAVY],
        [0, 0, 0.36, INDIGO], [0, 0, -0.36, INDIGO],
        [0.18, 0.18, 0, EMERALD], [-0.18, 0.18, 0, GOLD],
        [0.18, -0.18, 0, EMERALD], [-0.18, -0.18, 0, GOLD],
        [0, 0.18, 0.18, EMERALD],
      ];
      const p = pts[slot];
      const ry = t * 0.55;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.3);
      return { dx, dy, dz, rx: 0.3, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     13. SYS — Multi-Instrument Observability Console Rack! Bar Gauges,
         Live Circular Uptime Dial & Blinking Green Health LED Strip
     -------------------------------------------------------------------------- */
  "sys-s3-gauge-dashboard": {
    hero(idx, _count, t) {
      const P = 0.205;
      const rotY = -0.16 + Math.sin(t * 0.26) * 0.16;
      const rotX = 0.18;
      let lx = 0, ly = 0, lz = 0, sc = 0.178, col = INDIGO;

      if (idx < 52) {
        // Dark-indigo observability console housing
        const h = CONSOLE_HOUSING_52[idx % CONSOLE_HOUSING_52.length];
        lx = h.x * P;
        ly = h.y * P;
        lz = h.z * P;
        col = h.col;
      } else if (idx < 63) {
        // 11 blinking green health LEDs along the top strip
        const k = idx - 52;
        const gx = k - 5;
        const scan = 0.5 + 0.5 * Math.sin(t * 4.2 - k * 0.72);
        const blinkOff = k === 10 && Math.sin(t * 6.5) < -0.5;
        lx = gx * P;
        ly = 3.0 * P;
        lz = 0.65 * P;
        sc = blinkOff ? 0.135 : 0.155 + scan * 0.025;
        col = blinkOff ? NAVY : scan > 0.84 ? GOLD : EMERALD;
      } else if (idx < 90) {
        // 3 rising green / gold / magenta telemetry bar gauges on left (18 bars + 9 backplate)
        const k = idx - 63;
        if (k < 18) {
          const bar = Math.floor(k / 6); // 0 emerald, 1 gold, 2 magenta
          const seg = k % 6; // 0 bottom .. 5 top
          const bx = -4.6 + bar * 1.6;
          const by = -3.0 + seg * 1.0;
          const levels = [
            3.5 + 1.85 * Math.sin(t * 1.9),
            3.1 + 1.95 * Math.sin(t * 2.4 + 1.4),
            3.6 + 1.75 * Math.sin(t * 1.6 + 2.6),
          ];
          const lit = seg <= levels[bar % levels.length];
          const barCols = [EMERALD, GOLD, MAGENTA];
          lx = bx * P;
          ly = by * P;
          lz = (lit ? 0.68 : 0.25) * P;
          sc = lit ? 0.18 : 0.135;
          col = lit ? barCols[bar % barCols.length] : NAVY;
        } else {
          // 9 recessed rack backplate / scale-tick cubes behind the 3 bars
          const j = k - 18;
          const bar = j % 3;
          const row = Math.floor(j / 3);
          lx = (-4.6 + bar * 1.6) * P;
          ly = (-2.5 + row * 2.0) * P;
          lz = -0.55 * P;
          sc = 0.17;
          col = row === 1 ? COBALT : INDIGO;
        }
      } else {
        // 30-cube live circular uptime dial & status readout on right
        const k = idx - 90;
        const dcx = 3.0;
        const dcy = -0.25;
        if (k < 12) {
          // Circular gauge bezel ring (12 ticks)
          const a = (k / 12) * Math.PI * 2;
          lx = (dcx + Math.cos(a) * 1.96) * P;
          ly = (dcy + Math.sin(a) * 1.96) * P;
          lz = 0.55 * P;
          sc = 0.165;
          col =
            k < 3
              ? MAGENTA
              : k < 6
                ? GOLD
                : k < 10
                  ? EMERALD
                  : COBALT;
        } else if (k < 20) {
          // Recessed cobalt/navy inner dial face ring
          const a = ((k - 12) / 8) * Math.PI * 2;
          lx = (dcx + Math.cos(a) * 1.05) * P;
          ly = (dcy + Math.sin(a) * 1.05) * P;
          lz = -0.15 * P;
          sc = 0.16;
          col = k % 2 === 0 ? NAVY : COBALT;
        } else if (k < 23) {
          // Live sweeping uptime needle (hub + 2 segments)
          const seg = k - 20; // 0, 1, 2
          const needleA = 0.45 + Math.sin(t * 1.5) * 0.72 + Math.sin(t * 3.2) * 0.16;
          const r = seg * 0.78;
          lx = (dcx + Math.cos(needleA) * r) * P;
          ly = (dcy + Math.sin(needleA) * r) * P;
          lz = 0.88 * P;
          sc = seg === 0 ? 0.16 : 0.135;
          col = seg === 0 ? GOLD : CORNELL_RED;
        } else if (k < 28) {
          // 5-cube digital SLA readout strip below dial
          const s = k - 23;
          const pulse = Math.sin(t * 3.5 - s * 0.9) > 0.4;
          lx = (1.1 + s * 0.95) * P;
          ly = -3.2 * P;
          lz = 0.65 * P;
          sc = 0.155;
          col = pulse ? GOLD : EMERALD;
        } else {
          // 2 rotary calibration knobs in upper corners of right bay
          const side = k === 28 ? 1.1 : 4.9;
          lx = side * P;
          ly = 1.95 * P;
          lz = 0.85 * P;
          sc = 0.155;
          col = k === 28 ? GOLD : COBALT;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = idx % 12;
      const pulse = Math.sin(t * 2.5) * 0.05;
      const pts: Array<[number, number, number, string]> = [
        [-0.36, -0.28, 0, INDIGO], [0.36, -0.28, 0, INDIGO],
        [-0.36, 0.28, 0, INDIGO], [0.36, 0.28, 0, INDIGO],
        [-0.14, 0.28, 0.06, EMERALD], [0.14, 0.28, 0.06, EMERALD],
        [-0.28, -0.02 + pulse, 0.1, EMERALD],
        [-0.14, 0.04 - pulse, 0.1, GOLD],
        [0, -0.04 + pulse, 0.1, MAGENTA],
        [0.24, 0.06, 0.08, COBALT], [0.34, -0.06, 0.08, GOLD], [0.18, -0.1, 0.12, CORNELL_RED],
      ];
      const p = pts[slot];
      const ry = Math.sin(t * 0.4) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.18);
      return { dx, dy, dz, rx: 0.18, ry, rz: 0, scale: sc, color: p[3] };
    },
  },
};
