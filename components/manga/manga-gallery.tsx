'use client'

import { useState, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { useMangaPictures } from "@/hooks/manga/use-manga-pictures"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "../ui/carousel"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"

export function MangaGallery({id}: { id: string }) {
    const {data: pictures, isLoading} = useMangaPictures(id)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const carouselRef = useRef<CarouselApi | null>(null)

    if (isLoading) {
        return (
            <>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-4 pb-4">
                        {Array(4).fill(null).map((_, index) => (
                            <Card
                                key={`loading-${index}`}
                                className="w-[150px] sm:w-[180px] md:w-[200px] shrink-0 animate-pulse"
                            >
                                <div className="aspect-[2/3] bg-muted rounded-t-lg"/>
                            </Card>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal"/>
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
                <div className="flex space-x-4 p-4">
                    {pictures.map((picture, idx) => (
                        <motion.div
                            key={idx}
                            className="w-[150px] sm:w-[180px] md:w-[200px] shrink-0"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => handleImageClick(idx)}
                        >
                            <Card className="overflow-hidden cursor-pointer">
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
                <ScrollBar orientation="horizontal"/>
            </ScrollArea>

            <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="max-w-3xl w-full p-0">
                    <Carousel className="w-full max-w-3xl" setApi={(api) => (carouselRef.current = api)}>
                        <CarouselContent>
                            {pictures.map((carouselPicture, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1">
                                        <Card>
                                            <div className="relative aspect-[2/3]">
                                                <Image
                                                    src={carouselPicture.jpg.large_image_url}
                                                    alt=""
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
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </DialogContent>
            </Dialog>
        </>
    )
}
