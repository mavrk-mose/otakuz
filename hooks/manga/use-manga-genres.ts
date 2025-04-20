import {getMangaGenres} from "@/lib/api";
import {useQuery} from "@tanstack/react-query";

const useMangaGenres =  () => {
    const {
        data: genres,
        isLoading: isLoadingGenres
    } = useQuery({
        queryKey: ['mangaGenres'],
        queryFn: getMangaGenres,
        staleTime: Infinity
    });

    return {
        genres,
        isLoadingGenres
    }
}

export default useMangaGenres;