import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Otakuz - Your Anime Community',
  description: 'Discover, track, and watch your favorite anime series',
};

export default function RootLayout({ children,}: { children: React.ReactNode;}) {  
  return (
      <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
      <Providers attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </Providers>
      </body>
      </html>
  );
}