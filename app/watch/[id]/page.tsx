import { Suspense } from 'react';
import WatchPageClient from '@/components/watch-page-client';

export async function generateStaticParams() {
  const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=20');
  const data = await response.json();

  return data.data.map((anime: any) => ({
    id: anime.mal_id.toString(),
  }));
}

export default function WatchPage({ params }: { params: { id: string } }) {
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