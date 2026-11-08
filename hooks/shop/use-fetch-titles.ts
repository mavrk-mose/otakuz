import { useInfiniteQuery } from "@tanstack/react-query";
import { getTitlePage } from "@/lib/sanity";
import type { SanityCursor } from "@/lib/sanity-queries";
export default function useFetchTitles() {
  const query = useInfiniteQuery({
    queryKey: ["titlePages"], initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getTitlePage(pageParam, 12, signal), getNextPageParam: page => page.nextCursor ?? undefined,
  });
  return { ...query, titles: query.data?.pages.flatMap(page => page.items), isLoading: query.isPending };
}
