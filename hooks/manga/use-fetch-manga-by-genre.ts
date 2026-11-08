import { useInfiniteMediaList } from "@/hooks/use-media";

const useFetchMangaByGenre = (selectedGenre?: string) => {
    const {
        data: manga,
        isLoading: isLoadingManga,
        fetchNextPage,
        hasNextPage,
        isError,
        refetch
    } = useInfiniteMediaList({
        mediaType: 'manga',
        genreId: selectedGenre
    });

    return {
        manga,
        isLoadingManga,
        fetchNextPage,
        hasNextPage,
        isError,
        refetch
    };
};

export default useFetchMangaByGenre;
