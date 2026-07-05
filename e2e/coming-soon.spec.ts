import { expect, test } from "@playwright/test";

test.describe("coming-soon section", () => {
  test("shows a coming-soon notice", async ({ page }) => {
    await page.goto("/");

    const section = page.locator('[data-section="coming-soon"]');
    await expect(section).toBeVisible();
    await expect(section).toHaveText(/coming soon|available soon|for sale/i);
  });

  test("has no form or input anywhere on the page", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("input")).toHaveCount(0);
  });

  test("sections appear in DOM order hero, product-description, capabilities, coming-soon at 375px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/");

    const order = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-section]")).map((el) =>
        el.getAttribute("data-section"),
      ),
    );

    expect(order).toEqual([
      "hero",
      "product-description",
      "capabilities",
      "coming-soon",
    ]);
  });

  test("renders without overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
