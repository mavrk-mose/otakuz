
export interface Manga {
    mal_id: number;
    title: string;
    title_japanese: string | null;
    type: string;
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
    synopsis: string | null;
    score: number | null;
    scored_by: number | null;
    chapters: number | null;
    volumes: number | null;
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
    rank: number | null;
    popularity: number | null;
    members: number | null;
    favorites: number | null;
}

export interface MangaResponse {
    data: Manga[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}
