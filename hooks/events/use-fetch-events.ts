import {useQuery} from "@tanstack/react-query";
import {Event} from "@/types/events";
import {getEvents} from "@/lib/sanity";

const useFetchEvents = () => {
    const {
        data: events,
        isPending: isLoading
    } = useQuery<Event[]>({
        queryKey: ['events'],
        queryFn: getEvents,
    });

    return {
        events,
        isLoading
    }
}

export default useFetchEvents;