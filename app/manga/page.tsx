"use client"

import { motion } from 'framer-motion';
import {MangaGenres} from "@/components/manga/manga-genres";
import {useGenreStore} from "@/store/use-genre-store";
import MangaCollection from "@/components/manga/manga-collection";
import FilteredManga from "@/components/manga/filtered-manga";

export default function MangaListPage() {
    const { mangaGenre } = useGenreStore();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <MangaGenres />
            </div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Manga Collection</h1>
                <p className="text-muted-foreground">
                    Explore our extensive collection of manga series
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                {mangaGenre ? <FilteredManga/> : <MangaCollection />}
            </motion.div>
        </div>
    );
}