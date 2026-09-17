import { expect, test } from "@playwright/test";
const slugs = [
  "ojaml",
  "liveboard",
  "hearth",
  "jaggerscript",
  "aixc-compressor",
  "genetic-ts",
  "rengine",
  "tsxlight-renderer",
];
test("documentation projects, search, and narrative links", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/docs");
  await expect(
    page.getByRole("heading", { name: "Jagger Docs", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".docs-project-card")).toHaveCount(8);
  for (const slug of slugs) {
    await page.goto(`/docs/${slug}`);
    await expect(page.locator(".docs-mode-card")).toHaveCount(4);
    await page.goto(`/docs/${slug}/tutorials/first-steps`);
    await expect(page.locator(".docs-article h1")).toBeVisible();
    await page.goto(`/papers/${slug}`);
    await expect(page.locator(".paper-detail-link a").first()).toBeVisible();
    const links = await page
      .locator(".paper-detail-link a")
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute("href")!),
      );
    expect(links.length).toBeGreaterThanOrEqual(4);
    for (const link of links) {
      await page.goto(link);
      await expect(page.locator(".docs-article h1")).toBeVisible();
      await expect(
        page.getByText("Documentation page not found", { exact: true }),
      ).toHaveCount(0);
    }
  }
  await page.goto("/docs");
  await page.getByRole("searchbox").fill("call_indirect");
  await expect(page.locator(".docs-results a").first()).toBeVisible();
  await page.getByRole("searchbox").fill("does-not-exist-92741");
  await expect(page.getByRole("status")).toHaveText("0 matching pages");
  await page.goto("/papers/ojaml#inference-proof");
  await expect(page).toHaveURL(/\/docs\/ojaml\/explanation\/inference-proof$/);
  await page.goto("/docs/ojaml/reference/missing-page");
  await expect(
    page.getByRole("heading", { name: "Documentation page not found" }),
  ).toBeVisible();
});
test("mobile docs, themes, images, and visual flow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/hearth/reference/architecture");
  await expect(page.locator(".docs-article h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".docs-sidebar")).toHaveCount(0);
  await page.getByRole("button", { name: "Expand docs controls" }).click();
  await expect(page.locator(".docs-header .docs-sidebar")).toBeVisible();
  await page.getByRole("button", { name: /Switch to .* mode/ }).click();
  await expect(page.locator(".papers-page")).toHaveClass(/papers-page--light/);
  await page.goto("/docs/hearth");
  await page.locator(".paper-device-figure__image-button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/papers/ojaml");
  await expect(page.locator(".project-flow").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("mobile docs sidebar moves into the menu and closes after navigation", async ({page}) => {
  for (const width of [390,800]) {
    await page.setViewportSize({width,height:844});
    await page.goto("/docs/ojaml");
    await expect(page.locator(".docs-sidebar")).toHaveCount(0);
    await page.getByRole("button",{name:"Expand docs controls"}).click();
    await expect(page.locator(".docs-header .docs-sidebar")).toBeVisible();
    await page.locator('.docs-header .docs-sidebar a[href="/docs/ojaml/tutorials/first-steps"]').click();
    await expect(page).toHaveURL(/\/tutorials\/first-steps$/);
    await expect(page.locator(".docs-sidebar")).toHaveCount(0);
    await expect(page.locator(".docs-article h1")).toBeVisible();
  }
  await page.setViewportSize({width:1280,height:900});
  await expect(page.locator(".docs-layout > .docs-sidebar")).toBeVisible();
  await expect(page.locator(".docs-header .docs-sidebar")).toHaveCount(0);
});
