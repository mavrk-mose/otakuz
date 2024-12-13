export type Maybe<T> = T | null | undefined;

export type Genre = {
  id: number;
  name: string;
};

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

export type MovieCast = PersonBase & {
  character: string;
};

export type MovieCrew = PersonBase & {
  job: string;
};

export type PersonBase = {
    id: number;
    name: string;
    profile_path: string;
    adult: boolean;
    popularity: number;
    known_for_department: string;
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

// export interface MovieResponse {
//     results: Movie[];
//     page: number;
//     total_pages: number;
//     total_results: number;

// }

// export interface Movie {
//     id: number;
//     title: string;
//     overview: string;
//     poster_path: string;
//     backdrop_path: string;
//     release_date: string;
//     vote_average: number;
//     vote_count: number;
// }