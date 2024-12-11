"use client";

import { useAnimeEpisodes } from '@/lib/queries';
import { AnimeEpisode } from "@/types/anime";
import { useInView } from 'react-intersection-observer';
import { AnimeEpisodeCard } from './anime-episode-card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AnimeEpisodes() {
    const { data: episodes, isLoading, fetchNextPage, hasNextPage } = useAnimeEpisodes(id);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    return(
        <ScrollArea className="pr-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {episodes?.map((episode: AnimeEpisode, idx) => (
                    <div key={idx} className="grid gap-4">
                        <AnimeEpisodeCard {...{episode}}/>
                    </div>
                ))}
            </div>
            <div ref={ref}/>
                {hasNextPage &&
                    Array(25)
                        .fill(null)
                        .map((_, index) => (
                            <Card key={`next-page-loading-${index}`} className="animate-pulse">
                                <div className="aspect-[2/3] bg-muted"/>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"/>
                                    <div className="h-4 bg-muted rounded w-1/2"/>
                                </div>
                            </Card>
                        ))}
        </ScrollArea>
    )
}