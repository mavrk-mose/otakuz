import { useInfiniteMediaList } from "@/hooks/use-media";
import { AnimeResponse } from "@/types/anime";

const useFetchAnime = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteMediaList<AnimeResponse["data"][number]>({
        mediaType: 'anime'
    });

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
};

export default useFetchAnime;
