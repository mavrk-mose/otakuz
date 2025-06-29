import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {Providers} from './providers';
import Navbar from '@/components/navbar';
import {AuthInitializer} from "@/components/auth-initializer";
import { Toaster } from '@/components/ui/sonner';
import { Search } from '@/components/search';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'Otakuz - Your Anime Community',
    description: 'Discover, track, and watch your favorite anime series',
    icons: {
        icon: '/assets/logo.png',
        shortcut: '/assets/logo.png',
        apple: '/assets/logo.png',
    },
};

export default function RootLayout({children,}: { children: React.ReactNode; }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Providers attribute="class" defaultTheme="system" enableSystem>
                    <AuthInitializer />
                    <Toaster />
                    <div className="flex min-h-screen flex-col md:flex-row">
                        <aside className="md:block w-20 lg:w-20 bg-black text-white">
                            <Navbar />
                        </aside>

                        <div className="flex-1">
                            <Search />
                            <main className="p-4">{children}</main>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
