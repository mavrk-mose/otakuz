"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Share2, Star } from "lucide-react";
import { BookmarkButton } from "../bookmark-button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DetailsSkeleton from "@/components/skeletons/details-skeleton";
import { AnimeRecommendations } from "./anime-recommendations";
import { AnimeGallery } from "./anime-gallery";
import AnimeEpisodes from "@/components/anime/anime-episodes";
import React, { useState } from "react";
import ShareAnimeModal from "@/components/anime/share-anime-modal";
import useAnimeDetails from "@/hooks/anime/use-anime-details";
import { useGenreStore } from "@/store/use-genre-store";
import { useI18n } from "@/components/i18n-provider";

export default function AnimeDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();
  const { data: anime, isLoading } = useAnimeDetails(id);
  const { setAnimeGenre } = useGenreStore();

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (!anime) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t("anime.notFound")}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[350px_1fr] md:grid-cols-[300px_1fr] sm:grid-cols-1 gap-8">
        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card className="overflow-hidden">
            <Image
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              width={300}
              height={450}
              className="w-full object-cover"
            />
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full gap-2" asChild>
              <Link href={`/watch/${anime.mal_id}`}>
                <PlayCircle className="w-4 h-4" /> {t("anime.watchTrailer")}
              </Link>
            </Button>
            <BookmarkButton
              itemId={anime.mal_id.toString()}
              type="anime"
              title={anime.title}
              image={anime.images.jpg.large_image_url}
            />
          </div>
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4" /> {t("anime.shareChat")}
          </Button>
          <Card className="p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("common.score")}</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold">{anime.score}</span>
                <span className="text-sm text-muted-foreground">
                  ({anime?.scored_by?.toLocaleString()} {t("anime.users")})
                </span>
              </div>
            </div>
            <Progress value={anime.score * 10} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("common.ranked")}</p>
                <p className="font-medium">#{anime.rank}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("common.popularity")}</p>
                <p className="font-medium">#{anime.popularity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("common.episodes")}</p>
                <p className="font-medium">{anime.episodes}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("anime.duration")}</p>
                <p className="font-medium">{anime.duration}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
            <h2 className="text-xl text-muted-foreground mb-4">
              {anime.title_japanese}
            </h2>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <Badge
                  key={genre.mal_id}
                  variant="secondary"
                  onClick={() => {
                    setAnimeGenre(genre.mal_id.toString());
                    router.push("/anime");
                  }}
                  className="cursor-pointer"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("anime.overview")}</TabsTrigger>
              <TabsTrigger value="characters">{t("anime.characters")}</TabsTrigger>
              <TabsTrigger value="episodes">{t("common.episodes")}</TabsTrigger>
              <TabsTrigger value="gallery">{t("common.gallery")}</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="space-y-4 transition-opacity duration-300"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t("common.synopsis")}</h3>
                <p className="leading-relaxed">{anime.synopsis}</p>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">{t("common.information")}</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("common.type")}</dt>
                      <dd>{anime.type}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("common.status")}</dt>
                      <dd>{anime.status}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("anime.aired")}</dt>
                      <dd>{anime.aired.from}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("anime.season")}</dt>
                      <dd>
                        {anime.season} {anime.year}
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("anime.studios")}</dt>
                      <dd>{anime.studios.map((s) => s.name).join(", ")}</dd>
                    </div>
                  </dl>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">{t("common.statistics")}</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("common.score")}</dt>
                      <dd>
                        {anime?.score} ({anime?.scored_by?.toLocaleString()}{" "}
                        {t("anime.users")})
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("common.ranked")}</dt>
                      <dd>#{anime.rank}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("common.popularity")}</dt>
                      <dd>#{anime.popularity}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("anime.members")}</dt>
                      <dd>{anime.members.toLocaleString()}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-24 text-muted-foreground">{t("anime.favorites")}</dt>
                      <dd>{anime.favorites.toLocaleString()}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="characters">
              <Card className="p-6">
                <p className="text-muted-foreground">
                  {t("anime.characterComingSoon")}
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="episodes">
              <Card className="mt-8 overflow-x-auto px-4">
                <AnimeEpisodes id={id} />
              </Card>
            </TabsContent>
            <TabsContent value="gallery">
              <div className="mt-8 overflow-x-auto px-4">
                <AnimeGallery id={id} />
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-8 overflow-x-auto px-4">
            <AnimeRecommendations animeId={id} />
          </div>
        </div>
      </div>
      <ShareAnimeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        anime={anime}
      />
    </div>
  );
}
