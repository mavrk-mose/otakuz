import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { AnimeSection } from '@/components/anime/anime-section';
import { MangaSection } from '@/components/manga/manga-section';
import { NewsSection } from '@/components/news/news-section';
import { EventsSection } from '@/components/events/events-section';
import { CalendarSection } from '@/components/calendar/calendar-section';
import { I18nText } from '@/components/i18n-text';

export default function Home() {
    return (
        <main>
            <HeroSection />

            <div className="container mx-auto px-4 py-8 space-y-16">
                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <AnimeSection />
                </Suspense>

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <MangaSection />
                </Suspense>

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <NewsSection />
                </Suspense>

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <CalendarSection />
                </Suspense>

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <EventsSection />
                </Suspense>
            </div>
        </main>
    );
}
