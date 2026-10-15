"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Play, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import useRandomAnime from "@/hooks/anime/use-random-anime";
import { useI18n } from "@/components/i18n-provider";

export function HeroSection() {
  const { t } = useI18n();
  const { data: anime } = useRandomAnime();
  const background = anime?.images?.webp?.large_image_url ?? anime?.images?.jpg?.large_image_url ?? '';

  if (!anime) return null;

  return (
    <div className="relative min-h-[500px] lg:h-[75vh] w-full overflow-hidden bg-[#0e1015] border-b border-[#2b3245] my-4 rounded-xl shadow-2xl">
      {/* Ambient background glow & image backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 filter brightness-90"
        style={{ 
          backgroundImage: background ? `url(${background})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1015] via-[#0e1015]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-transparent to-[#0e1015]/40" />
      </div>

      {/* Decorative ambient radial glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="container mx-auto px-6 relative h-full flex items-center py-12">
        <div className="max-w-2xl space-y-6">

          {/* Header Badges & Score */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-3 py-1 rounded-full text-[#f59e0b] text-xs font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{anime.score ?? '9.2'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#6366f1]/10 border border-[#6366f1]/30 px-3 py-1 rounded-full text-[#c0c1ff] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FEATURED SPOTLIGHT</span>
            </div>

            {anime.episodes && (
              <Badge variant="secondary" className="bg-[#242938] text-[#e0e2ed] border border-[#2b3245] text-xs font-medium px-2.5 py-0.5">
                {anime.episodes} EPISODES
              </Badge>
            )}
          </div>

          {/* Anime Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {anime.title}
            </h1>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2">
              {anime.genres?.map((genre) => (
                <span key={genre.mal_id} className="text-xs px-2.5 py-1 rounded-md bg-[#1c202c] text-[#8492a6] border border-[#2b3245] font-medium">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <p className="line-clamp-3 text-sm sm:text-base text-[#c7c4d7] leading-relaxed max-w-xl">
            {anime.synopsis}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
            <Button
                className="gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-6 text-sm font-semibold rounded-lg shadow-lg shadow-[#6366f1]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                asChild
            >
              <Link href={`/watch/${anime.mal_id}`}>
                <Play className="w-4 h-4 fill-current" /> {t("anime.watchTrailer") || "Watch Now"}
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-[#1c202c] border-[#2b3245] hover:bg-[#242938] hover:border-[#3f4865] text-[#e0e2ed] px-6 py-6 text-sm font-semibold rounded-lg transition-all"
              asChild
            >
              <Link href={`/anime/${anime.mal_id}`}>
                <Info className="h-4 w-4 text-[#908fa0]" />
                {t("anime.moreInfo") || "More Details"}
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
