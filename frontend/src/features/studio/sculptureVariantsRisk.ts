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

// High-contrast jewel palette tuned for light lavender (#f5f0ff) studio backdrop
const INDIGO = "#26204c";
const NAVY = "#344b8c";
const COBALT = "#2d6ae0";
const EMERALD = "#16b886";
const EMERALD_BRIGHT = "#34d9a2";
const TEAL = "#13856b";
const RUBY = "#d63055";
const ROSE = "#f05b7d";
const GOLD = "#f5b83d";
const AMBER = "#d98d1a";
const SLATE_SCREEN = "#1b213b";
const STEEL = "#64749c";
const SILVER = "#98a8c7";
const ICE = "#dce6fa";
const WHITE = "#ffffff";

type VoxelSpec = {
  x: number;
  y: number;
  z: number;
  s: number;
  c: string;
  tag?: string;
};

// ============================================================================
// 1. CANDLESTICK BREAKOUT — 120 non-overlapping cubes
//    L-frame chart plinth (26) + 5 3D candles (57) + Golden breakout arrow (27)
//    + Bottom volume histogram ticks (10) = 120 exact
// ============================================================================
const CANDLESTICK_120: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];

  // 1a. L-frame chart axes & depth feet (26 cubes)
  for (let i = 0; i < 11; i++) {
    pts.push({ x: -1.35 + i * 0.27, y: -1.16, z: 0, s: 0.23, c: i % 2 === 0 ? INDIGO : NAVY, tag: "axis" });
  }
  for (let j = 0; j < 10; j++) {
    pts.push({ x: -1.35, y: -0.89 + j * 0.27, z: 0, s: 0.23, c: j % 2 === 0 ? INDIGO : NAVY, tag: "axis" });
  }
  for (const fx of [-1.35, -0.68, 0, 0.68, 1.35]) {
    pts.push({ x: fx, y: -1.16, z: 0.24, s: 0.20, c: NAVY, tag: "axis" });
  }

  // 1b. 5 bold 3D candlesticks (2-deep bodies + slim centered wicks = 57 cubes)
  const candles: Array<{ x: number; bodyYs: number[]; upWicks: number[]; dnWicks: number[]; bull: boolean }> = [
    { x: -0.96, bodyYs: [-0.66, -0.42, -0.18, 0.06], upWicks: [0.28], dnWicks: [-0.88], bull: true },
    { x: -0.44, bodyYs: [-0.46, -0.22, 0.02, 0.26], upWicks: [0.48], dnWicks: [-0.68], bull: false },
    { x: 0.08, bodyYs: [-0.26, -0.02, 0.22, 0.46, 0.70], upWicks: [0.92, 1.08], dnWicks: [-0.48], bull: true },
    { x: 0.60, bodyYs: [0.06, 0.30, 0.54, 0.78], upWicks: [1.00], dnWicks: [-0.16], bull: false },
    { x: 1.12, bodyYs: [0.16, 0.40, 0.64, 0.88, 1.12, 1.36], upWicks: [1.58], dnWicks: [-0.06], bull: true },
  ];
  candles.forEach((cd, ci) => {
    const mainC = cd.bull ? EMERALD : RUBY;
    const hiC = cd.bull ? EMERALD_BRIGHT : ROSE;
    const wickC = cd.bull ? TEAL : "#9e1c3a";
    cd.bodyYs.forEach((by, bi) => {
      const col = bi === cd.bodyYs.length - 1 ? hiC : mainC;
      pts.push({ x: cd.x, y: by, z: 0.125, s: 0.235, c: col, tag: `c${ci}` });
      pts.push({ x: cd.x, y: by, z: -0.125, s: 0.235, c: mainC, tag: `c${ci}` });
    });
    for (const wy of cd.upWicks) pts.push({ x: cd.x, y: wy, z: 0, s: 0.12, c: wickC, tag: `c${ci}` });
    for (const wy of cd.dnWicks) pts.push({ x: cd.x, y: wy, z: 0, s: 0.12, c: wickC, tag: `c${ci}` });
  });

  // 1c. Golden Rising Breakout Trend Arrow hovering cleanly in front (27 cubes: 15 shaft + 12 3D head)
  for (let k = 0; k < 15; k++) {
    const u = k / 14;
    const ax = -1.04 + u * 2.12;
    const ay = 0.26 + u * 1.34 + Math.sin(u * Math.PI) * 0.10;
    pts.push({ x: ax, y: ay, z: 0.38, s: 0.165, c: k % 4 === 0 ? AMBER : GOLD, tag: "arrow" });
  }
  const headPts: Array<[number, number, string]> = [
    [1.26, 1.72, WHITE],
    [1.06, 1.72, GOLD],
    [0.86, 1.70, GOLD],
    [1.24, 1.52, GOLD],
    [1.22, 1.32, GOLD],
    [1.08, 1.58, WHITE],
  ];
  for (const [hx, hy, hc] of headPts) {
    pts.push({ x: hx, y: hy, z: 0.44, s: 0.19, c: hc, tag: "arrow" });
    pts.push({ x: hx, y: hy, z: 0.26, s: 0.18, c: GOLD, tag: "arrow" });
  }

  // 1d. Volume histogram ticks along bottom rear (10 cubes = 5 pairs)
  candles.forEach((cd, ci) => {
    const vc = cd.bull ? TEAL : "#a32849";
    pts.push({ x: cd.x, y: -0.96, z: -0.28, s: 0.15, c: vc, tag: "vol" });
    pts.push({ x: cd.x, y: -0.80, z: -0.28, s: 0.135, c: ci === 4 ? GOLD : vc, tag: "vol" });
  });

  return pts; // 26 + 57 + 27 + 10 = 120 exact
})();

// ============================================================================
// 2. BULL VS BEAR BALANCE SCALE — 120 non-overlapping cubes
//    Pedestal (22) + Golden Pillar & Finial (18) + Tilting Beam (16)
//    + Left Emerald Bull Pan (32) + Right Ruby Bear Pan (32) = 120 exact
// ============================================================================
const SCALE_STATIC_40: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  // 2a. Pedestal base (22 cubes)
  for (let gx = -1; gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      pts.push({ x: gx * 0.30, y: -1.26, z: gz * 0.30, s: 0.27, c: INDIGO });
    }
  }
  for (const [cx, cz] of [[-0.56, 0], [0.56, 0], [0, -0.56], [0, 0.56]]) {
    pts.push({ x: cx, y: -1.26, z: cz, s: 0.23, c: NAVY });
  }
  pts.push(
    { x: 0, y: -1.00, z: 0, s: 0.26, c: COBALT },
    { x: -0.25, y: -1.00, z: 0, s: 0.23, c: INDIGO },
    { x: 0.25, y: -1.00, z: 0, s: 0.23, c: INDIGO },
    { x: 0, y: -1.00, z: -0.25, s: 0.23, c: INDIGO },
    { x: 0, y: -1.00, z: 0.25, s: 0.23, c: INDIGO },
  );
  for (const [gx, gz] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]]) {
    pts.push({ x: gx, y: -1.06, z: gz, s: 0.14, c: GOLD });
  }

  // 2b. Golden central pillar & diamond apex finial (18 cubes)
  for (let k = 0; k < 6; k++) {
    pts.push({ x: 0, y: -0.74 + k * 0.26, z: 0, s: 0.23, c: k % 2 === 0 ? AMBER : GOLD });
  }
  // Collar accents around mid-pillar (4)
  pts.push(
    { x: -0.20, y: -0.48, z: 0, s: 0.16, c: GOLD },
    { x: 0.20, y: -0.48, z: 0, s: 0.16, c: GOLD },
    { x: 0, y: -0.48, z: -0.20, s: 0.16, c: GOLD },
    { x: 0, y: -0.48, z: 0.20, s: 0.16, c: GOLD },
  );
  // Fulcrum crossbar hub (4)
  pts.push(
    { x: 0, y: 0.72, z: 0, s: 0.25, c: INDIGO },
    { x: 0, y: 0.72, z: 0.22, s: 0.18, c: GOLD },
    { x: 0, y: 0.72, z: -0.22, s: 0.18, c: GOLD },
    { x: 0, y: 0.94, z: 0, s: 0.22, c: GOLD },
  );
  // Gleaming diamond apex finial (4)
  pts.push(
    { x: 0, y: 1.18, z: 0, s: 0.21, c: WHITE },
    { x: -0.18, y: 1.04, z: 0, s: 0.15, c: GOLD },
    { x: 0.18, y: 1.04, z: 0, s: 0.15, c: GOLD },
    { x: 0, y: 1.38, z: 0, s: 0.14, c: GOLD },
  );

  return pts; // 22 + 18 = 40 exact
})();

function buildScalePanPoints(isBull: boolean): VoxelSpec[] {
  const pts: VoxelSpec[] = [];
  // 8 crisp visible angled suspension chain links descending from beam tip (0,0) to pan rim (y = -1.04)
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? -1 : 1;
    for (let k = 0; k < 4; k++) {
      const u = (k + 1) / 4.2;
      pts.push({
        x: sx * u * 0.48,
        y: -u * 1.04,
        z: 0.08,
        s: 0.12,
        c: k % 2 === 0 ? GOLD : AMBER,
      });
    }
  }
  // 12 solid circular/octagonal pan bowl cubes at y = -1.08
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    pts.push({
      x: Math.cos(a) * 0.44,
      y: -1.08,
      z: Math.sin(a) * 0.44,
      s: 0.195,
      c: k % 2 === 0 ? INDIGO : NAVY,
    });
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI * 0.25;
    pts.push({
      x: Math.cos(a) * 0.18,
      y: -1.14,
      z: Math.sin(a) * 0.18,
      s: 0.20,
      c: SILVER,
    });
  }
  // 12 stacked vibrant gain/risk payload blocks sitting cleanly IN the pan with clear chain airspace above!
  if (isBull) {
    const cols: Array<[number, number, number]> = [
      [-0.22, 0, 2],
      [0, 0, 3],
      [0.22, 0, 4],
    ];
    for (const [cx, cz, h] of cols) {
      for (let r = 0; r < h; r++) {
        pts.push({
          x: cx,
          y: -0.90 + r * 0.20,
          z: cz,
          s: 0.19,
          c: r === h - 1 ? EMERALD_BRIGHT : EMERALD,
        });
      }
    }
    pts.push(
      { x: 0, y: -0.90, z: 0.20, s: 0.175, c: TEAL },
      { x: 0.22, y: -0.90, z: 0.20, s: 0.175, c: EMERALD },
      { x: 0.22, y: -0.70, z: 0.20, s: 0.175, c: WHITE },
    );
  } else {
    const cols: Array<[number, number, number]> = [
      [-0.22, 0, 4],
      [0, 0, 3],
      [0.22, 0, 2],
    ];
    for (const [cx, cz, h] of cols) {
      for (let r = 0; r < h; r++) {
        pts.push({
          x: cx,
          y: -0.90 + r * 0.20,
          z: cz,
          s: 0.19,
          c: r === h - 1 ? ROSE : RUBY,
        });
      }
    }
    pts.push(
      { x: -0.22, y: -0.90, z: 0.20, s: 0.175, c: RUBY },
      { x: -0.22, y: -0.70, z: 0.20, s: 0.175, c: ROSE },
      { x: 0, y: -0.90, z: 0.20, s: 0.175, c: "#9e1c3a" },
    );
  }
  return pts; // 8 + 12 + 12 = 32 exact
}

const SCALE_LEFT_PAN_32 = buildScalePanPoints(true);
const SCALE_RIGHT_PAN_32 = buildScalePanPoints(false);

// ============================================================================
// 3. QUANT TERMINAL MONITOR — 120 non-overlapping cubes
//    Bezel (30) + Dark Screen Backplate (40) + Neck & Stand (10)
//    + 4 Live Candles (24) + Gold MA Line (4) + Pop-Out Breakout Arrow (12) = 120
// ============================================================================
const MONITOR_120: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  const p = 0.255;

  // 3a. Outer widescreen monitor bezel: 10 wide (-4.5..4.5) x 7 tall (-2.5..3.5) = 30 cubes
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 10; c++) {
      const isEdge = r === 0 || r === 6 || c === 0 || c === 9;
      if (!isEdge) continue;
      const x = (c - 4.5) * p;
      const y = (r - 2.2) * p;
      const isBottomChin = r === 0 && (c === 4 || c === 5);
      pts.push({
        x,
        y,
        z: 0.12,
        s: 0.242,
        c: isBottomChin ? COBALT : r === 0 ? NAVY : INDIGO,
        tag: "frame",
      });
    }
  }

  // 3b. Solid recessed dark-mode screen backplate: 8 wide x 5 tall = 40 cubes
  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 8; c++) {
      pts.push({
        x: (c - 4.5) * p,
        y: (r - 2.2) * p,
        z: -0.09,
        s: 0.252,
        c: SLATE_SCREEN,
        tag: "screen",
      });
    }
  }

  // 3c. Monitor neck (3) + wide desk stand foot (7) = 10 cubes
  pts.push(
    { x: 0, y: -0.82, z: -0.02, s: 0.22, c: SILVER, tag: "stand" },
    { x: 0, y: -1.05, z: -0.04, s: 0.22, c: STEEL, tag: "stand" },
    { x: 0, y: -1.26, z: -0.02, s: 0.22, c: NAVY, tag: "stand" },
  );
  for (let c = -3; c <= 3; c++) {
    pts.push({
      x: c * 0.245,
      y: -1.44,
      z: 0.08,
      s: 0.225,
      c: Math.abs(c) === 3 ? NAVY : INDIGO,
      tag: "stand",
    });
  }

  // 3d. 4 vivid 3D candlesticks protruding right off the dark screen (24 cubes)
  const screenCandles: Array<{ x: number; ys: number[]; up: number; dn: number; bull: boolean }> = [
    { x: -0.74, ys: [-0.22, 0.0, 0.22], up: 0.40, dn: -0.40, bull: true }, // 5
    { x: -0.25, ys: [-0.04, 0.18, 0.40], up: 0.58, dn: -0.22, bull: false }, // 5
    { x: 0.24, ys: [-0.14, 0.08, 0.30, 0.52], up: 0.70, dn: -0.32, bull: true }, // 6
    { x: 0.73, ys: [0.02, 0.24, 0.46, 0.68, 0.90], up: 1.06, dn: -0.14, bull: true }, // 7 + 1 cap = 8
  ];
  screenCandles.forEach((sc, idx) => {
    const col = sc.bull ? EMERALD : RUBY;
    const hi = sc.bull ? EMERALD_BRIGHT : ROSE;
    sc.ys.forEach((cy, bi) => {
      pts.push({ x: sc.x, y: cy, z: 0.16, s: 0.21, c: bi === sc.ys.length - 1 ? hi : col, tag: `sc${idx}` });
    });
    pts.push({ x: sc.x, y: sc.up, z: 0.14, s: 0.11, c: hi, tag: `sc${idx}` });
    pts.push({ x: sc.x, y: sc.dn, z: 0.14, s: 0.11, c: col, tag: `sc${idx}` });
  });
  // Extra 3D depth cap on breakout candle 4 -> total 24
  pts.push({ x: 0.73, y: 0.90, z: 0.32, s: 0.18, c: WHITE, tag: "sc3" });

  // 3e. Glowing Golden Moving-Average Ribbon across screen (4 cubes)
  for (const [gx, gy] of [[-0.74, -0.05], [-0.25, 0.14], [0.24, 0.34], [0.73, 0.62]]) {
    pts.push({ x: gx, y: gy, z: 0.32, s: 0.125, c: GOLD, tag: "ma" });
  }

  // 3f. Pop-out Upper-Right Breakout Arrow `↗` bursting cleanly off monitor corner (12 cubes)
  const popPts: Array<[number, number, number, number, string]> = [
    [0.98, 1.08, 0.32, 0.17, GOLD],
    [1.16, 1.24, 0.34, 0.175, GOLD],
    [1.34, 1.40, 0.36, 0.185, EMERALD_BRIGHT],
    [1.52, 1.56, 0.38, 0.21, WHITE],
    // Upper wing
    [1.30, 1.58, 0.38, 0.19, GOLD],
    [1.10, 1.58, 0.36, 0.175, GOLD],
    // Right wing
    [1.54, 1.34, 0.38, 0.19, GOLD],
    [1.54, 1.14, 0.36, 0.175, GOLD],
    // Backing depth thickness on arrowhead (4)
    [1.52, 1.56, 0.20, 0.19, EMERALD],
    [1.30, 1.58, 0.20, 0.17, AMBER],
    [1.54, 1.34, 0.20, 0.17, AMBER],
    [1.34, 1.40, 0.20, 0.17, EMERALD],
  ];
  for (const [x, y, z, s, c] of popPts) {
    pts.push({ x, y, z, s, c, tag: "badge" });
  }

  return pts; // 30 + 40 + 10 + 24 + 4 + 12 = 120 exact
})();

// ============================================================================
// 4. WALL STREET CHARGING BULL — 120 non-overlapping cubes
//    Plinth (18) + 4 Muscular Legs (20) + Hunched Shoulders & Torso (46)
//    + Lowered Head & Snout (16) + Sweeping Golden Horns (14) + Tail (6) = 120
// ============================================================================
const CHARGING_BULL_120: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  const p = 0.23;

  // 4a. Solid Dark Ticker Plinth Base (9 wide x 2 deep = 18 cubes)
  for (let gx = -4; gx <= 4; gx++) {
    pts.push({ x: gx * 0.28, y: -1.10, z: 0.19, s: 0.255, c: gx === 0 ? COBALT : gx % 2 === 0 ? INDIGO : NAVY, tag: "plinth" });
    pts.push({ x: gx * 0.28, y: -1.10, z: -0.19, s: 0.255, c: gx % 2 === 0 ? NAVY : INDIGO, tag: "plinth" });
  }

  // 4b. 4 Planted Charging Legs (5 cubes each = 20 cubes)
  const legs: Array<Array<[number, number, number, string]>> = [
    // Front-left braced forward
    [[-0.68, -0.84, 0.26, INDIGO], [-0.62, -0.62, 0.26, TEAL], [-0.56, -0.40, 0.26, EMERALD], [-0.52, -0.18, 0.26, EMERALD], [-0.46, 0.04, 0.26, EMERALD]],
    // Front-right planted
    [[-0.34, -0.84, -0.26, INDIGO], [-0.36, -0.62, -0.26, TEAL], [-0.38, -0.40, -0.26, EMERALD], [-0.40, -0.18, -0.26, EMERALD], [-0.42, 0.04, -0.26, EMERALD]],
    // Rear-left driving
    [[0.62, -0.84, 0.24, INDIGO], [0.64, -0.62, 0.24, TEAL], [0.66, -0.40, 0.24, EMERALD], [0.66, -0.18, 0.24, EMERALD], [0.62, 0.04, 0.24, TEAL]],
    // Rear-right trailing
    [[0.94, -0.84, -0.24, INDIGO], [0.88, -0.62, -0.24, TEAL], [0.82, -0.40, -0.24, EMERALD], [0.76, -0.18, -0.24, EMERALD], [0.70, 0.04, -0.24, TEAL]],
  ];
  for (const leg of legs) {
    for (const [x, y, z, c] of leg) pts.push({ x, y, z, s: 0.215, c, tag: "leg" });
  }

  // 4c. Muscular Hunched Shoulders & Barrel Torso (46 cubes, zero overlap!)
  // Massive front shoulder hump (gx = -3..-1, gy = 0..3, 3 layers deep -> curated 28 cubes)
  const shoulderCells: Array<[number, number, number, string]> = [
    // Center spine z=0 (12)
    [-3, 0, 0, TEAL], [-2, 0, 0, EMERALD], [-1, 0, 0, EMERALD],
    [-3, 1, 0, EMERALD], [-2, 1, 0, EMERALD], [-1, 1, 0, EMERALD],
    [-3, 2, 0, EMERALD], [-2, 2, 0, EMERALD_BRIGHT], [-1, 2, 0, EMERALD_BRIGHT],
    [-2, 3, 0, EMERALD_BRIGHT], [-1, 3, 0, EMERALD_BRIGHT], [-3, 3, 0, EMERALD],
    // Front & back muscular flanks z=±1 (16)
    [-3, 1, 1, EMERALD], [-2, 1, 1, EMERALD], [-1, 1, 1, EMERALD], [-2, 2, 1, EMERALD_BRIGHT],
    [-1, 2, 1, EMERALD], [-2, 0, 1, TEAL], [-1, 0, 1, TEAL], [-3, 2, 1, EMERALD],
    [-3, 1, -1, TEAL], [-2, 1, -1, EMERALD], [-1, 1, -1, EMERALD], [-2, 2, -1, EMERALD],
    [-1, 2, -1, EMERALD], [-2, 0, -1, TEAL], [-1, 0, -1, TEAL], [-3, 2, -1, TEAL],
  ];
  // Mid barrel & hindquarters (gx = 0..3, gy = 0..2 -> 18 cubes)
  const hindCells: Array<[number, number, number, string]> = [
    [0, 0, 0, TEAL], [1, 0, 0, TEAL], [2, 0, 0, TEAL], [3, 0, 0, TEAL],
    [0, 1, 0, EMERALD], [1, 1, 0, EMERALD], [2, 1, 0, EMERALD], [3, 1, 0, EMERALD],
    [0, 2, 0, EMERALD_BRIGHT], [1, 2, 0, EMERALD], [2, 2, 0, EMERALD], [3, 2, 0, TEAL],
    [0, 1, 1, EMERALD], [1, 1, 1, EMERALD], [2, 1, 1, TEAL],
    [0, 1, -1, TEAL], [1, 1, -1, TEAL], [2, 1, -1, TEAL],
  ];
  for (const [gx, gy, gz, c] of [...shoulderCells, ...hindCells]) {
    pts.push({ x: gx * p + 0.08, y: gy * p + 0.06, z: gz * p, s: 0.235, c, tag: "body" });
  }

  // 4d. Lowered Charging Head, Glowing Eyes & Golden Nose-Ring (16 cubes)
  const headCells: Array<[number, number, number, number, string]> = [
    // Neck bridge
    [-0.86, 0.22, 0, 0.23, TEAL],
    [-0.86, 0.44, 0, 0.23, EMERALD],
    // Broad forehead & brow
    [-1.08, 0.34, 0, 0.235, EMERALD],
    [-1.08, 0.34, 0.20, 0.215, EMERALD_BRIGHT],
    [-1.08, 0.34, -0.20, 0.215, EMERALD],
    [-1.08, 0.12, 0, 0.235, TEAL],
    // Glowing golden eyes!
    [-1.16, 0.22, 0.21, 0.14, GOLD],
    [-1.16, 0.22, -0.21, 0.14, GOLD],
    // Forward lowered snout & muzzle
    [-1.28, 0.06, 0, 0.22, TEAL],
    [-1.28, 0.06, 0.17, 0.19, TEAL],
    [-1.28, 0.06, -0.17, 0.19, TEAL],
    [-1.28, -0.14, 0, 0.21, INDIGO],
    [-1.44, -0.14, 0, 0.20, INDIGO],
    [-1.44, -0.02, 0.12, 0.16, TEAL],
    [-1.44, -0.02, -0.12, 0.16, TEAL],
    // Signature Golden Nose-Ring!
    [-1.56, -0.24, 0, 0.16, GOLD],
  ];
  for (const [x, y, z, s, c] of headCells) pts.push({ x, y, z, s, c, tag: "head" });

  // 4e. Dramatic Curved Sweeping Golden Horns (7 per horn = 14 cubes!)
  for (const side of [1, -1]) {
    const hornSteps: Array<[number, number, number, number, string]> = [
      [-1.06, 0.50, side * 0.30, 0.17, AMBER],
      [-1.14, 0.58, side * 0.48, 0.175, GOLD],
      [-1.28, 0.66, side * 0.62, 0.175, GOLD],
      [-1.46, 0.78, side * 0.66, 0.17, GOLD],
      [-1.60, 0.94, side * 0.60, 0.16, GOLD],
      [-1.66, 1.12, side * 0.48, 0.15, WHITE],
      [-1.62, 1.28, side * 0.36, 0.135, WHITE],
    ];
    for (const [x, y, z, s, c] of hornSteps) pts.push({ x, y, z, s, c, tag: "horn" });
  }

  // 4f. Whipping Tail arched behind hindquarters (6 cubes)
  const tailSteps: Array<[number, number, number, number, string]> = [
    [0.98, 0.46, 0, 0.15, TEAL],
    [1.16, 0.58, 0.04, 0.145, EMERALD],
    [1.32, 0.72, 0.08, 0.14, EMERALD],
    [1.42, 0.88, 0.06, 0.135, EMERALD_BRIGHT],
    [1.46, 1.04, 0.02, 0.13, GOLD],
    [1.54, 1.14, -0.02, 0.14, GOLD],
  ];
  for (const [x, y, z, s, c] of tailSteps) pts.push({ x, y, z, s, c, tag: "tail" });

  return pts; // 18 + 20 + 46 + 16 + 14 + 6 = 120 exact
})();

// ============================================================================
// 5. QUANT RISK SHIELD + EQUITY BREAKOUT & OCO BRACKETS — 120 cubes
//    Armored Shield Rim (36) + 100% Solid Zero-Gap Inner Field (32)
//    + Rising Equity Arrow (28) + Emerald TP Cap (12) + Ruby SL Floor (12) = 120
// ============================================================================
const SHIELD_EQUITY_120: VoxelSpec[] = (() => {
  const pts: VoxelSpec[] = [];
  const p = 0.255;

  // Classic heater shield silhouette (9 wide gx=-4..4, 9 rows gy=-4..4)
  // Row half-widths: gy=4..0 -> hw=4; gy=-1 -> hw=3; gy=-2 -> hw=2; gy=-3 -> hw=1; gy=-4 -> hw=0
  const halfWidth = (gy: number) => (gy >= 0 ? 4 : Math.max(0, 4 + gy));
  const rimCells: Array<[number, number]> = [];
  const fillCells: Array<[number, number]> = [];
  for (let gy = -4; gy <= 4; gy++) {
    const hw = halfWidth(gy);
    for (let gx = -hw; gx <= hw; gx++) {
      const isBorder = gy === 4 || Math.abs(gx) === hw || gy === -4;
      if (isBorder) rimCells.push([gx, gy]);
      else fillCells.push([gx, gy]);
    }
  }
  // rimCells = 24 front cubes + 12 back-bevel rim cubes (every other rim cube) = 36 exact!
  rimCells.forEach(([gx, gy], idx) => {
    pts.push({
      x: gx * p,
      y: gy * p,
      z: 0.10,
      s: 0.248,
      c: gy === 4 || gy === -4 ? COBALT : INDIGO,
      tag: "rim",
    });
    if (idx % 2 === 0) {
      pts.push({
        x: gx * p,
        y: gy * p,
        z: -0.14,
        s: 0.235,
        c: NAVY,
        tag: "rim",
      });
    }
  });

  // 100% SOLID zero-gap inner shield field (ALL 32 fillCells!)
  for (const [gx, gy] of fillCells) {
    pts.push({
      x: gx * p,
      y: gy * p,
      z: -0.04,
      s: 0.255,
      c: gx < 0 ? ICE : "#c8d8f7",
      tag: "field",
    });
  }

  // 5b. Raised 3D Rising Equity Curve + Breakout Arrow across shield face (28 cubes)
  const curvePts: Array<[number, number]> = [
    [-0.78, -0.34], [-0.62, -0.18], [-0.46, -0.02], [-0.30, -0.14],
    [-0.14, -0.26], [0.02, -0.06], [0.18, 0.16], [0.34, 0.38],
    [0.50, 0.28], [0.66, 0.48], [0.82, 0.70], [0.98, 0.92],
  ];
  curvePts.forEach(([cx, cy], idx) => {
    pts.push({ x: cx, y: cy, z: 0.28, s: 0.195, c: idx >= 9 ? EMERALD_BRIGHT : EMERALD, tag: "curve" });
    if (idx % 2 === 0) {
      pts.push({ x: cx, y: cy, z: 0.14, s: 0.175, c: TEAL, tag: "curve" });
    }
  });
  // Bold Golden Breakout Arrowhead (10 cubes) breaking past top-right shield corner!
  const arrowHead: Array<[number, number, number, number, string]> = [
    [1.20, 1.14, 0.32, 0.215, WHITE],
    [1.00, 1.16, 0.30, 0.195, GOLD],
    [0.80, 1.16, 0.28, 0.18, GOLD],
    [1.20, 0.94, 0.30, 0.195, GOLD],
    [1.20, 0.74, 0.28, 0.18, GOLD],
    [1.04, 1.00, 0.32, 0.195, GOLD],
    [1.20, 1.14, 0.15, 0.19, AMBER],
    [1.00, 1.16, 0.15, 0.17, AMBER],
    [1.20, 0.94, 0.15, 0.17, AMBER],
    [1.04, 1.00, 0.15, 0.17, AMBER],
  ];
  for (const [x, y, z, s, c] of arrowHead) pts.push({ x, y, z, s, c, tag: "curve" });

  // 5c. Top Emerald Take-Profit Crown Bracket (+TP, 12 cubes)
  for (let gx = -3; gx <= 3; gx++) {
    pts.push({ x: gx * 0.24, y: 1.42, z: 0.04, s: 0.175, c: Math.abs(gx) === 3 ? TEAL : EMERALD, tag: "tp" });
  }
  pts.push(
    { x: -0.72, y: 1.26, z: 0.04, s: 0.16, c: TEAL, tag: "tp" },
    { x: 0.72, y: 1.26, z: 0.04, s: 0.16, c: TEAL, tag: "tp" },
    { x: 0, y: 1.60, z: 0.04, s: 0.17, c: EMERALD_BRIGHT, tag: "tp" },
    { x: -0.18, y: 1.52, z: 0.04, s: 0.15, c: EMERALD, tag: "tp" },
    { x: 0.18, y: 1.52, z: 0.04, s: 0.15, c: EMERALD, tag: "tp" },
  );

  // 5d. Bottom Ruby Stop-Loss Protective Cradle Bar (-SL, 12 cubes snugly cradling shield point)
  for (let gx = -3; gx <= 3; gx++) {
    pts.push({ x: gx * 0.24, y: -1.32, z: 0.04, s: 0.175, c: Math.abs(gx) === 3 ? "#9e1c3a" : RUBY, tag: "sl" });
  }
  pts.push(
    { x: -0.72, y: -1.16, z: 0.04, s: 0.16, c: "#9e1c3a", tag: "sl" },
    { x: 0.72, y: -1.16, z: 0.04, s: 0.16, c: "#9e1c3a", tag: "sl" },
    { x: 0, y: -1.48, z: 0.04, s: 0.17, c: ROSE, tag: "sl" },
    { x: -0.18, y: -1.42, z: 0.04, s: 0.15, c: RUBY, tag: "sl" },
    { x: 0.18, y: -1.42, z: 0.04, s: 0.15, c: RUBY, tag: "sl" },
  );

  return pts; // 36 + 32 + 28 + 12 + 12 = 120 exact
})();

// ============================================================================
// EXPORTED RISK SCULPTURE CONTENDERS (5 DISTINCT CONCEPTS FOR COUNCIL VOTING)
// ============================================================================
export const VARIANTS_RISK: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     CONTENDER 1 — 3D Candlestick Chart + Golden Breakout Arrow
     -------------------------------------------------------------------------- */
  "risk-candlestick-breakout": {
    hero(idx, _count, t) {
      const v = CANDLESTICK_120[((idx % 120) + 120) % 120];
      const rotY = -0.34 + Math.sin(t * 0.30) * 0.22;
      const rotX = 0.20 + Math.sin(t * 0.45) * 0.04;
      let dy = 0;
      if (v.tag === "arrow") dy = Math.sin(t * 2.1) * 0.055;
      else if (v.tag === "c4") dy = Math.sin(t * 1.9) * 0.035;
      const [rx, ry, rz] = rotateYX(v.x, v.y + dy, v.z, rotY, rotX);
      return makeTarget(rx, ry, rz, rotX, rotY, 0, v.s, v.c);
    },
    mini(localIdx, _cnt, t, boost, sc) {
      const k = ((localIdx % 12) + 12) % 12;
      const rotY = -0.30 + Math.sin(t * 0.45) * 0.22;
      const pts: Array<[number, number, number, number, string]> = [
        // Green candle 1
        [-0.30, -0.16, 0, 1.0, EMERALD],
        [-0.30, 0.02, 0, 1.0, EMERALD_BRIGHT],
        [-0.30, 0.18, 0, 0.55, TEAL],
        // Red candle 2
        [0.0, -0.06, 0, 1.0, RUBY],
        [0.0, 0.12, 0, 1.0, ROSE],
        [0.0, -0.22, 0, 0.55, "#9e1c3a"],
        // Tall Green breakout candle 3
        [0.30, -0.04, 0, 1.0, EMERALD],
        [0.30, 0.14, 0, 1.0, EMERALD],
        [0.30, 0.32, 0, 1.0, EMERALD_BRIGHT],
        [0.30, 0.46, 0, 0.55, WHITE],
        // Golden breakout arrow accent
        [0.06, 0.36, 0.18, 0.72, GOLD],
        [0.24, 0.48, 0.18, 0.82, GOLD],
      ];
      const [px, py, pz, sm, col] = pts[k];
      const [dx, dy, dz] = rotateYX(px * boost, py * boost, pz * boost, rotY, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: rotY, rz: 0, scale: sc * sm, color: col };
    },
  },

  /* --------------------------------------------------------------------------
     CONTENDER 2 — Bull vs. Bear Balance Scale of Risk & Reward
     -------------------------------------------------------------------------- */
  "risk-bull-bear-scale": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const rotY = -0.26 + Math.sin(t * 0.28) * 0.22;
      const rotX = 0.22;
      const tilt = Math.sin(t * 1.15) * 0.13;
      const beamHalf = 1.24;
      const beamY = 0.66;

      let lx = 0, ly = 0, lz = 0, sc = 0.20, col = INDIGO, localRz = 0;

      if (i < 40) {
        const v = SCALE_STATIC_40[i];
        lx = v.x; ly = v.y; lz = v.z; sc = v.s; col = v.c;
      } else if (i < 56) {
        // Gently rocking horizontal balance beam (16 cubes)
        const k = i - 40;
        let bx = 0, by = 0, bz = 0;
        if (k < 13) {
          bx = (k - 6) * 0.205;
          sc = Math.abs(k - 6) === 6 ? 0.22 : 0.195;
          col = Math.abs(k - 6) === 6 ? GOLD : k % 2 === 0 ? INDIGO : NAVY;
        } else {
          const m = k - 13;
          bx = (m - 1) * 0.22;
          by = 0.14;
          sc = 0.15;
          col = GOLD;
        }
        const ct = Math.cos(tilt);
        const st = Math.sin(tilt);
        lx = bx * ct - by * st;
        ly = beamY + bx * st + by * ct;
        lz = bz;
        localRz = tilt;
      } else if (i < 88) {
        // Left Bull Pan hangs vertically plumb from left beam tip
        const v = SCALE_LEFT_PAN_32[i - 56];
        const tipX = -beamHalf * Math.cos(tilt);
        const tipY = beamY - beamHalf * Math.sin(tilt);
        lx = tipX + v.x;
        ly = tipY + v.y;
        lz = v.z;
        sc = v.s;
        col = v.c;
      } else {
        // Right Bear Pan hangs vertically plumb from right beam tip
        const v = SCALE_RIGHT_PAN_32[i - 88];
        const tipX = beamHalf * Math.cos(tilt);
        const tipY = beamY + beamHalf * Math.sin(tilt);
        lx = tipX + v.x;
        ly = tipY + v.y;
        lz = v.z;
        sc = v.s;
        col = v.c;
      }

      const [rx, ry, rz] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(rx, ry, rz, rotX, rotY, localRz, sc, col);
    },
    mini(localIdx, _cnt, t, boost, sc) {
      const k = ((localIdx % 12) + 12) % 12;
      const rotY = -0.22 + Math.sin(t * 0.45) * 0.22;
      const dyTilt = Math.sin(t * 1.4) * 0.05;
      const pts: Array<[number, number, number, number, string]> = [
        // Base + Golden pillar (3)
        [0, -0.34, 0, 1.05, INDIGO],
        [0, -0.10, 0, 0.9, GOLD],
        [0, 0.16, 0, 0.95, GOLD],
        // Beam (3)
        [-0.30, 0.22 - dyTilt, 0, 0.78, INDIGO],
        [0, 0.28, 0, 0.85, WHITE],
        [0.30, 0.22 + dyTilt, 0, 0.78, INDIGO],
        // Left Emerald Bull pan (3)
        [-0.36, -0.12 - dyTilt, 0, 0.9, NAVY],
        [-0.36, 0.04 - dyTilt, 0, 0.88, EMERALD],
        [-0.24, 0.02 - dyTilt, 0, 0.78, EMERALD_BRIGHT],
        // Right Ruby Bear pan (3)
        [0.36, -0.12 + dyTilt, 0, 0.9, NAVY],
        [0.36, 0.04 + dyTilt, 0, 0.88, RUBY],
        [0.24, 0.02 + dyTilt, 0, 0.78, ROSE],
      ];
      const [px, py, pz, sm, col] = pts[k];
      const [dx, dy, dz] = rotateYX(px * boost, py * boost, pz * boost, rotY, 0.2);
      return { dx, dy, dz, rx: 0.2, ry: rotY, rz: 0, scale: sc * sm, color: col };
    },
  },

  /* --------------------------------------------------------------------------
     CONTENDER 3 — Quant Trading Terminal Monitor + Live Candles & Breakout Arrow
     -------------------------------------------------------------------------- */
  "risk-monitor-candles": {
    hero(idx, _count, t) {
      const v = MONITOR_120[((idx % 120) + 120) % 120];
      const rotY = -0.30 + Math.sin(t * 0.28) * 0.22;
      const rotX = 0.16;
      const pulse = v.tag === "badge" ? Math.sin(t * 2.2) * 0.05 : 0;
      const [rx, ry, rz] = rotateYX(v.x + pulse * 0.5, v.y + pulse, v.z, rotY, rotX);
      return makeTarget(rx, ry, rz, rotX, rotY, 0, v.s, v.c);
    },
    mini(localIdx, _cnt, t, boost, sc) {
      const k = ((localIdx % 12) + 12) % 12;
      const rotY = -0.26 + Math.sin(t * 0.45) * 0.22;
      const pts: Array<[number, number, number, number, string]> = [
        // Monitor frame (6)
        [-0.34, 0.24, 0, 0.9, INDIGO], [0, 0.24, 0, 0.9, INDIGO], [0.34, 0.24, 0, 0.9, INDIGO],
        [-0.34, -0.10, 0, 0.9, NAVY], [0, -0.10, 0, 0.9, NAVY], [0.34, -0.10, 0, 0.9, NAVY],
        // Stand (2)
        [0, -0.28, 0, 0.75, SILVER],
        [0, -0.40, 0.05, 0.95, INDIGO],
        // Screen candles + breakout tip (4)
        [-0.22, 0.06, 0.12, 0.82, EMERALD],
        [0.0, 0.08, 0.12, 0.82, RUBY],
        [0.22, 0.12, 0.12, 0.92, EMERALD_BRIGHT],
        [0.42, 0.38, 0.16, 0.82, GOLD],
      ];
      const [px, py, pz, sm, col] = pts[k];
      const [dx, dy, dz] = rotateYX(px * boost, py * boost, pz * boost, rotY, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: rotY, rz: 0, scale: sc * sm, color: col };
    },
  },

  /* --------------------------------------------------------------------------
     CONTENDER 4 — Sculpted 3D Wall Street Charging Bull (Emerald & Gold)
     -------------------------------------------------------------------------- */
  "risk-charging-bull": {
    hero(idx, _count, t) {
      const v = CHARGING_BULL_120[((idx % 120) + 120) % 120];
      const rotY = 0.60 + Math.sin(t * 0.30) * 0.22;
      const rotX = 0.18;
      let dy = 0;
      let dzOff = 0;
      if (v.tag === "head" || v.tag === "horn") dy = Math.sin(t * 2.0) * 0.035;
      else if (v.tag === "tail") dzOff = Math.sin(t * 3.0) * 0.06;
      const [rx, ry, rz] = rotateYX(v.x, v.y + dy, v.z + dzOff, rotY, rotX);
      return makeTarget(rx, ry, rz, rotX, rotY, 0, v.s, v.c);
    },
    mini(localIdx, _cnt, t, boost, sc) {
      const k = ((localIdx % 12) + 12) % 12;
      const rotY = 0.38 + Math.sin(t * 0.45) * 0.22;
      const pts: Array<[number, number, number, number, string]> = [
        // Muscular body (4)
        [-0.14, 0.12, 0, 1.05, EMERALD_BRIGHT],
        [0.10, 0.10, 0, 1.0, EMERALD],
        [0.30, 0.06, 0, 0.92, TEAL],
        [-0.10, -0.06, 0, 0.95, TEAL],
        // Lowered head (2)
        [-0.34, 0.02, 0, 0.95, EMERALD],
        [-0.46, -0.06, 0, 0.78, INDIGO],
        // Dramatic sweeping golden horns (4)
        [-0.36, 0.22, 0.18, 0.72, GOLD],
        [-0.48, 0.34, 0.20, 0.68, WHITE],
        [-0.36, 0.22, -0.18, 0.72, GOLD],
        [-0.48, 0.34, -0.20, 0.68, WHITE],
        // Planted leg anchors (2)
        [-0.18, -0.28, 0.10, 0.78, INDIGO],
        [0.24, -0.28, -0.10, 0.78, INDIGO],
      ];
      const [px, py, pz, sm, col] = pts[k];
      const [dx, dy, dz] = rotateYX(px * boost, py * boost, pz * boost, rotY, 0.18);
      return { dx, dy, dz, rx: 0.18, ry: rotY, rz: 0, scale: sc * sm, color: col };
    },
  },

  /* --------------------------------------------------------------------------
     CONTENDER 5 — Quant Risk Shield + Rising Equity Curve & OCO Brackets
     -------------------------------------------------------------------------- */
  "risk-shield-equity": {
    hero(idx, _count, t) {
      const v = SHIELD_EQUITY_120[((idx % 120) + 120) % 120];
      const rotY = -0.28 + Math.sin(t * 0.30) * 0.24;
      const rotX = 0.16;
      let dy = 0;
      if (v.tag === "tp") dy = Math.sin(t * 1.8) * 0.04;
      else if (v.tag === "sl") dy = -Math.sin(t * 1.8) * 0.04;
      const [rx, ry, rz] = rotateYX(v.x, v.y + dy, v.z, rotY, rotX);
      return makeTarget(rx, ry, rz, rotX, rotY, 0, v.s, v.c);
    },
    mini(localIdx, _cnt, t, boost, sc) {
      const k = ((localIdx % 12) + 12) % 12;
      const rotY = -0.24 + Math.sin(t * 0.45) * 0.22;
      const pts: Array<[number, number, number, number, string]> = [
        // Shield perimeter (6)
        [-0.26, 0.26, 0, 0.88, INDIGO], [0, 0.30, 0, 0.88, COBALT], [0.26, 0.26, 0, 0.88, INDIGO],
        [-0.22, -0.04, 0, 0.86, NAVY], [0.22, -0.04, 0, 0.86, NAVY],
        [0, -0.32, 0, 0.90, COBALT],
        // Rising equity curve across shield (5)
        [-0.20, -0.10, 0.14, 0.72, EMERALD],
        [-0.04, 0.02, 0.14, 0.74, EMERALD],
        [0.10, -0.02, 0.14, 0.74, EMERALD],
        [0.24, 0.16, 0.14, 0.78, EMERALD_BRIGHT],
        [0.36, 0.32, 0.16, 0.82, GOLD],
        // Ruby Stop-Loss floor pip below shield (1)
        [0, -0.48, 0.08, 0.68, RUBY],
      ];
      const [px, py, pz, sm, col] = pts[k];
      const [dx, dy, dz] = rotateYX(px * boost, py * boost, pz * boost, rotY, 0.16);
      return { dx, dy, dz, rx: 0.16, ry: rotY, rz: 0, scale: sc * sm, color: col };
    },
  },
};
