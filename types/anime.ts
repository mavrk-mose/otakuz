import type {
  DetailedPagination,
  MalImageFormat,
  MalImages,
  MalNamedResource,
  Nullable,
  PaginatedResponse,
  PaginationBase,
} from "./common";

export type AnimeTrailer = {
  youtube_id: string;
  url: string;
  embed_url: string;
};

export type BaseAnime = {
  mal_id: number;
  title: string;
  images: MalImages;
  trailer: AnimeTrailer;
  synopsis: string;
  score: number;
  episodes: number;
  status: string;
  rating: string;
  genres: MalNamedResource[];
};

export type AnimeResponse = PaginatedResponse<
  BaseAnime[],
  PaginationBase & { current_page: number }
>;

export type TopAnime = {
  mal_id: number;
  title: string;
  imageUrl: Nullable<string>;
  synopsis: Nullable<string>;
  score: Nullable<number>;
  episodes: Nullable<number>;
};

export type AnimeTitleItem = {
  type: string;
  title: string;
};

export type AnimeAired = {
  from: string;
  to: string;
  prop: {
    from: { day: number; month: number; year: number };
    to: { day: number; month: number; year: number };
    string: string;
  };
};

export type AnimeBroadcast = {
  day: string;
  time: string;
  timezone: string;
  string: string;
};

export type AnimeDetails = {
  mal_id: number;
  url: string;
  images: MalImages;
  trailer: AnimeTrailer;
  approved: boolean;
  titles: AnimeTitleItem[];
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: AnimeAired;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season: string;
  year: number;
  broadcast: AnimeBroadcast;
  producers: MalNamedResource[];
  licensors: MalNamedResource[];
  studios: MalNamedResource[];
  genres: MalNamedResource[];
  explicit_genres: MalNamedResource[];
  themes: MalNamedResource[];
  demographics: MalNamedResource[];
};

export type AnimeEntry = {
  mal_id: number;
  url: string;
  images: MalImages;
  title: string;
};

export type AnimeCharacterPerson = {
  mal_id: number;
  url: string;
  name: string;
  images: MalImages;
};

export type AnimeVoiceActor = {
  person: AnimeCharacterPerson;
  language: string;
};

export type AnimeCharacter = {
  character: AnimeCharacterPerson;
  role: string;
  favorites: number;
  voice_actors: AnimeVoiceActor[];
};

export type AnimeCharactersResponse = {
  data: AnimeCharacter[];
};

export type RecentAnimeItem = {
  mal_id: string;
  entry: AnimeEntry[];
  content: string;
  user: {
    url: string;
    username: string;
  };
};

export type RecentAnime = PaginatedResponse<
  RecentAnimeItem[],
  PaginationBase & { current_page: number }
>;

export type PaginatedAnime = PaginatedResponse<
  AnimeDetails[],
  DetailedPagination
>;

export type ScheduleAnime = {
  mal_id: number;
  title?: Nullable<string>;
  title_english?: Nullable<string>;
  title_japanese?: Nullable<string>;
  episodes?: Nullable<number>;
  images?: Nullable<{
    jpg?: Nullable<Partial<MalImageFormat>>;
    webp?: Nullable<Partial<MalImageFormat>>;
  }>;
  broadcast?: Nullable<{
    time?: Nullable<string>;
    timezone?: Nullable<string>;
  }>;
};

export type AnimeScheduleResponse = PaginatedResponse<
  ScheduleAnime[],
  DetailedPagination
>;

export type TrailerImageSizes = {
  image_url: Nullable<string>;
  small_image_url: Nullable<string>;
  medium_image_url: Nullable<string>;
  large_image_url: Nullable<string>;
  maximum_image_url: Nullable<string>;
};

export type AnimeVideos = {
  promo: {
    title: string;
    trailer: AnimeTrailer & {
      images: TrailerImageSizes;
    };
  }[];
  episodes: {
    mal_id: number;
    url: string;
    title: string;
    episode: string;
    images: {
      jpg: { image_url: string };
    };
  }[];
  music_videos: {
    title: string;
    video: AnimeTrailer & {
      images: TrailerImageSizes;
    };
    meta: {
      title: string;
      author: string;
    };
  }[];
};

export type Comment = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  likes: number;
};

export type WatchParty = {
  id: string;
  hostId: string;
  animeId?: string;
  title?: string;
  currentTime: number;
  isPlaying: boolean;
  participants: string[];
};

export type AnimeNews = {
  mal_id: number;
  url: string;
  title: string;
  date: string;
  author_username: string;
  author_url: string;
  forum_url: string;
  images: {
    jpg: { image_url: string };
  };
  comments: number;
  excerpt: string;
};

export type NewsResponse = PaginatedResponse<AnimeNews[], PaginationBase>;

export type AnimeEpisode = {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  title_romanji: string;
  aired: string;
  score: Nullable<number>;
  filler: boolean;
  recap: boolean;
  forum_url: string;
};

export type AnimeEpisodeResponse = PaginatedResponse<
  AnimeEpisode[],
  PaginationBase & { current_page: number }
>;

export type Genre = {
  mal_id: number;
  name: string;
};
