import { type Server, createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// Exercises scripts/smoke-meta.sh against fixture HTML servers rather than a real
// `next dev` instance: the script only cares about the HTTP response body, and a
// fixture keeps this fast and deterministic instead of racing another test file's
// dev server for CPU. The script's real-world integration (curling an actual Next.js
// page) is covered by manually running it against a `next dev` server, per the ticket.
const SCRIPT = path.join(process.cwd(), "scripts", "smoke-meta.sh");

function metaHtml(ogImage: string, twitterImage: string) {
  return `<!doctype html><html><head><meta property="og:image" content="${ogImage}"/><meta name="twitter:image" content="${twitterImage}"/></head><body></body></html>`;
}

let server: Server | undefined;

// Starts a fixture server and serves HTML built from its own base URL, so the
// response's og:image/twitter:image can legitimately match BASE_URL.
async function serveSelfReferencing(): Promise<string> {
  let baseUrl = "";
  server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(metaHtml(`${baseUrl}/og.png`, `${baseUrl}/twitter.png`));
  });
  await new Promise<void>((resolve) => server?.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
  return baseUrl;
}

async function serve(html: string): Promise<string> {
  server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(html);
  });
  await new Promise<void>((resolve) => server?.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterEach(() => {
  server?.close();
  server = undefined;
});

describe("scripts/smoke-meta.sh", () => {
  it("exits 0 when og:image and twitter:image are routable and match BASE_URL", async () => {
    const url = await serveSelfReferencing();

    const result = spawnSync("bash", [SCRIPT, url], { encoding: "utf8" });

    expect(result.stdout).toContain("OK: og:image");
    expect(result.stdout).toContain("OK: twitter:image");
    expect(result.status).toBe(0);
  });

  it("exits non-zero when og:image contains localhost", async () => {
    const url = await serve(metaHtml("http://localhost:3000/og.png", "http://localhost:3000/twitter.png"));

    const result = spawnSync("bash", [SCRIPT, url], { encoding: "utf8" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("localhost");
  });

  it("exits non-zero when og:image doesn't start with BASE_URL", async () => {
    const url = await serve(
      metaHtml("https://not-the-right-domain.example/og.png", "https://not-the-right-domain.example/twitter.png")
    );

    const result = spawnSync("bash", [SCRIPT, url], { encoding: "utf8" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("does not start with");
  });

  it("exits non-zero when a meta tag is missing", async () => {
    const url = await serve("<!doctype html><html><head></head><body></body></html>");

    const result = spawnSync("bash", [SCRIPT, url], { encoding: "utf8" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("not found");
  });

  it("exits non-zero on a page it cannot fetch", () => {
    const result = spawnSync("bash", [SCRIPT, "http://127.0.0.1:1/"], { encoding: "utf8" });

    expect(result.status).not.toBe(0);
  });
});
