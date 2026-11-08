import { useQuery } from "@tanstack/react-query";
import { mangaDetailsOptions } from "@/lib/media-query-options";
export default function useMangaDetails(id: string) {
  const { data: manga, ...query } = useQuery(mangaDetailsOptions(id));
  return { manga, ...query, isLoading: query.isPending && /^\d+$/.test(id) };
}
