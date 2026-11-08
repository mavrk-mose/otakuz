import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import { toSanityPage, limitOf, type SanityCursor } from "@/lib/sanity-pagination";
import type { Product } from "@/types/shop";

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

const productFields = `_id, _createdAt, name, description, price, image, category, rating, stock, variants,
  "title": title->{_id, name, image}`;
export interface ProductQueryOptions {
  category?: string; categories?: string[]; title?: string; titles?: string[];
  search?: string; minPrice?: number; maxPrice?: number; inStock?: boolean;
  sort?: string; limit?: number; cursor?: SanityCursor | null; priceRanges?: string[];
}
export function buildProductQuery(options: ProductQueryOptions = {}) {
  const sort = options.sort || "newest";
  const expression = sort === "relevance" ? 'select(lower(name) == $searchLower || lower(category) == $searchLower || lower(title->name) == $searchLower => 100, name match $prefix || category match $prefix || title->name match $prefix => 80, 50)' : sort === "price-low" || sort === "price-high" ? "price" : sort === "rating" ? "coalesce(rating, 0)" : "_createdAt";
  const direction = sort === "price-low" ? "asc" : "desc";
  const categories = options.categories ?? (options.category && options.category !== "all" ? [options.category] : []);
  const titles = options.titles ?? (options.title ? [options.title] : []);
  const filter = `_type == "product" && price >= 0 && !(_id in path("drafts.**")) &&
    (count($categories) == 0 || category in $categories) &&
    (count($titles) == 0 || title._ref in *[_type == "title" && name in $titles]._id) &&
    ($search == "" || name match $pattern || description match $pattern || category match $pattern || title->name match $pattern) &&
    ($minPrice == null || price >= $minPrice) && ($maxPrice == null || price <= $maxPrice) &&
    (!$inStock || stock > 0) && (count($priceRanges) == 0 ||
      ("under-25" in $priceRanges && price < 25) || ("25-50" in $priceRanges && price >= 25 && price <= 50) ||
      ("50-100" in $priceRanges && price >= 50 && price <= 100) || ("over-100" in $priceRanges && price > 100))`;
  const search = options.search?.trim() || "";
  const limit = limitOf(options.limit);
  return { query: `{
    "items": *[${filter} && ($cursorId == null || ${expression} ${direction === "asc" ? ">" : "<"} $cursorValue || (${expression} == $cursorValue && _id > $cursorId))]
      | order(${expression} ${direction}, _id asc)[0...$fetchLimit]{${productFields}, "_sort": ${expression}},
    "total": count(*[${filter}])
  }`, params: { categories, titles, search, pattern: `*${search}*`, minPrice: options.minPrice ?? null, maxPrice: options.maxPrice ?? null,
    searchLower: search.toLowerCase(), prefix: `${search}*`, inStock: options.inStock ?? false, priceRanges: options.priceRanges ?? [], cursorId: options.cursor?.id ?? null, cursorValue: options.cursor?.value ?? null, fetchLimit: limit + 1 }, limit };
}

export async function getProductPage(options: ProductQueryOptions = {}, signal?: AbortSignal) {
  const { query, params, limit } = buildProductQuery(options);
  const response = await client.fetch<{ items: (Product & { _sort: string | number })[]; total: number }>(query, params, { signal });
  return toSanityPage(response, limit);
}
export async function getProducts(options: ProductQueryOptions = {}) { return (await getProductPage(options)).items; }
