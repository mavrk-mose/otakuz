import { QueryClient, defaultShouldDehydrateQuery, type Query } from "@tanstack/react-query";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
export const CACHE_MAX_AGE = 24 * HOUR;
export const CACHE_BUSTER = "otakuz-catalog-v1";

// Prefix defaults apply to every screen consuming the same data family.
const PUBLIC_POLICIES: [readonly string[], number][] = [
  [["animeDetail"], 6 * HOUR],
  [["manga"], 6 * HOUR],
  [["animeCharacters"], 12 * HOUR],
  [["animeEpisodes"], HOUR],
  [["animeVideos"], 12 * HOUR],
  [["animePictures"], 12 * HOUR],
  [["mangaPictures"], 12 * HOUR],
  [["animeGenres"], 24 * HOUR],
  [["mangaGenres"], 24 * HOUR],
  [["animeList"], HOUR],
  [["mangaList"], HOUR],
  [["animeByGenre"], HOUR],
  [["mangaByGenre"], HOUR],
  [["topAnime"], HOUR],
  [["topManga"], HOUR],
  [["random"], 6 * HOUR],
  [["animeRecommendations"], 6 * HOUR],
  [["mangaRecommendations"], 6 * HOUR],
  [["recentAnime"], 30 * MINUTE],
  [["animeNews"], 10 * MINUTE],
  [["newsStories"], 5 * MINUTE],
  [["newsStoryPages"], 5 * MINUTE],
  [["newsHighlights"], 5 * MINUTE],
  [["productPages"], 5 * MINUTE],
  [["eventPages"], 5 * MINUTE],
  [["catalogFacets"], 5 * MINUTE],
  [["titlePages"], 6 * HOUR],
  [["globalSearch", "merch"], 5 * MINUTE],
  [["globalSearch", "events"], 5 * MINUTE],
  [["events"], 5 * MINUTE],
  [["event"], 5 * MINUTE],
  [["products"], 5 * MINUTE],
  [["product"], 5 * MINUTE],
  [["titles"], 6 * HOUR],
  [["galleryImages"], 6 * HOUR],
  [["animeSchedules"], 30 * MINUTE],
  [["iptv-channels"], 15 * MINUTE],
  [["globalSearch", "anime"], 30 * MINUTE],
  [["globalSearch", "manga"], 30 * MINUTE],
  [["combinedSearch"], 30 * MINUTE],
];

export function shouldPersistQuery(query: Query): boolean {
  return (
    defaultShouldDehydrateQuery(query) &&
    query.meta?.persist === true &&
    PUBLIC_POLICIES.some(([prefix]) => prefix.every((part, i) => query.queryKey[i] === part))
  );
}

export function createAppQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15 * MINUTE,
        gcTime: CACHE_MAX_AGE,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        // In-memory offline data remains usable; stale data refreshes when online.
        networkMode: "online",
      },
    },
  });
  for (const [prefix, staleTime] of PUBLIC_POLICIES) {
    client.setQueryDefaults(prefix, { staleTime, meta: { persist: true } });
  }
  for (const family of ["lists", "listItems", "bookmarkLists", "communityUsers"]) {
    client.setQueryDefaults([family], {
      staleTime: 2 * MINUTE,
      gcTime: 30 * MINUTE,
      meta: { persist: false },
    });
  }
  client.setQueryDefaults(["globalSearch", "chatrooms"], {
    staleTime: 30_000,
    gcTime: 5 * MINUTE,
    meta: { persist: false },
  });
  client.setQueryDefaults(["room"], {
    staleTime: 0,
    gcTime: 5 * MINUTE,
    meta: { persist: false, backgroundRefresh: false },
  });
  return client;
}

/** Refresh only stale, visible-page consumers; never wake the whole stored catalogue. */
export function refreshStaleQueries(client: QueryClient) {
  return client.refetchQueries({
    type: "active",
    stale: true,
    predicate: (query) => query.meta?.backgroundRefresh !== false,
  });
}

/** Invalidate private memory when signing out or switching accounts. */
export function clearAccountQueries(client: QueryClient) {
  const filters = {
    predicate: (query: Query) =>
      !PUBLIC_POLICIES.some(([prefix]) => prefix.every((part, i) => query.queryKey[i] === part)),
  };
  void client.cancelQueries(filters);
  client.removeQueries(filters);
}
