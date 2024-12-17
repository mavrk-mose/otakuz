'use client'

import Image from "next/image"
import {Card} from "@/components/ui/card"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area"
import {motion} from "framer-motion"
import { useMangaPictures } from "@/hooks/manga/use-manga-pictures"

export function MangaGallery({id}: { id: string }) {
    const {data: pictures, isLoading} = useMangaPictures(id)

    if (isLoading) {
        return (
            <div className="w-full overflow-hidden">
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
            </div>
        )
    }

    if (!pictures?.length) {
        return null
    }

    return (
        <div className="w-full overflow-hidden">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                    {pictures.map((picture, idx) => (
                        <motion.div
                            key={idx}
                            className="w-[150px] sm:w-[180px] md:w-[200px] shrink-0"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="overflow-hidden">
                                <div className="relative aspect-[2/3]">
                                    <Image
                                        src={picture.jpg.large_image_url}
                                        alt=""
                                        fill
                                        className="object-cover transition-transform hover:scale-105"
                                        sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
                                        priority={idx < 4}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal"/>
            </ScrollArea>
        </div>
    )
}