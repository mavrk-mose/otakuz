"use client";

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

  if (isLoading && stories.length === 0) {
    return (
      <div className="-m-4 min-h-screen bg-[#121316] p-6 text-foreground">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-12 w-full rounded-lg bg-card/60" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-[460px] rounded-xl bg-card/60 lg:col-span-7" />
            <div className="space-y-4 lg:col-span-5">
              <div className="h-36 rounded-xl bg-card/60" />
              <div className="h-36 rounded-xl bg-card/60" />
              <div className="h-36 rounded-xl bg-card/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-screen bg-[#121316] text-[#e3e2e6]">
      {/* Top Editorial Category Bar */}
      <div className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#0d0e11]/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto px-6 py-3 scrollbar-none">
          <div className="flex shrink-0 items-center gap-4">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-[#ff5543]">
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
                        ? "bg-[#ff5543] text-white shadow-sm"
                        : "text-muted-foreground hover:bg-card hover:text-white"
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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5543] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5543]" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#ffb95f]">
              Live Wire // Ep. 248 JST
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-8">
        {/* SECTION 1: HERO EDITORIAL BLOCK */}
        <section className="flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
                Analog Renaissance
              </h2>
              <span className="font-mono text-xl font-light text-[#ff5543]">/</span>
              <p className="text-sm text-muted-foreground sm:text-base">
                Why premier Tokyo animation directors are ditching digital tablets for hand-drawn cel workflows
              </p>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-[#ff5543] via-[#ee9800] to-transparent opacity-80" />
          </div>

          {/* Grid: Lead Story (7 cols) + 3 Stacked Cards (5 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Big Lead Story */}
            {leadStory && (
              <article className="group flex flex-col justify-between rounded-xl border border-white/5 bg-[#1b1b1f] p-5 transition-all hover:border-white/10 hover:bg-[#1f1f23] lg:col-span-7">
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#292a2d]">
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
                      <div className="flex h-full items-center justify-center bg-[#292a2d] text-muted-foreground">
                        <Newspaper className="h-12 w-12" />
                      </div>
                    )}

                    {leadStory.tag && (
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-[#0d0e11]/85 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#ffb95f] backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ffb95f]" />
                        {leadStory.tag}
                      </div>
                    )}

                    {leadStory.scoopBadge && (
                      <div className="absolute bottom-3 right-3 rounded bg-[#ff5543] px-2.5 py-1 font-mono text-xs font-bold text-white shadow-md">
                        {leadStory.scoopBadge}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link href={`/news/${encodeURIComponent(leadStory._id)}`}>
                      <h1 className="text-2xl font-bold leading-tight text-white transition-colors group-hover:text-[#ff5543] sm:text-3xl">
                        {leadStory.title}
                      </h1>
                    </Link>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {leadStory.leadParagraph || leadStory.summary || leadStory.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-[#ffb95f]">
                      by {leadStory.authorName || leadStory.author?.name || "Staff"}
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
                    <span className="flex items-center gap-1.5 rounded-full bg-[#292a2d] px-3 py-1 font-mono text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-[#ff5543]" />
                      {leadStory.commentsCount ?? 42}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, leadStory.title, leadStory._id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#292a2d] text-muted-foreground transition hover:text-white"
                      title="Share"
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
                  className="group flex flex-1 items-start gap-4 rounded-xl border border-white/5 bg-[#1b1b1f] p-4 transition-all hover:border-white/10 hover:bg-[#1f1f23]"
                >
                  <div className="flex flex-1 flex-col justify-between self-stretch">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`font-mono text-xs uppercase tracking-wider ${
                          idx === 0 ? "text-[#ff5543]" : idx === 1 ? "text-[#ffb95f]" : "text-[#c0c1ff]"
                        }`}
                      >
                        {story.tag || "Production Desk"}
                      </span>
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#ff5543]">
                        {story.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-[#ffb95f]">
                        {story.authorName || story.author?.name || "Otakuz Staff"}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{story.readTime || "5m read"}</span>
                    </div>
                  </div>

                  {story.imageUrl && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#292a2d]">
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

        {/* SECTION 2: MOST POPULAR LEADERBOARD + MEDIA/PODCAST FEATURE */}
        <section className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-sm bg-[#ff5543]" />
              <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
                Most Popular Dispatches
              </h2>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span>REALTIME TRACKER</span>
              <TrendingUp className="h-3.5 w-3.5 text-[#ffb95f]" />
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
                    className="group flex items-start gap-4 rounded-xl border border-white/5 bg-[#1b1b1f] p-4 transition-all hover:border-white/10 hover:bg-[#1f1f23]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#292a2d] font-mono text-base font-bold text-white transition-colors group-hover:bg-[#ff5543] group-hover:text-white">
                      {rankFormatted}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#ff5543]">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                        <span className="text-[#ffb95f]">{item.authorName || item.author?.name || "Staff"}</span>
                        <span>•</span>
                        <span>{formatReadsCount(item.readsCount)}</span>
                        <span>•</span>
                        <span className="text-[#ff5543]">{item.commentsCount ?? 18} comments</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Special Podcast/Video Player Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="group flex h-full flex-col justify-between rounded-xl border border-white/5 bg-[#1b1b1f] p-5 transition-all hover:border-white/10 hover:bg-[#1f1f23]">
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#0d0e11]">
                    {podcastStory?.imageUrl ? (
                      <Image
                        src={podcastStory.imageUrl}
                        alt={podcastStory.title}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#0d0e11] text-muted-foreground">
                        <Radio className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => toast.success("Starting OtakuCast audio stream...")}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5543] text-white shadow-xl transition-transform hover:scale-110"
                        aria-label="Play podcast"
                      >
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </button>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded bg-[#0d0e11]/85 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5543]" />
                      <span>{podcastStory?.podcast?.episodeNumber || "PODCAST // EP 114"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="uppercase tracking-wider text-[#ffb95f]">
                        {podcastStory?.authorName || "OtakuCast Studio"}
                      </span>
                      <span>•</span>
                      <span className="text-muted-foreground">
                        {podcastStory?.podcast?.duration || "54 min runtime"}
                      </span>
                    </div>
                    <Link href={`/news/${encodeURIComponent(podcastStory?._id || "")}`}>
                      <h3 className="text-base font-bold leading-snug text-white transition-colors group-hover:text-[#ff5543]">
                        {podcastStory?.title}
                      </h3>
                    </Link>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {podcastStory?.summary || podcastStory?.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#ff5543]">
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
                    className="text-muted-foreground transition hover:text-white"
                    title="Add to Queue"
                  >
                    <ListPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE ANOMALY FILES / INVESTIGATIVE DOSSIERS */}
        <section className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
                The Anomaly Files
              </h2>
              <span className="font-mono text-xl font-light text-[#ff5543]">/</span>
              <p className="text-sm text-muted-foreground sm:text-base">
                Investigating the shadowy economics behind offshore keyframe sweatshops
              </p>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-[#ffb95f] via-[#ff5543] to-transparent opacity-80" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Big Dossier Feature Tile (6 cols) */}
            {anomalyStories[0] && (
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-[#1b1b1f] p-5 transition-all hover:border-white/10 hover:bg-[#1f1f23] lg:col-span-6">
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#292a2d]">
                    {anomalyStories[0].imageUrl ? (
                      <Image
                        src={anomalyStories[0].imageUrl}
                        alt={anomalyStories[0].title}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#292a2d] text-muted-foreground">
                        <Newspaper className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e11] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="rounded bg-[#ff5543] px-2 py-0.5 font-mono text-xs font-semibold uppercase text-white">
                        Special Report
                      </span>
                      <h3 className="mt-2 text-xl font-bold leading-tight text-white transition-colors group-hover:text-[#ff5543] sm:text-2xl">
                        {anomalyStories[0].title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {anomalyStories[0].summary || anomalyStories[0].description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs font-semibold text-[#ffb95f]">
                    by {anomalyStories[0].authorName || "Makoto Shinkawa"}
                  </span>
                  <Link
                    href={`/news/${encodeURIComponent(anomalyStories[0]._id)}`}
                    className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#ff5543] transition hover:underline"
                  >
                    <span>Read 12-min Dossier</span>
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
                  className="group flex items-center gap-4 rounded-xl border border-white/5 bg-[#1b1b1f] p-4 transition-all hover:border-white/10 hover:bg-[#1f1f23]"
                >
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span
                      className={`font-mono text-xs uppercase ${
                        i === 0 ? "text-[#ff5543]" : i === 1 ? "text-[#ffb95f]" : "text-[#c0c1ff]"
                      }`}
                    >
                      {story.scoopBadge || story.tag || "Production Leak"}
                    </span>
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#ff5543]">
                      {story.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-[#ffb95f]">
                        {story.authorName || story.author?.name || "Staff"}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{story.commentsCount ?? 24} comments</span>
                    </div>
                  </div>

                  {story.imageUrl && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#292a2d]">
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
