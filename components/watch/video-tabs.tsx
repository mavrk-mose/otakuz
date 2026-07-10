"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AnimeVideos } from "@/types/anime";
import { useI18n } from "@/components/i18n-provider";
import { PlayCircle } from "lucide-react";

type VideoImages = Partial<{
  image_url: string | null;
  small_image_url: string | null;
  medium_image_url: string | null;
  large_image_url: string | null;
  maximum_image_url: string | null;
}>;

interface VideoThumbnailProps {
  images?: VideoImages;
  youtubeId?: string | null;
  title: string;
}

function VideoThumbnail({ images, youtubeId, title }: VideoThumbnailProps) {
  const sources = useMemo(() => {
    const candidates = [
      images?.large_image_url,
      youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null,
      images?.medium_image_url,
      images?.image_url,
      images?.small_image_url,
      images?.maximum_image_url,
    ].filter(
      (source): source is string =>
        typeof source === "string" && source.trim().length > 0
    );

    return candidates.filter(
      (source, index) => candidates.indexOf(source) === index
    );
  }, [
    images?.image_url,
    images?.large_image_url,
    images?.maximum_image_url,
    images?.medium_image_url,
    images?.small_image_url,
    youtubeId,
  ]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const sourceKey = sources.join("|");

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceKey]);

  const source = sources[sourceIndex];

  if (!source) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
        <PlayCircle className="h-10 w-10" aria-hidden="true" />
        <span className="sr-only">No thumbnail available for {title}</span>
      </div>
    );
  }

  return (
    <Image
      key={source}
      src={source}
      alt={title}
      fill
      sizes="(min-width: 768px) 33vw, 50vw"
      className="rounded object-cover"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  );
}

interface VideoTabsProps {
  animeVideos: AnimeVideos | undefined;
  selectedVideoUrl: string;
  onVideoSelect: (url: string) => void;
}

export default function VideoTabs({
  animeVideos,
  selectedVideoUrl,
  onVideoSelect,
}: VideoTabsProps) {
  const { t } = useI18n();
  if (!animeVideos) return null;

  const { episodes, promo, music_videos } = animeVideos;

  return (
    <div className="border-b bg-muted/40 p-4">
      <Tabs defaultValue="episodes" className="w-full">
        {/* TAB LABELS */}
        <TabsList className="mb-4 bg-muted">
          {episodes.length > 0 && <TabsTrigger value="episodes">{t("common.episodes")}</TabsTrigger>}
          {promo.length > 0 && <TabsTrigger value="promo">{t("watch.promos")}</TabsTrigger>}
          {music_videos.length > 0 && <TabsTrigger value="music">{t("watch.musicVideos")}</TabsTrigger>}
        </TabsList>

        {/* EPISODES TAB */}
        <TabsContent value="episodes">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {episodes.map((ep) => (
              <Card
                key={ep.mal_id}
                onClick={() => onVideoSelect(ep.url)}
                className={cn(
                  "cursor-pointer border bg-card p-2 transition-colors",
                  ep.url === selectedVideoUrl
                    ? "border-primary shadow-md"
                    : "border-border hover:bg-accent"
                )}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded bg-muted">
                  <VideoThumbnail
                    images={{ image_url: ep.images?.jpg?.image_url }}
                    title={ep.title}
                  />
                </div>
                <p className="text-sm mt-2 line-clamp-2">{ep.title}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PROMOS TAB */}
        <TabsContent value="promo">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {promo.map((p) => {
              const url = p.trailer.embed_url;
              return (
                <Card
                  key={p.title}
                  onClick={() => onVideoSelect(url)}
                  className={cn(
                    "cursor-pointer border bg-card p-2 transition-colors",
                    url === selectedVideoUrl
                      ? "border-primary shadow-md"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-muted">
                    <VideoThumbnail
                      images={p.trailer.images}
                      youtubeId={p.trailer.youtube_id}
                      title={p.title}
                    />
                  </div>
                  <p className="text-sm mt-2 line-clamp-2">{p.title}</p>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* MUSIC VIDEOS TAB */}
        <TabsContent value="music">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {music_videos.map((mv) => {
              const url = mv.video.embed_url;
              return (
                <Card
                  key={mv.title}
                  onClick={() => onVideoSelect(url)}
                  className={cn(
                    "cursor-pointer border bg-card p-2 transition-colors",
                    url === selectedVideoUrl
                      ? "border-primary shadow-md"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-muted">
                    <VideoThumbnail
                      images={mv.video.images}
                      youtubeId={mv.video.youtube_id}
                      title={mv.title}
                    />
                  </div>
                  <p className="text-sm mt-2 line-clamp-2">{mv.title}</p>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
