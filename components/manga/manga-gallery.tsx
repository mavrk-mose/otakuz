"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { useMangaPictures } from "@/hooks/manga/use-manga-pictures"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function MangaGallery({ id }: { id: string }) {
  const { data: pictures, isLoading } = useMangaPictures(id)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const carouselRef = useRef<CarouselApi | null>(null)

  if (isLoading) {
    return (
      <>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 p-4 py-8">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="w-[150px] sm:w-[180px] md:w-[200px] shrink-0 relative"
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
      </>
    )
  }

  if (!pictures?.length) {
    return null
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setOpenDialog(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setOpenDialog(open)
    if (open && carouselRef.current) {
      carouselRef.current.scrollTo(selectedImageIndex)
    }
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-4 pl-4 pr-16 py-8">
          {pictures.map((picture, idx) => (
            <motion.div
              key={idx}
              className="w-[150px] sm:w-[180px] md:w-[200px] shrink-0 relative"
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
              onClick={() => handleImageClick(idx)}
            >
              <Card className="overflow-hidden cursor-pointer shadow-xl">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={picture.jpg.large_image_url || "/placeholder.svg"}
                    alt={`Manga picture ${idx + 1}`}
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

      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl w-full p-0">
          <Carousel className="w-full" setApi={(api) => (carouselRef.current = api)}>
            <CarouselContent>
              {pictures.map((carouselPicture, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card className="border-0">
                      <div className="relative aspect-auto w-full h-[80vh] max-h-[80vh]">
                        <Image
                          src={carouselPicture.jpg.large_image_url || "/placeholder.svg"}
                          alt={`Manga picture ${index + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                        />
                      </div>
                    </Card>
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
