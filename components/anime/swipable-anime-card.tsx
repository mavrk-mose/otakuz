"use client"

import React from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { BaseAnime } from '@/types/anime'

interface SwipableAnimeCardProps {
    anime: BaseAnime
    onSwipe: (direction: 'left' | 'right') => void
    index: number
    total: number
}

export function SwipableAnimeCard({ anime, onSwipe, index, total }: SwipableAnimeCardProps) {
    const controls = useAnimation()

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100
        if (info.offset.x > threshold) {
            await controls.start({
                x: '200%',
                opacity: 0,
                rotate: 45
            })
            onSwipe('right')
        } else if (info.offset.x < -threshold) {
            await controls.start({
                x: '-200%',
                opacity: 0,
                rotate: -45
            })
            onSwipe('left')
        } else {
            controls.start({
                x: 0,
                opacity: 1,
                rotate: index === 1 ? -6 : index === 2 ? 6 : 0
            })
        }
    }

    // Calculate card position and scale based on index
    const cardVariants = {
        initial: {
            scale: 1 - index * 0.05,
            y: index * 15,
            rotate: index === 1 ? -6 : index === 2 ? 6 : 0,
            opacity: 1 - index * 0.2,
            zIndex: total - index,
        },
        animate: {
            scale: 1 - index * 0.05,
            y: index * 15,
            rotate: index === 1 ? -6 : index === 2 ? 6 : 0,
            opacity: 1 - index * 0.2,
            zIndex: total - index,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            x: 0,
            opacity: 0,
            transition: { duration: 0.2 }
        },
        drag: {
            cursor: 'grabbing'
        }
    }

    return (
        <motion.div
            drag={index === 0 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            variants={cardVariants}
            initial="initial"
            exit="exit"
            whileDrag="drag"
            className="absolute w-full h-full"
            style={{
                transformOrigin: 'bottom center',
                cursor: index === 0 ? 'grab' : 'default',
                filter: `brightness(${1 - index * 0.15})`
            }}
        >
            <Card className="w-full h-full overflow-hidden bg-card">
                <div className="relative w-full h-full">
                    <Image
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        layout="fill"
                        objectFit="cover"
                        priority={index === 0}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4">{anime.title}</h2>
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                            <div className="flex items-center">
                                <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 mr-1" />
                                <span className="text-white font-semibold text-lg md:text-xl">{anime.score?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <span className="text-white text-lg md:text-xl">{anime.episodes || 'Unknown'} episodes</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {anime.genres.map((genre) => (
                                <Badge key={genre.mal_id} variant="secondary" className="text-sm md:text-base">
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}