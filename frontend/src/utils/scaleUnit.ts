import { useEffect, useState } from "react";

const STANDARD_OS_DPRS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3];
const MIN_DESKTOP_SU = 0.85;
const MAX_DESKTOP_SU = 2.0;

type Listener = (su: number) => void;

const listeners = new Set<Listener>();
let initialized = false;
let currentSu = 1;
let lockedOsDpr: number | null = null;
let lastScreenW = 0;
let lastScreenH = 0;
let lastPhysW = 0;
let dprMediaQuery: MediaQueryList | null = null;
let dprMediaListener: (() => void) | null = null;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function estimateInitialOsDpr(dpr: number): number {
  if (typeof window === "undefined") return 1;
  const outerW = window.outerWidth;
  const innerW = window.innerWidth;

  // Cross-check outerWidth/innerWidth against valid OS DPI steps so we detect
  // initial browser zoom across refreshes WITHOUT false-triggering on side DevTools.
  if (outerW > 0 && innerW > 0) {
    const rawRatio = outerW / innerW;
    let bestOsDpr: number | null = null;
    let bestDiff = Infinity;

    for (const candidateOsDpr of STANDARD_OS_DPRS) {
      const impliedZoom = dpr / candidateOsDpr;
      if (impliedZoom < 0.24 || impliedZoom > 5.1) continue;
      // Allow ~2% + up to 24px window chrome border variance, rejecting side DevTools (~300px+)
      const expectedInner = outerW / impliedZoom;
      const borderDelta = outerW - innerW * impliedZoom;
      if (borderDelta < -32 || borderDelta > 48) continue;
      const diff = Math.abs(rawRatio - impliedZoom) / impliedZoom;
      if (diff < 0.06 && diff < bestDiff && expectedInner > 0) {
        bestDiff = diff;
        bestOsDpr = candidateOsDpr;
      }
    }

    if (bestOsDpr !== null) {
      return bestOsDpr;
    }
  }

  // Fallback: snap to nearest standard OS DPR if close, otherwise treat current DPR as 100% zoom
  const nearest = STANDARD_OS_DPRS.reduce((prev, curr) =>
    Math.abs(curr - dpr) < Math.abs(prev - dpr) ? curr : prev,
  );
  return Math.abs(nearest - dpr) < 0.04 ? nearest : dpr;
}

function computeScaleUnit(): number {
  if (typeof window === "undefined" || !window.screen) {
    return 1;
  }

  const dpr = Math.max(0.25, window.devicePixelRatio || 1);
  const screenW = window.screen.width || 1920;
  const screenH = window.screen.height || 1080;
  const physW = screenW * dpr;

  // Detect Firefox zoom where screen.width itself scales inversely with browser zoom
  // (keeping screen.width * dpr constant while screen.width changes).
  const isFirefoxScaledScreen =
    lastScreenW > 0 &&
    screenW !== lastScreenW &&
    Math.abs(physW - lastPhysW) < 8;

  const movedToDifferentMonitor =
    lastScreenW > 0 &&
    (screenW !== lastScreenW || screenH !== lastScreenH) &&
    !isFirefoxScaledScreen;

  if (lockedOsDpr === null || movedToDifferentMonitor) {
    lockedOsDpr = estimateInitialOsDpr(dpr);
  }

  lastScreenW = screenW;
  lastScreenH = screenH;
  lastPhysW = physW;

  // On phones / small mobile screens, keep 1px logical base unit.
  if (screenW <= 820 && screenH <= 960 && !isFirefoxScaledScreen) {
    return 1;
  }

  // Reference: 1.0px at 1080p (1920x1080), 1.3333px at 1440p (2560x1440).
  // Completely independent of window.innerWidth and window.innerHeight!
  const rawScreenSu = Math.min(screenW / 1920, screenH / 1080);

  if (isFirefoxScaledScreen) {
    // Firefox already divided screen.width/height by browser zoom.
    const unzoomedSu = clamp(rawScreenSu * (dpr / (lockedOsDpr || 1)), MIN_DESKTOP_SU, MAX_DESKTOP_SU);
    return clamp(unzoomedSu / (dpr / (lockedOsDpr || 1)), 0.25, 4);
  }

  const baseSu = clamp(rawScreenSu, MIN_DESKTOP_SU, MAX_DESKTOP_SU);
  const browserZoom = Math.max(0.25, dpr / (lockedOsDpr || 1));
  return clamp(baseSu / browserZoom, 0.25, 4);
}

function applyScaleUnit() {
  const next = computeScaleUnit();
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--su", `${next.toFixed(4)}px`);
  }
  if (Math.abs(next - currentSu) > 0.0005) {
    currentSu = next;
    for (const listener of listeners) {
      listener(currentSu);
    }
  } else {
    currentSu = next;
  }
}

function watchDprChanges() {
  if (typeof window === "undefined" || !window.matchMedia) return;
  if (dprMediaQuery && dprMediaListener) {
    dprMediaQuery.removeEventListener("change", dprMediaListener);
  }
  const dpr = window.devicePixelRatio || 1;
  dprMediaQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);
  dprMediaListener = () => {
    applyScaleUnit();
    watchDprChanges();
  };
  dprMediaQuery.addEventListener("change", dprMediaListener);
}

export function initScaleInvariantUnit(): void {
  if (typeof window === "undefined") return;
  applyScaleUnit();
  if (initialized) return;
  initialized = true;
  window.addEventListener("resize", applyScaleUnit);
  watchDprChanges();
}

export function getScaleUnit(): number {
  if (!initialized && typeof window !== "undefined") {
    initScaleInvariantUnit();
  }
  return currentSu;
}

export function subscribeScaleUnit(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type StudioViewportState = {
  su: number;
  isMobile: boolean;
  isCompactHeader: boolean;
  isCompactAudio: boolean;
};

function readStudioViewport(): StudioViewportState {
  const su = getScaleUnit();
  if (typeof window === "undefined") {
    return { su, isMobile: false, isCompactHeader: false, isCompactAudio: false };
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Transition to mobile cleanly only when the viewport can no longer hold the
  // full-size desktop header (~907 * su) or HUD height (~390 * su).
  const isMobile = w < Math.ceil(920 * su) || h < Math.ceil(390 * su);
  const isCompactHeader = w < Math.ceil(1040 * su);
  const isCompactAudio = w < Math.ceil(1240 * su);
  return { su, isMobile, isCompactHeader, isCompactAudio };
}

export function useStudioViewport(): StudioViewportState {
  const [state, setState] = useState<StudioViewportState>(() => readStudioViewport());

  useEffect(() => {
    const sync = () => {
      const next = readStudioViewport();
      setState((prev) =>
        prev.su === next.su &&
        prev.isMobile === next.isMobile &&
        prev.isCompactHeader === next.isCompactHeader &&
        prev.isCompactAudio === next.isCompactAudio
          ? prev
          : next,
      );
    };

    sync();
    window.addEventListener("resize", sync);
    const unsub = subscribeScaleUnit(sync);
    return () => {
      window.removeEventListener("resize", sync);
      unsub();
    };
  }, []);

  return state;
}
