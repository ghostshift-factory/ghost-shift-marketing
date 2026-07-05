import { type ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Regression test for the localhost:3000 og:image/twitter:image bug: starts a real
// Next.js server with NEXT_PUBLIC_SITE_URL pointed at the production origin and
// asserts the rendered HTML resolves absolute URLs from it, never from localhost.
// Only talks to this local server — no outbound network access to the production
// domain is required for this test to pass.
const PORT = 3999;
const SITE_URL = "https://ghost-shift-marketing.spacerockapps.com";
const NEXT_BIN = path.join(process.cwd(), "node_modules", ".bin", "next");

let server: ChildProcess;

async function waitForServer(url: string, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`);
}

describe("og:image and twitter:image resolve to the production domain", () => {
  beforeAll(async () => {
    server = spawn(NEXT_BIN, ["dev", "-p", String(PORT)], {
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: SITE_URL },
      stdio: "ignore",
    });
    await waitForServer(`http://localhost:${PORT}/`, 60_000);
  }, 70_000);

  afterAll(() => {
    server?.kill();
  });

  it("emits absolute production URLs with no localhost", async () => {
    const response = await fetch(`http://localhost:${PORT}/`);
    const html = await response.text();

    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/);

    expect(ogImageMatch).not.toBeNull();
    expect(twitterImageMatch).not.toBeNull();

    const ogImage = ogImageMatch![1];
    const twitterImage = twitterImageMatch![1];

    expect(ogImage.startsWith(SITE_URL)).toBe(true);
    expect(twitterImage.startsWith(SITE_URL)).toBe(true);
    expect(ogImage).not.toContain("localhost");
    expect(twitterImage).not.toContain("localhost");
  }, 10_000);
});
