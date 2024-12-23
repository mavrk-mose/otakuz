"use client"

import {useEffect, useState} from 'react'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Card} from '@/components/ui/card'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {useRecentAnime} from '@/hooks/anime/use-recent-anime'
import {useAnimeVideos} from '@/hooks/anime/use-anime-videos'
import {useInView} from 'react-intersection-observer'
import WatchSkeleton from '@/components/skeletons/WatchSkeleton'
import Image from 'next/image'
import RecentAnime from '@/components/anime/recent-anime'
import {AnimeEntry} from '@/types/anime'
import {VideoPlayer} from "@/components/watch/video-player"
import VideoTabs from "@/components/watch/video-tabs"
import {Loader2} from 'lucide-react'
import Link from "next/link"
import {useWatchStore} from "@/store/use-watch-store"

export default function WatchPage() {
    const {selectedAnime, setSelectedAnime} = useWatchStore()
    const {ref, inView} = useInView()
    const {data, isLoading, fetchNextPage, hasNextPage} = useRecentAnime()
    const {data: animeVideos, isLoading: isLoadingVideos} = useAnimeVideos(selectedAnime?.mal_id.toString() ?? '')
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('')

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, fetchNextPage])

    useEffect(() => {
        // Set default selected anime if none exists
        if (!selectedAnime && data?.pages[0]?.data[0]?.entry[0]) {
            setSelectedAnime(data.pages[0].data[0].entry[0]);
        }
    }, [data, selectedAnime, setSelectedAnime]);

    useEffect(() => {
        if (animeVideos?.promo[0]?.trailer.embed_url) {
            setSelectedVideoUrl(animeVideos.promo[0].trailer.embed_url);
        } else if (!selectedVideoUrl && data?.pages[0]?.data[0]?.entry[0]?.url) {
            // Set default video URL if no trailer is available
            setSelectedVideoUrl(data.pages[0].data[0].entry[0].url);
        }
    }, [animeVideos, data, selectedVideoUrl]);

    if (isLoading) {
        return <WatchSkeleton/>
    }

    const handleVideoSelect = (url: string) => {
        setSelectedVideoUrl(url)
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
                                    setSelectedVideo={setSelectedAnime}
                                />
                            ))
                        )}
                    </div>
                    <div ref={ref}/>
                    {hasNextPage &&
                        Array(4)
                            .fill(null)
                            .map((_, index) => (
                                <Card key={`next-page-loading-${index}`} className="animate-pulse m-4">
                                    <div className="aspect-[2/3] bg-muted"/>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4"/>
                                        <div className="h-4 bg-muted rounded w-1/2"/>
                                    </div>
                                </Card>
                            ))}
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {/* Anime Player */}
                    <div className="w-full bg-black">
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
                    <VideoTabs animeVideos={animeVideos} onVideoSelect={handleVideoSelect}/>

                    {/* Recommended Anime List */}
                    <div>
                        <h2 className="text-xl font-bold mb-2 ml-4">More like this </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                            {data?.pages.flatMap(page =>
                                page.data.flatMap((animeData: any) =>
                                    animeData.entry.map((anime: AnimeEntry) => (
                                        <Card
                                            key={`${animeData.content}-${anime.mal_id}`}
                                            className="bg-[#26262C] overflow-hidden cursor-pointer"
                                            onClick={() => setSelectedAnime(anime)}
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
                                                <p className="text-xs text-[#ADADB8]">MyAnimeList ID: {anime.mal_id}</p>
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

