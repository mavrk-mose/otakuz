"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopAnime } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n-provider";
import type { TopAnime } from "@/types/anime";

export function AnimeSection() {
  const { t } = useI18n();
  const { data: animeList, isLoading, isPaused, isError, refetch } = useQuery<TopAnime[]>({
    queryKey: ["topAnime"],
    queryFn: () => getTopAnime(),
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">{t("home.popularAnime")}</h2>
          <p className="text-muted-foreground">{t("home.popularAnimeDescription")}</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/anime" className="gap-2">
            {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {isLoading || isPaused ? (
          <>
            {isPaused && (
              <p className="col-span-full text-center text-muted-foreground" role="status">
                {t("home.animeRequestPaused")}
              </p>
            )}
            {Array(8)
              .fill(null)
              .map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-[2/3] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </Card>
              ))}
          </>
        ) : isError ? (
          <div className="col-span-full text-center text-muted-foreground" role="alert">
            <p>{t("home.animeLoadError")}</p>
            <Button variant="ghost" onClick={() => refetch()} className="mt-2">
              {t("common.tryAgain")}
            </Button>
          </div>
        ) : !animeList?.length ? (
          <p className="col-span-full text-center text-muted-foreground">
            {t("home.noTopAnime")}
          </p>
        ) : (
          animeList?.slice(0, 8).map((anime) => (
              <motion.div key={anime.mal_id} variants={item}>
                <Card className="overflow-hidden group">
                  <div className="relative aspect-[2/3] bg-muted">
                    {anime.imageUrl && (
                      <Image
                        src={anime.imageUrl}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Button className="w-full gap-2" asChild>
                          <Link href={`/watch/${anime.mal_id}`}>
                            <PlayCircle className="w-4 h-4" /> {t("anime.watchTrailer")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{anime.score ?? "N/A"}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {anime.episodes ?? "?"} EP
                      </Badge>
                    </div>
                    <Link
                      href={`/anime/${anime.mal_id}`}
                      className="font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                      {anime.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {anime.synopsis ?? ""}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))
        )}
      </motion.div>
    </section>
  );
}
