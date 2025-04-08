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

    return {
        events,
        isLoading
    }
}

export default useFetchEvents;