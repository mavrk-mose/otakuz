"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

export default function AnimeListPage() {
    const { ref, inView } = useInView();

    const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['animeList'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${pageParam}`);
            if (!response.ok) throw new Error('Failed to fetch anime');
            return response.json();
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.has_next_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="container mx-auto px-4 py-8">
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
                {isLoading && (
                    Array(25).fill(null).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <div className="aspect-[2/3] bg-muted"/>
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"/>
                                <div className="h-4 bg-muted rounded w-1/2"/>
                            </div>
                        </Card>
                    ))
                )}
                {data?.pages.map((page) =>
                    page.data.map((anime: any) => (
                        <motion.div
                            key={anime.mal_id}
                            variants={item}
                        >
                            <Card className="overflow-hidden group">
                                <div className="relative aspect-[2/3]">
                                    <Link href={`/anime/${anime.mal_id}`}>
                                        <Image
                                            src={anime.images.jpg.large_image_url}
                                            alt={anime.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                    </Link>
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <Button className="w-full gap-2" asChild>
                                                <Link href={`/watch/${anime.mal_id}`}>
                                                    <Play className="h-4 w-4"/>
                                                    Watch Now
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current"/>
                                        <span className="text-sm font-medium">{anime.score}</span>
                                        <Badge variant="secondary" className="ml-auto">
                                            {anime.episodes} EP
                                        </Badge>
                                    </div>
                                    <Link
                                        href={`/anime/${anime.mal_id}`}
                                        className="font-semibold hover:text-primary transition-colors line-clamp-1"
                                    >
                                        {anime.title}
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {anime.synopsis}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
                <div ref={ref}/>
                {hasNextPage &&
                    Array(25)
                        .fill(null)
                        .map((_, index) => (
                            <Card key={`next-page-loading-${index}`} className="animate-pulse">
                                <div className="aspect-[2/3] bg-muted"/>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"/>
                                    <div className="h-4 bg-muted rounded w-1/2"/>
                                </div>
                            </Card>
                        ))}
            </motion.div>
        </div>
    );
}