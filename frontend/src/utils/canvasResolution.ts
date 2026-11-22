export const CANVAS_PIXEL_BUDGET = 3840 * 2160;
export const CANVAS_DIMENSION_LIMIT = 4096;
const PHYSICAL_SUPERSAMPLING = 1.5;

/**
 * Keep rendering quality tied to display pixels rather than zoomed CSS pixels.
 * At 25% zoom a 2560px-wide window has a 10240px CSS viewport: its pixel ratio
 * must be allowed below one, or the requested buffer can exceed GPU limits and
 * leave the renderer's viewport inconsistent with the actual drawing buffer.
 */
export function computeCanvasPixelRatio(
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
): number {
  const width =
    Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1;
  const height =
    Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 1;
  const displayRatio =
    Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
      ? devicePixelRatio
      : 1;

  const desiredRatio = displayRatio * PHYSICAL_SUPERSAMPLING;
  const budgetRatio = Math.sqrt(CANVAS_PIXEL_BUDGET / width / height);
  const dimensionRatio = CANVAS_DIMENSION_LIMIT / Math.max(width, height);

  return Math.min(desiredRatio, budgetRatio, dimensionRatio);
}
