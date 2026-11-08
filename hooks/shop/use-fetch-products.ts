import { useInfiniteQuery } from "@tanstack/react-query";
import { getProductPage } from "@/lib/sanity";
import type { ProductQueryOptions, SanityCursor } from "@/lib/sanity-queries";

export interface ProductListProps extends ProductQueryOptions { priceRange?: [number, number]; sortBy?: string; enabled?: boolean }
export default function useFetchProducts({ priceRange, sortBy, enabled = true, ...filters }: ProductListProps = {}) {
  const options = { ...filters, minPrice: filters.minPrice ?? priceRange?.[0], maxPrice: filters.maxPrice ?? priceRange?.[1], sort: sortBy ?? filters.sort };
  const query = useInfiniteQuery({
    queryKey: ["productPages", options], enabled,
    initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getProductPage({ ...options, cursor: pageParam }, signal),
    getNextPageParam: page => page.nextCursor ?? undefined,
  });
  return { ...query, products: query.data?.pages.flatMap(page => page.items), total: query.data?.pages[0]?.total ?? 0, isLoading: query.isPending };
}
