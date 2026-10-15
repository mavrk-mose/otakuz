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
    try {
        await delay(1000);
        const response = await fetch(`${API_BASE_URL}/genres/${mediaType}`);
        if (!response.ok) throw new Error(`Failed to fetch ${mediaType} genres`);

        const data = await response.json();
        return data.data ?? [];
    } catch (error) {
        console.error(`Error fetching ${mediaType} genres:`, error);
        return [];
    }
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

    const response = await fetch(`${API_BASE_URL}/top/anime?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Top anime request failed (${response.status})`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.data)) {
        throw new Error('Unexpected response from top anime API');
    }

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
    try {
        await delay(1000);
        const response = await fetch(`${API_BASE_URL}/anime?genres=${genreId}`);
        if (!response.ok) throw new Error('Failed to fetch anime by genre');

        const data: AnimeResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime by genre:', error);
        return [];
    }
}

export async function getTopManga() {
    try {
        await delay(1000);
        const response = await fetch(`${API_BASE_URL}/top/manga`);
        if (!response.ok) throw new Error('Failed to fetch top manga');

        const data: MangaResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching top manga:', error);
        return [];
    }
}

export async function getAnimeNews() {
    try {
        await delay(1000);
        const response = await fetch(`${API_BASE_URL}/anime/1/news`);
        if (!response.ok) throw new Error('Failed to fetch anime news');

        const data: NewsResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime news:', error);
        return [];
    }
}
