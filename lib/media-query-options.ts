import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJson, retryApiRequest, apiRetryDelay } from "@/lib/http";
import { mediaRecordSchema, videosSchema } from "@/lib/schemas/media";
import type { AnimeDetails, AnimeVideos } from "@/types/anime";
import type { Manga } from "@/types/manga";

export const apiQueryPolicy = { retry: retryApiRequest, retryDelay: apiRetryDelay };
// Validate core identity, images, and nullable statistics at the external API boundary;
// passthrough retains the endpoint's richer catalogue fields.
const animePayload = z.object({ data: z.custom<AnimeDetails>(value => mediaRecordSchema.safeParse(value).success) });
const mangaPayload = z.object({ data: z.custom<Manga>(value => mediaRecordSchema.safeParse(value).success) });
export const animeDetailsOptions = (id: string) => queryOptions({
  queryKey: ["animeDetail", id], enabled: /^\d+$/.test(id), ...apiQueryPolicy,
  queryFn: async ({ signal }) => (await fetchJson(`/api/jikan/anime/${id}`, animePayload, { signal })).data,
});
export const mangaDetailsOptions = (id: string) => queryOptions({
  queryKey: ["manga", id], enabled: /^\d+$/.test(id), ...apiQueryPolicy,
  queryFn: async ({ signal }) => (await fetchJson(`/api/jikan/manga/${id}`, mangaPayload, { signal })).data,
});
export const animeVideosOptions = (id: string) => queryOptions({
  queryKey: ["animeVideos", id], enabled: !!id, ...apiQueryPolicy,
  queryFn: async ({ signal }): Promise<Omit<AnimeVideos, "episodes">> => {
    const { data } = await fetchJson(`/api/jikan/anime/${id}/videos`, videosSchema, { signal });
    // Unplayable entries are excluded before entering the player queue.
    return {
      promo: data.promo.filter(video => video.trailer.embed_url).map(video => ({ ...video, trailer: { ...video.trailer, embed_url: video.trailer.embed_url!, youtube_id: video.trailer.youtube_id ?? "", images: video.trailer.images ?? {} } })),
      music_videos: data.music_videos.filter(video => video.video.embed_url).map(video => ({ ...video, video: { ...video.video, embed_url: video.video.embed_url!, youtube_id: video.video.youtube_id ?? "", images: video.video.images ?? {} } })),
    } as Omit<AnimeVideos, "episodes">;
  },
});
