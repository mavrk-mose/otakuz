"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnimeNews } from "@/lib/api";
import { ArrowRight, CalendarDays, MessageSquare, Radio, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { recordWatchHistory } from "@/lib/watch-history";

export function NewsSection() {
  const { locale, t } = useI18n();
  const { data: newsList, isLoading } = useQuery({
    queryKey: ["animeNews"],
    queryFn: getAnimeNews,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-36 animate-pulse rounded bg-card/60" />
            <div className="h-4 w-64 animate-pulse rounded bg-card/40" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded bg-card/60" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-80 animate-pulse rounded-xl bg-card/60 lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            <div className="h-24 animate-pulse rounded-xl bg-card/60" />
            <div className="h-24 animate-pulse rounded-xl bg-card/60" />
            <div className="h-24 animate-pulse rounded-xl bg-card/60" />
          </div>
        </div>
      </div>
    );
  }

  const items = newsList || [];
  const featured = items[0];
  const sideItems = items.slice(1, 4);

  const logExternalNews = (newsItem: any) => {
    if (!newsItem?.url || !newsItem?.title) return;
    void recordWatchHistory({
      itemId: `mal_news_${newsItem.mal_id || newsItem.url}`,
      type: "news",
      title: newsItem.title,
      subtitle: newsItem.author_username
        ? `Otaku Wire • ${newsItem.author_username}`
        : "Otaku Wire Dispatch",
      image: newsItem.images?.jpg?.image_url || "",
      href: newsItem.url,
      isExternal: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Editorial Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-sm bg-rose-500" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-500">
                Otaku Wire
              </span>
              <span className="font-mono text-xs text-muted-foreground">/</span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                {t("home.latestNews")}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {t("home.latestNewsDescription")}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          asChild
          className="gap-2 border-border bg-card font-mono text-xs text-foreground hover:bg-muted hover:text-rose-500"
        >
          <Link href="/news">
            {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Editorial Verge-style Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Lead Story (7 cols) */}
        {featured && (
          <article className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:bg-muted/30 lg:col-span-7">
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                {featured.images?.jpg?.image_url && (
                  <Image
                    src={featured.images.jpg.image_url}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-amber-500 dark:text-amber-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>{featured.author_username || "Editorial"}</span>
                </div>
                <div className="absolute bottom-3 right-3 rounded-lg bg-rose-500 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-md">
                  SCOOP
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={featured.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => logExternalNews(featured)}
                >
                  <h3 className="text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-rose-500 sm:text-2xl">
                    {featured.title}
                  </h3>
                </Link>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="text-amber-500 dark:text-amber-400 font-medium">by {featured.author_username}</span>
                <span>•</span>
                <span>
                  {new Date(featured.date).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <Link
                href={featured.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => logExternalNews(featured)}
                className="flex items-center gap-1 font-mono text-xs font-semibold text-rose-500 hover:underline"
              >
                <span>Read Dispatch</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        )}

        {/* 3 Secondary Stacked Stories (5 cols) */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-5">
          {sideItems.map((news: any, idx: number) => {
            const tagColor =
              idx === 0 ? "text-rose-500" : idx === 1 ? "text-amber-500 dark:text-amber-400" : "text-indigo-500 dark:text-indigo-400";

            return (
              <Link
                key={news.mal_id}
                href={news.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => logExternalNews(news)}
                className="group flex flex-1 items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-muted/30"
              >
                <div className="flex flex-1 flex-col justify-between self-stretch">
                  <div className="flex flex-col gap-1.5">
                    <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${tagColor}`}>
                      {news.author_username || "Anime News"}
                    </span>
                    <h4 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-rose-500">
                      {news.title}
                    </h4>
                  </div>

                  <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    <span>
                      {new Date(news.date).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {news.images?.jpg?.image_url && (
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={news.images.jpg.image_url}
                      alt={news.title}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
