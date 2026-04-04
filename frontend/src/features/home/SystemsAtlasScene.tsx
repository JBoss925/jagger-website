import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneSection } from "../../types/content";

type SystemsAtlasSceneProps = {
  sections: SceneSection[];
  activeSectionId: string;
  reducedMotion: boolean;
};

type PlanetSurfaceKind =
  | "gas_giant"
  | "earth_like"
  | "desert_rocky"
  | "ice_world"
  | "storm_world"
  | "volcanic";

type PlanetSurfaceVariant = {
  kind: PlanetSurfaceKind;
  palette: string[];
  ringColor: string;
  inactiveTint: string;
  emissiveColor: string;
  rotationSpeed: number;
  seed: number;
};

type RocketOrbitVariant = {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  phaseOffset: number;
  direction: 1 | -1;
  lift: number;
};

const nodeVariants = [
  {
    scale: 1.22,
    ringScale: 1.18,
    ringWidth: 0.2,
    ringRotation: [Math.PI / 2.55, 0.18, -0.42] as [number, number, number],
    extraRings: []
  },
  {
    scale: 0.88,
    ringScale: 1.02,
    ringWidth: 0.16,
    ringRotation: [Math.PI / 2.1, 0.5, 0.28] as [number, number, number],
    extraRings: [
      {
        scale: 1.26,
        width: 0.08,
        rotation: [Math.PI / 2.24, -0.24, 0.52] as [number, number, number],
        opacity: 0.18
      }
    ]
  },
  {
    scale: 1.45,
    ringScale: 1.34,
    ringWidth: 0.24,
    ringRotation: [Math.PI / 2.78, -0.34, 0.16] as [number, number, number],
    extraRings: [
      {
        scale: 1.64,
        width: 0.1,
        rotation: [Math.PI / 2.36, 0.2, -0.58] as [number, number, number],
        opacity: 0.22
      }
    ]
  },
  {
    scale: 0.74,
    ringScale: 0.9,
    ringWidth: 0.12,
    ringRotation: [Math.PI / 2.02, 0.12, 0.68] as [number, number, number],
    extraRings: []
  },
  {
    scale: 1.08,
    ringScale: 1.08,
    ringWidth: 0.17,
    ringRotation: [Math.PI / 2.42, -0.46, -0.2] as [number, number, number],
    extraRings: [
      {
        scale: 1.3,
        width: 0.07,
        rotation: [Math.PI / 2.26, 0.38, 0.34] as [number, number, number],
        opacity: 0.16
      },
      {
        scale: 1.46,
        width: 0.05,
        rotation: [Math.PI / 2.12, -0.14, -0.72] as [number, number, number],
        opacity: 0.12
      }
    ]
  },
  {
    scale: 0.96,
    ringScale: 1.12,
    ringWidth: 0.18,
    ringRotation: [Math.PI / 2.64, 0.28, -0.12] as [number, number, number],
    extraRings: []
  }
];

const planetSurfaceVariants: PlanetSurfaceVariant[] = [
  {
    kind: "gas_giant",
    palette: ["#d8c8ac", "#b78f63", "#8d5d44", "#f2ddb9"],
    ringColor: "#d5c4a0",
    inactiveTint: "#d4d7e1",
    emissiveColor: "#9dc4ff",
    rotationSpeed: 0.035,
    seed: 11
  },
  {
    kind: "earth_like",
    palette: ["#2b5d86", "#3e85b6", "#3f7a4d", "#85bc6d", "#eef6ff"],
    ringColor: "#c8d9f2",
    inactiveTint: "#d9e4ef",
    emissiveColor: "#8de7c1",
    rotationSpeed: 0.04,
    seed: 23
  },
  {
    kind: "storm_world",
    palette: ["#2b415c", "#4d6587", "#7e91ad", "#ced8e7", "#c48c61"],
    ringColor: "#d8d4c7",
    inactiveTint: "#d8dde7",
    emissiveColor: "#f7a95b",
    rotationSpeed: 0.028,
    seed: 37
  },
  {
    kind: "desert_rocky",
    palette: ["#735038", "#a8764d", "#d9b17a", "#553828", "#ead2aa"],
    ringColor: "#d9c3a1",
    inactiveTint: "#d9d4cd",
    emissiveColor: "#f7a95b",
    rotationSpeed: 0.032,
    seed: 41
  },
  {
    kind: "ice_world",
    palette: ["#a9d0ee", "#ecf8ff", "#6b8ca8", "#415b72", "#f7fcff"],
    ringColor: "#e7f5ff",
    inactiveTint: "#d8e3ee",
    emissiveColor: "#57d0ff",
    rotationSpeed: 0.024,
    seed: 53
  },
  {
    kind: "volcanic",
    palette: ["#6b2f1f", "#8d3d24", "#c75b2b", "#eb7a34", "#ffb15c"],
    ringColor: "#dba06a",
    inactiveTint: "#dfc6b3",
    emissiveColor: "#ff9b47",
    rotationSpeed: 0.03,
    seed: 67
  }
];

const rocketOrbitVariants: RocketOrbitVariant[] = [
  { radius: 2.2, tiltX: 0.28, tiltZ: -0.22, speed: 0.74, phaseOffset: 0.2, direction: 1, lift: 0.18 },
  { radius: 1.75, tiltX: -0.16, tiltZ: 0.2, speed: 0.82, phaseOffset: 1.1, direction: -1, lift: 0.1 },
  { radius: 2.7, tiltX: 0.18, tiltZ: 0.14, speed: 0.62, phaseOffset: 2.3, direction: 1, lift: 0.2 },
  { radius: 1.5, tiltX: -0.24, tiltZ: -0.18, speed: 0.9, phaseOffset: 0.8, direction: -1, lift: 0.08 },
  { radius: 2.05, tiltX: 0.2, tiltZ: 0.26, speed: 0.76, phaseOffset: 2.9, direction: 1, lift: 0.14 },
  { radius: 2.1, tiltX: -0.2, tiltZ: 0.12, speed: 0.7, phaseOffset: 1.9, direction: -1, lift: 0.16 }
];

const circularSpriteTextureCache = new Map<string, THREE.CanvasTexture>();
const planetTextureCache = new Map<string, { map: THREE.CanvasTexture; emissiveMap: THREE.CanvasTexture }>();

function createSeededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function getCircularSpriteTexture(key: string, midAlpha: number) {
  const cached = circularSpriteTextureCache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create circular sprite texture context.");
  }

  const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.68, `rgba(255,255,255,${midAlpha})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  circularSpriteTextureCache.set(key, texture);
  return texture;
}

function fillCanvas(context: CanvasRenderingContext2D, color: string, size: number) {
  context.fillStyle = color;
  context.fillRect(0, 0, size, size);
}

function drawSoftBlob(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  opacity: number
) {
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawGasGiant(context: CanvasRenderingContext2D, size: number, variant: PlanetSurfaceVariant, rng: () => number) {
  const baseGradient = context.createRadialGradient(
    size * 0.48,
    size * 0.44,
    size * 0.06,
    size * 0.5,
    size * 0.5,
    size * 0.72
  );
  baseGradient.addColorStop(0, variant.palette[3]);
  baseGradient.addColorStop(0.32, variant.palette[0]);
  baseGradient.addColorStop(0.68, variant.palette[1]);
  baseGradient.addColorStop(1, variant.palette[2]);
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 18; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.08 + rng() * 0.1),
      size * (0.03 + rng() * 0.05),
      variant.palette[index % variant.palette.length],
      0.05 + rng() * 0.08
    );
  }

  for (let index = 0; index < 14; index += 1) {
    const bandY = (index / 14) * size;
    const bandHeight = size * (0.05 + rng() * 0.04);
    const bandColor = variant.palette[index % variant.palette.length];
    context.fillStyle = bandColor;
    context.globalAlpha = 0.32 + rng() * 0.22;
    context.beginPath();
    context.moveTo(0, bandY);
    for (let step = 0; step <= 24; step += 1) {
      const x = (step / 24) * size;
      const wave = Math.sin(step * 0.5 + index + rng() * 0.4) * bandHeight * 0.45;
      context.lineTo(x, bandY + wave);
    }
    context.lineTo(size, bandY + bandHeight);
    context.lineTo(0, bandY + bandHeight);
    context.closePath();
    context.fill();
  }

  context.globalAlpha = 0.9;
  drawSoftBlob(context, size * 0.68, size * 0.58, size * 0.13, size * 0.08, "#d78c5c", 0.38);
}

function drawEarthLike(context: CanvasRenderingContext2D, size: number, variant: PlanetSurfaceVariant, rng: () => number) {
  const oceanGradient = context.createRadialGradient(
    size * 0.5,
    size * 0.48,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.74
  );
  oceanGradient.addColorStop(0, variant.palette[1]);
  oceanGradient.addColorStop(0.55, variant.palette[0]);
  oceanGradient.addColorStop(1, "#214a6c");
  context.fillStyle = oceanGradient;
  context.fillRect(0, 0, size, size);
  context.globalAlpha = 1;

  for (let index = 0; index < 22; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.05 + rng() * 0.08),
      size * (0.03 + rng() * 0.05),
      variant.palette[index % 2 === 0 ? 1 : 0],
      0.03 + rng() * 0.05
    );
  }

  for (let index = 0; index < 8; index += 1) {
    context.fillStyle = index % 2 === 0 ? variant.palette[2] : variant.palette[3];
    context.beginPath();
    const centerX = size * (0.15 + rng() * 0.7);
    const centerY = size * (0.18 + rng() * 0.64);
    context.moveTo(centerX, centerY);
    for (let point = 0; point < 9; point += 1) {
      const angle = (point / 9) * Math.PI * 2;
      const radius = size * (0.05 + rng() * 0.08);
      context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * (0.6 + rng() * 0.8));
    }
    context.closePath();
    context.fill();
  }

  context.fillStyle = variant.palette[4];
  context.globalAlpha = 0.55;
  context.fillRect(0, 0, size, size * 0.08);
  context.fillRect(0, size * 0.92, size, size * 0.08);

  context.strokeStyle = "rgba(255,255,255,0.42)";
  context.lineWidth = size * 0.028;
  context.lineCap = "round";
  for (let index = 0; index < 5; index += 1) {
    context.beginPath();
    context.moveTo(size * rng() * 0.3, size * (0.18 + index * 0.15));
    context.bezierCurveTo(
      size * (0.28 + rng() * 0.12),
      size * (0.12 + index * 0.16),
      size * (0.6 + rng() * 0.18),
      size * (0.24 + index * 0.12),
      size * (0.7 + rng() * 0.24),
      size * (0.2 + index * 0.14)
    );
    context.stroke();
  }
  context.globalAlpha = 1;
}

function drawDesertRocky(context: CanvasRenderingContext2D, size: number, variant: PlanetSurfaceVariant, rng: () => number) {
  const baseGradient = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.76
  );
  baseGradient.addColorStop(0, variant.palette[2]);
  baseGradient.addColorStop(0.5, variant.palette[1]);
  baseGradient.addColorStop(1, variant.palette[0]);
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 160; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.01 + rng() * 0.025),
      size * (0.01 + rng() * 0.025),
      index % 4 === 0 ? variant.palette[3] : variant.palette[4],
      0.08 + rng() * 0.12
    );
  }

  context.strokeStyle = "rgba(255,231,188,0.22)";
  context.lineWidth = size * 0.014;
  for (let index = 0; index < 12; index += 1) {
    context.beginPath();
    context.moveTo(size * rng(), size * rng());
    context.lineTo(size * rng(), size * rng());
    context.stroke();
  }

  for (let index = 0; index < 8; index += 1) {
    context.strokeStyle = "rgba(66,42,24,0.24)";
    context.lineWidth = size * 0.012;
    context.beginPath();
    context.arc(size * rng(), size * rng(), size * (0.03 + rng() * 0.04), 0, Math.PI * 2);
    context.stroke();
  }
}

function drawIceWorld(context: CanvasRenderingContext2D, size: number, variant: PlanetSurfaceVariant, rng: () => number) {
  const baseGradient = context.createRadialGradient(
    size * 0.46,
    size * 0.42,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.72
  );
  baseGradient.addColorStop(0, variant.palette[4]);
  baseGradient.addColorStop(0.45, variant.palette[0]);
  baseGradient.addColorStop(0.82, variant.palette[2]);
  baseGradient.addColorStop(1, variant.palette[3]);
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 36; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.05 + rng() * 0.08),
      size * (0.03 + rng() * 0.06),
      variant.palette[index % 3 === 0 ? 0 : 2],
      0.05 + rng() * 0.08
    );
  }

  context.strokeStyle = "rgba(255,255,255,0.22)";
  context.lineWidth = size * 0.012;
  for (let index = 0; index < 22; index += 1) {
    context.beginPath();
    context.moveTo(size * rng(), size * rng());
    context.lineTo(size * rng(), size * rng());
    context.stroke();
  }

  for (let index = 0; index < 28; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.04 + rng() * 0.06),
      size * (0.015 + rng() * 0.03),
      variant.palette[index % 2 === 0 ? 1 : 3],
      0.12 + rng() * 0.16
    );
  }
}

function drawStormWorld(
  context: CanvasRenderingContext2D,
  emissiveContext: CanvasRenderingContext2D,
  size: number,
  variant: PlanetSurfaceVariant,
  rng: () => number
) {
  const baseGradient = context.createRadialGradient(
    size * 0.48,
    size * 0.46,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.72
  );
  baseGradient.addColorStop(0, variant.palette[3]);
  baseGradient.addColorStop(0.42, variant.palette[1]);
  baseGradient.addColorStop(1, variant.palette[0]);
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 22; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.06 + rng() * 0.08),
      size * (0.025 + rng() * 0.05),
      variant.palette[index % 3],
      0.05 + rng() * 0.08
    );
  }

  for (let index = 0; index < 12; index += 1) {
    context.strokeStyle = `${variant.palette[index % 4]}88`;
    context.lineWidth = size * (0.02 + rng() * 0.02);
    context.beginPath();
    context.moveTo(0, size * (index / 12));
    for (let step = 0; step <= 18; step += 1) {
      const x = (step / 18) * size;
      const y = size * (index / 12) + Math.sin(step * 0.8 + index) * size * 0.03;
      context.lineTo(x, y);
    }
    context.stroke();
  }

  drawSoftBlob(context, size * 0.65, size * 0.54, size * 0.12, size * 0.09, variant.palette[4], 0.46);
  drawSoftBlob(emissiveContext, size * 0.65, size * 0.54, size * 0.08, size * 0.055, "#ffb166", 0.38);
}

function drawVolcanic(
  context: CanvasRenderingContext2D,
  emissiveContext: CanvasRenderingContext2D,
  size: number,
  variant: PlanetSurfaceVariant,
  rng: () => number
) {
  const baseGradient = context.createRadialGradient(
    size * 0.5,
    size * 0.48,
    size * 0.06,
    size * 0.5,
    size * 0.5,
    size * 0.74
  );
  baseGradient.addColorStop(0, variant.palette[4]);
  baseGradient.addColorStop(0.36, variant.palette[2]);
  baseGradient.addColorStop(0.7, variant.palette[1]);
  baseGradient.addColorStop(1, variant.palette[0]);
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 95; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.02 + rng() * 0.05),
      size * (0.02 + rng() * 0.05),
      variant.palette[index % 3 === 0 ? 1 : 3],
      0.2 + rng() * 0.2
    );
  }

  for (let index = 0; index < 28; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.04 + rng() * 0.07),
      size * (0.04 + rng() * 0.07),
      variant.palette[index % 2 === 0 ? 2 : 4],
      0.06 + rng() * 0.1
    );
  }

  context.strokeStyle = "rgba(255,146,72,0.4)";
  emissiveContext.strokeStyle = "rgba(255,156,79,0.98)";
  for (let index = 0; index < 14; index += 1) {
    const startX = size * rng();
    const startY = size * rng();
    const endX = size * rng();
    const endY = size * rng();
    context.lineWidth = size * 0.022;
    emissiveContext.lineWidth = size * 0.013;
    context.beginPath();
    emissiveContext.beginPath();
    context.moveTo(startX, startY);
    emissiveContext.moveTo(startX, startY);
    context.bezierCurveTo(
      size * rng(),
      size * rng(),
      size * rng(),
      size * rng(),
      endX,
      endY
    );
    emissiveContext.bezierCurveTo(
      size * rng(),
      size * rng(),
      size * rng(),
      size * rng(),
      endX,
      endY
    );
    context.stroke();
    emissiveContext.stroke();
  }

  for (let index = 0; index < 10; index += 1) {
    drawSoftBlob(
      context,
      rng() * size,
      rng() * size,
      size * (0.03 + rng() * 0.04),
      size * (0.03 + rng() * 0.04),
      variant.palette[4],
      0.18 + rng() * 0.12
    );
    drawSoftBlob(
      emissiveContext,
      rng() * size,
      rng() * size,
      size * (0.018 + rng() * 0.028),
      size * (0.018 + rng() * 0.028),
      "#ffb35d",
      0.24 + rng() * 0.12
    );
  }
}

function createPlanetTextures(variant: PlanetSurfaceVariant) {
  const cacheKey = `${variant.kind}-${variant.seed}`;
  const cached = planetTextureCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const size = 768;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const emissiveCanvas = document.createElement("canvas");
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;

  const context = colorCanvas.getContext("2d");
  const emissiveContext = emissiveCanvas.getContext("2d");
  if (!context || !emissiveContext) {
    throw new Error("Failed to create planet texture contexts.");
  }

  const rng = createSeededRandom(variant.seed);
  fillCanvas(emissiveContext, "#000000", size);

  switch (variant.kind) {
    case "gas_giant":
      drawGasGiant(context, size, variant, rng);
      break;
    case "earth_like":
      drawEarthLike(context, size, variant, rng);
      break;
    case "desert_rocky":
      drawDesertRocky(context, size, variant, rng);
      break;
    case "ice_world":
      drawIceWorld(context, size, variant, rng);
      break;
    case "storm_world":
      drawStormWorld(context, emissiveContext, size, variant, rng);
      break;
    case "volcanic":
      drawVolcanic(context, emissiveContext, size, variant, rng);
      break;
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = 8;
  map.needsUpdate = true;

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.ClampToEdgeWrapping;
  emissiveMap.anisotropy = 8;
  emissiveMap.needsUpdate = true;

  const textures = { map, emissiveMap };
  planetTextureCache.set(cacheKey, textures);
  return textures;
}

function getOrbitPosition(center: THREE.Vector3, orbit: RocketOrbitVariant, angle: number) {
  const local = new THREE.Vector3(
    Math.cos(angle) * orbit.radius,
    Math.sin(angle * 1.4) * orbit.lift,
    Math.sin(angle) * orbit.radius
  );

  local.applyEuler(new THREE.Euler(orbit.tiltX, 0, orbit.tiltZ));
  return local.add(center);
}

function getTransferPoint(
  from: THREE.Vector3,
  to: THREE.Vector3,
  midpointLift: number,
  progress: number
) {
  const control = from.clone().lerp(to, 0.5);
  control.y += midpointLift;
  const first = from.clone().lerp(control, progress);
  const second = control.clone().lerp(to, progress);
  return first.lerp(second, progress);
}

function StaticStarfield({
  count,
  spread,
  height,
  size,
  opacity,
  color
}: {
  count: number;
  spread: number;
  height: [number, number];
  size: number;
  opacity: number;
  color: string;
}) {
  const sprite = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.68, "rgba(255,255,255,0.24)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  const positions = useMemo(() => {
    const values: number[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(
        THREE.MathUtils.randFloatSpread(spread),
        THREE.MathUtils.randFloat(height[0], height[1]),
        THREE.MathUtils.randFloatSpread(spread)
      );
    }

    return new Float32Array(values);
  }, [count, height, spread]);

  if (!sprite) {
    return null;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
        />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        alphaMap={sprite}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        alphaTest={0.08}
        depthWrite={false}
      />
    </points>
  );
}

function CircularParticles({
  count,
  bounds,
  color,
  size,
  opacity,
  speed = 0
}: {
  count: number;
  bounds: [number, number, number];
  color: string;
  size: number;
  opacity: number;
  speed?: number;
}) {
  const sprite = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.28)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values: number[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(
        THREE.MathUtils.randFloatSpread(bounds[0]),
        THREE.MathUtils.randFloatSpread(bounds[1]) + bounds[1] * 0.12,
        THREE.MathUtils.randFloatSpread(bounds[2])
      );
    }

    return new Float32Array(values);
  }, [bounds, count]);

  useFrame((state) => {
    if (!pointsRef.current || speed === 0) {
      return;
    }

    pointsRef.current.rotation.y = state.clock.elapsedTime * speed;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.08;
  });

  if (!sprite) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        alphaMap={sprite}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        alphaTest={0.08}
        depthWrite={false}
      />
    </points>
  );
}

function OrbitingDust({ sections }: { sections: SceneSection[] }) {
  const dustRefs = useRef<Array<THREE.Mesh | null>>([]);
  const dustSpecs = useMemo(
    () =>
      sections.flatMap((section, sectionIndex) => {
        const sectionVector = new THREE.Vector3(...section.position);
        const count = 12 + (sectionIndex % 3) * 4;
        const orbitDirection = sectionIndex % 2 === 0 ? 1 : -1;

        return Array.from({ length: count }, (_, particleIndex) => {
          const radius = 1.8 + (particleIndex % 5) * 0.22 + sectionIndex * 0.04;
          const speedJitter = THREE.MathUtils.randFloat(-0.02, 0.02);
          const speed = (0.12 + (particleIndex % 4) * 0.018 + speedJitter) * orbitDirection;
          const angleOffset = (particleIndex / count) * Math.PI * 2;
          const tilt = (sectionIndex - 2) * 0.12 + (particleIndex % 3) * 0.06;
          const verticalWave = 0.08 + (particleIndex % 4) * 0.03;
          const size = 0.022 + (particleIndex % 3) * 0.008;
          const planeTiltX = THREE.MathUtils.degToRad((sectionIndex - 2) * 4 + ((particleIndex % 4) - 1.5) * 2);
          const planeTiltZ = THREE.MathUtils.degToRad(((particleIndex % 5) - 2) * 2.5);
          const color = new THREE.Color(section.accent).offsetHSL(0.02, -0.08, 0.28);

          return {
            center: sectionVector,
            radius,
            speed,
            angleOffset,
            tilt,
            verticalWave,
            size,
            planeTiltX,
            planeTiltZ,
            color: `#${color.getHexString()}`
          };
        });
      }),
    [sections]
  );

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    dustRefs.current.forEach((particle, index) => {
      const spec = dustSpecs[index];
      if (!particle || !spec) {
        return;
      }

      const angle = elapsed * spec.speed + spec.angleOffset;
      const localPosition = new THREE.Vector3(
        Math.cos(angle) * spec.radius,
        Math.sin(angle * 1.7) * spec.verticalWave,
        Math.sin(angle + spec.tilt) * spec.radius
      );

      localPosition.applyEuler(new THREE.Euler(spec.planeTiltX, 0, spec.planeTiltZ));

      particle.position.set(
        spec.center.x + localPosition.x,
        spec.center.y + localPosition.y,
        spec.center.z + localPosition.z
      );
    });
  });

  return (
    <group>
      {dustSpecs.map((spec, index) => (
        <mesh
          key={index}
          ref={(node) => {
            dustRefs.current[index] = node;
          }}
        >
          <sphereGeometry args={[spec.size, 10, 10]} />
          <meshBasicMaterial
            color={spec.color}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function AtlasRig({ activeSection, reducedMotion }: { activeSection: SceneSection; reducedMotion: boolean }) {
  const targetPosition = useMemo(
    () => new THREE.Vector3(...activeSection.camera),
    [activeSection.camera]
  );
  const lookAtTarget = useMemo(
    () => new THREE.Vector3(...activeSection.target),
    [activeSection.target]
  );
  const workingTarget = useRef(new THREE.Vector3(...activeSection.target));

  useFrame((state, delta) => {
    const lerpFactor = 1 - Math.exp(-delta * 1.8);
    state.camera.position.lerp(targetPosition, lerpFactor);
    workingTarget.current.lerp(lookAtTarget, lerpFactor);
    state.camera.lookAt(workingTarget.current);

    if (!reducedMotion) {
      state.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
      state.scene.rotation.x = Math.cos(state.clock.elapsedTime * 0.05) * 0.015;
    }
  });

  return null;
}

function SceneRocket({
  sections,
  activeSectionId
}: {
  sections: SceneSection[];
  activeSectionId: string;
}) {
  const rocketRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Group>(null);
  const activeIndex = sections.findIndex((section) => section.id === activeSectionId);
  const currentIndexRef = useRef(activeIndex >= 0 ? activeIndex : 0);
  const orbitAngleRef = useRef(rocketOrbitVariants[currentIndexRef.current % rocketOrbitVariants.length].phaseOffset);
  const transferRef = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    startedAt: number;
    duration: number;
    targetIndex: number;
    targetAngle: number;
  } | null>(null);
  const forwardRef = useRef(new THREE.Vector3(1, 0, 0));

  useFrame((state, delta) => {
    const rocket = rocketRef.current;
    if (!rocket) {
      return;
    }

    const previousIndex = currentIndexRef.current;
    const nextIndex = activeIndex >= 0 ? activeIndex : previousIndex;
    const previousCenter = new THREE.Vector3(...sections[previousIndex].position);
    const previousOrbit = rocketOrbitVariants[previousIndex % rocketOrbitVariants.length];

    if (nextIndex !== previousIndex && !transferRef.current) {
      const currentAngle = orbitAngleRef.current;
      const currentPosition = getOrbitPosition(previousCenter, previousOrbit, currentAngle);
      const targetCenter = new THREE.Vector3(...sections[nextIndex].position);
      const targetOrbit = rocketOrbitVariants[nextIndex % rocketOrbitVariants.length];
      const targetAngle = targetOrbit.phaseOffset + (Math.PI * 0.6) * targetOrbit.direction;

      transferRef.current = {
        from: currentPosition,
        to: getOrbitPosition(targetCenter, targetOrbit, targetAngle),
        startedAt: state.clock.elapsedTime,
        duration: 1.05,
        targetIndex: nextIndex,
        targetAngle
      };
    }

    let nextPosition: THREE.Vector3;
    let lookTarget: THREE.Vector3;

    if (transferRef.current) {
      const { from, to, startedAt, duration, targetIndex, targetAngle } = transferRef.current;
      const progress = THREE.MathUtils.clamp((state.clock.elapsedTime - startedAt) / duration, 0, 1);
      nextPosition = getTransferPoint(from, to, 1.1, progress);
      lookTarget = getTransferPoint(from, to, 1.1, Math.min(progress + 0.08, 1));

      if (progress >= 1) {
        currentIndexRef.current = targetIndex;
        orbitAngleRef.current = targetAngle;
        transferRef.current = null;
      }
    } else {
      const orbit = rocketOrbitVariants[currentIndexRef.current % rocketOrbitVariants.length];
      const center = new THREE.Vector3(...sections[currentIndexRef.current].position);
      orbitAngleRef.current += delta * orbit.speed * orbit.direction;
      nextPosition = getOrbitPosition(center, orbit, orbitAngleRef.current);
      lookTarget = getOrbitPosition(center, orbit, orbitAngleRef.current + 0.08 * orbit.direction);
    }

    rocket.position.copy(nextPosition);
    const direction = lookTarget.clone().sub(nextPosition).normalize();
    const nextQuaternion = new THREE.Quaternion().setFromUnitVectors(forwardRef.current, direction);
    rocket.quaternion.slerp(nextQuaternion, 1 - Math.exp(-delta * 8));

    if (exhaustRef.current) {
      const transfering = Boolean(transferRef.current);
      const pulse = transfering
        ? 1.08 + Math.sin(state.clock.elapsedTime * 18) * 0.12
        : 0.82 + Math.sin(state.clock.elapsedTime * 8) * 0.04;
      exhaustRef.current.scale.setScalar(pulse);

      exhaustRef.current.children.forEach((child, index) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        const material = child.material as THREE.MeshBasicMaterial;
        if (index === 0) {
          material.opacity = transfering ? 0.72 : 0.48;
        } else if (index === 1) {
          material.opacity = transfering ? 0.96 : 0.76;
        } else {
          material.opacity = transfering ? 0.22 : 0.12;
        }
      });
    }
  });

  return (
    <group ref={rocketRef}>
      <group>
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.095, 0.42, 18]} />
          <meshStandardMaterial color="#fff1e2" emissive="#f7a95b" emissiveIntensity={0.14} roughness={0.38} metalness={0.18} />
        </mesh>
        <mesh position={[0.33, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.095, 0.18, 18]} />
          <meshStandardMaterial color="#e45f51" emissive="#e45f51" emissiveIntensity={0.14} roughness={0.32} metalness={0.1} />
        </mesh>
        <mesh position={[-0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.07, 0.12, 14]} />
          <meshStandardMaterial color="#b5cbe8" roughness={0.42} metalness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.038, 0.038]}>
          <sphereGeometry args={[0.06, 14, 14]} />
          <meshStandardMaterial color="#89d8ff" emissive="#57d0ff" emissiveIntensity={0.36} roughness={0.18} metalness={0.24} />
        </mesh>
        <mesh position={[-0.08, 0, 0.12]}>
          <boxGeometry args={[0.11, 0.03, 0.08]} />
          <meshStandardMaterial color="#e45f51" roughness={0.46} metalness={0.1} />
        </mesh>
        <mesh position={[-0.08, 0, -0.12]}>
          <boxGeometry args={[0.11, 0.03, 0.08]} />
          <meshStandardMaterial color="#e45f51" roughness={0.46} metalness={0.1} />
        </mesh>
        <mesh position={[-0.08, 0.12, 0]}>
          <boxGeometry args={[0.11, 0.08, 0.03]} />
          <meshStandardMaterial color="#e45f51" roughness={0.46} metalness={0.1} />
        </mesh>
        <mesh position={[-0.08, -0.12, 0]}>
          <boxGeometry args={[0.11, 0.08, 0.03]} />
          <meshStandardMaterial color="#e45f51" roughness={0.46} metalness={0.1} />
        </mesh>
        <group ref={exhaustRef} position={[-0.31, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <coneGeometry args={[0.068, 0.18, 16]} />
            <meshBasicMaterial color="#ff9b47" transparent opacity={0.62} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.024, 0]}>
            <coneGeometry args={[0.04, 0.14, 14]} />
            <meshBasicMaterial color="#ffd87f" transparent opacity={0.88} depthWrite={false} />
          </mesh>
          <mesh position={[0, -0.022, 0]} scale={[0.72, 0.82, 0.72]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshBasicMaterial color="#ff8a36" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function AtlasNode({
  section,
  active,
  variant,
  surfaceVariant
}: {
  section: SceneSection;
  active: boolean;
  variant: (typeof nodeVariants)[number];
  surfaceVariant: PlanetSurfaceVariant;
}) {
  const baseRadius = 0.56 * variant.scale;
  const ringRadius = 0.95 * variant.ringScale;
  const nodeScale = active ? 1.38 : 1;
  const { map, emissiveMap } = useMemo(() => createPlanetTextures(surfaceVariant), [surfaceVariant]);
  const ringColor = surfaceVariant.ringColor;
  const planetRef = useRef<THREE.Mesh>(null);
  const primaryRingRef = useRef<THREE.Mesh>(null);
  const extraRingRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (planetRef.current) {
      planetRef.current.rotation.y = elapsed * surfaceVariant.rotationSpeed + section.position[0] * 0.08;
      planetRef.current.rotation.z = Math.sin(elapsed * 0.08 + section.position[2]) * 0.05;
    }

    if (primaryRingRef.current) {
      primaryRingRef.current.rotation.x =
        variant.ringRotation[0] + Math.sin(elapsed * 0.18 + section.position[0]) * 0.1;
      primaryRingRef.current.rotation.y =
        variant.ringRotation[1] + Math.cos(elapsed * 0.14 + section.position[1]) * 0.12;
      primaryRingRef.current.rotation.z =
        variant.ringRotation[2] + Math.sin(elapsed * 0.12 + section.position[2]) * 0.08;
    }

    extraRingRefs.current.forEach((ring, index) => {
      const variantRing = variant.extraRings[index];
      if (!ring || !variantRing) {
        return;
      }

      ring.rotation.x =
        variantRing.rotation[0] + Math.sin(elapsed * (0.12 + index * 0.02) + section.position[2]) * 0.08;
      ring.rotation.y =
        variantRing.rotation[1] + Math.cos(elapsed * (0.1 + index * 0.03) + section.position[0]) * 0.1;
      ring.rotation.z =
        variantRing.rotation[2] + Math.sin(elapsed * (0.09 + index * 0.015) + section.position[1]) * 0.06;
    });
  });

  return (
    <group position={section.position} scale={nodeScale}>
      <mesh ref={planetRef}>
        <icosahedronGeometry args={[baseRadius, 4]} />
        <meshStandardMaterial
          map={map}
          color={active ? "#ffffff" : surfaceVariant.inactiveTint}
          emissive={surfaceVariant.emissiveColor}
          emissiveMap={emissiveMap}
          emissiveIntensity={active ? 0.4 : 0.14}
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>
      <mesh ref={primaryRingRef} rotation={variant.ringRotation}>
        <ringGeometry args={[ringRadius - variant.ringWidth / 2, ringRadius + variant.ringWidth / 2, 128]} />
        <meshBasicMaterial
          color={ringColor}
          side={THREE.DoubleSide}
          transparent
          opacity={active ? 0.92 : 0.42}
        />
      </mesh>
      {variant.extraRings.map((ring, index) => (
        <mesh
          key={index}
          ref={(node) => {
            extraRingRefs.current[index] = node;
          }}
          rotation={ring.rotation}
        >
          <ringGeometry
            args={[
              ringRadius * ring.scale - ring.width / 2,
              ringRadius * ring.scale + ring.width / 2,
              128
            ]}
          />
          <meshBasicMaterial
            color={ringColor}
            side={THREE.DoubleSide}
            transparent
            opacity={active ? Math.min(ring.opacity + 0.18, 0.42) : ring.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function SystemsAtlasScene({ sections, activeSectionId, reducedMotion }: SystemsAtlasSceneProps) {
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const linePoints = useMemo(
    () => sections.map((section) => new THREE.Vector3(...section.position)),
    [sections]
  );

  return (
    <>
      <color attach="background" args={["#040712"]} />
      <fog attach="fog" args={["#040712", 11, 26]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} color="#9dc4ff" />
      <pointLight position={[-6, 4, 8]} intensity={1.8} color="#57d0ff" />
      <pointLight position={[8, -1, 5]} intensity={1.2} color="#f7a95b" />
      <gridHelper args={[36, 36, "#14324a", "#09111f"]} position={[0, -4, 0]} />
      <StaticStarfield count={620} spread={34} height={[-6, 10]} size={0.08} opacity={0.94} color="#b7d6ff" />
      <StaticStarfield count={1840} spread={54} height={[-12, 18]} size={0.04} opacity={0.32} color="#88a8d6" />
      <CircularParticles count={220} bounds={[24, 14, 24]} size={0.2} opacity={0.72} color="#7bcfff" />
      <CircularParticles count={120} bounds={[20, 12, 20]} size={0.26} opacity={0.8} color="#c3dcff" speed={0.035} />
      <OrbitingDust sections={sections} />
      <Line points={linePoints} color="#4c7ab7" lineWidth={1.8} transparent opacity={0.45} />
      {sections.map((section, index) => (
        <AtlasNode
          key={section.id}
          section={section}
          active={section.id === activeSection.id}
          variant={nodeVariants[index % nodeVariants.length]}
          surfaceVariant={planetSurfaceVariants[index % planetSurfaceVariants.length]}
        />
      ))}
      <SceneRocket sections={sections} activeSectionId={activeSectionId} />
      <AtlasRig activeSection={activeSection} reducedMotion={reducedMotion} />
    </>
  );
}

export default SystemsAtlasScene;
