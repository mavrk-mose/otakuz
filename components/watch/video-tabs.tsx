"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VideoTabsProps {
  animeVideos: any;
  selectedVideoUrl: string;
  onVideoSelect: (url: string) => void;
}

export default function VideoTabs({
  animeVideos,
  selectedVideoUrl,
  onVideoSelect,
}: VideoTabsProps) {
  if (!animeVideos) return null;

  const { episodes = [], promo = [], music_videos = [] } = animeVideos;

  return (
    <div className="p-4 bg-[#18181B]">
      <Tabs defaultValue="episodes" className="w-full">

        {/* TAB LABELS */}
        <TabsList className="bg-[#2A2A2F] mb-4">
          {episodes.length > 0 && <TabsTrigger value="episodes">Episodes</TabsTrigger>}
          {promo.length > 0 && <TabsTrigger value="promo">Promos</TabsTrigger>}
          {music_videos.length > 0 && <TabsTrigger value="music">Music Videos</TabsTrigger>}
        </TabsList>

        {/* EPISODES TAB */}
        <TabsContent value="episodes">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {episodes.map((ep: any) => (
              <Card
                key={ep.mal_id}
                onClick={() => onVideoSelect(ep.url)}
                className={cn(
                  "bg-[#26262C] p-2 cursor-pointer border transition",
                  ep.url === selectedVideoUrl
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-[#3A3A40]"
                )}
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={ep.image}
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
            {promo.map((p: any) => {
              const url = p.trailer.embed_url;
              return (
                <Card
                  key={p.title}
                  onClick={() => onVideoSelect(url)}
                  className={cn(
                    "bg-[#26262C] p-2 cursor-pointer border transition",
                    url === selectedVideoUrl
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-[#3A3A40]"
                  )}
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={p.trailer.images?.maximum_image_url}
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
            {music_videos.map((mv: any) => {
              const url = mv.video.embed_url;
              return (
                <Card
                  key={mv.title}
                  onClick={() => onVideoSelect(url)}
                  className={cn(
                    "bg-[#26262C] p-2 cursor-pointer border transition",
                    url === selectedVideoUrl
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-[#3A3A40]"
                  )}
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={mv.video.images?.maximum_image_url}
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
