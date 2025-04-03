"use client" 
import React, { useState, useEffect } from 'react' 
import { SwipableAnimeCard } from '@/components/anime/swipable-anime-card' 
import { Button } from '@/components/ui/button' 
import { ThumbsUp, ThumbsDown } from 'lucide-react' 
import { AnimatePresence, motion } from 'framer-motion' 
import useFetchAnime from "@/hooks/anime/use-fetch-anime" 
import { DiscoverSkeleton } from '@/components/skeletons/discover-skeleton'

const VISIBLE_CARDS = 3 // Reduced to show only 3 cards 
const FETCH_THRESHOLD = 20 // Fetch more when 20 cards remaining 
const MIN_CARDS_BUFFER = 10 // Minimum number of cards to keep in buffer

export default function DiscoverPage() { 
const [currentIndex, setCurrentIndex] = useState(0); 
const [activeCards, setActiveCards] = useState(VISIBLE_CARDS);
const { data, isLoading, fetchNextPage, hasNextPage } = useFetchAnime(); 
const animeList = data?.pages.flatMap((page) => page.data) ?? []

const handleSwipe = (direction: 'left' | 'right') => {
        setActiveCards(prev => Math.max(0, prev - 1))
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1)
            setActiveCards(VISIBLE_CARDS)
        }, 300) // Delay to allow smooth animation transition
    }
// Fetch more data when approaching threshold
useEffect(() => {
    const remainingCards = animeList.length - currentIndex
    if (remainingCards <= FETCH_THRESHOLD && hasNextPage) {
        fetchNextPage()
    }
}, [currentIndex, animeList.length, hasNextPage, fetchNextPage])

// Reset currentIndex if we somehow get to the end
useEffect(() => {
    if (currentIndex >= animeList.length - MIN_CARDS_BUFFER) {
        setCurrentIndex(Math.max(0, animeList.length - MIN_CARDS_BUFFER))
    }
}, [currentIndex, animeList.length])

const handleButtonClick = (direction: 'left' | 'right') => {
    handleSwipe(direction)
}

if (isLoading) {
    return <DiscoverSkeleton />
}

// Show loading state if we don't have enough cards
if (animeList.length - currentIndex < VISIBLE_CARDS) {
    return <DiscoverSkeleton />
}

// Only show VISIBLE_CARDS (3) at a time
const visibleAnime = animeList.slice(currentIndex, currentIndex + VISIBLE_CARDS)

return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 md:mb-12">
            Discover Anime
        </h1>

        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-[3/4] relative perspective-1000">
            <AnimatePresence>
                {visibleAnime.map((anime, index) => (
                    <motion.div
                        key={`${anime.mal_id}-${currentIndex + index}`}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute w-full h-full ${index >= activeCards ? 'hidden' : ''}"
                    >
                        <SwipableAnimeCard
                            anime={anime}
                            onSwipe={handleSwipe}
                            index={index}
                            total={VISIBLE_CARDS}
                        />
                    </motion.div>
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
                <ThumbsDown className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                Nope
            </Button>
            <Button
                size="lg"
                variant="default"
                onClick={() => handleButtonClick('right')}
                className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4"
            >
                <ThumbsUp className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                Like
            </Button>
        </div>
    </div>
)

}

