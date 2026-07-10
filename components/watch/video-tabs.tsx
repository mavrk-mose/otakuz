"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AnimeVideos } from "@/types/anime";
import { useI18n } from "@/components/i18n-provider";

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
                <div className="relative aspect-video w-full">
                  <Image
                    src={ep.images?.jpg?.image_url || "/placeholder.png"}
                    alt={ep.title}
                    fill
                    className="object-cover rounded"
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
              const imageUrl = p.trailer.images?.maximum_image_url || "/placeholder.png";
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
                  <div className="relative aspect-video w-full">
                    <Image
                      src={imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover rounded"
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
              const imageUrl = mv.video.images?.maximum_image_url || "/placeholder.png";
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
                  <div className="relative aspect-video w-full">
                    <Image
                      src={imageUrl}
                      alt={mv.title}
                      fill
                      className="object-cover rounded"
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
