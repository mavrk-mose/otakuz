"use client";

import { useGenreStore } from "@/store/use-genre-store";
import useFetchMangaByGenre from "@/hooks/manga/use-fetch-manga-by-genre";
import { InfiniteMediaGrid } from "@/components/infinite-media-grid";

export default function FilteredManga() {
    const { mangaGenre } = useGenreStore();
    const { manga, isLoadingManga, fetchNextPage, hasNextPage } = useFetchMangaByGenre(mangaGenre);

    return (
        <InfiniteMediaGrid
            pages={manga?.pages}
            isLoading={isLoadingManga}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            type="manga"
            showBookmark={false}
        />
    );
}
