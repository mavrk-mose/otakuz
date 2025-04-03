import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { AnimeSection } from '@/components/anime/anime-section';
import { MangaSection } from '@/components/manga/manga-section';
import { NewsSection } from '@/components/news/news-section';
import { EventsSection } from '@/components/events/events-section';
import { Search } from '@/components/search'

export default function Home() {
    return (
        <main>
            <Search/>
            <HeroSection />

            <div className="container mx-auto px-4 py-8 space-y-16">
                <Suspense fallback={<div>Loading...</div>}>
                    <AnimeSection />
                </Suspense>

                <Suspense fallback={<div>Loading...</div>}>
                    <MangaSection />
                </Suspense>

                <Suspense fallback={<div>Loading...</div>}>
                    <NewsSection />
                </Suspense>

                <Suspense fallback={<div>Loading...</div>}>
                    <EventsSection />
                </Suspense>
            </div>
        </main>
    );
}