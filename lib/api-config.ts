export const API_BASE_URL = "/api/jikan";
export type MediaType = "anime" | "manga";
export interface GenreItem {
  mal_id: number;
  name: string;
  url?: string;
  count?: number;
}
