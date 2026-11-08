import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import { toSanityPage, limitOf, catalogToday, type SanityCursor } from "@/lib/sanity-pagination";
import type { Event } from "@/types/events";

export default function useFetchEvents(options: EventQueryOptions = {}) {
  const today = catalogToday();
  const query = useInfiniteQuery({
    queryKey: ["eventPages", options, today], initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getEventPage({ ...options, today, cursor: pageParam }, signal), getNextPageParam: page => page.nextCursor ?? undefined,
  });
  return { ...query, events: query.data?.pages.flatMap(page => page.items), isLoading: query.isPending };
}

const eventFields = `_id, title, date, time, location, thumbnailUrl, category,
  "attendees": attendees[0...5], "attendeeCount": count(attendees), organizers[]->{_id, name, avatar}`;

export interface EventQueryOptions { period?: "all" | "upcoming" | "past"; search?: string; limit?: number; cursor?: SanityCursor | null; today?: string }
export function buildEventQuery(options: EventQueryOptions = {}) {
  const period = options.period ?? "all", direction = options.search ? "desc" : period === "upcoming" ? "asc" : "desc";
  const expression = options.search ? 'select(lower(title) == $searchLower || lower(category) == $searchLower => 100, title match $prefix || category match $prefix => 80, 50)' : period === "upcoming" ? 'coalesce(date, "9999")' : 'coalesce(date, "")';
  const filter = `_type == "event" && !(_id in path("drafts.**")) &&
    ($period == "all" || ($period == "upcoming" && (!defined(date) || date >= $today)) || ($period == "past" && date < $today)) &&
    ($search == "" || title match $pattern || location.name match $pattern || location.address match $pattern || category match $pattern)`;
  const search = options.search?.trim() || "", limit = limitOf(options.limit);
  return { query: `{
    "items": *[${filter} && ($cursorId == null || ${expression} ${direction === "asc" ? ">" : "<"} $cursorValue || (${expression} == $cursorValue && _id > $cursorId))]
      | order(${expression} ${direction}, _id asc)[0...$fetchLimit]{${eventFields}, "_sort": ${expression}},
    "total": count(*[${filter}])
  }`, params: { period, search, searchLower: search.toLowerCase(), prefix: `${search}*`, pattern: `*${search}*`, today: options.today ?? catalogToday(), cursorId: options.cursor?.id ?? null, cursorValue: options.cursor?.value ?? null, fetchLimit: limit + 1 }, limit };
}

export async function getEventPage(options: EventQueryOptions = {}, signal?: AbortSignal) {
  const { query, params, limit } = buildEventQuery(options);
  const response = await client.fetch<{ items: (Event & { _sort: string })[]; total: number }>(query, params, { signal });
  return toSanityPage(response, limit);
}
export async function getEvents(options: EventQueryOptions = {}) { return (await getEventPage(options)).items; }
