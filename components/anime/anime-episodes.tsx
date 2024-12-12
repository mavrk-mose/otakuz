"use client";

import {useAnimeEpisodes} from '@/lib/queries';
import {AnimeEpisode} from "@/types/anime";
import {useInView} from 'react-intersection-observer';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useEffect, useRef} from "react";
import AnimeEpisodeCard from "@/components/anime/anime-episode-card";
import {Loader} from "lucide-react";

export default function AnimeEpisodes({id}: {id: string}) {
    const {data, isLoading, fetchNextPage, hasNextPage} = useAnimeEpisodes(id);

    const {ref, inView} = useInView();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const handleScroll = () => {
        if (scrollAreaRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 50 && hasNextPage) {
                fetchNextPage();
            }
        }
    };

    if (isLoading) {
        return <Loader className="mx-auto my-4"/>;
    }

    return (
        <ScrollArea 
            ref={scrollAreaRef} 
            onScroll={handleScroll} 
            className="w-full overflow-x-auto">
            <div className="flex gap-4 p-4">
                {data?.pages.map((page) =>
                    page?.data.map((episode: AnimeEpisode) => (
                        <div key={episode?.mal_id} className="flex-shrink-0">
                            <AnimeEpisodeCard {...{episode}}/>
                        </div>)
                    ))}
            </div>

            {hasNextPage && (
                <div ref={ref} className="text-center py-4">Loading...</div>
            )}
        </ScrollArea>
    );
}