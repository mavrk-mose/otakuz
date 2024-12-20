"use client"

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play } from 'lucide-react'
import { useRecentAnime } from '@/hooks/anime/use-recent-anime'
import { useInView } from 'react-intersection-observer'
import WatchSkeleton from '@/components/skeletons/WatchSkeleton'
import Image from 'next/image'
import RecentAnime from '@/components/anime/recent-anime'
import { AnimeEntry } from '@/types/anime'
import { useAnimeVideos } from '@/hooks/anime/use-anime-videos'
import { VideoPlayer } from '@/components/watch/video-player'

export default function WatchPage() {
  const [selectedAnime, setSelectedAnime] = useState<AnimeEntry | null>(null)
  const { ref, inView } = useInView();
  const { data, isLoading, fetchNextPage, hasNextPage } = useRecentAnime();
  const { data: animeVideos, isLoading: isLoadingVideos } = useAnimeVideos(selectedAnime?.mal_id.toString() ?? '');

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (data?.pages[0]?.data[0]?.entry[0]) {
      setSelectedAnime(data.pages[0].data[0].entry[0]);
    }
  }, [data]);

  if (isLoading) {
    return <WatchSkeleton />
  }

  return (
    <div className="flex h-screen bg-[#0E0E10] text-white overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#1F1F23] overflow-hidden flex flex-col">
        <h2 className="text-sm font-semibold p-4 text-[#EFEFF1]">RECENT ANIME</h2>
        <ScrollArea className="flex-grow">
          <div className="space-y-2 p-4">
            {data?.pages.map((page, pageIndex) =>
              page.data.map((animeData: any) => (
                <RecentAnime
                  key={`${pageIndex}-${animeData.content}`}
                  animeData={animeData}
                  setSelectedVideo={setSelectedAnime}
                />
              ))
            )}
          </div>
          <div ref={ref} />
          {hasNextPage &&
            Array(4)
              .fill(null)
              .map((_, index) => (
                <Card key={`next-page-loading-${index}`} className="animate-pulse m-4">
                  <div className="aspect-[2/3] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </Card>
              ))}
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow">
          {/* Anime Player */}
          <div className="w-full bg-black">
            <div className="aspect-video">
              {selectedAnime && animeVideos ? (
                <VideoPlayer videoUrl={animeVideos?.data.promo[0]?.trailer.embed_url || ''} />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={`https://avatar.vercel.sh/default`}
                    alt="No anime selected"
                    layout="fill"
                    objectFit="cover"
                  />
                  <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white opacity-50" />
                </div>
              )}
            </div>
          </div>

          {/* Anime Info */}
          {selectedAnime && (
            <div className="p-4 bg-[#18181B]">
              <h1 className="text-xl font-bold mb-2">{selectedAnime.title}</h1>
              <div className="flex items-center space-x-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedAnime.images.jpg.small_image_url} />
                  <AvatarFallback>{selectedAnime.title[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedAnime.title}</p>
                  <p className="text-sm text-[#ADADB8]">
                    <a href={selectedAnime.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      View on MyAnimeList
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video Sections */}
          {animeVideos && (
            <div className="p-4 space-y-6">
              {/* Promo Videos */}
              <section>
                <h2 className="text-lg font-semibold mb-2">Promo Videos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {animeVideos.data.promo.map((promo, index) => (
                    <Card key={index} className="bg-[#26262C] overflow-hidden cursor-pointer">
                      <div className="relative aspect-video">
                        <Image
                          src={promo.trailer.images.maximum_image_url}
                          alt={promo.title}
                          layout="fill"
                          objectFit="cover"
                        />
                        <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-75" />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm line-clamp-2">{promo.title}</h3>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Episodes */}
              <section>
                <h2 className="text-lg font-semibold mb-2">Episodes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {animeVideos.data.episodes.map((episode) => (
                    <Card key={episode.mal_id} className="bg-[#26262C] overflow-hidden cursor-pointer">
                      <div className="relative aspect-video">
                        <Image
                          src={episode.images.jpg.image_url}
                          alt={episode.title}
                          layout="fill"
                          objectFit="cover"
                        />
                        <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-75" />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm line-clamp-2">{episode.title}</h3>
                        <p className="text-xs text-[#ADADB8]">Episode {episode.episode}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Music Videos */}
              <section>
                <h2 className="text-lg font-semibold mb-2">Music Videos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {animeVideos.data.music_videos.map((mv, index) => (
                    <Card key={index} className="bg-[#26262C] overflow-hidden cursor-pointer">
                      <div className="relative aspect-video">
                        <Image
                          src={mv.video.images.maximum_image_url}
                          alt={mv.title}
                          layout="fill"
                          objectFit="cover"
                        />
                        <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-75" />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm line-clamp-2">{mv.title}</h3>
                        <p className="text-xs text-[#ADADB8]">{mv.meta.author}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Recommended Anime List */}
          <div className="grid grid-cols-3 gap-4 p-4">
            {data?.pages.flatMap(page => 
              page.data.flatMap((animeData: any) => 
                animeData.entry.map((anime: AnimeEntry) => (
                  <Card
                    key={anime.mal_id}
                    className="bg-[#26262C] overflow-hidden cursor-pointer"
                    onClick={() => setSelectedAnime(anime)}
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-sm line-clamp-2">{anime.title}</h3>
                      <p className="text-xs text-[#ADADB8]">MyAnimeList ID: {anime.mal_id}</p>
                    </div>
                  </Card>
                ))
              )
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
