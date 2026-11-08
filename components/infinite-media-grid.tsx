"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/page-state";
import { useI18n } from "@/components/i18n-provider";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { MediaCard, MediaCardSkeleton, MediaItemData } from "@/components/media-card";

export interface InfiniteMediaGridProps {
    pages?: { data: MediaItemData[] }[];
    isLoading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    hasNextPage?: boolean;
    fetchNextPage: () => void;
    type: "anime" | "manga";
    showBookmark?: boolean;
}

export function InfiniteMediaGrid({
    pages,
    isLoading,
    hasNextPage,
    isError = false,
    onRetry,
    fetchNextPage,
    type,
    showBookmark = false,
}: InfiniteMediaGridProps) {
    const { t } = useI18n();
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const mediaList = pages?.flatMap((page) => page.data) ?? [];

    if (isError && mediaList.length === 0) {
        return <div className="col-span-full"><ErrorState onRetry={onRetry} /></div>;
    }

    if (!isLoading && pages && mediaList.length === 0 && !hasNextPage) {
        return <EmptyState className="col-span-full" illustration="not-found"
            title={t(type === "anime" ? "anime.categoryEmpty" : "manga.categoryEmpty")}
            description={t("empty.categoryDescription")} />;
    }

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
            <div ref={ref} className="col-span-full h-px" aria-hidden="true" />
            {hasNextPage && <MediaCardSkeleton count={8} />}
        </>
    );
}
