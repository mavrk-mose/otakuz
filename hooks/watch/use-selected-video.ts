"use client"

import { useState, useEffect } from 'react'
import { AnimeEntry, AnimeVideos } from '@/types/anime'
import { useWatchStore } from "@/store/use-watch-store"

export function useSelectedVideo(animeVideos: AnimeVideos | undefined, initialAnimeData: AnimeEntry | null) {
    const { selectedAnime, setSelectedAnime } = useWatchStore()
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('')

    useEffect(() => {
        if (!selectedAnime && initialAnimeData) {
            setSelectedAnime(initialAnimeData)
        }
    }, [initialAnimeData, selectedAnime, setSelectedAnime])

    useEffect(() => {
        if (animeVideos?.promo[0]?.trailer.embed_url && !selectedVideoUrl) {
            setSelectedVideoUrl(animeVideos.promo[0].trailer.embed_url)
        }
    }, [animeVideos, selectedVideoUrl])

    const handleVideoSelect = (url: string) => {
        setSelectedVideoUrl(url)
    }

    const handleAnimeSelect = (anime: AnimeEntry) => {
        setSelectedAnime(anime)
        setSelectedVideoUrl('')
    }

    return {
        selectedAnime,
        selectedVideoUrl,
        handleVideoSelect,
        handleAnimeSelect
    }
}

