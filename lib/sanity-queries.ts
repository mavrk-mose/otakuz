export type SanityCursor = { id: string; value: string | number };
export type SanityPage<T> = { items: T[]; total: number; nextCursor: SanityCursor | null };
export const normalizeCatalogValue = (value: string) => value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-");
export const catalogToday = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const limitOf = (limit = 24) => Math.min(100, Math.max(1, Math.floor(limit) || 24));
const productFields = `_id, _createdAt, name, description, price, image, category, rating, stock, variants,
  "title": title->{_id, name, image}`;
const eventFields = `_id, title, date, time, location, thumbnailUrl, category,
  "attendees": attendees[0...5], "attendeeCount": count(attendees), organizers[]->{_id, name, avatar}`;

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

export const catalogFacetsQuery = `{
  "categories": array::unique(*[_type == "product" && price >= 0 && !(_id in path("drafts.**")) && defined(category)].category) | order(@ asc),
  "titles": *[_type == "title" && !(_id in path("drafts.**"))] | order(name asc, _id asc){_id, name, image},
  "minPrice": coalesce(math::min(*[_type == "product" && price >= 0 && !(_id in path("drafts.**"))].price), 0),
  "maxPrice": coalesce(math::max(*[_type == "product" && price >= 0 && !(_id in path("drafts.**"))].price), 0)
}`;
export const titlesQuery = `*[_type == "title" && !(_id in path("drafts.**")) && ($cursorId == null || _id > $cursorId)] | order(_id asc)[0...$fetchLimit]{_id, name, image, "_sort": _id}`;

export function toSanityPage<T extends { _id: string }>(response: { items: (T & { _sort: string | number })[]; total: number }, limit: number): SanityPage<T> {
  const items = response.items.slice(0, limit), last = items.at(-1);
  return { items, total: response.total, nextCursor: response.items.length > limit && last ? { id: last._id, value: last._sort } : null };
}
