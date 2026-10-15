"use client";

import useFetchAnime from "@/hooks/anime/use-fetch-anime";
import { InfiniteMediaGrid } from "@/components/infinite-media-grid";

export default function AnimeCollection() {
    const { data, isLoading, fetchNextPage, hasNextPage } = useFetchAnime();

    return (
        <InfiniteMediaGrid
            pages={data?.pages}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            type="anime"
            showBookmark={true}
        />
    );
}
