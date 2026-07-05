import { expect, test } from "@playwright/test";

test.describe("product description section", () => {
  test("shows a heading and at least two non-empty paragraphs", async ({ page }) => {
    await page.goto("/");

    const section = page.locator('[data-section="product-description"]');
    await expect(section).toBeVisible();

    const heading = section.getByRole("heading");
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();

    const paragraphs = section.locator("p");
    const count = await paragraphs.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const paragraph = paragraphs.nth(i);
      await expect(paragraph).toBeVisible();
      await expect(paragraph).not.toBeEmpty();
    }
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
