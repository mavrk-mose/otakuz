"use client"

import { useEffect, useState } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, MoreVertical, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import useFetchAnime from '@/hooks/anime/use-fetch-anime'
import WatchSkeleton from '@/components/skeletons/WatchSkeleton'
import useAnimeRecommendations from '@/hooks/anime/use-anime-recommendations'

interface Anime {
  mal_id: number
  title: string
  images: {
    webp: {
      large_image_url: string
    }
  }
  episodes: number
  score: number
  members: number
  genres: Array<{ name: string }>
}

export default function WatchPage() {
    const { recommendations, isLoading } = useAnimeRecommendations('57334');

  if(isLoading) {
    return <WatchSkeleton/>
  }

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-60 flex-shrink-0 fixed left-0 top-0 bottom-0 bg-[#1F1F23] p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-4 text-[#EFEFF1]">FOLLOWED CHANNELS</h2>
          <div className="space-y-2">
            {['Becca', 'ChocolateKieran', 'TheSushiDragon', 'mmmkhayyy', 'UnRoooolie', 'itsHafu', 'Marielitai'].map((channel, index) => (
              <div key={channel} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback>{channel[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{channel}</p>
                    <p className="text-xs text-[#ADADB8]">Anime Watching</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                  {Math.floor(Math.random() * 100)}K
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full justify-start mt-2 text-[#ADADB8] hover:text-white hover:bg-[#26262C]">
            Show more
          </Button>
          
          <h2 className="text-sm font-semibold mt-6 mb-4 text-[#EFEFF1]">RECOMMENDED CHANNELS</h2>
          <div className="space-y-2">
            {['Nikatine', 'antphrodite', 'MsAshRocks'].map((channel, index) => (
              <div key={channel} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback>{channel[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{channel}</p>
                    <p className="text-xs text-[#ADADB8]">Anime Watching</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                  {Math.floor(Math.random() * 100)}K
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full justify-start mt-2 text-[#ADADB8] hover:text-white hover:bg-[#26262C]">
            Show more
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-60">
          {/* Hero Section */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
            <img src="/placeholder.svg?height=400&width=800" alt="Hero" className="w-full h-[400px] object-cover" />
            <div className="absolute bottom-8 left-8 z-20">
              <h1 className="text-4xl font-bold mb-2">Featured Anime</h1>
              <p className="text-lg mb-4">Watch the latest and greatest anime series</p>
              <Button className="bg-[#9147FF] hover:bg-[#772CE8] text-white">
                Watch Now
              </Button>
            </div>
          </section>

          {/* Recommended Section */}
          <section className="p-6">
            <h2 className="text-xl font-bold mb-4">Recommended live channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <Card key={i} className="bg-[#18181B] overflow-hidden">
                    <Skeleton className="h-[200px] w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))
              ) : (
                recommendations.slice(0, 8).map((anime: any) => (
                  <motion.div
                    key={anime.mal_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-[#18181B] overflow-hidden group cursor-pointer">
                      <div className="relative">
                        <img
                          src={anime?.images?.jpg?.large_image_url}
                          alt={anime.title}
                          className="h-[200px] w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Badge className="bg-red-500 text-white">
                            LIVE
                          </Badge>
                        </div>
                        <Badge className="absolute bottom-2 left-2 bg-black/80 text-white">
                          {Math.floor(Math.random() * 10000)} viewers
                        </Badge>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarImage src={anime?.images?.jpg?.large_image_url} />
                            <AvatarFallback>AN</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-1">{anime.title}</h3>
                            <p className="text-sm text-[#ADADB8] line-clamp-1">{'Anime'}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-[#ADADB8] hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {/* {anime?.genres?.slice(0, 2).map((genre: any) => (
                            <Badge key={genre.name} variant="secondary" className="bg-[#26262C] text-[#ADADB8]">
                              {genre.name}
                            </Badge>
                          ))} */}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="w-60 flex-shrink-0 fixed right-0 top-0 bottom-0 bg-[#1F1F23] p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-4 text-[#EFEFF1]">ONLINE FRIENDS</h2>
          <div className="space-y-2">
            {['Angela_Piano', 'Annie'].map((friend) => (
              <div key={friend} className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                  <AvatarFallback>{friend[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{friend}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

