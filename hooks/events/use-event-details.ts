import {useQuery} from "@tanstack/react-query";
import {Event} from "@/types/events";
import {client} from "@/lib/sanity";

const useEventDetails = (eventId: string) => {
    const {
        data: event,
        isLoading
    } = useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const event: Event = await client.fetch(`
            *[_type == "event" && _id == $id][0] {
              _id,
              title,
              description,
              date,
              time,
              ticket,
              location,
              thumbnailUrl,
              category,
              tags,
              gallery[],
              activities[],
              tournaments[],
              attendees[],
              organizers[]->{
                _id,
                name,
                avatar
              }
            }
          `, {id: eventId});
            return event;
        },
        staleTime: Infinity
    });

    return {
        event,
        isLoading
    }
}

export default useEventDetails;