import { Suspense } from 'react';
import AnimeDetailClient from '@/components/anime-detail-client';
import DetailsSkeleton from "@/components/skeletons/DetailsSkeleton";

export default function AnimeDetailPage({ params }: { params: { id: string } }) {
  return (
      <Suspense fallback={
        <DetailsSkeleton />
      }>
        <AnimeDetailClient id={params.id} />
      </Suspense>
  );
}