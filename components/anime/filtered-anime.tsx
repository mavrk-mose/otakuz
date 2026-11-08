"use client";

import { useGenreFilter } from "@/hooks/use-genre-filter";
import useFetchAnimeByGenre from "@/hooks/anime/use-fetch-anime-by-genre";
import { InfiniteMediaGrid } from "@/components/infinite-media-grid";

export default function FilteredAnime() {
  const { genre: animeGenre } = useGenreFilter();
  const { anime, isLoadingAnime, fetchNextPage, hasNextPage, isError, refetch } =
    useFetchAnimeByGenre(animeGenre);

  return (
    <InfiniteMediaGrid
      isError={isError}
      onRetry={() => void refetch()}
      pages={anime?.pages}
      isLoading={isLoadingAnime}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      type="anime"
      showBookmark={false}
    />
  );
}
