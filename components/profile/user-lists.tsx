"use client"

import { useBookmarks } from '@/hooks/use-bookmarks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface UserListsProps {
  userId: string;
  onShare?: (listData: any) => void;
}

export function UserLists({ userId, onShare }: UserListsProps) {
  const { lists, deleteList } = useBookmarks();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {lists.map((list) => (
        <motion.div key={list.id} variants={item}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{list.name}</h3>
              <div className="flex gap-2">
                {onShare && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShare({
                      type: 'list',
                      data: {
                        id: list.id,
                        title: list.name,
                        image: list.items[0]?.image || '',
                        items: list.items
                      }
                    })}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                {list.type === 'custom' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteList(list.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-48">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {list.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.type}/${item.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium line-clamp-1">
                      {item.title}
                    </p>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}