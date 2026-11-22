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
  const displayRatio =
    Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
      ? devicePixelRatio
      : 1;
  return limitCanvasPixelRatio(
    viewportWidth,
    viewportHeight,
    displayRatio * PHYSICAL_SUPERSAMPLING,
  );
}

function limitCanvasPixelRatio(
  viewportWidth: number,
  viewportHeight: number,
  requestedRatio: number,
): number {
  const width =
    Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1;
  const height =
    Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 1;
  const desiredRatio =
    Number.isFinite(requestedRatio) && requestedRatio > 0 ? requestedRatio : 1;
  const budgetRatio = Math.sqrt(CANVAS_PIXEL_BUDGET / width / height);
  const dimensionRatio = CANVAS_DIMENSION_LIMIT / Math.max(width, height);

  return Math.min(desiredRatio, budgetRatio, dimensionRatio);
}

type SizedRenderer = {
  domElement: {
    width: number;
    height: number;
    style: { width: string; height: string };
  };
  getPixelRatio: () => number;
  setPixelRatio: (ratio: number) => void;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  setDrawingBufferSize: (width: number, height: number, ratio: number) => void;
  xr?: { isPresenting: boolean };
};

/** Bound every resize, including R3F's intermediate size/DPR updates.
 * This adapter is for this site's standard 8-bit WebGL renderer. Three's
 * setPixelRatio normally resizes using the previous logical dimensions first.
 * Keep the requested ratio separate so a temporary clamp cannot become sticky. */
export function installBoundedCanvasSizing(renderer: SizedRenderer): void {
  let requestedRatio = renderer.getPixelRatio();
  let width = renderer.domElement.width / requestedRatio;
  let height = renderer.domElement.height / requestedRatio;

  const commit = (updateStyle: boolean) => {
    const safeRatio = limitCanvasPixelRatio(width, height, requestedRatio);
    renderer.setDrawingBufferSize(width, height, safeRatio);
    if (updateStyle) {
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
    }
  };
  renderer.setPixelRatio = (ratio) => {
    if (ratio === undefined) return;
    requestedRatio = ratio;
    commit(false);
  };
  renderer.setSize = (nextWidth, nextHeight, updateStyle = true) => {
    if (renderer.xr?.isPresenting) return;
    width = nextWidth;
    height = nextHeight;
    commit(updateStyle);
  };
}
