import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter-tight";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://moootion.com"),
  title: "MOOOTION — M. Ali Öztürk · 3D Artist & Motion Designer",
  description:
    "Portfolio of M. Ali Öztürk, Istanbul-based 3D artist and motion designer. Broadcast identities, program openers, commercials and product animation.",
  openGraph: {
    title: "MOOOTION — M. Ali Öztürk",
    description: "3D Artist & Motion Designer based in Istanbul.",
    url: "https://moootion.com",
    siteName: "MOOOTION",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4f3f0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
