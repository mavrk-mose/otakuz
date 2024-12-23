
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

export interface MangaResponse {
    data: Manga[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}
