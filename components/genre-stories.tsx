"use client"

import { useQuery } from '@tanstack/react-query';
import { getAnimeByGenre } from '@/lib/api';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import useAnimeGenres from "@/hooks/anime/use-anime-genres";

interface Genre {
    mal_id: number;
    name: string;
}

export function GenreStories() {
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

    const { genres, isLoadingGenres } = useAnimeGenres();

    const { data: animeList, isLoading: isLoadingAnime } = useQuery({
        queryKey: ['animeByGenre', selectedGenre?.mal_id],
        queryFn: () => selectedGenre ? getAnimeByGenre(selectedGenre.mal_id.toString()) : null,
        enabled: !!selectedGenre,
    });

    if (isLoadingGenres) {
        return (
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 p-4">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-muted" />
                            <div className="w-16 h-4 mt-2 rounded bg-muted" />
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
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
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedGenre(genre)}
                        >
                            <Avatar className="w-16 h-16 border-2 border-primary">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {genre.name.split(' ').map((word: string) => word[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm mt-2 text-muted-foreground">
                {genre.name}
              </span>
                        </motion.button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <Dialog open={!!selectedGenre} onOpenChange={() => setSelectedGenre(null)}>
                <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                    {selectedGenre && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedGenre.name} Anime</h2>
                                <p className="text-muted-foreground">
                                    Popular anime in the {selectedGenre.name} genre
                                </p>
                            </div>

                            {isLoadingAnime ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <Card key={i} className="animate-pulse">
                                            <div className="aspect-[2/3] bg-muted" />
                                            <div className="p-4 space-y-2">
                                                <div className="h-4 bg-muted rounded w-3/4" />
                                                <div className="h-4 bg-muted rounded w-1/2" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {animeList?.slice(0, 6).map((anime: any) => (
                                        <Link
                                            key={anime.mal_id}
                                            href={`/anime/${anime.mal_id}`}
                                            className="block group"
                                        >
                                            <Card className="overflow-hidden">
                                                <div className="relative aspect-[2/3]">
                                                    <Image
                                                        src={anime.images.jpg.large_image_url}
                                                        alt={anime.title}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                                        {anime.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="secondary">
                                                            Score: {anime.score}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {anime.episodes} EP
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}