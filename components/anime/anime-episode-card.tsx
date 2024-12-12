"use client"

import React from 'react'
import { AnimeEpisode } from "@/types/anime"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { format } from "date-fns"
import { PlayCircle, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface AnimeEpisodeCardProps {
    episode: AnimeEpisode
}

const AnimeEpisodeCard: React.FC<AnimeEpisodeCardProps> = ({ episode }) => {
    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex-none">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">{episode.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-1">{episode.title_japanese}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold shrink-0">
                        {episode.mal_id}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="font-semibold">
              {episode.score ?? 'N/A'}
            </span>
                    </div>
                    <div className="text-right">
            <span className="text-muted-foreground">
              {format(new Date(episode.aired), 'MMM d, yyyy')}
            </span>
                    </div>
                    <div className="col-span-2 flex justify-between text-muted-foreground">
                        <span>Filler: <span className="font-medium">{episode.filler ? 'Yes' : 'No'}</span></span>
                        <span>Recap: <span className="font-medium">{episode.recap ? 'Yes' : 'No'}</span></span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex-none pt-2">
                <Button className="w-full h-8 text-sm" asChild>
                    <a
                        href={episode.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1"
                    >
                        <PlayCircle className="w-3 h-3" />
                        Watch Episode
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default AnimeEpisodeCard

