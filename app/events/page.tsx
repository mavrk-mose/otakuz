"use client"

import {Timeline} from '@/components/events/timeline';
import {TimelineSkeleton} from "@/components/skeletons/timeline-skeleton";
import useFetchEvents from "@/hooks/events/use-fetch-events";

export default function EventsPage() {
    const { events, isLoading } = useFetchEvents();

    if (isLoading) {
        return <TimelineSkeleton/>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Timeline events={events || []}/>
        </div>
    );
}