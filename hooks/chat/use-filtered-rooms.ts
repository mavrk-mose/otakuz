import { useQuery } from '@tanstack/react-query';
import { useFirebaseChatActions } from '@/hooks/chat/use-firebase-chat-actions';
import { Room } from '@/types/room';

const useFilteredRooms = (searchQuery: string | null) => {
    const { getRooms } = useFirebaseChatActions();

    const {
        data: rooms = [],
        error,
        isLoading,
        refetch,
    } = useQuery<Room[]>({
        queryKey: ['rooms'],
        queryFn: getRooms,
        staleTime: Infinity
    });

    const filteredRooms = searchQuery
        ? rooms.filter(room =>
            room.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : rooms;

    return {
        rooms: filteredRooms,
        loading: isLoading,
        error,
        refetch
    };
};

export default useFilteredRooms;
