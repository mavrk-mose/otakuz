"use client";

import { useGenreStore } from "@/store/use-genre-store";
import useFetchAnimeByGenre from "@/hooks/anime/use-fetch-anime-by-genre";
import { InfiniteMediaGrid } from "@/components/infinite-media-grid";

export default function FilteredAnime() {
    const { animeGenre } = useGenreStore();
    const { anime, isLoadingAnime, fetchNextPage, hasNextPage } = useFetchAnimeByGenre(animeGenre);

    return (
        <InfiniteMediaGrid
            pages={anime?.pages}
            isLoading={isLoadingAnime}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            type="anime"
            showBookmark={false}
        />
    );
}
