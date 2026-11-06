"use client"

import React, { useState } from 'react';
import { useAnimeVideos } from '@/hooks/anime/use-anime-videos';
import { PromoVideo, promoEmbedUrl } from '@/components/anime/promo-video';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, PlayCircle} from 'lucide-react';
import Link from 'next/link';
import useRandomAnime from "@/hooks/anime/use-random-anime";
import { useI18n } from "@/components/i18n-provider";

export function HeroSection() {
  const { t } = useI18n();
  const { data: anime } = useRandomAnime(); // Default to a popular anime
  const { data: videos } = useAnimeVideos(anime ? String(anime.mal_id) : '');
  const [failedPromo, setFailedPromo] = useState<string>();
  const promo = promoEmbedUrl(anime?.trailer?.embed_url) ?? videos?.promo.map(video => promoEmbedUrl(video.trailer?.embed_url)).find(Boolean);
  const background = anime?.images?.webp?.large_image_url ?? '';

  if (!anime) return null;

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${background})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {promo && failedPromo !== promo && <PromoVideo key={promo} src={promo} title={`${anime.title} promo background`} background onError={() => setFailedPromo(promo)} />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-center pointer-events-none">
        <div className="max-w-2xl space-y-6 pointer-events-auto">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              {anime.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <Badge key={genre.mal_id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          <p className="line-clamp-3 text-lg text-white/80">
            {anime.synopsis}
          </p>

          <div className="flex gap-4">
            <Button
                className="w-full gap-2"
                asChild
            >
              <Link href={`/watch/${anime.mal_id}`}>
                <PlayCircle className="w-4 h-4" /> {t("anime.watchTrailer")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/anime/${anime.mal_id}`}>
                <Info className="mr-2 h-5 w-5" />
                {t("anime.moreInfo")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
