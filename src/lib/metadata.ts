/** Resolves NEXT_PUBLIC_SITE_URL to a URL, refusing unset or localhost values so a misconfigured production build cannot ship undetected. */
export function resolveMetadataBase(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Set it to the production site URL (e.g. https://example.com) before building."
    );
  }

  if (siteUrl.includes("localhost")) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is set to "${siteUrl}", which contains "localhost". Set it to the production site URL (e.g. https://example.com) before building.`
    );
  }

  return new URL(siteUrl);
}
