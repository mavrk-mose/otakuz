"use client";

import { Suspense } from "react";
import { MediaCardSkeleton } from "@/components/media-card";

import { AnimatePresence, motion } from "framer-motion";
import { GenreStories } from "@/components/anime/genre-stories";
import AnimeCollection from "@/components/anime/anime-collection";
import FilteredAnime from "@/components/anime/filtered-anime";
import { useGenreFilter } from "@/hooks/use-genre-filter";
import { useI18n } from "@/components/i18n-provider";

function AnimeListPageContent() {
    const { genre: animeGenre } = useGenreFilter();
    const { t } = useI18n();

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
                <GenreStories/>
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{t("anime.collection")}</h1>
                <p className="text-muted-foreground">
                    {t("anime.collectionDescription")}
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                <AnimatePresence initial={false}>
                    {animeGenre ? <FilteredAnime/> : <AnimeCollection/>}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default function AnimeListPage() {
    return <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"><MediaCardSkeleton count={8} /></div>}><AnimeListPageContent /></Suspense>;
}
