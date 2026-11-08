import { useInfiniteQuery } from "@tanstack/react-query";
import { getEventPage } from "@/lib/sanity";
import { catalogToday } from "@/lib/sanity-queries";
import type { EventQueryOptions, SanityCursor } from "@/lib/sanity-queries";
export default function useFetchEvents(options: EventQueryOptions = {}) {
  const today = catalogToday();
  const query = useInfiniteQuery({
    queryKey: ["eventPages", options, today], initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getEventPage({ ...options, today, cursor: pageParam }, signal), getNextPageParam: page => page.nextCursor ?? undefined,
  });
  return { ...query, events: query.data?.pages.flatMap(page => page.items), isLoading: query.isPending };
}
