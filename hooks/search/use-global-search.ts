"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { API_BASE_URL } from "@/lib/api";
import { db } from "@/lib/firebase";
import { getEvents, getProducts, urlFor } from "@/lib/sanity";
import { useAuth } from "@/hooks/use-auth";
import { fetchPublicCommunityUsers } from "@/hooks/use-community-users";
import type { IptvChannel, IptvChannelsResponse } from "@/types/channel";
import type {
  GlobalSearchCategory,
  SearchScopeTab,
} from "@/store/use-global-search-store";

export interface GlobalSearchItem {
  id: string;
  category: GlobalSearchCategory;
  title: string;
  subtitle: string;
  badge?: string;
  image?: string;
  href: string;
}

export interface CategorySearchSection {
  category: GlobalSearchCategory;
  items: GlobalSearchItem[];
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  requiresAuth: boolean;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function safeSanityImageUrl(source: any): string {
  if (!source) return "";
  if (typeof source === "string") return source;
  try {
    if (source?.asset?._ref || source?._type === "image") {
      return urlFor(source).width(160).height(160).fit("crop").url();
    }
    if (typeof source?.asset?.url === "string") {
      return source.asset.url;
    }
  } catch {
    return "";
  }
  return "";
}

function rankMatchScore(text: string, queryLower: string): number {
  const lower = text.toLowerCase();
  if (lower === queryLower) return 100;
  if (lower.startsWith(queryLower)) return 80;
  if (lower.includes(queryLower)) return 50;
  return 0;
}

export function useGlobalSearch({
  rawQuery,
  isOpen,
  focusedCategory,
  enabledCategories,
}: {
  rawQuery: string;
  isOpen: boolean;
  focusedCategory: SearchScopeTab;
  enabledCategories: GlobalSearchCategory[];
}) {
  const { user } = useAuth();
  const trimmedQuery = rawQuery.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const debouncedExternalQuery = useDebouncedValue(trimmedQuery, 280);

  const isCategoryWanted = (cat: GlobalSearchCategory) => {
    if (!isOpen || trimmedQuery.length === 0) return false;
    if (focusedCategory !== "all") return focusedCategory === cat;
    return enabledCategories.includes(cat);
  };

  const maxItems = focusedCategory === "all" ? 5 : 18;

  const queryResults = useQueries({
    queries: [
      // 1. Anime (Jikan API - async streaming with AbortSignal + keepPreviousData)
      {
        queryKey: ["globalSearch", "anime", debouncedExternalQuery, maxItems] as const,
        queryFn: async ({ signal }: { signal: AbortSignal }): Promise<GlobalSearchItem[]> => {
          if (!debouncedExternalQuery) return [];
          const params = new URLSearchParams({
            q: debouncedExternalQuery,
            limit: String(Math.min(maxItems, 12)),
            sfw: "true",
          });
          const res = await fetch(`${API_BASE_URL}/anime?${params.toString()}`, {
            signal,
          });
          if (!res.ok) throw new Error(`Anime search failed (${res.status})`);
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          return list.map((anime: any) => ({
            id: `anime-${anime.mal_id}`,
            category: "anime" as const,
            title: anime.title || "Untitled Anime",
            subtitle: [
              anime.type || "Anime",
              anime.episodes ? `${anime.episodes} eps` : null,
              anime.year || null,
            ]
              .filter(Boolean)
              .join(" • "),
            badge: anime.score ? `★ ${anime.score}` : undefined,
            image:
              anime.images?.webp?.small_image_url ||
              anime.images?.jpg?.image_url ||
              "",
            href: `/anime/${anime.mal_id}`,
          }));
        },
        enabled: isCategoryWanted("anime") && debouncedExternalQuery.length >= 1,
        placeholderData: keepPreviousData,
        staleTime: 2 * 60_000,
        retry: 1,
      },

      // 2. Manga (Jikan API - async streaming with AbortSignal + keepPreviousData)
      {
        queryKey: ["globalSearch", "manga", debouncedExternalQuery, maxItems] as const,
        queryFn: async ({ signal }: { signal: AbortSignal }): Promise<GlobalSearchItem[]> => {
          if (!debouncedExternalQuery) return [];
          const params = new URLSearchParams({
            q: debouncedExternalQuery,
            limit: String(Math.min(maxItems, 12)),
            sfw: "true",
          });
          const res = await fetch(`${API_BASE_URL}/manga?${params.toString()}`, {
            signal,
          });
          if (!res.ok) throw new Error(`Manga search failed (${res.status})`);
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          return list.map((manga: any) => ({
            id: `manga-${manga.mal_id}`,
            category: "manga" as const,
            title: manga.title || "Untitled Manga",
            subtitle: [
              manga.type || "Manga",
              manga.chapters ? `${manga.chapters} ch` : null,
              manga.status || null,
            ]
              .filter(Boolean)
              .join(" • "),
            badge: manga.score ? `★ ${manga.score}` : undefined,
            image:
              manga.images?.webp?.small_image_url ||
              manga.images?.jpg?.image_url ||
              "",
            href: `/manga/${manga.mal_id}`,
          }));
        },
        enabled: isCategoryWanted("manga") && debouncedExternalQuery.length >= 1,
        placeholderData: keepPreviousData,
        staleTime: 2 * 60_000,
        retry: 1,
      },

      // 3. Community Users (Shared Firestore cache + 0ms select filter)
      {
        queryKey: ["communityUsers", 500] as const,
        queryFn: () => fetchPublicCommunityUsers(500),
        enabled: isCategoryWanted("users"),
        staleTime: 60_000,
        select: (users: Awaited<ReturnType<typeof fetchPublicCommunityUsers>>): GlobalSearchItem[] => {
          if (!normalizedQuery) return [];
          const qClean = normalizedQuery.replace(/^@/, "");
          return users
            .map((u) => {
              const score = Math.max(
                rankMatchScore(u.displayName, normalizedQuery),
                rankMatchScore(u.username.replace(/^@/, ""), qClean),
                u.rank?.toLowerCase().includes(normalizedQuery) ? 30 : 0,
                u.bio?.toLowerCase().includes(normalizedQuery) ? 20 : 0
              );
              return { u, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxItems)
            .map(({ u }) => ({
              id: `user-${u.uid}`,
              category: "users" as const,
              title: u.displayName,
              subtitle: [u.username, u.rank, `${u.boardsCount ?? 0} boards`]
                .filter(Boolean)
                .join(" • "),
              badge: `Lv. ${u.level}`,
              image: u.photoURL || "",
              href: `/profile?userId=${u.uid}`,
            }));
        },
      },

      // 4. Merch / Shop Products (Sanity catalog + instant select filter)
      {
        queryKey: ["globalSearch", "merchCatalog"] as const,
        queryFn: async () => {
          try {
            const products = await getProducts();
            return Array.isArray(products) ? products : [];
          } catch {
            return [];
          }
        },
        enabled: isCategoryWanted("merch"),
        staleTime: 5 * 60_000,
        select: (products: any[]): GlobalSearchItem[] => {
          if (!normalizedQuery) return [];
          return products
            .map((p) => {
              const score = Math.max(
                rankMatchScore(String(p.name || ""), normalizedQuery),
                rankMatchScore(String(p.category || ""), normalizedQuery),
                rankMatchScore(String(p.title?.name || ""), normalizedQuery),
                String(p.description || "").toLowerCase().includes(normalizedQuery)
                  ? 25
                  : 0
              );
              return { p, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxItems)
            .map(({ p }) => ({
              id: `merch-${p._id}`,
              category: "merch" as const,
              title: p.name || "Merchandise",
              subtitle: [p.category, p.title?.name].filter(Boolean).join(" • ") || "Shop Item",
              badge: p.price != null ? `Tshs.${Number(p.price).toLocaleString()}` : undefined,
              image: safeSanityImageUrl(p.image?.[0]),
              href: `/shop/product/${p._id}`,
            }));
        },
      },

      // 5. Events (Shared Sanity events cache + instant select filter)
      {
        queryKey: ["events"] as const,
        queryFn: async () => {
          try {
            const events = await getEvents();
            return Array.isArray(events) ? events : [];
          } catch {
            return [];
          }
        },
        enabled: isCategoryWanted("events"),
        staleTime: 5 * 60_000,
        select: (events: any[]): GlobalSearchItem[] => {
          if (!normalizedQuery) return [];
          return events
            .map((ev) => {
              const locName = ev.location?.name || "";
              const locAddr = ev.location?.address || "";
              const score = Math.max(
                rankMatchScore(String(ev.title || ""), normalizedQuery),
                rankMatchScore(String(locName), normalizedQuery),
                rankMatchScore(String(ev.category || ""), normalizedQuery),
                String(locAddr).toLowerCase().includes(normalizedQuery) ? 25 : 0
              );
              return { ev, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxItems)
            .map(({ ev }) => {
              const eventId = ev._id || ev.id;
              const dateLabel = ev.date
                ? new Date(ev.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;
              return {
                id: `event-${eventId}`,
                category: "events" as const,
                title: ev.title || "Community Event",
                subtitle: [dateLabel, ev.location?.name].filter(Boolean).join(" • ") || "Anime Event",
                badge: ev.category || "Event",
                image: safeSanityImageUrl(ev.thumbnailUrl),
                href: `/events/${eventId}`,
              };
            });
        },
      },

      // 6. Live Channels (Shared IPTV channels cache + instant select filter)
      {
        queryKey: ["iptv-channels"] as const,
        queryFn: async ({ signal }: { signal: AbortSignal }): Promise<IptvChannelsResponse> => {
          const res = await fetch("/api/channels", { signal });
          if (!res.ok) throw new Error("Failed to fetch channels");
          return res.json();
        },
        enabled: isCategoryWanted("channels"),
        staleTime: 10 * 60_000,
        select: (payload: IptvChannelsResponse): GlobalSearchItem[] => {
          if (!normalizedQuery) return [];
          const channels: IptvChannel[] = payload?.channels || [];
          return channels
            .map((ch) => {
              const score = Math.max(
                rankMatchScore(ch.name || "", normalizedQuery),
                rankMatchScore(ch.channelId || "", normalizedQuery),
                rankMatchScore(ch.countryCode || "", normalizedQuery)
              );
              return { ch, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxItems)
            .map(({ ch }) => ({
              id: `channel-${ch.id || ch.channelId}`,
              category: "channels" as const,
              title: ch.name,
              subtitle: [ch.countryCode || "Global", ch.quality, "Live Stream"]
                .filter(Boolean)
                .join(" • "),
              badge: "LIVE",
              image: ch.logoUrl || "",
              href: `/channels?channel=${encodeURIComponent(ch.channelId)}`,
            }));
        },
      },

      // 7. Chatrooms (Firestore chatrooms when signed in)
      {
        queryKey: ["globalSearch", "chatrooms", user?.uid ?? "guest"] as const,
        queryFn: async () => {
          if (!user?.uid) return [];
          const snap = await getDocs(collection(db, "chatrooms"));
          return snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: typeof data.title === "string" ? data.title : "Untitled Room",
              memberCount: typeof data.memberCount === "number" ? data.memberCount : 0,
            };
          });
        },
        enabled: isCategoryWanted("chatrooms") && Boolean(user?.uid),
        staleTime: 60_000,
        select: (rooms: { id: string; title: string; memberCount: number }[]): GlobalSearchItem[] => {
          if (!normalizedQuery) return [];
          const qClean = normalizedQuery.replace(/^#/, "");
          return rooms
            .map((room) => ({
              room,
              score: rankMatchScore(room.title, qClean),
            }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxItems)
            .map(({ room }) => ({
              id: `chatroom-${room.id}`,
              category: "chatrooms" as const,
              title: room.title,
              subtitle: `${room.memberCount} ${room.memberCount === 1 ? "member" : "members"} • Community Chatroom`,
              badge: "Room",
              image: `https://avatar.vercel.sh/${room.id}`,
              href: `/chat/${room.id}`,
            }));
        },
      },
    ],
  });

  const sections = useMemo<CategorySearchSection[]>(() => {
    const order: GlobalSearchCategory[] = [
      "anime",
      "manga",
      "users",
      "merch",
      "events",
      "channels",
      "chatrooms",
    ];

    return order
      .map((category, index) => {
        const q = queryResults[index];
        const wanted = isCategoryWanted(category);
        if (!wanted) return null;

        const requiresAuth = category === "chatrooms" && !user?.uid;
        return {
          category,
          items: (q.data as GlobalSearchItem[] | undefined) ?? [],
          isPending: requiresAuth ? false : q.isPending && q.fetchStatus !== "idle",
          isFetching: requiresAuth ? false : q.isFetching,
          isError: Boolean(q.isError),
          requiresAuth,
        };
      })
      .filter((s): s is CategorySearchSection => s !== null);
  }, [
    enabledCategories,
    focusedCategory,
    isOpen,
    queryResults,
    trimmedQuery,
    user?.uid,
  ]);

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections]
  );

  const isAnyFetching = sections.some((s) => s.isFetching);
  const isAllSettledEmpty =
    trimmedQuery.length > 0 &&
    !sections.some((s) => s.isPending || s.isFetching) &&
    flatItems.length === 0;

  return {
    sections,
    flatItems,
    isAnyFetching,
    isAllSettledEmpty,
  };
}
