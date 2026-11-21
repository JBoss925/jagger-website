import { expect, test, type Page } from "@playwright/test";

async function enterStudio(page: Page) {
  const enterBtn = page.getByRole("button", { name: "Enter", exact: true });
  await expect(enterBtn).toBeVisible();
  await enterBtn.click();
  await expect(page.locator(".spatial-boot-overlay")).toHaveCount(0);
}

test("base route starts on Experience and switches cleanly to Projects with category filtering", async ({
  page,
}) => {
  await page.goto("/");
  await enterStudio(page);
  await expect(
    page.getByRole("heading", { name: /Places I’ve built/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Experience", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  // Hovering an Experience item displays its full summary sentence in the hero blurb
  await page
    .locator(
      '[data-dock-item="h2-corporation-staff-forward-deployed-engineer"]',
    )
    .hover();
  await expect(page.locator(".spatial-hero__desc")).toContainText(
    /AI-native construction platform/,
  );

  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /What I build/ }),
  ).toBeVisible();
  await expect(page.locator("[data-dock-item]")).toHaveCount(13);
  await expect(page.locator("[data-spatial-item]")).toHaveCount(13);

  await page.getByRole("button", { name: "Languages", exact: true }).click();
  await expect(page.locator("[data-dock-item]")).toHaveCount(3);
  await expect(page.locator("[data-spatial-item]")).toHaveCount(3);
  await page.getByRole("button", { name: "All work", exact: true }).click();
  await expect(page.locator("[data-dock-item]")).toHaveCount(13);

  await expect(page.locator(".atlas-controls")).toHaveCount(0);
});

test("selecting a project retracts hero, opens Liquid Glass sheet, and syncs browser history", async ({
  page,
}) => {
  await page.goto("/?section=projects");
  await enterStudio(page);
  await page.locator('[data-dock-item="ojaml"]').click();
  await expect(
    page.getByRole("complementary", { name: "OJaml inspector" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/item=ojaml/);
  await expect(page.locator(".spatial-hero")).toHaveClass(/is-retracted/);

  await page.getByRole("tab", { name: "Paper & Docs", exact: true }).click();
  await expect(page).toHaveURL(/tab=writing/);
  await page.reload();
  await enterStudio(page);
  await expect(
    page.getByRole("tab", { name: "Paper & Docs", exact: true }),
  ).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "Next item", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "LiveBoard inspector" }),
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByRole("complementary", { name: "OJaml inspector" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator(".glass-sheet")).toHaveCount(0);
});

test("all five sections unify in the shared spatial stage", async ({ page }) => {
  test.slow();
  await page.goto("/");
  await enterStudio(page);

  // Experience is first
  await page
    .locator(
      '[data-dock-item="h2-corporation-staff-forward-deployed-engineer"]',
    )
    .click();
  await expect(
    page.getByRole("complementary", { name: "H2 Corporation inspector" }),
  ).toBeVisible();

  // Demos
  await page.getByRole("button", { name: "Demos", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Don’t take my word/ })).toBeVisible();
  await expect(page.locator("[data-dock-item]")).toHaveCount(7);

  // Library
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /How I built them/ }),
  ).toBeVisible();
  await expect(page.locator("[data-dock-item]")).toHaveCount(8);

  // About (includes Portfolio Views + rich evidence-linked skill cards)
  await page.getByRole("button", { name: "About", exact: true }).click();
  await page.locator('[data-dock-item="team"]').click();
  await expect(page.locator(".sheet-evidence-row")).toHaveCount(5);
  await page.locator(".sheet-evidence-row").first().click();
  await expect(
    page.getByRole("complementary", { name: "H2 Corporation inspector" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "About", exact: true }).click();
  await page.locator('[data-dock-item="portfolio-views"]').click();
  await expect(
    page.getByRole("link", { name: /Interactive 3D/ }),
  ).toHaveAttribute("href", "https://interactive3d.jaggerbrulato.com");
});

test("demos and library open in slim full-viewport theater without redundant headers", async ({
  page,
}) => {
  await page.goto("/?section=demos&item=genetic-ts");
  await enterStudio(page);
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /Launch GeneticTS here/ }).click();
  await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
  await expect(page.locator(".theater-slim-bar")).toBeVisible();
  // Redundant sheet header & tabs are gone in theater mode
  await expect(page.locator(".glass-sheet__tabs")).toHaveCount(0);

  const demoFrame = page.frameLocator(
    'iframe[title="Genetic Algorithms in TypeScript live demo"]',
  );
  await expect(
    demoFrame.getByRole("heading", {
      name: "Genetic Algorithms in TypeScript",
      exact: true,
    }),
  ).toBeVisible();
  // Inner SiteNavigation is also suppressed in embedded mode
  await expect(demoFrame.locator(".site-nav-shell")).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
  await expect(page.locator(".glass-sheet")).toBeVisible();

  await page.goto("/?section=library&item=ojaml");
  await enterStudio(page);
  await page.getByRole("button", { name: "Browse docs" }).click();
  await expect(
    page
      .frameLocator('iframe[title="OJaml documentation"]')
      .getByRole("heading", { name: "OJaml", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Paper", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title="OJaml paper"]')
      .locator(".paper-title-block h1"),
  ).toBeVisible();
});

test("mobile editorial fallback uses compact Work tab without clipping even at 320px and opens full-width bottom drawer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");

  const navBtns = page
    .getByRole("navigation", { name: "Portfolio sections" })
    .locator("button");
  await expect(navBtns).toHaveCount(5);
  await expect(navBtns.first()).toHaveText("Work");
  // Every mobile tab label fits comfortably inside its own bubble even at 320px width!
  const anyClipped = await navBtns.evaluateAll((els) =>
    els.some((el) => el.scrollWidth > el.clientWidth + 1),
  );
  expect(anyClipped).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: /Places I’ve built/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);

  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByRole("button", { name: /Portfolio Views/ }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  const box = await page.locator(".mobile-drawer-shell").boundingBox();
  expect(box?.width).toBeCloseTo(390, 0);
  await expect(
    page.getByRole("link", { name: /Interactive 3D/ }),
  ).toHaveAttribute("href", "https://interactive3d.jaggerbrulato.com");

  await page.getByRole("button", { name: "Close detail sheet" }).click();
  await expect(drawer).toHaveCount(0);
});

test("legacy deep links and standalone library remain available", async ({
  page,
}) => {
  await page.goto("/#projects/jaggerscript");
  await enterStudio(page);
  await expect(
    page.getByRole("complementary", { name: "JaggerScript inspector" }),
  ).toBeVisible();

  await page.goto(
    "/#experience/h2-corporation-staff-forward-deployed-engineer",
  );
  await enterStudio(page);
  await expect(
    page.getByRole("complementary", { name: "H2 Corporation inspector" }),
  ).toBeVisible();

  await page.goto("/library");
  await expect(page.locator(".library-grid article")).toHaveCount(13);
});

test("papers and docs share the lavender dark accent theme", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("jagger-papers-theme", "dark"),
  );
  for (const path of ["/papers", "/docs/ojaml"]) {
    await page.goto(path);
    await expect(page.locator(".papers-page")).toHaveClass(/papers-page--dark/);
    expect(
      await page
        .locator(".papers-page")
        .evaluate((e) =>
          getComputedStyle(e).getPropertyValue("--paper-accent-strong").trim(),
        ),
    ).toBe("#c4a3e5");
  }
});
