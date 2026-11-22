import { expect, test } from "@playwright/test";
import {
  capturePhysical,
  comparePixels,
  createZoomBrowser,
  measurePhysical,
  type PhysicalRect,
} from "./support/browserZoom";

const header = [
  ".spatial-brand",
  ".spatial-brand__text strong",
  ".spatial-brand__text small",
  ".spatial-nav",
  ".spatial-nav__indicator",
];
const headline = [
  ".spatial-hero__eyebrow",
  ".spatial-hero__title",
  ".spatial-hero__desc",
];
const sheet = [
  ".glass-sheet__header h2",
  ".glass-sheet__subtitle",
  ".glass-sheet__tabs",
  ".sheet-lead",
  ".sheet-copy",
  ".sheet-actions",
];

for (const display of [
  { name: "1080p", width: 1920, height: 980, screenHeight: 1080 },
  { name: "1440p", width: 2560, height: 1340, screenHeight: 1440 },
]) {
  test(`real browser zoom preserves typography and round-trip pixels on ${display.name}`, async ({
    baseURL,
  }, testInfo) => {
    test.setTimeout(240_000);
    const browser = await createZoomBrowser(
      display.width,
      display.height,
      display.screenHeight,
    );
    const { page } = browser;
    try {
      await page.goto(`${baseURL}/?section=projects`);
      await expect(page.locator(".spatial-pill").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const fontSession = await page.context().newCDPSession(page);
      await fontSession.send("DOM.enable");
      await fontSession.send("CSS.enable");
      const { root } = await fontSession.send("DOM.getDocument");
      const { nodeId } = await fontSession.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: ".spatial-pill__label",
      });
      const { fonts } = await fontSession.send("CSS.getPlatformFontsForNode", {
        nodeId,
      });
      expect(
        fonts.some(
          (f) => f.familyName === "Google Sans Flex" && f.isCustomFont,
        ),
      ).toBe(true);
      await fontSession.detach();
      // Freeze only visual noise. Typography, layout, resize observers and browser
      // zoom all remain real; the live canvas has its own backing-buffer coverage.
      const quiet =
        "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}canvas,.spatial-atmosphere{visibility:hidden!important}";
      await page.addStyleTag({ content: quiet });
      const reports = [];
      for (const state of ["projects", "experience", "detail"] as const) {
        if (state === "experience")
          await page
            .getByRole("button", { name: "Experience", exact: true })
            .click();
        if (state === "detail")
          await page
            .locator(
              '[data-dock-item="h2-corporation-staff-forward-deployed-engineer"]',
            )
            .click();
        const pillSelectors =
          state === "detail"
            ? []
            : await page
                .locator("[data-spatial-item]")
                .evaluateAll((es) =>
                  es.map(
                    (e) =>
                      `[data-spatial-item="${e.getAttribute("data-spatial-item")}"]`,
                  ),
                );
        if (state !== "detail")
          await expect(page.locator(pillSelectors.at(-1)!)).toBeVisible();
        const selectors = [
          ...header,
          ...(state === "detail" ? sheet : headline),
          ...pillSelectors,
        ];
        const baseline = await measurePhysical(page, selectors);
        const imageBefore = await capturePhysical(page);
        const snapshots = [];
        for (const factor of [1.1, 1.25, 1.5, 1.75, 2, 3, 4, 5, 1, 5, 1]) {
          await browser.zoom(factor);
          const current = await measurePhysical(page, selectors);
          snapshots.push({ zoom: factor, elements: current });
          for (const [selector, original] of Object.entries(baseline))
            for (const key of [
              "x",
              "y",
              "width",
              "height",
              "textWidth",
              "fontSize",
            ] as const) {
              expect(
                Math.abs(current[selector][key] - original[key]),
                `${state} ${selector} physical ${key} at ${factor * 100}%`,
              ).toBeLessThan(0.35);
            }
          if (factor === 5 && snapshots.length === 8)
            await testInfo.attach(`${state}-500-percent.png`, {
              body: await capturePhysical(page),
              contentType: "image/png",
            });
        }
        const imageAfter = await capturePhysical(page);
        const pixels = await comparePixels(
          page,
          imageBefore,
          imageAfter,
          Object.values(baseline),
        );
        await testInfo.attach(`${state}-100-before.png`, {
          body: imageBefore,
          contentType: "image/png",
        });
        await testInfo.attach(`${state}-100-after.png`, {
          body: imageAfter,
          contentType: "image/png",
        });
        await testInfo.attach(`${state}-roundtrip-diff.png`, {
          body: Buffer.from(pixels.diff, "base64"),
          contentType: "image/png",
        });
        expect(
          pixels.changed,
          `${state}: text/pills must not retain a different raster after returning to 100%`,
        ).toBe(0);
        reports.push({
          state,
          baseline,
          snapshots,
          pixels: { ...pixels, diff: undefined },
        });
      }
      // A reload at 500% exercises initialization and font-cache reuse, rather
      // than only resizing an already-mounted scene.
      await browser.zoom(5);
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: quiet });
      await expect(page.locator(".glass-sheet")).toBeVisible();
      await browser.zoom(1);
      const reloaded = await measurePhysical(page, [...header, ...sheet]);
      const original = reports.at(-1)!.baseline;
      for (const [selector, rect] of Object.entries(reloaded))
        for (const key of ["width", "height", "textWidth", "fontSize"] as const)
          expect(
            Math.abs(rect[key] - original[selector][key]),
            `${selector} survives reload at 500%`,
          ).toBeLessThan(0.35);
      await testInfo.attach("zoom-measurements.json", {
        body: JSON.stringify({ display, fonts, reports, reloaded }, null, 2),
        contentType: "application/json",
      });
    } finally {
      await browser.close();
    }
  });
}
