import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {Providers} from './providers';
import Navbar from '@/components/navbar';
import {AuthInitializer} from "@/components/auth-initializer";
import { Toaster } from '@/components/ui/sonner';
import { Search } from '@/components/search';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PlayerLayout } from '@/components/watch/player-layout';
import { BackToTopButton } from '@/components/back-to-top-button';
import { LayoutShell } from '@/components/layout-shell';
import { AdSenseScript } from '@/components/ads/adsense-script';

const inter = Inter({subsets: ['latin']});
const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

export const metadata: Metadata = {
    title: 'Otakuz - Your Anime Community',
    description: 'Discover, track, and watch your favorite anime series',
    icons: {
        icon: '/assets/logo.png',
        shortcut: '/assets/logo.png',
        apple: '/assets/logo.png',
    },
    ...(adsenseClientId && adsenseClientId.startsWith('ca-pub-')
        ? {
              other: {
                  'google-adsense-account': adsenseClientId,
              },
          }
        : {}),
};

export default function RootLayout({children,}: { children: React.ReactNode; }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <AdSenseScript />
                <Providers attribute="class" defaultTheme="dark" enableSystem>
                    <AuthInitializer />
                     <ReactQueryDevtools initialIsOpen={false} />
                    <Toaster />
                    <div className="min-h-screen">
                        <Navbar />
                        <LayoutShell>
                            <Search />
                            <PlayerLayout>
                                <main className="p-4 pb-20 lg:pb-4">{children}</main>
                            </PlayerLayout>
                        </LayoutShell>
                        <BackToTopButton />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
