import {getAnimeGenres} from "@/lib/api";
import {useQuery} from "@tanstack/react-query";

const useAnimeGenres =  () => {
    const {
        data: genres,
        isLoading: isLoadingGenres
    } = useQuery({
        queryKey: ['animeGenres'],
        queryFn: getAnimeGenres,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    return {
        genres,
        isLoadingGenres
    }
}

export default useAnimeGenres;