import { describe, expect, it, vi } from "vitest";
import {
  assertImageAsset,
  assertProductionImageUrls,
  fetchWithRetry,
  runSmokeTest,
} from "../scripts/post-deploy-smoke-test.mjs";

const SITE_URL = "https://ghost-shift-marketing.spacerockapps.com";

function htmlWithImages(ogImage: string, twitterImage: string) {
  return `<html><head><meta property="og:image" content="${ogImage}"><meta name="twitter:image" content="${twitterImage}"></head></html>`;
}

function jsonResponse(ok: boolean, status = ok ? 200 : 500) {
  return { ok, status } as Response;
}

describe("fetchWithRetry", () => {
  it("returns the response once a retry succeeds, tolerating connection-refused-style errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValueOnce(jsonResponse(true));
    const sleep = vi.fn().mockResolvedValue(undefined);

    const response = await fetchWithRetry(SITE_URL, { retries: 6, delayMs: 30_000, fetchImpl, sleep });

    expect(response.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(30_000);
  });

  it("throws after exhausting all retries when the failure persists", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(false, 526));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(fetchWithRetry(SITE_URL, { retries: 2, delayMs: 1, fetchImpl, sleep })).rejects.toThrow(
      /did not succeed after 3 attempts/,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});

describe("assertProductionImageUrls", () => {
  it("accepts og:image and twitter:image that are absolute production URLs", () => {
    const html = htmlWithImages(`${SITE_URL}/og-image.png`, `${SITE_URL}/og-image.png`);
    const { ogImage, twitterImage } = assertProductionImageUrls(html, SITE_URL);
    expect(ogImage).toBe(`${SITE_URL}/og-image.png`);
    expect(twitterImage).toBe(`${SITE_URL}/og-image.png`);
  });

  it("throws when og:image contains localhost", () => {
    const html = htmlWithImages("http://localhost:3000/og-image.png", `${SITE_URL}/og-image.png`);
    expect(() => assertProductionImageUrls(html, SITE_URL)).toThrow(/localhost/);
  });

  it("throws when twitter:image does not start with the production origin", () => {
    const html = htmlWithImages(`${SITE_URL}/og-image.png`, "https://evil.example.com/og-image.png");
    expect(() => assertProductionImageUrls(html, SITE_URL)).toThrow(/does not start with/);
  });

  it("throws when the og:image meta tag is missing", () => {
    const html = "<html><head></head></html>";
    expect(() => assertProductionImageUrls(html, SITE_URL)).toThrow(/og:image meta tag not found/);
  });
});

describe("assertImageAsset", () => {
  it("passes for a 200 response with Content-Type image/png", () => {
    const response = {
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "image/png" }),
    } as Response;
    expect(() => assertImageAsset(response)).not.toThrow();
  });

  it("throws when the response is not ok", () => {
    const response = { ok: false, status: 404, headers: new Headers() } as Response;
    expect(() => assertImageAsset(response)).toThrow(/HTTP 404/);
  });

  it("throws when Content-Type is not image/png", () => {
    const response = {
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
    } as Response;
    expect(() => assertImageAsset(response)).toThrow(/expected "image\/png"/);
  });
});

describe("runSmokeTest", () => {
  it("fetches the page, validates og:image/twitter:image, then validates the image asset", async () => {
    const html = htmlWithImages(`${SITE_URL}/og-image.png`, `${SITE_URL}/og-image.png`);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => html } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "image/png" }),
      } as Response);

    await expect(runSmokeTest(SITE_URL, { fetchImpl })).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenNthCalledWith(1, SITE_URL);
    expect(fetchImpl).toHaveBeenNthCalledWith(2, `${SITE_URL}/og-image.png`);
  });

  it("rejects when the og:image asset does not resolve to a PNG", async () => {
    const html = htmlWithImages(`${SITE_URL}/og-image.png`, `${SITE_URL}/og-image.png`);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => html } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/html" }),
      } as Response);

    await expect(runSmokeTest(SITE_URL, { fetchImpl })).rejects.toThrow(/expected "image\/png"/);
  });
});
