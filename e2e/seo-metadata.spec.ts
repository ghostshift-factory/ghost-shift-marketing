import { expect, test } from "@playwright/test";

test.describe("SEO and Open Graph metadata", () => {
  test("document head has non-empty title and social preview tags", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/GhostShift/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /.+/);

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute("content", /.+/);

    const ogImage = page.locator('meta[property="og:image"]');
    const ogImageContent = await ogImage.getAttribute("content");
    expect(ogImageContent).toBeTruthy();

    const ogImageUrl = new URL(ogImageContent!, page.url());
    expect(ogImageUrl.pathname).toBe("/og-image.png");

    const imageResponse = await page.request.get(ogImageUrl.toString());
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toMatch(/^image\/png/);
  });
});
