import { useInfiniteMediaList } from "@/hooks/use-media";

const useFetchAnimeByGenre = (selectedGenre?: string) => {
    const {
        data: anime,
        isLoading: isLoadingAnime,
        fetchNextPage,
        hasNextPage,
        isError,
        refetch
    } = useInfiniteMediaList({
        mediaType: 'anime',
        genreId: selectedGenre
    });

    return {
        anime,
        isLoadingAnime,
        fetchNextPage,
        hasNextPage,
        isError,
        refetch
    };
};

export default useFetchAnimeByGenre;
