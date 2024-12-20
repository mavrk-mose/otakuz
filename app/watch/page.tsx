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

interface Video {
  id: number
  title: string
  channel: string
  views: number
  thumbnail: string
}

const PLACEHOLDER_VIDEOS: Video[] = Array(20).fill(null).map((_, index) => ({
  id: index + 1,
  title: `Video ${index + 1}`,
  channel: `Channel ${index + 1}`,
  views: Math.floor(Math.random() * 1000000),
  thumbnail: `/placeholder.svg?height=90&width=160&text=Video+${index + 1}`
}))

export default function WatchPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const { ref, inView } = useInView();
  const { data, isLoading, fetchNextPage, hasNextPage } = useRecentAnime();

  console.log("recent anime: ", data)

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  useEffect(() => {
    // Set the first video as selected when the component mounts
    if (PLACEHOLDER_VIDEOS.length > 0) {
      setSelectedVideo(PLACEHOLDER_VIDEOS[0])
    }
  }, [])

  if (isLoading) {
    return (
      <WatchSkeleton />
    )
  }

  return (
    <div className="flex h-screen bg-[#0E0E10] text-white">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#1F1F23] overflow-hidden flex flex-col">
        <h2 className="text-sm font-semibold p-4 text-[#EFEFF1]">RECOMMENDED VIDEOS</h2>
        <ScrollArea className="flex-grow">
          <div className="space-y-2 p-4">
            {data?.pages.map((page, pageIndex) =>
              page.data.map((animeData: any, idx: number) => (
                <RecentAnime
                  key={`${pageIndex}-${animeData.content}`}
                  animeData={animeData}
                  setSelectedVideo={setSelectedVideo}
                />
              ))
            )}
          </div>
          <div ref={ref} />
          {hasNextPage &&
            Array(4)
              .fill(null)
              .map((_, index) => (
                <Card key={`next-page-loading-${index}`} className="animate-pulse">
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
        {/* Video Player */}
        <div className="w-full aspect-video bg-black flex items-center justify-center">
          {selectedVideo ? (
            <div className="relative w-full h-full">
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white opacity-50" />
            </div>
          ) : (
            <p>No video selected</p>
          )}
        </div>

        {/* Video Info */}
        {selectedVideo && (
          <div className="p-4 bg-[#18181B]">
            <h1 className="text-xl font-bold mb-2">{selectedVideo.title}</h1>
            <div className="flex items-center space-x-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${selectedVideo.channel[0]}`} />
                <AvatarFallback>{selectedVideo.channel[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedVideo.channel}</p>
                <p className="text-sm text-[#ADADB8]">{selectedVideo.views.toLocaleString()} views</p>
              </div>
            </div>
          </div>
        )}

        {/* Video List */}
        <ScrollArea className="flex-grow">
          <div className="grid grid-cols-3 gap-4 p-4">
            {PLACEHOLDER_VIDEOS.map((video) => (
              <Card
                key={video.id}
                className="bg-[#26262C] overflow-hidden cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                  <p className="text-xs text-[#ADADB8]">{video.channel}</p>
                  <p className="text-xs text-[#ADADB8]">{video.views.toLocaleString()} views</p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

