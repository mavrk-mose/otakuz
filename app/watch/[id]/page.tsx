import {Suspense, use} from 'react';
import WatchPageClient from '@/components/watch/watch-page-client';

interface Props {
    params: Promise<{ id: string }>;
}

export default function WatchPage(props: Props) {
    const params = use(props.params);

    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    {/* Video Player Skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-video bg-muted rounded-md animate-pulse"/>
                        <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse"/>
                        <div className="h-4 bg-muted rounded-md w-full animate-pulse"/>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="h-[calc(100vh-2rem)] bg-muted rounded-md animate-pulse"/>
                </div>
            </div>
        }>
            <WatchPageClient id={params.id}/>
        </Suspense>
    );
}