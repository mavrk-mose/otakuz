import { fetchJson } from "@/lib/http";
import { z } from "zod";
import { genresResponseSchema, mediaRecordSchema, newsResponseSchema, searchMediaResponseSchema } from "@/lib/schemas/media";
import { AnimeResponse, NewsResponse, TopAnime } from '@/types/anime';
import { MangaResponse } from '@/types/manga';

export const API_BASE_URL = '/api/jikan'; // Proxy to avoid CORS issues

// Add rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getImageUrl(value: unknown): string | null {
    if (!isRecord(value)) return null;

    const imageUrl = value.image_url;
    return typeof imageUrl === 'string' && imageUrl.length > 0 ? imageUrl : null;
}

export type MediaType = 'anime' | 'manga';

export interface GenreItem {
    mal_id: number;
    name: string;
    url?: string;
    count?: number;
}

export async function fetchGenres(mediaType: MediaType): Promise<GenreItem[]> {
    const { data } = await fetchJson(`${API_BASE_URL}/genres/${mediaType}`, genresResponseSchema);
    return data;
}

export async function getAnimeGenres(): Promise<GenreItem[]> {
    return fetchGenres('anime');
}

export async function getMangaGenres(): Promise<GenreItem[]> {
    return fetchGenres('manga');
}

export async function getTopAnime(genre?: string) {
    await delay(1000);

    const params = new URLSearchParams({ limit: '10', page: '1' });
    if (genre && genre !== 'all') {
        params.set('genre', genre);
    }

    const payload = await fetchJson(`${API_BASE_URL}/top/anime?${params.toString()}`, searchMediaResponseSchema);

    return payload.data.map((item, index): TopAnime => {
        if (!isRecord(item) || typeof item.mal_id !== 'number' || typeof item.title !== 'string') {
            throw new Error(`Unexpected top anime record at index ${index}`);
        }

        const images = isRecord(item.images) ? item.images : null;
        const webp = images && isRecord(images.webp) ? images.webp : null;
        const jpg = images && isRecord(images.jpg) ? images.jpg : null;

        return {
            mal_id: item.mal_id,
            title: item.title,
            imageUrl: getImageUrl(webp) ?? getImageUrl(jpg),
            synopsis: typeof item.synopsis === 'string' ? item.synopsis : null,
            score: typeof item.score === 'number' && Number.isFinite(item.score) ? item.score : null,
            episodes: typeof item.episodes === 'number' ? item.episodes : null,
        };
    });
}

export async function getAnimeByGenre(genreId: string) {
    return (await fetchJson(`${API_BASE_URL}/anime?genres=${encodeURIComponent(genreId)}`, z.object({ data: z.array(z.custom<AnimeResponse["data"][number]>(value => mediaRecordSchema.safeParse(value).success)) }))).data;
}
export async function getTopManga() {
    return (await fetchJson(`${API_BASE_URL}/top/manga`, z.object({ data: z.array(z.custom<MangaResponse["data"][number]>(value => mediaRecordSchema.safeParse(value).success)) }))).data;
}
export async function getAnimeNews() { return (await fetchJson(`${API_BASE_URL}/anime/1/news`, newsResponseSchema)).data; }
