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

function simpleMini(
  idx: number,
  t: number,
  boost: number,
  sc: number,
  pal: PaletteSpec,
  mode: "ring" | "helix" | "stack" | "orb" | "grid",
) {
  const slot = idx % 10;
  const spin = t * 0.55;
  let lx = 0, ly = 0, lz = 0;
  if (mode === "ring") {
    const a = (slot / 10) * Math.PI * 2 + spin;
    lx = Math.cos(a) * 0.34 * boost;
    ly = Math.sin(a * 2) * 0.1 * boost;
    lz = Math.sin(a) * 0.34 * boost;
  } else if (mode === "helix") {
    const s = slot / 9;
    const strand = slot % 2 === 0 ? 0 : Math.PI;
    const a = s * Math.PI * 2 + spin + strand;
    lx = Math.cos(a) * 0.22 * boost;
    ly = (s - 0.5) * 0.62 * boost;
    lz = Math.sin(a) * 0.22 * boost;
  } else if (mode === "stack") {
    const row = Math.floor(slot / 3) - 1;
    const col = (slot % 3) - 1;
    [lx, ly, lz] = rotateYX(col * 0.2 * boost, row * 0.2 * boost, 0, spin * 0.5, 0.28);
  } else if (mode === "orb") {
    const a = (slot / 10) * Math.PI * 2 + spin;
    const r = slot < 2 ? 0 : 0.28;
    [lx, ly, lz] = rotateYX(Math.cos(a) * r * boost, Math.sin(a) * r * boost, (slot % 2 - 0.5) * 0.16 * boost, spin, 0.3);
  } else {
    const c = (slot % 3) - 1;
    const r = Math.floor(slot / 3) - 1;
    [lx, ly, lz] = rotateYX(c * 0.2 * boost, -0.05, r * 0.2 * boost, -0.4 + Math.sin(t * 0.4) * 0.2, 0.52);
  }
  return {
    dx: lx,
    dy: ly,
    dz: lz,
    rx: 0.25,
    ry: spin,
    rz: 0,
    scale: sc,
    color: slot % 3 === 0 ? pal.deep : slot % 2 === 0 ? pal.primary : pal.light,
  };
}

/**
 * Authentic archived PAST sculpture ideas from earlier versions (v1 abstract GameCube sculptures,
 * v2 literal prototypes, v4 non-overlapping passes) preserved so the user can compare EVERY idea
 * ever tried inside `/museum`!
 */
export const PAST_VARIANTS: Record<string, VariantEvaluator> = {
  // Past v1: Original Atmospheric Weather Gyro (JetStream v1)
  "past-v1-weather-gyro": {
    hero(idx, count, t, pal) {
      const ring = idx < count / 2 ? 0 : 1;
      const local = ring === 0 ? idx : idx - Math.floor(count / 2);
      const half = Math.max(1, Math.floor(count / 2));
      const a = (local / half) * Math.PI * 2 + t * (ring === 0 ? 0.55 : -0.45);
      const r = ring === 0 ? 1.55 : 1.05;
      const tilt = ring === 0 ? 0.65 : -0.65;
      const [x, y, z] = rotateYX(Math.cos(a) * r, Math.sin(a) * r * 0.25, Math.sin(a) * r, t * 0.35, tilt);
      return makeTarget(x, y, z, tilt, t * 0.35, 0, 0.21, ring === 0 ? pal.primary : pal.deep);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "ring"),
  },

  // Past v1: Floating Rippling Canvas Planes (LiveBoard v1)
  "past-v1-canvas-planes": {
    hero(idx, _count, t, pal) {
      const col = (idx % 12) - 5.5;
      const row = Math.floor(idx / 12) - 4.5;
      const wave = Math.sin(col * 0.55 + t * 1.6) * 0.26 + Math.cos(row * 0.6 + t * 1.2) * 0.18;
      const [x, y, z] = rotateYX(col * 0.34, wave, row * 0.34, -0.4 + Math.sin(t * 0.3) * 0.18, 0.54);
      return makeTarget(x, y, z, 0.54, -0.4, 0, 0.24, (Math.floor(col + 6) + Math.floor(row + 5)) % 2 === 0 ? pal.primary : pal.light);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "grid"),
  },

  // Past v2: Warm Analog Vacuum Tube Core + Stereo Harmonic Rings (Hearth v2)
  "past-v2-hearth-tube": {
    hero(idx, _count, t, pal) {
      const rotY = -0.2 + Math.sin(t * 0.32) * 0.2;
      const rotX = 0.2;
      let lx = 0, ly = 0, lz = 0, sc = 0.2, col = pal.primary;
      if (idx < 36) {
        const ring = Math.floor(idx / 12);
        const a = ((idx % 12) / 12) * Math.PI * 2 + t * 0.4;
        lx = Math.cos(a) * 0.45;
        ly = -0.5 + ring * 0.48;
        lz = Math.sin(a) * 0.45;
        sc = 0.22;
        col = ring === 1 ? "#ffd166" : "#ff9436";
      } else if (idx < 72) {
        const j = idx - 36;
        const a = (j / 36) * Math.PI * 2 + t * 0.8;
        const r = 1.15 + Math.sin(a * 4 + t * 2.5) * 0.16;
        lx = Math.cos(a) * r;
        ly = Math.sin(a * 2 + t * 2.0) * 0.35;
        lz = Math.sin(a) * r;
        sc = 0.17;
        col = pal.primary;
      } else {
        const j = idx - 72;
        const bar = Math.floor(j / 6) - 3.5;
        const lvl = j % 6;
        const h = 2.5 + Math.sin(t * 2.6 + bar * 0.8) * 2.0;
        lx = bar * 0.44;
        ly = -1.25 + lvl * 0.24;
        lz = -0.75;
        sc = lvl <= h ? 0.18 : 0.09;
        col = lvl <= h ? pal.deep : pal.light;
      }
      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "ring"),
  },

  // Past v1: Twin Double Helix (JaggerScript v1)
  "past-v1-twin-helix": {
    hero(idx, count, t, pal) {
      const strand = idx % 2;
      const u = idx / Math.max(count - 1, 1);
      const a = u * Math.PI * 5 + t * 0.85 + strand * Math.PI;
      const r = 0.96;
      const [x, y, z] = rotateYX(Math.cos(a) * r, (u - 0.5) * 3.1, Math.sin(a) * r, t * 0.2, 0.2);
      return makeTarget(x, y, z, 0.2, a, 0, 0.21, strand === 0 ? pal.primary : pal.deep);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "helix"),
  },

  // Past v2: Class Blueprint Frame -> Heap Object Allocations (JaggerScript v2)
  "past-v2-jaggerscript-heap": {
    hero(idx, _count, t, pal) {
      const rotY = -0.25 + Math.sin(t * 0.3) * 0.22;
      const rotX = 0.22;
      let lx = 0, ly = 0, lz = 0, sc = 0.21, col = pal.primary;
      if (idx < 48) {
        const colI = (idx % 8) - 3.5;
        const rowI = Math.floor(idx / 8) - 2.5;
        lx = -0.95 + colI * 0.22;
        ly = 0.72 + rowI * 0.22;
        lz = -0.15;
        col = rowI === 2.5 ? pal.deep : pal.light;
      } else {
        const j = idx - 48;
        const obj = Math.floor(j / 18); // 4 allocated heap cubes
        const k = j % 18;
        const ox = (obj % 2 === 0 ? -0.6 : 0.9) + Math.sin(t * 1.2 + obj) * 0.1;
        const oy = -0.58 - Math.floor(obj / 2) * 0.72;
        lx = ox + ((k % 3) - 1) * 0.2;
        ly = oy + (Math.floor(k / 3) % 3 - 1) * 0.2;
        lz = (k >= 9 ? 0.18 : -0.18);
        sc = 0.18;
        col = obj % 2 === 0 ? pal.primary : pal.deep;
      }
      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "stack"),
  },

  // Past v2: Tilted Solar Panel Array + Orbiting Sun (Palmetto v2)
  "past-v2-palmetto-array": {
    hero(idx, _count, t, pal) {
      const rotY = -0.35 + Math.sin(t * 0.25) * 0.2;
      const rotX = 0.28;
      let lx = 0, ly = 0, lz = 0, sc = 0.24, col = pal.primary;
      if (idx < 80) {
        const c = (idx % 10) - 4.5;
        const r = Math.floor(idx / 10) - 3.5;
        const [px, py, pz] = rotateYX(c * 0.3, r * 0.28, 0, 0, -0.62);
        lx = px;
        ly = -0.25 + py;
        lz = pz;
        col = (Math.floor(c + 5) + Math.floor(r + 4)) % 2 === 0 ? pal.deep : pal.primary;
      } else {
        const j = idx - 80;
        const a = (j / 40) * Math.PI * 2 + t * 0.6;
        const r = j < 20 ? 0.35 : 0.68;
        lx = 1.2 + Math.cos(a) * r;
        ly = 1.15 + Math.sin(a) * r;
        lz = 0.15;
        sc = j < 20 ? 0.2 : 0.14;
        col = "#f5b83d";
      }
      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "grid"),
  },

  // Past v4: Random Arena Octagonal Non-Overlapping Fighters (for comparison with restored v2!)
  "past-v4-arena-octagonal": {
    hero(idx, _count, t, pal) {
      const rotX = 0.54;
      const rotY = Math.sin(t * 0.24) * 0.16;
      let lx = 0, ly = 0, lz = 0, sc = 0.2, col = pal.primary;
      if (idx < 56) {
        const tier = Math.floor(idx / 28);
        const a = ((idx % 28) / 28) * Math.PI * 2;
        lx = Math.cos(a) * 1.92;
        ly = -0.38 + tier * 0.27;
        lz = Math.sin(a) * 1.92;
        sc = 0.22;
        col = tier === 1 ? pal.light : "#f2ecff";
      } else if (idx < 108) {
        const j = idx - 56;
        const isA = j < 26;
        const local = isA ? j : j - 26;
        const phase = (t % 2.4) / 2.4;
        const dist = 0.54 + Math.pow(Math.abs(phase * 2 - 1), 0.72) * 0.74;
        const orbitA = t * 0.5;
        const dir = isA ? -1 : 1;
        const fx = Math.cos(orbitA) * dist * dir;
        const fz = Math.sin(orbitA) * dist * dir;
        if (local < 20) {
          const ring = local < 10 ? 0 : 1;
          const k = local % 10;
          const a = (k / 10) * Math.PI * 2 + t * 2.2 * dir;
          const r = k < 2 ? 0 : 0.26;
          lx = fx + (k < 2 ? 0 : Math.cos(a) * r);
          ly = -0.18 + (k === 0 ? 0.2 : k === 1 ? -0.2 : ring === 0 ? -0.1 : 0.1);
          lz = fz + (k < 2 ? 0 : Math.sin(a) * r);
          sc = 0.165;
          col = isA ? "#7f5cd6" : "#d4729f";
        } else {
          const w = local - 20;
          const wa = t * 4.4 * dir + (isA ? 0 : Math.PI);
          const wr = 0.36 + w * 0.145;
          lx = fx + Math.cos(wa) * wr;
          ly = -0.14;
          lz = fz + Math.sin(wa) * wr;
          sc = 0.13;
          col = isA ? "#dcd0fc" : "#fad4e5";
        }
      } else {
        const j = idx - 108;
        const phase = (t % 2.4) / 2.4;
        const impact = Math.sin(Math.max(0, 1 - Math.abs(phase - 0.5) * 3.6) * Math.PI * 0.5);
        const a = (j / 12) * Math.PI * 2 + t * 0.8;
        lx = Math.cos(a) * (0.24 + impact * 1.15);
        ly = 0.25 + impact * 0.88;
        lz = Math.sin(a) * (0.24 + impact * 1.15);
        sc = 0.08 + impact * 0.12;
        col = "#f2ecff";
      }
      const [x, y, z] = rotateYX(lx, ly, lz, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, sc, col);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "orb"),
  },

  // Past v4: TSXLight 4 Stacked Render Planes (before Prism upgrade!)
  "past-v4-tsxlight-planes": {
    hero(idx, _count, t, pal) {
      const rotY = -0.42 + Math.sin(t * 0.26) * 0.18;
      const rotX = 0.38;
      const plane = Math.floor(idx / 30); // 0..3
      const k = idx % 30;
      const c = (k % 6) - 2.5;
      const r = Math.floor(k / 6) - 2;
      const wave = Math.sin(t * 2.0 - plane * 0.8) * 0.1;
      const [x, y, z] = rotateYX(c * 0.34, (plane - 1.5) * 0.72 + wave, r * 0.34, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, 0.21, plane === 3 ? "#f2ecff" : plane === 0 ? pal.deep : pal.primary);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "stack"),
  },

  // Past v2: Rengine Pure Nested GameCube (without outer face-rotating squares!)
  "past-v2-rengine-nested": {
    hero(idx, _count, t, pal) {
      const rotX = 0.46 + Math.sin(t * 0.35) * 0.08;
      const rotY = t * 0.32;
      const vals = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
      const edges: Array<[number, number, number]> = [];
      for (const gx of vals) for (const gy of vals) for (const gz of vals) {
        if ((Math.abs(gx) === 2.5 ? 1 : 0) + (Math.abs(gy) === 2.5 ? 1 : 0) + (Math.abs(gz) === 2.5 ? 1 : 0) >= 2) {
          edges.push([gx, gy, gz]);
        }
      }
      if (idx < edges.length) {
        const [gx, gy, gz] = edges[idx];
        const [x, y, z] = rotateYX(gx * 0.38, gy * 0.38, gz * 0.38, rotY, rotX);
        return makeTarget(x, y, z, rotX, rotY, 0, 0.3, pal.primary);
      }
      const k = idx - edges.length;
      const gx = (k % 4) - 1.5;
      const gy = (Math.floor(k / 4) % 4) - 1.5;
      const gz = Math.floor(k / 16) - 1.5;
      const [x, y, z] = rotateYX(gx * 0.32, gy * 0.32, gz * 0.32, -t * 0.55, rotX);
      return makeTarget(x, y, z, rotX, -t * 0.55, 0, 0.2, k % 2 === 0 ? pal.light : pal.deep);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "orb"),
  },

  // Past v1: Original Contact Beacon Rings (before Envelope!)
  "past-v1-contact-beacon": {
    hero(idx, _count, t, pal) {
      const rotY = t * 0.35;
      const rotX = 0.35;
      const ring = Math.floor(idx / 30); // 4 concentric pulsing signal rings
      const a = ((idx % 30) / 30) * Math.PI * 2 + t * (ring % 2 === 0 ? 0.5 : -0.4);
      const r = 0.45 + ring * 0.42 + Math.sin(t * 2.2 - ring * 0.9) * 0.08;
      const [x, y, z] = rotateYX(Math.cos(a) * r, (ring - 1.5) * 0.35, Math.sin(a) * r, rotY, rotX);
      return makeTarget(x, y, z, rotX, rotY, 0, 0.2, ring === 0 ? "#f2ecff" : ring % 2 === 0 ? pal.primary : pal.deep);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "ring"),
  },

  // Past v1: Portfolio Four Revolving Vertical Pillars (before Fanned Browser Windows!)
  "past-v1-four-facets": {
    hero(idx, _count, t, pal) {
      const pillar = Math.floor(idx / 30); // 4 pillars
      const k = idx % 30;
      const a = (pillar * Math.PI) / 2 + t * 0.45;
      const px = Math.cos(a) * 1.15;
      const pz = Math.sin(a) * 1.15;
      const gx = (k % 2 - 0.5) * 0.26;
      const gy = (Math.floor(k / 2) - 7) * 0.2;
      const [x, y, z] = rotateYX(px + gx, gy, pz, 0.2, 0.22);
      return makeTarget(x, y, z, 0.22, a, 0, 0.2, pillar % 2 === 0 ? pal.primary : pal.deep);
    },
    mini: (idx, _cnt, t, boost, sc, pal) => simpleMini(idx, t, boost, sc, pal, "stack"),
  },
};
