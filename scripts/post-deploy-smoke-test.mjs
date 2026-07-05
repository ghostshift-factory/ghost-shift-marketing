// Post-deploy smoke test (ST-1/ST-2): run by the operator's deploy pipeline
// (the Ship station, outside this repo) after `docker compose up -d --build`
// completes, to catch a broken TLS cert or a localhost-leaking og:image before
// anyone shares the link. Exits non-zero on any failed check.

// curl --retry 6 --retry-delay 30 --retry-connrefused --fail semantics:
// tolerates the async ACME provisioning window (up to ~3 min: 6 * 30s).
export async function fetchWithRetry(url, { retries = 6, delayMs = 30_000, fetchImpl = fetch, sleep = defaultSleep } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url);
      if (response.ok) return response;
      lastError = new Error(`GET ${url} failed: HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < retries) await sleep(delayMs);
  }
  throw new Error(`GET ${url} did not succeed after ${retries + 1} attempts: ${lastError.message}`);
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// AC ST-2/1: og:image and twitter:image must be absolute production URLs, never localhost.
export function assertProductionImageUrls(html, siteUrl) {
  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/);

  if (!ogImageMatch) throw new Error("og:image meta tag not found in page HTML");
  if (!twitterImageMatch) throw new Error("twitter:image meta tag not found in page HTML");

  const ogImage = ogImageMatch[1];
  const twitterImage = twitterImageMatch[1];

  for (const [name, url] of [["og:image", ogImage], ["twitter:image", twitterImage]]) {
    if (!url.startsWith(siteUrl)) throw new Error(`${name} "${url}" does not start with ${siteUrl}`);
    if (url.includes("localhost")) throw new Error(`${name} "${url}" contains localhost`);
  }

  return { ogImage, twitterImage };
}

// AC ST-2/2: the og:image URL itself must resolve to a real PNG.
export function assertImageAsset(response) {
  if (!response.ok) throw new Error(`og:image request failed: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type");
  if (contentType !== "image/png") {
    throw new Error(`og:image Content-Type was "${contentType}", expected "image/png"`);
  }
}

export async function runSmokeTest(siteUrl, { fetchImpl = fetch, sleep = defaultSleep } = {}) {
  const pageResponse = await fetchWithRetry(siteUrl, { fetchImpl, sleep });
  const html = await pageResponse.text();
  const { ogImage } = assertProductionImageUrls(html, siteUrl);

  const imageResponse = await fetchImpl(ogImage);
  assertImageAsset(imageResponse);
}

const isMain = process.argv[1] && import.meta.url === new URL(process.argv[1], "file://").href;
if (isMain) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.argv[2];
  if (!siteUrl) {
    console.error("Usage: NEXT_PUBLIC_SITE_URL=<url> node scripts/post-deploy-smoke-test.mjs");
    process.exit(1);
  }
  try {
    await runSmokeTest(siteUrl);
    console.log(`smoke test passed for ${siteUrl}`);
  } catch (error) {
    console.error(`smoke test failed: ${error.message}`);
    process.exit(1);
  }
}
