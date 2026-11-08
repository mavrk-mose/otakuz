import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Search } from "@/components/search";
import { PlayerLayout } from "@/components/watch/player-layout";
import { BackToTopButton } from "@/components/back-to-top-button";
import { LayoutShell } from "@/components/layout-shell";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { LegalLinks } from "@/components/legal/legal-links";
import { PwaInstall } from "@/components/pwa-install";
import { ADSENSE_CLIENT_ID } from "@/lib/adsense-config";

const inter = Inter({ subsets: ["latin"] });
const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  title: "Otakuz - Your Anime Community",
  description: "Discover, track, and watch your favorite anime series",
  applicationName: "Otakuz",
  appleWebApp: { capable: true, title: "Otakuz", statusBarStyle: "default" },
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/icons/icon-180.png",
  },
  ...(adsenseClientId && adsenseClientId.startsWith("ca-pub-")
    ? {
        other: {
          "google-adsense-account": adsenseClientId,
        },
      }
    : {}),
};

export const viewport: Viewport = { themeColor: "#17181f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <AdSenseScript />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers attribute="class" defaultTheme="dark" enableSystem>
          <Toaster />
          <PwaInstall />
          <div className="min-h-screen">
            <Navbar />
            <LayoutShell>
              <Search />
              <PlayerLayout>
                <main className="min-w-0 max-w-full overflow-x-clip p-4 pb-20 lg:pb-4">
                  {children}
                </main>
              </PlayerLayout>
              <LegalLinks />
            </LayoutShell>
            <BackToTopButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}
