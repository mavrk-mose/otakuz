/**
 * Shared primitive and utility types following TypeScript best practices.
 */

export type Maybe<T> = T | null | undefined;
export type Nullable<T> = T | null;

/**
 * Common pagination structures for paginated API responses.
 */
export type PaginationBase = {
  last_visible_page: number;
  has_next_page: boolean;
  current_page?: number;
};

export type PaginationItems = {
  count: number;
  total: number;
  per_page: number;
};

export type DetailedPagination = PaginationBase & {
  current_page: number;
  items: PaginationItems;
};

export type PaginatedResponse<TData, TPagination = PaginationBase> = {
  data: TData;
  pagination: TPagination;
};

/**
 * Standard image resolution format (MyAnimeList / Jikan).
 */
export type MalImageFormat = {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
};

export type MalImages = {
  jpg: MalImageFormat;
  webp: MalImageFormat;
};

/**
 * Generic named entity reference (genres, producers, studios, authors, etc.).
 */
export type MalNamedResource = {
  mal_id: number;
  type: string;
  name: string;
  url?: string;
};

/**
 * Standard Sanity CMS primitives.
 */
export type SanityReference = {
  _ref: string;
  _type: "reference";
};

export type SanityImage = {
  _type: "image";
  _key?: string;
  asset: SanityReference;
};

/**
 * Shared styling and layout properties for Sanity content cards.
 */
export type SanityCardDisplay = {
  section?: string;
  panelClassName?: string;
  textClassName?: string;
  itemClassName?: string;
  isFeatured?: boolean;
};
