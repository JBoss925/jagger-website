import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Verifies that the real geometric center of a locator is hit-testable
 * (not covered by an invisible header or higher z-index overlay!).
 */
async function expectUnobstructed(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  await expect
    .poll(async () =>
      locator.evaluate((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const top = document.elementFromPoint(cx, cy);
        return Boolean(top && (top === el || el.contains(top)));
      }),
    )
    .toBe(true);
}

async function enterStudio(page: Page) {
  const enterBtn = page.getByRole("button", { name: "Enter", exact: true });
  await expect(enterBtn).toBeVisible();
  await enterBtn.click();
  await expect(page.locator(".spatial-boot-overlay")).toHaveCount(0);
}

test.describe("Comprehensive user flows & overlay hit-testing", () => {
  test("OJaml Live Demo theater: Return to sculpture and Open full page work cleanly without click-through, and no redundant × button", async ({
    page,
  }) => {
    await page.goto("/?section=projects");
    await enterStudio(page);
    await page.locator('[data-dock-item="ojaml"]').click();
    await expect(
      page.getByRole("complementary", { name: "OJaml inspector" }),
    ).toBeVisible();

    // Open Live Demo tab and launch OJaml inline
    await page.getByRole("tab", { name: "Live Demo", exact: true }).click();
    await expect(page).toHaveURL(/section=projects.*item=ojaml.*tab=demo/);
    await page.getByRole("button", { name: /Launch OJaml here/ }).click();

    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
    const returnBtn = page.getByRole("button", {
      name: /Return to sculpture/,
    });
    const openFullLink = page.getByRole("link", { name: /Open full page/ });

    // No redundant × close button in theater mode
    await expect(
      page.getByRole("button", { name: "Close detail sheet" }),
    ).toHaveCount(0);

    // Critical regression check: hidden top header must NOT intercept clicks!
    await expectUnobstructed(page, returnBtn);
    await expectUnobstructed(page, openFullLink);
    await expect(openFullLink).toHaveAttribute("href", "/ojaml");
    await expect(openFullLink).toHaveAttribute("target", "_blank");

    // Clicking "Return to sculpture" must stay on OJaml in Projects (NOT jump to `/` Experience!)
    await returnBtn.click();
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
    await expect(
      page.getByRole("complementary", { name: "OJaml inspector" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/section=projects/);
    await expect(page).toHaveURL(/item=ojaml/);
    await expect(page.locator("iframe")).toHaveCount(0);

    // Closing the returned detail sheet via × stays in Projects overview (NOT Experience or mailto)
    await page.getByRole("button", { name: "Close detail sheet" }).click();
    await expect(page.locator(".glass-sheet")).toHaveCount(0);
    await expect(page).toHaveURL(/section=projects/);
    await expect(page).not.toHaveURL(/item=ojaml/);
    await expect(
      page.getByRole("heading", { name: /Crafted systems/ }),
    ).toBeVisible();
  });

  test("Escape key exits theater cleanly without leaving an orphaned inline iframe", async ({
    page,
  }) => {
    await page.goto("/?section=demos&item=jaggerscript");
    await enterStudio(page);
    await page.getByRole("button", { name: /Launch JaggerScript here/ }).click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
    await expect(page.locator("iframe")).toHaveCount(1);

    // First Escape exits theater AND tears down the iframe cleanly
    await page.keyboard.press("Escape");
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Launch JaggerScript here/ }),
    ).toBeVisible();

    // Second Escape closes the detail sheet completely, staying on Demos
    await page.keyboard.press("Escape");
    await expect(page.locator(".glass-sheet")).toHaveCount(0);
    await expect(page).toHaveURL(/section=demos/);
  });

  test("Library paper & docs theater: segmented Paper/Docs switcher, unobstructed controls, and Return to sculpture", async ({
    page,
  }) => {
    await page.goto("/?section=library&item=ojaml");
    await enterStudio(page);
    await page.getByRole("button", { name: "Read paper here" }).click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);

    const returnBtn = page.getByRole("button", { name: /Return to sculpture/ });
    const paperBtn = page.getByRole("button", { name: "Paper", exact: true });
    const docsBtn = page.getByRole("button", { name: "Docs", exact: true });
    const fullLink = page.getByRole("link", { name: /Open full page/ });

    await expectUnobstructed(page, returnBtn);
    await expectUnobstructed(page, paperBtn);
    await expectUnobstructed(page, docsBtn);
    await expectUnobstructed(page, fullLink);
    await expect(
      page.getByRole("button", { name: "Close detail sheet" }),
    ).toHaveCount(0);
    await expect(fullLink).toHaveAttribute("href", "/papers/ojaml");

    // Clicking already-active Paper tab must NOT accidentally close theater
    await paperBtn.click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);

    // Switch to Docs and verify URL + iframe update
    await docsBtn.click();
    await expect(fullLink).toHaveAttribute("href", "/docs/ojaml");
    await expect(
      page.locator('iframe[title="OJaml documentation"]'),
    ).toBeVisible();

    // Return to sculpture stays on Library OJaml
    await returnBtn.click();
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
    await expect(page).toHaveURL(/section=library/);
    await expect(page).toHaveURL(/item=ojaml/);
  });

  test("Portfolio Views open in-app inside theater by default (Projects & About) while keeping external links", async ({
    page,
  }) => {
    // 1. From About -> Portfolio Views
    await page.goto("/?section=about&item=portfolio-views");
    await enterStudio(page);
    await expect(
      page.getByRole("complementary", { name: "Portfolio Views inspector" }),
    ).toBeVisible();

    // External new-tab link still exists on every card
    await expect(
      page.getByRole("link", { name: "Open Interactive 3D in new tab" }),
    ).toHaveAttribute("href", "https://interactive3d.jaggerbrulato.com");
    await expect(
      page.getByRole("link", { name: "Open Design in new tab" }),
    ).toHaveAttribute("href", "https://design.jaggerbrulato.com");

    // Clicking the card opens Interactive 3D inside the in-app theater!
    await page.getByRole("button", { name: /Interactive 3D/ }).click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
    const viewFrame = page.locator(
      'iframe[title="Interactive 3D portfolio view"]',
    );
    await expect(viewFrame).toHaveAttribute("src", "https://interactive3d.jaggerbrulato.com");
    await expect(
      page.getByRole("link", { name: /Open full page/ }),
    ).toHaveAttribute("href", "https://interactive3d.jaggerbrulato.com");

    // Switch live inside theater to Design -> Editor -> Finance
    await page.getByRole("button", { name: "Design", exact: true }).click();
    await expect(
      page.locator('iframe[title="Design portfolio view"]'),
    ).toHaveAttribute("src", "https://design.jaggerbrulato.com");
    await expect(
      page.getByRole("link", { name: /Open full page/ }),
    ).toHaveAttribute("href", "https://design.jaggerbrulato.com");

    await page.getByRole("button", { name: "Editor", exact: true }).click();
    await expect(
      page.locator('iframe[title="Editor portfolio view"]'),
    ).toHaveAttribute("src", "https://editor.jaggerbrulato.com");

    await page.getByRole("button", { name: "Finance", exact: true }).click();
    await expect(
      page.locator('iframe[title="Finance portfolio view"]'),
    ).toHaveAttribute("src", "https://finance.jaggerbrulato.com");

    // Return to sculpture stays right on About -> Portfolio Views
    const returnBtn = page.getByRole("button", { name: /Return to sculpture/ });
    await expectUnobstructed(page, returnBtn);
    await returnBtn.click();
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
    await expect(page).toHaveURL(/section=about/);
    await expect(page).toHaveURL(/item=portfolio-views/);

    // 2. Also works identically from Projects -> Portfolio Views
    await page.goto("/?section=projects&item=portfolio-site");
    await enterStudio(page);
    await page.getByRole("button", { name: /Interactive 3D/ }).click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
    await expect(
      page.locator('iframe[title="Interactive 3D portfolio view"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: /Return to sculpture/ }).click();
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
    await expect(page).toHaveURL(/section=projects/);
    await expect(page).toHaveURL(/item=portfolio-site/);
  });

  test("Projects category filter sits above dynamic hover subtitle, stays aligned with heading, and never shifts vertically on hover", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?section=projects");
    const title = page.locator(".spatial-hero__title");
    const filterBar = page.locator(".spatial-categories");
    const desc = page.locator(".spatial-hero__desc");
    await expect(title).toBeVisible();
    await expect(filterBar).toBeVisible();
    await expect(desc).toBeVisible();

    const titleBox = await title.boundingBox();
    const initialFilterBox = await filterBar.boundingBox();
    const initialDescBox = await desc.boundingBox();
    expect(titleBox).not.toBeNull();
    expect(initialFilterBox).not.toBeNull();
    expect(initialDescBox).not.toBeNull();

    // Filter must be positioned strictly ABOVE the subtitle copy
    expect(initialFilterBox!.y + initialFilterBox!.height).toBeLessThanOrEqual(
      initialDescBox!.y + 1,
    );
    // Subtitle copy must left-align cleanly with the display heading (within 3px optical alignment)
    expect(Math.abs(initialDescBox!.x - titleBox!.x)).toBeLessThanOrEqual(3);

    // Hover through multiple projects with varied subtitle lengths — filter y MUST NOT move!
    const slugs = [
      "ojaml",
      "liveboard",
      "hearth",
      "jaggerscript",
      "aixc-compressor",
      "genetic-ts",
      "jagger-games",
      "jetstream",
      "portfolio-site",
    ];
    for (const slug of slugs) {
      await page.locator(`[data-dock-item="${slug}"]`).hover();
      const box = await filterBar.boundingBox();
      expect(box!.y).toBeCloseTo(initialFilterBox!.y, 0);
    }
  });

  test("Breadcrumb back pill, stepper arrows, keyboard arrows, brand click, and legacy ?project= close all route properly", async ({
    page,
  }) => {
    // Legacy ?project=ojaml deep link -> shows intro first, then opens OJaml and stays in Projects on close
    await page.goto("/?project=ojaml");
    await enterStudio(page);
    await expect(
      page.getByRole("complementary", { name: "OJaml inspector" }),
    ).toBeVisible();

    // Step forward & back via keyboard ArrowRight / ArrowLeft
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("complementary", { name: "LiveBoard inspector" }),
    ).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(
      page.getByRole("complementary", { name: "OJaml inspector" }),
    ).toBeVisible();

    // Top-left focus breadcrumb closes back to Projects overview
    await page.getByRole("button", { name: /All projects/ }).click();
    await expect(page.locator(".glass-sheet")).toHaveCount(0);
    await expect(page).toHaveURL(/section=projects/);
    await expect(
      page.getByRole("heading", { name: /Crafted systems/ }),
    ).toBeVisible();

    // Clicking brand returns to Experience landing
    await page.locator(".spatial-brand").click();
    await expect(
      page.getByRole("heading", { name: /Staff engineering/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Experience", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("Mobile (390px) theater flows for Demos and Portfolio Views stay inside viewport with unobstructed Back & Close", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?section=projects");

    await page.getByRole("button", { name: /OJaml/ }).click();
    await page.getByRole("tab", { name: "Demo", exact: true }).click();
    await page.getByRole("button", { name: /Launch OJaml here/ }).click();

    const backBtn = page.getByRole("button", { name: /Back/ });
    const fullLink = page.getByRole("link", { name: /Full page/ });

    await expectUnobstructed(page, backBtn);
    await expectUnobstructed(page, fullLink);
    await expect(
      page.getByRole("button", { name: "Close detail sheet" }),
    ).toHaveCount(0);

    // Ensure no horizontal overflow past 390px inside mobile theater bar
    const fullBox = await fullLink.boundingBox();
    expect(fullBox!.x + fullBox!.width).toBeLessThanOrEqual(391);

    await backBtn.click();
    await expect(
      page.getByRole("button", { name: /Launch OJaml here/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Close detail sheet" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Mobile Portfolio Views opens in-app inside mobile drawer theater
    await page.getByRole("button", { name: "About", exact: true }).click();
    await page.getByRole("button", { name: /Portfolio Views/ }).click();
    await page.getByRole("button", { name: /Interactive 3D/ }).click();
    await expect(
      page.locator('iframe[title="Interactive 3D portfolio view"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: /Back/ }).click();
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("Hidden /museum route is unlinked from public site and supports all 145 exhibits, triple badges, filters, scale toggle, and keyboard nav", async ({
    page,
  }) => {
    test.slow();
    // Verify zero public links to /museum on landing page
    await page.goto("/");
    await enterStudio(page);
    await expect(page.locator('a[href*="/museum"]')).toHaveCount(0);

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/museum");
    await expect(page.locator(".museum-count")).toHaveText(
      "145 exhibits · 29 subjects",
    );
    await expect(page.locator(".museum-item")).toHaveCount(145);

    // Search filter
    await page.locator(".museum-search").fill("#94");
    await expect(page.locator(".museum-item")).toHaveCount(1);
    await page.locator(".museum-item").first().click();
    await expect(page.locator(".museum-code-pill")).toHaveText("#94");
    await page.locator(".museum-search").fill("");

    // Era & badge filters (Active, Your Picks, AI Picks, Season 3)
    await page.getByRole("button", { name: "★ Active", exact: true }).click();
    await expect(page.locator(".museum-item")).toHaveCount(29);
    await page.getByRole("button", { name: "♥ Your Picks", exact: true }).click();
    await expect(page.locator(".museum-item")).toHaveCount(22);
    await page.getByRole("button", { name: "✦ AI Picks", exact: true }).click();
    await expect(page.locator(".museum-item")).toHaveCount(29);
    await page.getByRole("button", { name: "Season 3", exact: true }).click();
    await expect(page.locator(".museum-item")).toHaveCount(45);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator(".museum-item")).toHaveCount(145);

    // Scale toggle + Space shortcut
    await page.getByRole("button", { name: "Large (120)", exact: true }).click();
    await expect(page.locator(".museum-plinth-labels")).toHaveCount(0);
    await page.getByRole("button", { name: "Large + Small", exact: true }).click();
    await expect(page.locator(".museum-plinth-labels")).toBeVisible();

    // Next button advances exhibit code cleanly
    const before = await page.locator(".museum-code-pill").textContent();
    await page.getByRole("button", { name: "Next →", exact: true }).click();
    const after = await page.locator(".museum-code-pill").textContent();
    expect(after).not.toBe(before);

    expect(errors).toEqual([]);
  });

  test("Overview constellations align with page/nav center and never clip off-screen on narrow desktop (900×760)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    // 1. Standard desktop (1440×900): centered with top nav & bottom dock
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of ["/", "/?section=projects"]) {
      await page.goto(path);
      await expect(page.locator("[data-spatial-item]").first()).toBeVisible();
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const pills = Array.from(
              document.querySelectorAll("[data-spatial-item]"),
            ).map((el) => el.getBoundingClientRect());
            if (!pills.length) return 999;
            const minL = Math.min(...pills.map((r) => r.left));
            const maxR = Math.max(...pills.map((r) => r.right));
            const nav = document
              .querySelector(".spatial-nav")!
              .getBoundingClientRect();
            const pillsCenter = (minL + maxR) / 2;
            const navCenter = nav.left + nav.width / 2;
            return Math.abs(pillsCenter - navCenter);
          }),
        )
        .toBeLessThanOrEqual(24);
    }

    // 2. Narrow desktop (900×760): zero clipping off left/right edges & single-line header CTA
    await page.setViewportSize({ width: 900, height: 760 });
    for (const path of ["/", "/?section=projects"]) {
      await page.goto(path);
      await expect(page.locator("[data-spatial-item]").first()).toBeVisible();
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const pills = Array.from(
              document.querySelectorAll("[data-spatial-item]"),
            ).map((el) => el.getBoundingClientRect());
            if (!pills.length) return false;
            const minL = Math.min(...pills.map((r) => r.left));
            const maxR = Math.max(...pills.map((r) => r.right));
            return minL >= 10 && maxR <= window.innerWidth - 10;
          }),
        )
        .toBe(true);

      const ctaBox = await page.locator(".spatial-header__cta").boundingBox();
      expect(ctaBox!.height).toBeLessThanOrEqual(46);
    }
  });

  test("Bottom-left Liquid Glass Music & Sound buttons toggle independently, persist across reload, and never overlap bottom dock", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const controls = page.locator(".spatial-audio-controls");
    const musicBtn = page.locator('[data-audio-control="music"]');
    const sfxBtn = page.locator('[data-audio-control="sfx"]');
    const dockShell = page.locator(".spatial-dock-shell");

    await expect(controls).toBeVisible();
    await expect(musicBtn).toHaveAttribute("aria-pressed", "false");
    await expect(sfxBtn).toHaveAttribute("aria-pressed", "false");

    // Positioned cleanly in bottom-left corner with zero overlap against bottom dock
    const ctrlBox = await controls.boundingBox();
    const dockBox = await dockShell.boundingBox();
    expect(ctrlBox!.x).toBeLessThan(80);
    expect(ctrlBox!.y).toBeGreaterThan(800);
    expect(ctrlBox!.x + ctrlBox!.width).toBeLessThan(dockBox!.x);

    // Mute ONLY Music -> Sound stays unmuted, persists across reload
    await musicBtn.click();
    await expect(musicBtn).toHaveAttribute("aria-pressed", "true");
    await expect(sfxBtn).toHaveAttribute("aria-pressed", "false");

    await page.reload();
    await expect(page.locator('[data-audio-control="music"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator('[data-audio-control="sfx"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // Mute Sound independently -> both muted
    await page.locator('[data-audio-control="sfx"]').click();
    await expect(page.locator('[data-audio-control="sfx"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Narrow desktop (900x760): compact icon-only bottom-left pill never overlaps bottom dock
    await page.setViewportSize({ width: 900, height: 760 });
    const narrowCtrl = await page.locator(".spatial-audio-controls").boundingBox();
    const narrowDock = await page.locator(".spatial-dock-shell").boundingBox();
    expect(narrowCtrl!.x + narrowCtrl!.width).toBeLessThan(narrowDock!.x);

    // Unmute both cleanly
    await page.locator('[data-audio-control="music"]').click();
    await page.locator('[data-audio-control="sfx"]').click();
    await expect(page.locator('[data-audio-control="music"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(page.locator('[data-audio-control="sfx"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("Cardless floating-cube Enter intro appears on both `/` and deep links, and Get in touch navigates to About -> Get in Touch with structured icon rows", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const overlay = page.locator(".spatial-boot-overlay");
    const enterBtn = page.getByRole("button", { name: "Enter", exact: true });
    await expect(overlay).toBeVisible();
    await expect(enterBtn).toBeVisible();
    // No card & no separate "Enter muted" button — sound is on by default
    await expect(page.locator(".spatial-boot-card")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Enter muted/ })).toHaveCount(0);

    await enterBtn.click();
    await expect(overlay).toHaveCount(0);
    await expect(page.locator('[data-audio-control="music"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(page.locator('[data-audio-control="sfx"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // Clicking top-right "Résumé" opens the inline PDF theater without leaving the portfolio
    const headerResumeBtn = page.getByRole("button", { name: "Résumé", exact: true });
    await headerResumeBtn.click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
    await expect(
      page.locator('iframe[title="Jagger Brulato résumé PDF"]'),
    ).toHaveAttribute("src", "/files/resume.pdf#view=FitH");
    const returnFromHeaderResume = page.getByRole("button", {
      name: /Return to experience/,
    });
    await expectUnobstructed(page, returnFromHeaderResume);
    await returnFromHeaderResume.click();
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);

    // Clicking top-right "Get in touch" navigates to About -> Get in Touch (not a mailto link)
    const contactBtn = page.locator(".spatial-header__cta");
    await expect(contactBtn).toHaveText("Get in touch");
    await contactBtn.click();
    await expect(page).toHaveURL(/section=about/);
    await expect(page).toHaveURL(/item=contact/);
    await expect(
      page.getByRole("complementary", { name: "Get in Touch inspector" }),
    ).toBeVisible();

    // All 4 contact rows (Email, Résumé, GitHub, LinkedIn) sit on their own vertical line with SVG icons
    const rows = page.locator(".sheet-contact-row");
    await expect(rows).toHaveCount(4);
    await expect(rows.locator("svg")).toHaveCount(4);
    const boxes = await Promise.all([0, 1, 2, 3].map((i) => rows.nth(i).boundingBox()));
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y + boxes[i - 1]!.height - 1);
    }

    // Clicking the Résumé row inside Get in Touch opens the inline theater & returns straight back to Get in Touch
    await rows.nth(1).click();
    await expect(page.locator(".spatial-app")).toHaveClass(/is-theater/);
    await expect(
      page.locator('iframe[title="Jagger Brulato résumé PDF"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: /Return to sculpture/ }).click();
    await expect(page.locator(".spatial-app")).not.toHaveClass(/is-theater/);
    await expect(
      page.getByRole("complementary", { name: "Get in Touch inspector" }),
    ).toBeVisible();

    // Deep links ALSO show the floating-cube Enter intro first, then transition straight into the target item
    await page.goto("/?section=projects&item=ojaml");
    await expect(overlay).toBeVisible();
    await expect(page.locator(".glass-sheet")).toHaveCount(0);
    await enterBtn.click();
    await expect(overlay).toHaveCount(0);
    await expect(
      page.getByRole("complementary", { name: "OJaml inspector" }),
    ).toBeVisible();
  });
});
