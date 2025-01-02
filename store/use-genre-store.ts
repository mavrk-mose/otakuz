import {create} from "zustand";
import {persist} from "zustand/middleware";

interface GenreStore {
    animeGenre: string | undefined;
    mangaGenre: string | undefined;
    setAnimeGenre: (animeGenre: string | undefined) => void;
    setMangaGenre: (mangaGenre: string | undefined) => void;
}

export const useGenreStore = create<GenreStore>()(
    persist(
        (set) => ({
            animeGenre: undefined,
            mangaGenre: undefined,
            setAnimeGenre: (animeGenre: string | undefined) =>
                set({ animeGenre }),
            setMangaGenre: (mangaGenre: string | undefined) =>
                set({ mangaGenre }),
        }),
        {
            name: "genre-store"
        }
    )
)