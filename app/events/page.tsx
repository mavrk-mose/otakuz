"use client"

import {Timeline} from '@/components/events/timeline';
import {TimelineSkeleton} from "@/components/skeletons/timeline-skeleton";
import useFetchEvents from "@/hooks/events/use-fetch-events";
import {GoogleAdUnit} from "@/components/ads/google-ad-unit";

export default function EventsPage() {
    const { events, isLoading } = useFetchEvents();

    return (
        <div className="container mx-auto space-y-10 px-4 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <GoogleAdUnit
                    context="events"
                    variant="spotlight"
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_TOP}
                />
            </div>

            {isLoading ? <TimelineSkeleton/> : <Timeline events={events || []}/>}

            <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
                <GoogleAdUnit
                    context="events"
                    variant="in-feed-grid"
                    adFormat="fluid"
                    seedOffset={2}
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_BOTTOM}
                />
            </div>
        </div>
    );
}