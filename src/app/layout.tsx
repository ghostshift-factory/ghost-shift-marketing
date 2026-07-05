import type { Metadata } from "next";
import type { ReactNode } from "react";
import { resolveMetadataBase } from "@/lib/metadata";
import "./globals.css";

const TITLE = "GhostShift — Dark-Factory Automation";
const DESCRIPTION =
  "GhostShift is a dark-factory automation platform that keeps your production line running around the clock, with no operators on the floor and no lights left on.";

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
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
