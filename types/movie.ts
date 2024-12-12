export interface MovieResponse {
    results: Movie[];
    page: number;
    total_pages: number;
    total_results: number;

}

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
}