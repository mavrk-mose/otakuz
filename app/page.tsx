import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { AnimeSection } from '@/components/anime/anime-section';
import { MangaSection } from '@/components/manga/manga-section';
import { CommunityProfilesSection } from '@/components/home/community-profiles-section';
import { NewsSection } from '@/components/news/news-section';
import { EventsSection } from '@/components/events/events-section';
import { CalendarSection } from '@/components/calendar/calendar-section';
import { I18nText } from '@/components/i18n-text';
import { GoogleAdUnit } from '@/components/ads/google-ad-unit';

export default function Home() {
    return (
        <main>
            <HeroSection />

            <div className="container mx-auto px-4 py-8 space-y-16">
                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <AnimeSection />
                </Suspense>

                <GoogleAdUnit
                    context="home"
                    variant="spotlight"
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_HERO}
                />

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <MangaSection />
                </Suspense>

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <CommunityProfilesSection />
                </Suspense>

                <Suspense fallback={<div><I18nText message="common.loading" /></div>}>
                    <NewsSection />
                </Suspense>

                <GoogleAdUnit
                    context="home"
                    variant="in-feed-grid"
                    adFormat="fluid"
                    seedOffset={2}
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FEED}
                />

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
