import type { Maybe } from "./common";

export type { Maybe };

export type MovieGenre = {
  id: number;
  name: string;
};

export type Genre = MovieGenre;

export type MovieBase = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  vote_average?: number;
  vote_count: number;
};

export type MovieListItem = MovieBase & {
  genre_ids: number[];
};

export type MovieDetails = MovieBase & {
  genre_ids: number[];
  genres: Genre[];
  homepage: string;
  imdb_id: Maybe<string>;
  revenue: number;
  runtime: number;
  status: string;
  tagline: Maybe<string>;
};

export type MovieVideo = {
  id: string;
  key: string;
  name: string;
  type: string;
};

export type PersonBase = {
  id: number;
  name: string;
  profile_path: string;
  adult: boolean;
  popularity: number;
  known_for_department: string;
};

export type MovieCast = PersonBase & {
  character: string;
};

export type MovieCrew = PersonBase & {
  job: string;
};

export type PersonListItem = PersonBase & {
  known_for: MovieListItem[];
};

export type PersonCasting = MovieListItem & { character: string };
export type PersonCrew = MovieListItem & { job: string };

export type PersonDetails = PersonBase & {
  biography: Maybe<string>;
  birthday: string;
  place_of_birth: string;
  official_site: Maybe<string>;
  also_known_as: Maybe<string[]>;
  imdb_id: Maybe<string>;
};
