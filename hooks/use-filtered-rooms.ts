import { useEffect, useState, useCallback } from 'react';
import { useFirebaseChatActions } from '@/hooks/use-firebase-chat-actions';
import { Room } from '@/types/room';

const useFilteredRooms = (searchQuery: string | null) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { getRooms } = useFirebaseChatActions();

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedRooms = await getRooms();
            setRooms(fetchedRooms);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
        } finally {
            setLoading(false);
        }
    }, [getRooms]);

    useEffect(() => {
        fetchRooms();
    }, []);

    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(searchQuery? searchQuery.toLowerCase() : '')
    );

    return { rooms: filteredRooms,setRooms, loading, error, refetch: fetchRooms };
};

export default useFilteredRooms;

