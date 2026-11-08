import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getNewsPage, getNewsHighlights } from "@/lib/sanity";
import type { SanityCursor } from "@/lib/sanity-queries";
export default function useFetchNewsStories(category = "All Stories") {
  const query = useInfiniteQuery({
    queryKey: ["newsStoryPages", category], initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getNewsPage(category, pageParam, 24, signal), getNextPageParam: page => page.nextCursor ?? undefined,
  });
  const highlights = useQuery({ queryKey: ["newsHighlights", category], queryFn: ({ signal }) => getNewsHighlights(category, signal) });
  return { ...query, stories: query.data?.pages.flatMap(page => page.items), highlights: highlights.data, isLoading: query.isPending || highlights.isPending };
}
