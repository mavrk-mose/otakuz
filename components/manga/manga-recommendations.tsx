"use client";

import { useQuery } from "@tanstack/react-query";
import { RecommendationsSkeleton } from '@/components/skeletons/recommendations-skeleton';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n-provider";

interface RecommendationsProps {
  mangaId: string;
}

export function MangaRecommendations({ mangaId }: RecommendationsProps) {
  const { t } = useI18n();
  const { data: recommendations, isPending: isLoading } = useQuery({
    queryKey: ["mangaRecommendations", mangaId],
    queryFn: async () => {
      const response = await fetch(
        `/api/jikan/manga/${mangaId}/recommendations`,
      );
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      const data = await response.json();
      return data.data;
    },
  });

  if (isLoading) return <RecommendationsSkeleton title={t("anime.recommendations")} />;

  if (!recommendations?.length) {
    return null;
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <h2 className="text-2xl font-bold">{t("anime.recommendations")}</h2>
      <ScrollArea className="w-full min-w-0 max-w-full">
        <div className="flex w-max gap-4 py-2">
          {recommendations.map((rec: any) => (
            <motion.div
              key={rec.entry.mal_id}
              className="group w-[210px] sm:w-[240px] md:w-[260px] shrink-0"
              whileHover={{ scale: 1.02 }}
            >
              <Card className="media-card-surface overflow-hidden">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={rec.entry.images.jpg.large_image_url}
                    alt={rec.entry.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button asChild>
                        <Link
                          href={rec.entry.url}
                          className="w-full flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {t("manga.readNow")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {rec.entry.score}
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      {rec.entry.type}
                    </Badge>
                  </div>
                  <Link
                    href={`/manga/${rec.entry.mal_id}`}
                    className="font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {rec.entry.title}
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
