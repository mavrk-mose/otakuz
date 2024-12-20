'use client'

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { useAnimePictures } from "@/hooks/anime/use-anime-pictures";
import { Dialog, DialogContent } from "../ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel"
import { useState } from "react"

export function AnimeGallery({ id }: { id: string }) {
    const { data: pictures, isLoading } = useAnimePictures(id)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 p-4">
                        {Array(4).fill(null).map((_, index) => (
                            <Card
                                key={`loading-${index}`}
                                className="w-[300px] shrink-0 animate-pulse"
                            >
                                <div className="aspect-[2/3] bg-muted rounded-t-lg" />
                            </Card>
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
                <div className="flex space-x-4 p-4">
                    {pictures.map((picture, idx) => (
                        <motion.div
                            key={idx}
                            className="w-[300px] shrink-0"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => {
                                setCurrentImageIndex(idx);
                                setIsGalleryOpen(true);
                            }}
                        >
                            <Card className="overflow-hidden">
                                <div className="relative aspect-[2/3]">
                                    <Image
                                        src={picture.jpg.large_image_url}
                                        alt=""
                                        fill
                                        className="object-cover transition-transform hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        priority={idx < 4}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            {/* Gallery Pop-up */}
            <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="max-w-3xl w-full p-0">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {pictures?.map((picture, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-[3/4] w-full">
                                        <Image
                                            src={picture.jpg.large_image_url}
                                            alt={`Anime picture ${index + 1}`}
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

        </>
    )
}

