import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveMetadataBase } from "../src/lib/metadata";

describe("resolveMetadataBase", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  it("returns a URL matching the configured production domain", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ghost-shift-marketing.spacerockapps.com";

    const result = resolveMetadataBase();

    expect(result).toBeInstanceOf(URL);
    expect(result.href).toBe("https://ghost-shift-marketing.spacerockapps.com/");
  });

  it("throws a descriptive error when the env var is unset", () => {
    expect(() => resolveMetadataBase()).toThrow(/NEXT_PUBLIC_SITE_URL is not set/);
  });

  it("throws a descriptive error when the env var contains localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    expect(() => resolveMetadataBase()).toThrow(/localhost/);
  });
});
