import {
  chromium,
  expect,
  type BrowserContext,
  type Page,
  type Worker,
} from "@playwright/test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

type ZoomApi = {
  tabs: {
    query: (query: { url: string }) => Promise<Array<{ id: number }>>;
    setZoom: (id: number, factor: number) => Promise<void>;
  };
};

/** Use Chrome's tab zoom, which changes both layout viewport and DPR.
 * Emulation.setPageScaleFactor only pinch-zooms and cannot reproduce this bug. */
export async function createZoomBrowser(
  width: number,
  height: number,
  screenHeight: number,
) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-zoom-"));
  const extension = path.join(directory, "extension");
  await mkdir(extension);
  await writeFile(
    path.join(extension, "manifest.json"),
    JSON.stringify({
      manifest_version: 3,
      name: "Portfolio zoom regression driver",
      version: "1.0",
      permissions: ["tabs"],
      background: { service_worker: "background.js" },
    }),
  );
  await writeFile(
    path.join(extension, "background.js"),
    "chrome.runtime.onInstalled.addListener(() => {});",
  );
  let context: BrowserContext;
  try {
    context = await chromium.launchPersistentContext(
      path.join(directory, "profile"),
      {
        channel: "chromium",
        headless: true,
        viewport: { width, height },
        screen: { width, height: screenHeight },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        ignoreHTTPSErrors: true,
        args: [
          `--disable-extensions-except=${extension}`,
          `--load-extension=${extension}`,
          "--enable-unsafe-swiftshader",
        ],
      },
    );
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
  const worker: Worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const page = await context.newPage();
  return {
    page,
    context,
    async zoom(factor: number) {
      await worker.evaluate(
        async ({ url, factor }) => {
          const api = (globalThis as unknown as { chrome: ZoomApi }).chrome;
          const tabs = await api.tabs.query({ url });
          for (const tab of tabs) await api.tabs.setZoom(tab.id, factor);
        },
        { url: `${new URL(page.url()).origin}/*`, factor },
      );
      await expect
        .poll(() => page.evaluate(() => devicePixelRatio))
        .toBeCloseTo(factor, 4);
      await expect(page.locator(".is-resizing")).toHaveCount(0);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
    },
    async close() {
      await context.close();
      await rm(directory, { recursive: true, force: true });
    },
  };
}

export type PhysicalRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  textWidth: number;
  fontSize: number;
};
export async function measurePhysical(page: Page, selectors: string[]) {
  return page.evaluate(
    (selectors) =>
      Object.fromEntries(
        selectors.flatMap((selector) => {
          const element = document.querySelector(selector);
          if (!element) return [];
          const rect = element.getBoundingClientRect();
          const text = document.createRange();
          text.selectNodeContents(element);
          return [
            [
              selector,
              {
                x: rect.x * devicePixelRatio,
                y: rect.y * devicePixelRatio,
                width: rect.width * devicePixelRatio,
                height: rect.height * devicePixelRatio,
                textWidth:
                  text.getBoundingClientRect().width * devicePixelRatio,
                fontSize:
                  parseFloat(getComputedStyle(element).fontSize) *
                  devicePixelRatio,
              },
            ],
          ];
        }),
      ),
    selectors,
  ) as Promise<Record<string, PhysicalRect>>;
}

export async function capturePhysical(page: Page) {
  const session = await page.context().newCDPSession(page);
  try {
    return Buffer.from(
      (
        await session.send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false,
        })
      ).data,
      "base64",
    );
  } finally {
    await session.detach();
  }
}

/** Compare stable DOM regions at native physical resolution, ignoring the live artwork. */
export async function comparePixels(
  page: Page,
  before: Buffer,
  after: Buffer,
  regions: PhysicalRect[],
) {
  return page.evaluate(
    async ({ before, after, regions }) => {
      const load = (data: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = `data:image/png;base64,${data}`;
        });
      const [a, b] = await Promise.all([load(before), load(after)]);
      if (a.width !== b.width || a.height !== b.height)
        throw new Error("Physical screenshot size changed during zoom");
      const canvas = document.createElement("canvas");
      canvas.width = a.width;
      canvas.height = a.height;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(a, 0, 0);
      const pixelsA = context.getImageData(0, 0, a.width, a.height);
      context.clearRect(0, 0, a.width, a.height);
      context.drawImage(b, 0, 0);
      const pixelsB = context.getImageData(0, 0, b.width, b.height);
      const diff = context.createImageData(a.width, a.height);
      let compared = 0,
        changed = 0,
        absoluteDifference = 0,
        maxDifference = 0;
      for (const region of regions)
        for (
          let y = Math.max(0, Math.floor(region.y) - 2);
          y < Math.min(a.height, Math.ceil(region.y + region.height) + 2);
          y++
        )
          for (
            let x = Math.max(0, Math.floor(region.x) - 2);
            x < Math.min(a.width, Math.ceil(region.x + region.width) + 2);
            x++
          ) {
            const i = (y * a.width + x) * 4;
            let delta = 0;
            for (let c = 0; c < 3; c++) {
              const n = Math.abs(pixelsA.data[i + c] - pixelsB.data[i + c]);
              delta = Math.max(delta, n);
              absoluteDifference += n;
              maxDifference = Math.max(maxDifference, n);
            }
            compared++;
            if (delta > 8) {
              changed++;
              diff.data[i] = 220;
              diff.data[i + 1] = 45;
              diff.data[i + 2] = 95;
              diff.data[i + 3] = 255;
            }
          }
      context.putImageData(diff, 0, 0);
      return {
        width: a.width,
        height: a.height,
        compared,
        changed,
        meanDifference: absoluteDifference / (compared * 3),
        maxDifference,
        diff: canvas.toDataURL("image/png").split(",")[1],
      };
    },
    {
      before: before.toString("base64"),
      after: after.toString("base64"),
      regions,
    },
  );
}
