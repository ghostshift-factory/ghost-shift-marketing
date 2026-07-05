import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "ghost-shift-marketing" };

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
