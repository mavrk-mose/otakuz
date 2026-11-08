export type SanityCursor = { id: string; value: string | number };
export type SanityPage<T> = { items: T[]; total: number; nextCursor: SanityCursor | null };
export const normalizeCatalogValue = (value: string) => value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-");
export const catalogToday = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const limitOf = (limit = 24) => Math.min(100, Math.max(1, Math.floor(limit) || 24));
export function toSanityPage<T extends { _id: string }>(response: { items: (T & { _sort: string | number })[]; total: number }, limit: number): SanityPage<T> {
  const items = response.items.slice(0, limit), last = items.at(-1);
  return { items, total: response.total, nextCursor: response.items.length > limit && last ? { id: last._id, value: last._sort } : null };
}
