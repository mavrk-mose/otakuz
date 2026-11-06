"use client";

import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";
import { AnimeHoverPreview } from "@/components/anime/anime-hover-preview";
import { useQuery } from "@tanstack/react-query";
import { getTopAnime } from "@/lib/api";
import { MediaCardSkeleton } from '@/components/skeletons/media-card-skeleton';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n-provider";
import type { TopAnime } from "@/types/anime";

export function AnimeSection() {
  const { t } = useI18n();
  const { data: animeList, isPending: isLoading, isPaused, isError, refetch } = useQuery<TopAnime[]>({
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
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-primary/90">
            Curated picks
          </p>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            {t("home.popularAnime")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("home.popularAnimeDescription")}</p>
        </div>
        <Button variant="outline" asChild className="border-border bg-card/80 text-foreground hover:border-primary/60 hover:text-primary">
          <Link href="/anime" className="gap-2">
            {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-5 md:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading || isPaused ? (
          <>
            {isPaused && (
              <p className="col-span-full text-center text-muted-foreground" role="status">
                {t("home.animeRequestPaused")}
              </p>
            )}
            <MediaCardSkeleton count={8} variant="home-anime" />
          </>
        ) : isError && !animeList?.length ? (
          <ErrorState className="col-span-full" title={t("home.animeLoadError")} onRetry={() => void refetch()} />
        ) : !animeList?.length ? (
          <EmptyState className="col-span-full" illustration="collection" title={t("home.noTopAnime")} />
        ) : (
          animeList?.slice(0, 8).map((anime) => (
              <motion.div key={anime.mal_id} variants={item}>
                <AnimeHoverPreview animeId={anime.mal_id} title={anime.title} poster={anime.imageUrl || undefined}>
                <Card className="media-card-surface group overflow-hidden">
                  <div className="relative aspect-[2/3] bg-muted">
                    {anime.imageUrl && (
                      <Image
                        src={anime.imageUrl}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10]/90 via-[#0c0d10]/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg" asChild>
                          <Link href={`/watch/${anime.mal_id}`} aria-label={`Play ${anime.title}`}>
                            <Play className="h-6 w-6 fill-current" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current text-[#f59e0b]" />
                      <span className="text-sm font-medium text-foreground">{anime.score ?? "N/A"}</span>
                      <Badge variant="secondary" className="ml-auto border border-secondary/30 bg-secondary/10 text-secondary-foreground">
                        {anime.episodes ?? "?"} EP
                      </Badge>
                    </div>
                    <Link
                      href={`/anime/${anime.mal_id}`}
                      className="line-clamp-1 text-base font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {anime.title}
                    </Link>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {anime.synopsis ?? ""}
                    </p>
                  </div>
                </Card>
                </AnimeHoverPreview>
              </motion.div>
            ))
        )}
      </motion.div>
    </section>
  );
}
