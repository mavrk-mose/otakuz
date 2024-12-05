"use client"

import {useQuery} from '@tanstack/react-query';
import {Timeline} from '@/components/events/timeline';
import {TimelineSkeleton} from "@/components/skeletons/TimelineSkeleton";
import {getEvents} from "@/lib/sanity";
import {Event} from "@/types/events";

export default function EventsPage() {
    const {data: events, isLoading} = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const events: Event[] = await getEvents();
            //add filters if applicable sort the events, filter by category etc
            return events;
        },
        staleTime: 60000 //Cache data for 60 seconds
    });

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