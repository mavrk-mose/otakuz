"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Globe2,
  History,
  Play,
  Radio,
  RefreshCw,
  Search,
  Trash2,
  Tv2,
  Wifi,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import Image from "next/image";
import { PersistentPlayerSlot } from "@/components/watch/player-layout";
import { cn } from "@/lib/utils";
import { useChannelHistoryStore } from "@/store/use-channel-history-store";
import { usePlayerStore } from "@/store/use-player-store";
import type { IptvChannel, IptvChannelsResponse } from "@/types/channel";

const PAGE_SIZE = 36;

async function fetchChannels() {
  const response = await fetch("/api/channels");

  if (!response.ok) {
    throw new Error("Could not load live channels");
  }

  return (await response.json()) as IptvChannelsResponse;
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
          "flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-950 to-black",
          className
        )}
      >
        <Tv2 className="h-10 w-10 text-zinc-600" />
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center bg-zinc-950", className)}>
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
  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      className={cn(
        "group min-w-0 text-left outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-red-500",
        isSelected && "relative z-10"
      )}
      aria-label={`Watch ${channel.name}`}
    >
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-md border border-white/10 bg-zinc-950 shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:border-white/30 group-hover:shadow-2xl",
          isSelected && "border-red-500 ring-2 ring-red-500/40"
        )}
      >
        <ChannelLogo channel={channel} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-sm bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Live
        </span>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-white/70 bg-white text-black opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </span>
      </div>
      <div className="px-0.5 pt-3">
        <h3 className="truncate text-sm font-semibold text-zinc-100">{channel.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
          <span>{countryFlag(channel.countryCode)} {channel.countryCode || "Global"}</span>
          {channel.quality ? <span>{channel.quality}</span> : null}
        </div>
      </div>
    </button>
  );
}

function ChannelSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video rounded-md bg-zinc-900" />
      <div className="mt-3 h-4 w-2/3 rounded bg-zinc-900" />
      <div className="mt-2 h-3 w-1/3 rounded bg-zinc-900" />
    </div>
  );
}

export function ChannelBrowser() {
  const searchParams = useSearchParams();
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["iptv-org", "animation-channels"],
    queryFn: fetchChannels,
    staleTime: 30 * 60 * 1000,
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

    const channelFromUrl = searchParams.get("channel");
    const matchingChannel = channelFromUrl
      ? data.channels.find(
          (channel: IptvChannel) =>
            channel.channelId === channelFromUrl || channel.id === channelFromUrl
        )
      : null;

    if (matchingChannel) {
      setSelectedChannel(matchingChannel);
    } else if (!selectedChannel) {
      setSelectedChannel(data.channels[0]);
    }
  }, [data, searchParams, selectedChannel]);

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
    setSelectedChannel(channel);
    useChannelHistoryStore.getState().addRecentlyViewed(channel);
    usePlayerStore.getState().openPlayer({
      id: `channel:${channel.id}`,
      src: channel.streamUrl,
      title: `${channel.name} — Live`,
      posterUrl: channel.logoUrl || undefined,
      playerRoute: `/channels?channel=${encodeURIComponent(channel.channelId)}`,
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

  if (isLoading) {
    return (
      <div className="-m-4 min-h-screen bg-[#080808] text-white">
        <div className="aspect-[16/8] animate-pulse bg-gradient-to-br from-zinc-900 to-black" />
        <div className="-mt-20 grid grid-cols-2 gap-4 px-5 pb-16 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => <ChannelSkeleton key={index} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="-m-4 flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#080808] px-6 text-white">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-5 text-2xl font-bold">Channels are off air</h1>
          <p className="mt-2 text-sm text-zinc-400">
            We could not reach the IPTV-org Animation playlist. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-screen overflow-hidden bg-[#080808] text-white">
      <section className="relative min-h-[520px] border-b border-white/5 lg:min-h-[620px]">
        {selectedChannel ? (
          <>
            <div className="absolute inset-0">
              <ChannelLogo channel={selectedChannel} className="h-full w-full opacity-35 blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/30" />
            </div>

            <div className="relative mx-auto grid min-h-[520px] max-w-[1600px] items-center gap-10 px-5 py-10 sm:px-8 lg:min-h-[620px] lg:grid-cols-[minmax(300px,0.8fr)_minmax(520px,1.35fr)] lg:px-12">
              <div className="order-2 z-10 pb-6 lg:order-1 lg:pb-0">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex items-center gap-2 rounded-sm bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                    <Radio className="h-3.5 w-3.5" /> Live
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Animation TV
                  </span>
                </div>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {selectedChannel.name}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-300">
                  <span className="text-emerald-400">Streaming now</span>
                  <span>{countryFlag(selectedChannel.countryCode)} {selectedChannel.countryCode || "Global"}</span>
                  {selectedChannel.quality ? <span>{selectedChannel.quality}</span> : null}
                  <span className="rounded border border-zinc-500 px-1.5 py-0.5 text-[10px] uppercase">HLS</span>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
                  Watch free live animation programming from IPTV-org&apos;s public channel directory.
                  Availability can vary by broadcaster and region.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => playChannel(selectedChannel)}
                    className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    {isSelectedChannelPlaying ? "Watching live" : "Watch live"}
                  </button>
                  {selectedChannel.labels.map((label) => (
                    <span key={label} className="inline-flex items-center rounded bg-zinc-700/70 px-4 py-3 text-xs font-semibold text-zinc-200 backdrop-blur">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-1 z-10 lg:order-2">
                <PersistentPlayerSlot
                  enabled={isPlayerDocked}
                  className="relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-black shadow-2xl shadow-black/70"
                >
                  {!isPlayerDocked ? (
                  <button
                    type="button"
                    onClick={() => playChannel(selectedChannel)}
                    className="group relative block aspect-video w-full overflow-hidden bg-zinc-950"
                    aria-label={`Play ${selectedChannel.name}`}
                  >
                    <ChannelLogo channel={selectedChannel} className="h-full w-full" />
                    <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/30" />
                    {isSelectedChannelPlaying && playerIsMinimized ? (
                      <span className="absolute left-4 top-4 flex items-center gap-2 rounded bg-black/75 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        Playing in miniplayer
                      </span>
                    ) : null}
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-2xl transition group-hover:scale-110">
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
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  <History className="h-3.5 w-3.5" /> Continue watching
                </p>
                <h2 id="recently-viewed-heading" className="text-2xl font-bold sm:text-3xl">
                  Recently viewed
                </h2>
              </div>
              <button
                type="button"
                onClick={clearRecentlyViewed}
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-zinc-500 transition hover:bg-white/10 hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
            <div className="grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto px-1 pb-7 pt-1 [scrollbar-width:none] sm:auto-cols-[42%] md:auto-cols-[31%] lg:auto-cols-[24%] xl:auto-cols-[19%] [&::-webkit-scrollbar]:hidden">
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
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-500">
                <Wifi className="h-3.5 w-3.5" /> IPTV-org Animation
              </p>
              <h2 id="live-now-heading" className="text-2xl font-bold sm:text-3xl">Live now</h2>
            </div>
            <span className="text-sm text-zinc-500">{data.channels.length} channels</span>
          </div>
          <div className="grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto px-1 pb-7 pt-1 [scrollbar-width:none] sm:auto-cols-[42%] md:auto-cols-[31%] lg:auto-cols-[24%] xl:auto-cols-[19%] [&::-webkit-scrollbar]:hidden">
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
          <div className="flex flex-col gap-5 border-t border-white/10 pt-9 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Browse the collection</p>
              <h2 id="browse-heading" className="text-2xl font-bold sm:text-3xl">Animation channels</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block">
                <span className="sr-only">Search channels</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search channels"
                  className="h-11 w-full rounded border border-white/15 bg-zinc-950/90 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/50 sm:w-64"
                />
              </label>
              <label className="relative block">
                <span className="sr-only">Filter by country</span>
                <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-11 w-full appearance-none rounded border border-white/15 bg-zinc-950/90 pl-10 pr-9 text-sm text-white outline-none transition focus:border-white/50 sm:w-52"
                >
                  <option value="all">All countries</option>
                  {countries.map(([code, count]) => (
                    <option key={code} value={code}>{countryFlag(code === "Global" ? null : code)} {code} ({count})</option>
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
                    className="rounded border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white hover:bg-white hover:text-black"
                  >
                    Load more channels
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-8 flex min-h-56 items-center justify-center rounded-lg border border-dashed border-white/15 bg-zinc-950/50 text-center">
              <div>
                <Search className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 font-semibold">No matching channels</p>
                <p className="mt-1 text-sm text-zinc-500">Try another search or country.</p>
              </div>
            </div>
          )}

          <p className="mt-12 text-center text-xs leading-5 text-zinc-600">
            Channel directory and streams are supplied by IPTV-org. Otakuz does not host video content.
          </p>
        </section>
      </div>
    </div>
  );
}
