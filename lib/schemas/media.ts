import { z } from "zod";

export const imageFormatSchema = z.object({ image_url: z.string().nullish(), small_image_url: z.string().nullish(), large_image_url: z.string().nullish(), medium_image_url: z.string().nullish(), maximum_image_url: z.string().nullish() }).passthrough();
export const imagesSchema = z.object({ jpg: imageFormatSchema.optional(), webp: imageFormatSchema.optional() }).passthrough();
export const mediaSchema = z.object({ mal_id: z.number().int().positive(), title: z.string(), images: imagesSchema }).passthrough();
export const mediaDetailsSchema = z.object({ data: mediaSchema });
export const paginationSchema = z.object({ current_page: z.number().int().positive().optional(), has_next_page: z.boolean() }).passthrough();
export const mediaPageSchema = z.object({ data: z.array(mediaSchema), pagination: paginationSchema });
const videoSchema = z.object({ youtube_id: z.string().nullish(), embed_url: z.string().nullish(), images: imageFormatSchema.optional() }).passthrough();
export const videosSchema = z.object({ data: z.object({
  promo: z.array(z.object({ title: z.string(), trailer: videoSchema }).passthrough()).default([]),
  music_videos: z.array(z.object({ title: z.string(), video: videoSchema }).passthrough()).default([]),
}) });
export const avatarResponseSchema = z.object({ data: z.array(z.object({ name: z.string(), images: imagesSchema })) });
export const genresResponseSchema = z.object({ data: z.array(z.object({ mal_id: z.number().int().positive(), name: z.string(), url: z.string().optional(), count: z.number().optional() })) });

export const mediaRecordSchema = mediaSchema.extend({
  type: z.string().nullish(), status: z.string().nullish(), synopsis: z.string().nullish(),
  score: z.number().finite().nullish(), episodes: z.number().int().nonnegative().nullish(),
  chapters: z.number().int().nonnegative().nullish(), volumes: z.number().int().nonnegative().nullish(), year: z.number().int().nullish(),
});
export const searchMediaResponseSchema = z.object({ data: z.array(mediaRecordSchema) });
export const recentAnimeSchema = z.object({ data: z.array(z.object({ entry: z.array(mediaSchema), content: z.string() }).passthrough()), pagination: paginationSchema });

export const channelsResponseSchema = z.object({ channels: z.array(z.object({
  id: z.string(), channelId: z.string(), name: z.string(), streamUrl: z.string(),
  logoUrl: z.string().nullable(), countryCode: z.string().nullable(), quality: z.string().nullable(),
  labels: z.array(z.string()), categories: z.array(z.string()),
})), source: z.string(), updatedAt: z.string() });
export const newsResponseSchema = z.object({ data: z.array(z.object({ mal_id: z.number(), title: z.string(), url: z.string(), date: z.string(), author_username: z.string().nullish().transform(value => value ?? "Editorial"), excerpt: z.string().nullish().transform(value => value ?? ""), images: imagesSchema.optional() }).passthrough()) });
export const recommendationsSchema = z.object({ data: z.array(z.object({ entry: mediaSchema }).passthrough()) });

/** Some Jikan endpoints omit current_page; keep infinite pagination advancing. */
export function withCurrentPage<T extends { pagination: { current_page?: number } }>(page: T, requestedPage: number) {
  return { ...page, pagination: { ...page.pagination, current_page: page.pagination.current_page ?? requestedPage } };
}
