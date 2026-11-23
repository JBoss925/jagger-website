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

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep01(v: number): number {
  const u = clamp01(v);
  return u * u * (3 - 2 * u);
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

// ============================================================================
// High-contrast Architectural Concrete, Curtain-Wall Glass & Caterpillar Yellow
// Construction Palette (tuned against the #f5f0ff studio backdrop)
// ============================================================================
const CRANE_YELLOW = "#f5b82e";
const CRANE_GOLD = "#ffcb3d";
const CRANE_AMBER = "#d98a16";
const CRANE_ORANGE = "#e85d2a";
const SAFETY_RED = "#d93b3b";

const CONCRETE_LIGHT = "#c5cdd9";
const CONCRETE_MID = "#95a0b3";
const CONCRETE_DEEP = "#687387";
const STEEL_DARK = "#2b3347";
const STEEL_SLATE = "#434f68";
const CABLE_SILVER = "#8c9ab3";

const GLASS_CYAN = "#45a5eb";
const GLASS_BRIGHT = "#7ed0ff";
const GLASS_ICE = "#d9f2ff";
const GLASS_DEEP = "#2673b8";
const WHITE = "#ffffff";

type VoxelSpec = {
  x: number;
  y: number;
  z: number;
  s: number;
  c: string;
};

/**
 * Shared 12-cube mini overview evaluator for H2 Construction:
 * Concrete-and-glass building on the left (6 cubes) + Yellow L-shaped tower crane
 * on the right (4 cubes) + suspended cyan glass module & hook (2 cubes).
 */
function evaluateH2Mini(
  idx: number,
  _cnt: number,
  t: number,
  boost: number,
  sc: number,
) {
  const spin = Math.sin(t * 0.45) * 0.24 - 0.22;
  const slot = idx % 12;

  // 0..5: 2x3 concrete & glass building on left
  if (slot < 6) {
    const col = slot % 2 === 0 ? -0.27 : -0.05;
    const row = Math.floor(slot / 2) - 1; // -1, 0, 1
    const isGlass = slot === 1 || slot === 3 || slot === 4;
    const [dx, dy, dz] = rotateYX(
      col * boost,
      (row * 0.21 - 0.06) * boost,
      0.04 * boost,
      spin,
      0.2,
    );
    return {
      dx,
      dy,
      dz,
      rx: 0.2,
      ry: spin,
      rz: 0,
      scale: sc * 1.02,
      color: row === 1 ? CONCRETE_LIGHT : isGlass ? GLASS_CYAN : CONCRETE_DEEP,
    };
  }

  // 6..8: Vertical yellow crane mast on right
  if (slot < 9) {
    const lvl = slot - 6; // 0, 1, 2
    const [dx, dy, dz] = rotateYX(
      0.27 * boost,
      (-0.26 + lvl * 0.24) * boost,
      0,
      spin,
      0.2,
    );
    return {
      dx,
      dy,
      dz,
      rx: 0.2,
      ry: spin,
      rz: 0,
      scale: sc * 0.96,
      color: lvl % 2 === 0 ? CRANE_YELLOW : CRANE_AMBER,
    };
  }

  // 9..10: High horizontal yellow crane jib arm
  if (slot < 11) {
    const arm = slot - 9; // 0, 1
    const [dx, dy, dz] = rotateYX(
      (0.05 - arm * 0.24) * boost,
      0.34 * boost,
      0,
      spin,
      0.2,
    );
    return {
      dx,
      dy,
      dz,
      rx: 0.2,
      ry: spin,
      rz: 0,
      scale: sc * 0.92,
      color: CRANE_GOLD,
    };
  }

  // 11: Suspended glass payload hovering cleanly above the building roof
  const bob = Math.sin(t * 1.4) * 0.03;
  const [dx, dy, dz] = rotateYX(
    -0.16 * boost,
    (0.16 + bob) * boost,
    0.08 * boost,
    spin,
    0.2,
  );
  return {
    dx,
    dy,
    dz,
    rx: 0.2,
    ry: spin,
    rz: 0,
    scale: sc * 0.94,
    color: GLASS_BRIGHT,
  };
}

// ============================================================================
// LEVEL 1 (Simplest): h2-crane-recolored
// Classic Recolored & De-Clipped Crane + Concrete & Glass Building (120 cubes)
// - Left (x = -0.94): 4-story concrete-column & blue-glass curtain-wall building
//   (60 cubes: 5 levels x 12 perimeter voxels, top roof slab at y = -0.12).
// - Right (x = +1.26): Caterpillar-yellow L-shaped tower crane (42 cubes: 20 mast,
//   18 high jib at y = +1.56, 4 dark steel counterweight blocks).
// - Suspended Payload (18 cubes): Red/steel trolley (2) + silver hoist cable (8)
//   + 2x2x2 concrete-framed cyan glass module (8) hovering between y = +0.38 and
//   y = +0.68 — minimum 0.26 units of clear air above the y = -0.12 roof!
// ============================================================================
const L1_BUILDING_60: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  for (let story = 0; story < 5; story++) {
    for (let k = 0; k < 12; k++) {
      const side = Math.floor(k / 3);
      const pos = k % 3;
      const gx =
        side === 0 ? pos - 1.5 : side === 1 ? 1.5 : side === 2 ? 1.5 - pos : -1.5;
      const gz =
        side === 0 ? -1.5 : side === 1 ? pos - 1.5 : side === 2 ? 1.5 : 1.5 - pos;
      const isCorner = Math.abs(gx) === 1.5 && Math.abs(gz) === 1.5;
      const py = -1.40 + story * 0.32; // -1.40 .. -0.12
      let c = GLASS_CYAN;
      if (story === 0) {
        c = isCorner ? STEEL_DARK : CONCRETE_DEEP;
      } else if (story === 4) {
        c = isCorner ? CONCRETE_DEEP : CONCRETE_LIGHT;
      } else if (isCorner) {
        c = CONCRETE_MID;
      } else {
        c = (story + k) % 2 === 0 ? GLASS_CYAN : GLASS_BRIGHT;
      }
      pts.push({
        x: -0.94 + gx * 0.30,
        y: py,
        z: gz * 0.30,
        s: 0.245,
        c,
      });
    }
  }
  return pts; // 60 exact
})();

const L1_CRANE_42: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 20 mast cubes (10 levels x 2 columns at x = 1.26 ± 0.14, y = -1.40 .. +1.36, meeting jib at +1.56)
  for (let j = 0; j < 20; j++) {
    const side = j % 2 === 0 ? -0.14 : 0.14;
    const lvl = Math.floor(j / 2); // 0..9
    pts.push({
      x: 1.26 + side,
      y: -1.40 + lvl * 0.308,
      z: 0,
      s: 0.215,
      c: lvl === 0 ? CONCRETE_DEEP : lvl % 2 === 0 ? CRANE_YELLOW : CRANE_AMBER,
    });
  }
  // 18 horizontal jib cubes at y = +1.56 (x = +1.84 .. -1.56)
  for (let k = 0; k < 18; k++) {
    const ax = 1.84 - k * 0.20;
    pts.push({
      x: ax,
      y: 1.56,
      z: 0,
      s: 0.18,
      c:
        k === 17
          ? SAFETY_RED
          : k % 2 === 0
            ? CRANE_GOLD
            : CRANE_YELLOW,
    });
  }
  // 4 dark-steel counterweight blocks attached directly under right tail of jib
  for (let k = 0; k < 4; k++) {
    pts.push({
      x: 1.66 + (k % 2) * 0.22,
      y: 1.18 + Math.floor(k / 2) * 0.20,
      z: 0,
      s: 0.205,
      c: k < 2 ? STEEL_DARK : CONCRETE_DEEP,
    });
  }
  return pts; // 42 exact
})();

// ============================================================================
// LEVEL 2 (Medium-Simple): h2-crane-slewing-jib
// 3D Slewing Hammerhead Crane with Operator Cab, A-Frame Apex & Stepped Tower (120 cubes)
// - Left (x = -0.96): 56-cube stepped concrete-and-glass tower (4x4 base floors +
//   recessed upper curtain-wall core + open rooftop landing deck at y = -0.14).
// - Right (x = +1.24): 46-cube 3D crane with concrete pedestal (4), tall yellow
//   mast (20), operator cab with glass window (4), A-frame tower peak & tie rods (6),
//   counterweight blocks (4), and slewing main jib (8) that rotates in 3D (±14 deg)
//   around the mast while positioning the 18-cube hoist + 2x2x2 glass penthouse pod.
// ============================================================================
const L2_BUILDING_56: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // Floors 0..2: 3 stories x 12 perimeter cubes = 36 cubes (y = -1.40, -1.08, -0.76)
  for (let story = 0; story < 3; story++) {
    for (let k = 0; k < 12; k++) {
      const side = Math.floor(k / 3);
      const pos = k % 3;
      const gx =
        side === 0 ? pos - 1.5 : side === 1 ? 1.5 : side === 2 ? 1.5 - pos : -1.5;
      const gz =
        side === 0 ? -1.5 : side === 1 ? pos - 1.5 : side === 2 ? 1.5 : 1.5 - pos;
      const isCorner = Math.abs(gx) === 1.5 && Math.abs(gz) === 1.5;
      pts.push({
        x: -0.96 + gx * 0.30,
        y: -1.40 + story * 0.32,
        z: gz * 0.30,
        s: 0.245,
        c:
          story === 0
            ? isCorner
              ? STEEL_DARK
              : CONCRETE_DEEP
            : isCorner
              ? CONCRETE_LIGHT
              : (story + k) % 2 === 0
                ? GLASS_CYAN
                : GLASS_BRIGHT,
      });
    }
  }
  // Floor 3 (y = -0.44): 12 perimeter concrete/glass cubes
  for (let k = 0; k < 12; k++) {
    const side = Math.floor(k / 3);
    const pos = k % 3;
    const gx =
      side === 0 ? pos - 1.5 : side === 1 ? 1.5 : side === 2 ? 1.5 - pos : -1.5;
    const gz =
      side === 0 ? -1.5 : side === 1 ? pos - 1.5 : side === 2 ? 1.5 : 1.5 - pos;
    const isCorner = Math.abs(gx) === 1.5 && Math.abs(gz) === 1.5;
    pts.push({
      x: -0.96 + gx * 0.30,
      y: -0.44,
      z: gz * 0.30,
      s: 0.245,
      c: isCorner ? CONCRETE_MID : CONCRETE_LIGHT,
    });
  }
  // Floor 4 (y = -0.14): 8-cube architectural rooftop landing curb (corners + midpoints)
  const curbOffsets: Array<[number, number, string]> = [
    [-0.45, -0.45, CONCRETE_DEEP],
    [0, -0.45, CONCRETE_LIGHT],
    [0.45, -0.45, CONCRETE_DEEP],
    [0.45, 0, CONCRETE_LIGHT],
    [0.45, 0.45, CONCRETE_DEEP],
    [0, 0.45, CONCRETE_LIGHT],
    [-0.45, 0.45, CONCRETE_DEEP],
    [-0.45, 0, CONCRETE_LIGHT],
  ];
  for (const [ox, oz, col] of curbOffsets) {
    pts.push({ x: -0.96 + ox, y: -0.14, z: oz, s: 0.22, c: col });
  }
  return pts; // 36 + 12 + 8 = 56 exact
})();

const L2_CRANE_STATIC_24: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 4 heavy concrete anchor pads at base of crane (x = 1.24, y = -1.42)
  for (const [dx, dz] of [
    [-0.22, -0.18],
    [0.22, -0.18],
    [-0.22, 0.18],
    [0.22, 0.18],
  ]) {
    pts.push({ x: 1.24 + dx, y: -1.42, z: dz, s: 0.22, c: STEEL_DARK });
  }
  // 20 yellow lattice mast cubes (10 levels x 2 cols, y = -1.16 .. +1.36)
  for (let j = 0; j < 20; j++) {
    const side = j % 2 === 0 ? -0.13 : 0.13;
    const lvl = Math.floor(j / 2); // 0..9
    pts.push({
      x: 1.24 + side,
      y: -1.16 + lvl * 0.28,
      z: 0,
      s: 0.20,
      c: lvl % 2 === 0 ? CRANE_YELLOW : CRANE_AMBER,
    });
  }
  return pts; // 24 exact
})();

// 22 slewing upper-crane cubes defined in local crane-top coordinates around pivot (x = 1.24, z = 0)
const L2_CRANE_SLEW_22: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // Glass-windowed operator cab attached directly to front-left of mast neck (2 cubes)
  pts.push(
    { x: -0.26, y: 1.32, z: 0.18, s: 0.21, c: GLASS_ICE },
    { x: -0.26, y: 1.32, z: -0.02, s: 0.21, c: STEEL_DARK },
  );
  // Connected A-frame apex pyramid directly above mast center (3 cubes)
  pts.push(
    { x: -0.11, y: 1.74, z: 0, s: 0.18, c: CRANE_YELLOW },
    { x: 0.11, y: 1.74, z: 0, s: 0.18, c: CRANE_AMBER },
    { x: 0, y: 1.94, z: 0, s: 0.175, c: SAFETY_RED },
  );
  // Counterweight blocks hanging directly under right counter-jib (+0.38, +0.58) (2 cubes)
  pts.push(
    { x: 0.38, y: 1.33, z: 0, s: 0.215, c: STEEL_DARK },
    { x: 0.58, y: 1.33, z: 0, s: 0.215, c: CONCRETE_DEEP },
  );
  // Continuous horizontal hammerhead jib spanning from counter-jib (+0.58) across mast (0) to left tip (-2.22) (15 cubes)
  for (let k = 0; k < 15; k++) {
    pts.push({
      x: 0.58 - k * 0.20,
      y: 1.54,
      z: 0,
      s: 0.18,
      c:
        k === 14
          ? SAFETY_RED
          : k % 2 === 0
            ? CRANE_GOLD
            : CRANE_YELLOW,
    });
  }
  return pts; // 2 + 3 + 2 + 15 = 22 exact
})();

// ============================================================================
// LEVEL 3 (Happy Medium): h2-crane-pick-and-place
// Continuous Ground Pickup -> Hoist -> Swing -> Deep Roof Drop-Off Loop (120 cubes)
// - Left (x = -1.04): 52-cube concrete & glass building (4 hollow perimeter stories
//   + 4 rooftop corner piers at y = -0.18 framing the open roof shaft).
// - Center Ground Staging Pad (x = +0.18, y = -1.38): 8-cube concrete pad with
//   safety-orange corner bollards where new modules materialize in place.
// - Right (x = +1.30): 40-cube Yellow Tower Crane (18 mast + 18 jib at y = +1.58 +
//   4 dark counterweight blocks).
// - Animated Hoist & Module (20 cubes: 2 trolley + 8 silver cable + 2 orange hook
//   block + 8 concrete/glass module) executing a 4-phase pick-and-place loop where
//   the module lowers deep INTO the building shaft (y = -0.48), shrinks to 0 in
//   place inside the building, teleports while 100% invisible to the ground pad,
//   and grows back to full size in place on the pickup pad!
// ============================================================================
const L3_BUILDING_52: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 4 stories x 12 perimeter cubes = 48 cubes (y = -1.38, -1.08, -0.78, -0.48)
  for (let story = 0; story < 4; story++) {
    for (let k = 0; k < 12; k++) {
      const side = Math.floor(k / 3);
      const pos = k % 3;
      const gx =
        side === 0 ? pos - 1.5 : side === 1 ? 1.5 : side === 2 ? 1.5 - pos : -1.5;
      const gz =
        side === 0 ? -1.5 : side === 1 ? pos - 1.5 : side === 2 ? 1.5 : 1.5 - pos;
      const isCorner = Math.abs(gx) === 1.5 && Math.abs(gz) === 1.5;
      pts.push({
        x: -1.04 + gx * 0.29,
        y: -1.38 + story * 0.30,
        z: gz * 0.29,
        s: 0.24,
        c:
          story === 0
            ? isCorner
              ? STEEL_DARK
              : CONCRETE_DEEP
            : isCorner
              ? CONCRETE_MID
              : (story + k) % 2 === 0
                ? GLASS_CYAN
                : GLASS_BRIGHT,
      });
    }
  }
  // 4 rooftop concrete corner piers at y = -0.18 framing the open central shaft
  const roofPts: Array<[number, number, string]> = [
    [-0.435, -0.435, CONCRETE_LIGHT],
    [0.435, -0.435, CONCRETE_LIGHT],
    [-0.435, 0.435, CONCRETE_LIGHT],
    [0.435, 0.435, CONCRETE_LIGHT],
  ];
  for (const [ox, oz, col] of roofPts) {
    pts.push({ x: -1.04 + ox, y: -0.18, z: oz, s: 0.23, c: col });
  }
  return pts; // 48 + 4 = 52 exact
})();

const L3_PAD_8: VoxelSpec[] = [
  // 4 concrete staging slab cubes at x = +0.18, y = -1.40
  { x: 0.04, y: -1.40, z: -0.14, s: 0.20, c: CONCRETE_DEEP },
  { x: 0.32, y: -1.40, z: -0.14, s: 0.20, c: CONCRETE_DEEP },
  { x: 0.04, y: -1.40, z: 0.14, s: 0.20, c: CONCRETE_DEEP },
  { x: 0.32, y: -1.40, z: 0.14, s: 0.20, c: CONCRETE_DEEP },
  // 4 high-vis safety-orange corner bollards
  { x: -0.16, y: -1.34, z: -0.28, s: 0.13, c: CRANE_ORANGE },
  { x: 0.52, y: -1.34, z: -0.28, s: 0.13, c: CRANE_ORANGE },
  { x: -0.16, y: -1.34, z: 0.28, s: 0.13, c: CRANE_ORANGE },
  { x: 0.52, y: -1.34, z: 0.28, s: 0.13, c: CRANE_ORANGE },
];

const L3_CRANE_40: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 18 mast cubes (9 levels x 2 cols at x = 1.30 ± 0.13, y = -1.38 .. +1.36, meeting jib at +1.58)
  for (let j = 0; j < 18; j++) {
    const side = j % 2 === 0 ? -0.13 : 0.13;
    const lvl = Math.floor(j / 2); // 0..8
    pts.push({
      x: 1.30 + side,
      y: -1.38 + lvl * 0.342,
      z: 0,
      s: 0.215,
      c: lvl === 0 ? STEEL_DARK : lvl % 2 === 0 ? CRANE_YELLOW : CRANE_AMBER,
    });
  }
  // 18 horizontal jib cubes at y = +1.58 (x = +1.84 .. -1.56)
  for (let k = 0; k < 18; k++) {
    pts.push({
      x: 1.84 - k * 0.20,
      y: 1.58,
      z: 0,
      s: 0.18,
      c:
        k === 17
          ? SAFETY_RED
          : k % 2 === 0
            ? CRANE_GOLD
            : CRANE_YELLOW,
    });
  }
  // 4 dark counterweight blocks directly under right jib tail
  for (let k = 0; k < 4; k++) {
    pts.push({
      x: 1.66 + (k % 2) * 0.22,
      y: 1.20 + Math.floor(k / 2) * 0.20,
      z: 0,
      s: 0.205,
      c: k < 2 ? STEEL_DARK : CONCRETE_DEEP,
    });
  }
  return pts; // 18 + 18 + 4 = 40 exact
})();

// ============================================================================
// LEVEL 4 (Medium-Complex): h2-crane-floor-assembler
// Progressive Multi-Zone Penthouse Floor Assembler (120 cubes)
// - Left (x = -1.04): 48-cube 4-story concrete & glass building (y = -1.38 .. -0.48)
//   + TWO distinct rooftop penthouse bays at y = -0.06:
//   West Bay (x = -1.26, 8 cubes) and East Bay (x = -0.82, 8 cubes).
//   One bay is always resting completed on the roof while the crane picks up the
//   other bay from the ground material pallet (x = +0.20, 6 cubes), hoists it
//   overhead, and places it next to its sibling to complete the penthouse!
// ============================================================================
const L4_BASE_BUILDING_48 = L3_BUILDING_52.slice(0, 48);

const L4_PALLET_6: VoxelSpec[] = [
  { x: 0.06, y: -1.40, z: -0.13, s: 0.19, c: STEEL_SLATE },
  { x: 0.34, y: -1.40, z: -0.13, s: 0.19, c: STEEL_SLATE },
  { x: 0.06, y: -1.40, z: 0.13, s: 0.19, c: STEEL_SLATE },
  { x: 0.34, y: -1.40, z: 0.13, s: 0.19, c: STEEL_SLATE },
  { x: -0.12, y: -1.35, z: 0, s: 0.13, c: CRANE_GOLD },
  { x: 0.52, y: -1.35, z: 0, s: 0.13, c: CRANE_GOLD },
];

// ============================================================================
// LEVEL 5 (Most Innovative & Complex): h2-crane-truck-delivery
// Animated Flatbed Delivery Truck + Tower Crane + Building Construction Loop (120 cubes)
// - Left (x = -1.10): 48-cube concrete & glass building (roof deck at y = -0.22).
// - Right (x = +1.34): 38-cube Caterpillar-yellow tower crane (16 mast + 18 high
//   jib at y = +1.60 + 4 dark counterweight blocks).
// - Front Delivery Road: 16-cube Flatbed Semi-Truck (6 safety-red cab with white
//   windshield + 6 dark-steel flatbed trailer + 4 dark wheels) that drives in from
//   the right carrying an 8-cube prefabricated concrete-and-glass module, stops at
//   the crane pickup zone (x = +0.16), waits while the 10-cube crane trolley/cable/hook
//   hoists the module off the flatbed, then drives off to the left while the crane
//   swings the module overhead and installs it onto the building roof!
// ============================================================================
const L5_BUILDING_44: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 4 stories x 10 perimeter cubes (3x4 compact footprint at x = -1.28 so truck courtyard is wide open!) = 40 cubes
  // plus 4 rooftop corner piers = 44 cubes
  const ring10: Array<[number, number, boolean]> = [
    [-1.0, -1.0, true],
    [0.0, -1.0, false],
    [1.0, -1.0, true],
    [1.0, -0.33, false],
    [1.0, 0.33, false],
    [1.0, 1.0, true],
    [0.0, 1.0, false],
    [-1.0, 1.0, true],
    [-1.0, 0.33, false],
    [-1.0, -0.33, false],
  ];
  for (let story = 0; story < 4; story++) {
    ring10.forEach(([gx, gz, isCorner], k) => {
      pts.push({
        x: -1.28 + gx * 0.36,
        y: -1.38 + story * 0.30, // -1.38, -1.08, -0.78, -0.48
        z: -0.10 + gz * 0.36,
        s: 0.235,
        c:
          story === 0
            ? isCorner
              ? STEEL_DARK
              : CONCRETE_DEEP
            : story === 3
              ? isCorner
                ? CONCRETE_LIGHT
                : CONCRETE_MID
              : isCorner
                ? CONCRETE_MID
                : (story + k) % 2 === 0
                  ? GLASS_CYAN
                  : GLASS_BRIGHT,
      });
    });
  }
  // 4 rooftop corner guide piers at y = -0.20
  for (const [gx, gz] of [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, 1.0],
  ]) {
    pts.push({
      x: -1.28 + gx * 0.36,
      y: -0.20,
      z: -0.10 + gz * 0.36,
      s: 0.21,
      c: CONCRETE_LIGHT,
    });
  }
  return pts; // 40 + 4 = 44 exact
})();

const L5_CRANE_38: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 16 mast cubes (8 levels x 2 cols at x = 1.42 ± 0.13, y = -1.38 .. +1.36, meeting jib at +1.60)
  for (let j = 0; j < 16; j++) {
    const side = j % 2 === 0 ? -0.13 : 0.13;
    const lvl = Math.floor(j / 2); // 0..7
    pts.push({
      x: 1.42 + side,
      y: -1.38 + lvl * 0.39,
      z: -0.10,
      s: 0.22,
      c: lvl === 0 ? STEEL_DARK : lvl % 2 === 0 ? CRANE_YELLOW : CRANE_AMBER,
    });
  }
  // 18 horizontal jib cubes at y = +1.60 (x = +1.92 .. -1.48)
  for (let k = 0; k < 18; k++) {
    pts.push({
      x: 1.92 - k * 0.20,
      y: 1.60,
      z: -0.10,
      s: 0.18,
      c:
        k === 17
          ? SAFETY_RED
          : k % 2 === 0
            ? CRANE_GOLD
            : CRANE_YELLOW,
    });
  }
  // 4 dark-steel counterweight blocks directly under right jib tail
  for (let k = 0; k < 4; k++) {
    pts.push({
      x: 1.74 + (k % 2) * 0.22,
      y: 1.22 + Math.floor(k / 2) * 0.20,
      z: -0.10,
      s: 0.205,
      c: k < 2 ? STEEL_DARK : CONCRETE_DEEP,
    });
  }
  return pts; // 16 + 18 + 4 = 38 exact
})();

// 16-cube Flatbed Delivery Truck in local truck coordinates (facing left: cab on left -X, flatbed on right +X)
const L5_TRUCK_16: VoxelSpec[] = [
  // 6 Cab cubes on left (-0.38 .. -0.20)
  { x: -0.38, y: -1.22, z: 0.36, s: 0.17, c: CRANE_ORANGE },
  { x: -0.38, y: -1.22, z: 0.18, s: 0.17, c: CRANE_ORANGE },
  { x: -0.20, y: -1.22, z: 0.36, s: 0.17, c: SAFETY_RED },
  { x: -0.20, y: -1.22, z: 0.18, s: 0.17, c: SAFETY_RED },
  { x: -0.36, y: -1.04, z: 0.36, s: 0.165, c: GLASS_ICE }, // windshield
  { x: -0.36, y: -1.04, z: 0.18, s: 0.165, c: GLASS_ICE },
  // 6 Flatbed trailer deck cubes (+0.00 .. +0.36) where the 2x2x2 module sits at x = +0.18
  { x: 0.00, y: -1.24, z: 0.36, s: 0.165, c: STEEL_SLATE },
  { x: 0.00, y: -1.24, z: 0.18, s: 0.165, c: STEEL_SLATE },
  { x: 0.18, y: -1.24, z: 0.36, s: 0.165, c: CONCRETE_MID },
  { x: 0.18, y: -1.24, z: 0.18, s: 0.165, c: CONCRETE_MID },
  { x: 0.36, y: -1.24, z: 0.36, s: 0.165, c: STEEL_SLATE },
  { x: 0.36, y: -1.24, z: 0.18, s: 0.165, c: STEEL_SLATE },
  // 4 Dark wheels underneath cab & trailer
  { x: -0.30, y: -1.39, z: 0.38, s: 0.145, c: STEEL_DARK },
  { x: -0.30, y: -1.39, z: 0.16, s: 0.145, c: STEEL_DARK },
  { x: 0.26, y: -1.39, z: 0.38, s: 0.145, c: STEEL_DARK },
  { x: 0.26, y: -1.39, z: 0.16, s: 0.145, c: STEEL_DARK },
];

/** Helper to render an 8-cube 2x2x2 concrete-and-glass prefab module around (cx, cy, cz). */
function getModuleCube8(
  k: number,
  cx: number,
  cy: number,
  cz: number,
  halfSpan = 0.125,
  cubeScale = 0.20,
): VoxelSpec {
  const mx = (k & 1 ? 1 : -1) * halfSpan;
  const my = (k & 2 ? 1 : -1) * halfSpan;
  const mz = (k & 4 ? 1 : -1) * halfSpan;
  const isTop = Boolean(k & 2);
  const isFront = Boolean(k & 4);
  const c = isTop
    ? isFront
      ? GLASS_BRIGHT
      : CONCRETE_LIGHT
    : isFront
      ? GLASS_CYAN
      : CONCRETE_MID;
  return {
    x: cx + mx,
    y: cy + my,
    z: cz + mz,
    s: cubeScale,
    c,
  };
}

export const VARIANTS_H2: Record<string, VariantEvaluator> = {
  // ==========================================================================
  // 1. LEVEL 1 (Simplest): Recolored & De-Clipped Crane + Concrete/Glass Building
  // ==========================================================================
  "h2-crane-recolored": {
    hero(idx, _cnt, t) {
      const rotY = -0.34 + Math.sin(t * 0.22) * 0.14;
      const rotX = 0.20;

      if (idx < 60) {
        const p = L1_BUILDING_60[idx];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 102) {
        const p = L1_CRANE_42[idx - 60];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      // 18 cubes: Trolley (2) + Silver Cable (8) + 2x2x2 Glass/Concrete Module (8)
      // Building roof top is at y = -0.12 + 0.12 = 0.00.
      // Module center hovers between y = +0.46 and y = +0.74 (bottom at +0.23..+0.51 -> zero clipping!)
      const j = idx - 102;
      const trolleyX = -0.94 + Math.sin(t * 0.65) * 0.30;
      const drop = Math.sin(t * 1.1) * 0.5 + 0.5; // 0..1
      const modY = 0.74 - drop * 0.28; // +0.46 .. +0.74

      if (j < 2) {
        const tx = trolleyX + (j === 0 ? -0.11 : 0.11);
        const [x, y, z] = rotateYX(tx, 1.38, 0, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          0.165,
          j === 0 ? CRANE_ORANGE : STEEL_DARK,
        );
      }

      if (j < 10) {
        const seg = j - 2; // 0..7
        const topY = 1.28;
        const botY = modY + 0.22;
        const cy = lerp(topY, botY, seg / 7);
        const isHook = seg === 7;
        const [x, y, z] = rotateYX(trolleyX, cy, 0, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          isHook ? 0.15 : 0.085,
          isHook ? CRANE_ORANGE : CABLE_SILVER,
        );
      }

      const mod = getModuleCube8(j - 10, trolleyX, modY, 0, 0.125, 0.205);
      const [x, y, z] = rotateYX(mod.x, mod.y, mod.z, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, mod.s, mod.c);
    },
    mini(idx, cnt, t, boost, sc) {
      return evaluateH2Mini(idx, cnt, t, boost, sc);
    },
  },

  // ==========================================================================
  // 2. LEVEL 2 (Medium-Simple): 3D Slewing Hammerhead Crane with Cab & A-Frame Apex
  // ==========================================================================
  "h2-crane-slewing-jib": {
    hero(idx, _cnt, t) {
      const rotY = -0.34 + Math.sin(t * 0.2) * 0.14;
      const rotX = 0.21;
      // Smooth 3D slewing angle of the upper crane & jib around mast axis (x = 1.24, z = 0)
      const slewAngle = Math.sin(t * 0.75) * 0.22;

      if (idx < 56) {
        const p = L2_BUILDING_56[idx];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 80) {
        const p = L2_CRANE_STATIC_24[idx - 56];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 102) {
        const p = L2_CRANE_SLEW_22[idx - 80];
        const [sx, sy, sz] = rotateYX(p.x, p.y, p.z, slewAngle, 0);
        const [x, y, z] = rotateYX(1.24 + sx, sy, sz, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY + slewAngle, 0, p.s, p.c);
      }

      // 18 cubes: Trolley (2) + Cable/Hook (8) + 2x2x2 Glass Penthouse Pod (8)
      // Slewing together with the crane jib and lowering smoothly above the rooftop curb (y = -0.14)
      const j = idx - 102;
      const localRadius = -2.18 + Math.sin(t * 0.9) * 0.14;
      const drop = Math.sin(t * 1.25) * 0.5 + 0.5;
      const modY = 0.68 - drop * 0.26; // +0.42 .. +0.68 (well above y = -0.14!)

      if (j < 2) {
        const lx = localRadius + (j === 0 ? -0.11 : 0.11);
        const [sx, sy, sz] = rotateYX(lx, 1.36, 0, slewAngle, 0);
        const [x, y, z] = rotateYX(1.24 + sx, sy, sz, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY + slewAngle,
          0,
          0.16,
          j === 0 ? CRANE_ORANGE : STEEL_DARK,
        );
      }

      if (j < 10) {
        const seg = j - 2; // 0..7
        const cy = lerp(1.26, modY + 0.22, seg / 7);
        const isHook = seg >= 6;
        const [sx, sy, sz] = rotateYX(localRadius, cy, 0, slewAngle, 0);
        const [x, y, z] = rotateYX(1.24 + sx, sy, sz, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY + slewAngle,
          0,
          isHook ? 0.15 : 0.085,
          isHook ? CRANE_ORANGE : CABLE_SILVER,
        );
      }

      const mod = getModuleCube8(j - 10, localRadius, modY, 0, 0.125, 0.205);
      const [sx, sy, sz] = rotateYX(mod.x, mod.y, mod.z, slewAngle, 0);
      const [x, y, z] = rotateYX(1.24 + sx, sy, sz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY + slewAngle, 0, mod.s, mod.c);
    },
    mini(idx, cnt, t, boost, sc) {
      return evaluateH2Mini(idx, cnt, t, boost, sc);
    },
  },

  // ==========================================================================
  // 3. LEVEL 3 (Happy Medium): Ground Pickup -> Hoist -> Swing -> Deep Building Drop-Off Loop
  // ==========================================================================
  "h2-crane-pick-and-place": {
    hero(idx, _cnt, t) {
      const rotY = -0.32 + Math.sin(t * 0.18) * 0.12;
      const rotX = 0.20;

      if (idx < 52) {
        const p = L3_BUILDING_52[idx];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 60) {
        const p = L3_PAD_8[idx - 52];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 100) {
        const p = L3_CRANE_40[idx - 60];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      // 4-phase Pick-and-Place Loop (period = 7.4s)
      const period = 7.4;
      const tShift = t + 0.65;
      const cycle = (((tShift % period) + period) % period) / period; // 0..1
      const padX = 0.18;
      const padModY = -1.04;
      const highModY = 0.64;
      const roofX = -1.04;
      // Drop >2x further than before (from +0.64 all the way down to -0.52 right inside the hollow building!)
      const insideBuildingModY = -0.52;

      let trolleyX = padX;
      let hookY = highModY + 0.22;
      let modX = padX;
      let modY = padModY;
      let modScale = 0.20;

      if (cycle < 0.22) {
        // Phase 1 (0.00..0.22): Lift module from ground staging pad up to safe traverse height
        const u = smoothstep01(cycle / 0.22);
        trolleyX = padX;
        modX = padX;
        modY = lerp(padModY, highModY, u);
        hookY = modY + 0.22;
        modScale = 0.20;
      } else if (cycle < 0.44) {
        // Phase 2 (0.22..0.44): Trolley traverses left from ground pad (x=+0.18) to building shaft (x=-1.04)
        const u = smoothstep01((cycle - 0.22) / 0.22);
        trolleyX = lerp(padX, roofX, u);
        modX = trolleyX;
        modY = highModY + Math.sin(u * Math.PI) * 0.06;
        hookY = modY + 0.22;
        modScale = 0.20;
      } else if (cycle < 0.66) {
        // Phase 3 (0.44..0.66): Lower module deep down INTO the hollow building (y = +0.64 -> -0.52!)
        const u = smoothstep01((cycle - 0.44) / 0.22);
        trolleyX = roofX;
        modX = roofX;
        modY = lerp(highModY, insideBuildingModY, u);
        hookY = modY + 0.22;
        modScale = 0.20;
      } else {
        // Phase 4 (0.66..1.00): Empty hook retracts & returns to ground pad while module:
        //   4a (0.66..0.73): shrinks to 0.0001 strictly IN PLACE inside the building (modX = roofX, modY = insideBuildingModY)
        //   4b (0.73..0.77): holds at 0.0001 in place inside the building so damped scale reaches ~0
        //   4c (0.77..0.87): teleports to ground pad (modX = padX, modY = padModY) WHILE remaining 100% invisible (scale = 0.0001) for 0.74s so damped position finishes moving unseen!
        //   4d (0.87..0.98): grows from 0.0001 back to 0.20 strictly IN PLACE on the ground pickup pad!
        //   4e (0.98..1.00): sits at full 0.20 scale on the ground pad as the hook arrives to pick it up
        const u = (cycle - 0.66) / 0.34; // 0..1 across Phase 4
        if (u < 0.28) {
          // Retract empty hook straight up out of the building first
          trolleyX = roofX;
          hookY = lerp(insideBuildingModY + 0.22, 1.04, smoothstep01(u / 0.28));
        } else if (u < 0.68) {
          // Traverse empty trolley back to ground pickup pad
          trolleyX = lerp(roofX, padX, smoothstep01((u - 0.28) / 0.40));
          hookY = 1.04;
        } else {
          // Lower empty hook onto the newly grown module on the ground pad
          trolleyX = padX;
          hookY = lerp(1.04, padModY + 0.22, smoothstep01((u - 0.68) / 0.32));
        }

        if (cycle < 0.73) {
          // Shrink in place inside building
          const shrinkU = smoothstep01((cycle - 0.66) / 0.07);
          modX = roofX;
          modY = insideBuildingModY;
          modScale = lerp(0.20, 0.0001, shrinkU);
        } else if (cycle < 0.77) {
          // Hold at 0.0001 in place inside building so damped scale finishes reaching 0
          modX = roofX;
          modY = insideBuildingModY;
          modScale = 0.0001;
        } else if (cycle < 0.87) {
          // Move to ground pickup point while 100% invisible (scale = 0.0001)
          modX = padX;
          modY = padModY;
          modScale = 0.0001;
        } else if (cycle < 0.98) {
          // Grow back to full size strictly in place on the ground pickup pad
          const growU = smoothstep01((cycle - 0.87) / 0.11);
          modX = padX;
          modY = padModY;
          modScale = lerp(0.0001, 0.20, growU);
        } else {
          modX = padX;
          modY = padModY;
          modScale = 0.20;
        }
      }

      const j = idx - 100; // 0..19 (2 trolley + 8 cable + 2 orange hook + 8 module = 20 cubes)
      if (j < 2) {
        const tx = trolleyX + (j === 0 ? -0.11 : 0.11);
        const [x, y, z] = rotateYX(tx, 1.40, 0, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          0.165,
          j === 0 ? CRANE_ORANGE : STEEL_DARK,
        );
      }

      if (j < 12) {
        const seg = j - 2; // 0..9 (8 cable segments + 2 orange hook cubes)
        const isHook = seg >= 8;
        const cy = isHook
          ? hookY + (seg === 8 ? 0.08 : 0.0)
          : lerp(1.30, hookY + 0.12, seg / 7);
        const [x, y, z] = rotateYX(trolleyX, cy, 0, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          isHook ? 0.155 : 0.09,
          isHook ? CRANE_ORANGE : CABLE_SILVER,
        );
      }

      const mod = getModuleCube8(j - 12, modX, modY, 0, 0.125, modScale);
      const [x, y, z] = rotateYX(mod.x, mod.y, mod.z, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, mod.s, mod.c);
    },
    mini(idx, cnt, t, boost, sc) {
      return evaluateH2Mini(idx, cnt, t, boost, sc);
    },
  },

  // ==========================================================================
  // 4. LEVEL 4 (Medium-Complex): Progressive Multi-Zone Penthouse Floor Assembler
  // ==========================================================================
  "h2-crane-floor-assembler": {
    hero(idx, _cnt, t) {
      const rotY = -0.33 + Math.sin(t * 0.19) * 0.13;
      const rotX = 0.21;

      if (idx < 48) {
        const p = L4_BASE_BUILDING_48[idx];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 54) {
        const p = L4_PALLET_6[idx - 48];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 94) {
        const p = L3_CRANE_40[idx - 54];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      // Alternating West Bay (x = -1.25) and East Bay (x = -0.83) penthouse assembly
      const fullPeriod = 12.0;
      const halfPeriod = 6.0;
      const tShift = t + 1.05;
      const wrapped = ((tShift % fullPeriod) + fullPeriod) % fullPeriod;
      const activeIsEast = wrapped < halfPeriod;
      const cycle = (wrapped % halfPeriod) / halfPeriod; // 0..1

      const westBayX = -1.25;
      const eastBayX = -0.83;
      const stationaryBayX = activeIsEast ? westBayX : eastBayX;
      const targetBayX = activeIsEast ? eastBayX : westBayX;
      const roofDeckY = -0.06; // Flush above Floor 3 (y = -0.48), zero clipping!

      // 8 cubes (idx 94..101): Completed stationary penthouse bay already sitting on the roof
      if (idx < 102) {
        const mod = getModuleCube8(
          idx - 94,
          stationaryBayX,
          roofDeckY,
          0,
          0.11,
          0.19,
        );
        const [x, y, z] = rotateYX(mod.x, mod.y, mod.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, mod.s, mod.c);
      }

      // 18 cubes (idx 102..119): Trolley (2) + Cable/Hook (8) + Active Penthouse Bay Module (8)
      const palletX = 0.20;
      const palletY = -1.04;
      const carryY = 0.64;

      let trolleyX = palletX;
      let hookY = carryY + 0.22;
      let modX = palletX;
      let modY = palletY;
      let modScale = 0.19;

      if (cycle < 0.22) {
        const u = smoothstep01(cycle / 0.22);
        trolleyX = palletX;
        modX = palletX;
        modY = lerp(palletY, carryY, u);
        hookY = modY + 0.21;
      } else if (cycle < 0.46) {
        const u = smoothstep01((cycle - 0.22) / 0.24);
        trolleyX = lerp(palletX, targetBayX, u);
        modX = trolleyX;
        modY = carryY;
        hookY = modY + 0.21;
      } else if (cycle < 0.68) {
        const u = smoothstep01((cycle - 0.46) / 0.22);
        trolleyX = targetBayX;
        modX = targetBayX;
        modY = lerp(carryY, roofDeckY, u);
        hookY = modY + 0.21;
      } else {
        const u = (cycle - 0.68) / 0.32;
        trolleyX = lerp(targetBayX, palletX, smoothstep01(u));
        hookY =
          u < 0.5
            ? lerp(roofDeckY + 0.21, 1.04, smoothstep01(u * 2))
            : lerp(1.04, palletY + 0.21, smoothstep01((u - 0.5) * 2));
        if (cycle < 0.74) {
          modX = targetBayX;
          modY = roofDeckY;
          modScale = lerp(0.19, 0.0001, smoothstep01((cycle - 0.68) / 0.06));
        } else if (cycle < 0.78) {
          modX = targetBayX;
          modY = roofDeckY;
          modScale = 0.0001;
        } else if (cycle < 0.88) {
          modX = palletX;
          modY = palletY;
          modScale = 0.0001;
        } else {
          modX = palletX;
          modY = palletY;
          modScale = lerp(0.0001, 0.19, smoothstep01((cycle - 0.88) / 0.10));
        }
      }

      const j = idx - 102;
      if (j < 2) {
        const tx = trolleyX + (j === 0 ? -0.11 : 0.11);
        const [x, y, z] = rotateYX(tx, 1.40, 0, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          0.165,
          j === 0 ? CRANE_ORANGE : STEEL_DARK,
        );
      }

      if (j < 10) {
        const seg = j - 2; // 0..7
        const isHook = seg >= 6;
        const cy = isHook
          ? hookY + (seg === 6 ? 0.08 : 0.0)
          : lerp(1.30, hookY + 0.12, seg / 5);
        const [x, y, z] = rotateYX(trolleyX, cy, 0, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          isHook ? 0.155 : 0.085,
          isHook ? CRANE_ORANGE : CABLE_SILVER,
        );
      }

      const mod = getModuleCube8(j - 10, modX, modY, 0, 0.11, modScale);
      const [x, y, z] = rotateYX(mod.x, mod.y, mod.z, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, mod.s, mod.c);
    },
    mini(idx, cnt, t, boost, sc) {
      return evaluateH2Mini(idx, cnt, t, boost, sc);
    },
  },

  // ==========================================================================
  // 5. LEVEL 5 (Most Innovative & Complex): Flatbed Delivery Truck + Crane + Building Loop
  // ==========================================================================
  "h2-crane-truck-delivery": {
    hero(idx, _cnt, t) {
      const rotY = -0.30 + Math.sin(t * 0.18) * 0.12;
      const rotX = 0.21;

      if (idx < 44) {
        const p = L5_BUILDING_44[idx];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      if (idx < 82) {
        const p = L5_CRANE_38[idx - 44];
        const [x, y, z] = rotateYX(p.x, p.y, p.z, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, p.s, p.c);
      }

      // 8-second choreographed Truck Delivery -> Crane Hoist -> Roof Placement Loop!
      const tShift = t + 1.35;
      const cycle = (((tShift % 8.0) + 8.0) % 8.0) / 8.0; // 0..1
      const pickupX = 0.26;
      const truckBedModY = -0.94;
      const truckModZ = 0.27;
      const highModY = 0.64;
      const roofX = -1.28;
      const roofModY = 0.06; // Flush above top story (y = -0.48), zero clipping!
      const roofModZ = -0.10;

      let truckOffsetX = 0;
      let truckScaleMult = 1;
      let trolleyX = pickupX + 0.18;
      let trolleyZ = truckModZ;
      let hookY = 0.72;
      let modX = pickupX + 0.18;
      let modY = truckBedModY;
      let modZ = truckModZ;

      if (cycle < 0.20) {
        // Stage 1: Flatbed truck drives in from right (+1.45 -> 0) carrying the module;
        // crane hook lowers over the pickup zone to meet it.
        const u = smoothstep01(cycle / 0.20);
        truckOffsetX = lerp(1.45, 0, u);
        trolleyX = pickupX + 0.18;
        trolleyZ = lerp(-0.10, truckModZ, u);
        hookY = lerp(0.85, truckBedModY + 0.24, u);
        modX = pickupX + 0.18 + truckOffsetX;
        modY = truckBedModY;
        modZ = truckModZ;
      } else if (cycle < 0.42) {
        // Stage 2: Truck is parked at pickup zone; crane hoists the module straight up off the flatbed!
        const u = smoothstep01((cycle - 0.20) / 0.22);
        truckOffsetX = 0;
        trolleyX = pickupX + 0.18;
        trolleyZ = lerp(truckModZ, -0.10, u);
        modX = trolleyX;
        modY = lerp(truckBedModY, highModY, u);
        modZ = trolleyZ;
        hookY = modY + 0.22;
      } else if (cycle < 0.74) {
        // Stage 3: Empty flatbed truck drives away to the left while the crane swings the
        // module over the building and lowers it cleanly onto the roof deck!
        const u = smoothstep01((cycle - 0.42) / 0.32);
        truckOffsetX = lerp(0, -1.85, u);
        truckScaleMult = u > 0.75 ? 1 - smoothstep01((u - 0.75) / 0.25) * 0.65 : 1;

        const travU = smoothstep01(Math.min(1, u / 0.55));
        const dropU = u > 0.48 ? smoothstep01((u - 0.48) / 0.52) : 0;
        trolleyX = lerp(pickupX + 0.18, roofX, travU);
        trolleyZ = roofModZ;
        modX = trolleyX;
        modY = lerp(highModY, roofModY, dropU);
        modZ = roofModZ;
        hookY = modY + 0.22;
      } else {
        // Stage 4: Module sits completed on the building roof while the crane retracts its
        // hook and returns to the pickup zone as the next truck prepares to enter from the right!
        const u = smoothstep01((cycle - 0.74) / 0.26);
        truckOffsetX = 1.45;
        truckScaleMult = smoothstep01(u);
        trolleyX = lerp(roofX, pickupX + 0.18, u);
        trolleyZ = -0.10;
        hookY = lerp(roofModY + 0.22, 0.85, smoothstep01(Math.min(1, u * 1.6)));
        modX = roofX;
        modY = roofModY;
        modZ = roofModZ;
      }

      // 16 cubes (idx 82..97): Animated Flatbed Delivery Truck
      if (idx < 98) {
        const tp = L5_TRUCK_16[idx - 82];
        const [x, y, z] = rotateYX(
          pickupX + tp.x + truckOffsetX,
          tp.y,
          tp.z,
          rotY,
          rotX,
        );
        return makeTarget(x, y, z, rotX, rotY, 0, tp.s * truckScaleMult, tp.c);
      }

      // 14 cubes (idx 98..111): Trolley (2) + Dense Silver Cable (10) + Orange Hook Block (2)
      if (idx < 112) {
        const j = idx - 98; // 0..13
        if (j < 2) {
          const tx = trolleyX + (j === 0 ? -0.11 : 0.11);
          const [x, y, z] = rotateYX(tx, 1.42, -0.10, rotY, rotX);
          return makeTarget(
            x,
            y,
            z,
            rotX,
            rotY,
            0,
            0.165,
            j === 0 ? CRANE_ORANGE : STEEL_DARK,
          );
        }
        const seg = j - 2; // 0..11 (10 cable segments + 2 orange hook cubes)
        const isHook = seg >= 10;
        const cy = isHook
          ? hookY + (seg === 10 ? 0.08 : 0.0)
          : lerp(1.32, hookY + 0.12, seg / 9);
        const cz = lerp(-0.10, trolleyZ, isHook ? 1 : seg / 9);
        const [x, y, z] = rotateYX(trolleyX, cy, cz, rotY, rotX);
        return makeTarget(
          x,
          y,
          z,
          rotX,
          rotY,
          0,
          isHook ? 0.155 : 0.095,
          isHook ? CRANE_ORANGE : CABLE_SILVER,
        );
      }

      // 8 cubes (idx 112..119): Prefab Concrete & Glass Module (rides flatbed -> crane -> building roof!)
      const mod = getModuleCube8(idx - 112, modX, modY, modZ, 0.115, 0.195);
      const [x, y, z] = rotateYX(mod.x, mod.y, mod.z, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, mod.s, mod.c);
    },
    mini(idx, cnt, t, boost, sc) {
      return evaluateH2Mini(idx, cnt, t, boost, sc);
    },
  },
};
