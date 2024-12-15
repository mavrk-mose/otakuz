import {useQuery} from "@tanstack/react-query";
import {Event} from "@/types/events";
import {getEvents} from "@/lib/sanity";

const useFetchEvents = () => {
    const {
        data: events,
        isLoading
    } = useQuery<Event[]>({
        queryKey: ['events'],
        queryFn: getEvents,
        staleTime: Infinity
    });

    //add filters if applicable sort the events, filter by category etc
    const sortedEvents = events?.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
        events,
        isLoading
    }
}

export default useFetchEvents;