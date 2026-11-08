"use client";

import { Suspense } from "react";
import { MediaCardSkeleton } from "@/components/media-card";

import { motion } from 'framer-motion';
import {MangaGenres} from "@/components/manga/manga-genres";
import { useGenreFilter } from "@/hooks/use-genre-filter";
import MangaCollection from "@/components/manga/manga-collection";
import FilteredManga from "@/components/manga/filtered-manga";
import { useI18n } from "@/components/i18n-provider";

function MangaListPageContent() {
    const { genre: mangaGenre } = useGenreFilter();
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
                <MangaGenres />
            </div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{t("manga.collection")}</h1>
                <p className="text-muted-foreground">
                    {t("manga.collectionDescription")}
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

export default function MangaListPage() {
    return <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"><MediaCardSkeleton count={8} /></div>}><MangaListPageContent /></Suspense>;
}
