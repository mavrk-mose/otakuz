import { Suspense } from "react";
import { HeroSection } from "@/components/hero-section";
import { AnimeSection } from "@/components/anime/anime-section";
import { MangaSection } from "@/components/manga/manga-section";
import { CommunityProfilesSection } from "@/components/home/community-profiles-section";
import { NewsSection } from "@/components/news/news-section";
import { EventsSection } from "@/components/events/events-section";
import { CalendarSection } from "@/components/calendar/calendar-section";
import { HomeSectionSkeleton } from "@/components/skeletons/home-section-skeleton";
import { GoogleAdUnit } from "@/components/ads/google-ad-unit";

export default function Home() {
  return (
    <main>
      <HeroSection />

      <div className="container mx-auto px-4 py-8 space-y-16">
        <Suspense fallback={<HomeSectionSkeleton type="anime" />}>
          <AnimeSection />
        </Suspense>

        <GoogleAdUnit
          context="home"
          variant="spotlight"
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_HERO}
        />

        <Suspense fallback={<HomeSectionSkeleton type="manga" />}>
          <MangaSection />
        </Suspense>

        <Suspense fallback={<HomeSectionSkeleton type="community" />}>
          <CommunityProfilesSection />
        </Suspense>

        <Suspense fallback={<HomeSectionSkeleton type="news" />}>
          <NewsSection />
        </Suspense>

        <GoogleAdUnit
          context="home"
          variant="in-feed-grid"
          adFormat="fluid"
          seedOffset={2}
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FEED}
        />

        <Suspense fallback={<HomeSectionSkeleton type="calendar" />}>
          <CalendarSection />
        </Suspense>

        <Suspense fallback={<HomeSectionSkeleton type="events" />}>
          <EventsSection />
        </Suspense>
      </div>
    </main>
  );
}
