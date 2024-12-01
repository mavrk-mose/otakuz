"use client"

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export function GallerySection() {
    const { ref, inView } = useInView();
    const [images, setImages] = useState<any[]>([]);

    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['galleryImages'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`https://api.jikan.moe/v4/anime/1/pictures?page=${pageParam}`);
            if (!response.ok) throw new Error('Failed to fetch gallery images');
            const data = await response.json();
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.has_next_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
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
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Gallery</h2>
                    <p className="text-muted-foreground">Stunning anime artwork</p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/gallery" className="gap-2">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
                {data?.pages.map((page) =>
                    page.data.slice(0, 8).map((image: any, index: number) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="relative aspect-square group"
                        >
                            <Card className="overflow-hidden w-full h-full">
                                <Image
                                    src={image.jpg.large_image_url}
                                    alt="Anime artwork"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                />
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>

            <div ref={ref} className="flex justify-center">
                {hasNextPage && (
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                )}
            </div>
        </section>
    );
}