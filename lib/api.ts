import { AnimeResponse, TopAnime } from '@/types/anime';

const BASE_URL = 'https://api.jikan.moe/v4';

export async function getTopAnime(): Promise<TopAnime[]> {
  try {
    const response = await fetch(`${BASE_URL}/top/anime?limit=10`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AnimeResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    return [];
  }
}