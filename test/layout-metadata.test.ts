import { describe, expect, it } from "vitest";

const SITE_URL = "https://ghost-shift-marketing.spacerockapps.com";

describe("root layout metadata", () => {
  it("resolves metadataBase to the production domain with no localhost reference", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;

    const { metadata } = await import("../src/app/layout");

    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect((metadata.metadataBase as URL).href).toBe(`${SITE_URL}/`);

    const openGraphImage = (metadata.openGraph as { images: string[] }).images[0];
    const twitterImage = (metadata.twitter as { images: string[] }).images[0];

    const ogImage = new URL(openGraphImage, metadata.metadataBase as URL).href;
    const resolvedTwitterImage = new URL(twitterImage, metadata.metadataBase as URL).href;

    expect(ogImage.startsWith(SITE_URL)).toBe(true);
    expect(resolvedTwitterImage.startsWith(SITE_URL)).toBe(true);
    expect(JSON.stringify(metadata)).not.toContain("localhost");
  });
});
