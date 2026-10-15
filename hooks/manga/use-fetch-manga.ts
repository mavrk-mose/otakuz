import { useInfiniteMediaList } from "@/hooks/use-media";

const useFetchManga = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage
    } = useInfiniteMediaList({
        mediaType: 'manga'
    });

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage
    };
};

export default useFetchManga;
