"use client"

import { AnimeEpisode } from "@/types/anime"
import { useInView } from 'react-intersection-observer'
import React, { useEffect, useMemo } from "react"
import AnimeEpisodeCard from "@/components/anime/anime-episode-card"
import { Loader } from 'lucide-react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {useAnimeEpisodes} from "@/hooks/anime/use-anime-episodes";

export default function AnimeEpisodes({ id }: { id: string }) {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useAnimeEpisodes(id)
    const { ref: inViewRef, inView } = useInView({
        threshold: 0.1,
    })

    const episodes = useMemo(() => {
        const episodesById = new Map<number, AnimeEpisode>()

        data?.pages.forEach((page) => {
            page.data.forEach((episode) => {
                episodesById.set(episode.mal_id, episode)
            })
        })

        return Array.from(episodesById.values())
    }, [data])

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            void fetchNextPage()
        }
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage])

    if (isLoading) {
        return (
            <div className="w-full min-w-0 max-w-full space-y-4">
                <ScrollArea className="w-full min-w-0 max-w-full">
                    <div className="flex w-max gap-4 p-4">
                        {Array(4).fill(null).map((_, index) => (
                            <div key={`loading-${index}`} className="w-[270px] sm:w-[320px] shrink-0">
                                <Card className="w-full h-full flex flex-col animate-pulse motion-reduce:animate-none">
                                    <CardHeader className="flex-none">
                                        <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                                        <div className="h-5 bg-muted rounded w-1/2" />
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-5 bg-muted rounded w-3/4" />
                                            <div className="h-5 bg-muted rounded w-full" />
                                            <div className="col-span-2 h-5 bg-muted rounded w-full" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-none pt-2">
                                        <div className="h-8 bg-muted rounded w-full" />
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
        <ScrollArea className="w-full min-w-0 max-w-full">
            <div className="flex w-max gap-4 p-4">
                {episodes.map((episode, episodeIndex) => (
                    <motion.div
                        key={episode.mal_id}
                        className="w-[270px] sm:w-[320px] shrink-0"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        ref={episodeIndex === episodes.length - 1 ? inViewRef : null}
                    >
                        <AnimeEpisodeCard episode={episode} />
                    </motion.div>
                ))}
                {(isFetchingNextPage || hasNextPage) && (
                    <div className="flex items-center justify-center w-[350px] shrink-0">
                        <Loader className="animate-spin" />
                    </div>
                )}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
