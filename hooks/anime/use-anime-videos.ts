import { useQuery } from "@tanstack/react-query";
import { animeVideosOptions } from "@/lib/media-query-options";
export function useAnimeVideos(id: string) {
  const query = useQuery(animeVideosOptions(id));
  return { ...query, isLoading: query.isPending && !!id };
}
