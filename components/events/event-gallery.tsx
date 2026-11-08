"use client";
import { I18nText } from "@/components/i18n-text";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { urlFor } from "@/lib/sanity";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Event } from "@/types/events";
import { useI18n } from "@/components/i18n-provider";

interface EventGalleryProps {
  gallery?: Pick<Event, "gallery">["gallery"];
}

export function Gallery({ gallery }: EventGalleryProps) {
  const { t } = useI18n();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const carouselRef = useRef<CarouselApi | null>(null);

  if (!gallery?.length) {
    return null;
  }

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">{t("events.gallery")}</h2>
      <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border-border/70 bg-card/60">
        <ScrollArea className="w-full min-w-0 max-w-full" scrollStep={340}>
          <div className="flex w-max items-center px-8 py-9 sm:px-12 sm:py-10">
            {gallery.map((image, index) => (
              <motion.div
                key={index}
                className={`relative z-10 w-[135px] shrink-0 hover:!z-20 sm:w-[175px] md:w-[195px] ${
                  index > 0 ? "-ml-6 sm:-ml-8" : ""
                }`}
                style={{
                  transformOrigin: "center bottom",
                  rotate: `${-5 + (index % 3) * 5}deg`,
                }}
                whileHover={{
                  rotate: "0deg",
                  scale: 1.08,
                  transition: { duration: 0.25 },
                }}
                onClick={() => handleOpen(index)}
              >
                <Card className="cursor-pointer overflow-hidden border-border/80 shadow-xl transition-shadow hover:shadow-2xl">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={urlFor(image.asset._ref).url() || "/placeholder.svg"}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 640px) 135px, 195px"
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

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl rounded-2xl border-border bg-card/95 p-3 sm:p-4 backdrop-blur-xl">
          <DialogTitle className="sr-only"><I18nText message="events.galleryViewer" /></DialogTitle>
          <Carousel
            className="w-full"
            opts={{ startIndex: selectedIndex, loop: true }}
            setApi={(api) => (carouselRef.current = api)}
          >
            <CarouselContent>
              {gallery.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[70vh] max-h-[75vh] w-full">
                    <Image
                      src={urlFor(image.asset._ref).url() || "/placeholder.svg"}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 95vw, 720px"
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
