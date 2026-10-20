import type { Metadata, Viewport } from "next";
import { Geist_Mono, Pixelify_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ContentProvider } from "@/components/content-context";
import { SiteProvider } from "@/components/site-context";
import { getPublishedContent } from "@/lib/server/content";
import { getSiteSettings } from "@/lib/server/site-settings";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Used only inside the in-game (Minecraft) mockups.
const pixel = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FraudGuard | Minecraft Anti-Cheat",
  description:
    "Anticheat nowej generacji dla serwerów Minecraft. Wrzucasz plugin, restartujesz serwer, a każdy pakiet, tick i gracz jest analizowany w czasie rzeczywistym.",
  openGraph: {
    title: "FraudGuard | Minecraft Anti-Cheat",
    description: "Cheaterzy nie mają szans. Anticheat nowej generacji dla serwerów Minecraft.",
    locale: "pl_PL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [site, home, pricing, faq] = await Promise.all([getSiteSettings(), getPublishedContent("home"), getPublishedContent("pricing"), getPublishedContent("faq")]);
  return (
    <html lang="pl" className={`${geistMono.variable} ${pixel.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" />
      </head>
      <body>
        <SiteProvider value={site}>
          <ContentProvider value={{ home, pricing, faq }}>
            <Providers>{children}</Providers>
          </ContentProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
