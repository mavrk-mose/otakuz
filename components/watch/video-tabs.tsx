"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {AnimeVideos} from "@/types/anime";

interface Props {
    animeVideos: AnimeVideos | undefined
}
export default function VideoTabs({animeVideos}: Props) {
    const [activeTab, setActiveTab] = useState("promo")

    if (!animeVideos) {
        return <div>No videos available</div>
    }

    return (
        <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="promo">Promo Videos</TabsTrigger>
                    <TabsTrigger value="episodes">Episodes</TabsTrigger>
                    <TabsTrigger value="music">Music Videos</TabsTrigger>
                </TabsList>

                <TabsContent value="promo">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                            {animeVideos?.promo.map((promo, index) => (
                                <Card key={`promo-${index}-${promo.title}`} className="w-[300px] bg-[#26262C] overflow-hidden cursor-pointer flex-shrink-0">
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
                                <Card key={episode.mal_id} className="w-[300px] bg-[#26262C] overflow-hidden cursor-pointer flex-shrink-0">
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
                                        <p className="text-xs text-[#ADADB8]">Episode {episode.episode}</p>
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
                                <Card key={`music-${index}-${mv.title}`} className="w-[300px] bg-[#26262C] overflow-hidden cursor-pointer flex-shrink-0">
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
            </Tabs>
        </div>
    )
}

