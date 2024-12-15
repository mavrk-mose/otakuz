import {useAnimeStore} from "@/store/use-anime-store";
import {useQuery} from "@tanstack/react-query";
import {ANIME_BASE_URL} from "@/lib/api";

const useSearch = () => {
    const searchQuery = useAnimeStore((state) => state.searchQuery);

    // TODO: combine search for manga, movies, tv shows as well then flatten the results
    return useQuery({
        queryKey: ['animeSearch', searchQuery],
        queryFn: async () => {
            if (!searchQuery) return [];
            const response = await fetch(`${ANIME_BASE_URL}/anime?q=${searchQuery}`);
            if (!response.ok) throw new Error('Failed to fetch search results');
            const data = await response.json();
            return data.data;
        },
        enabled: !!searchQuery,
    });
}

export default useSearch;