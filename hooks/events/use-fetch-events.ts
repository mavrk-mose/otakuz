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
        staleTime: 60000 //Cache data for 60 seconds
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