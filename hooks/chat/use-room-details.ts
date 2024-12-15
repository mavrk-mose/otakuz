import { useFirebaseChatActions } from "@/hooks/chat/use-firebase-chat-actions";
import {useQuery} from "@tanstack/react-query";
import {RoomDetails} from "@/types/room";

const useRoomDetails = (id: string | null) => {
    const { getRoomDetails } = useFirebaseChatActions();

    const {
        data: roomDetails,
        error,
        isLoading,
        refetch,
    } = useQuery<RoomDetails | null>({
        queryKey: ['roomDetails', id],
        queryFn: () => getRoomDetails(id),
        staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    });

    return {
        roomDetails,
        loading: isLoading,
        error,
        refetch
    };

}

export default useRoomDetails;