import { Suspense } from 'react';
import { TopAnimeSection } from '@/components/top-anime-section';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <TopAnimeSection />
      </Suspense>
    </div>
  );
}