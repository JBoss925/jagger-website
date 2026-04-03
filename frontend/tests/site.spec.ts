import { expect, test } from "@playwright/test";

test("home and JaggerScript routes render", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Jagger Brulato/i })
  ).toBeVisible();

  await page.goto("/jaggerscript");
  await expect(
    page.getByRole("heading", { name: /JaggerScript Playground/i })
  ).toBeVisible();
});
