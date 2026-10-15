import { useInfiniteMediaList } from "@/hooks/use-media";

const useFetchMangaByGenre = (selectedGenre?: string) => {
    const {
        data: manga,
        isLoading: isLoadingManga,
        fetchNextPage,
        hasNextPage
    } = useInfiniteMediaList({
        mediaType: 'manga',
        genreId: selectedGenre
    });

    return {
        manga,
        isLoadingManga,
        fetchNextPage,
        hasNextPage
    };
};

export default useFetchMangaByGenre;
