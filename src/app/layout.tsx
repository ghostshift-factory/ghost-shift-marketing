import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const TITLE = "GhostShift — Dark-Factory Automation";
const DESCRIPTION =
  "GhostShift is a dark-factory automation platform that keeps your production line running around the clock, with no operators on the floor and no lights left on.";

// FIX TARGET (T-4): no `metadataBase` is set here, so Next.js resolves the relative
// `images: ["/og-image.png"]` paths below against its dev-server default
// (http://localhost:3000) instead of the production origin. T-4 should set
// `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)` so og:image and
// twitter:image resolve to absolute production URLs.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header />
        <main>{children}</main>
        <footer />
      </body>
    </html>
  );
}
