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

export type AnimeData = {
    mal_id: number;
    url: string;
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
    approved: boolean;
    titles: {
        type: string;
        title: string;
    }[];
    title: string;
    title_english: string;
    title_japanese: string;
    title_synonyms: string[];
    type: string;
    source: string;
    episodes: number;
    status: string;
    airing: boolean;
    aired: {
        from: string;
        to: string;
        prop: {
            from: {
                day: number;
                month: number;
                year: number;
            };
            to: {
                day: number;
                month: number;
                year: number;
            };
            string: string;
        };
    };
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
    broadcast: {
        day: string;
        time: string;
        timezone: string;
        string: string;
    };
    producers: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
    licensors: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
    studios: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
    genres: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
    explicit_genres: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
    themes: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
    demographics: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
};

export interface AnimeEntry {
    mal_id: number;
    url: string;
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
    title: string;
  }

export type RecentAnime = {
    data: {
        mal_id: string;
        entry: AnimeEntry[];
        content: string;
        user: {
            url: string;
            username: string;
        };
    }[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}

export type AnimeSearchResults = {
    data: {
        mal_id: number;
        url: string;
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
        approved: boolean;
        titles: {
            type: string;
            title: string;
        }[];
        title: string;
        title_english: string;
        title_japanese: string;
        title_synonyms: string[];
        type: string;
        source: string;
        episodes: number;
        status: string;
        airing: boolean;
        aired: {
            from: string;
            to: string;
            prop: {
                from: {
                    day: number;
                    month: number;
                    year: number;
                };
                to: {
                    day: number;
                    month: number;
                    year: number;
                };
                string: string;
            };
        };
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
        broadcast: {
            day: string;
            time: string;
            timezone: string;
            string: string;
        };
        producers: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
        licensors: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
        studios: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
        genres: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
        explicit_genres: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
        themes: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
        demographics: {
            mal_id: number;
            type: string;
            name: string;
            url: string;
        }[];
    }[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
        items: {
            count: number;
            total: number;
            per_page: number;
        };
    };
};

export type AnimeVideos = {
    data: {
      promo: {
        title: string;
        trailer: {
          youtube_id: string;
          url: string;
          embed_url: string;
          images: {
            image_url: string;
            small_image_url: string;
            medium_image_url: string;
            large_image_url: string;
            maximum_image_url: string;
          };
        };
      }[];
      episodes: {
        mal_id: number;
        url: string;
        title: string;
        episode: string;
        images: {
          jpg: {
            image_url: string;
          };
        };
      }[];
      music_videos: {
        title: string;
        video: {
          youtube_id: string;
          url: string;
          embed_url: string;
          images: {
            image_url: string;
            small_image_url: string;
            medium_image_url: string;
            large_image_url: string;
            maximum_image_url: string;
          };
        };
        meta: {
          title: string;
          author: string;
        };
      }[];
    };
  };
  



export interface Comment {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: number;
    likes: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: number;
}

export interface WatchParty {
    id: string;
    hostId: string;
    animeId: string;
    title: string;
    currentTime: number;
    isPlaying: boolean;
    participants: string[];
}

export interface MangaResponse {
    data: Manga[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}

export interface NewsResponse {
    data: AnimeNews[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}

export interface Manga {
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
    synopsis: string;
    score: number;
    scored_by: number;
    chapters: number;
    volumes: number;
    status: string;
    genres: {
        mal_id: number;
        type: string;
        name: string;
    }[];
    authors: {
        mal_id: number;
        type: string;
        name: string;
    }[];
    rank: number;
    popularity: number;
    members: number;
    favorites: number;
}

export interface AnimeNews {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    forum_url: string;
    images: {
        jpg: {
            image_url: string;
        };
    };
    comments: number;
    excerpt: string;
}

export type AnimeEpisode = {
    mal_id: number;
    url: string;
    title: string;
    title_japanese: string;
    title_romanji: string;
    aired: string;
    score: number | null;
    filler: boolean;
    recap: boolean;
    forum_url: string;
};

export type AnimeEpisodeResponse = {
    data: AnimeEpisode[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}