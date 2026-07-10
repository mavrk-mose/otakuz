import { useQuery } from '@tanstack/react-query';
import { useFirebaseChatActions } from '@/hooks/chat/use-firebase-chat-actions';
import { Room } from '@/types/room';
import { useAuth } from '@/hooks/use-auth';

const useFilteredRooms = (searchQuery: string | null) => {
    const { getRooms } = useFirebaseChatActions();
    const { user } = useAuth();

    const {
        data: rooms = [],
        error,
        isLoading,
        refetch,
    } = useQuery<Room[]>({
        queryKey: ['rooms'],
        queryFn: getRooms,
        enabled: !!user,
        retry: false,
        staleTime: Infinity
    });

    const filteredRooms = searchQuery
        ? rooms.filter((room: Room) =>
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
