import { z } from "zod";
import { mediaRecordSchema, mediaSchema, paginationSchema } from "./media";
import type { AnimeCharacter, AnimeDetails, AnimeEpisode, AnimeScheduleResponse, ScheduleAnime } from "@/types/anime";

export const animeDetailResponseSchema = z.object({ data: z.custom<AnimeDetails>(value => mediaRecordSchema.safeParse(value).success) });
const characterShape = z.object({ character: z.object({ mal_id: z.number(), name: z.string() }).passthrough(), role: z.string(), voice_actors: z.array(z.object({ person: z.object({ mal_id: z.number(), name: z.string() }).passthrough(), language: z.string() }).passthrough()) }).passthrough();
export const charactersResponseSchema = z.object({ data: z.array(z.custom<AnimeCharacter>(value => characterShape.safeParse(value).success)) });
const episodeShape = z.object({ mal_id: z.number(), title: z.string(), filler: z.boolean(), recap: z.boolean() }).passthrough();
export const episodesResponseSchema = z.object({ data: z.array(z.custom<AnimeEpisode>(value => episodeShape.safeParse(value).success)), pagination: paginationSchema.extend({ last_visible_page: z.number() }) });
const scheduleShape = mediaSchema.extend({ broadcast: z.object({ time: z.string().nullish(), timezone: z.string().nullish() }).passthrough().nullish() });
const scheduleResponse = z.object({ data: z.array(z.custom<ScheduleAnime>(value => scheduleShape.safeParse(value).success)), pagination: paginationSchema.extend({ last_visible_page: z.number(), items: z.object({ count: z.number(), total: z.number(), per_page: z.number() }) }) });
export const schedulesResponseSchema = z.custom<AnimeScheduleResponse>(value => scheduleResponse.safeParse(value).success);
