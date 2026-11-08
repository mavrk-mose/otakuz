"use client";


import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";

import { AnimeHoverPreview } from "@/components/anime/anime-hover-preview";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClickOutside } from "@/hooks/search/use-click-outside";
import { Badge } from '@/components/ui/badge';
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useAnimeStore } from "@/store/use-anime-store";
import { Skeleton } from "@/components/ui/skeleton";
import useSearch from "@/hooks/search/use-search";
import { useI18n } from "@/components/i18n-provider";

interface SearchDropdownProps {
  onSelect?: () => void;
}

export function SearchDropdown({ onSelect }: SearchDropdownProps) {
  const { t: localizedT } = useI18n();
  const { t } = useI18n();
  const { data: searchResults, isLoading, isError, refetch, isFetching } = useSearch();
  const searchQuery = useAnimeStore((state) => state.searchQuery);
  const setSearchQuery = useAnimeStore((state) => state.setSearchQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      setSearchQuery("");
    }
  });

  if (!searchQuery) return null;

  return (
    <Card
      ref={dropdownRef}
      className="absolute top-full mt-2 w-full z-50 shadow-lg"
    >
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="p-2" aria-busy="true" aria-label={localizedT("search.loadingResults")}>{Array.from({ length: 5 }, (_, i) => <div key={i} className="flex items-start gap-3 p-2" aria-hidden="true"><Skeleton className="h-[70px] w-[50px] shrink-0" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-6 w-4/5" /><div className="flex gap-2"><Skeleton className="h-5 w-12 rounded-full" /><Skeleton className="h-5 w-1/2" /></div></div></div>)}</div>
        ) : isError && !searchResults?.length ? (
          <ErrorState compact onRetry={() => void refetch()} retrying={isFetching} />
        ) : searchResults?.length ? (
          <div className="p-2">
            {searchResults.map((result) => (
              <AnimeHoverPreview key={`${result.type}-${result.id}`} animeId={result.id} title={result.title} poster={result.image} enabled={result.type === 'anime'}>
              <Link
                href={`/${result.type}/${result.id}`}
                className="flex items-start gap-3 p-2 hover:bg-accent rounded-lg"
                onClick={onSelect}
              >
                <Image
                  src={result.image}
                  alt={result.title}
                  width={50}
                  height={70}
                  className="rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{result.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {result.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {result.type === "anime"
                        ? `${result.episodes || "?"} episodes`
                        : `${result.chapters || "?"} chapters`}{" "}
                      • Score: {result.score || "N/A"}
                    </p>
                  </div>
                </div>
              </Link>
              </AnimeHoverPreview>
            ))}
          </div>
        ) : (
          <EmptyState illustration="search" compact title={t("search.noResults")} description={t("empty.searchDescription")} />
        )}
      </ScrollArea>
    </Card>
  );
}
