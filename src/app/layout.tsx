import type { ReactNode } from "react";

export const metadata = { title: "ghost-shift-marketing" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
