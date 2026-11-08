import { useInfiniteMediaList } from "@/hooks/use-media";
import { AnimeResponse } from "@/types/anime";
import { fetchJson } from "@/lib/http";
import { API_BASE_URL } from "@/lib/api-config";
import { searchMediaResponseSchema } from "@/lib/schemas/media";
import type { TopAnime } from "@/types/anime";

const useFetchAnime = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteMediaList<AnimeResponse["data"][number]>({
        mediaType: 'anime'
    });

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
};

export default useFetchAnime;

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
