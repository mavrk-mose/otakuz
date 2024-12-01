import {Suspense} from 'react';
import AnimeDetailClient from '@/components/anime-detail-client';
import DetailsSkeleton from "@/components/skeletons/DetailsSkeleton";
import {use} from "react";

interface Props {
    params: Promise<{ id: string }>;
}

export default function AnimeDetails(props: Props) {
    const params = use(props.params);
    return (
        <Suspense fallback={
            <DetailsSkeleton/>
        }>
            <AnimeDetailClient id={params.id}/>
        </Suspense>
    );
}