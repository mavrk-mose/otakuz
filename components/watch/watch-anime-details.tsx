"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clapperboard,
  Clock3,
  Film,
  Heart,
  Radio,
  Star,
  TrendingUp,
  Trophy,
  Tv,
  Users,
} from "lucide-react";
import useAnimeDetails from "@/hooks/anime/use-anime-details";
import { useI18n } from "@/components/i18n-provider";
import type { MessageKey } from "@/lib/i18n";

const formats: Record<string, MessageKey> = { Movie: "watch.movie", TV: "watch.tvSeries" };
const statuses: Record<string, MessageKey> = {
  "Finished Airing": "watch.finished",
  "Currently Airing": "watch.airing",
  "Not yet aired": "watch.notAired",
};
const seasons: Record<string, MessageKey> = {
  spring: "watch.spring",
  summer: "watch.summer",
  fall: "watch.fall",
  winter: "watch.winter",
};

export function WatchAnimeDetails({ id }: { id: string }) {
  const { data: anime, isLoading } = useAnimeDetails(id);
  const { locale, t } = useI18n();
  if (isLoading)
    return (
      <div
        aria-busy="true"
        className="m-4 h-40 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none"
      />
    );
  if (!anime) return null;

  const number = (value: number) => value.toLocaleString(locale === "ja" ? "ja-JP" : "en-US");
  const start = anime.aired?.from ? new Date(anime.aired.from) : null;
  const aired =
    start && !Number.isNaN(start.getTime())
      ? start.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : null;
  const stats = [
    {
      icon: anime.type === "Movie" ? Film : Tv,
      label: t("common.type"),
      value: anime.type ? (formats[anime.type] ? t(formats[anime.type]) : anime.type) : null,
    },
    {
      icon: Radio,
      label: t("common.status"),
      value: anime.status
        ? statuses[anime.status]
          ? t(statuses[anime.status])
          : anime.status
        : null,
    },
    {
      icon: Clapperboard,
      label: t("common.episodes"),
      value: anime.episodes ? number(anime.episodes) : null,
    },
    {
      icon: Clock3,
      label: t("anime.duration"),
      value: anime.duration && anime.duration !== "Unknown" ? anime.duration : null,
    },
    { icon: Star, label: t("common.score"), value: anime.score ? `${anime.score} / 10` : null },
    {
      icon: Trophy,
      label: t("common.ranked"),
      value: anime.rank ? `#${number(anime.rank)}` : null,
    },
    {
      icon: TrendingUp,
      label: t("common.popularity"),
      value: anime.popularity ? `#${number(anime.popularity)}` : null,
    },
    { icon: Users, label: t("anime.members"), value: anime.members ? number(anime.members) : null },
    {
      icon: Heart,
      label: t("anime.favorites"),
      value: anime.favorites ? number(anime.favorites) : null,
    },
    { icon: CalendarDays, label: t("anime.aired"), value: aired },
  ].filter((stat) => stat.value !== null);
  const title =
    locale === "ja" ? anime.title_japanese || anime.title : anime.title_english || anime.title;

  return (
    <section
      aria-labelledby="watch-anime-heading"
      className="m-4 space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 id="watch-anime-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[
              anime.season
                ? seasons[anime.season]
                  ? t(seasons[anime.season])
                  : anime.season
                : null,
              anime.year,
              anime.studios?.map((studio) => studio.name).join(", "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Link
          href={`/anime/${anime.mal_id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("anime.moreInfo")}
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex min-w-0 items-start gap-2.5 rounded-xl bg-muted/50 p-3">
            <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold tabular-nums">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      {anime.synopsis && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">{t("common.synopsis")}</summary>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
            {anime.synopsis}
          </p>
        </details>
      )}
    </section>
  );
}
