import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import { toSanityPage, type SanityCursor } from "@/lib/sanity-pagination";
import type { Title } from "@/types/shop";

export default function useFetchTitles() {
  const query = useInfiniteQuery({
    queryKey: ["titlePages"],
    initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getTitlePage(pageParam, 12, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return {
    ...query,
    titles: query.data?.pages.flatMap((page) => page.items),
    isLoading: query.isPending,
  };
}

export const titlesQuery = `
  *[
    _type == "title" &&
    !(_id in path("drafts.**")) &&
    ($cursorId == null || _id > $cursorId)
  ]
    | order(_id asc)
    [0...$fetchLimit]{
      _id,
      name,
      image,
      "_sort": _id
    }
`;

export async function getTitlePage(
  cursor: SanityCursor | null = null,
  limit = 12,
  signal?: AbortSignal,
) {
  const rows = await client.fetch<(Title & { _sort: string })[]>(
    titlesQuery,
    { cursorId: cursor?.id ?? null, fetchLimit: limit + 1 },
    { signal },
  );
  return toSanityPage({ items: rows, total: 0 }, limit);
}
