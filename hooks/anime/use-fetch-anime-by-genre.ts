import { useInfiniteMediaList } from "@/hooks/use-media";

const useFetchAnimeByGenre = (selectedGenre?: string) => {
    const {
        data: anime,
        isLoading: isLoadingAnime,
        fetchNextPage,
        hasNextPage
    } = useInfiniteMediaList({
        mediaType: 'anime',
        genreId: selectedGenre
    });

    return {
        anime,
        isLoadingAnime,
        fetchNextPage,
        hasNextPage
    };
};

export default useFetchAnimeByGenre;
