import {getAnimeGenres} from "@/lib/api";
import {useQuery} from "@tanstack/react-query";

const useAnimeGenres =  () => {
    const {
        data: genres,
        isLoading: isLoadingGenres
    } = useQuery({
        queryKey: ['animeGenres'],
        queryFn: getAnimeGenres,
        staleTime: Infinity
    });

    return {
        genres,
        isLoadingGenres
    }
}

export default useAnimeGenres;