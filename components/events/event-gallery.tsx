"use client"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface EventGalleryProps {
  eventId: string;
  photos: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
}

export function EventGallery({ eventId, photos }: EventGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer"
            onClick={() => setSelectedPhoto(photo.url)}
          >
            <Card className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.caption || 'Event photo'}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <ScrollArea className="h-[80vh]">
            {selectedPhoto && (
              <div className="relative aspect-auto">
                <Image
                  src={selectedPhoto}
                  alt="Event photo"
                  width={1200}
                  height={800}
                  className="object-contain"
                />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}