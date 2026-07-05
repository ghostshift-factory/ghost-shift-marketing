import { expect, test } from "@playwright/test";

test.describe("key capabilities section", () => {
  test("shows at least three feature items with a heading and body text", async ({ page }) => {
    await page.goto("/");

    const section = page.locator('[data-section="capabilities"]');
    await expect(section).toBeVisible();

    const items = section.locator('[data-testid="capability-item"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const heading = item.getByRole("heading");
      await expect(heading).toBeVisible();
      await expect(heading).not.toBeEmpty();

      const body = item.locator("p");
      await expect(body).toBeVisible();
      await expect(body).not.toBeEmpty();
    }
  });

  for (const width of [375, 1440]) {
    test(`items render without overflowing their container at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const items = page.locator('[data-testid="capability-item"]');
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const overflow = await item.evaluate(
          (el) => el.scrollWidth > el.clientWidth + 1,
        );
        expect(overflow).toBe(false);
      }

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});
