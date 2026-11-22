import { describe, expect, it } from "vitest";
import {
  CANVAS_DIMENSION_LIMIT,
  CANVAS_PIXEL_BUDGET,
  computeCanvasPixelRatio,
} from "./canvasResolution";

const zoomLevels = [0.25, 1 / 3, 0.5, 1, 5];

describe("zoom-invariant canvas resolution", () => {
  it.each([
    { width: 1920, height: 980, bufferWidth: 2880, bufferHeight: 1470 },
    { width: 2560, height: 1340, bufferWidth: 3840, bufferHeight: 2010 },
  ])(
    "preserves physical supersampling for a $width × $height window",
    ({ width, height, bufferWidth, bufferHeight }) => {
      for (const zoom of zoomLevels) {
        const cssWidth = width / zoom;
        const cssHeight = height / zoom;
        const ratio = computeCanvasPixelRatio(cssWidth, cssHeight, zoom);

        expect(cssWidth * ratio).toBeCloseTo(bufferWidth, 8);
        expect(cssHeight * ratio).toBeCloseTo(bufferHeight, 8);
      }
    },
  );

  it("accepts a fractional ratio instead of allocating a 10240px-wide buffer at 25%", () => {
    const ratio = computeCanvasPixelRatio(10240, 5360, 0.25);
    expect(ratio).toBe(0.375);
    expect(10240 * ratio).toBe(3840);
    expect(5360 * ratio).toBe(2010);
  });

  it("preserves the same physical quality on scaled OS/HiDPI displays", () => {
    for (const osRatio of [1.25, 1.5, 2]) {
      for (const zoom of zoomLevels) {
        const dpr = osRatio * zoom;
        const cssWidth = 1920 / dpr;
        const cssHeight = 980 / dpr;
        const ratio = computeCanvasPixelRatio(cssWidth, cssHeight, dpr);
        expect(cssWidth * ratio).toBeCloseTo(2880, 8);
        expect(cssHeight * ratio).toBeCloseTo(1470, 8);
      }
    }
  });

  it("keeps the same capped 4K buffer through a zoom cycle", () => {
    for (const zoom of [...zoomLevels, 1, 0.25, 1]) {
      const cssWidth = 3840 / zoom;
      const cssHeight = 2160 / zoom;
      const ratio = computeCanvasPixelRatio(cssWidth, cssHeight, zoom);
      expect(cssWidth * ratio).toBeCloseTo(3840, 8);
      expect(cssHeight * ratio).toBeCloseTo(2160, 8);
      expect(cssWidth * cssHeight * ratio ** 2).toBeLessThanOrEqual(
        CANVAS_PIXEL_BUDGET + 0.001,
      );
    }
  });

  it.each([
    [16384, 1080, 1],
    [1080, 16384, 1],
    [5120, 2880, 2],
    [15360, 8640, 0.25],
  ])(
    "respects the pixel and per-axis budgets for %s × %s",
    (width, height, dpr) => {
      const ratio = computeCanvasPixelRatio(width, height, dpr);
      expect(width * ratio).toBeLessThanOrEqual(CANVAS_DIMENSION_LIMIT);
      expect(height * ratio).toBeLessThanOrEqual(CANVAS_DIMENSION_LIMIT);
      expect(width * height * ratio ** 2).toBeLessThanOrEqual(
        CANVAS_PIXEL_BUDGET + 0.001,
      );
      expect(ratio).toBeGreaterThan(0);
    },
  );

  it("handles temporarily unavailable viewport or display measurements", () => {
    expect(computeCanvasPixelRatio(0, Number.NaN, 0)).toBe(1.5);
    expect(computeCanvasPixelRatio(1920, 980, Number.NaN)).toBe(1.5);
  });
});
