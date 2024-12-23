"use client"

import {AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { GenreStories } from "@/components/anime/genre-stories";
import AnimeCollection from "@/components/anime/anime-collection";
import FilteredAnime from "@/components/anime/filtered-anime";

export default function AnimeListPage() {
    const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);

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
                <GenreStories onGenreSelect={setSelectedGenre} />
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Anime Collection</h1>
                <p className="text-muted-foreground">
                    Discover and explore your next favorite anime series
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                <AnimatePresence initial={false}>
                    {selectedGenre ?
                        (<FilteredAnime selectedGenre={selectedGenre}/>) : (<AnimeCollection/>)}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}