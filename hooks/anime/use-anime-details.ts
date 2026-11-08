import { useQuery } from "@tanstack/react-query";
import { animeDetailsOptions } from "@/lib/media-query-options";
export default function useAnimeDetails(id: string) {
  const query = useQuery(animeDetailsOptions(id));
  return { ...query, isLoading: query.isPending && /^\d+$/.test(id) };
}
