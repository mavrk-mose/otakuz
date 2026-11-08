"use client";
import { I18nText } from "@/components/i18n-text";

import { useRef, useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import { GallerySkeleton } from "@/components/skeletons/gallery-skeleton";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useAnimePictures } from "@/hooks/anime/use-anime-pictures";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export function AnimeGallery({ id }: { id: string }) {
  const { data: pictures, isLoading } = useAnimePictures(id);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const carouselRef = useRef<CarouselApi | null>(null);

  if (isLoading) return <GallerySkeleton type="anime" />;

  if (!pictures?.length) {
    return null;
  }

  const handleOpen = (idx: number) => {
    setSelectedIndex(idx);
    setIsGalleryOpen(true);
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Images className="h-3.5 w-3.5 text-primary" />
          {pictures.length} Visual {pictures.length === 1 ? "Still" : "Stills"}
        </span>
        <span className="text-xs text-muted-foreground">Click any visual to expand</span>
      </div>

      <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border-border/70 bg-card/60">
        <ScrollArea className="w-full min-w-0 max-w-full" scrollStep={360}>
          <div className="flex w-max items-center px-8 py-9 sm:px-12 sm:py-10">
            {pictures.map((picture: any, idx: number) => (
              <motion.div
                key={idx}
                className={`relative z-10 w-[135px] shrink-0 hover:!z-20 sm:w-[170px] md:w-[195px] lg:w-[210px] ${
                  idx > 0 ? "-ml-6 sm:-ml-8" : ""
                }`}
                style={{
                  transformOrigin: "center bottom",
                  rotate: `${-5 + (idx % 3) * 5}deg`,
                }}
                whileHover={{
                  rotate: "0deg",
                  scale: 1.08,
                  transition: { duration: 0.25 },
                }}
                onClick={() => handleOpen(idx)}
              >
                <Card className="cursor-pointer overflow-hidden border-border/80 shadow-xl transition-shadow hover:shadow-2xl">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={picture.webp.image_url || "/placeholder.svg"}
                      alt={`Anime picture ${idx + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 640px) 135px, (max-width: 768px) 170px, 210px"
                      priority={idx < 4}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 to-black/30" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      {/* Gallery Pop-up */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl rounded-2xl border-border bg-card/95 p-3 sm:p-4 backdrop-blur-xl">
          <DialogTitle className="sr-only">
            <I18nText message="anime.galleryViewer" />
          </DialogTitle>
          <Carousel
            className="w-full"
            opts={{ startIndex: selectedIndex, loop: true }}
            setApi={(api) => (carouselRef.current = api)}
          >
            <CarouselContent>
              {pictures?.map((picture: any, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative h-[70vh] max-h-[75vh] w-full sm:h-[78vh]">
                    <Image
                      src={picture.webp.large_image_url || "/placeholder.svg"}
                      alt={`Anime picture ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 95vw, 800px"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-card/90 backdrop-blur-md" />
            <CarouselNext className="right-2 bg-card/90 backdrop-blur-md" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}
