"use client";
import { I18nText } from "@/components/i18n-text";


import { NewsPageSkeleton } from "@/components/skeletons/news-skeleton";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  MessageSquare,
  Newspaper,
  Play,
  Radio,
  Share2,
  TrendingUp,
  Video,
  FileText,
  ListPlus,
} from "lucide-react";
import { toast } from "sonner";
import useFetchNewsStories from "@/hooks/news/use-fetch-news";
import { formatReadsCount, type NewsStory } from "@/types/news";
import { useI18n } from "@/components/i18n-provider";
import { GoogleAdUnit } from "@/components/ads/google-ad-unit";
import { ScrollArea } from "@/components/ui/scroll-area";

const CATEGORIES = [
  "All Stories",
  "Industry",
  "Production Desk",
  "Simulcast",
  "Manga House",
  "Interviews",
  "Box Office",
] as const;

export default function NewsPage() {
  const { t: localizedT } = useI18n();
  const { locale, t } = useI18n();
  const { stories: rawStories, isLoading } = useFetchNewsStories();
  const stories: NewsStory[] = useMemo(() => rawStories || [], [rawStories]);
  const [activeCategory, setActiveCategory] = useState<string>("All Stories");

  // Filter stories by category if not "All Stories"
  const filteredStories: NewsStory[] = useMemo(() => {
    if (activeCategory === "All Stories") return stories;
    return stories.filter(
      (s: NewsStory) =>
        s.section?.toLowerCase() === activeCategory.toLowerCase() ||
        s.tag?.toLowerCase() === activeCategory.toLowerCase() ||
        s.tags?.some((tag: string) => tag.toLowerCase() === activeCategory.toLowerCase())
    );
  }, [stories, activeCategory]);

  // Featured Lead Story (from stories or filtered)
  const leadStory: NewsStory | undefined = useMemo(() => {
    return filteredStories.find((s: NewsStory) => s.isFeatured) || filteredStories[0] || stories[0];
  }, [filteredStories, stories]);

  // Secondary stack stories (next 3 after lead)
  const secondaryStories: NewsStory[] = useMemo(() => {
    return filteredStories.filter((s: NewsStory) => s._id !== leadStory?._id).slice(0, 3);
  }, [filteredStories, leadStory]);

  // Top trending leaderboard dispatches (rank 1 to 5)
  const trendingStories: NewsStory[] = useMemo(() => {
    const withRank = stories.filter((s: NewsStory) => typeof s.trendingRank === "number");
    if (withRank.length >= 3) {
      return [...withRank].sort((a: NewsStory, b: NewsStory) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99)).slice(0, 5);
    }
    return stories.slice(2, 7);
  }, [stories]);

  // Podcast / Media feature story
  const podcastStory: NewsStory | undefined = useMemo(() => {
    return stories.find((s: NewsStory) => s.podcast?.isPodcast) || stories[stories.length - 1];
  }, [stories]);

  // Anomaly / Investigative Dossier section stories
  const anomalyStories: NewsStory[] = useMemo(() => {
    const anomaly = stories.filter(
      (s: NewsStory) =>
        s.tag?.toLowerCase().includes("investigation") ||
        s.scoopBadge?.toLowerCase().includes("special report") ||
        s.scoopBadge?.toLowerCase().includes("leak") ||
        s.scoopBadge?.toLowerCase().includes("review") ||
        s._id.startsWith("anomaly")
    );
    return anomaly.length ? anomaly : stories.slice(1, 5);
  }, [stories]);

  const handleShare = async (e: React.MouseEvent, title: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/news/${encodeURIComponent(id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Ignored
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Article link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (isLoading && stories.length === 0) return <NewsPageSkeleton />;

  return (
    <div className="-m-4 min-h-screen bg-background text-foreground">
      {/* Top Editorial Category Bar */}
      <div className="sticky top-14 lg:top-16 z-30 w-full border-b border-border bg-card/90 backdrop-blur-md shadow-sm">
        <ScrollArea controlSize="sm" className="mx-auto max-w-7xl">
          <div className="flex w-max min-w-full items-center justify-between gap-6 px-6 py-3">
          <div className="flex shrink-0 items-center gap-4">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-rose-500">
              Otaku Wire
            </span>
            <span className="font-mono text-xs text-muted-foreground/50">/</span>
            <div className="flex items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      isActive
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-amber-500">
              Live Wire // Ep. 248 JST
            </span>
          </div>
          </div>
        </ScrollArea>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-8">
        {/* SECTION 1: HERO EDITORIAL BLOCK */}
        <section className="flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                Analog Renaissance
              </h2>
              <span className="font-mono text-xl font-light text-rose-500">/</span>
              <p className="text-sm text-muted-foreground sm:text-base">
                Why premier Tokyo animation directors are ditching digital tablets for hand-drawn cel workflows
              </p>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-transparent opacity-80" />
          </div>

          {/* Grid: Lead Story (7 cols) + 3 Stacked Cards (5 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Big Lead Story */}
            {leadStory && (
              <article className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-lg lg:col-span-7">
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted/40">
                    {leadStory.imageUrl ? (
                      <Image
                        src={leadStory.imageUrl}
                        alt={leadStory.title}
                        fill
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted/40 text-muted-foreground">
                        <Newspaper className="h-12 w-12" />
                      </div>
                    )}

                    {leadStory.tag && (
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-amber-500 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {leadStory.tag}
                      </div>
                    )}

                    {leadStory.scoopBadge && (
                      <div className="absolute bottom-3 right-3 rounded-lg bg-rose-500 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-md">
                        {leadStory.scoopBadge}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link href={`/news/${encodeURIComponent(leadStory._id)}`}>
                      <h1 className="text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-rose-500 sm:text-3xl">
                        {leadStory.title}
                      </h1>
                    </Link>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {leadStory.leadParagraph || leadStory.summary || leadStory.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-amber-500">
                      <I18nText message="news.by" /> {leadStory.authorName || leadStory.author?.name || "Staff"}
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      {leadStory.publishedAt
                        ? new Date(leadStory.publishedAt).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Today"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-rose-500" />
                      {leadStory.commentsCount ?? 42}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, leadStory.title, leadStory._id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground hover:bg-muted/80"
                      title={localizedT("common.share")}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Right Side Stacked Items (5 cols) */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-5">
              {secondaryStories.map((story: NewsStory, idx: number) => (
                <Link
                  key={story._id}
                  href={`/news/${encodeURIComponent(story._id)}`}
                  className="group flex flex-1 items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-md"
                >
                  <div className="flex flex-1 flex-col justify-between self-stretch">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                          idx === 0 ? "text-rose-500" : idx === 1 ? "text-amber-500" : "text-primary"
                        }`}
                      >
                        {story.tag || "Production Desk"}
                      </span>
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-rose-500">
                        {story.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-amber-500 font-medium">
                        {story.authorName || story.author?.name || "Otakuz Staff"}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{story.readTime || "5m read"}</span>
                    </div>
                  </div>

                  {story.imageUrl && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/40">
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL LEADERBOARD AD SLOT */}
        <GoogleAdUnit
          context="news"
          variant="leaderboard"
          adFormat="horizontal"
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_NEWS_TOP}
        />

        {/* SECTION 2: MOST POPULAR LEADERBOARD + MEDIA/PODCAST FEATURE */}
        <section className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-sm bg-rose-500" />
              <h2 className="text-lg font-bold uppercase tracking-tight text-foreground sm:text-xl">
                Most Popular Dispatches
              </h2>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span><I18nText message="news.realtimeTracker" /></span>
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Numbered Leaderboard 01-05 (7 cols) */}
            <div className="flex flex-col gap-3 lg:col-span-7">
              {trendingStories.map((item: NewsStory, index: number) => {
                const rankFormatted = String(index + 1).padStart(2, "0");
                return (
                  <Link
                    key={item._id}
                    href={`/news/${encodeURIComponent(item._id)}`}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-base font-bold text-foreground transition-colors group-hover:bg-rose-500 group-hover:text-white">
                      {rankFormatted}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-rose-500">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                        <span className="text-amber-500 font-medium">{item.authorName || item.author?.name || "Staff"}</span>
                        <span>•</span>
                        <span>{formatReadsCount(item.readsCount)}</span>
                        <span>•</span>
                        <span className="text-rose-500 font-medium">{item.commentsCount ?? 18} comments</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Special Podcast/Video Player Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-lg">
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                    {podcastStory?.imageUrl ? (
                      <Image
                        src={podcastStory.imageUrl}
                        alt={podcastStory.title}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted/40 text-muted-foreground">
                        <Radio className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => toast.success("Starting OtakuCast audio stream...")}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl transition-transform hover:scale-110"
                        aria-label={localizedT("news.playPodcast")}
                      >
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </button>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-card/90 px-2.5 py-1 font-mono text-[11px] text-foreground border border-border/40 backdrop-blur-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                      <span>{podcastStory?.podcast?.episodeNumber || "PODCAST // EP 114"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="uppercase tracking-wider text-amber-500 font-semibold">
                        {podcastStory?.authorName || "OtakuCast Studio"}
                      </span>
                      <span>•</span>
                      <span className="text-muted-foreground">
                        {podcastStory?.podcast?.duration || "54 min runtime"}
                      </span>
                    </div>
                    <Link href={`/news/${encodeURIComponent(podcastStory?._id || "")}`}>
                      <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-rose-500">
                        {podcastStory?.title}
                      </h3>
                    </Link>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {podcastStory?.summary || podcastStory?.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-4 text-xs font-semibold text-rose-500">
                    <button
                      type="button"
                      onClick={() => toast.success("Playing audio...")}
                      className="flex items-center gap-1 transition hover:underline"
                    >
                      <Headphones className="h-3.5 w-3.5" />
                      Listen
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success("Opening video player...")}
                      className="flex items-center gap-1 transition hover:underline"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Watch
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info("Opening transcript...")}
                      className="flex items-center gap-1 transition hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Transcript
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success("Added to queue")}
                    className="text-muted-foreground transition hover:text-foreground"
                    title={localizedT("news.addQueue")}
                  >
                    <ListPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDITORIAL MULTIPLEX AD GRID */}
        <GoogleAdUnit
          context="news"
          variant="in-feed-grid"
          adFormat="fluid"
          seedOffset={2}
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_NEWS_FEED}
        />

        {/* SECTION 3: THE ANOMALY FILES / INVESTIGATIVE DOSSIERS */}
        <section className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                The Anomaly Files
              </h2>
              <span className="font-mono text-xl font-light text-rose-500">/</span>
              <p className="text-sm text-muted-foreground sm:text-base">
                Investigating the shadowy economics behind offshore keyframe sweatshops
              </p>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-transparent opacity-80" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Big Dossier Feature Tile (6 cols) */}
            {anomalyStories[0] && (
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-lg lg:col-span-6">
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/40">
                    {anomalyStories[0].imageUrl ? (
                      <Image
                        src={anomalyStories[0].imageUrl}
                        alt={anomalyStories[0].title}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted/40 text-muted-foreground">
                        <Newspaper className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="rounded-lg bg-rose-500 px-2 py-0.5 font-mono text-xs font-semibold uppercase text-white shadow">
                        Special Report
                      </span>
                      <h3 className="mt-2 text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-rose-500 sm:text-2xl">
                        {anomalyStories[0].title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {anomalyStories[0].summary || anomalyStories[0].description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-semibold text-amber-500">
                    <I18nText message="news.by" /> {anomalyStories[0].authorName || "Makoto Shinkawa"}
                  </span>
                  <Link
                    href={`/news/${encodeURIComponent(anomalyStories[0]._id)}`}
                    className="flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-500 transition hover:underline"
                  >
                    <span><I18nText message="news.readDossier" /></span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )}

            {/* 3 Stacked Sub-Features (6 cols) */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-6">
              {anomalyStories.slice(1, 4).map((story: NewsStory, i: number) => (
                <Link
                  key={story._id}
                  href={`/news/${encodeURIComponent(story._id)}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-md"
                >
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span
                      className={`font-mono text-xs uppercase font-semibold ${
                        i === 0 ? "text-rose-500" : i === 1 ? "text-amber-500" : "text-primary"
                      }`}
                    >
                      {story.scoopBadge || story.tag || "Production Leak"}
                    </span>
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-rose-500">
                      {story.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-amber-500 font-medium">
                        {story.authorName || story.author?.name || "Staff"}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{story.commentsCount ?? 24} comments</span>
                    </div>
                  </div>

                  {story.imageUrl && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/40">
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
