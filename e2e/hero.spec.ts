import { expect, test } from "@playwright/test";

test.describe("hero section", () => {
  test("shows the GhostShift headline and tagline", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("GhostShift");

    const tagline = page.getByTestId("hero-tagline");
    await expect(tagline).toBeVisible();
    await expect(tagline).not.toBeEmpty();
  });

  for (const width of [375, 1440]) {
    test(`renders without overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});
