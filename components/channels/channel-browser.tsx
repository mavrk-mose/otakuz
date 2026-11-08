"use client";

import { serializeChannel } from "@/lib/query-state";

import { fetchJson } from "@/lib/http";
import { channelsResponseSchema } from "@/lib/schemas/media";
import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";


import { ErrorState } from "@/components/page-state";
import { ChannelsSkeleton } from "@/components/skeletons/channels-skeleton";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Globe2,
  History,
  Play,
  Radio,
  Search,
  Trash2,
  Tv2,
  Wifi,
} from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";

import Image from "next/image";
import { PersistentPlayerSlot } from "@/components/watch/player-layout";
import { cn } from "@/lib/utils";
import { useChannelHistoryStore } from "@/store/use-channel-history-store";
import { usePlayerStore } from "@/store/use-player-store";
import { recordWatchHistory } from "@/hooks/watch/watch-history";
import type { IptvChannel, IptvChannelsResponse } from "@/types/channel";

const PAGE_SIZE = 36;

async function fetchChannels({ signal }: { signal: AbortSignal }) {
  return fetchJson("/api/channels", channelsResponseSchema, { signal });
}

function countryFlag(countryCode: string | null) {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...countryCode.split("").map((character) => 127397 + character.charCodeAt(0))
  );
}

function ChannelLogo({ channel, className }: { channel: IptvChannel; className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!channel.logoUrl || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/60",
          className
        )}
      >
        <Tv2 className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center bg-card", className)}>
      <Image
        src={channel.logoUrl}
        alt=""
        className="h-full w-full object-contain p-5"
        width={512}
        height={288}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function ChannelCard({
  channel,
  isSelected,
  onSelect,
}: {
  channel: IptvChannel;
  isSelected: boolean;
  onSelect: (channel: IptvChannel) => void;
}) {
  const { t: localizedT } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      className={cn(
        "group min-w-0 text-left outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-rose-500",
        isSelected && "relative z-10"
      )}
      aria-label={`Watch ${channel.name}`}
    >
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl border border-border bg-card shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:border-primary/50 group-hover:shadow-xl",
          isSelected && "border-rose-500 ring-2 ring-rose-500/40"
        )}
      >
        <ChannelLogo channel={channel} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <I18nText message="channels.live" />
        </span>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-border bg-card text-foreground opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="ml-0.5 h-4 w-4 fill-current text-rose-500" />
        </span>
      </div>
      <div className="px-0.5 pt-3">
        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-rose-500 transition-colors">{channel.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{countryFlag(channel.countryCode)} {channel.countryCode || localizedT("channels.global")}</span>
          {channel.quality ? <span>{channel.quality}</span> : null}
        </div>
      </div>
    </button>
  );
}

export function ChannelBrowser() {
  const { t: localizedT } = useI18n();
  const [channelFromUrl, setChannelQuery] = useQueryState("channel", parseAsString.withOptions({ history: "push", scroll: false }));
  const { data, error, isPending: isLoading, refetch, isFetching } = useQuery({
    queryKey: ["iptv-channels"],
    queryFn: fetchChannels,
  });
  const [selectedChannel, setSelectedChannel] = useState<IptvChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);
  const recentlyViewed = useChannelHistoryStore((state) => state.recentlyViewed);
  const clearRecentlyViewed = useChannelHistoryStore(
    (state) => state.clearRecentlyViewed
  );
  const activePlayerVideoId = usePlayerStore((state) => state.currentVideoId);
  const playerIsOpen = usePlayerStore((state) => state.isOpen);
  const playerIsMinimized = usePlayerStore((state) => state.isMinimized);

  useEffect(() => {
    setIsHistoryHydrated(true);
  }, []);

  useEffect(() => {
    if (!data?.channels.length) {
      return;
    }

    const matchingChannel = channelFromUrl
      ? data.channels.find(
          (channel: IptvChannel) =>
            channel.channelId === channelFromUrl || channel.id === channelFromUrl
        )
      : null;

    if (matchingChannel) {
      setSelectedChannel(matchingChannel);
      void recordWatchHistory({
        itemId: matchingChannel.channelId || matchingChannel.id,
        type: "channel",
        title: matchingChannel.name,
        subtitle: [
          matchingChannel.countryCode || "Global",
          matchingChannel.quality,
          "Live TV",
        ]
          .filter(Boolean)
          .join(" • "),
        image: matchingChannel.logoUrl || "",
        href: serializeChannel("/channels", { channel: matchingChannel.channelId }),
      });
    } else if (!selectedChannel) {
      setSelectedChannel(data.channels[0]);
    }
  }, [data, channelFromUrl, selectedChannel]);

  const recentStripRef = useRef<HTMLDivElement>(null);
  const liveStripRef = useRef<HTMLDivElement>(null);

  const scrollStrip = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    const el = ref.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.72));
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const countries = useMemo(() => {
    const counts = new Map<string, number>();

    data?.channels.forEach((channel: IptvChannel) => {
      const code = channel.countryCode || "Global";
      counts.set(code, (counts.get(code) || 0) + 1);
    });

    return Array.from(counts.entries()).sort(([first], [second]) =>
      first.localeCompare(second)
    );
  }, [data]);

  const filteredChannels = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return (data?.channels || []).filter((channel: IptvChannel) => {
      const matchesCountry =
        country === "all" || (channel.countryCode || "Global") === country;
      const matchesSearch =
        !normalizedQuery ||
        channel.name.toLocaleLowerCase().includes(normalizedQuery) ||
        channel.channelId.toLocaleLowerCase().includes(normalizedQuery);

      return matchesCountry && matchesSearch;
    });
  }, [country, data, searchQuery]);

  const currentRecentlyViewed = useMemo(() => {
    if (!isHistoryHydrated) {
      return [];
    }

    return recentlyViewed.map(
      (recentChannel) =>
        data?.channels.find(
          (channel: IptvChannel) =>
            channel.channelId === recentChannel.channelId
        ) || recentChannel
    );
  }, [data, isHistoryHydrated, recentlyViewed]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [country, searchQuery]);

  const playChannel = (channel: IptvChannel) => {
    void setChannelQuery(channel.channelId);
    setSelectedChannel(channel);
    useChannelHistoryStore.getState().addRecentlyViewed(channel);
    void recordWatchHistory({
      itemId: channel.channelId || channel.id,
      type: "channel",
      title: channel.name,
      subtitle: [channel.countryCode || localizedT("channels.global"), channel.quality, "Live TV"]
        .filter(Boolean)
        .join(" • "),
      image: channel.logoUrl || "",
      href: serializeChannel("/channels", { channel: channel.channelId }),
    });
    usePlayerStore.getState().openPlayer({
      id: `channel:${channel.id}`,
      src: channel.streamUrl,
      title: `${channel.name} — Live`,
      posterUrl: channel.logoUrl || undefined,
      playerRoute: serializeChannel("/channels", { channel: channel.channelId }),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSelectedChannelPlaying = Boolean(
    selectedChannel &&
      playerIsOpen &&
      activePlayerVideoId === `channel:${selectedChannel.id}`
  );
  const isPlayerDocked = Boolean(
    playerIsOpen &&
      activePlayerVideoId?.startsWith("channel:") &&
      !playerIsMinimized
  );

  if (isLoading) return <ChannelsSkeleton />;

  if (error || !data) {
    return <ErrorState fullPage title={localizedT("channels.offAir")} description={localizedT("channels.error")} onRetry={() => void refetch()} retrying={isFetching} />;
  }

  return (
    <div className="-m-4 min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative min-h-[520px] border-b border-border lg:min-h-[620px]">
        {selectedChannel ? (
          <>
            <div className="absolute inset-0">
              <ChannelLogo channel={selectedChannel} className="h-full w-full opacity-20 blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/60 dark:from-background dark:via-background/95 dark:to-background/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="relative mx-auto grid min-h-[520px] max-w-[1600px] items-center gap-10 px-5 py-10 sm:px-8 lg:min-h-[620px] lg:grid-cols-[minmax(300px,0.8fr)_minmax(520px,1.35fr)] lg:px-12">
              <div className="order-2 z-10 pb-6 lg:order-1 lg:pb-0">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex items-center gap-2 rounded-md bg-rose-500 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white shadow">
                    <Radio className="h-3.5 w-3.5" /> <I18nText message="channels.live" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <I18nText message="channels.animationTv" />
                  </span>
                </div>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                  {selectedChannel.name}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
                  <span className="text-emerald-500 font-semibold"><I18nText message="channels.streaming" /></span>
                  <span>{countryFlag(selectedChannel.countryCode)} {selectedChannel.countryCode || localizedT("channels.global")}</span>
                  {selectedChannel.quality ? <span>{selectedChannel.quality}</span> : null}
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase font-semibold">HLS</span>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Watch free live animation programming from IPTV-org&apos;s public channel directory.
                  Availability can vary by broadcaster and region.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => playChannel(selectedChannel)}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-600 shadow-md shadow-rose-500/20"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    {isSelectedChannelPlaying ? localizedT("channels.watching") : localizedT("channels.watchLive")}
                  </button>
                  {selectedChannel.labels.map((label) => (
                    <span key={label} className="inline-flex items-center rounded-xl border border-border bg-card/80 px-4 py-3 text-xs font-semibold text-foreground backdrop-blur">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-1 z-10 lg:order-2">
                <PersistentPlayerSlot
                  enabled={isPlayerDocked}
                  className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-2xl"
                >
                  {!isPlayerDocked ? (
                  <button
                    type="button"
                    onClick={() => playChannel(selectedChannel)}
                    className="group relative block aspect-video w-full overflow-hidden bg-black"
                    aria-label={`Play ${selectedChannel.name}`}
                  >
                    <ChannelLogo channel={selectedChannel} className="h-full w-full" />
                    <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />
                    {isSelectedChannelPlaying && playerIsMinimized ? (
                      <span className="absolute left-4 top-4 flex items-center gap-2 rounded bg-black/75 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                        <I18nText message="channels.miniPlayer" />
                      </span>
                    ) : null}
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-500 text-white shadow-2xl transition group-hover:scale-110">
                      <Play className="ml-1 h-7 w-7 fill-current" />
                    </span>
                  </button>
                  ) : null}
                </PersistentPlayerSlot>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="relative z-10 mx-auto -mt-4 max-w-[1600px] px-5 pb-20 sm:px-8 lg:px-12">
        {currentRecentlyViewed.length ? (
          <section className="mb-10" aria-labelledby="recently-viewed-heading">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <History className="h-3.5 w-3.5 text-rose-500" /> <I18nText message="channels.continue" />
                </p>
                <h2 id="recently-viewed-heading" className="text-2xl font-bold sm:text-3xl text-foreground">
                  <I18nText message="channels.recentlyViewed" />
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollStrip(recentStripRef, "left")}
                    aria-label={localizedT("channels.recentLeft")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/60 hover:bg-muted hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollStrip(recentStripRef, "right")}
                    aria-label={localizedT("channels.recentRight")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/60 hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearRecentlyViewed}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <I18nText message="common.clear" />
                </button>
              </div>
            </div>
            <div
              ref={recentStripRef}
              className="grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto px-1 pb-7 pt-1 scrollbar-none sm:auto-cols-[42%] md:auto-cols-[31%] lg:auto-cols-[24%] xl:auto-cols-[19%]"
            >
              {currentRecentlyViewed.map((channel) => (
                <ChannelCard
                  key={`recent-${channel.channelId}`}
                  channel={channel}
                  isSelected={selectedChannel?.channelId === channel.channelId}
                  onSelect={playChannel}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="live-now-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-500">
                <Wifi className="h-3.5 w-3.5" /> <I18nText message="channels.directoryTitle" />
              </p>
              <h2 id="live-now-heading" className="text-2xl font-bold sm:text-3xl text-foreground"><I18nText message="channels.liveNow" /></h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{data.channels.length} <I18nText message="channels.countLabel" /></span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollStrip(liveStripRef, "left")}
                  aria-label={localizedT("channels.liveLeft")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/60 hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollStrip(liveStripRef, "right")}
                  aria-label={localizedT("channels.liveRight")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/60 hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={liveStripRef}
            className="grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto px-1 pb-7 pt-1 scrollbar-none sm:auto-cols-[42%] md:auto-cols-[31%] lg:auto-cols-[24%] xl:auto-cols-[19%]"
          >
            {data.channels.slice(0, 14).map((channel: IptvChannel) => (
              <ChannelCard
                key={`featured-${channel.id}`}
                channel={channel}
                isSelected={selectedChannel?.id === channel.id}
                onSelect={playChannel}
              />
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="browse-heading">
          <div className="flex flex-col gap-5 border-t border-border pt-9 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><I18nText message="channels.browse" /></p>
              <h2 id="browse-heading" className="text-2xl font-bold sm:text-3xl text-foreground"><I18nText message="channels.animation" /></h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block">
                <span className="sr-only"><I18nText message="channels.search" /></span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={localizedT("channels.search")}
                  className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-rose-500 sm:w-64"
                />
              </label>
              <label className="relative block">
                <span className="sr-only"><I18nText message="channels.countryFilter" /></span>
                <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-border bg-card pl-10 pr-9 text-sm text-foreground outline-none transition focus:border-rose-500 sm:w-52"
                >
                  <option value="all"><I18nText message="channels.allCountries" /></option>
                  {countries.map(([code, count]) => (
                    <option key={code} value={code}>{countryFlag(code === "Global" ? null : code)} {code === "Global" ? localizedT("channels.global") : code} ({count})</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredChannels.length ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {filteredChannels.slice(0, visibleCount).map((channel: IptvChannel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    isSelected={selectedChannel?.id === channel.id}
                    onSelect={playChannel}
                  />
                ))}
              </div>
              {visibleCount < filteredChannels.length ? (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-muted"
                  >
                    <I18nText message="channels.loadMore" />
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-8 flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 text-center">
              <div>
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-semibold text-foreground"><I18nText message="channels.noMatch" /></p>
                <p className="mt-1 text-sm text-muted-foreground"><I18nText message="channels.trySearch" /></p>
              </div>
            </div>
          )}

          <p className="mt-12 text-center text-xs leading-5 text-muted-foreground">
            <I18nText message="channels.attribution" />
          </p>
        </section>
      </div>
    </div>
  );
}
