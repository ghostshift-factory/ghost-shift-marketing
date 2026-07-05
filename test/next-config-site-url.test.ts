import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkSiteUrl } from "../next.config";

describe("checkSiteUrl", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns when NEXT_PUBLIC_SITE_URL is absent", () => {
    checkSiteUrl({});

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("NEXT_PUBLIC_SITE_URL is not set"));
  });

  it("warns when NEXT_PUBLIC_SITE_URL contains localhost", () => {
    checkSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("localhost"));
  });

  it("does not warn when NEXT_PUBLIC_SITE_URL is a valid production HTTPS URL", () => {
    checkSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ghost-shift-marketing.spacerockapps.com" });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
