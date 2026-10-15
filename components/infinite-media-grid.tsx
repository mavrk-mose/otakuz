"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { MediaCard, MediaCardSkeleton, MediaItemData } from "@/components/media-card";

export interface InfiniteMediaGridProps {
    pages?: { data: MediaItemData[] }[];
    isLoading: boolean;
    hasNextPage?: boolean;
    fetchNextPage: () => void;
    type: "anime" | "manga";
    showBookmark?: boolean;
}

export function InfiniteMediaGrid({
    pages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    type,
    showBookmark = false,
}: InfiniteMediaGridProps) {
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const mediaList = pages?.flatMap((page) => page.data) ?? [];

    return (
        <>
            {isLoading && <MediaCardSkeleton count={4} />}
            {mediaList.map((item) => (
                <MediaCard
                    key={item.mal_id}
                    item={item}
                    type={type}
                    showBookmark={showBookmark}
                />
            ))}
            <div ref={ref} />
            {hasNextPage && <MediaCardSkeleton count={8} />}
        </>
    );
}
