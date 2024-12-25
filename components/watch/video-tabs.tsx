"use client"

import { useState } from "react"
import Image from "next/image"
import { MessageCircle, Play, Users } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AnimeVideos } from "@/types/anime"
import { CommentSection } from "@/components/comment-section"
import { WatchPartySection } from "@/components/watch/watch-party-section"

interface Props {
    animeVideos: AnimeVideos | undefined
    onVideoSelect: (url: string) => void
    selectedVideoUrl: string
}

export default function VideoTabs({ animeVideos, onVideoSelect, selectedVideoUrl }: Props) {
    const [activeTab, setActiveTab] = useState("promo")

    if (!animeVideos) {
        return <div>No videos available</div>
    }

    const handleVideoClick = (url: string) => {
        onVideoSelect(url)
    }

    return (
        <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <ScrollArea className="w-full">
                    <TabsList className="mb-4 inline-flex w-max">
                        <TabsTrigger value="promo">Promo Videos</TabsTrigger>
                        <TabsTrigger value="episodes">Episodes</TabsTrigger>
                        <TabsTrigger value="music">Music Videos</TabsTrigger>
                        <TabsTrigger value="party" className="flex-1">
                            <Users className="w-4 h-4 mr-2" />
                            Party
                        </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent value="promo">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                            {animeVideos?.promo.map((promo, index) => (
                                <Card
                                    key={`promo-${index}-${promo.title}`}
                                    className={`w-[300px] bg-[#26262C] overflow-hidden cursor-pointer flex-shrink-0 ${selectedVideoUrl === promo.trailer.embed_url ? 'ring-2 ring-primary' : ''}`}
                                    onClick={() => handleVideoClick(promo.trailer.embed_url)}
                                >
                                    <div className="relative aspect-video">
                                        <Image
                                            src={promo.trailer.images.maximum_image_url}
                                            alt={promo.title}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                        <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-75" />
                                    </div>
                                    <div className="p-2">
                                        <h3 className="font-medium text-sm line-clamp-2">{promo.title}</h3>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="episodes">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                            {animeVideos?.episodes.map((episode) => (
                                <Card
                                    key={episode.mal_id}
                                    className={`w-[300px] bg-[#26262C] overflow-hidden cursor-pointer flex-shrink-0 ${selectedVideoUrl === episode.url ? 'ring-2 ring-primary' : ''}`}
                                    onClick={() => handleVideoClick(episode.url)}
                                >
                                    <div className="relative aspect-video">
                                        <Image
                                            src={episode.images.jpg.image_url}
                                            alt={episode.title}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                        <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-75" />
                                    </div>
                                    <div className="p-2">
                                        <h3 className="font-medium text-sm line-clamp-2">{episode.title}</h3>
                                        <p className="text-xs text-[#ADADB8]">{episode.episode}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="music">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                            {animeVideos?.music_videos.map((mv, index) => (
                                <Card
                                    key={`music-${index}-${mv.title}`}
                                    className={`w-[300px] bg-[#26262C] overflow-hidden cursor-pointer flex-shrink-0 ${selectedVideoUrl === mv.video.embed_url ? 'ring-2 ring-primary' : ''}`}
                                    onClick={() => handleVideoClick(mv.video.embed_url)}
                                >
                                    <div className="relative aspect-video">
                                        <Image
                                            src={mv.video.images.maximum_image_url}
                                            alt={mv.title}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                        <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-75" />
                                    </div>
                                    <div className="p-2">
                                        <h3 className="font-medium text-sm line-clamp-2">{mv.title}</h3>
                                        <p className="text-xs text-[#ADADB8]">{mv.meta.author}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="party" className="p-4">
                    <WatchPartySection />
                </TabsContent>
            </Tabs>
        </div>
    )
}