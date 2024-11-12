export interface AnimeResponse {
  data: TopAnime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

export interface TopAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  synopsis: string;
  score: number;
  episodes: number;
  status: string;
  rating: string;
  genres: {
    mal_id: number;
    type: string;
    name: string;
  }[];
}