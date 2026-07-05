import { expect, test } from "@playwright/test";

test("og-image.png is served as a PNG", async ({ request }) => {
  const response = await request.get("/og-image.png");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\/png/);
});
