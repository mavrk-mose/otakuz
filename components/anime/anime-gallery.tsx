"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { useAnimePictures } from "@/hooks/anime/use-anime-pictures"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function AnimeGallery({ id }: { id: string }) {
  const { data: pictures, isLoading } = useAnimePictures(id)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 p-4 py-8">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="w-[250px] shrink-0 relative"
                  style={{
                    transformOrigin: "center bottom",
                    rotate: `${-5 + (index % 3) * 5}deg`,
                    marginLeft: index > 0 ? "-40px" : "0",
                  }}
                >
                  <Card className="overflow-hidden animate-pulse shadow-xl">
                    <div className="aspect-[2/3] bg-muted rounded-lg" />
                  </Card>
                </div>
              ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    )
  }

  if (!pictures?.length) {
    return null
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-4 pl-4 pr-16 py-8">
          {pictures.map((picture, idx) => (
            <motion.div
              key={idx}
              className="w-[250px] shrink-0 relative"
              style={{
                transformOrigin: "center bottom",
                rotate: `${-5 + (idx % 3) * 5}deg`,
                zIndex: idx,
                marginLeft: idx > 0 ? "-40px" : "0",
              }}
              whileHover={{
                rotate: "0deg",
                scale: 1.1,
                zIndex: 50,
                transition: { duration: 0.3 },
              }}
              onClick={() => {
                setCurrentImageIndex(idx)
                setIsGalleryOpen(true)
              }}
            >
              <Card className="overflow-hidden cursor-pointer shadow-xl">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={picture.jpg.large_image_url || "/placeholder.svg"}
                    alt={`Anime picture ${idx + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={idx < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/30 pointer-events-none" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Gallery Pop-up */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <Carousel className="w-full" defaultIndex={currentImageIndex}>
            <CarouselContent>
              {pictures?.map((picture, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-auto w-full h-[80vh] max-h-[80vh]">
                    <Image
                      src={picture.jpg.large_image_url || "/placeholder.svg"}
                      alt={`Anime picture ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  )
}
