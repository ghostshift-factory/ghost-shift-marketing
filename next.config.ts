import type { NextConfig } from "next";

/** Warns at config-load time (before the build proceeds) if NEXT_PUBLIC_SITE_URL is missing or points at localhost, so a misconfigured production deploy doesn't ship silently. */
export function checkSiteUrl(env: Record<string, string | undefined> = process.env): void {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.warn(
      "[next.config] NEXT_PUBLIC_SITE_URL is not set. Set it to the production site's HTTPS origin (e.g. https://example.com) before building for production."
    );
    return;
  }

  if (siteUrl.includes("localhost")) {
    console.warn(
      `[next.config] NEXT_PUBLIC_SITE_URL is set to "${siteUrl}", which contains "localhost". Set it to the production site's HTTPS origin (e.g. https://example.com) before building for production.`
    );
  }
}

checkSiteUrl();

const nextConfig: NextConfig = {
  // pg is server-only; keep it out of client bundles.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
