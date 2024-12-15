import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";

const useMangaDetails = (mangaId: string) => {
    const {
        data: manga,
        isLoading
    } = useQuery({
        queryKey: ['manga', mangaId],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/manga/${mangaId}`);
            if (!response.ok) throw new Error('Failed to fetch manga details');
            const data = await response.json();
            return data.data;
        },
    });

    return {
        manga,
        isLoading
    };
}

export default useMangaDetails;