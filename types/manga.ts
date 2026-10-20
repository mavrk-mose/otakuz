import type {
  MalImages,
  MalNamedResource,
  Nullable,
  PaginatedResponse,
  PaginationBase,
} from "./common";

export type Manga = {
  mal_id: number;
  title: string;
  title_japanese: Nullable<string>;
  type: string;
  images: MalImages;
  synopsis: Nullable<string>;
  score: Nullable<number>;
  scored_by: Nullable<number>;
  chapters: Nullable<number>;
  volumes: Nullable<number>;
  status: string;
  genres: MalNamedResource[];
  authors: MalNamedResource[];
  rank: Nullable<number>;
  popularity: Nullable<number>;
  members: Nullable<number>;
  favorites: Nullable<number>;
};

export type MangaResponse = PaginatedResponse<Manga[], PaginationBase>;
