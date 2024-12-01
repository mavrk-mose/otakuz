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
          <div className="text-center">Loading...</div>
        </div>
      }>
        <WatchPageClient id={params.id} />
      </Suspense>
  );
}