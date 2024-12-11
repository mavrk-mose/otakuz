"use client";

import {useAnimeEpisodes} from '@/lib/queries';
import {AnimeEpisode} from "@/types/anime";
import {useInView} from 'react-intersection-observer';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useEffect} from "react";
import AnimeEpisodeCard from "@/components/anime/anime-episode-card";
import {Loader} from "lucide-react";
import {Card} from "@/components/ui/card";

export default function AnimeEpisodes({id}: { id: string }) {
    const {data, isLoading, fetchNextPage, hasNextPage} = useAnimeEpisodes(id);

    const {ref, inView} = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (isLoading) {
        return <Loader/>;
    }
    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div  className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data?.pages.map((page) =>
                    page?.data.map((episode: AnimeEpisode) => (
                        <div key={episode?.mal_id} className="grid gap-4">
                            <AnimeEpisodeCard {...{episode}}/>
                        </div>)
                    ))}
            </div>

            <div ref={ref} />

            {hasNextPage && (<div>Loading...</div>)}
        </ScrollArea>
    )
}