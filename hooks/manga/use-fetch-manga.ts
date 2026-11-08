import { useInfiniteMediaList } from "@/hooks/use-media";
import { fetchJson } from "@/lib/http";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/api-config";
import { mediaRecordSchema } from "@/lib/schemas/media";
import type { MangaResponse } from "@/types/manga";

const useFetchManga = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage
    } = useInfiniteMediaList({
        mediaType: 'manga'
    });

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage
    };
};

export default useFetchManga;

export async function getTopManga() {
    return (await fetchJson(`${API_BASE_URL}/top/manga`, z.object({ data: z.array(z.custom<MangaResponse["data"][number]>(value => mediaRecordSchema.safeParse(value).success)) }))).data;
}
