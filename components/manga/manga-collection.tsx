"use client"

import {Card} from "@/components/ui/card";
import {motion} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {BookOpen, Star} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {useInView} from "react-intersection-observer";
import useFetchManga from "@/hooks/manga/use-fetch-manga";
import {useEffect} from "react";

export default function MangaCollection() {
    const {ref, inView} = useInView();

    const {data, isLoading, fetchNextPage, hasNextPage} = useFetchManga()

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);


    const item = {
        hidden: {opacity: 0, y: 20},
        show: {opacity: 1, y: 0}
    };

    const mangaList = data?.pages.flatMap((page) => page.data) ?? []

    return (
        <>
            {isLoading && (
                Array(4).fill(null).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <div className="aspect-[2/3] bg-muted"/>
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"/>
                            <div className="h-4 bg-muted rounded w-1/2"/>
                        </div>
                    </Card>
                ))
            )}
            {mangaList.map((manga: any) => (
                <motion.div
                    key={manga.mal_id}
                    variants={item}
                >
                    <Card className="overflow-hidden group">
                        <div className="relative aspect-[2/3]">
                            <Link href={`/manga/${manga.mal_id}`}>
                                <Image
                                    src={manga.images.jpg.large_image_url}
                                    alt={manga.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            </Link>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-4 left-4 right-4">
                                    <Button className="w-full gap-2" asChild>
                                        <Link href={`/manga/${manga.mal_id}`}>
                                            <BookOpen className="h-4 w-4"/>
                                            Read Now
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current"/>
                                <span className="text-sm font-medium">{manga.score}</span>
                                <Badge variant="secondary" className="ml-auto">
                                    {manga.chapters || 'Ongoing'} CH
                                </Badge>
                            </div>
                            <Link
                                href={`/manga/${manga.mal_id}`}
                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                            >
                                {manga.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {manga.synopsis}
                            </p>
                        </div>
                    </Card>
                </motion.div>
            ))}
            <div ref={ref}/>
            {hasNextPage &&
                Array(8)
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
        </>
    )
}