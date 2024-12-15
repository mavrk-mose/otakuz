"use client"

import {Timeline} from '@/components/events/timeline';
import {TimelineSkeleton} from "@/components/skeletons/TimelineSkeleton";
import useFetchEvents from "@/hooks/events/use-fetch-events";

export default function EventsPage() {
    const { events, isLoading } = useFetchEvents();

    if (isLoading) {
        return <TimelineSkeleton/>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Anime Events</h1>
                    <p className="text-muted-foreground">
                        Join local anime events and meet fellow fans
                    </p>
                </div>
            </div>

            <Timeline events={events || []}/>
        </div>
    );
}