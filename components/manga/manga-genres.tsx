"use client"

import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {motion} from 'framer-motion';
import {Genre} from "@/types/anime";
import useMangaGenres from "@/hooks/manga/use-manga-genres";
import {useGenreStore} from "@/store/use-genre-store";
import {isEqual} from "@/lib/utils";

export function MangaGenres() {
    const {genres, isLoadingGenres} = useMangaGenres();
    const {mangaGenre, setMangaGenre} = useGenreStore();

    const handleGenreClick = (genre: Genre) => {
        setMangaGenre(genre.mal_id.toString());
    };

    if (isLoadingGenres) {
        return (
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 p-4">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-muted"/>
                            <div className="w-16 h-4 mt-2 rounded bg-muted"/>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal"/>
            </ScrollArea>
        );
    }

    return (
        <>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 p-4">
                    {genres?.map((genre: Genre) => (
                        <motion.button
                            key={genre.mal_id}
                            className="flex flex-col items-center"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => handleGenreClick(genre)}
                        >
                            <Avatar className={`w-16 h-16 border-2 ${isEqual(genre.mal_id.toString(), mangaGenre) ? 'border-primary' : 'border-transparent'} transition-colors duration-200`}>
                                <AvatarFallback className={`${isEqual(genre.mal_id.toString(), mangaGenre) ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} text-xs transition-colors duration-200`}>
                                    {genre.name.split(' ').map((word: string) => word[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm mt-2 text-muted-foreground">{genre.name}</span>
                        </motion.button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal"/>
            </ScrollArea>
        </>
    );
}