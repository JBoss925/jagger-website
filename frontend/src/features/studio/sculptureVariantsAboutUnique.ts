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
const INDIGO = "#2b2452";
const NAVY = "#344b8c";
const COBALT = "#2d6ae0";
const SKY = "#4d9cf5";
const MAGENTA = "#e03c8a";
const RUBY = "#c92a4e";
const ROSE = "#e85d87";
const GOLD = "#f5b83d";
const AMBER = "#d98d1a";
const EMERALD = "#22bf90";
const TEAL = "#19967a";
const STEEL = "#6e7fa6";
const SILVER = "#9fb0cf";
const VIOLET = "#7c52d6";
const WHITE = "#ffffff";

// ============================================================================
// PRECOMPUTED NON-OVERLAPPING GEOMETRY TABLES (6 UNIQUE ABOUT SCULPTURES)
// ============================================================================

// 1. Speech Bubble Grid (filled rounded rectangle with bottom tail — 36 cubes each!)
function buildBubblePts(tailSide: "left" | "right"): Array<{
  gx: number;
  gy: number;
  isBorder: boolean;
}> {
  const pts: Array<{ gx: number; gy: number; isBorder: boolean }> = [];
  // 7 wide (-3..3) x 5 tall (-2..2), skipping 4 outer corners = 35 - 4 = 31
  for (let gy = -2; gy <= 2; gy++) {
    for (let gx = -3; gx <= 3; gx++) {
      if (Math.abs(gx) === 3 && Math.abs(gy) === 2) continue;
      const isBorder =
        Math.abs(gx) === 3 ||
        Math.abs(gy) === 2 ||
        (Math.abs(gx) === 2 && Math.abs(gy) === 2);
      pts.push({ gx, gy, isBorder });
    }
  }
  // 5-cube unmistakable pointed tail extending below-left or below-right
  const sx = tailSide === "left" ? -1 : 1;
  pts.push(
    { gx: sx * 1, gy: -3, isBorder: true },
    { gx: sx * 2, gy: -3, isBorder: true },
    { gx: sx * 2, gy: -4, isBorder: true },
    { gx: sx * 3, gy: -4, isBorder: true },
    { gx: sx * 1.5, gy: -2.9, isBorder: false },
  );
  return pts; // 36 exact
}

const LEFT_BUBBLE_36 = buildBubblePts("left");
const RIGHT_BUBBLE_36 = buildBubblePts("right");

// 2. Padlock Solid Body Grid (7 wide x 5 tall = 35 front + 17 perimeter back = 52)
const LOCK_FRONT_35: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let gy = -2; gy <= 2; gy++) {
    for (let gx = -3; gx <= 3; gx++) {
      pts.push([gx, gy]);
    }
  }
  return pts; // 35
})();

const LOCK_BACK_20: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  for (let gy = -2; gy <= 2; gy++) {
    for (let gx = -3; gx <= 3; gx++) {
      if (Math.abs(gx) === 3 || Math.abs(gy) === 2) {
        pts.push([gx, gy]);
      }
    }
  }
  return pts; // 20 exact
})();

// 3. Swiss Army Knife Classic Rounded-Pill Crimson Body (36 front + 16 rim back = 52)
const KNIFE_BODY_36: Array<{ gx: number; gy: number; isCross: boolean; isRim: boolean }> = (() => {
  const pts: Array<{ gx: number; gy: number; isCross: boolean; isRim: boolean }> = [];
  // 10 cols (-4.5..4.5) x 4 rows (-1.5..1.5), skipping 4 corners = 36 exact!
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r === 0 || r === 3) && (c === 0 || c === 9)) continue;
      const gx = c - 4.5;
      const gy = r - 1.5;
      // Crisp Swiss Cross emblem right in center (cols 3..5, rows 1..2 + top/bottom of col 4)
      const isCross =
        (c === 4 && (r === 0 || r === 1 || r === 2 || r === 3)) ||
        (r === 1 && (c === 3 || c === 5)) ||
        (r === 2 && (c === 3 || c === 5));
      const isRim = r === 0 || r === 3 || c === 0 || c === 9;
      pts.push({ gx, gy, isCross, isRim });
    }
  }
  return pts; // 36 exact
})();

// 4. Artist's Kidney-Shaped Palette Board (non-overlapping grid with crisp thumb hole!)
const PALETTE_BOARD_54: Array<{ gx: number; gy: number; isRim: boolean }> = (() => {
  const pts: Array<{ gx: number; gy: number; isRim: boolean }> = [];
  for (let gy = -4; gy <= 4; gy++) {
    for (let gx = -5; gx <= 5; gx++) {
      // Elliptical palette footprint
      const ex = gx / 5.1;
      const ey = gy / 4.1;
      const d2 = ex * ex + ey * ey;
      if (d2 > 1.0) continue;
      // Sculpted lower-right painter's notch indentation
      if (gx >= 3 && gy <= -2) continue;
      // Crisp circular thumb hole at (gx = 2, gy = -1) -> leave 2x2 void!
      if ((gx === 2 || gx === 3) && (gy === -1 || gy === 0)) continue;
      const isRim = d2 > 0.66 || (gx === 1 && gy <= -2) || (gx >= 2 && gy === -2);
      pts.push({ gx, gy, isRim });
    }
  }
  return pts;
})();

// ============================================================================
// UNIQUE ABOUT SCULPTURES (3 WORKING WITH A TEAM + 3 RANGE = 6 TOTAL)
// ============================================================================
export const VARIANTS_ABOUT_UNIQUE: Record<string, VariantEvaluator> = {
  /* --------------------------------------------------------------------------
     TEAM 1 — Collaborative Engineering Roundtable + 4 Teammates & Glowing Blueprint Core
     -------------------------------------------------------------------------- */
  "team-s3-roundtable": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const rotY = -0.38 + Math.sin(t * 0.28) * 0.24;
      const rotX = 0.44;

      let lx = 0, ly = 0, lz = 0, sc = 0.21, col = INDIGO;

      if (i < 44) {
        // Solid, seamless circular conference table! (20 dark outer rim + 12 slate inner ring + 4 center disc + 8 pedestal & base)
        if (i < 20) {
          const a = (i / 20) * Math.PI * 2;
          lx = Math.cos(a) * 1.06;
          ly = -0.22;
          lz = Math.sin(a) * 1.06;
          sc = 0.235;
          col = i % 2 === 0 ? INDIGO : NAVY;
        } else if (i < 32) {
          const a = ((i - 20) / 12) * Math.PI * 2;
          lx = Math.cos(a) * 0.66;
          ly = -0.21;
          lz = Math.sin(a) * 0.66;
          sc = 0.245;
          col = "#dce5f7";
        } else if (i < 36) {
          const a = ((i - 32) / 4) * Math.PI * 2 + Math.PI * 0.25;
          lx = Math.cos(a) * 0.26;
          ly = -0.21;
          lz = Math.sin(a) * 0.26;
          sc = 0.245;
          col = "#eef3fc";
        } else {
          // Grounded central pedestal column (4) + wide cross base (4)
          const k = i - 36;
          if (k < 4) {
            const a = (k / 4) * Math.PI * 2;
            lx = Math.cos(a) * 0.14;
            ly = -0.52 - (k % 2) * 0.22;
            lz = Math.sin(a) * 0.14;
            sc = 0.22;
            col = INDIGO;
          } else {
            const a = ((k - 4) / 4) * Math.PI * 2;
            lx = Math.cos(a) * 0.44;
            ly = -0.94;
            lz = Math.sin(a) * 0.44;
            sc = 0.21;
            col = NAVY;
          }
        }
      } else if (i < 56) {
        // 12-cube Crisp Golden Holographic Blueprint Diamond Hovering Above Table Center!
        const k = i - 44;
        const spin = t * 0.85;
        const bob = Math.sin(t * 2.1) * 0.06;
        let hx = 0, hy = 0, hz = 0;
        if (k < 8) {
          hx = (k & 1 ? 1 : -1) * 0.19;
          hy = (k & 2 ? 1 : -1) * 0.19;
          hz = (k & 4 ? 1 : -1) * 0.19;
          sc = 0.16;
          col = GOLD;
        } else {
          // 4 glowing emerald corner nodes orbiting the blueprint
          const m = k - 8;
          const a = (m / 4) * Math.PI * 2 + spin * 0.7;
          hx = Math.cos(a) * 0.4;
          hy = 0;
          hz = Math.sin(a) * 0.4;
          sc = 0.135;
          col = EMERALD;
        }
        const [rxH, ryH, rzH] = rotateYX(hx, hy, hz, spin, 0.42);
        lx = rxH;
        ly = 0.36 + bob + ryH;
        lz = rzH;
      } else {
        // 64 cubes: 4 Sculpted, Solid Teammate Figures Seated Right Around the Table (16 cubes each — zero stray debris!)
        const k = i - 56;
        const member = Math.floor(k / 16); // 0..3
        const part = k % 16;
        const baseA = (member / 4) * Math.PI * 2 + Math.PI * 0.25;
        const ca = Math.cos(baseA);
        const sa = Math.sin(baseA);
        const tx = -sa;
        const tz = ca;
        const R = 1.48;
        const nod = Math.sin(t * 1.9 + member * 1.55) * 0.04;
        const teamCols = [COBALT, EMERALD, MAGENTA, VIOLET];
        const shirtCol = teamCols[member % 4];
        const headCol = GOLD;

        const figPts: Array<[number, number, number, number, string]> = [
          // 4-cube plump golden head (2x2)
          [0, -0.095, 0.74 + nod, 0.18, headCol], [0, 0.095, 0.74 + nod, 0.18, headCol],
          [0, -0.095, 0.92 + nod, 0.18, headCol], [0, 0.095, 0.92 + nod, 0.18, headCol],
          // 9-cube solid shoulders & upper torso (3 wide x 3 tall)
          [0, -0.21, 0.42, 0.2, shirtCol], [0, 0, 0.44, 0.205, shirtCol], [0, 0.21, 0.42, 0.2, shirtCol],
          [0, -0.21, 0.22, 0.2, shirtCol], [0, 0, 0.22, 0.205, shirtCol], [0, 0.21, 0.22, 0.2, shirtCol],
          [0, -0.18, 0.02, 0.195, INDIGO], [0, 0, 0.02, 0.2, INDIGO], [0, 0.18, 0.02, 0.195, INDIGO],
          // 2 arms reaching cleanly forward onto the tabletop edge!
          [-0.22, -0.22, 0.18 + nod * 0.6, 0.175, shirtCol],
          [-0.22, 0.22, 0.18 - nod * 0.6, 0.175, shirtCol],
          // 1 central torso back spine giving 3D silhouette fullness
          [0.18, 0, 0.26, 0.19, NAVY],
        ];
        const fp = figPts[part % figPts.length];
        const rad = R + fp[0];
        lx = ca * rad + tx * fp[1];
        ly = fp[2] - 0.18;
        lz = sa * rad + tz * fp[1];
        sc = fp[3];
        col = fp[4];
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        // Table disc (4)
        [-0.14, -0.1, 0.14, INDIGO], [0.14, -0.1, 0.14, INDIGO],
        [-0.14, -0.1, -0.14, NAVY], [0.14, -0.1, -0.14, NAVY],
        // Glowing golden blueprint center (1)
        [0, 0.12, 0, GOLD],
        // 4 colorful teammates around the table (heads + shoulders = 7)
        [-0.36, 0.04, 0.3, COBALT], [-0.36, 0.22, 0.3, GOLD],
        [0.36, 0.04, 0.3, EMERALD], [0.36, 0.22, 0.3, GOLD],
        [-0.34, 0.06, -0.32, MAGENTA], [0.34, 0.06, -0.32, GOLD],
        [0, 0.26, -0.34, WHITE],
      ];
      const p = pts[slot];
      const ry = -0.3 + Math.sin(t * 0.45) * 0.26;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.4);
      return { dx, dy, dz, rx: 0.4, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     TEAM 2 — Giant Golden Skeleton Key Unlocking a Pop-Open Emerald/Cobalt Padlock!
     ("Unblocking other engineers & enabling teams to ship")
     -------------------------------------------------------------------------- */
  "team-s3-key-unlock": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.21;
      const rotY = -0.2 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.15;
      // Smooth continuous pop-open unlock cycle (zero snapping!)
      const unlockWave = 0.5 + 0.5 * Math.sin(t * 1.35);
      const shackleLift = unlockWave * 0.32;
      const keyTurn = Math.sin(t * 1.35) * 0.28;
      const keySlide = (1 - unlockWave) * 0.16;

      let lx = 0, ly = 0, lz = 0, sc = 0.185, col = COBALT;
      const lockCx = -0.86;
      const lockCy = -0.45;

      if (i < 55) {
        // Solid 3D Padlock Body (35 front face + 20 rear shell)
        if (i < 35) {
          const p = LOCK_FRONT_35[i];
          const gx = p[0];
          const gy = p[1];
          const isKeyhole = (gx === 0 && gy === 0) || (gx === 0 && gy === -1);
          const isRim = Math.abs(gx) === 3 || Math.abs(gy) === 2;
          lx = lockCx + gx * P;
          ly = lockCy + gy * P;
          lz = isKeyhole ? 0.02 : 0.24;
          sc = isKeyhole ? 0.165 : 0.19;
          col = isKeyhole
            ? INDIGO
            : isRim
              ? NAVY
              : unlockWave > 0.65 && gy === 1
                ? EMERALD
                : COBALT;
        } else {
          const p = LOCK_BACK_20[(i - 35) % LOCK_BACK_20.length];
          lx = lockCx + p[0] * P;
          ly = lockCy + p[1] * P;
          lz = -0.22;
          sc = 0.19;
          col = INDIGO;
        }
      } else if (i < 77) {
        // 22-cube Thick Gleaming Silver/Emerald U-Shackle popping smoothly upward & swinging slightly!
        const k = i - 55;
        let sx = 0, sy = 0;
        if (k < 5) {
          // Left vertical shank (stays rooted cleanly into lock body even when popped open!)
          sx = -2.0 * P;
          sy = (1.8 + k * 0.96) * P;
        } else if (k < 17) {
          // Smooth semicircular top U-arch (12 cubes)
          const u = (k - 5) / 11;
          const a = Math.PI - u * Math.PI;
          sx = Math.cos(a) * 2.0 * P;
          sy = 5.65 * P + Math.sin(a) * 1.95 * P;
        } else {
          // Right vertical shank (pops clear out of lock body when unlocked!)
          const rStep = k - 17; // 0..4
          sx = 2.0 * P;
          sy = (5.55 - rStep * 0.8) * P;
        }
        lx = lockCx + sx;
        ly = lockCy + sy + shackleLift;
        lz = 0.02;
        sc = 0.175;
        col = unlockWave > 0.55 ? EMERALD : SILVER;
      } else {
        // 43-cube Giant Sculpted 3D GOLDEN SKELETON KEY hovering cleanly to the right & turning!
        const k = i - 77;
        const keyCx = 1.64 - keySlide;
        const keyCy = -0.22;
        let kx = 0, ky = 0, kz = 0;
        if (k < 18) {
          // Ornate circular key bow (ring handle on right)
          const a = (k / 18) * Math.PI * 2;
          kx = 0.48 + Math.cos(a) * 0.44;
          ky = Math.sin(a) * 0.44;
          kz = 0;
          sc = 0.165;
          col = k % 3 === 0 ? AMBER : GOLD;
        } else if (k < 22) {
          // Inner filigree cross-studs inside bow
          const a = ((k - 18) / 4) * Math.PI * 2 + Math.PI * 0.25;
          kx = 0.48 + Math.cos(a) * 0.2;
          ky = Math.sin(a) * 0.2;
          kz = 0;
          sc = 0.125;
          col = WHITE;
        } else if (k < 33) {
          // Long horizontal golden key shaft extending left toward lock (11 cubes)
          const s = k - 22;
          kx = -0.02 - s * 0.165;
          ky = 0;
          kz = 0;
          sc = 0.165;
          col = s === 0 ? AMBER : GOLD;
        } else {
          // Classic notched skeleton-key bit teeth pointing downward (10 cubes)
          const tPts: Array<[number, number]> = [
            [-1.08, -0.18], [-1.08, -0.36], [-1.08, -0.52],
            [-1.26, -0.18], [-1.26, -0.36],
            [-1.44, -0.18], [-1.44, -0.36], [-1.44, -0.54],
            [-1.62, -0.18], [-1.62, -0.44],
          ];
          const tp = tPts[(k - 33) % tPts.length];
          kx = tp[0];
          ky = tp[1];
          kz = 0;
          sc = 0.155;
          col = (k - 33) % 3 === 0 ? AMBER : GOLD;
        }
        // Subtle 3D twisting key turn around X axis + slight upward tilt
        const ct = Math.cos(keyTurn);
        const st = Math.sin(keyTurn);
        const ryK = ky * ct - kz * st;
        const rzK = ky * st + kz * ct;
        lx = keyCx + kx;
        ly = keyCy + ryK;
        lz = 0.42 + rzK;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const lift = (0.5 + 0.5 * Math.sin(t * 1.5)) * 0.08;
      const pts: Array<[number, number, number, string]> = [
        // Padlock body (4)
        [-0.32, -0.08, 0, COBALT], [-0.1, -0.08, 0, COBALT],
        [-0.32, -0.28, 0, NAVY], [-0.1, -0.28, 0, NAVY],
        // Shackle arch (3)
        [-0.3, 0.16 + lift, 0, EMERALD], [-0.21, 0.3 + lift, 0, EMERALD], [-0.12, 0.18 + lift, 0, EMERALD],
        // Golden Key (5)
        [0.08, -0.08, 0.12, GOLD], [0.22, -0.08, 0.12, GOLD], [0.1, -0.24, 0.12, AMBER],
        [0.36, 0.04, 0.12, GOLD], [0.36, -0.18, 0.12, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.2 + Math.sin(t * 0.45) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.16);
      return { dx, dy, dz, rx: 0.16, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     TEAM 3 — Twin Glossy 3D Speech Bubbles (`<>` Code Review + `✓` Approved!)
     -------------------------------------------------------------------------- */
  "team-s3-speech-bubbles": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.225;
      const rotY = -0.18 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.14;
      const bobL = Math.sin(t * 1.8) * 0.07;
      const bobR = Math.sin(t * 1.8 + 1.4) * 0.07;

      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = COBALT;

      if (i < 36) {
        // Left Cobalt Code-Review Speech Bubble (36 cubes)
        const p = LEFT_BUBBLE_36[i];
        lx = -0.78 + p.gx * P;
        ly = 0.46 + p.gy * P + bobL;
        lz = -0.14;
        sc = 0.2;
        col = p.isBorder ? NAVY : COBALT;
      } else if (i < 72) {
        // Right Emerald Approved Speech Bubble (36 cubes)
        const p = RIGHT_BUBBLE_36[i - 36];
        lx = 0.78 + p.gx * P;
        ly = -0.34 + p.gy * P + bobR;
        lz = 0.28;
        sc = 0.2;
        col = p.isBorder ? TEAL : EMERALD;
      } else if (i < 94) {
        // 22-cube Crisp Proud White `< / >` Code Glyph Popping Out of Left Cobalt Bubble!
        const k = i - 72;
        const codePts: Array<[number, number, string]> = [
          // Left `<` (7)
          [-2.0, 0, WHITE], [-1.5, 0.5, WHITE], [-1.0, 1.0, WHITE],
          [-1.5, -0.5, WHITE], [-1.0, -1.0, WHITE],
          // Center `/` slash (4) in bright gold!
          [-0.25, -0.95, GOLD], [-0.08, -0.32, GOLD], [0.08, 0.32, GOLD], [0.25, 0.95, GOLD],
          // Right `>` (5)
          [2.0, 0, WHITE], [1.5, 0.5, WHITE], [1.0, 1.0, WHITE],
          [1.5, -0.5, WHITE], [1.0, -1.0, WHITE],
          // 6 subtle dark shadow cubes behind `< / >` for crisp readability
          [-1.5, 0, INDIGO], [1.5, 0, INDIGO], [-1.0, 0.5, INDIGO],
          [-1.0, -0.5, INDIGO], [1.0, 0.5, INDIGO], [1.0, -0.5, INDIGO],
          // 2 live typing pulse dots on upper rim
          [-2.2, 1.2, GOLD], [2.2, 1.2, GOLD],
        ];
        const cp = codePts[k % codePts.length];
        const isShadow = k >= 14 && k < 20;
        lx = -0.78 + cp[0] * P * 0.96;
        ly = 0.46 + cp[1] * P * 0.96 + bobL;
        lz = isShadow ? -0.02 : 0.14;
        sc = isShadow ? 0.14 : 0.165;
        col = cp[2];
      } else if (i < 110) {
        // 16-cube Bold Proud White `✓` Approved Checkmark Popping Out of Right Emerald Bubble!
        const k = i - 94;
        const checkPts: Array<[number, number, string]> = [
          // Left downstroke of `✓` (4)
          [-1.55, 0.05, WHITE], [-1.1, -0.4, WHITE], [-0.65, -0.85, WHITE], [-0.2, -1.15, WHITE],
          // Right ascending stroke of `✓` (7)
          [0.22, -0.78, WHITE], [0.64, -0.34, WHITE], [1.06, 0.1, WHITE],
          [1.48, 0.54, WHITE], [1.9, 0.98, WHITE],
          // Thickened double-stroke highlight cubes (5)
          [-0.65, -0.35, WHITE], [-0.2, -0.65, WHITE], [0.22, -0.28, WHITE],
          [0.64, 0.16, WHITE], [1.06, 0.6, WHITE],
          // 2 celebratory gold sparkle pips above right bubble
          [-2.1, 1.25, GOLD], [2.1, -1.15, GOLD],
        ];
        const cp = checkPts[k % checkPts.length];
        lx = 0.78 + cp[0] * P * 0.92;
        ly = -0.34 + cp[1] * P * 0.92 + bobR;
        lz = 0.56;
        sc = 0.172;
        col = cp[2];
      } else {
        // 10-cube Depth Rim Reinforcement & Animated Golden Sync Dots Bridging Both Bubbles!
        const k = i - 110;
        if (k < 4) {
          // Animated golden conversation flow dots arcing top-right between bubbles
          const s = k / 3;
          const pulse = 0.5 + 0.5 * Math.sin(t * 3.8 - k * 0.9);
          lx = 0.25 + s * 0.78;
          ly = 0.85 - s * 0.25 + Math.sin(s * Math.PI) * 0.24;
          lz = 0.12;
          sc = 0.12 + pulse * 0.04;
          col = pulse > 0.65 ? GOLD : MAGENTA;
        } else {
          // 6 dark-indigo depth-backing corners giving both speech bubbles sculptural thickness
          const bPts: Array<[number, number, number]> = [
            [-1.35, 0.85, -0.38], [-0.22, 0.85, -0.38], [-1.35, 0.08, -0.38],
            [0.22, -0.72, 0.04], [1.35, -0.72, 0.04], [1.35, 0.08, 0.04],
          ];
          const bp = bPts[(k - 4) % bPts.length];
          lx = bp[0];
          ly = bp[1] + (k < 7 ? bobL : bobR);
          lz = bp[2];
          sc = 0.19;
          col = INDIGO;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        // Left cobalt bubble (5)
        [-0.36, 0.24, -0.04, NAVY], [-0.14, 0.24, -0.04, COBALT],
        [-0.36, 0.04, -0.04, COBALT], [-0.14, 0.04, -0.04, NAVY],
        [-0.25, 0.14, 0.08, WHITE],
        // Right emerald bubble (5)
        [0.12, -0.04, 0.08, EMERALD], [0.36, -0.04, 0.08, TEAL],
        [0.12, -0.24, 0.08, TEAL], [0.36, -0.24, 0.08, EMERALD],
        [0.24, -0.14, 0.18, WHITE],
        // Gold connector pips (2)
        [0.12, 0.26, 0.04, GOLD], [-0.36, -0.16, -0.04, NAVY],
      ];
      const p = pts[slot];
      const ry = -0.18 + Math.sin(t * 0.45) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.14);
      return { dx, dy, dz, rx: 0.14, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     RANGE 1 — Sculpted 3D Swiss Army Multi-Tool Knife with 4 Fanned Blades/Tools!
     ("Versatility across frontend, backend, mobile, tooling & systems")
     -------------------------------------------------------------------------- */
  "range-s3-swiss-army": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.22;
      const rotY = -0.2 + Math.sin(t * 0.3) * 0.2;
      const rotX = 0.14;
      const fanPulse = Math.sin(t * 1.45) * 0.09;

      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = RUBY;
      let rzLocal = 0;

      if (i < 36) {
        // Front Ruby-Red Rounded Handle Scale + Crisp White Swiss Cross Emblem (36)
        const p = KNIFE_BODY_36[i];
        lx = p.gx * P;
        ly = -0.35 + p.gy * P;
        lz = p.isCross ? 0.26 : 0.18;
        sc = p.isCross ? 0.182 : 0.198;
        col = p.isCross ? WHITE : p.isRim ? "#9c1939" : RUBY;
      } else if (i < 54) {
        // Dark-Indigo / Steel Inner Liner & Rear Handle Backing (18)
        const k = i - 36;
        const c = k % 9;
        const r = Math.floor(k / 9); // 0..1
        lx = (c - 4) * P;
        ly = -0.35 + (r === 0 ? -0.9 : 0.9) * P;
        lz = -0.14;
        sc = 0.198;
        col = c === 0 || c === 8 ? GOLD : INDIGO;
      } else if (i < 74) {
        // Tool 1 (Upper-Left): Gleaming Long Silver/Cobalt Folding Blade fanning up-left! (20)
        const k = i - 54;
        const angle = 2.15 + fanPulse;
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const pivotX = -3.4 * P;
        const pivotY = -0.35 + 0.7 * P;
        // 2-wide tapered blade profile (10 lengths x 2 widths)
        const step = Math.floor(k / 2); // 0..9
        const edge = k % 2; // 0: spine, 1: sharpened edge
        const rLen = (step + 1.1) * 0.195;
        const wOff = edge === 0 ? -0.09 : step >= 8 ? -0.02 : 0.09;
        lx = pivotX + ca * rLen - sa * wOff;
        ly = pivotY + sa * rLen + ca * wOff;
        lz = 0.02;
        sc = step >= 8 ? 0.145 : 0.175;
        col = edge === 0 ? STEEL : step >= 6 ? WHITE : SILVER;
        rzLocal = angle;
      } else if (i < 90) {
        // Tool 2 (Upper-Center): Golden Flathead Screwdriver / Wrench Blade fanning straight up! (16)
        const k = i - 74;
        const angle = 1.48 - fanPulse * 0.7;
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const pivotX = -0.8 * P;
        const pivotY = -0.35 + 1.1 * P;
        let rLen = 0, wOff = 0;
        if (k < 10) {
          rLen = (k + 1) * 0.175;
          wOff = 0;
          sc = 0.155;
          col = k >= 8 ? GOLD : SILVER;
        } else {
          // Open wrench jaw / screwdriver head at tip (6)
          const jawPts: Array<[number, number]> = [
            [1.92, -0.18], [1.92, 0.18], [2.1, -0.22],
            [2.1, 0.22], [2.25, -0.14], [2.25, 0.14],
          ];
          const jp = jawPts[k - 10];
          rLen = jp[0];
          wOff = jp[1];
          sc = 0.145;
          col = GOLD;
        }
        lx = pivotX + ca * rLen - sa * wOff;
        ly = pivotY + sa * rLen + ca * wOff;
        lz = -0.02;
        rzLocal = angle;
      } else if (i < 106) {
        // Tool 3 (Upper-Right): Vibrant Emerald Saw / Scissors Blade fanning up-right! (16)
        const k = i - 90;
        const angle = 0.84 + fanPulse;
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const pivotX = 2.6 * P;
        const pivotY = -0.35 + 0.75 * P;
        const step = Math.floor(k / 2); // 0..7
        const isTooth = k % 2 === 1;
        const rLen = (step + 1.1) * 0.205;
        const wOff = isTooth ? 0.145 : -0.06;
        lx = pivotX + ca * rLen - sa * wOff;
        ly = pivotY + sa * rLen + ca * wOff;
        lz = 0.04;
        sc = isTooth ? 0.13 : 0.165;
        col = isTooth ? EMERALD : COBALT;
        rzLocal = angle;
      } else {
        // Tool 4 (Lower-Right): Tight Spiral Corkscrew + Anchored Brass Keyring Loop (14)
        const k = i - 106;
        if (k < 8) {
          // Tightly coiled spiral corkscrew anchored cleanly to underside of knife
          const u = k / 7;
          const spiralA = u * Math.PI * 3.0;
          lx = 2.45 * P + u * 0.24 + Math.cos(spiralA) * 0.095;
          ly = -0.68 - u * 0.56;
          lz = Math.sin(spiralA) * 0.1;
          sc = 0.148;
          col = k % 2 === 0 ? VIOLET : GOLD;
        } else {
          // 6-cube tight brass lanyard keyring anchored cleanly to far left handle cap
          const a = ((k - 8) / 6) * Math.PI * 2;
          lx = -4.98 * P + Math.cos(a) * 0.17;
          ly = -0.35 + Math.sin(a) * 0.17;
          lz = 0;
          sc = 0.138;
          col = GOLD;
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, rzLocal * 0.15, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        // Crimson handle + center white cross (5)
        [-0.36, -0.14, 0, RUBY], [-0.18, -0.14, 0, RUBY], [0, -0.14, 0.04, WHITE],
        [0.18, -0.14, 0, RUBY], [0.36, -0.14, 0, RUBY],
        // 3 fanned tools above + corkscrew below (7)
        [-0.34, 0.12, 0, SILVER], [-0.42, 0.34, 0, WHITE],
        [-0.04, 0.16, 0, SILVER], [-0.02, 0.38, 0, GOLD],
        [0.24, 0.12, 0, COBALT], [0.38, 0.32, 0, EMERALD],
        [0.26, -0.34, 0, GOLD],
      ];
      const p = pts[slot];
      const ry = -0.2 + Math.sin(t * 0.45) * 0.25;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.14);
      return { dx, dy, dz, rx: 0.14, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     RANGE 2 — Sculpted Artist's Palette + 5 Vivid Paint Swatches + Angled Paintbrush!
     -------------------------------------------------------------------------- */
  "range-s3-palette-brush": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.235;
      const rotY = -0.24 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.22;
      const brushSway = Math.sin(t * 1.7) * 0.08;

      let lx = 0, ly = 0, lz = 0, sc = 0.205, col = NAVY;
      let rzLocal = 0;

      if (i < 54) {
        // Sculpted kidney-shaped wooden/indigo artist's palette board with thumb hole (54)
        const p = PALETTE_BOARD_54[i % PALETTE_BOARD_54.length];
        lx = p.gx * P;
        ly = p.gy * P;
        lz = 0;
        sc = 0.21;
        // Warm cream-ivory center strictly framed inside a rich dark-indigo outer rim!
        col = p.isRim ? INDIGO : "#e6daf5";
      } else if (i < 74) {
        // 20-cube Solid Rear Depth Rim on Palette (sculptural thickness!)
        const k = i - 54;
        const a = (k / 20) * Math.PI * 2;
        lx = Math.cos(a) * 4.55 * P;
        ly = Math.sin(a) * 3.55 * P;
        lz = -0.24;
        sc = 0.2;
        col = NAVY;
      } else if (i < 99) {
        // 5 Vivid Raised 3D Paint Swatch Globs arcing around the palette (5 swatches x 5 cubes = 25!)
        const k = i - 74;
        const sw = Math.floor(k / 5); // 0..4
        const sub = k % 5;
        const swatchCenters: Array<[number, number, string, string]> = [
          [-3.1, -1.6, COBALT, SKY],
          [-3.3, 1.0, EMERALD, "#64f0c5"],
          [-1.3, 2.55, GOLD, "#ffe08a"],
          [1.55, 2.45, MAGENTA, ROSE],
          [3.35, 1.25, VIOLET, "#b291f2"],
        ];
        const scDef = swatchCenters[sw % 5];
        const offsets: Array<[number, number, number]> = [
          [0, 0, 0.36],
          [-0.52, 0, 0.22],
          [0.52, 0, 0.22],
          [0, -0.52, 0.22],
          [0, 0.52, 0.22],
        ];
        const off = offsets[sub];
        const pulse = 1 + Math.max(0, Math.sin(t * 2.2 - sw * 1.1)) * 0.14;
        lx = (scDef[0] + off[0]) * P;
        ly = (scDef[1] + off[1]) * P;
        lz = off[2] * pulse;
        sc = sub === 0 ? 0.185 : 0.155;
        col = sub === 0 ? scDef[3] : scDef[2];
      } else {
        // 21-cube Iconic Diagonal 3D Paintbrush Resting Through the Palette!
        const k = i - 99;
        const angle = 0.74 + brushSway; // angled up-right across lower-right thumb hole
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const cx = 0.45;
        const cy = -0.35;
        if (k < 12) {
          // Tapered dark-indigo/amber wooden handle extending down-left to up-right
          const u = k - 5.5;
          const dist = u * 0.24;
          lx = cx + ca * dist;
          ly = cy + sa * dist;
          lz = 0.48 + (k >= 6 ? 0.08 : -0.04);
          sc = 0.155 + (k / 12) * 0.035;
          col = k < 3 ? GOLD : k % 2 === 0 ? INDIGO : NAVY;
        } else if (k < 15) {
          // 3-cube gleaming silver metal ferrule collar
          const f = k - 12;
          const dist = (6.6 + f * 0.65) * 0.24;
          lx = cx + ca * dist;
          ly = cy + sa * dist;
          lz = 0.58;
          sc = 0.185;
          col = SILVER;
        } else {
          // 6-cube plush pointed bristle tuft dipped in glowing emerald & magenta paint!
          const bPts: Array<[number, number, string]> = [
            [8.7, -0.22, INDIGO], [8.7, 0.22, INDIGO],
            [9.4, -0.26, EMERALD], [9.4, 0.26, EMERALD],
            [10.2, 0, EMERALD], [10.9, 0, MAGENTA],
          ];
          const bp = bPts[k - 15];
          const dist = bp[0] * 0.24;
          const wOff = bp[1] * 0.24;
          lx = cx + ca * dist - sa * wOff;
          ly = cy + sa * dist + ca * wOff;
          lz = 0.62;
          sc = k === 20 ? 0.145 : 0.175;
          col = bp[2];
        }
        rzLocal = angle;
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, rzLocal * 0.1, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        // Palette silhouette (5)
        [-0.34, 0.12, 0, INDIGO], [-0.24, -0.22, 0, INDIGO],
        [0.06, 0.28, 0, INDIGO], [0.32, 0.12, 0, INDIGO],
        [0.0, -0.06, -0.04, "#e6daf5"],
        // 5 bright paint globs (5)
        [-0.24, -0.06, 0.12, COBALT], [-0.2, 0.16, 0.12, EMERALD],
        [0.02, 0.22, 0.12, GOLD], [0.22, 0.12, 0.12, MAGENTA],
        [0.24, -0.12, 0.12, VIOLET],
        // Brush tip (2)
        [0.14, -0.26, 0.2, NAVY], [0.36, 0.34, 0.2, EMERALD],
      ];
      const p = pts[slot];
      const ry = -0.22 + Math.sin(t * 0.45) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.22);
      return { dx, dy, dz, rx: 0.22, ry, rz: 0, scale: sc, color: p[3] };
    },
  },

  /* --------------------------------------------------------------------------
     RANGE 3 — Open 3D Engineer's Cantilever Toolbox Brimming with Wrench, Gear & Handle!
     -------------------------------------------------------------------------- */
  "range-s3-toolbox": {
    hero(idx, _count, t) {
      const i = ((idx % 120) + 120) % 120;
      const P = 0.225;
      const rotY = -0.34 + Math.sin(t * 0.3) * 0.22;
      const rotX = 0.24;
      const toolBob = Math.sin(t * 1.9) * 0.06;

      let lx = 0, ly = 0, lz = 0, sc = 0.195, col = RUBY;

      if (i < 54) {
        // Classic Crimson & Dark-Indigo Rectangular Toolbox Chest (front, back, left, right walls)
        if (i < 24) {
          // Front wall (8 wide x 3 tall = 24)
          const c = (i % 8) - 3.5;
          const r = Math.floor(i / 8) - 2.6;
          lx = c * P;
          ly = r * P;
          lz = 1.65 * P;
          // Two gleaming golden clasp latches on the top front rim!
          const isLatch = r > -1 && (c === -1.5 || c === 1.5);
          const isBottom = r < -2;
          col = isLatch ? GOLD : isBottom ? INDIGO : RUBY;
        } else if (i < 42) {
          // Rear wall (6 wide x 3 tall = 18)
          const k = i - 24;
          const c = (k % 6) - 2.5;
          const r = Math.floor(k / 6) - 2.6;
          lx = c * 1.2 * P;
          ly = r * P;
          lz = -1.65 * P;
          col = r < -2 ? INDIGO : "#9c1939";
        } else {
          // Left & Right Side Walls (2 sides x 2 depths x 3 tall = 12)
          const k = i - 42;
          const side = k < 6 ? -3.5 : 3.5;
          const local = k % 6;
          const d = local < 3 ? -0.6 : 0.6;
          const r = (local % 3) - 2.6;
          lx = side * P;
          ly = r * P;
          lz = d * P;
          col = r < -2 ? INDIGO : NAVY;
        }
      } else if (i < 72) {
        // 18-cube Hinged Cantilever Lid Swung Open at Back + Arched Golden Carry Handle!
        const k = i - 54;
        if (k < 10) {
          // Angled open back lid panel (5 wide x 2 tall)
          const c = (k % 5) - 2;
          const r = Math.floor(k / 5);
          lx = c * 1.45 * P;
          ly = (0.35 + r * 0.95) * P;
          lz = (-2.1 - r * 0.65) * P;
          sc = 0.19;
          col = r === 1 ? INDIGO : RUBY;
        } else {
          // 8-cube Iconic Arched Golden Carry Handle rising proudly across the top!
          const h = k - 10; // 0..7
          const handlePts: Array<[number, number]> = [
            [-2.4, 0.7], [-2.4, 1.7], [-2.1, 2.65],
            [-1.1, 3.05], [0, 3.05], [1.1, 3.05],
            [2.1, 2.65], [2.4, 1.7],
          ];
          const hp = handlePts[h];
          lx = hp[0] * P;
          ly = hp[1] * P;
          lz = 0.25 * P;
          sc = 0.18;
          col = h === 3 || h === 4 || h === 5 ? GOLD : INDIGO;
        }
      } else if (i < 90) {
        // 18-cube Rising Silver Open-End Wrench Tilted Out Left Side of Toolbox!
        const k = i - 72;
        const wrenchPts: Array<[number, number, string]> = [
          // Angled shaft (8)
          [-1.2, -0.3, SILVER], [-1.5, 0.25, SILVER], [-1.8, 0.8, SILVER], [-2.1, 1.35, SILVER],
          [-2.4, 1.9, SILVER], [-2.7, 2.45, SILVER], [-3.0, 3.0, SILVER], [-3.3, 3.55, SILVER],
          // Distinct open C-jaw wrench head at upper-left tip (10)
          [-3.85, 3.85, STEEL], [-3.15, 4.25, STEEL],
          [-4.25, 4.35, SILVER], [-3.4, 4.85, SILVER],
          [-4.4, 4.95, WHITE], [-3.85, 5.25, WHITE],
          // Lower handle ring
          [-0.95, -0.85, STEEL], [-0.6, -0.5, STEEL],
          [-2.5, 2.1, COBALT], [-2.0, 1.15, COBALT],
        ];
        const wp = wrenchPts[k % wrenchPts.length];
        lx = wp[0] * P;
        ly = wp[1] * P + toolBob;
        lz = 0.45 * P;
        sc = 0.165;
        col = wp[2];
      } else if (i < 106) {
        // 16-cube Spinning Emerald & Gold Gear Wheel Rising from Center-Right of Toolbox!
        const k = i - 90;
        const spin = t * 1.15;
        const gCx = 1.45 * P;
        const gCy = 1.35 * P - toolBob * 0.5;
        if (k < 8) {
          const a = (k / 8) * Math.PI * 2 + spin;
          lx = gCx + Math.cos(a) * 0.95 * P;
          ly = gCy + Math.sin(a) * 0.95 * P;
          lz = -0.25 * P;
          sc = 0.155;
          col = EMERALD;
        } else if (k < 14) {
          const a = ((k - 8) / 6) * Math.PI * 2 + spin;
          lx = gCx + Math.cos(a) * 1.52 * P;
          ly = gCy + Math.sin(a) * 1.52 * P;
          lz = -0.25 * P;
          sc = 0.145;
          col = k % 2 === 0 ? GOLD : EMERALD;
        } else {
          lx = gCx;
          ly = gCy;
          lz = (k === 14 ? -0.1 : -0.4) * P;
          sc = 0.16;
          col = INDIGO;
        }
      } else {
        // 14-cube Cobalt Screwdriver + Colorful Stack-Layer Cubes Peeking Inside Tray!
        const k = i - 106;
        if (k < 8) {
          // Upright cobalt-handled screwdriver tilted right
          const s = k;
          lx = (2.6 + s * 0.24) * P;
          ly = (-0.2 + s * 0.56) * P + toolBob * 0.7;
          lz = 0.65 * P;
          sc = s >= 4 ? 0.175 : 0.125;
          col = s >= 4 ? (s === 7 ? GOLD : COBALT) : SILVER;
        } else {
          // 6 vivid stack-layer cubes peeking out inside the toolbox tray
          const tPts: Array<[number, number, number, string]> = [
            [-0.4, 0.05, 0.35, COBALT], [0.45, 0.05, 0.35, EMERALD],
            [-0.1, 0.72, 0.15, GOLD], [0.6, 0.58, 0.75, MAGENTA],
            [-1.3, 0.05, -0.45, VIOLET], [1.9, 0.05, -0.45, SKY],
          ];
          const tp = tPts[k - 8];
          lx = tp[0] * P;
          ly = tp[1] * P;
          lz = tp[2] * P;
          sc = 0.175;
          col = tp[3];
        }
      }

      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini(idx, _cnt, t, boost, sc) {
      const slot = ((idx % 12) + 12) % 12;
      const pts: Array<[number, number, number, string]> = [
        // Crimson toolbox body (5)
        [-0.32, -0.22, 0.12, RUBY], [0, -0.22, 0.12, RUBY], [0.32, -0.22, 0.12, RUBY],
        [-0.22, -0.06, 0.14, GOLD], [0.22, -0.06, 0.14, GOLD],
        // Carry handle (3)
        [-0.22, 0.24, 0, INDIGO], [0, 0.32, 0, GOLD], [0.22, 0.24, 0, INDIGO],
        // Rising tools: silver wrench, emerald gear, cobalt driver (4)
        [-0.34, 0.16, 0.06, SILVER], [-0.4, 0.34, 0.06, WHITE],
        [0.14, 0.12, -0.08, EMERALD], [0.34, 0.18, 0.08, COBALT],
      ];
      const p = pts[slot];
      const ry = -0.32 + Math.sin(t * 0.45) * 0.24;
      const [dx, dy, dz] = rotateYX(p[0] * boost, p[1] * boost, p[2] * boost, ry, 0.24);
      return { dx, dy, dz, rx: 0.24, ry, rz: 0, scale: sc, color: p[3] };
    },
  },
};
