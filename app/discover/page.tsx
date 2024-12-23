"use client"

import React, { useState, useEffect } from 'react'
import { SwipableAnimeCard } from '@/components/anime/swipable-anime-card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import useFetchAnime from "@/hooks/anime/use-fetch-anime"
import { DiscoverSkeleton } from '@/components/skeletons/discover-skeleton'

const VISIBLE_CARDS = 6
const PREFETCH_THRESHOLD = 4 // Fetch more when 5 cards are left

export default function DiscoverPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const { data, isLoading, fetchNextPage, hasNextPage } = useFetchAnime()

    const animeList = data?.pages.flatMap((page) => page.data) ?? []

    const handleSwipe = (direction: 'left' | 'right') => {
        setCurrentIndex(prevIndex => prevIndex + 1)
    }

    useEffect(() => {
        // Fetch more data when approaching the end of the list
        if (animeList.length - currentIndex <= PREFETCH_THRESHOLD && hasNextPage) {
            fetchNextPage()
        }
    }, [currentIndex, animeList.length, hasNextPage, fetchNextPage])

    const handleButtonClick = (direction: 'left' | 'right') => {
        handleSwipe(direction)
    }

    if (isLoading) {
        return <DiscoverSkeleton />
    }

    // Ensure we always have enough cards to show
    if (animeList.length - currentIndex < VISIBLE_CARDS) {
        return <DiscoverSkeleton />
    }

    const visibleAnime = animeList.slice(currentIndex, currentIndex + VISIBLE_CARDS)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 md:mb-12">Discover Anime</h1>
            <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-[3/4] relative perspective-1000">
                <AnimatePresence mode="popLayout">
                    {visibleAnime.map((anime, index) => (
                        <SwipableAnimeCard
                            key={`${anime.mal_id}-${currentIndex + index}`}
                            anime={anime}
                            onSwipe={handleSwipe}
                            index={index}
                            total={VISIBLE_CARDS}
                        />
                    ))}
                </AnimatePresence>
            </div>
            <div className="flex justify-center mt-8 md:mt-12 gap-4 md:gap-6">
                <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => handleButtonClick('left')}
                    className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4"
                >
                    <ThumbsDown className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Nope
                </Button>
                <Button
                    size="lg"
                    variant="default"
                    onClick={() => handleButtonClick('right')}
                    className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4"
                >
                    <ThumbsUp className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Like
                </Button>
            </div>
        </div>
    )
}