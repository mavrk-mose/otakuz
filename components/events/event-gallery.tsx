"use client"

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { urlFor } from "@/lib/sanity";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { Event } from "@/types/events";

interface EventGalleryProps {
  gallery?: Pick<Event, "gallery">["gallery"];
}

export function Gallery({ gallery }: EventGalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const carouselRef = useRef<CarouselApi | null>(null)

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl md:text-2xl font-bold">Event Gallery</h2>
      <div className="rounded-lg p-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4 pl-4 pr-16 py-8">
            {gallery?.map((image, index) => (
              <motion.div
                key={index}
                className="w-[150px] sm:w-[200px] shrink-0 relative"
                style={{
                  transformOrigin: "center bottom",
                  rotate: `${-5 + (index % 3) * 5}deg`,
                  zIndex: index,
                  marginLeft: index > 0 ? "-40px" : "0",
                }}
                whileHover={{
                  rotate: "0deg",
                  scale: 1.1,
                  zIndex: 50,
                  transition: { duration: 0.3 },
                }}
                onClick={() => {
                  setIsGalleryOpen(true)
                  if (isGalleryOpen && carouselRef.current) {
                    carouselRef.current.scrollTo(index)
                  }
                }}
              >
                <Card className="overflow-hidden cursor-pointer shadow-xl">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={urlFor(image.asset._ref).url() || "/placeholder.svg"}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/30 pointer-events-none" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-3xl w-full p-0">
          <Carousel className="w-full" setApi={(api) => (carouselRef.current = api)}>
            <CarouselContent>
              {gallery?.map((image, index) => (
                <CarouselItem key={index} >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={urlFor(image.asset._ref).url() || "/placeholder.svg"}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  )
}
