"use client";

import { ErrorState } from "@/components/page-state";
import { useAnimeCharacters } from "@/hooks/anime/use-anime-characters";
import { useI18n } from "@/components/i18n-provider";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeCharacterCard } from "@/components/anime/anime-character-card";
import type { AnimeCharacter } from "@/types/anime";

export function AnimeCharacterList({ animeId }: { animeId: string }) {
  const { t } = useI18n();
  const { data: characters, isLoading, isError, refetch } = useAnimeCharacters(animeId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="flex gap-4 p-3">
            <Skeleton className="h-28 w-20 shrink-0" />
            <div className="flex flex-1 flex-col gap-3 py-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError && !characters?.length) {
    return <ErrorState compact title={t("anime.charactersError")} onRetry={() => void refetch()} />;
  }

  if (!characters?.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">{t("anime.charactersEmpty")}</Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {characters.map((character: AnimeCharacter) => (
        <AnimeCharacterCard
          key={character.character.mal_id}
          character={character}
          voiceLabel={t("anime.charactersVoice")}
        />
      ))}
    </div>
  );
}
