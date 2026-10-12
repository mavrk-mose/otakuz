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
            {Array(8)
              .fill(null)
              .map((_, index) => (
                <Card key={index} className="animate-pulse border border-border/70 bg-card/60">
                  <div className="aspect-[2/3] bg-muted" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </Card>
              ))}
          </>
        ) : isError ? (
          <div className="col-span-full text-center text-muted-foreground" role="alert">
            <p>{t("home.animeLoadError")}</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2 border-border bg-card/80">
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
                <Card className="group overflow-hidden border border-border/70 bg-card/75 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_22px_50px_rgba(255,75,58,0.12)]">
                  <div className="relative aspect-[2/3] bg-muted">
                    {anime.imageUrl && (
                      <Image
                        src={anime.imageUrl}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10]/90 via-[#0c0d10]/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute inset-x-4 bottom-4">
                        <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                          <Link href={`/watch/${anime.mal_id}`}>
                            <PlayCircle className="w-4 h-4" /> {t("anime.watchTrailer")}
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
              </motion.div>
            ))
        )}
      </motion.div>
    </section>
  );
}
