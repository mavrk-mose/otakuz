import { AnimeResponse, NewsResponse } from '@/types/anime';
import { MangaResponse } from '@/types/manga';

export const API_BASE_URL = 'https://api.jikan.moe/v4';

// Add rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAnimeGenres() {
    try {
        await delay(1000); // Add delay to respect API rate limits
        const response = await fetch(`${API_BASE_URL}/genres/anime`);
        if (!response.ok) throw new Error('Failed to fetch anime genres');

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime genres:', error);
        return [];
    }
}

export async function getTopAnime(genre?: string) {
    try {
        await delay(1000);
        const url = new URL(`${API_BASE_URL}/top/anime`);
        if (genre && genre !== 'all') {
            url.searchParams.append('genre', genre);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch top anime');

        const data: AnimeResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching top anime:', error);
        return [];
    }
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

export async function getMangaGenres() {
    try {
        await delay(1000); // Add delay to respect API rate limits
        const response = await fetch(`${API_BASE_URL}/genres/manga`);
        if (!response.ok) throw new Error('Failed to fetch anime genres');

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime genres:', error);
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