"use client"

import { AnimeEpisode } from "@/types/anime"
import { useInView } from 'react-intersection-observer'
import React, { useEffect, useState } from "react"
import AnimeEpisodeCard from "@/components/anime/anime-episode-card"
import { Loader } from 'lucide-react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {useAnimeEpisodes} from "@/hooks/anime/use-anime-episodes";

export default function AnimeEpisodes({ id }: { id: string }) {
    const { data, isLoading, fetchNextPage, hasNextPage } = useAnimeEpisodes(id)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const { ref: inViewRef, inView } = useInView({
        threshold: 0.1,
    })

    useEffect(() => {
        if (inView && hasNextPage && !isLoadingMore) {
            setIsLoadingMore(true)
            fetchNextPage().finally(() => setIsLoadingMore(false))
        }
    }, [inView, hasNextPage, fetchNextPage, isLoadingMore])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 p-4">
                        {Array(4).fill(null).map((_, index) => (
                            <div key={`loading-${index}`} className="w-[350px] shrink-0">
                                <Card className="w-full h-full flex flex-col animate-pulse">
                                    <CardHeader className="flex-none">
                                        <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-muted rounded w-1/4" />
                                            <div className="h-4 bg-muted rounded w-1/3" />
                                            <div className="h-4 bg-muted rounded w-1/2" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-none pt-4">
                                        <div className="h-10 bg-muted rounded w-full" />
                                    </CardFooter>
                                </Card>
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        )
    }

    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 p-4">
                {data?.pages.map((page, pageIndex) =>
                    page?.data.map((episode: AnimeEpisode, episodeIndex: number) => (
                        <motion.div
                            key={episode?.mal_id}
                            className="w-[350px] shrink-0"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            ref={
                                pageIndex === data.pages.length - 1 &&
                                episodeIndex === page.data.length - 1
                                    ? inViewRef
                                    : null
                            }
                        >
                            <AnimeEpisodeCard episode={episode} />
                        </motion.div>
                    ))
                )}
                {(isLoadingMore || hasNextPage) && (
                    <div className="flex items-center justify-center w-[350px] shrink-0">
                        <Loader className="animate-spin" />
                    </div>
                )}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

