"use client";
import { I18nText } from "@/components/i18n-text";


import { AnimeHoverPreview } from "@/components/anime/anime-hover-preview";
import { useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInView } from "react-intersection-observer";

import { useRecentAnime } from "@/hooks/anime/use-recent-anime";
import { useAnimeVideos } from "@/hooks/anime/use-anime-videos";

import WatchSkeleton, { RecentAnimeSkeleton } from "@/components/skeletons/watch-skeleton";
import Image from "next/image";
import RecentAnime from "@/components/anime/recent-anime";
import { AnimeEntry } from "@/types/anime";
import VideoTabs from "@/components/watch/video-tabs";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { usePlayerStore } from "@/store/use-player-store";
import { useRecordWatchHistory } from "@/hooks/use-watch-history";

export default function WatchPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const currentId = params?.id as string;

  const { ref, inView } = useInView();
  const { data, isLoading, fetchNextPage, hasNextPage } = useRecentAnime();

  const initialAnimeData = data?.pages[0]?.data?.[0]?.entry?.[0] ?? null;

  const { data: animeVideos, isLoading: isLoadingVideos } = useAnimeVideos(
    currentId ?? ""
  );

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!currentId && initialAnimeData?.mal_id) {
      router.replace(`/watch/${initialAnimeData.mal_id}`);
    }
  }, [currentId, initialAnimeData, router]);

  const videoFromQuery = searchParams.get("videoUrl");

  const promoQueue = useMemo(() => {
    const seen = new Set<string>();
    return (animeVideos?.promo || []).flatMap(promo => {
      const src = promo.trailer?.embed_url;
      if (!src || seen.has(src)) return [];
      seen.add(src);
      return [{
        id: `${currentId}:${src}`, src, title: promo.title,
        posterUrl: promo.trailer.images?.large_image_url || promo.trailer.images?.medium_image_url || undefined,
        playerRoute: `/watch/${currentId}?videoUrl=${encodeURIComponent(src)}`,
      }];
    });
  }, [animeVideos, currentId]);
  const musicQueue = useMemo(() => (animeVideos?.music_videos || []).flatMap(music => {
    const src = music.video?.embed_url;
    return src ? [{ id: `${currentId}:${src}`, src, title: music.title,
      posterUrl: music.video.images?.large_image_url || undefined,
      playerRoute: `/watch/${currentId}?videoUrl=${encodeURIComponent(src)}` }] : [];
  }), [animeVideos, currentId]);
  const promoIndex = promoQueue.findIndex(video => video.src === videoFromQuery);
  const musicIndex = musicQueue.findIndex(video => video.src === videoFromQuery);
  const queue = musicIndex >= 0 && promoIndex < 0 ? musicQueue : promoQueue;
  const selectedIndex = queue === musicQueue ? musicIndex : Math.max(0, promoIndex);
  const selectedVideo = queue[selectedIndex];
  const selectedVideoUrl = selectedVideo?.src || null;
  const selectedVideoTitle = selectedVideo?.title || "Anime video";
  const selectedVideoPoster = selectedVideo?.posterUrl;

  useEffect(() => {
    if (!selectedVideo) return;
    usePlayerStore.getState().openQueue(queue, selectedIndex);
  }, [queue, selectedIndex, selectedVideo]);

  const selectedAnime =
    data?.pages
      .flatMap((p) => p.data)
      .flatMap((d: any) => d.entry)
      .find((a: AnimeEntry) => String(a.mal_id) === String(currentId)) ?? null;

  useRecordWatchHistory(
    currentId && (selectedAnime || selectedVideoUrl)
      ? {
          itemId: `watch_${currentId}_${selectedVideoUrl || "main"}`,
          type: "anime",
          title: selectedAnime?.title
            ? selectedVideoTitle && selectedVideoTitle !== "Anime video"
              ? `${selectedAnime.title} — ${selectedVideoTitle}`
              : selectedAnime.title
            : selectedVideoTitle,
          subtitle: "Watched Promo / Video",
          image:
            selectedVideoPoster ||
            selectedAnime?.images?.webp?.image_url ||
            "",
          href: selectedVideoUrl
            ? `/watch/${currentId}?videoUrl=${encodeURIComponent(selectedVideoUrl)}`
            : `/watch/${currentId}`,
        }
      : null
  );

  if (isLoading || isLoadingVideos) return <WatchSkeleton />;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="hidden w-64 flex-shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground md:flex">
        <h2 className="p-4 text-sm font-semibold">
          RECENT ANIME
        </h2>

        <ScrollArea className="flex-grow">
          <div className="space-y-2 p-4">
            {data?.pages.map((page, pageIndex) =>
              page.data.map((animeData: any) => (
                <RecentAnime
                  key={`${pageIndex}-${animeData.content}-${animeData.entry[0].mal_id}`}
                  animeData={animeData}
                />
              ))
            )}
          </div>

          <div ref={ref} />

          {hasNextPage &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`next-page-loading-${index}`} className="m-4"><RecentAnimeSkeleton /></div>
            ))}
        </ScrollArea>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {/* ANIME INFO */}
          {selectedAnime && (
            <div className="border-y bg-muted/40 p-4">
              <h1 className="text-xl font-bold mb-2">{selectedAnime.title}</h1>

              <div className="flex items-center space-x-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedAnime.images.webp.small_image_url} />
                  <AvatarFallback>{selectedAnime.title[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{selectedAnime.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <Link
                      href={`/anime/${selectedAnime.mal_id}`}
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View details
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!selectedVideo && <p role="status" className="p-4 text-muted-foreground"><I18nText message="watch.noPromos" /></p>}
          {promoQueue.length > 0 && <p className="px-4 py-2 text-sm text-muted-foreground">Promo queue · {promoIndex >= 0 ? promoIndex + 1 : 1} / {promoQueue.length}</p>}
          <VideoTabs
            animeVideos={animeVideos}
            selectedVideoUrl={selectedVideoUrl ?? ""}
            onVideoSelect={(url: string) =>
              router.push(
                `/watch/${currentId}?videoUrl=${encodeURIComponent(url)}`
              )
            }
          />

          {/* RECOMMENDED ANIME */}
          <div>
            <h2 className="text-xl font-bold mb-2 ml-4">{t("watch.exploreMore")}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {data?.pages.flatMap((page, pageIndex) =>
                page.data.flatMap((animeData: any, groupIndex: number) =>
                  animeData.entry.map((anime: AnimeEntry, animeIndex: number) => (
                    <AnimeHoverPreview key={`${pageIndex}-${groupIndex}-${animeIndex}-${animeData.content}-${anime.mal_id}`} animeId={anime.mal_id} title={anime.title} poster={anime.images.webp.image_url}>
                    <Card
                      className="cursor-pointer overflow-hidden transition-colors hover:bg-accent"
                      onClick={() => router.push(`/watch/${anime.mal_id}`)}
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={anime.images.webp.image_url}
                          alt={anime.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>

                      <div className="p-2">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {anime.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          MyAnimeList ID: {anime.mal_id}
                        </p>
                      </div>
                    </Card>
                    </AnimeHoverPreview>
                  ))
                )
              )}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
