"use client";

import { useGenreFilter } from "@/hooks/use-genre-filter";
import useFetchMangaByGenre from "@/hooks/manga/use-fetch-manga-by-genre";
import { InfiniteMediaGrid } from "@/components/infinite-media-grid";

export default function FilteredManga() {
    const { genre: mangaGenre } = useGenreFilter();
    const { manga, isLoadingManga, fetchNextPage, hasNextPage, isError, refetch } = useFetchMangaByGenre(mangaGenre);

    return (
        <InfiniteMediaGrid
            isError={isError}
            onRetry={() => void refetch()}
            pages={manga?.pages}
            isLoading={isLoadingManga}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            type="manga"
            showBookmark={false}
        />
    );
}
