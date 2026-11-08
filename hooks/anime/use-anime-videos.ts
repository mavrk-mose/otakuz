import { useQuery, queryOptions } from "@tanstack/react-query";
import { fetchJson } from "@/lib/http";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { videosSchema } from "@/lib/schemas/media";
import type { AnimeVideos } from "@/types/anime";

export function useAnimeVideos(id: string) {
  const query = useQuery(animeVideosOptions(id));
  return { ...query, isLoading: query.isPending && !!id };
}

export const animeVideosOptions = (id: string) =>
  queryOptions({
    queryKey: ["animeVideos", id],
    enabled: !!id,
    ...apiQueryPolicy,
    queryFn: async ({ signal }): Promise<Omit<AnimeVideos, "episodes">> => {
      const { data } = await fetchJson(`/api/jikan/anime/${id}/videos`, videosSchema, { signal });
      // Unplayable entries are excluded before entering the player queue.
      return {
        promo: data.promo
          .filter((video) => video.trailer.embed_url)
          .map((video) => ({
            ...video,
            trailer: {
              ...video.trailer,
              embed_url: video.trailer.embed_url!,
              youtube_id: video.trailer.youtube_id ?? "",
              images: video.trailer.images ?? {},
            },
          })),
        music_videos: data.music_videos
          .filter((video) => video.video.embed_url)
          .map((video) => ({
            ...video,
            video: {
              ...video.video,
              embed_url: video.video.embed_url!,
              youtube_id: video.video.youtube_id ?? "",
              images: video.video.images ?? {},
            },
          })),
      } as Omit<AnimeVideos, "episodes">;
    },
  });
