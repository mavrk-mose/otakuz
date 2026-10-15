"use client";

import useFetchManga from "@/hooks/manga/use-fetch-manga";
import { InfiniteMediaGrid } from "@/components/infinite-media-grid";

export default function MangaCollection() {
    const { data, isLoading, fetchNextPage, hasNextPage } = useFetchManga();

    return (
        <InfiniteMediaGrid
            pages={data?.pages}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            type="manga"
            showBookmark={true}
        />
    );
}
