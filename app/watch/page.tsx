"use client"

import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useInView } from 'react-intersection-observer'
import { useRecentAnime } from '@/hooks/anime/use-recent-anime'
import { useAnimeVideos } from '@/hooks/anime/use-anime-videos'
import WatchSkeleton from '@/components/skeletons/watch-skeleton'
import Image from 'next/image'
import RecentAnime from '@/components/anime/recent-anime'
import { AnimeEntry } from '@/types/anime'
import { VideoPlayer } from "@/components/watch/video-player"
import VideoTabs from "@/components/watch/video-tabs"
import { Loader2 } from 'lucide-react'
import Link from "next/link"
import {useSelectedVideo} from "@/hooks/watch/use-selected-video";

export default function WatchPage() {
    const { ref, inView } = useInView()
    const { data, isLoading, fetchNextPage, hasNextPage } = useRecentAnime()
    const initialAnimeData = data?.pages[0]?.data[0]?.entry[0] || null
    const { selectedAnime, selectedVideoUrl, handleVideoSelect, handleAnimeSelect } = useSelectedVideo(undefined, initialAnimeData)
    const { data: animeVideos, isLoading: isLoadingVideos } = useAnimeVideos(selectedAnime?.mal_id.toString() ?? '')

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, fetchNextPage])

    if (isLoading) {
        return <WatchSkeleton />
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-[#1F1F23] overflow-hidden flex-col hidden md:flex">
                <h2 className="text-sm font-semibold p-4 text-[#EFEFF1]">RECENT ANIME</h2>
                <ScrollArea className="flex-grow">
                    <div className="space-y-2 p-4">
                        {data?.pages.map((page, pageIndex) =>
                            page.data.map((animeData: any) => (
                                <RecentAnime
                                    key={`${pageIndex}-${animeData.content}-${animeData.entry[0].mal_id}`}
                                    animeData={animeData}
                                    setSelectedVideo={handleAnimeSelect}
                                />
                            ))
                        )}
                    </div>
                    <div ref={ref} />
                    {hasNextPage &&
                        Array(4)
                            .fill(null)
                            .map((_, index) => (
                                <Card key={`next-page-loading-${index}`} className="animate-pulse m-4">
                                    <div className="aspect-[2/3] bg-muted" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </div>
                                </Card>
                            ))}
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {/* Anime Player */}
                    <div className="sm:sticky sm:top-0 sm:z-10 md:sticky md:top-0 md:z-10 lg:static w-full bg-black">
                        <div className="container mx-auto">
                            <div className="aspect-video">
                                {selectedVideoUrl ? (
                                    <VideoPlayer videoUrl={selectedVideoUrl}/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Anime Info */}
                    {selectedAnime && (
                        <div className="p-4 bg-[#18181B]">
                            <h1 className="text-xl font-bold mb-2">{selectedAnime.title}</h1>
                            <div className="flex items-center space-x-2">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={selectedAnime.images.jpg.small_image_url}/>
                                    <AvatarFallback>{selectedAnime.title[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{selectedAnime.title}</p>
                                    <p className="text-sm text-[#ADADB8]">
                                        <Link href={`/anime/${selectedAnime.mal_id}`} rel="noopener noreferrer"
                                              className="hover:underline">
                                            View details
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video Sections */}
                    <VideoTabs
                        animeVideos={animeVideos}
                        onVideoSelect={handleVideoSelect}
                        selectedVideoUrl={selectedVideoUrl}
                    />

                    {/* Recommended Anime List */}
                    <div>
                        <h2 className="text-xl font-bold mb-2 ml-4">Explore more </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                            {data?.pages.flatMap(page =>
                                page.data.flatMap((animeData: any) =>
                                    animeData.entry.map((anime: AnimeEntry) => (
                                        <Card
                                            key={`${animeData.content}-${anime.mal_id}`}
                                            className="bg-[#26262C] overflow-hidden cursor-pointer"
                                            onClick={() => handleAnimeSelect(anime)}
                                        >
                                            <div className="relative aspect-video">
                                                <Image
                                                    src={anime.images.jpg.large_image_url}
                                                    alt={anime.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                />
                                            </div>
                                            <div className="p-2">
                                                <h3 className="font-medium text-sm line-clamp-2">{anime.title}</h3>
                                                <p className="text-xs text-[#ADADB8]">MyAnimeList
                                                    ID: {anime.mal_id}</p>
                                            </div>
                                        </Card>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </main>
        </div>
    )
}